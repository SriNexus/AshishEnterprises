import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, doc } from 'firebase/firestore';
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
  name: string; tagline: string; description: string; phone: string;
  whatsapp: string; email: string; address: string;
  socialLinks: { facebook: string; instagram: string; linkedin: string; twitter: string; youtube: string; };
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
 * Falls back to static constants only while Firestore is loading.
 * Once Firebase returns data (even empty), static fallback is dropped.
 */
export function useSiteContent(): SiteContent {
  const [content, setContent] = useState<SiteContent>({
    testimonials: STATIC_TESTIMONIALS,
    faqs: STATIC_FAQS,
    services: STATIC_SERVICES,
    projects: STATIC_PROJECTS,
    stats: STATS,
    settings: null,
    config: STATIC_CONFIG as unknown as SiteConfig,
    loading: true,
  });

  useEffect(() => {
    const subs: (() => void)[] = [];

    // Settings
    const settingsSub = onSnapshot(doc(db, COLLECTIONS.SETTINGS, 'main'), (snap) => {
      if (snap.exists()) {
        const data = snap.data() as SettingsDoc;
        setContent(prev => ({
          ...prev,
          settings: data,
          config: {
            name: data.siteName || STATIC_CONFIG.name,
            tagline: data.tagline || STATIC_CONFIG.tagline,
            description: STATIC_CONFIG.description,
            phone: data.phone || STATIC_CONFIG.phone,
            email: data.email || STATIC_CONFIG.email,
            whatsapp: data.whatsapp || STATIC_CONFIG.whatsapp,
            address: data.address || STATIC_CONFIG.address,
            socialLinks: { ...STATIC_CONFIG.socialLinks, ...data.socialLinks },
          },
        }));
        if (data.faviconUrl) {
          let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
          if (!link) { link = document.createElement('link'); link.rel = 'icon'; document.head.appendChild(link); }
          link.href = data.faviconUrl;
        }
      }
      setContent(prev => ({ ...prev, loading: false }));
    }, () => setContent(prev => ({ ...prev, loading: false })));
    subs.push(settingsSub);

    // Testimonials — always show Firestore data if available, else static
    const testimonialsSub = onSnapshot(
      query(collection(db, COLLECTIONS.TESTIMONIALS), where('isPublished', '==', true)),
      (snap) => {
        setContent(prev => ({
          ...prev,
          testimonials: snap.docs.length > 0
            ? snap.docs.map(d => ({ id: d.id, ...d.data() } as unknown as TestimonialData))
            : STATIC_TESTIMONIALS,
        }));
      }, () => {}
    );
    subs.push(testimonialsSub);

    // FAQs
    const faqsSub = onSnapshot(
      query(collection(db, COLLECTIONS.FAQ), where('isPublished', '==', true)),
      (snap) => {
        setContent(prev => ({
          ...prev,
          faqs: snap.docs.length > 0
            ? snap.docs.map(d => ({ id: d.id, ...d.data() } as unknown as FAQData))
            : STATIC_FAQS,
        }));
      }, () => {}
    );
    subs.push(faqsSub);

    // Services
    const servicesSub = onSnapshot(
      query(collection(db, COLLECTIONS.SERVICES), where('isPublished', '==', true)),
      (snap) => {
        setContent(prev => ({
          ...prev,
          services: snap.docs.length > 0
            ? snap.docs.map(d => ({ id: d.id, ...d.data() } as unknown as ServiceData))
            : STATIC_SERVICES,
        }));
      }, () => {}
    );
    subs.push(servicesSub);

    // Projects
    const projectsSub = onSnapshot(
      query(collection(db, COLLECTIONS.PROJECTS), where('isPublished', '==', true)),
      (snap) => {
        setContent(prev => ({
          ...prev,
          projects: snap.docs.length > 0
            ? snap.docs.map(d => ({ id: d.id, ...d.data() } as unknown as ProjectData))
            : STATIC_PROJECTS,
        }));
      }, () => {}
    );
    subs.push(projectsSub);

    return () => subs.forEach(unsub => unsub());
  }, []);

  return content;
}
