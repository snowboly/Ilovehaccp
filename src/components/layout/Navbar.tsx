"use client";

import Link from 'next/link';
import { ShieldCheck } from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useLanguage } from '@/lib/i18n';
import LanguageSelector from './LanguageSelector';

export default function Navbar() {
  const [user, setUser] = useState<any>(null);
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
        
        <nav className="hidden md:flex gap-8">
          <Link href="/#features" className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors">{t('nav.features')}</Link>
          <Link href="/#pricing" className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors">{t('nav.pricing')}</Link>
          <Link href="/resources" className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors">{t('nav.resources')}</Link>
          <Link href="/about" className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors">About</Link>
        </nav>

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
      </div>
    </header>
  );
}
