import { BookOpen } from 'lucide-react';
import ResourceContent from '@/components/resources/ResourceContent';
import IndustryDirectory from '@/components/resources/IndustryDirectory';
import JSONLD from '@/components/layout/JSONLD';
import { Metadata } from 'next';
import { supabase } from '@/lib/supabase';
import { articles as localArticles } from '@/data/articles';

export const metadata: Metadata = {
  title: 'Food Safety Knowledge Base | HACCP Guides & Regulations',
  description: 'Everything you need to understand HACCP, compliance, and audit readiness. Expert-curated articles on food microbiology and safety protocols.',
  alternates: { canonical: 'https://www.ilovehaccp.com/resources' }
};

export default async function ResourcesPage() {
  // Server-side fetch for SEO
  const { data: dbArticles } = await supabase
    .from('articles')
    .select('slug, title, category, excerpt, read_time, image, published_at')
    .order('created_at', { ascending: false });

  const allArticles = dbArticles && dbArticles.length > 0 ? dbArticles : localArticles;

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": "Food Safety Knowledge Base",
    "description": "Guides and regulations for HACCP compliance."
  };

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
          
          <ResourceContent initialArticles={allArticles} />
        </div>
      </div>

      <IndustryDirectory articles={allArticles} />

      <JSONLD data={structuredData} />
    </div>
  );
}
