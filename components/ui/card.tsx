import { type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/utils/cn';
import { fadeUp } from '@/animations/variants';

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  glass?: boolean;
  padding?: 'sm' | 'md' | 'lg';
  animated?: boolean;
}

const paddingClasses = {
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
};

/**
 * Reusable Card component with glass morphism, hover effects, and animation.
 */
export function Card({
  children,
  className,
  hover = true,
  glass = false,
  padding = 'md',
  animated = true,
}: CardProps) {
  const classes = cn(
    'rounded-2xl border border-line transition-all duration-300',
    glass
      ? 'glass'
      : 'bg-surface-card',
    hover && 'hover:shadow-card-hover hover:-translate-y-1',
    paddingClasses[padding],
    className
  );

  if (animated) {
    return (
      <motion.div className={classes} variants={fadeUp}>
        {children}
      </motion.div>
    );
  }

  return <div className={classes}>{children}</div>;
}
