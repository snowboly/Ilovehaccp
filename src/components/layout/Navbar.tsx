"use client";

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { Menu, X, Heart, ChevronDown } from 'lucide-react';
import { useLanguage } from '@/lib/i18n';
import LanguageSelector from './LanguageSelector';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [resourcesOpen, setResourcesOpen] = useState(false); // Mobile toggle
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { t } = useLanguage();

  return (
    <nav className="bg-white border-b border-slate-100 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-1.5 group">
            <span className="text-2xl font-black text-slate-900 tracking-tight">i</span>
            <Heart className="w-6 h-6 text-rose-600 fill-rose-600 group-hover:scale-110 transition-transform" />
            <span className="text-2xl font-black text-slate-900 tracking-tight">HACCP</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            <Link
              href="/builder"
              className={`text-sm font-bold transition-colors ${pathname === '/builder' ? 'text-blue-600' : 'text-slate-600 hover:text-blue-600'}`}
            >
              {t('nav.builder')}
            </Link>

            {/* Resources Dropdown (Desktop) */}
            <div className="relative group">
              <button className={`flex items-center gap-1 text-sm font-bold transition-colors ${pathname.startsWith('/resources') ? 'text-blue-600' : 'text-slate-600 hover:text-blue-600'}`}>
                {t('nav.resources')}
                <ChevronDown className="w-4 h-4 group-hover:rotate-180 transition-transform" />
              </button>
              
              <div className="absolute top-full left-0 w-48 bg-white border border-slate-100 rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all transform translate-y-2 group-hover:translate-y-0 p-2">
                <Link 
                  href="/resources?view=articles" 
                  className="block px-4 py-2 text-sm font-medium text-slate-600 hover:bg-blue-50 hover:text-blue-600 rounded-lg"
                >
                  Articles
                </Link>
                <Link 
                  href="/resources?view=faqs" 
                  className="block px-4 py-2 text-sm font-medium text-slate-600 hover:bg-blue-50 hover:text-blue-600 rounded-lg"
                >
                  FAQs
                </Link>
              </div>
            </div>

            <Link
              href="/about"
              className={`text-sm font-bold transition-colors ${pathname === '/about' ? 'text-blue-600' : 'text-slate-600 hover:text-blue-600'}`}
            >
              {t('nav.about')}
            </Link>
            <Link
              href="/contact"
              className={`text-sm font-bold transition-colors ${pathname === '/contact' ? 'text-blue-600' : 'text-slate-600 hover:text-blue-600'}`}
            >
              {t('nav.contact')}
            </Link>

            <LanguageSelector />
            <Link 
              href="/login"
              className="text-sm font-bold text-slate-600 hover:text-blue-600 transition-colors"
            >
              {t('nav.login')}
            </Link>
            <Link
              href="/signup"
              className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-all shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 hover:-translate-y-0.5"
            >
              {t('nav.getStarted')}
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-4">
            <LanguageSelector />
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-slate-600 hover:text-slate-900 transition-colors"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav */}
      {isOpen && (
        <div className="md:hidden border-t border-slate-100 bg-white">
          <div className="container mx-auto px-4 py-4 flex flex-col gap-4">
            <Link href="/builder" onClick={() => setIsOpen(false)} className="text-base font-bold text-slate-600">
              {t('nav.builder')}
            </Link>
            
            {/* Resources Mobile Accordion */}
            <div>
              <button 
                onClick={() => setResourcesOpen(!resourcesOpen)}
                className="flex items-center justify-between w-full text-base font-bold text-slate-600"
              >
                {t('nav.resources')}
                <ChevronDown className={`w-5 h-5 transition-transform ${resourcesOpen ? 'rotate-180' : ''}`} />
              </button>
              {resourcesOpen && (
                <div className="pl-4 mt-2 space-y-2 border-l-2 border-slate-100 ml-1">
                  <Link href="/resources?view=articles" onClick={() => setIsOpen(false)} className="block py-1 text-slate-500">Articles</Link>
                  <Link href="/resources?view=faqs" onClick={() => setIsOpen(false)} className="block py-1 text-slate-500">FAQs</Link>
                </div>
              )}
            </div>

            <Link href="/about" onClick={() => setIsOpen(false)} className="text-base font-bold text-slate-600">
              {t('nav.about')}
            </Link>
            <Link href="/contact" onClick={() => setIsOpen(false)} className="text-base font-bold text-slate-600">
              {t('nav.contact')}
            </Link>
            
            <hr className="border-slate-100" />
            <Link
              href="/login"
              onClick={() => setIsOpen(false)}
              className="text-base font-bold text-slate-600 py-2"
            >
              {t('nav.login')}
            </Link>
            <Link
              href="/signup"
              onClick={() => setIsOpen(false)}
              className="bg-blue-600 text-white px-5 py-3 rounded-xl font-bold text-center shadow-lg shadow-blue-500/20"
            >
              {t('nav.getStarted')}
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}