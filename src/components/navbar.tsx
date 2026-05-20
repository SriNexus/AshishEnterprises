import { useState, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Phone } from 'lucide-react';
import { cn } from '@/utils/cn';
import { useScroll } from '@/hooks/use-scroll';
import { NAV_LINKS, SITE_CONFIG } from '@/data/constants';
import { Logo } from '@/components/ui/logo';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { LanguageToggle } from '@/components/ui/language-toggle';
import { mobileMenuVariants, mobileMenuItemVariants } from '@/animations/variants';

/**
 * Premium responsive navbar with glassmorphism, smooth transitions,
 * and animated mobile menu.
 */
export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { scrolled } = useScroll(20);
  const location = useLocation();

  const isActive = (href: string) => {
    if (href === '/') return location.pathname === '/';
    return location.pathname.startsWith(href);
  };

  const closeMobile = useCallback(() => setMobileOpen(false), []);

  return (
    <>
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
        className={cn(
          'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
          scrolled
            ? 'glass-strong shadow-lg shadow-black/[0.04] py-2'
            : 'bg-transparent py-3 lg:py-4'
        )}
      >
        <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Logo size={scrolled ? 'sm' : 'md'} />

            {/* Desktop Nav Links */}
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

            {/* Desktop Actions */}
            <div className="hidden lg:flex items-center gap-3">
              <LanguageToggle />
              <ThemeToggle />
              <Link to="/contact">
                <Button
                  size="sm"
                  variant="primary"
                  icon={<Phone className="h-4 w-4" />}
                >
                  Get Quote
                </Button>
              </Link>
            </div>

            {/* Mobile Actions */}
            <div className="flex lg:hidden items-center gap-2">
              <LanguageToggle />
              <ThemeToggle />
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => setMobileOpen(!mobileOpen)}
                className="p-2 rounded-lg hover:bg-surface-tertiary transition-colors cursor-pointer"
                aria-label="Toggle menu"
              >
                {mobileOpen ? (
                  <X className="h-6 w-6 text-content-primary" />
                ) : (
                  <Menu className="h-6 w-6 text-content-primary" />
                )}
              </motion.button>
            </div>
          </div>
        </nav>
      </motion.header>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeMobile}
              className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
            />

            {/* Slide-in Panel */}
            <motion.div
              variants={mobileMenuVariants}
              initial="closed"
              animate="open"
              exit="closed"
              className="fixed top-0 right-0 bottom-0 z-50 w-[80%] max-w-sm bg-surface-primary shadow-2xl lg:hidden"
            >
              <div className="flex flex-col h-full">
                {/* Mobile Header */}
                <div className="flex items-center justify-between p-6 border-b border-line">
                  <Logo size="sm" />
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={closeMobile}
                    className="p-2 rounded-lg hover:bg-surface-tertiary transition-colors cursor-pointer"
                    aria-label="Close menu"
                  >
                    <X className="h-5 w-5 text-content-primary" />
                  </motion.button>
                </div>

                {/* Mobile Links */}
                <motion.nav
                  className="flex-1 overflow-y-auto py-6 px-4"
                  variants={{
                    closed: {},
                    open: { transition: { staggerChildren: 0.07, delayChildren: 0.15 } },
                  }}
                  initial="closed"
                  animate="open"
                >
                  {NAV_LINKS.map((link) => (
                    <motion.div key={link.href} variants={mobileMenuItemVariants}>
                      <Link
                        to={link.href}
                        onClick={closeMobile}
                        className={cn(
                          'block w-full px-4 py-3.5 rounded-xl text-base font-medium transition-colors',
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

                {/* Mobile CTA */}
                <div className="p-6 border-t border-line">
                  <Link to="/contact" onClick={closeMobile}>
                    <Button fullWidth size="lg" icon={<Phone className="h-4 w-4" />}>
                      Get Free Quote
                    </Button>
                  </Link>
                  <p className="mt-3 text-center text-xs text-content-tertiary">
                    {SITE_CONFIG.email}
                  </p>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
