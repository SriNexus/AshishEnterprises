import { createContext, useContext, type ReactNode } from 'react';
import { useSiteContent, type SiteContent } from '@/hooks/use-site-content';
import {
  SITE_CONFIG as SC, PRODUCTS as SP, GALLERY_IMAGES as SG, BLOG_POSTS as SB,
} from '@/data/constants';

const SiteContext = createContext<SiteContent | null>(null);

export function SiteProvider({ children }: { children: ReactNode }) {
  const content = useSiteContent();
  return <SiteContext.Provider value={content}>{children}</SiteContext.Provider>;
}

export function useSite(): SiteContent {
  const ctx = useContext(SiteContext);
  if (!ctx) {
    return {
      testimonials: [], faqs: [], services: [], projects: [],
      products: [], gallery: [], blogPosts: [],
      stats: [], settings: null,
      config: SC as unknown as SiteContent['config'],
      loading: false,
      staticProducts: SP,
      staticGallery: SG,
      staticBlog: SB,
      hasFirestoreProducts: false,
      hasFirestoreGallery: false,
      hasFirestoreBlog: false,
    };
  }
  return ctx;
}
