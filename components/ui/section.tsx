import { type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/utils/cn';
import { useScrollReveal } from '@/hooks/use-intersection';
import { staggerContainer } from '@/animations/variants';

interface SectionProps {
  id?: string;
  children: ReactNode;
  className?: string;
  containerClassName?: string;
  fullWidth?: boolean;
  background?: 'primary' | 'secondary' | 'tertiary' | 'gradient';
  padding?: 'sm' | 'md' | 'lg';
}

const bgClasses = {
  primary: 'bg-surface-primary',
  secondary: 'bg-surface-secondary',
  tertiary: 'bg-surface-tertiary',
  gradient: 'bg-gradient-to-br from-brand-secondary-dark to-brand-secondary',
};

const paddingClasses = {
  sm: 'py-12 md:py-16',
  md: 'py-16 md:py-24',
  lg: 'py-20 md:py-32',
};

/**
 * Section wrapper component with scroll reveal animation.
 * Automatically staggering children animations on viewport entry.
 */
export function Section({
  id,
  children,
  className,
  containerClassName,
  fullWidth = false,
  background = 'primary',
  padding = 'md',
}: SectionProps) {
  const { ref, inView } = useScrollReveal(0.1);

  return (
    <section
      id={id}
      className={cn(bgClasses[background], paddingClasses[padding], className)}
    >
      <motion.div
        ref={ref}
        variants={staggerContainer}
        initial="hidden"
        animate={inView ? 'visible' : 'hidden'}
        className={cn(
          !fullWidth && 'mx-auto max-w-7xl px-4 sm:px-6 lg:px-8',
          containerClassName
        )}
      >
        {children}
      </motion.div>
    </section>
  );
}
