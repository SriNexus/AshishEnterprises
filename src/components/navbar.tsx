import { useState, useCallback, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Phone } from 'lucide-react';
import { cn } from '@/utils/cn';
import { NAV_LINKS, SITE_CONFIG } from '@/data/constants';
import { useSite } from '@/store/site-context';
import { EditableLogo } from '@/components/visual-editor/editable-logo';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { mobileMenuVariants, mobileMenuItemVariants } from '@/animations/variants';
import { ADMIN_BAR_HEIGHT } from '@/components/visual-editor/admin-editor-toolbar';

interface NavbarProps {
  /** When admin bar is visible, navbar shifts down by ADMIN_BAR_HEIGHT */
  adminBarVisible?: boolean;
}

export function Navbar({ adminBarVisible = false }: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { config } = useSite();
  const location = useLocation();

  // Close mobile menu on route change
  useEffect(() => { setMobileOpen(false); }, [location.pathname]);

  // Scroll detection
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const topOffset = adminBarVisible ? ADMIN_BAR_HEIGHT : 0;
  const isActive = (href: string) => href === '/' ? location.pathname === '/' : location.pathname.startsWith(href);
  const closeMobile = useCallback(() => setMobileOpen(false), []);
  const email = config.email || SITE_CONFIG.email;

  return (
    <>
      {/* The fixed header */}
      <header
        className={cn(
          'fixed left-0 right-0 transition-all duration-300',
          scrolled
            ? 'glass-strong shadow-lg shadow-black/[0.04] py-2'
            : 'bg-transparent py-3 lg:py-4',
        )}
        style={{
          top: topOffset,
          zIndex: 500, // below admin bar (9500) but above page content
        }}
      >
        <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <EditableLogo size={scrolled ? 'sm' : 'md'} />

            {/* Desktop links */}
            <div className="hidden lg:flex items-center gap-1">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  className={cn(
                    'px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                    isActive(link.href)
                      ? 'text-brand-primary bg-brand-primary/10'
                      : 'text-content-secondary hover:text-brand-primary hover:bg-brand-primary/5'
                  )}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Desktop CTA */}
            <div className="hidden lg:flex items-center gap-3">
              <ThemeToggle />
              <Link to="/contact">
                <Button size="sm" variant="primary" icon={<Phone className="h-4 w-4" />}>
                  Get Quote
                </Button>
              </Link>
            </div>

            {/* Mobile toggle */}
            <div className="flex lg:hidden items-center gap-2">
              <ThemeToggle />
              <button
                onClick={() => setMobileOpen(v => !v)}
                className="p-2 rounded-lg hover:bg-surface-tertiary transition-colors cursor-pointer"
                aria-label="Toggle menu"
              >
                {mobileOpen
                  ? <X className="h-6 w-6 text-content-primary" />
                  : <Menu className="h-6 w-6 text-content-primary" />}
              </button>
            </div>
          </div>
        </nav>
      </header>

      {/* Spacer to push page content below the fixed navbar */}
      {/* Height: navbar (~64px) + optional admin bar */}
      <div style={{ height: topOffset + 64 }} aria-hidden />

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={closeMobile}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm lg:hidden"
              style={{ zIndex: 490 }}
            />
            <motion.div
              variants={mobileMenuVariants} initial="closed" animate="open" exit="closed"
              className="fixed top-0 right-0 bottom-0 w-[80%] max-w-sm bg-surface-primary shadow-2xl lg:hidden overflow-y-auto"
              style={{ zIndex: 495, top: topOffset }}
            >
              <div className="flex flex-col h-full">
                <div className="flex items-center justify-between p-6 border-b border-line">
                  <EditableLogo size="sm" />
                  <button onClick={closeMobile} className="p-2 rounded-lg hover:bg-surface-tertiary transition-colors cursor-pointer">
                    <X className="h-5 w-5 text-content-primary" />
                  </button>
                </div>
                <motion.nav
                  className="flex-1 py-6 px-4"
                  variants={{ closed: {}, open: { transition: { staggerChildren: 0.06, delayChildren: 0.1 } } }}
                  initial="closed" animate="open"
                >
                  {NAV_LINKS.map((link) => (
                    <motion.div key={link.href} variants={mobileMenuItemVariants}>
                      <Link
                        to={link.href} onClick={closeMobile}
                        className={cn(
                          'flex items-center px-4 py-3.5 rounded-xl text-base font-medium transition-colors mb-1',
                          isActive(link.href)
                            ? 'text-brand-primary bg-brand-primary/10'
                            : 'text-content-primary hover:text-brand-primary hover:bg-brand-primary/5'
                        )}
                      >
                        {link.label}
                      </Link>
                    </motion.div>
                  ))}
                </motion.nav>
                <div className="p-6 border-t border-line space-y-3">
                  <Link to="/contact" onClick={closeMobile}>
                    <Button fullWidth size="lg" icon={<Phone className="h-4 w-4" />}>Get Free Quote</Button>
                  </Link>
                  <p className="text-center text-xs text-content-tertiary">{email}</p>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
