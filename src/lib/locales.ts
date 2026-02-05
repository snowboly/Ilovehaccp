export type Language = 'en' | 'de' | 'it' | 'lt' | 'pt' | 'es' | 'fr';

export const SUPPORTED_LOCALES: Language[] = ['en', 'de', 'it', 'lt', 'pt', 'es', 'fr'];

export async function getDictionary(lang: Language) {
  switch (lang) {
    case 'de':
      return (await import('./locales/de')).default;
    case 'it':
      return (await import('./locales/it')).default;
    case 'lt':
      return (await import('./locales/lt')).default;
    case 'pt':
      return (await import('./locales/pt')).default;
    case 'es':
      return (await import('./locales/es')).default;
    case 'fr':
      return (await import('./locales/fr')).default;
    default:
      return (await import('./locales/en')).default;
  }
}
