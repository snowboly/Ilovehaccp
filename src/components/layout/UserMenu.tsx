"use client";

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { User, LogOut, LayoutDashboard, Settings, ChevronDown } from 'lucide-react';

export default function UserMenu({ mobile = false }: { mobile?: boolean }) {
  const supabase = createClient();
  const [user, setUser] = useState<any>(null);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    // Check initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
    setIsOpen(false);
  };

  if (!user) {
    if (mobile) {
      return (
        <div className="flex flex-col gap-4">
            <Link 
              href="/login"
              className="text-base font-bold text-slate-600 py-2"
            >
              Log in
            </Link>
            <Link
              href="/signup"
              className="bg-blue-600 text-white px-5 py-3 rounded-xl font-bold text-center shadow-lg shadow-blue-500/20"
            >
              Get Started
            </Link>
        </div>
      );
    }
    return (
      <>
        <Link 
          href="/login"
          className="text-sm font-bold text-slate-600 hover:text-blue-600 transition-colors"
        >
          Log in
        </Link>
        <Link
          href="/signup"
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-all shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 hover:-translate-y-0.5"
        >
          Get Started
        </Link>
      </>
    );
  }

  const initial = user.email ? user.email[0].toUpperCase() : 'U';

  if (mobile) {
      return (
          <div className="border-t border-slate-100 pt-4 space-y-4">
              <div className="flex items-center gap-3 px-2">
                  <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-black text-lg">
                      {initial}
                  </div>
                  <div className="overflow-hidden">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Signed in as</p>
                      <p className="text-sm font-bold text-slate-900 truncate">{user.email}</p>
                  </div>
              </div>
              <div className="flex flex-col gap-2">
                  <Link href="/dashboard" className="flex items-center gap-3 px-4 py-3 bg-blue-50 text-blue-700 rounded-xl font-bold">
                      <LayoutDashboard className="w-4 h-4" /> Dashboard
                  </Link>
                  <Link href="/dashboard/settings" className="flex items-center gap-3 px-4 py-3 text-slate-600 font-bold hover:bg-slate-50 rounded-xl">
                      <Settings className="w-4 h-4" /> Settings
                  </Link>
                  <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 text-red-500 font-bold hover:bg-red-50 rounded-xl text-left">
                      <LogOut className="w-4 h-4" /> Log Out
                  </button>
              </div>
          </div>
      );
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 group outline-none"
      >
        <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-black text-lg border-2 border-transparent group-hover:border-blue-200 transition-all">
          {initial}
        </div>
        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-[120%] right-0 w-64 bg-white border border-slate-100 rounded-2xl shadow-2xl p-2 z-[60] animate-in fade-in zoom-in duration-200 origin-top-right">
          <div className="px-4 py-3 border-b border-slate-50 mb-1">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Signed in as</p>
            <p className="text-sm font-bold text-slate-900 truncate">{user.email}</p>
          </div>
          
          <Link 
            href="/dashboard" 
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-slate-600 hover:bg-blue-50 hover:text-blue-600 rounded-xl transition-colors"
          >
            <LayoutDashboard className="w-4 h-4" />
            Dashboard
          </Link>
          
          <Link 
            href="/dashboard/settings" 
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-slate-600 hover:bg-slate-50 hover:text-slate-900 rounded-xl transition-colors"
          >
            <Settings className="w-4 h-4" />
            Settings
          </Link>
          
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-red-500 hover:bg-red-50 rounded-xl transition-colors mt-1"
          >
            <LogOut className="w-4 h-4" />
            Log Out
          </button>
        </div>
      )}
    </div>
  );
}