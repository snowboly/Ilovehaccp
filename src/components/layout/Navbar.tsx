"use client";

import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { Menu, X, ChevronDown, FileText, HelpCircle } from 'lucide-react';
import { useLanguage } from '@/lib/i18n';
import LanguageSelector from './LanguageSelector';
import ThemeToggle from './ThemeToggle';
import UserMenu from './UserMenu';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [resourcesOpen, setResourcesOpen] = useState(false); // Mobile toggle
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { t } = useLanguage();

  return (
    <nav className="bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 sticky top-0 z-50 transition-colors">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center group">
            <Image
              src="/logo.png"
              alt="iLoveHACCP"
              width={120}
              height={36}
              className="h-9 w-auto group-hover:scale-105 transition-transform"
              priority
            />
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            <Link
              href="/builder"
              className={`text-sm font-bold transition-colors ${pathname === '/builder' ? 'text-blue-600 dark:text-blue-400' : 'text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400'}`}
            >
              {t('nav.builder')}
            </Link>

            {/* Resources Dropdown (Desktop) */}
            <div className="relative group h-16 flex items-center">
              <button className={`flex items-center gap-1 text-sm font-bold transition-colors ${pathname.startsWith('/resources') ? 'text-blue-600 dark:text-blue-400' : 'text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400'}`}>
                {t('nav.resources')}
                <ChevronDown className="w-4 h-4 group-hover:rotate-180 transition-transform" />
              </button>

              <div className="absolute top-[100%] left-0 w-56 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all transform translate-y-2 group-hover:translate-y-0 p-2 z-[60]">
                <Link
                  href="/resources"
                  className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:text-blue-600 dark:hover:text-blue-400 rounded-xl transition-colors"
                >
                  <div className="bg-blue-100 dark:bg-blue-900/40 p-1.5 rounded-lg">
                    <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  Articles
                </Link>
                <Link
                  href="/faqs"
                  className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-xl transition-colors"
                >
                  <div className="bg-indigo-100 dark:bg-indigo-900/40 p-1.5 rounded-lg">
                    <HelpCircle className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  FAQs
                </Link>
              </div>
            </div>

            <Link
              href="/about"
              className={`text-sm font-bold transition-colors ${pathname === '/about' ? 'text-blue-600 dark:text-blue-400' : 'text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400'}`}
            >
              {t('nav.about')}
            </Link>
            <Link
              href="/contact"
              className={`text-sm font-bold transition-colors ${pathname === '/contact' ? 'text-blue-600 dark:text-blue-400' : 'text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400'}`}
            >
              {t('nav.contact')}
            </Link>

            <UserMenu />
            <ThemeToggle />
            <LanguageSelector />
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-4">
            <ThemeToggle />
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
            <LanguageSelector />
          </div>
        </div>
      </div>

      {/* Mobile Nav */}
      {isOpen && (
        <div className="md:hidden border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 transition-colors">
          <div className="container mx-auto px-4 py-4 flex flex-col gap-4">
            <Link href="/builder" onClick={() => setIsOpen(false)} className="text-base font-bold text-slate-600 dark:text-slate-300">
              {t('nav.builder')}
            </Link>

            {/* Resources Mobile Accordion */}
            <div>
              <button
                onClick={() => setResourcesOpen(!resourcesOpen)}
                className="flex items-center justify-between w-full text-base font-bold text-slate-600 dark:text-slate-300"
              >
                {t('nav.resources')}
                <ChevronDown className={`w-5 h-5 transition-transform ${resourcesOpen ? 'rotate-180' : ''}`} />
              </button>
              {resourcesOpen && (
                <div className="pl-4 mt-2 space-y-2 border-l-2 border-slate-100 dark:border-slate-700 ml-1">
                  <Link href="/resources#articles" onClick={() => setIsOpen(false)} className="block py-1 text-slate-500 dark:text-slate-400">Articles</Link>
                  <Link href="/resources#faqs" onClick={() => setIsOpen(false)} className="block py-1 text-slate-500 dark:text-slate-400">FAQs</Link>
                </div>
              )}
            </div>

            <Link href="/about" onClick={() => setIsOpen(false)} className="text-base font-bold text-slate-600 dark:text-slate-300">
              {t('nav.about')}
            </Link>
            <Link href="/contact" onClick={() => setIsOpen(false)} className="text-base font-bold text-slate-600 dark:text-slate-300">
              {t('nav.contact')}
            </Link>

            <hr className="border-slate-100 dark:border-slate-700" />
            <div onClick={() => setIsOpen(false)}>
                <UserMenu mobile />
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}