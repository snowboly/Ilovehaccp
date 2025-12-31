"use client";

import { useLanguage } from '@/lib/i18n';
import { Globe } from 'lucide-react';

export default function LanguageSelector() {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="relative group">
      <button className="flex items-center gap-1 text-slate-500 hover:text-slate-900 transition-colors">
        <Globe className="w-4 h-4" />
        <span className="uppercase font-bold text-xs">{language}</span>
      </button>
      
      <div className="absolute right-0 top-full mt-2 w-32 bg-white rounded-xl shadow-xl border border-slate-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 overflow-hidden">
        <button onClick={() => setLanguage('en')} className="w-full text-left px-4 py-2 text-sm hover:bg-slate-50 flex items-center gap-2">🇺🇸 English</button>
        <button onClick={() => setLanguage('es')} className="w-full text-left px-4 py-2 text-sm hover:bg-slate-50 flex items-center gap-2">🇪🇸 Español</button>
        <button onClick={() => setLanguage('fr')} className="w-full text-left px-4 py-2 text-sm hover:bg-slate-50 flex items-center gap-2">🇫🇷 Français</button>
        <button onClick={() => setLanguage('pt')} className="w-full text-left px-4 py-2 text-sm hover:bg-slate-50 flex items-center gap-2">🇵🇹 Português</button>
      </div>
    </div>
  );
}
