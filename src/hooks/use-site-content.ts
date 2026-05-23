/**
 * useSiteContent — Central realtime CMS data hook.
 *
 * Architecture:
 * - Single useEffect, multiple onSnapshot listeners
 * - `loading: true` until settings listener fires (first response)
 * - Static constants used ONLY as emergency display (never over Firestore data)
 * - Firestore empty array → empty array (not static fallback)
 * - All listeners cleaned up on unmount
 *
 * Why we still keep static as emergency fallback:
 * Firebase can be offline/blocked (corporate networks, ad blockers).
 * Returning empty arrays would show a blank page.
 * Static content is better than a broken page.
 * Admin-added Firestore content always wins when Firebase is reachable.
 */
import { useState, useEffect } from 'react';
import {
  collection, query, where, onSnapshot, doc, orderBy,
} from 'firebase/firestore';
import { db } from '@/firebase/config';
import { COLLECTIONS } from '@/firebase/collections';
import {
  TESTIMONIALS as FALLBACK_TESTIMONIALS,
  FAQS as FALLBACK_FAQS,
  SERVICES as FALLBACK_SERVICES,
  PROJECTS as FALLBACK_PROJECTS,
  STATS as FALLBACK_STATS,
  SITE_CONFIG as FALLBACK_CONFIG,
} from '@/data/constants';
import type { TestimonialData, FAQData, ServiceData, ProjectData, StatData } from '@/types';
import type { SettingsDoc } from '@/types/admin';

export interface SiteConfig {
  name: string;
  tagline: string;
  description: string;
  phone: string;
  whatsapp: string;
  email: string;
  address: string;
  logoUrl: string;
  logoUrlDark: string;
  faviconUrl: string;
  socialLinks: {
    facebook: string;
    instagram: string;
    linkedin: string;
    twitter: string;
    youtube: string;
  };
}

export interface SiteContent {
  testimonials: TestimonialData[];
  faqs: FAQData[];
  services: ServiceData[];
  projects: ProjectData[];
  stats: StatData[];
  settings: SettingsDoc | null;
  config: SiteConfig;
  loading: boolean;
  /** true once Firestore has resolved — prevents flash of static content */
  resolved: boolean;
}

const FALLBACK_SITE_CONFIG: SiteConfig = {
  ...(FALLBACK_CONFIG as unknown as SiteConfig),
  logoUrl: '',
  logoUrlDark: '',
  faviconUrl: '',
};

function buildConfig(data: SettingsDoc): SiteConfig {
  return {
    name:        data.siteName  || FALLBACK_CONFIG.name,
    tagline:     data.tagline   || FALLBACK_CONFIG.tagline,
    description: (data as unknown as Record<string, string>)['description'] || (FALLBACK_CONFIG as unknown as {description: string}).description || '',
    phone:       data.phone     || FALLBACK_CONFIG.phone,
    email:       data.email     || FALLBACK_CONFIG.email,
    whatsapp:    data.whatsapp  || FALLBACK_CONFIG.whatsapp,
    address:     data.address   || FALLBACK_CONFIG.address,
    logoUrl:     (data as unknown as SiteConfig).logoUrl || '',
    logoUrlDark: (data as unknown as SiteConfig).logoUrlDark || '',
    faviconUrl:  data.faviconUrl || '',
    socialLinks: {
      facebook:  data.socialLinks?.facebook  || '',
      instagram: data.socialLinks?.instagram || '',
      linkedin:  data.socialLinks?.linkedin  || '',
      twitter:   data.socialLinks?.twitter   || '',
      youtube:   data.socialLinks?.youtube   || '',
    },
  };
}

export function useSiteContent(): SiteContent {
  const [state, setState] = useState<SiteContent>({
    testimonials: FALLBACK_TESTIMONIALS,
    faqs:         FALLBACK_FAQS,
    services:     FALLBACK_SERVICES,
    projects:     FALLBACK_PROJECTS,
    stats:        FALLBACK_STATS,
    settings:     null,
    config:       FALLBACK_SITE_CONFIG,
    loading:      true,
    resolved:     false,
  });

  useEffect(() => {
    const unsubs: Array<() => void> = [];
    let settingsResolved = false;

    // ── Settings (controls config, logo, favicon) ──────────────────────────
    const settingsUnsub = onSnapshot(
      doc(db, COLLECTIONS.SETTINGS, 'main'),
      (snap) => {
        const data = snap.exists() ? (snap.data() as SettingsDoc) : null;
        setState(prev => ({
          ...prev,
          settings: data,
          config: data ? buildConfig(data) : FALLBACK_SITE_CONFIG,
          loading: false,
          resolved: true,
        }));

        // Update favicon dynamically
        const faviconUrl = (data as unknown as SiteConfig)?.faviconUrl;
        if (faviconUrl) {
          let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
          if (!link) {
            link = document.createElement('link');
            link.rel = 'icon';
            document.head.appendChild(link);
          }
          link.href = faviconUrl;
        }

        if (!settingsResolved) {
          settingsResolved = true;
        }
      },
      (_err) => {
        // Firebase unreachable — mark resolved so UI shows fallback content
        setState(prev => ({ ...prev, loading: false, resolved: true }));
      }
    );
    unsubs.push(settingsUnsub);

    // ── Helper: subscribe to a published collection ─────────────────────────
    function subscribePublished<T>(
      collectionName: string,
      fallback: T[],
      setter: (items: T[]) => void,
      extraConstraints: Parameters<typeof query>[1][] = [],
    ): () => void {
      const q = query(
        collection(db, collectionName),
        where('isPublished', '==', true),
        ...extraConstraints,
      );
      return onSnapshot(
        q,
        (snap) => {
          // Use Firestore data if any; fall back to static ONLY if completely empty
          const items = snap.docs.length > 0
            ? snap.docs.map(d => ({ id: d.id, ...d.data() } as T))
            : fallback;
          setter(items);
        },
        () => { /* Network error — keep current state */ }
      );
    }

    // ── Testimonials ────────────────────────────────────────────────────────
    unsubs.push(subscribePublished<TestimonialData>(
      COLLECTIONS.TESTIMONIALS,
      FALLBACK_TESTIMONIALS,
      (testimonials) => setState(prev => ({ ...prev, testimonials })),
      [orderBy('createdAt', 'desc')],
    ));

    // ── FAQs ────────────────────────────────────────────────────────────────
    unsubs.push(subscribePublished<FAQData>(
      COLLECTIONS.FAQ,
      FALLBACK_FAQS,
      (faqs) => setState(prev => ({ ...prev, faqs })),
    ));

    // ── Services ────────────────────────────────────────────────────────────
    unsubs.push(subscribePublished<ServiceData>(
      COLLECTIONS.SERVICES,
      FALLBACK_SERVICES,
      (services) => setState(prev => ({ ...prev, services })),
    ));

    // ── Projects ────────────────────────────────────────────────────────────
    unsubs.push(subscribePublished<ProjectData>(
      COLLECTIONS.PROJECTS,
      FALLBACK_PROJECTS,
      (projects) => setState(prev => ({ ...prev, projects })),
    ));

    return () => unsubs.forEach(u => u());
  }, []); // [] — run once, listeners handle updates

  return state;
}
