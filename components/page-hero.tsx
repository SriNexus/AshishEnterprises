import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import { fadeUp, staggerContainer } from '@/animations/variants';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface PageHeroProps {
  title: string;
  subtitle?: string;
  breadcrumbs?: BreadcrumbItem[];
  compact?: boolean;
}

/**
 * Hero section for inner pages with breadcrumbs.
 */
export function PageHero({ title, subtitle, breadcrumbs, compact = false }: PageHeroProps) {
  return (
    <section
      className={`relative overflow-hidden bg-gradient-to-br from-brand-secondary-dark via-brand-secondary to-brand-secondary-light ${
        compact ? 'pt-28 pb-12' : 'pt-32 pb-16 md:pt-40 md:pb-20'
      }`}
    >
      {/* Background pattern */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)`,
          backgroundSize: '50px 50px',
        }}
      />

      {/* Gradient orbs */}
      <motion.div
        className="absolute top-0 right-0 w-96 h-96 rounded-full bg-brand-primary/10 blur-3xl"
        animate={{ scale: [1, 1.2, 1], x: [0, 30, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute bottom-0 left-0 w-72 h-72 rounded-full bg-brand-accent/5 blur-3xl"
        animate={{ scale: [1, 1.15, 1] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
      />

      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center"
      >
        {/* Breadcrumbs */}
        {breadcrumbs && (
          <motion.nav variants={fadeUp} className="flex items-center justify-center gap-2 mb-6 flex-wrap">
            <Link
              to="/"
              className="flex items-center gap-1 text-sm text-white/60 hover:text-brand-primary transition-colors"
            >
              <Home className="h-3.5 w-3.5" />
              Home
            </Link>
            {breadcrumbs.map((item, idx) => (
              <span key={idx} className="flex items-center gap-2">
                <ChevronRight className="h-3.5 w-3.5 text-white/40" />
                {item.href ? (
                  <Link
                    to={item.href}
                    className="text-sm text-white/60 hover:text-brand-primary transition-colors"
                  >
                    {item.label}
                  </Link>
                ) : (
                  <span className="text-sm text-brand-primary font-medium">{item.label}</span>
                )}
              </span>
            ))}
          </motion.nav>
        )}

        {/* Title */}
        <motion.h1
          variants={fadeUp}
          className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold font-heading text-white leading-tight"
        >
          {title}
        </motion.h1>

        {/* Subtitle */}
        {subtitle && (
          <motion.p
            variants={fadeUp}
            className="mt-4 text-base sm:text-lg text-white/60 max-w-2xl mx-auto leading-relaxed"
          >
            {subtitle}
          </motion.p>
        )}
      </motion.div>

      {/* Bottom wave */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 60" fill="none" className="w-full h-auto">
          <path
            d="M0 60V30C240 0 480 0 720 30C960 60 1200 60 1440 30V60H0Z"
            className="fill-surface-primary"
          />
        </svg>
      </div>
    </section>
  );
}
