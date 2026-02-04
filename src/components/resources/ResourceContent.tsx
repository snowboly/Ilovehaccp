"use client";

import { useState, useEffect } from 'react';
import { Search, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { articles as localArticles } from '@/data/articles';
import ResourceTabs from '@/components/resources/ResourceTabs';
import { useLanguage } from '@/lib/i18n';

export default function ResourceContent({ initialArticles = [] }: { initialArticles?: any[] }) {
  const { language } = useLanguage();
  const copy = RESOURCE_CONTENT_COPY[language] ?? RESOURCE_CONTENT_COPY.en;
  const [articles, setArticles] = useState<any[]>(initialArticles);
  const [loading, setLoading] = useState(initialArticles.length === 0);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (initialArticles.length > 0) return;

    async function fetchArticles() {
      const { data, error } = await supabase
        .from('articles')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (!error && data && data.length > 0) {
        setArticles(data);
      } else {
        setArticles(localArticles);
      }
      setLoading(false);
    }
    fetchArticles();
  }, []);

  const filteredArticles = articles.filter(a => 
    a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      {/* Search Bar */}
      <div className="mt-10 max-w-xl mx-auto relative group">
        <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-600 transition-colors">
          <Search className="w-5 h-5" />
        </div>
        <input 
          type="text"
          placeholder={copy.searchPlaceholder}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-14 pr-6 py-5 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-blue-600 focus:bg-white transition-all text-lg shadow-sm"
        />
      </div>

      <div className="container mx-auto px-4 py-12">
        {loading ? (
          <div className="h-96 flex flex-col items-center justify-center text-slate-400 gap-4">
            <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
            <p className="font-bold uppercase tracking-widest text-xs">{copy.loading}</p>
          </div>
        ) : (
          <ResourceTabs articles={filteredArticles} />
        )}
      </div>
    </>
  );
}

const RESOURCE_CONTENT_COPY: Record<string, { searchPlaceholder: string; loading: string }> = {
  en: {
    searchPlaceholder: 'Search guides, regulations, and hazards...',
    loading: 'Scanning Knowledge Base...'
  },
  de: {
    searchPlaceholder: 'Leitfäden, Vorschriften und Gefahren suchen...',
    loading: 'Wissensdatenbank wird durchsucht...'
  },
  it: {
    searchPlaceholder: 'Cerca guide, normative e pericoli...',
    loading: 'Analisi della knowledge base...'
  },
  lt: {
    searchPlaceholder: 'Ieškoti gidų, reglamentų ir pavojų...',
    loading: 'Peržiūrima žinių bazė...'
  }
};
