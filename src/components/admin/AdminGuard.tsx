"use client";

import { useEffect, useState, useMemo, useRef } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

interface AdminGuardProps {
  children: React.ReactNode;
}

export default function AdminGuard({ children }: AdminGuardProps) {
  const [authorized, setAuthorized] = useState(false);
  const [checking, setChecking] = useState(true);
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const resolved = useRef(false);

  useEffect(() => {
    let mounted = true;
    let authSubscription: any = null;

    async function checkUser(session: any) {
      if (resolved.current || !mounted) return;
      resolved.current = true;

      // Stop listening immediately once auth is decided
      if (authSubscription) {
        authSubscription.unsubscribe();
        authSubscription = null;
      }

      if (!session?.user) {
        if (mounted) {
          router.replace('/login');
          setChecking(false);
        }
        return;
      }

      try {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .single();

        if (mounted) {
          if (!error && profile?.role === 'admin') {
            setAuthorized(true);
          } else {
            router.replace('/dashboard');
          }
          setChecking(false);
        }
      } catch (err) {
        if (mounted) {
          router.replace('/dashboard');
          setChecking(false);
        }
      }
    }

    // 1. Initial check (fastest path)
    supabase.auth.getSession().then(({ data: { session } }) => {
      checkUser(session);
    });

    // 2. Listen for hydration/auth changes
    const { data } = supabase.auth.onAuthStateChange(async (_event, session) => {
      checkUser(session);
    });
    authSubscription = data.subscription;

    return () => {
      mounted = false;
      if (authSubscription) {
        authSubscription.unsubscribe();
      }
    };
  }, [router, supabase]);

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
      </div>
    );
  }

  if (!authorized) {
    return null;
  }

  return <>{children}</>;
}