import HomePage from '@/components/landing/HomePage';
import { getDictionary, SUPPORTED_LOCALES, type Language } from '@/lib/locales';
import { buildLocaleMetadata } from '@/lib/seo';
import { notFound } from 'next/navigation';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const language = locale as Language;
  if (!SUPPORTED_LOCALES.includes(language)) {
    return {};
  }
  const dict = await getDictionary(language);
  const title = `iLoveHACCP | ${dict.landing.hero.titlePart1} ${dict.landing.hero.titlePart2}`;
  const description = dict.landing.hero.subtitle;

  return buildLocaleMetadata({
    locale: language,
    pathname: '',
    title,
    description,
  });
}

export default async function LocaleHomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const language = locale as Language;
  if (!SUPPORTED_LOCALES.includes(language)) {
    notFound();
  }

  return <HomePage />;
}
