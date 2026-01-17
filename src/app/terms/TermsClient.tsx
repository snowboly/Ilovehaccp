"use client";

import { useLanguage } from '@/lib/i18n';
import { legalTranslations } from '@/lib/legal-locales';

export default function TermsClient() {
  const { language } = useLanguage();
  // Fallback to EN if translation missing (e.g. ES/FR for now)
  const t = (legalTranslations as any)[language]?.terms || legalTranslations.en.terms;

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <div className="max-w-5xl mx-auto py-20 px-6">
        {/* Header */}
        <div className="mb-16">
          <span className="text-blue-600 font-bold tracking-wider uppercase text-sm mb-2 block">{t.header_badge}</span>
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
            
            {/* Section 0: Critical Technology Disclaimer */}
            <section id="disclaimer" className="mb-12">
              <h2 className="text-2xl font-bold mb-4">{t.disclaimer.title}</h2>
              <p className="mb-4" dangerouslySetInnerHTML={{ __html: t.disclaimer.intro.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
              <p className="mb-4">{t.disclaimer.acknowledgement}</p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                {t.disclaimer.points.map((point: string, i: number) => (
                  <li key={i} dangerouslySetInnerHTML={{ __html: point.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
                ))}
              </ul>
            </section>

            {t.sections.map((section: any, index: number) => (
              <Section 
                key={index}
                number={index + 1}
                title={section.title}
                content={<p dangerouslySetInnerHTML={{ __html: section.content.replace(/\n\n/g, '<br/><br/>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />} 
                summary={section.summary}
              />
            ))}

          </div>

          {/* Sidebar Navigation */}
          <div className="hidden lg:block lg:col-span-4 relative">
            <div className="sticky top-24 space-y-8">
              <div className="bg-white rounded-2xl p-6 shadow-xl shadow-slate-200/50 border border-slate-100">
                <h3 className="font-bold text-slate-900 mb-4">Quick Links</h3>
                <nav className="space-y-3 text-sm font-medium text-slate-500">
                  <a href="#disclaimer" className="block hover:text-blue-600 transition-colors">Disclaimer</a>
                  {t.sections.map((s: any, i: number) => (
                    <a key={i} href={`#section-${i+1}`} className="block hover:text-blue-600 transition-colors truncate">
                      {i+1}. {s.title}
                    </a>
                  ))}
                </nav>
              </div>
              
              <div className="bg-blue-600 rounded-2xl p-6 text-white shadow-xl shadow-blue-500/20">
                <h3 className="font-bold mb-2">Legal Questions?</h3>
                <p className="text-blue-100 text-sm mb-4">Our compliance team is here to clarify any points in this agreement.</p>
                <a href="mailto:support@ilovehaccp.com" className="inline-block bg-white text-blue-600 px-4 py-2 rounded-lg text-sm font-bold hover:bg-blue-50 transition-colors">
                  Email Support
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
    <div id={`section-${number}`} className="group relative">
      <div className="absolute -left-12 top-0 text-slate-200 font-black text-6xl opacity-50 select-none hidden xl:block">
        {number}
      </div>
      <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-3">
        <span className="bg-slate-100 text-slate-500 text-sm px-2 py-1 rounded-md font-mono xl:hidden">#{number}</span>
        {title}
      </h2>
      <div className="prose prose-slate max-w-none prose-p:leading-relaxed prose-a:text-blue-600">
        {content}
      </div>
      {summary && (
        <div className="mt-6 bg-slate-50 border-l-4 border-slate-300 p-4 rounded-r-lg">
          <p className="text-sm text-slate-600 font-medium m-0">
            <span className="uppercase text-xs font-bold text-slate-400 tracking-wider block mb-1">Summary</span>
            {summary}
          </p>
        </div>
      )}
    </div>
  );
}
