"use client";

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import Link from 'next/link';

export default function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cookie-consent');
    if (!consent) {
      setTimeout(() => setIsVisible(true), 0);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookie-consent', 'accepted');
    setIsVisible(false);
  };

  const handleDecline = () => {
    localStorage.setItem('cookie-consent', 'necessary-only');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-slate-900 text-white p-4 z-50 shadow-2xl border-t border-slate-700 animate-in slide-in-from-bottom duration-500">
      <div className="container mx-auto max-w-6xl flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="text-sm text-slate-300 flex-1">
          <p>
            <strong>We value your privacy.</strong> We use cookies to enhance your experience, remember your progress, and analyze traffic. 
            By clicking &quot;Accept&quot;, you consent to our use of cookies. 
            See our <Link href="/cookies" className="text-blue-400 hover:underline">Cookie Policy</Link>.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={handleDecline}
            className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white transition-colors"
          >
            Necessary Only
          </button>
          <button 
            onClick={handleAccept}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg text-sm font-bold transition-all shadow-lg shadow-blue-500/20"
          >
            Accept All
          </button>
        </div>
      </div>
    </div>
  );
}