import { createContext, useContext, type ReactNode } from 'react';
import { useSiteContent, type SiteContent, type SiteConfig } from '@/hooks/use-site-content';

// Re-export types so consumers can import from one place
export type { SiteConfig, SiteContent };

const SiteContext = createContext<SiteContent | null>(null);

export function SiteProvider({ children }: { children: ReactNode }) {
  const content = useSiteContent();
  return <SiteContext.Provider value={content}>{children}</SiteContext.Provider>;
}

export function useSite(): SiteContent {
  const ctx = useContext(SiteContext);
  if (!ctx) {
    // Outside provider (admin pages) — return minimal safe defaults
    return {
      testimonials: [],
      faqs:         [],
      services:     [],
      projects:     [],
      stats:        [],
      settings:     null,
      config: {
        name: '', tagline: '', description: '', phone: '',
        whatsapp: '', email: '', address: '',
        logoUrl: '', logoUrlDark: '', faviconUrl: '',
        socialLinks: { facebook:'', instagram:'', linkedin:'', twitter:'', youtube:'' },
      },
      loading:  false,
      resolved: true,
    };
  }
  return ctx;
}
