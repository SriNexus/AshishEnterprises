import { motion } from 'framer-motion';

/**
 * Full-screen loading state shown during lazy-loaded route transitions.
 */
export function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-primary">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center gap-4"
      >
        {/* Animated solar logo */}
        <div className="relative">
          <motion.div
            className="w-16 h-16 rounded-full border-4 border-brand-primary/20"
            animate={{ rotate: 360 }}
            transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
          />
          <motion.div
            className="absolute inset-0 w-16 h-16 rounded-full border-4 border-transparent border-t-brand-primary"
            animate={{ rotate: 360 }}
            transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-3 h-3 rounded-full bg-brand-primary" />
          </div>
        </div>
        <p className="text-sm font-medium text-content-secondary tracking-wide">
          Loading...
        </p>
      </motion.div>
    </div>
  );
}
