'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Language } from '@/types';
import { t, TranslationKey } from '@/lib/translations';

interface LanguageContextValue {
  lang: Language;
  setLang: (l: Language) => void;
  t: (key: TranslationKey) => string;
}

const LanguageContext = createContext<LanguageContextValue>({
  lang: 'nl',
  setLang: () => {},
  t: (key) => key,
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Language>('nl');

  useEffect(() => {
    const stored = localStorage.getItem('lang') as Language | null;
    if (stored === 'en' || stored === 'nl') setLangState(stored);
  }, []);

  function setLang(l: Language) {
    setLangState(l);
    localStorage.setItem('lang', l);
  }

  return (
    <LanguageContext.Provider value={{ lang, setLang, t: (key) => t(lang, key) }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
