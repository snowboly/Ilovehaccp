"use client";

import Link from 'next/link';
import { 
  Clock, 
  ArrowRight, 
  CheckCircle2, 
  X,
  Gavel,
  UserCheck,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';
import InteractiveDemo from '@/components/landing/InteractiveDemo';
import HowItWorks from '@/components/landing/HowItWorks';
import BlogPreview from '@/components/landing/BlogPreview';
import SampleDownload from '@/components/landing/SampleDownload';
import FounderNote from '@/components/landing/FounderNote';
import TrustSection from '@/components/landing/TrustSection';
import JSONLD from '@/components/layout/JSONLD';
import { useLanguage } from '@/lib/i18n';

export default function Home() {
  const { t } = useLanguage();
  
  return (
    <div className="font-sans">
      <main className="flex-1 pt-16">
        <SampleDownload />

        {/* Hero Section */}
        <section className="relative overflow-hidden py-12 lg:py-16">
          <div className="absolute inset-0 z-0">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
            <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-blue-400 opacity-20 blur-[100px]"></div>
            <div className="absolute right-0 bottom-0 -z-10 h-[400px] w-[400px] rounded-full bg-indigo-400 opacity-20 blur-[120px]"></div>
          </div>
          
          <div className="container px-4 mx-auto relative z-10">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <h1 className="text-4xl lg:text-6xl font-extrabold text-slate-900 leading-[1.1] tracking-tight">
                  {t('landing.hero.titlePart1')} <br />
                  <span className="text-3xl lg:text-5xl text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 block mt-2">
                    {t('landing.hero.titlePart2')}
                  </span>
                </h1>
                <p className="text-lg text-slate-600 max-w-lg leading-relaxed">
                  {t('landing.hero.subtitle')}
                </p>

                {/* Checklist */}
                <div className="flex flex-col gap-2 py-1">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="flex-shrink-0 w-5 h-5 bg-emerald-100 rounded-full flex items-center justify-center">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      </div>
                      <span className="font-bold text-slate-700 text-sm tracking-tight">
                        {t(`landing.hero.check${i}` as any)}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <Link href="/builder" className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white text-center px-8 py-4 rounded-2xl text-lg font-black transition-all shadow-xl shadow-blue-500/30 hover:scale-105 active:scale-95 flex items-center justify-center gap-3">
                    {t('landing.hero.cta')}
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                </div>

                <div className="flex flex-wrap gap-6 text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] pt-2 grayscale opacity-60">
                  <span className="flex items-center gap-2">{t('landing.hero.compliance.standard_1')}</span>
                  <span className="flex items-center gap-2">{t('landing.hero.compliance.eu')}</span>
                  <span className="flex items-center gap-2">{t('landing.hero.compliance.codex')}</span>
                </div>
              </div>
              
              <div className="relative lg:mt-0 mt-12">
                <InteractiveDemo />
              </div>
            </div>
          </div>
        </section>

        <TrustSection />

        {/* Features Section */}
        <section id="features" className="py-24 bg-white text-slate-900">
          <div className="container px-4 mx-auto">
            <div className="text-center max-w-3xl mx-auto mb-20">
              <h2 className="text-3xl font-bold mb-4">{t('landing.features.title')}</h2>
              <p className="text-lg text-slate-500">
                {t('landing.features.subtitle')}
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  icon: <Clock className="w-6 h-6" />,
                  title: t('landing.features.f1_title'),
                  desc: t('landing.features.f1_desc')
                },
                {
                  icon: <Gavel className="w-6 h-6" />,
                  title: t('landing.features.f2_title'),
                  desc: t('landing.features.f2_desc')
                },
                {
                  icon: <UserCheck className="w-6 h-6" />,
                  title: t('landing.features.f3_title'),
                  desc: t('landing.features.f3_desc')
                }
              ].map((feature, i) => (
                <div key={i} className="p-8 rounded-3xl bg-slate-50 border border-slate-100 hover:border-blue-200 transition-colors text-slate-900">
                  <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white mb-6 shadow-lg shadow-blue-500/20">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                  <p className="text-slate-500 leading-relaxed">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Regulatory Integrity Section (Kept mostly static for now as names are standard, but headers translated) */}
        <section className="py-20 bg-slate-50 border-y border-slate-100 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 to-indigo-600"></div>
          <div className="container px-4 mx-auto relative z-10">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div>
                <h2 className="text-4xl font-black text-slate-900 mb-6 tracking-tight italic uppercase">
                  Rigorous Standards Alignment. <br />
                  <span className="text-blue-600">Zero Shortcuts.</span>
                </h2>
                <p className="text-xl text-slate-600 leading-relaxed font-medium mb-10">
                  Our intelligence engine isn't just generating text—it's executing a logical risk assessment based on strict EU and UK food safety standards.
                </p>
                
                <div className="grid gap-6">
                  {[{
                    "title": "Codex Alimentarius",
                    "desc": "Scientific logic based on the CXC 1-1969 General Principles of Food Hygiene."
                  }, {
                    "title": "Auditor-Ready Structure",
                    "desc": "Output follows the standard 7-principle format expected by Environmental Health Officers."
                  }, {
                    "title": "EC Regulation 852/2004",
                    "desc": "Aligned with EU hygiene of foodstuffs regulations."
                  }].map((item, i) => (
                    <div key={i} className="flex gap-4 p-6 bg-white rounded-2xl border border-slate-100 shadow-sm">
                      <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 flex-shrink-0">
                        <ShieldCheck className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="font-black text-slate-900 uppercase tracking-wider text-sm mb-1">{item.title}</h4>
                        <p className="text-slate-500 text-sm font-medium">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="relative">
                <div className="aspect-square bg-white rounded-[3rem] shadow-2xl p-8 md:p-12 border border-slate-100 flex flex-col items-center justify-center text-center overflow-hidden">
                   <div className="space-y-6">
                      <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 relative">
                        <div className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-4">CCP Decision Tree</div>
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-16 h-10 rounded-lg border-2 border-slate-200 bg-white flex items-center justify-center text-[8px] font-bold text-slate-400">Hazard?</div>
                          <ChevronRight className="w-3 h-3 text-slate-300" />
                          <div className="w-16 h-10 rounded-lg border-2 border-blue-500 bg-blue-50 flex items-center justify-center text-[8px] font-black text-blue-600">Control?</div>
                          <ChevronRight className="w-3 h-3 text-slate-300" />
                          <div className="w-16 h-10 rounded-lg bg-emerald-500 flex flex-col items-center justify-center text-[8px] font-black text-white shadow-lg shadow-emerald-500/40">
                            <ShieldCheck className="w-3 h-3" />
                            CCP
                          </div>
                        </div>
                        {/* Connecting line */}
                        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-px h-4 bg-slate-200"></div>
                      </div>

                      <p className="text-slate-500 font-medium">Every Critical Control Point (CCP) identified by our engine includes scientific critical limits and corrective actions verified for audit submission.</p>
                   </div>
                </div>
                {/* Background Decoration */}
                <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-blue-100 rounded-full blur-3xl opacity-50 -z-10"></div>
              </div>
            </div>
          </div>
        </section>

        {/* Audience Segmentation Section */}
        <section className="py-24 bg-white">
          <div className="container px-4 mx-auto max-w-5xl">
            <div className="text-center mb-16">
              <h2 className="text-3xl lg:text-4xl font-black text-slate-900 mb-4">{t('landing.audience.title' as any)}</h2>
              <p className="text-lg text-slate-500 font-medium">{t('landing.audience.subtitle' as any)}</p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {/* Perfect For */}
              <div className="bg-emerald-50/50 rounded-[2rem] p-8 lg:p-10 border border-emerald-100 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform"></div>
                <h3 className="text-2xl font-black text-emerald-900 mb-8 flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  {t('landing.audience.for_title' as any)}
                </h3>
                <ul className="space-y-4">
                  {(t('landing.audience.for_items' as any) as unknown as string[]).map((item, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0"></div>
                      <span className="text-slate-700 font-bold text-lg leading-tight">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Not Ideal For */}
              <div className="bg-slate-50 rounded-[2rem] p-8 lg:p-10 border border-slate-200 relative overflow-hidden group">
                <h3 className="text-2xl font-black text-slate-900 mb-8 flex items-center gap-3">
                  <div className="w-10 h-10 bg-slate-400 rounded-xl flex items-center justify-center text-white shadow-lg">
                    <X className="w-6 h-6" />
                  </div>
                  {t('landing.audience.not_for_title' as any)}
                </h3>
                <ul className="space-y-4 opacity-70">
                  {(t('landing.audience.not_for_items' as any) as unknown as string[]).map((item, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-slate-400 flex-shrink-0"></div>
                      <span className="text-slate-600 font-medium text-lg leading-tight">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        <FounderNote />

        {/* Pricing Section */}
        <section id="pricing" className="py-24 bg-slate-900 text-white relative overflow-hidden">
          <div className="container px-4 mx-auto relative z-10">
            <div className="text-center max-w-3xl mx-auto mb-20">
              <h2 className="text-3xl lg:text-4xl font-bold mb-6">{t('landing.pricing.title')}</h2>
              <p className="text-lg text-slate-400">
                {t('landing.pricing.subtitle')}
              </p>
            </div>

            <div className="grid lg:grid-cols-3 gap-8 max-w-[1200px] mx-auto">
              {/* Free Tier */}
              <div className="bg-slate-950 rounded-[2.5rem] p-8 border border-slate-800 hover:border-slate-700 transition-colors flex flex-col shadow-2xl">
                <div className="mb-8">
                  <h3 className="text-xl font-black text-white mb-2">{t('landing.pricing.free.title')}</h3>
                  <div className="flex items-baseline">
                    <span className="text-4xl font-black text-white">{t('landing.pricing.free.price')}</span>
                  </div>
                  <p className="text-slate-500 mt-4 text-sm font-medium leading-relaxed">{t('landing.pricing.free.desc')}</p>
                </div>
                <ul className="space-y-4 mb-8 flex-1">
                  <li className="flex items-center gap-3 text-sm text-slate-300">
                    <CheckCircle2 className="w-5 h-5 text-blue-500" /> {t('landing.pricing.free.f1')}
                  </li>
                  <li className="flex items-center gap-3 text-sm text-slate-300">
                    <CheckCircle2 className="w-5 h-5 text-blue-500" /> {t('landing.pricing.free.f2')}
                  </li>
                  <li className="flex items-center gap-3 text-sm text-slate-300">
                    <CheckCircle2 className="w-5 h-5 text-blue-500" /> {t('landing.pricing.free.f3')}
                  </li>
                  <li className="flex items-center gap-3 text-sm text-slate-300">
                    <CheckCircle2 className="w-5 h-5 text-blue-500" /> {t('landing.pricing.free.f4')}
                  </li>
                </ul>
                <Link href="/builder" className="w-full py-4 rounded-xl bg-white text-slate-900 font-black text-center transition-all hover:bg-slate-100 shadow-xl">
                  {t('landing.pricing.free.cta')}
                </Link>
              </div>

              {/* Starter Review */}
              <div className="bg-blue-600 rounded-[2.5rem] p-8 border-2 border-blue-400 shadow-2xl relative flex flex-col transform lg:scale-110 z-10">
                <div className="absolute top-0 right-0 bg-yellow-400 text-slate-900 text-[10px] font-black px-4 py-1.5 rounded-bl-2xl uppercase tracking-[0.2em]">
                  {t('landing.pricing.starter.badge')}
                </div>
                <div className="mb-8 pt-4">
                  <h3 className="text-xl font-black text-white mb-2">{t('landing.pricing.starter.title')}</h3>
                  <div className="flex items-baseline">
                    <span className="text-5xl font-black text-white">{t('landing.pricing.starter.price')}</span>
                    <span className="text-blue-200 ml-2 font-bold">+ VAT</span>
                  </div>
                  <p className="text-blue-100 mt-4 text-sm font-medium">{t('landing.pricing.starter.desc')}</p>
                </div>
                <ul className="space-y-4 mb-8 flex-1">
                  <li className="flex items-center gap-3 text-sm font-bold text-white">
                    <CheckCircle2 className="w-5 h-5 text-blue-200" /> {t('landing.pricing.starter.f1')}
                  </li>
                  <li className="flex items-center gap-3 text-sm text-white font-bold">
                    <CheckCircle2 className="w-5 h-5 text-blue-200" /> {t('landing.pricing.starter.f2')}
                  </li>
                  <li className="flex items-center gap-3 text-sm text-white font-bold">
                    <CheckCircle2 className="w-5 h-5 text-blue-200" /> {t('landing.pricing.starter.f3')}
                  </li>
                  <li className="flex items-center gap-3 text-sm text-white font-bold">
                    <CheckCircle2 className="w-5 h-5 text-blue-200" /> {t('landing.pricing.starter.f4')}
                  </li>
                </ul>
                <Link href="/builder" className="w-full py-4 rounded-xl bg-white text-blue-600 hover:bg-blue-50 font-black text-center transition-all shadow-xl">
                  {t('landing.pricing.starter.cta')}
                </Link>
              </div>

              {/* Expert Review (New Card) */}
              <div className="bg-slate-900 rounded-[2.5rem] p-8 border border-slate-700 hover:border-slate-600 transition-all flex flex-col shadow-lg">
                <div className="mb-8">
                  <h3 className="text-xl font-black text-white mb-2">{t('landing.pricing.review.title')}</h3>
                  <div className="flex items-baseline">
                    <span className="text-4xl font-black text-white">{t('landing.pricing.review.price')}</span>
                    <span className="text-slate-400 ml-2 font-bold">+ VAT</span>
                  </div>
                  <p className="text-slate-400 mt-4 text-sm font-medium leading-relaxed">{t('landing.pricing.review.desc')}</p>
                </div>
                <ul className="space-y-4 mb-8 flex-1">
                  <li className="flex items-center gap-3 text-sm text-slate-300 font-medium">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" /> <strong>{t('landing.pricing.review.f1')}</strong>
                  </li>
                  <li className="flex items-center gap-3 text-sm text-slate-300 font-medium">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" /> {t('landing.pricing.review.f2')}
                  </li>
                  <li className="flex items-center gap-3 text-sm text-slate-300 font-medium">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" /> {t('landing.pricing.review.f3')}
                  </li>
                  <li className="flex items-center gap-3 text-sm text-slate-300 font-medium">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" /> {t('landing.pricing.review.f4')}
                  </li>
                </ul>
                <Link href="/contact?subject=Review" className="w-full py-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-black text-center transition-all border border-slate-700">
                  {t('landing.pricing.review.cta')}
                </Link>
                <p className="text-center text-xs text-slate-500 mt-4 px-2 leading-tight">
                  Reviews are advisory and do not replace official audits or approvals.
                </p>
              </div>
            </div>
          </div>
        </section>

        <HowItWorks />
        <BlogPreview />

        {/* Final CTA */}
        <section className="py-24 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-center">
          <div className="container px-4 mx-auto max-w-4xl">
            <h2 className="text-4xl font-bold mb-8">{t('landing.finalCta.title')}</h2>
            <Link href="/builder" className="inline-block bg-white text-blue-600 px-10 py-5 rounded-full text-xl font-bold shadow-2xl hover:scale-105 transition-transform">
              {t('landing.finalCta.btn')}
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
