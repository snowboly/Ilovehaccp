"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Language, SUPPORTED_LOCALES, getDictionary } from './locales';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (path: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({
  children,
  initialLanguage,
  initialDictionary,
}: {
  children: React.ReactNode;
  initialLanguage: Language;
  initialDictionary: any;
}) {
  const [language, setLanguage] = useState<Language>(initialLanguage);
  const [dictionary, setDictionary] = useState<any | null>(initialDictionary ?? null);

  // Load language from localStorage on client mount
  useEffect(() => {
    const savedLang = localStorage.getItem('app-language') as Language;
    if (savedLang && SUPPORTED_LOCALES.includes(savedLang)) {
      setTimeout(() => setLanguage(savedLang), 0);
    }
  }, []);

  useEffect(() => {
    let isActive = true;
    getDictionary(language).then((dict) => {
      if (isActive) {
        setDictionary(dict);
      }
    });
    return () => {
      isActive = false;
    };
  }, [language]);

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem('app-language', lang);
  };

  // Helper to get nested values (e.g., 'nav.builder')
  const t = (path: string): string => {
    const keys = path.split('.');
    let value: any = dictionary || {};
    
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
