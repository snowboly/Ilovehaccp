"use client";

import { Mail, Send, Loader2, CheckCircle2 } from 'lucide-react';
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';

function ContactForm() {
  const supabase = createClient();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedSubject, setSelectedSubject] = useState('General Inquiry');

  useEffect(() => {
    const sub = searchParams.get('subject');
    if (sub === 'Review') setSelectedSubject('Plan Review');
    else if (sub === 'Enterprise') setSelectedSubject('Enterprise / Custom Plan');
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get('name'),
      email: formData.get('email'),
      subject: formData.get('subject'),
      message: formData.get('message'),
    };

    try {
      const { error: submitError } = await supabase
        .from('contact_messages')
        .insert([data]);

      if (submitError) throw submitError;

      // Notify owner via email (don't block UI if it fails)
      fetch('/api/send-contact-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      }).catch(console.error);

      setSent(true);
    } catch (err: any) {
      console.error('Contact error:', err);
      setError('Failed to send message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border p-8">
      {sent ? (
        <div className="h-full flex flex-col items-center justify-center text-center py-12">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <CheckCircle2 className="w-8 h-8 text-green-600" />
          </div>
          <h3 className="text-2xl font-bold text-slate-900">Message Sent!</h3>
          <p className="text-slate-500 mt-2">We&apos;ll get back to you within 24 hours.</p>
          <button 
            onClick={() => setSent(false)}
            className="mt-6 text-blue-600 font-medium hover:underline"
          >
            Send another message
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg">
              {error}
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Name</label>
            <input name="name" type="text" required className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="John Doe" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Email</label>
            <input name="email" type="email" required className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="you@company.com" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Subject</label>
            <select 
              name="subject" 
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option>General Inquiry</option>
              <option>Plan Review</option>
              <option>Enterprise / Custom Plan</option>
              <option>Technical Support</option>
              <option>Partnership</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Message</label>
            <textarea name="message" required rows={4} className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="How can we help you?" />
          </div>
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Send Message <Send className="w-4 h-4" /></>}
          </button>
        </form>
      )}
    </div>
  );
}

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-slate-900">Get in Touch</h1>
          <p className="mt-4 text-lg text-slate-500">
            Questions about our Enterprise plans or need audit support? We&apos;re here to help.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Contact Info */}
          <div className="space-y-8">
            <div className="bg-white rounded-2xl shadow-sm border p-8">
              <h3 className="text-lg font-bold text-slate-900 mb-6">Contact Information</h3>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <Mail className="w-6 h-6 text-blue-600" />
                  <div>
                    <p className="font-medium text-slate-900">Email</p>
                    <p className="text-slate-500">support@ilovehaccp.com</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <Suspense fallback={<div className="bg-white rounded-2xl shadow-sm border p-8 h-96 animate-pulse" />}>
            <ContactForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
