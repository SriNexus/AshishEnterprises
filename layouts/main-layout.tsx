import { type ReactNode, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { BackToTop } from '@/components/ui/back-to-top';
import { WhatsAppButton } from '@/components/whatsapp-button';
import { SiteProvider } from '@/store/site-context';
import { VisualEditorBar } from '@/components/admin/visual-editor-bar';

interface MainLayoutProps {
  children: ReactNode;
}

/**
 * Main page layout with SiteProvider for realtime CMS data.
 * All public pages inside this layout get live Firestore content.
 */
export function MainLayout({ children }: MainLayoutProps) {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [pathname]);

  return (
    <SiteProvider>
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      <WhatsAppButton />
      <BackToTop />
      <VisualEditorBar />
      </div>
    </SiteProvider>
  );
}
