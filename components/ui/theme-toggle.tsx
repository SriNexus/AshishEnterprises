import { motion } from 'framer-motion';
import { Sun, Moon } from 'lucide-react';
import { useThemeStore } from '@/store/theme-store';
import { cn } from '@/utils/cn';

interface ThemeToggleProps {
  className?: string;
}

/**
 * Animated dark/light theme toggle button.
 */
export function ThemeToggle({ className }: ThemeToggleProps) {
  const { theme, toggleTheme } = useThemeStore();
  const isDark = theme === 'dark';

  return (
    <motion.button
      whileTap={{ scale: 0.9 }}
      whileHover={{ scale: 1.05 }}
      onClick={toggleTheme}
      className={cn(
        'relative p-2.5 rounded-xl transition-colors duration-300 cursor-pointer',
        'hover:bg-surface-tertiary',
        className
      )}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
    >
      <motion.div
        initial={false}
        animate={{ rotate: isDark ? 180 : 0 }}
        transition={{ duration: 0.4, ease: 'easeInOut' }}
      >
        {isDark ? (
          <Sun className="h-5 w-5 text-brand-accent" />
        ) : (
          <Moon className="h-5 w-5 text-brand-secondary" />
        )}
      </motion.div>
    </motion.button>
  );
}
