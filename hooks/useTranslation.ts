import en from '@/i18n/en';
import type { TranslationKeys } from '@/i18n/en';

/**
 * Translation hook — returns English content.
 * Language switching has been removed.
 * All components use this hook for text consistency.
 */
export function useTranslation(): { t: TranslationKeys } {
  return { t: en };
}
