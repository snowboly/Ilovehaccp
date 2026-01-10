"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations, Language, getDictionary } from './locales';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (path: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>('en');

  // Load language from localStorage on client mount
  useEffect(() => {
    const savedLang = localStorage.getItem('app-language') as Language;
    if (savedLang && translations[savedLang]) {
      setTimeout(() => setLanguage(savedLang), 0);
    }
  }, []);

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem('app-language', lang);
  };

  // Helper to get nested values (e.g., 'nav.builder')
  const t = (path: string): string => {
    const keys = path.split('.');
    let value: any = translations[language];
    
    for (const key of keys) {
      value = value?.[key];
      if (!value) break;
    }

    return value || path; // Fallback to key if not found
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
