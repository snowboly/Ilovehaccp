import { HelpCircle } from 'lucide-react';
import { faqs } from '@/data/faqs';
import FAQContent from '@/components/resources/FAQContent';
import JSONLD from '@/components/layout/JSONLD';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'HACCP Frequently Asked Questions | Food Safety Help',
  description: 'Common questions about HACCP compliance, AI plan generation, and food safety regulations for restaurants and manufacturers.',
  alternates: { canonical: '/faqs' }
};

export default function FAQPage() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.q,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.a
      }
    }))
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <JSONLD data={structuredData} />
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-16 text-center">
          <div className="inline-flex items-center justify-center p-2 bg-indigo-50 rounded-full mb-4">
            <HelpCircle className="w-6 h-6 text-indigo-600" />
          </div>
          <h1 className="text-4xl font-black text-slate-900 mb-4 tracking-tight">Frequently Asked Questions</h1>
          <p className="text-xl text-slate-500 max-w-2xl mx-auto font-medium">
            Common questions about HACCP compliance, our AI builder, and food safety regulations.
          </p>
          
          <FAQContent faqs={faqs} />
        </div>
      </div>
    </div>
  );
}