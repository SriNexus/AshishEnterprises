import { createContext, useContext, type ReactNode } from 'react';
import { useSiteContent } from '@/hooks/use-site-content';
import type { TestimonialData, FAQData, ServiceData, ProjectData, StatData } from '@/types';
import type { SettingsDoc } from '@/types/admin';
import {
  SITE_CONFIG as STATIC_CONFIG,
} from '@/data/constants';

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

interface SiteContextType {
  testimonials: TestimonialData[];
  faqs: FAQData[];
  services: ServiceData[];
  projects: ProjectData[];
  stats: StatData[];
  settings: SettingsDoc | null;
  config: SiteConfig;
  loading: boolean;
}

const SiteContext = createContext<SiteContextType | null>(null);

export function SiteProvider({ children }: { children: ReactNode }) {
  const content = useSiteContent();
  return <SiteContext.Provider value={content}>{children}</SiteContext.Provider>;
}

/**
 * Use this hook in any frontend component to get realtime CMS data.
 * Falls back to static constants if context is not available.
 */
export function useSite(): SiteContextType {
  const ctx = useContext(SiteContext);
  if (!ctx) {
    // Fallback when used outside provider (e.g., admin pages)
    return {
      testimonials: [],
      faqs: [],
      services: [],
      projects: [],
      stats: [],
      settings: null,
      config: STATIC_CONFIG as unknown as SiteConfig,
      loading: false,
    };
  }
  return ctx;
}
