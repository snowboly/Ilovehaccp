"use client";

import { useLanguage } from '@/lib/i18n';
import { Globe } from 'lucide-react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { replaceLocaleInPath } from '@/lib/locale-routing';
import { type Language } from '@/lib/locales';

export default function LanguageSelector() {
  const { language, setLanguage } = useLanguage();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handleLocaleChange = (nextLocale: Language) => {
    setLanguage(nextLocale);
    const nextPath = replaceLocaleInPath(pathname || '/', nextLocale);
    const query = searchParams?.toString();
    router.push(query ? `${nextPath}?${query}` : nextPath);
  };

  return (
    <div className="relative group">
      <button className="flex items-center gap-1 text-slate-500 hover:text-slate-900 transition-colors">
        <Globe className="w-4 h-4" />
        <span className="uppercase font-bold text-xs">{language}</span>
      </button>
      
      <div className="absolute right-0 top-full mt-2 w-40 bg-white rounded-xl shadow-xl border border-slate-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 overflow-hidden">
        <button onClick={() => handleLocaleChange('en')} className="w-full text-left px-4 py-2 text-sm hover:bg-slate-50 flex items-center gap-2">🇺🇸 English</button>
        <button onClick={() => handleLocaleChange('de')} className="w-full text-left px-4 py-2 text-sm hover:bg-slate-50 flex items-center gap-2">🇩🇪 Deutsch</button>
        <button onClick={() => handleLocaleChange('it')} className="w-full text-left px-4 py-2 text-sm hover:bg-slate-50 flex items-center gap-2">🇮🇹 Italiano</button>
        <button onClick={() => handleLocaleChange('lt')} className="w-full text-left px-4 py-2 text-sm hover:bg-slate-50 flex items-center gap-2">🇱🇹 Lietuvių</button>
      </div>
    </div>
  );
}
