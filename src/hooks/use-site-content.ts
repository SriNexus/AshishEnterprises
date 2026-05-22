import { useState, useEffect } from 'react';
import { collection, onSnapshot, doc } from 'firebase/firestore';
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
import type { SettingsDoc, ProductDoc, GalleryDoc, BlogPostDoc } from '@/types/admin';

interface SiteConfig {
  name: string;
  tagline: string;
  description: string;
  phone: string;
  whatsapp: string;
  email: string;
  address: string;
  socialLinks: { facebook: string; instagram: string; linkedin: string; twitter: string; youtube: string };
}

export interface SiteContent {
  testimonials: TestimonialData[];
  faqs: FAQData[];
  services: ServiceData[];
  projects: ProjectData[];
  products: ProductDoc[];
  gallery: GalleryDoc[];
  blogPosts: BlogPostDoc[];
  stats: StatData[];
  settings: SettingsDoc | null;
  config: SiteConfig;
  loading: boolean;
  /** True if Firestore products collection has data (so we use it instead of static) */
  hasFirestoreProducts: boolean;
  hasFirestoreGallery: boolean;
  hasFirestoreBlog: boolean;
}

/* All subscriptions use inline onSnapshot with error handling */

export function useSiteContent(): SiteContent {
  const [content, setContent] = useState<SiteContent>({
    testimonials: STATIC_TESTIMONIALS,
    faqs: STATIC_FAQS,
    services: STATIC_SERVICES,
    projects: STATIC_PROJECTS,
    products: [],
    gallery: [],
    blogPosts: [],
    stats: STATS,
    settings: null,
    config: STATIC_CONFIG as unknown as SiteConfig,
    loading: true,
    hasFirestoreProducts: false,
    hasFirestoreGallery: false,
    hasFirestoreBlog: false,
  });

  useEffect(() => {
    const unsubs: (() => void)[] = [];
    let loaded = false;

    const markLoaded = () => {
      if (!loaded) { loaded = true; setContent(prev => ({ ...prev, loading: false })); }
    };

    // ── Settings ──
    try {
      const unsub = onSnapshot(doc(db, COLLECTIONS.SETTINGS, 'main'), (snap) => {
        if (snap.exists()) {
          const d = snap.data() as SettingsDoc;
          setContent(prev => ({
            ...prev,
            settings: d,
            config: {
              name: d.siteName || STATIC_CONFIG.name,
              tagline: d.tagline || STATIC_CONFIG.tagline,
              description: STATIC_CONFIG.description,
              phone: d.phone || STATIC_CONFIG.phone,
              email: d.email || STATIC_CONFIG.email,
              whatsapp: d.whatsapp || STATIC_CONFIG.whatsapp,
              address: d.address || STATIC_CONFIG.address,
              socialLinks: { ...STATIC_CONFIG.socialLinks, ...d.socialLinks },
            },
          }));
          if (d.faviconUrl) {
            let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
            if (!link) { link = document.createElement('link'); link.rel = 'icon'; document.head.appendChild(link); }
            link.href = d.faviconUrl;
          }
        }
        markLoaded();
      }, () => markLoaded());
      unsubs.push(unsub);
    } catch { markLoaded(); }

    // ── Helper for published collections ──
    function sub<T>(colName: string, key: string, hasKey?: string) {
      try {
        const unsub = onSnapshot(collection(db, colName), (snap) => {
          const docs = snap.docs
            .map(d => ({ id: d.id, ...d.data() }))
            .filter((d: Record<string, unknown>) => d.isPublished !== false) as T[];
          if (docs.length > 0) {
            setContent(prev => ({
              ...prev,
              [key]: docs,
              ...(hasKey ? { [hasKey]: true } : {}),
            }));
          }
        }, () => {});
        unsubs.push(unsub);
      } catch { /* keep static */ }
    }

    sub<TestimonialData>(COLLECTIONS.TESTIMONIALS, 'testimonials');
    sub<FAQData>(COLLECTIONS.FAQ, 'faqs');
    sub<ServiceData>(COLLECTIONS.SERVICES, 'services');
    sub<ProjectData>(COLLECTIONS.PROJECTS, 'projects');
    sub<ProductDoc>(COLLECTIONS.PRODUCTS, 'products', 'hasFirestoreProducts');
    sub<GalleryDoc>(COLLECTIONS.GALLERY, 'gallery', 'hasFirestoreGallery');
    sub<BlogPostDoc>(COLLECTIONS.BLOG_POSTS, 'blogPosts', 'hasFirestoreBlog');

    const timeout = setTimeout(markLoaded, 3000);
    return () => { unsubs.forEach(u => u()); clearTimeout(timeout); };
  }, []);

  return content;
}
