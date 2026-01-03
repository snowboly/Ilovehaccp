import Link from 'next/link';
import { ArrowRight, BookOpen, ShieldAlert, Zap, FileText } from 'lucide-react';
import { articles } from '@/data/articles';

const getArticleStyle = (index: number) => {
  const styles = [
    { icon: <BookOpen className="w-10 h-10 text-white opacity-80" />, color: "bg-blue-500" },
    { icon: <ShieldAlert className="w-10 h-10 text-white opacity-80" />, color: "bg-red-500" },
    { icon: <Zap className="w-10 h-10 text-white opacity-80" />, color: "bg-purple-500" }
  ];
  return styles[index % styles.length];
};

export default function BlogPreview() {
  const latestArticles = articles.slice(0, 3);

  return (
    <section className="py-24 bg-slate-50">
      <div className="container px-4 md:px-6 mx-auto">
        <div className="flex justify-between items-end mb-12">
          <div>
            <h2 className="text-3xl font-bold tracking-tight mb-2">Latest Resources</h2>
            <p className="text-gray-500">Expert articles to help you maintain compliance.</p>
          </div>
          <Link href="/resources" className="text-blue-600 font-medium hover:underline hidden md:flex items-center">
            View all articles <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {latestArticles.map((article, i) => {
            const style = getArticleStyle(i);
            return (
              <Link key={article.slug} href={`/resources/${article.slug}`} className="group cursor-pointer">
                <div className="bg-white rounded-xl overflow-hidden border shadow-sm hover:shadow-md transition-shadow h-full flex flex-col">
                  <div className={`h-48 ${style.color} w-full flex items-center justify-center`}>
                    {style.icon}
                  </div>
                  <div className="p-6 flex-1 flex flex-col">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">{article.category}</span>
                      <span className="text-xs text-gray-400">{article.readTime}</span>
                    </div>
                    <h3 className="text-xl font-bold mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">{article.title}</h3>
                    <p className="text-gray-500 text-sm mb-4 flex-1 line-clamp-3">{article.excerpt}</p>
                    <span className="text-sm font-medium flex items-center text-gray-900">
                      Read Article <ArrowRight className="ml-2 h-4 w-4" />
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
        
        <div className="mt-8 text-center md:hidden">
          <Link href="/resources" className="text-blue-600 font-medium hover:underline inline-flex items-center">
            View all articles <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}