'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { defaultLocale } from '@/lib/translations';

type LanguageContextType = {
  locale: string;
  setLocale: (locale: string) => void;
};

const LanguageContext = createContext<LanguageContextType>({
  locale: defaultLocale,
  setLocale: () => {},
});

export const useLanguage = () => useContext(LanguageContext);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState(defaultLocale);

  useEffect(() => {
    // Try to get the language from localStorage
    const savedLocale = localStorage.getItem('locale');
    if (savedLocale) {
      setLocale(savedLocale);
    } else {
      // Try to get the browser language
      const browserLocale = navigator.language.split('-')[0];
      if (browserLocale === 'fr' || browserLocale === 'en') {
        setLocale(browserLocale);
      }
    }
  }, []);

  const handleSetLocale = (newLocale: string) => {
    setLocale(newLocale);
    localStorage.setItem('locale', newLocale);
  };

  return (
    <LanguageContext.Provider value={{ locale, setLocale: handleSetLocale }}>
      {children}
    </LanguageContext.Provider>
  );
} 