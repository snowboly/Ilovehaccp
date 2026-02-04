"use client";

import { useLanguage } from '@/lib/i18n';
import { legalTranslations } from '@/lib/legal-locales';

export default function CookiesClient() {
  const { language } = useLanguage();
  const t = (legalTranslations as any)[language]?.cookies || legalTranslations.en.cookies;

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <div className="max-w-5xl mx-auto py-20 px-6">
        {/* Header */}
        <div className="mb-16">
          <span className="text-green-600 font-bold tracking-wider uppercase text-sm mb-2 block">{t.header_badge}</span>
          <h1 className="text-5xl font-black text-slate-900 mb-6 tracking-tight">{t.title}</h1>
          <div className="flex items-center gap-4 text-slate-500 font-medium">
            <span>{t.effective}</span>
            <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
            <span>{t.version}</span>
          </div>
        </div>

        <div className="grid lg:grid-cols-12 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-8 space-y-16">
            
            {/* Critical Privacy Promise */}
            <section className="bg-green-50 border border-green-200 rounded-2xl p-8">
              <h2 className="text-xl font-bold text-green-900 mb-4 flex items-center gap-2">
                {t.intro.title}
              </h2>
              <p className="text-green-800 leading-relaxed" dangerouslySetInnerHTML={{ __html: t.intro.content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
            </section>

            {t.sections.map((section: any, index: number) => (
              <Section 
                key={index}
                number={index + 1}
                title={section.title}
                content={<div className="prose prose-slate max-w-none prose-p:leading-relaxed prose-a:text-green-600" dangerouslySetInnerHTML={{ __html: section.content.replace(/\n\n/g, '<br/><br/>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n\* /g, '<br/>• ') }} />}
                summary={section.summary}
              />
            ))}

          </div>

          {/* Sidebar Navigation */}
          <div className="hidden lg:block lg:col-span-4 relative">
            <div className="sticky top-24 space-y-8">
              <div className="bg-white rounded-2xl p-6 shadow-xl shadow-slate-200/50 border border-slate-100">
                <h3 className="font-bold text-slate-900 mb-4">Contents</h3>
                <nav className="space-y-3 text-sm font-medium text-slate-500">
                  {t.sections.map((s: any, i: number) => (
                    <a key={i} href="#" className="block hover:text-green-600 transition-colors truncate">
                      {i+1}. {s.title}
                    </a>
                  ))}
                </nav>
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
