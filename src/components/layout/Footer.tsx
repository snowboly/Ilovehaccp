"use client";

import Link from 'next/link';
import { ShieldCheck } from 'lucide-react';
import { useLanguage } from '@/lib/i18n';

export default function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="bg-slate-950 text-slate-400 py-16 border-t border-slate-900">
      <div className="container px-4 mx-auto grid md:grid-cols-4 gap-12 mb-12">
        <div className="space-y-4">
          <Link href="/" className="flex items-center gap-2 text-white">
            <ShieldCheck className="h-6 w-6 text-blue-500" />
            <span className="text-xl font-bold">ilovehaccp.com</span>
          </Link>
          <p className="text-sm leading-relaxed">
            The world's most advanced AI-powered food safety platform. Helping businesses achieve compliance effortlessly.
          </p>
        </div>
        <div>
          <h4 className="text-white font-bold mb-4">{t('nav.builder')}</h4>
          <ul className="space-y-2 text-sm">
            <li><Link href="/builder" className="hover:text-blue-400 transition-colors">HACCP Builder</Link></li>
            <li><Link href="/#pricing" className="hover:text-blue-400 transition-colors">{t('nav.pricing')}</Link></li>
            <li><Link href="/#features" className="hover:text-blue-400 transition-colors">{t('nav.features')}</Link></li>
            <li><Link href="/login" className="hover:text-blue-400 transition-colors">{t('nav.login')}</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-white font-bold mb-4">{t('nav.resources')}</h4>
          <ul className="space-y-2 text-sm">
            <li><Link href="/resources" className="hover:text-blue-400 transition-colors">Knowledge Base</Link></li>
            <li><Link href="/resources" className="hover:text-blue-400 transition-colors">Scientific Articles</Link></li>
            <li><Link href="/resources" className="hover:text-blue-400 transition-colors">FAQs</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-white font-bold mb-4">Support</h4>
          <ul className="space-y-2 text-sm">
            <li><Link href="/contact" className="hover:text-blue-400 transition-colors">Contact Us</Link></li>
            <li><Link href="/privacy" className="hover:text-blue-400 transition-colors">Privacy Policy</Link></li>
            <li><Link href="/terms" className="hover:text-blue-400 transition-colors">Terms of Service</Link></li>
            <li><Link href="/refund-policy" className="hover:text-blue-400 transition-colors">Refund Policy</Link></li>
            <li><Link href="/cookies" className="hover:text-blue-400 transition-colors">Cookie Policy</Link></li>
          </ul>
        </div>
      </div>
      <div className="container px-4 mx-auto text-center text-xs border-t border-slate-900 pt-8">
        <p>© 2025 ilovehaccp.com. All rights reserved. Not legal advice.</p>
      </div>
    </footer>
  );
}
