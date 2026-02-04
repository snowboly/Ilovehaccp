import MarketingPage from '@/components/marketing/MarketingPage';
import { getDictionary, SUPPORTED_LOCALES, type Language } from '@/lib/locales';
import { notFound } from 'next/navigation';
import { buildLocaleMetadata } from '@/lib/seo';
import { withLocalePrefix } from '@/lib/locale-routing';

export async function generateMetadata({ params }: { params: { locale: string } }) {
  const locale = params.locale as Language;
  if (!SUPPORTED_LOCALES.includes(locale)) {
    return {};
  }
  const dict = await getDictionary(locale);
  const content = dict.marketing.examplePdf;
  return buildLocaleMetadata({
    locale,
    pathname: '/haccp-plan-example-pdf',
    title: content.metaTitle,
    description: content.metaDescription,
  });
}

export default async function HaccpPlanExamplePdfLocalePage({ params }: { params: { locale: string } }) {
  const locale = params.locale as Language;
  if (!SUPPORTED_LOCALES.includes(locale)) {
    notFound();
  }
  const dict = await getDictionary(locale);
  const content = dict.marketing.examplePdf;
  const localizedContent = {
    ...content,
    ctas: {
      primary: {
        ...content.ctas.primary,
        href: withLocalePrefix(content.ctas.primary.href, locale),
      },
      secondary: content.ctas.secondary
        ? {
            ...content.ctas.secondary,
            href: withLocalePrefix(content.ctas.secondary.href, locale),
          }
        : undefined,
    },
  };

  return <MarketingPage content={localizedContent} />;
}
