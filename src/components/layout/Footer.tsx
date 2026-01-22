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
            The world&apos;s most advanced food safety documentation platform. Helping businesses simplify their paperwork.
          </p>
        </div>
        <div>
          <h4 className="text-white font-bold mb-4 uppercase text-xs tracking-widest">Platform</h4>
          <ul className="space-y-2 text-sm font-medium">
            <li><Link href="/builder" className="hover:text-blue-400 transition-colors">HACCP Builder</Link></li>
            <li><Link href="/#pricing" className="hover:text-blue-400 transition-colors">{t('nav.pricing')}</Link></li>
            <li><Link href="/login" className="hover:text-blue-400 transition-colors">{t('nav.login')}</Link></li>
            <li><Link href="/signup" className="hover:text-blue-400 transition-colors">Create Account</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-white font-bold mb-4 uppercase text-xs tracking-widest">Resources</h4>
          <ul className="space-y-2 text-sm font-medium">
            <li><Link href="/requirements-eu-uk" className="hover:text-blue-400 transition-colors text-emerald-400">EU & UK Requirements</Link></li>
            <li><Link href="/resources" className="hover:text-blue-400 transition-colors">Knowledge Base</Link></li>
            <li><Link href="/faqs" className="hover:text-blue-400 transition-colors">Compliance FAQs</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-white font-bold mb-4 uppercase text-xs tracking-widest">Company & Legal</h4>
          <ul className="space-y-2 text-sm font-medium">
            <li><Link href="/about" className="hover:text-blue-400 transition-colors">{t('nav.about')}</Link></li>
            <li><Link href="/contact" className="hover:text-blue-400 transition-colors">Contact Support</Link></li>
            <li><Link href="/privacy" className="hover:text-blue-400 transition-colors">Privacy Policy</Link></li>
            <li><Link href="/terms" className="hover:text-blue-400 transition-colors">Terms of Service</Link></li>
            <li><Link href="/cookies" className="hover:text-blue-400 transition-colors">Cookie Policy</Link></li>
            <li><Link href="/refund-policy" className="hover:text-blue-400 transition-colors">Refund Policy</Link></li>
          </ul>
        </div>
      </div>
      {/* Copyright */}
      <div className="container px-4 mx-auto text-center text-xs border-t border-slate-900 pt-8 space-y-2">
        <p className="text-slate-500">&copy; {new Date().getFullYear()} iLoveHACCP.com. All rights reserved.</p>
        <p className="text-slate-600 max-w-2xl mx-auto leading-relaxed opacity-60">
          Disclaimer: iLoveHACCP provides software tools for documentation purposes only. While our templates are guided by EC Regulation 852/2004 principles, we are not a law firm, regulatory body, or certification agency. Use of this platform does not guarantee inspection approval. Always verify your final plan with your local health authority or an Environmental Health Officer.
        </p>
      </div>
    </footer>
  );
}
