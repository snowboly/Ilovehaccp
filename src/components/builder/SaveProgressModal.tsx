"use client";

import { useState } from 'react';
import { X, Mail, CheckCircle2, Loader2 } from 'lucide-react';

interface SaveProgressModalProps {
  isOpen: boolean;
  onClose: () => void;
  draftId: string;
}

export function SaveProgressModal({ isOpen, onClose, draftId }: SaveProgressModalProps) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('sending');
    try {
      const res = await fetch('/api/send-draft-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, draftId })
      });
      if (!res.ok) throw new Error();
      setStatus('success');
      setTimeout(onClose, 3000);
    } catch {
      setStatus('error');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl animate-in fade-in zoom-in duration-200">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-slate-900">Save Progress</h3>
          <button onClick={onClose}><X className="w-5 h-5 text-slate-400 hover:text-slate-600" /></button>
        </div>

        {status === 'success' ? (
          <div className="text-center py-6">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
            <p className="font-medium text-emerald-900">Link sent! Check your inbox.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <p className="text-sm text-slate-500 mb-4">
              We'll send you a magic link so you can resume this plan later on any device.
            </p>
            <div className="space-y-3">
              <input 
                type="email" 
                required 
                placeholder="name@company.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              />
              <button 
                type="submit" 
                disabled={status === 'sending'}
                className="w-full bg-blue-600 text-white rounded-lg py-2 text-sm font-bold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
              >
                {status === 'sending' ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Mail className="w-4 h-4" /> Send Link</>}
              </button>
            </div>
            {status === 'error' && <p className="text-xs text-red-500 mt-2 text-center">Failed to send. Please try again.</p>}
          </form>
        )}
      </div>
    </div>
  );
}
