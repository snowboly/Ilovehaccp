"use client";

import { useLanguage } from '@/lib/i18n';
import { TeamAvatar } from '../team/TeamAvatars';
import { Quote } from 'lucide-react';

export default function FounderNote() {
  const { t } = useLanguage();

  return (
    <section className="py-24 bg-slate-50 border-t border-slate-100">
      <div className="container px-4 mx-auto max-w-4xl">
        <div className="bg-white rounded-[2.5rem] p-10 lg:p-14 shadow-xl border border-slate-100 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-5">
            <Quote className="w-32 h-32 text-blue-600" />
          </div>
          
          <div className="flex flex-col md:flex-row gap-10 items-center md:items-start relative z-10">
            <div className="flex-shrink-0">
                <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-slate-50 shadow-lg bg-white">
                    <TeamAvatar name="Dr. Joao" className="w-full h-full object-contain" />
                </div>
            </div>
            
            <div className="space-y-6 text-center md:text-left">
                <div>
                    <h3 className="text-2xl font-black text-slate-900 mb-2">{t('landing.founder.title' as any)}</h3>
                    <div className="w-12 h-1 bg-blue-600 rounded-full mx-auto md:mx-0"></div>
                </div>
                <p className="text-xl text-slate-600 leading-relaxed font-medium italic">
                    &quot;{t('landing.founder.text' as any)}&quot;
                </p>
                <div>
                    <p className="font-black text-slate-900">{t('landing.founder.name' as any)}</p>
                    <p className="text-sm font-bold text-blue-600 uppercase tracking-widest">{t('landing.founder.role' as any)}</p>
                </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
