"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { Menu, X, Heart } from 'lucide-react';
import { useLanguage } from '@/lib/i18n';
import LanguageSelector from './LanguageSelector';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const { t } = useLanguage();

  const navItems = [
    { name: t('nav.builder'), href: '/builder' },
    { name: t('nav.resources'), href: '/resources' },
    { name: t('nav.about'), href: '/about' },
    { name: t('nav.contact'), href: '/contact' },
  ];

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
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`text-sm font-bold transition-colors ${
                  pathname === item.href 
                    ? 'text-blue-600' 
                    : 'text-slate-600 hover:text-blue-600'
                }`}
              >
                {item.name}
              </Link>
            ))}
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
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={`text-base font-bold py-2 ${
                  pathname === item.href 
                    ? 'text-blue-600' 
                    : 'text-slate-600'
                }`}
              >
                {item.name}
              </Link>
            ))}
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