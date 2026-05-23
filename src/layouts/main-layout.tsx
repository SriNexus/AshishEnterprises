import { type ReactNode, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { BackToTop } from '@/components/ui/back-to-top';
import { WhatsAppButton } from '@/components/whatsapp-button';
import { AdminEditorToolbar, EditModePill } from '@/components/visual-editor/admin-editor-toolbar';
import { useVisualEditor } from '@/store/visual-editor-context';

interface MainLayoutProps { children: ReactNode; }

export function MainLayout({ children }: MainLayoutProps) {
  const { pathname } = useLocation();
  const { isAdmin } = useVisualEditor();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [pathname]);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Fixed admin toolbar (40px) — only renders for admins */}
      <AdminEditorToolbar />
      {/* Fixed navbar — offset by admin bar height when admin is present */}
      <Navbar adminBarVisible={isAdmin} />
      {/* Page content — spacer is emitted by Navbar itself */}
      <main className="flex-1">{children}</main>
      <Footer />
      <WhatsAppButton />
      <BackToTop />
      {/* Edit mode indicator pill */}
      <EditModePill />
    </div>
  );
}
