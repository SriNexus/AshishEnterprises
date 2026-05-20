import { useState, useEffect } from 'react';
import {
  collection, query, where, onSnapshot, doc,
} from 'firebase/firestore';
import { db } from '@/firebase/config';
import { COLLECTIONS } from '@/firebase/collections';
import {
  TESTIMONIALS as STATIC_TESTIMONIALS,
  FAQS as STATIC_FAQS,
  SERVICES as STATIC_SERVICES,
  PROJECTS as STATIC_PROJECTS,
  STATS,
  SITE_CONFIG as STATIC_CONFIG,
} from '@/data/constants';
import type { TestimonialData, FAQData, ServiceData, ProjectData, StatData } from '@/types';
import type { SettingsDoc } from '@/types/admin';

interface SiteConfig {
  name: string;
  tagline: string;
  description: string;
  phone: string;
  whatsapp: string;
  email: string;
  address: string;
  socialLinks: {
    facebook: string;
    instagram: string;
    linkedin: string;
    twitter: string;
    youtube: string;
  };
}

interface SiteContent {
  testimonials: TestimonialData[];
  faqs: FAQData[];
  services: ServiceData[];
  projects: ProjectData[];
  stats: StatData[];
  settings: SettingsDoc | null;
  config: SiteConfig;
  loading: boolean;
}

/**
 * Realtime hook — subscribes to Firestore with onSnapshot.
 * When admin updates content, the frontend reflects changes instantly.
 * Falls back to static constants if Firestore collections are empty.
 */
export function useSiteContent(): SiteContent {
  const [content, setContent] = useState<SiteContent>({
    testimonials: STATIC_TESTIMONIALS,
    faqs: STATIC_FAQS,
    services: STATIC_SERVICES,
    projects: STATIC_PROJECTS,
    stats: STATS,
    settings: null,
    config: STATIC_CONFIG,
    loading: true,
  });

  useEffect(() => {
    const unsubscribers: (() => void)[] = [];

    // ── Settings (single doc, realtime) ──
    const settingsUnsub = onSnapshot(
      doc(db, COLLECTIONS.SETTINGS, 'main'),
      (snap) => {
        if (snap.exists()) {
          const data = snap.data() as SettingsDoc;
          setContent(prev => ({
            ...prev,
            settings: data,
            config: {
              ...STATIC_CONFIG,
              name: data.siteName || STATIC_CONFIG.name,
              tagline: data.tagline || STATIC_CONFIG.tagline,
              phone: data.phone || STATIC_CONFIG.phone,
              email: data.email || STATIC_CONFIG.email,
              whatsapp: data.whatsapp || STATIC_CONFIG.whatsapp,
              address: data.address || STATIC_CONFIG.address,
              socialLinks: { ...STATIC_CONFIG.socialLinks, ...data.socialLinks },
            },
          }));

          // Dynamic favicon
          if (data.faviconUrl) {
            let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
            if (!link) {
              link = document.createElement('link');
              link.rel = 'icon';
              document.head.appendChild(link);
            }
            link.href = data.faviconUrl;
          }
        }
        setContent(prev => ({ ...prev, loading: false }));
      },
      (error) => {
        console.warn('Settings listener error:', error);
        setContent(prev => ({ ...prev, loading: false }));
      }
    );
    unsubscribers.push(settingsUnsub);

    // ── Testimonials (realtime) ──
    const testimonialsUnsub = onSnapshot(
      query(collection(db, COLLECTIONS.TESTIMONIALS), where('isPublished', '==', true)),
      (snap) => {
        if (snap.docs.length > 0) {
          setContent(prev => ({
            ...prev,
            testimonials: snap.docs.map(d => ({ id: d.id, ...d.data() } as unknown as TestimonialData)),
          }));
        }
      },
      () => {} // Silent fail — keep static data
    );
    unsubscribers.push(testimonialsUnsub);

    // ── FAQs (realtime) ──
    const faqsUnsub = onSnapshot(
      query(collection(db, COLLECTIONS.FAQ), where('isPublished', '==', true)),
      (snap) => {
        if (snap.docs.length > 0) {
          setContent(prev => ({
            ...prev,
            faqs: snap.docs.map(d => ({ id: d.id, ...d.data() } as unknown as FAQData)),
          }));
        }
      },
      () => {}
    );
    unsubscribers.push(faqsUnsub);

    // ── Services (realtime) ──
    const servicesUnsub = onSnapshot(
      query(collection(db, COLLECTIONS.SERVICES), where('isPublished', '==', true)),
      (snap) => {
        if (snap.docs.length > 0) {
          setContent(prev => ({
            ...prev,
            services: snap.docs.map(d => ({ id: d.id, ...d.data() } as unknown as ServiceData)),
          }));
        }
      },
      () => {}
    );
    unsubscribers.push(servicesUnsub);

    // ── Projects (realtime) ──
    const projectsUnsub = onSnapshot(
      query(collection(db, COLLECTIONS.PROJECTS), where('isPublished', '==', true)),
      (snap) => {
        if (snap.docs.length > 0) {
          setContent(prev => ({
            ...prev,
            projects: snap.docs.map(d => ({ id: d.id, ...d.data() } as unknown as ProjectData)),
          }));
        }
      },
      () => {}
    );
    unsubscribers.push(projectsUnsub);

    return () => unsubscribers.forEach(unsub => unsub());
  }, []);

  return content;
}
