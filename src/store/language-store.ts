import { create } from 'zustand';

export type Language = 'en' | 'hi';

interface LanguageState {
  lang: Language;
  setLang: (lang: Language) => void;
  toggle: () => void;
}

function getInitialLang(): Language {
  if (typeof window === 'undefined') return 'en';
  const stored = localStorage.getItem('ashish-lang');
  return stored === 'hi' ? 'hi' : 'en';
}

export const useLanguageStore = create<LanguageState>((set) => ({
  lang: getInitialLang(),
  setLang: (lang) => {
    localStorage.setItem('ashish-lang', lang);
    set({ lang });
  },
  toggle: () =>
    set((state) => {
      const next = state.lang === 'en' ? 'hi' : 'en';
      localStorage.setItem('ashish-lang', next);
      return { lang: next };
    }),
}));

/**
 * Helper: pick the right string based on current language
 */
export function t(en: string, hi: string, lang: Language): string {
  return lang === 'hi' ? hi : en;
}
