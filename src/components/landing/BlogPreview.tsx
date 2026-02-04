"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, Loader2 } from 'lucide-react';
import { articles as localArticles } from '@/data/articles';
import { useLanguage } from '@/lib/i18n';

export default function BlogPreview() {
  const { language } = useLanguage();
  const copy = BLOG_COPY[language] ?? BLOG_COPY.en;
  const [randomArticles, setRandomArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Shuffle and pick 3 articles
    const shuffled = [...localArticles].sort(() => 0.5 - Math.random());
    setRandomArticles(shuffled.slice(0, 3));
    setLoading(false);
  }, []);

  return (
    <section className="py-24 bg-slate-50">
      <div className="container px-4 md:px-6 mx-auto">
        <div className="flex justify-between items-end mb-12">
          <div>
            <h2 className="text-3xl font-black tracking-tight mb-2 uppercase italic italic">{copy.title}</h2>
            <p className="text-gray-500 font-medium">{copy.subtitle}</p>
          </div>
          <Link href="/resources" className="text-blue-600 font-bold hover:underline hidden md:flex items-center gap-1">
            {copy.viewAll} <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {loading ? (
          <div className="h-64 flex items-center justify-center text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin" />
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-8">
            {randomArticles.map((article) => {
              return (
                <Link key={article.slug} href={`/resources/${article.slug}`} className="group cursor-pointer">
                  <div className="bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-2xl transition-all h-full flex flex-col hover:-translate-y-1">
                    {article.image && (
                      <div className="h-48 overflow-hidden relative">
                        <img src={article.image} alt={article.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                        <div className="absolute top-4 left-4">
                            <span className="bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest text-blue-600 shadow-sm">{article.category}</span>
                        </div>
                      </div>
                    )}
                    <div className="p-8 flex-1 flex flex-col">
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{article.readTime}</span>
                      </div>
                      <h3 className="text-xl font-black mb-3 group-hover:text-blue-600 transition-colors line-clamp-2 leading-snug">{article.title}</h3>
                      <p className="text-slate-500 text-sm mb-6 flex-1 line-clamp-3 font-medium leading-relaxed">{article.excerpt}</p>
                      <span className="text-sm font-black flex items-center text-slate-900 uppercase tracking-widest gap-2">
                        {copy.readAnalysis} <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
        
        <div className="mt-12 text-center md:hidden">
          <Link href="/resources" className="bg-white border border-slate-200 text-slate-900 px-8 py-4 rounded-2xl font-bold inline-flex items-center gap-2">
            {copy.viewAll} <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}

const BLOG_COPY: Record<string, { title: string; subtitle: string; viewAll: string; readAnalysis: string }> = {
  en: {
    title: 'Latest Resources',
    subtitle: 'Expert insights to help you maintain compliance.',
    viewAll: 'View all articles',
    readAnalysis: 'Read Analysis'
  },
  es: {
    title: 'Últimos recursos',
    subtitle: 'Insights de expertos para ayudarte a mantener el cumplimiento.',
    viewAll: 'Ver todos los artículos',
    readAnalysis: 'Leer análisis'
  },
  fr: {
    title: 'Dernières ressources',
    subtitle: 'Des analyses d’experts pour rester conforme.',
    viewAll: 'Voir tous les articles',
    readAnalysis: 'Lire l’analyse'
  },
  pt: {
    title: 'Recursos mais recentes',
    subtitle: 'Insights de especialistas para manter a conformidade.',
    viewAll: 'Ver todos os artigos',
    readAnalysis: 'Ler análise'
  },
  de: {
    title: 'Neueste Ressourcen',
    subtitle: 'Expertenwissen, das Ihnen hilft, compliant zu bleiben.',
    viewAll: 'Alle Artikel ansehen',
    readAnalysis: 'Analyse lesen'
  },
  it: {
    title: 'Ultime risorse',
    subtitle: 'Approfondimenti di esperti per restare conformi.',
    viewAll: 'Vedi tutti gli articoli',
    readAnalysis: 'Leggi analisi'
  },
  lt: {
    title: 'Naujausi ištekliai',
    subtitle: 'Ekspertų įžvalgos, padedančios išlaikyti atitiktį.',
    viewAll: 'Peržiūrėti visus straipsnius',
    readAnalysis: 'Skaityti analizę'
  }
};
