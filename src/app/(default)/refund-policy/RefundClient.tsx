"use client";

import { useLanguage } from '@/lib/i18n';
import { legalTranslations } from '@/lib/legal-locales';

export default function RefundClient() {
  const { language } = useLanguage();
  const t = (legalTranslations as any)[language]?.refund || legalTranslations.en.refund;

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <div className="max-w-5xl mx-auto py-20 px-6">
        {/* Header */}
        <div className="mb-16">
          <span className="text-pink-600 font-bold tracking-wider uppercase text-sm mb-2 block">{t.header_badge}</span>
          <h1 className="text-5xl font-black text-slate-900 mb-6 tracking-tight">{t.title}</h1>
          <div className="flex items-center gap-4 text-slate-500 font-medium">
            <span>{t.effective}</span>
          </div>
        </div>

        <div className="grid lg:grid-cols-12 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-8 space-y-16">
            
            {/* The "Golden Rule" */}
            <section className="bg-pink-50 border border-pink-200 rounded-2xl p-8">
              <h2 className="text-xl font-bold text-pink-900 mb-4 flex items-center gap-2">
                {t.intro.title}
              </h2>
              <p className="text-pink-800 leading-relaxed" dangerouslySetInnerHTML={{ __html: t.intro.content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
            </section>

            {t.sections.map((section: any, index: number) => (
              <Section 
                key={index}
                number={index + 1}
                title={section.title}
                content={<div className="prose prose-slate max-w-none prose-p:leading-relaxed prose-a:text-pink-600" dangerouslySetInnerHTML={{ __html: section.content.replace(/\n\n/g, '<br/><br/>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n\* /g, '<br/>• ') }} />}
                summary={section.summary}
              />
            ))}

          </div>

          {/* Sidebar Navigation */}
          <div className="hidden lg:block lg:col-span-4 relative">
            <div className="sticky top-24 space-y-8">
              <div className="bg-white rounded-2xl p-6 shadow-xl shadow-slate-200/50 border border-slate-100">
                <h3 className="font-bold text-slate-900 mb-4">Billing Support</h3>
                <p className="text-slate-500 text-sm mb-4">
                    Have a billing issue? We usually reply within 12 hours.
                </p>
                <a href="mailto:support@ilovehaccp.com" className="block w-full text-center bg-pink-600 text-white px-4 py-3 rounded-xl font-bold hover:bg-pink-700 transition-colors shadow-lg shadow-pink-500/20">
                  Email Billing
                </a>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

function Section({ number, title, content, summary }: any) {
  return (
    <div className="group relative">
      <div className="absolute -left-12 top-0 text-slate-200 font-black text-6xl opacity-50 select-none hidden xl:block">
        {number}
      </div>
      <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-3">
        <span className="bg-slate-100 text-slate-500 text-sm px-2 py-1 rounded-md font-mono xl:hidden">#{number}</span>
        {title}
      </h2>
      {content}
      {summary && (
        <div className="mt-6 bg-slate-50 border-l-4 border-slate-300 p-4 rounded-r-lg">
          <p className="text-sm text-slate-600 font-medium m-0">
            <span className="uppercase text-xs font-bold text-slate-400 tracking-wider block mb-1">Plain English Summary</span>
            {summary}
          </p>
        </div>
      )}
    </div>
  );
}
