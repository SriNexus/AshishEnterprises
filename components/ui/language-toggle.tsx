import { useLanguageStore } from '@/store/language-store';
import { cn } from '@/utils/cn';

interface LanguageToggleProps {
  className?: string;
}

/**
 * Compact language switcher: EN | हिन्दी
 */
export function LanguageToggle({ className }: LanguageToggleProps) {
  const { lang, setLang } = useLanguageStore();

  return (
    <div
      className={cn(
        'inline-flex items-center rounded-lg border border-line overflow-hidden text-xs font-medium',
        className
      )}
    >
      <button
        onClick={() => setLang('en')}
        className={cn(
          'px-2.5 py-1.5 transition-colors cursor-pointer',
          lang === 'en'
            ? 'bg-brand-primary text-white'
            : 'bg-transparent text-content-secondary hover:text-content-primary hover:bg-surface-tertiary'
        )}
      >
        EN
      </button>
      <button
        onClick={() => setLang('hi')}
        className={cn(
          'px-2.5 py-1.5 transition-colors cursor-pointer',
          lang === 'hi'
            ? 'bg-brand-primary text-white'
            : 'bg-transparent text-content-secondary hover:text-content-primary hover:bg-surface-tertiary'
        )}
      >
        हिन्दी
      </button>
    </div>
  );
}
