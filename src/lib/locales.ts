export type Language = 'en' | 'de' | 'it' | 'lt';

export const SUPPORTED_LOCALES: Language[] = ['en', 'de', 'it', 'lt'];

export async function getDictionary(lang: Language) {
  switch (lang) {
    case 'de':
      return (await import('./locales/de')).default;
    case 'it':
      return (await import('./locales/it')).default;
    case 'lt':
      return (await import('./locales/lt')).default;
    default:
      return (await import('./locales/en')).default;
  }
}
