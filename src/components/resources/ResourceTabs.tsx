"use client";

import { useState, useMemo } from 'react';
import { FileText, HelpCircle, Mail, Plus, Minus, Search, X } from 'lucide-react';
import Link from 'next/link';
import { Article } from '@/data/articles';
import { FAQItem } from '@/data/faqs';

interface ResourceTabsProps {
  articles: any[];
  faqs: FAQItem[];
}

export default function ResourceTabs({ articles, faqs }: ResourceTabsProps) {
  return (
    <div>
      <div className="space-y-24">
        {/* Articles Section */}
        {articles.length > 0 && (
          <section id="articles">
            <div className="flex items-center gap-3 mb-8">
              <div className="bg-blue-100 p-2 rounded-xl">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
              <h2 className="text-3xl font-black text-slate-900 tracking-tight">Articles</h2>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {articles.map((article) => (
                <Link 
                  key={article.slug} 
                  href={`/resources/${article.slug}`} 
                  className="group block bg-white rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-2xl hover:border-blue-200 transition-all overflow-hidden h-full flex flex-col"
                >
                  {article.image && (
                    <div className="h-56 overflow-hidden relative">
                      <img src={article.image} alt={article.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  )}
                  <div className="p-10 flex-1 flex flex-col">
                    <div className="flex justify-between items-center mb-6">
                      <span className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] bg-blue-50 px-3 py-1 rounded-full">{article.category}</span>
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{article.read_time}</span>
                    </div>
                    <h3 className="text-2xl font-black text-slate-900 mb-4 group-hover:text-blue-600 transition-colors line-clamp-2 leading-tight">{article.title}</h3>
                    <p className="text-slate-500 leading-relaxed line-clamp-3 mb-8 font-medium text-sm">{article.excerpt}</p>
                    <div className="mt-auto flex items-center text-slate-900 font-black text-xs uppercase tracking-[0.2em]">
                      Read Analysis
                      <Plus className="w-4 h-4 ml-2 group-hover:rotate-90 transition-transform text-blue-600" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* FAQs Section */}
        {faqs.length > 0 && (
          <section id="faqs">
            <div className="flex items-center gap-3 mb-8">
              <div className="bg-indigo-100 p-2 rounded-xl">
                <HelpCircle className="w-6 h-6 text-indigo-600" />
              </div>
              <h2 className="text-3xl font-black text-slate-900 tracking-tight">Frequently Asked Questions</h2>
            </div>
            <div className="max-w-4xl space-y-4">
              {faqs.map((faq, idx) => (
                <FAQAccordion key={idx} faq={faq} />
              ))}
            </div>
          </section>
        )}

        {/* No Results Fallback */}
        {articles.length === 0 && (
          <div className="text-center py-20 bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200">
            <div className="bg-white w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
              <Search className="w-10 h-10 text-slate-300" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-2">No results found</h3>
            <p className="text-slate-500 max-w-sm mx-auto mb-8 text-lg font-medium">
              We couldn&apos;t find matching articles. Try different keywords or contact our experts directly.
            </p>
            <Link 
              href="/contact" 
              className="inline-flex items-center gap-2 bg-slate-900 text-white px-8 py-4 rounded-2xl font-bold hover:bg-black transition-all shadow-xl"
            >
              <Mail className="w-5 h-5" />
              Contact for Support
            </Link>
          </div>
        )}

        {/* Persistent CTA */}
        <div className="text-center p-12 bg-blue-600 rounded-[3rem] text-white shadow-2xl shadow-blue-500/20 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
            <h3 className="text-3xl font-black mb-4 relative z-10">Still have questions?</h3>
            <p className="text-blue-100 text-lg mb-10 max-w-lg mx-auto relative z-10 font-medium leading-relaxed">
              Our food safety experts are standing by to help you with your specific HACCP challenges.
            </p>
            <Link 
              href="/contact" 
              className="relative z-10 inline-flex items-center gap-2 bg-white text-blue-600 px-10 py-4 rounded-2xl font-black text-lg hover:bg-blue-50 transition-all shadow-xl hover:scale-[1.02]"
            >
              <Mail className="w-6 h-6" />
              Get Expert Advice
            </Link>
        </div>
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
