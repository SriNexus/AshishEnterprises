import { useState, useEffect } from 'react';
import { collection, onSnapshot, doc } from 'firebase/firestore';
import { db } from '@/firebase/config';
import { COLLECTIONS } from '@/firebase/collections';
import {
  TESTIMONIALS as STATIC_TESTIMONIALS,
  FAQS as STATIC_FAQS,
  SERVICES as STATIC_SERVICES,
  PROJECTS as STATIC_PROJECTS,
  PRODUCTS as STATIC_PRODUCTS,
  GALLERY_IMAGES as STATIC_GALLERY,
  BLOG_POSTS as STATIC_BLOG,
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
  // Static fallbacks for pages that need a specific format
  staticProducts: typeof STATIC_PRODUCTS;
  staticGallery: typeof STATIC_GALLERY;
  staticBlog: typeof STATIC_BLOG;
  // Flags: true when Firestore has data for this collection
  hasFirestoreProducts: boolean;
  hasFirestoreGallery: boolean;
  hasFirestoreBlog: boolean;
}

/**
 * Master site content hook.
 * Subscribes to ALL Firestore collections via onSnapshot for realtime updates.
 * Falls back to static constants when Firestore is empty.
 */
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
    staticProducts: STATIC_PRODUCTS,
    staticGallery: STATIC_GALLERY,
    staticBlog: STATIC_BLOG,
    hasFirestoreProducts: false,
    hasFirestoreGallery: false,
    hasFirestoreBlog: false,
  });

  useEffect(() => {
    const unsubs: (() => void)[] = [];
    let loaded = false;
    const markLoaded = () => { if (!loaded) { loaded = true; setContent(p => ({ ...p, loading: false })); } };

    // ── Settings (single document) ──
    try {
      const u = onSnapshot(doc(db, COLLECTIONS.SETTINGS, 'main'), (snap) => {
        if (snap.exists()) {
          const d = snap.data() as SettingsDoc;
          setContent(p => ({
            ...p,
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
          // Dynamic favicon — update all icon link tags
          if (d.faviconUrl) {
            // Standard favicon
            let link = document.querySelector("link[rel='icon']") as HTMLLinkElement;
            if (!link) { link = document.createElement('link'); link.rel = 'icon'; document.head.appendChild(link); }
            link.href = d.faviconUrl;
            // Shortcut icon
            let shortcut = document.querySelector("link[rel='shortcut icon']") as HTMLLinkElement;
            if (!shortcut) { shortcut = document.createElement('link'); shortcut.rel = 'shortcut icon'; document.head.appendChild(shortcut); }
            shortcut.href = d.faviconUrl;
          }
        }
        markLoaded();
      }, () => markLoaded());
      unsubs.push(u);
    } catch { markLoaded(); }

    // ── Collection subscriber: reads ALL docs, filters isPublished in JS ──
    function sub<T>(colName: string, key: string, flagKey?: string) {
      try {
        const u = onSnapshot(collection(db, colName), (snap) => {
          const docs = snap.docs
            .map(d => ({ id: d.id, ...d.data() } as unknown as T & { isPublished?: boolean }))
            .filter(d => d.isPublished !== false);
          if (docs.length > 0) {
            setContent(p => ({ ...p, [key]: docs, ...(flagKey ? { [flagKey]: true } : {}) }));
          }
        }, () => {});
        unsubs.push(u);
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
