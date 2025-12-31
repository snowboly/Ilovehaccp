"use client";

import Link from 'next/link';
import { ShieldCheck, Menu, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useLanguage } from '@/lib/i18n';
import LanguageSelector from './LanguageSelector';

export default function Navbar() {
  const [user, setUser] = useState<any>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { t } = useLanguage();

  useEffect(() => {
    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
    };
    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <header className="fixed w-full z-50 bg-white/90 backdrop-blur-md border-b border-slate-100">
      <div className="container mx-auto px-4 h-20 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <ShieldCheck className="h-8 w-8 text-blue-600 group-hover:scale-110 transition-transform" />
          <span className="text-xl font-extrabold tracking-tight text-slate-900">ilovehaccp.com</span>
        </Link>
        
        {/* Desktop Nav */}
        <nav className="hidden md:flex gap-8">
          <Link href="/#features" className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors">{t('nav.features')}</Link>
          <Link href="/#pricing" className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors">{t('nav.pricing')}</Link>
          <Link href="/resources" className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors">{t('nav.resources')}</Link>
          <Link href="/about" className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors">About</Link>
        </nav>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-6">
          <LanguageSelector />
          
          <div className="h-6 w-px bg-slate-200" />

          {user ? (
            <>
              <Link href="/dashboard" className="text-sm font-medium text-slate-600 hover:text-slate-900">Dashboard</Link>
              <button 
                onClick={() => supabase.auth.signOut()}
                className="text-sm font-medium text-red-600 hover:text-red-700"
              >
                Log out
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="text-sm font-medium text-slate-600 hover:text-slate-900">{t('nav.login')}</Link>
              <Link href="/builder" className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-full text-sm font-bold transition-all shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40">
                {t('nav.getStarted')}
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button 
          className="md:hidden p-2 text-slate-600"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div className="md:hidden absolute top-20 left-0 right-0 bg-white border-b border-slate-100 p-4 shadow-xl flex flex-col gap-4 animate-in slide-in-from-top-5">
          <Link 
            href="/#features" 
            className="text-base font-medium text-slate-600 py-2"
            onClick={() => setIsMenuOpen(false)}
          >
            {t('nav.features')}
          </Link>
          <Link 
            href="/#pricing" 
            className="text-base font-medium text-slate-600 py-2"
            onClick={() => setIsMenuOpen(false)}
          >
            {t('nav.pricing')}
          </Link>
          <Link 
            href="/resources" 
            className="text-base font-medium text-slate-600 py-2"
            onClick={() => setIsMenuOpen(false)}
          >
            {t('nav.resources')}
          </Link>
          <Link 
            href="/about" 
            className="text-base font-medium text-slate-600 py-2"
            onClick={() => setIsMenuOpen(false)}
          >
            About
          </Link>
          
          <div className="h-px bg-slate-100 my-2" />
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-500">Language</span>
            <LanguageSelector />
          </div>

          <div className="h-px bg-slate-100 my-2" />

          {user ? (
            <>
              <Link 
                href="/dashboard" 
                className="text-base font-medium text-slate-600 py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Dashboard
              </Link>
              <button 
                onClick={() => {
                  supabase.auth.signOut();
                  setIsMenuOpen(false);
                }}
                className="text-base font-medium text-red-600 py-2 text-left"
              >
                Log out
              </button>
            </>
          ) : (
            <div className="flex flex-col gap-3">
              <Link 
                href="/login" 
                className="text-center py-3 rounded-lg border border-slate-200 font-bold text-slate-700"
                onClick={() => setIsMenuOpen(false)}
              >
                {t('nav.login')}
              </Link>
              <Link 
                href="/builder" 
                className="text-center py-3 rounded-lg bg-blue-600 text-white font-bold shadow-lg"
                onClick={() => setIsMenuOpen(false)}
              >
                {t('nav.getStarted')}
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
