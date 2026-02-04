"use client";

import { LanguageProvider } from '@/lib/i18n';
import type { Language } from '@/lib/locales';
import { ThemeProvider } from '@/lib/theme';

export function Providers({
  children,
  initialLanguage,
  initialDictionary,
}: {
  children: React.ReactNode;
  initialLanguage: Language;
  initialDictionary: any;
}) {
  return (
    <ThemeProvider>
      <LanguageProvider initialLanguage={initialLanguage} initialDictionary={initialDictionary}>
        {children}
      </LanguageProvider>
    </ThemeProvider>
  );
}
