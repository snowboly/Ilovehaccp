import Link from 'next/link';
import { ArrowRight, Utensils } from 'lucide-react';

interface Article {
  slug: string;
  title: string;
  category: string;
}

export default function IndustryDirectory({ articles }: { articles: Article[] }) {
  // Filter for industry guides
  const guides = articles.filter(a => a.title.startsWith('HACCP for') && a.title.includes('EU Compliance'));

  if (guides.length === 0) return null;

  return (
    <section className="py-12 bg-white border-b border-slate-100">
      <div className="container mx-auto px-4">
        <div className="flex items-center gap-3 mb-8">
          <div className="bg-emerald-100 p-2 rounded-xl">
            <Utensils className="w-6 h-6 text-emerald-600" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Browse by Industry</h2>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {guides.map((guide) => (
            <Link 
              key={guide.slug} 
              href={`/resources/${guide.slug}`}
              className="group flex items-center justify-between p-4 rounded-xl border border-slate-100 hover:border-emerald-200 hover:bg-emerald-50/30 transition-all"
            >
              <span className="font-bold text-slate-700 text-sm group-hover:text-emerald-700 line-clamp-1">
                {guide.title.replace('HACCP for ', '').replace(': A Complete EU Compliance Guide', '')}
              </span>
              <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-emerald-500 transition-colors" />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
