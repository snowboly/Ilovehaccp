"use client";

import Link from 'next/link';
import { ShieldCheck, Heart } from 'lucide-react';
import { useLanguage } from '@/lib/i18n';

export default function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="bg-slate-950 text-slate-400 py-16 border-t border-slate-900">
      <div className="container px-4 mx-auto grid md:grid-cols-4 gap-12 mb-12">
        <div className="space-y-4">
          <Link href="/" className="flex items-center gap-1.5 group">
            <span className="text-2xl font-black text-white tracking-tight">i</span>
            <Heart className="w-6 h-6 text-rose-600 fill-rose-600 group-hover:scale-110 transition-transform" />
            <span className="text-2xl font-black text-white tracking-tight">HACCP</span>
          </Link>
          <p className="text-sm leading-relaxed">
            {t('footer.description')}
          </p>
        </div>
        <div>
          <h4 className="text-white font-bold mb-4 uppercase text-xs tracking-widest">{t('footer.platform')}</h4>
          <ul className="space-y-2 text-sm font-medium">
            <li><Link href="/builder" className="hover:text-blue-400 transition-colors">{t('footer.haccpBuilder')}</Link></li>
            <li><Link href="/#pricing" className="hover:text-blue-400 transition-colors">{t('nav.pricing')}</Link></li>
            <li><Link href="/login" className="hover:text-blue-400 transition-colors">{t('nav.login')}</Link></li>
            <li><Link href="/signup" className="hover:text-blue-400 transition-colors">{t('nav.createAccount')}</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-white font-bold mb-4 uppercase text-xs tracking-widest">{t('footer.resourcesTitle')}</h4>
          <ul className="space-y-2 text-sm font-medium">
            <li><Link href="/sample-haccp-plan-pdf" className="hover:text-blue-400 transition-colors text-emerald-400">{t('footer.haccpExamplePdf')}</Link></li>
            <li><Link href="/haccp-template" className="hover:text-blue-400 transition-colors">{t('footer.haccpTemplate')}</Link></li>
            <li><Link href="/requirements-eu-uk" className="hover:text-blue-400 transition-colors">{t('footer.euUkRequirements')}</Link></li>
            <li><Link href="/resources" className="hover:text-blue-400 transition-colors">{t('footer.knowledgeBase')}</Link></li>
            <li><Link href="/faqs" className="hover:text-blue-400 transition-colors">{t('footer.complianceFaqs')}</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-white font-bold mb-4 uppercase text-xs tracking-widest">{t('footer.companyLegal')}</h4>
          <ul className="space-y-2 text-sm font-medium">
            <li><Link href="/about" className="hover:text-blue-400 transition-colors">{t('nav.about')}</Link></li>
            <li><Link href="/contact" className="hover:text-blue-400 transition-colors">{t('footer.contactSupport')}</Link></li>
            <li><Link href="/privacy" className="hover:text-blue-400 transition-colors">{t('footer.privacyPolicy')}</Link></li>
            <li><Link href="/terms" className="hover:text-blue-400 transition-colors">{t('footer.termsOfService')}</Link></li>
            <li><Link href="/cookies" className="hover:text-blue-400 transition-colors">{t('footer.cookiePolicy')}</Link></li>
            <li><Link href="/refund-policy" className="hover:text-blue-400 transition-colors">{t('footer.refundPolicy')}</Link></li>
          </ul>
        </div>
      </div>
      {/* Copyright */}
      <div className={`container px-4 mx-auto text-center text-xs border-t border-slate-900 p${'t-8'} space-y-2`}>
        <p className="text-slate-500">&copy; {new Date().getFullYear()} iLoveHACCP.com. {t('footer.allRightsReserved')}</p>
        <p className="text-slate-600 max-w-2xl mx-auto leading-relaxed opacity-60">
          {t('footer.disclaimer')}
        </p>
      </div>
    </footer>
  );
}
