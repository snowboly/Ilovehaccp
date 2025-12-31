import Link from 'next/link';
import { ArrowRight, BookOpen, ShieldAlert, Zap } from 'lucide-react';

const articles = [
  {
    title: "The 7 Principles of HACCP Explained Simply",
    excerpt: "Understand the core framework of food safety without the jargon. A guide for beginners.",
    category: "Education",
    readTime: "5 min read",
    icon: <BookOpen className="w-10 h-10 text-white opacity-80" />,
    color: "bg-blue-500"
  },
  {
    title: "Top 5 Mistakes in Restaurant HACCP Plans",
    excerpt: "Are you making these common errors? Learn how to avoid critical non-compliance issues.",
    category: "Compliance",
    readTime: "4 min read",
    icon: <ShieldAlert className="w-10 h-10 text-white opacity-80" />,
    color: "bg-red-500"
  },
  {
    title: "AI in Food Safety: The Future of Compliance",
    excerpt: "How machine learning is revolutionizing how we detect hazards and manage documentation.",
    category: "Technology",
    readTime: "6 min read",
    icon: <Zap className="w-10 h-10 text-white opacity-80" />,
    color: "bg-purple-500"
  }
];

export default function BlogPreview() {
  return (
    <section className="py-24 bg-slate-50">
      <div className="container px-4 md:px-6 mx-auto">
        <div className="flex justify-between items-end mb-12">
          <div>
            <h2 className="text-3xl font-bold tracking-tight mb-2">Latest Resources</h2>
            <p className="text-gray-500">Expert articles to help you maintain compliance.</p>
          </div>
          <Link href="#" className="text-blue-600 font-medium hover:underline hidden md:flex items-center">
            View all articles <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {articles.map((article, i) => (
            <div key={i} className="group cursor-pointer">
              <div className="bg-white rounded-xl overflow-hidden border shadow-sm hover:shadow-md transition-shadow h-full flex flex-col">
                <div className={`h-48 ${article.color} w-full flex items-center justify-center`}>
                  {article.icon}
                </div>
                <div className="p-6 flex-1 flex flex-col">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">{article.category}</span>
                    <span className="text-xs text-gray-400">{article.readTime}</span>
                  </div>
                  <h3 className="text-xl font-bold mb-2 group-hover:text-blue-600 transition-colors">{article.title}</h3>
                  <p className="text-gray-500 text-sm mb-4 flex-1">{article.excerpt}</p>
                  <span className="text-sm font-medium flex items-center text-gray-900">
                    Read Article <ArrowRight className="ml-2 h-4 w-4" />
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-8 text-center md:hidden">
          <Link href="#" className="text-blue-600 font-medium hover:underline inline-flex items-center">
            View all articles <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
