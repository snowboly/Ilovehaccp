"use client";

import { useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Send, Loader2, CheckCircle2 } from 'lucide-react';
import { useLanguage } from '@/lib/i18n';

export default function Newsletter() {
  const { language } = useLanguage();
  const copy = NEWSLETTER_COPY[language] ?? NEWSLETTER_COPY.en;
  const supabase = createClient();
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setStatus('loading');
    
    try {
      const { error } = await supabase
        .from('subscribers')
        .insert([{ email }]);

      if (error && error.code !== '23505') { // Ignore duplicate email errors
        throw error;
      }
      
      setStatus('success');
      setEmail('');
    } catch (err) {
      console.error('Newsletter error:', err);
      setStatus('error');
    }
  };

  return (
    <section className="py-24 bg-white border-t border-slate-100">
      <div className="container px-4 mx-auto">
        <div className="max-w-4xl mx-auto bg-slate-900 rounded-[32px] p-8 md:p-16 relative overflow-hidden shadow-2xl">
          {/* Abstract background elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600 rounded-full blur-[120px] opacity-20 -translate-y-1/2 translate-x-1/2"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-600 rounded-full blur-[120px] opacity-20 translate-y-1/2 -translate-x-1/2"></div>

          <div className="relative z-10 grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-4">
              <h2 className="text-3xl md:text-4xl font-bold text-white leading-tight">
                {copy.title} <br />
                <span className="text-blue-400">{copy.titleAccent}</span>
              </h2>
              <p className="text-slate-400 text-lg">
                {copy.subtitle}
              </p>
            </div>

            <div>
              {status === 'success' ? (
                <div className="bg-white/5 border border-white/10 p-8 rounded-2xl text-center space-y-4 animate-in fade-in zoom-in duration-500">
                  <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-8 h-8 text-green-400" />
                  </div>
                  <h3 className="text-white font-bold text-xl">{copy.successTitle}</h3>
                  <p className="text-slate-400">{copy.successSubtitle}</p>
                  <button 
                    onClick={() => setStatus('idle')}
                    className="text-blue-400 text-sm font-medium hover:underline"
                  >
                    {copy.addAnother}
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="relative">
                    <input 
                      type="email" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={copy.placeholder}
                      className="w-full bg-white/5 border border-white/10 text-white rounded-2xl px-6 py-5 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-lg placeholder:text-slate-500"
                      required
                    />
                    <button 
                      type="submit"
                      disabled={status === 'loading'}
                      className="absolute right-2 top-2 bottom-2 bg-blue-600 hover:bg-blue-700 text-white px-8 rounded-xl font-bold transition-all flex items-center gap-2 disabled:opacity-50"
                    >
                      {status === 'loading' ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <>
                          {copy.subscribe} <Send className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </div>
                  <p className="text-xs text-slate-500 text-center">
                    {copy.disclaimer} <a href="/privacy" className="underline">{copy.privacyPolicy}</a>.
                  </p>
                  {status === 'error' && (
                    <p className="text-red-400 text-sm text-center">{copy.error}</p>
                  )}
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

const NEWSLETTER_COPY: Record<string, {
  title: string;
  titleAccent: string;
  subtitle: string;
  successTitle: string;
  successSubtitle: string;
  addAnother: string;
  placeholder: string;
  subscribe: string;
  disclaimer: string;
  privacyPolicy: string;
  error: string;
}> = {
  en: {
    title: 'Stay updated on',
    titleAccent: 'Food Safety Insights.',
    subtitle: 'Join 2,000+ food professionals receiving our bi-weekly compliance newsletter.',
    successTitle: "You're on the list!",
    successSubtitle: 'Check your inbox for your first guide soon.',
    addAnother: 'Add another email',
    placeholder: 'you@company.com',
    subscribe: 'Subscribe',
    disclaimer: 'No spam. Unsubscribe at any time. Read our',
    privacyPolicy: 'Privacy Policy',
    error: 'Something went wrong. Please try again.'
  },
  de: {
    title: 'Bleiben Sie auf dem Laufenden zu',
    titleAccent: 'Lebensmittelsicherheits‑Insights.',
    subtitle: 'Schließen Sie sich 2.000+ Fachleuten an, die unseren 14‑tägigen Newsletter erhalten.',
    successTitle: 'Sie sind dabei!',
    successSubtitle: 'Schauen Sie bald in Ihr Postfach für den ersten Leitfaden.',
    addAnother: 'Weitere E‑Mail hinzufügen',
    placeholder: 'du@firma.com',
    subscribe: 'Abonnieren',
    disclaimer: 'Kein Spam. Abmeldung jederzeit möglich. Lesen Sie unsere',
    privacyPolicy: 'Datenschutzerklärung',
    error: 'Etwas ist schiefgelaufen. Bitte erneut versuchen.'
  },
  it: {
    title: 'Rimani aggiornato su',
    titleAccent: 'insight di sicurezza alimentare.',
    subtitle: 'Unisciti a oltre 2.000 professionisti che ricevono la nostra newsletter quindicinale.',
    successTitle: 'Sei nella lista!',
    successSubtitle: 'Controlla la posta per la tua prima guida.',
    addAnother: 'Aggiungi un’altra email',
    placeholder: 'tu@azienda.com',
    subscribe: 'Iscriviti',
    disclaimer: 'Niente spam. Disiscrizione in qualsiasi momento. Leggi la nostra',
    privacyPolicy: 'Privacy Policy',
    error: 'Qualcosa è andato storto. Riprova.'
  },
  lt: {
    title: 'Būkite informuoti apie',
    titleAccent: 'maisto saugos įžvalgas.',
    subtitle: 'Prisijunkite prie 2 000+ specialistų, gaunančių dviejų savaičių naujienlaiškį.',
    successTitle: 'Jūs sąraše!',
    successSubtitle: 'Patikrinkite el. paštą dėl pirmojo gido.',
    addAnother: 'Pridėti kitą el. paštą',
    placeholder: 'jūs@įmonė.lt',
    subscribe: 'Prenumeruoti',
    disclaimer: 'Jokio šlamšto. Atsisakyti bet kada. Skaitykite mūsų',
    privacyPolicy: 'Privatumo politiką',
    error: 'Įvyko klaida. Bandykite dar kartą.'
  }
};
