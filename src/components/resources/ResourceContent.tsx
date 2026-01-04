"use client";

import { useState, useEffect } from 'react';
import { Search, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { articles as localArticles } from '@/data/articles';
import ResourceTabs from '@/components/resources/ResourceTabs';

export default function ResourceContent() {
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
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
          placeholder="Search guides, regulations, and hazards..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-14 pr-6 py-5 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-blue-600 focus:bg-white transition-all text-lg shadow-sm"
        />
      </div>

      <div className="container mx-auto px-4 py-12">
        {loading ? (
          <div className="h-96 flex flex-col items-center justify-center text-slate-400 gap-4">
            <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
            <p className="font-bold uppercase tracking-widest text-xs">Scanning Knowledge Base...</p>
          </div>
        ) : (
          <ResourceTabs articles={filteredArticles} />
        )}
      </div>
    </>
  );
}
