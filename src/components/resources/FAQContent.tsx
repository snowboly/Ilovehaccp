"use client";

import { useState } from 'react';
import { HelpCircle, Mail, Plus, Minus, Search } from 'lucide-react';
import Link from 'next/link';
import { FAQItem } from '@/data/faqs';

interface FAQContentProps {
  faqs: FAQItem[];
}

export default function FAQContent({ faqs }: FAQContentProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredFaqs = faqs.filter(f => 
    f.q.toLowerCase().includes(searchQuery.toLowerCase()) || 
    f.a.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      {/* Search Bar */}
      <div className="mt-10 max-w-xl mx-auto relative group">
        <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-600 transition-colors">
          <Search className="w-5 h-5" />
        </div>
        <input 
          type="text"
          placeholder="Search questions..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-14 pr-6 py-5 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-indigo-600 focus:bg-white transition-all text-lg shadow-sm"
        />
      </div>

      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="space-y-4">
          {filteredFaqs.length > 0 ? (
            filteredFaqs.map((faq, idx) => (
              <FAQAccordion key={idx} faq={faq} />
            ))
          ) : (
            <div className="text-center py-20">
                <p className="text-slate-500 text-lg">No matching questions found.</p>
            </div>
          )}
        </div>

        {/* Contact CTA */}
        <div className="mt-20 text-center p-12 bg-indigo-600 rounded-[3rem] text-white shadow-2xl shadow-indigo-500/20 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
            <h3 className="text-3xl font-black mb-4 relative z-10">Still have questions?</h3>
            <p className="text-indigo-100 text-lg mb-10 max-w-lg mx-auto relative z-10 font-medium leading-relaxed">
              Our food safety experts are standing by to help you with your specific HACCP challenges.
            </p>
            <Link 
              href="/contact" 
              className="relative z-10 inline-flex items-center gap-2 bg-white text-indigo-600 px-10 py-4 rounded-2xl font-black text-lg hover:bg-indigo-50 transition-all shadow-xl hover:scale-[1.02]"
            >
              <Mail className="w-6 h-6" />
              Contact Support
            </Link>
        </div>
      </div>
    </>
  );
}

function FAQAccordion({ faq }: { faq: FAQItem }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="bg-white rounded-xl border border-slate-200 hover:border-indigo-300 transition-all shadow-sm overflow-hidden group">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full text-left p-6 flex items-start gap-4 focus:outline-none"
      >
        <div className={`mt-1 transition-transform duration-300 flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`}>
            {isOpen ? <Minus className="w-5 h-5 text-indigo-600" /> : <Plus className="w-5 h-5 text-slate-400 group-hover:text-indigo-400" />}
        </div>
        <div>
            <h3 className={`font-bold text-lg mb-1 transition-colors ${isOpen ? 'text-indigo-600' : 'text-slate-900'}`}>
                {faq.q}
            </h3>
            <div className={`grid transition-all duration-300 ease-in-out ${isOpen ? 'grid-rows-[1fr] opacity-100 mt-2' : 'grid-rows-[0fr] opacity-0'}`}>
                <div className="overflow-hidden">
                    <p className="text-slate-600 leading-relaxed font-medium">{faq.a}</p>
                </div>
            </div>
        </div>
      </button>
    </div>
  );
}
