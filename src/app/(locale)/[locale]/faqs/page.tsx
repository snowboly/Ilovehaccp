import { HelpCircle } from 'lucide-react';
import { faqs } from '@/data/faqs';
import FAQContent from '@/components/resources/FAQContent';
import JSONLD from '@/components/layout/JSONLD';
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
  const content = dict.marketing.faqs;

  return buildLocaleMetadata({
    locale: language,
    pathname: '/faqs',
    title: content.metaTitle,
    description: content.metaDescription,
  });
}

export default async function LocaleFaqPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const language = locale as Language;
  if (!SUPPORTED_LOCALES.includes(language)) {
    notFound();
  }

  const dict = await getDictionary(language);
  const content = dict.marketing.faqs;

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.a,
      },
    })),
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <JSONLD data={structuredData} />
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-16 text-center">
          <div className="inline-flex items-center justify-center p-2 bg-indigo-50 rounded-full mb-4">
            <HelpCircle className="w-6 h-6 text-indigo-600" />
          </div>
          <h1 className="text-4xl font-black text-slate-900 mb-4 tracking-tight">{content.title}</h1>
          <p className="text-xl text-slate-500 max-w-2xl mx-auto font-medium">{content.subtitle}</p>

          <FAQContent faqs={faqs} />
        </div>
      </div>
    </div>
  );
}
