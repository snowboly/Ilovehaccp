import Link from 'next/link';
import { ArrowRight, CheckCircle2 } from 'lucide-react';

export interface MarketingContent {
  hero: {
    eyebrow: string;
    title: string;
    subtitle: string;
  };
  ctas: {
    primary: { label: string; href: string };
    secondary?: { label: string; href: string };
  };
  highlights: {
    title: string;
    items: { title: string; description: string }[];
  };
  checklist: {
    title: string;
    items: string[];
  };
  note?: string;
}

export default function MarketingPage({ content }: { content: MarketingContent }) {
  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      <div className="bg-white border-b border-slate-200">
        <div className="container mx-auto px-4 py-16 max-w-5xl text-center">
          <span className="text-blue-600 font-bold tracking-widest uppercase text-xs mb-4 block">
            {content.hero.eyebrow}
          </span>
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-4 tracking-tight leading-[1.1]">
            {content.hero.title}
          </h1>
          <p className="text-xl text-slate-600 font-medium leading-relaxed max-w-3xl mx-auto mb-8">
            {content.hero.subtitle}
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              href={content.ctas.primary.href}
              className="bg-blue-600 text-white px-8 py-4 rounded-xl font-black hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
            >
              {content.ctas.primary.label} <ArrowRight className="w-5 h-5" />
            </Link>
            {content.ctas.secondary ? (
              <Link
                href={content.ctas.secondary.href}
                className="bg-slate-100 text-slate-900 px-8 py-4 rounded-xl font-bold hover:bg-slate-200 transition-all flex items-center justify-center gap-2"
              >
                {content.ctas.secondary.label}
              </Link>
            ) : null}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16 max-w-5xl">
        <h2 className="text-2xl font-black text-slate-900 mb-8 text-center">
          {content.highlights.title}
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
          {content.highlights.items.map((item) => (
            <div key={item.title} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <h3 className="text-lg font-black text-slate-900 mb-2">{item.title}</h3>
              <p className="text-sm text-slate-600 leading-relaxed">{item.description}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white border-t border-slate-200">
        <div className="container mx-auto px-4 py-14 max-w-5xl">
          <h2 className="text-2xl font-black text-slate-900 mb-6 text-center">
            {content.checklist.title}
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            {content.checklist.items.map((item) => (
              <div key={item} className="flex items-start gap-3 bg-slate-50 border border-slate-100 rounded-xl px-4 py-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-500 mt-0.5" />
                <span className="text-slate-700 font-medium">{item}</span>
              </div>
            ))}
          </div>
          {content.note ? (
            <p className="text-center text-sm text-slate-500 mt-8">{content.note}</p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
