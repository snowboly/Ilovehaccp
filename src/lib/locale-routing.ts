import { SUPPORTED_LOCALES, type Language } from '@/lib/locales';

export const isSupportedLocale = (value?: string): value is Language =>
  SUPPORTED_LOCALES.includes(value as Language);

export const withLocalePrefix = (path: string, locale: Language) => {
  if (path.startsWith('http')) {
    return path;
  }
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return `/${locale}${normalized}`;
};

export const replaceLocaleInPath = (pathname: string, locale: Language) => {
  const segments = pathname.split('/').filter(Boolean);
  if (segments.length > 0 && isSupportedLocale(segments[0])) {
    segments[0] = locale;
  } else {
    segments.unshift(locale);
  }
  return `/${segments.join('/')}`;
};
