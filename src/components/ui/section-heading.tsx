import { motion } from 'framer-motion';
import { cn } from '@/utils/cn';
import { fadeUp } from '@/animations/variants';

interface SectionHeadingProps {
  badge?: string;
  title: string;
  subtitle?: string;
  align?: 'left' | 'center' | 'right';
  light?: boolean;
  className?: string;
}

/**
 * Reusable section heading with badge, title, and subtitle.
 */
export function SectionHeading({
  badge,
  title,
  subtitle,
  align = 'center',
  light = false,
  className,
}: SectionHeadingProps) {
  const alignClass = {
    left: 'text-left',
    center: 'text-center mx-auto',
    right: 'text-right ml-auto',
  };

  return (
    <motion.div
      variants={fadeUp}
      className={cn('max-w-3xl mb-12 md:mb-16', alignClass[align], className)}
    >
      {badge && (
        <span
          className={cn(
            'inline-block px-4 py-1.5 rounded-full text-xs font-semibold tracking-wider uppercase mb-4',
            light
              ? 'bg-white/10 text-white/90'
              : 'bg-brand-primary/10 text-brand-primary'
          )}
        >
          {badge}
        </span>
      )}
      <h2
        className={cn(
          'text-3xl sm:text-4xl lg:text-5xl font-bold font-heading leading-tight text-balance',
          light ? 'text-white' : 'text-content-primary'
        )}
      >
        {title}
      </h2>
      {subtitle && (
        <p
          className={cn(
            'mt-4 text-base sm:text-lg leading-relaxed max-w-2xl',
            align === 'center' && 'mx-auto',
            light ? 'text-white/70' : 'text-content-secondary'
          )}
        >
          {subtitle}
        </p>
      )}
    </motion.div>
  );
}
