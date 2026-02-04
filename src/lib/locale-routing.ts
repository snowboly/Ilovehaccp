import { SUPPORTED_LOCALES, type Language } from '@/lib/locales';

const LOCALIZED_PATHS = new Set([
  '/',
  '/haccp-plan-word-docx',
  '/haccp-plan-example-pdf',
  '/haccp-for-restaurants',
]);

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
  const baseSegments =
    segments.length > 0 && isSupportedLocale(segments[0]) ? segments.slice(1) : segments;
  const basePath = `/${baseSegments.join('/')}` || '/';

  if (!LOCALIZED_PATHS.has(basePath)) {
    return basePath;
  }

  return basePath === '/' ? `/${locale}` : `/${locale}${basePath}`;
};
