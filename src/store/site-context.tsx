import { createContext, useContext, type ReactNode } from 'react';
import { useSiteContent, type SiteContent } from '@/hooks/use-site-content';
import { SITE_CONFIG as STATIC_CONFIG } from '@/data/constants';

const defaultConfig = {
  name: STATIC_CONFIG.name,
  tagline: STATIC_CONFIG.tagline,
  description: STATIC_CONFIG.description,
  phone: STATIC_CONFIG.phone,
  email: STATIC_CONFIG.email,
  whatsapp: STATIC_CONFIG.whatsapp,
  address: STATIC_CONFIG.address,
  socialLinks: { ...STATIC_CONFIG.socialLinks },
};

const SiteContext = createContext<SiteContent | null>(null);

export function SiteProvider({ children }: { children: ReactNode }) {
  const content = useSiteContent();
  return <SiteContext.Provider value={content}>{children}</SiteContext.Provider>;
}

/**
 * Access all site content including Firestore-synced data.
 * Falls back to static defaults when used outside SiteProvider.
 */
export function useSite(): SiteContent {
  const ctx = useContext(SiteContext);
  if (!ctx) {
    return {
      testimonials: [], faqs: [], services: [], projects: [],
      products: [], gallery: [], blogPosts: [],
      stats: [], settings: null,
      config: defaultConfig as SiteContent['config'],
      loading: false,
      hasFirestoreProducts: false,
      hasFirestoreGallery: false,
      hasFirestoreBlog: false,
    };
  }
  return ctx;
}
