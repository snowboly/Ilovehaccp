"use client";

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Send, Loader2, CheckCircle2 } from 'lucide-react';

export default function Newsletter() {
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
                Stay updated on <br />
                <span className="text-blue-400">Food Safety AI.</span>
              </h2>
              <p className="text-slate-400 text-lg">
                Join 2,000+ food professionals receiving our bi-weekly compliance newsletter.
              </p>
            </div>

            <div>
              {status === 'success' ? (
                <div className="bg-white/5 border border-white/10 p-8 rounded-2xl text-center space-y-4 animate-in fade-in zoom-in duration-500">
                  <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-8 h-8 text-green-400" />
                  </div>
                  <h3 className="text-white font-bold text-xl">You're on the list!</h3>
                  <p className="text-slate-400">Check your inbox for your first guide soon.</p>
                  <button 
                    onClick={() => setStatus('idle')}
                    className="text-blue-400 text-sm font-medium hover:underline"
                  >
                    Add another email
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="relative">
                    <input 
                      type="email" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@company.com" 
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
                          Subscribe <Send className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </div>
                  <p className="text-xs text-slate-500 text-center">
                    No spam. Unsubscribe at any time. Read our <a href="/privacy" className="underline">Privacy Policy</a>.
                  </p>
                  {status === 'error' && (
                    <p className="text-red-400 text-sm text-center">Something went wrong. Please try again.</p>
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