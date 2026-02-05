import MarketingPage from '@/components/marketing/MarketingPage';
import { getDictionary, SUPPORTED_LOCALES, type Language } from '@/lib/locales';
import { notFound } from 'next/navigation';
import { buildLocaleMetadata } from '@/lib/seo';
import { withLocalePrefix } from '@/lib/locale-routing';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const language = locale as Language;
  if (!SUPPORTED_LOCALES.includes(language)) {
    return {};
  }
  const dict = await getDictionary(language);
  const content = dict.marketing.examplePdf;
  return buildLocaleMetadata({
    locale: language,
    pathname: '/haccp-plan-example-pdf',
    title: content.metaTitle,
    description: content.metaDescription,
  });
}

export default async function HaccpPlanExamplePdfLocalePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const language = locale as Language;
  if (!SUPPORTED_LOCALES.includes(language)) {
    notFound();
  }
  const dict = await getDictionary(language);
  const content = dict.marketing.examplePdf;
  const localizedContent = {
    ...content,
    ctas: {
      primary: {
        ...content.ctas.primary,
        href: withLocalePrefix(content.ctas.primary.href, language),
      },
      secondary: content.ctas.secondary
        ? {
            ...content.ctas.secondary,
            href: withLocalePrefix(content.ctas.secondary.href, language),
          }
        : undefined,
    },
  };

  return <MarketingPage content={localizedContent} />;
}
