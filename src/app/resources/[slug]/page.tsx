import { articles } from '@/data/articles';
import { ArrowLeft, Calendar, Clock, Tag } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = articles.find((a) => a.slug === slug);
  
  if (!article) {
    return {
      title: 'Article Not Found',
    };
  }

  return {
    title: `${article.title} | ilovehaccp.com`,
    description: article.excerpt,
  };
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = articles.find((a) => a.slug === slug);

  if (!article) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <div className="bg-slate-50 border-b">
        <div className="container mx-auto px-4 py-8">
          <Link href="/resources" className="inline-flex items-center text-slate-500 hover:text-blue-600 transition-colors font-medium">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Knowledge Base
          </Link>
        </div>
      </div>

      <article className="container mx-auto px-4 py-16 max-w-4xl">
        {/* Header */}
        <header className="mb-12 text-center">
          <div className="flex items-center justify-center gap-4 mb-6 text-sm text-slate-500">
            <span className="flex items-center gap-1 bg-blue-50 text-blue-700 px-3 py-1 rounded-full font-bold uppercase text-xs tracking-wider">
              <Tag className="w-3 h-3" /> {article.category}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" /> {article.readTime}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="w-4 h-4" /> {article.publishedAt}
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 leading-tight mb-6">
            {article.title}
          </h1>
          <p className="text-xl text-slate-500 leading-relaxed max-w-2xl mx-auto">
            {article.excerpt}
          </p>
        </header>

        {/* Content */}
        <div 
          className="prose prose-lg prose-slate max-w-none prose-headings:font-bold prose-headings:text-slate-900 prose-p:text-slate-700 prose-a:text-blue-600 prose-img:rounded-2xl"
          dangerouslySetInnerHTML={{ __html: article.content }}
        />
        
        {/* Footer CTA - Single Clear Message */}
        <div className="mt-20 py-16 border-t border-slate-100 text-center">
          <h3 className="text-3xl font-extrabold text-slate-900 mb-8 max-w-2xl mx-auto">
            {article.category === 'Compliance' || article.category === 'Fundamentals'
              ? 'Ready to get compliant? Generate your HACCP draft in 10 minutes.'
              : 'Need total peace of mind? Get your HACCP plan reviewed by a professional.'}
          </h3>
          <Link 
            href={article.category === 'Compliance' || article.category === 'Fundamentals' ? "/builder" : "/contact"} 
            className="inline-block bg-blue-600 text-white px-12 py-5 rounded-2xl text-xl font-bold shadow-2xl shadow-blue-500/20 hover:bg-blue-700 hover:scale-105 transition-all"
          >
            {article.category === 'Compliance' || article.category === 'Fundamentals' 
              ? 'Start Your Plan Free' 
              : 'Talk to an Expert'}
          </Link>
          <p className="mt-6 text-slate-400 text-sm">No credit card required • Instant PDF preview</p>
        </div>
      </article>
    </div>
  );
}
