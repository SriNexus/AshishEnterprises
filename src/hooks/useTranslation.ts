import { useLanguageStore } from '@/store/language-store';
import en from '@/i18n/en';
import hi from '@/i18n/hi';
import type { TranslationKeys } from '@/i18n/en';

const translations: Record<string, TranslationKeys> = { en, hi };

/**
 * Central translation hook.
 * Returns the full translation object for the current language.
 *
 * Usage:
 *   const { t, lang } = useTranslation();
 *   <h1>{t.hero.heading1}</h1>
 */
export function useTranslation() {
  const { lang } = useLanguageStore();
  const t = translations[lang] || en;
  return { t, lang };
}
