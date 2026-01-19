"use client";

import { useState } from 'react';
import { Download, CheckCircle2, Loader2, FileText } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';

export default function LeadMagnet() {
  const supabase = createClient();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleDownload = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Capture Lead
      const { error } = await supabase.from('leads').insert({
        email: email,
        business_name: 'Lead Magnet: 2026 Checklist', // Tag the source here
        plan_id: null // Explicitly null as this isn't linked to a generated plan UUID
      });

      if (error) throw error;

      // 2. Deliver Asset
      const emailRes = await fetch('/api/send-lead-magnet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      if (!emailRes.ok) console.error("Failed to send email");

      setSuccess(true);
      setEmail('');
      
      // Optional: Trigger a real download here if we host a file
      // window.open('/assets/2026-inspection-checklist.pdf', '_blank');

    } catch (err) {
      console.error(err);
      alert("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="py-24 bg-gradient-to-br from-slate-900 to-blue-900 text-white overflow-hidden relative">
      {/* Background Decoration */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -ml-20 -mb-20"></div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-[2.5rem] p-8 lg:p-12 max-w-5xl mx-auto flex flex-col lg:flex-row items-center gap-12 shadow-2xl">
          
          {/* Content */}
          <div className="flex-1 space-y-6">
            <div className="inline-flex items-center gap-2 bg-blue-500/20 text-blue-200 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider border border-blue-500/30">
              <FileText className="w-3 h-3" /> Free Resource
            </div>
            <h2 className="text-3xl lg:text-4xl font-black leading-tight">
              Don't Let the Inspector Catch You Off Guard.
            </h2>
            <p className="text-lg text-blue-100/80 font-medium leading-relaxed">
              Get our exclusive <strong>2026 Food Safety Inspection Checklist</strong>. It covers the 10 most common violations found in modern audits and how to fix them instantly.
            </p>
            <ul className="space-y-3">
              {[
                "The 'Hidden' Fridge Danger Zones",
                "New Allergen Labeling Requirements",
                "Sanitization Log Templates"
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-3 text-sm font-bold text-white">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" /> {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Form Card */}
          <div className="w-full lg:w-96 bg-white p-8 rounded-3xl shadow-xl text-slate-900">
            {!success ? (
              <form onSubmit={handleDownload} className="space-y-4">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 text-2xl font-black shadow-inner">
                    <Download className="w-8 h-8" />
                  </div>
                  <h3 className="font-bold text-xl">Download for Free</h3>
                  <p className="text-sm text-slate-500">Instant PDF Access</p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Work Email</label>
                  <input 
                    type="email" 
                    required
                    placeholder="chef@kitchen.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-medium outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  />
                </div>

                <button 
                  type="submit" 
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-4 rounded-xl shadow-lg shadow-blue-600/20 transition-all flex items-center justify-center gap-2 group"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                    <>
                      Get the Checklist <Download className="w-5 h-5 group-hover:translate-y-1 transition-transform" />
                    </>
                  )}
                </button>
                <p className="text-[10px] text-center text-slate-400 font-medium">
                  We respect your inbox. Unsubscribe anytime.
                </p>
              </form>
            ) : (
              <div className="text-center py-8 space-y-6">
                <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto animate-in zoom-in duration-300">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-slate-900 mb-2">You're All Set!</h3>
                  <p className="text-slate-500 font-medium">Check your inbox for the download link.</p>
                </div>
                <button 
                  onClick={() => setSuccess(false)}
                  className="text-sm text-blue-600 font-bold hover:underline"
                >
                  Download again
                </button>
              </div>
            )}
          </div>

        </div>
      </div>
    </section>
  );
}
