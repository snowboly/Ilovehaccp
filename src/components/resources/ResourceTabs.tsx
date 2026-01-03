"use client";

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { FileText, HelpCircle, ChevronDown, Mail, Plus, Minus } from 'lucide-react';
import Link from 'next/link';
import { Article } from '@/data/articles';
import { FAQItem } from '@/data/faqs';

interface ResourceTabsProps {
  articles: Article[];
  faqs: FAQItem[];
}

export default function ResourceTabs({ articles, faqs }: ResourceTabsProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [view, setView] = useState<'articles' | 'faqs'>('articles');
  
  // Sync with URL
  useEffect(() => {
    const viewParam = searchParams.get('view');
    if (viewParam === 'faqs') {
      setView('faqs');
    } else {
      setView('articles');
    }
  }, [searchParams]);

  const handleViewChange = (newView: 'articles' | 'faqs') => {
    setView(newView);
    router.push(`/resources?view=${newView}`, { scroll: false });
  };

  return (
    <div>
      {/* Dropdown / Tabs Control */}
      <div className="flex justify-center mb-12">
        <div className="relative inline-block w-64">
          <select
            value={view}
            onChange={(e) => handleViewChange(e.target.value as 'articles' | 'faqs')}
            className="appearance-none w-full bg-white border-2 border-slate-200 text-slate-900 font-bold py-3 px-6 pr-10 rounded-xl cursor-pointer focus:outline-none focus:border-blue-500 shadow-sm transition-all"
          >
            <option value="articles">1. Articles</option>
            <option value="faqs">2. Frequently Asked Questions</option>
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500">
            <ChevronDown className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="min-h-[400px]">
        {view === 'articles' && (
          <div className="grid md:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {articles.map((article) => (
              <Link 
                key={article.slug} 
                href={`/resources/${article.slug}`} 
                className="group block bg-white rounded-xl border shadow-sm hover:shadow-md transition-all p-6"
              >
                <div className="flex justify-between items-center mb-4">
                  <span className="text-xs font-bold text-blue-600 uppercase tracking-wider bg-blue-50 px-2 py-1 rounded">{article.category}</span>
                  <span className="text-xs text-slate-400">{article.readTime}</span>
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">{article.title}</h3>
                <p className="text-slate-500 text-sm line-clamp-3 mb-4">{article.excerpt}</p>
                <div className="flex items-center text-blue-600 font-medium text-sm">
                  Read Article <FileText className="w-4 h-4 ml-2" />
                </div>
              </Link>
            ))}
          </div>
        )}

        {view === 'faqs' && (
          <div className="max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="space-y-4 mb-16">
              {faqs.map((faq, idx) => (
                <FAQAccordion key={idx} faq={faq} />
              ))}
            </div>

            {/* Contact Button at the end of FAQs */}
            <div className="text-center p-8 bg-blue-50 rounded-2xl border border-blue-100">
              <h3 className="text-xl font-bold text-slate-900 mb-2">Still have questions?</h3>
              <p className="text-slate-500 mb-6">Our food safety experts are here to help.</p>
              <Link 
                href="/contact" 
                className="inline-flex items-center gap-2 bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg hover:shadow-blue-500/20"
              >
                <Mail className="w-5 h-5" />
                Contact Support
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function FAQAccordion({ faq }: { faq: FAQItem }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="bg-white rounded-xl border hover:border-blue-200 transition-all shadow-sm overflow-hidden">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full text-left p-6 flex items-start gap-4 focus:outline-none"
      >
        <div className={`mt-1 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>
            {isOpen ? <Minus className="w-5 h-5 text-blue-600" /> : <Plus className="w-5 h-5 text-slate-400" />}
        </div>
        <div>
            <h3 className={`font-bold text-lg mb-1 transition-colors ${isOpen ? 'text-blue-600' : 'text-slate-900'}`}>
                {faq.q}
            </h3>
            <div className={`grid transition-all duration-300 ease-in-out ${isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                <div className="overflow-hidden">
                    <p className="text-slate-600 leading-relaxed mt-2">{faq.a}</p>
                </div>
            </div>
        </div>
      </button>
    </div>
  );
}
