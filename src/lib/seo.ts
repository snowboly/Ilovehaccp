import { SUPPORTED_LOCALES, type Language } from '@/lib/locales';

const SITE_URL = 'https://www.ilovehaccp.com';

export const buildLocaleAlternates = (pathname: string) => {
  const languages: Record<string, string> = {};
  SUPPORTED_LOCALES.forEach((locale) => {
    languages[locale] = `${SITE_URL}/${locale}${pathname}`;
  });
  languages['x-default'] = `${SITE_URL}/en${pathname}`;

  return {
    languages,
  };
};

export const buildLocaleMetadata = ({
  locale,
  pathname,
  title,
  description,
}: {
  locale: Language;
  pathname: string;
  title: string;
  description: string;
}) => {
  return {
    title,
    description,
    alternates: {
      canonical: `${SITE_URL}/${locale}${pathname}`,
      ...buildLocaleAlternates(pathname),
    },
    openGraph: {
      title,
      description,
      url: `${SITE_URL}/${locale}${pathname}`,
      locale,
      type: 'website' as const,
    },
  };
};
