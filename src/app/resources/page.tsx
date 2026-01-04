"use client";

import { useState, useEffect } from 'react';
import { BookOpen, ShieldCheck, Search, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { faqs } from '@/data/faqs';
import { articles as localArticles } from '@/data/articles';
import ResourceTabs from '@/components/resources/ResourceTabs';

export default function ResourcesPage() {
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
        // Fallback to local data if DB is empty or fails
        console.log("Supabase empty/error, using local fallback");
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
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-16 text-center">
          <div className="inline-flex items-center justify-center p-2 bg-blue-50 rounded-full mb-4">
            <BookOpen className="w-6 h-6 text-blue-600" />
          </div>
          <h1 className="text-4xl font-black text-slate-900 mb-4 tracking-tight">Food Safety Knowledge Base</h1>
          <p className="text-xl text-slate-500 max-w-2xl mx-auto font-medium">
            Everything you need to understand HACCP, compliance, and audit readiness.
          </p>
          
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
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        
        {loading ? (
          <div className="h-96 flex flex-col items-center justify-center text-slate-400 gap-4">
            <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
            <p className="font-bold uppercase tracking-widest text-xs">Scanning Knowledge Base...</p>
          </div>
        ) : (
          <ResourceTabs articles={filteredArticles} faqs={faqs} />
        )}

        {/* Scientific Context Section */}
        <section className="bg-white rounded-3xl shadow-xl border border-slate-100 p-8 md:p-16 mt-20 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-green-50 rounded-full blur-3xl -mr-32 -mt-32"></div>
          <div className="flex flex-col lg:flex-row items-start gap-12 relative z-10">
            <div className="p-5 bg-green-50 rounded-2xl text-green-600 shadow-sm border border-green-100 flex-shrink-0">
                <ShieldCheck className="w-12 h-12" />
            </div>
            <div>
              <h2 className="text-3xl font-black text-slate-900 mb-6 tracking-tight italic uppercase">Expert Editorial Integrity</h2>
              <p className="text-slate-600 mb-8 leading-relaxed text-lg font-medium">
                Our AI-driven knowledge base is curated by lead auditors and food microbiologists. Every article is cross-referenced with Codex Alimentarius and FDA guidelines to ensure operational accuracy.
              </p>
              <div className="grid md:grid-cols-2 gap-6">
                <Citation 
                  source="Codex" 
                  title="General Principles of Food Hygiene" 
                  link="https://www.fao.org/fao-who-codexalimentarius"
                />
                <Citation 
                  source="FSMA" 
                  title="FDA Preventive Controls for Human Food" 
                  link="https://www.fda.gov/food"
                />
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

function Citation({ source, title, link }: any) {
  return (
    <a href={link} target="_blank" rel="noreferrer" className="flex items-center gap-4 p-5 bg-slate-50 rounded-2xl border border-slate-100 hover:border-blue-300 hover:bg-white hover:shadow-lg transition-all group">
      <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center border text-sm font-black text-slate-900 shadow-sm group-hover:scale-110 transition-transform">
        {source}
      </div>
      <div>
        <p className="font-black text-slate-900 text-sm uppercase tracking-wider">{source}</p>
        <p className="text-slate-500 text-sm font-medium">{title}</p>
      </div>
    </a>
  );
}

