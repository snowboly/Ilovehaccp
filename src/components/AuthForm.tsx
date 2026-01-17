"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2, ShieldCheck, AlertCircle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface AuthFormProps {
  type: 'login' | 'signup';
}

export default function AuthForm({ type: initialType }: AuthFormProps) {
  const [view, setView] = useState<'login' | 'signup' | 'forgot_password'>(initialType);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get('next');

  // Auto-redirect if email confirmation link logs the user in automatically
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        router.push(next || '/dashboard');
      }
    });

    return () => subscription.unsubscribe();
  }, [router, next]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (view === 'signup') {
        const origin = window.location.origin;
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${origin}/login${next ? `?next=${encodeURIComponent(next)}` : ''}`,
          },
        });
        if (error) throw error;
        setSuccessMessage(`We've sent a confirmation link to ${email}. Please check your inbox.`);
      } else if (view === 'login') {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        router.push(next || '/dashboard');
      } else if (view === 'forgot_password') {
        const origin = window.location.origin;
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${origin}/update-password`,
        });
        if (error) throw error;
        setSuccessMessage(`We've sent a password reset link to ${email}.`);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (successMessage) {
    return (
      <div className="w-full max-w-md mx-auto p-8 bg-white rounded-xl shadow-sm border text-center">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center">
            <ShieldCheck className="h-8 w-8 text-blue-600" />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Check your inbox</h2>
        <p className="text-gray-600 mb-8 leading-relaxed">
          {successMessage}
        </p>
        <button onClick={() => { setView('login'); setSuccessMessage(null); }} className="text-blue-600 font-bold hover:underline">
          Return to Login
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto p-8 bg-white rounded-xl shadow-sm border">
      <div className="flex flex-col items-center mb-8">
        <Link href="/" className="mb-4">
          <ShieldCheck className="h-10 w-10 text-blue-600" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          {view === 'login' ? 'Welcome back' : view === 'signup' ? 'Create your account' : 'Reset Password'}
        </h1>
        <p className="text-gray-500 text-sm mt-2">
          {view === 'login' 
            ? 'Enter your credentials to access your plans' 
            : view === 'signup' 
            ? 'Start building your food safety compliance today'
            : 'Enter your email to receive a reset link'}
        </p>
      </div>

      <form onSubmit={handleAuth} className="space-y-4">
        {error && (
          <div className="p-3 bg-red-50 text-red-600 text-sm rounded-md flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            {error}
          </div>
        )}
        
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Email</label>
          <input
            type="email"
            required
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
            placeholder="name@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        
        {view !== 'forgot_password' && (
            <div className="space-y-2">
            <div className="flex justify-between items-center">
                <label className="text-sm font-medium text-gray-700">Password</label>
                {view === 'login' && (
                    <button type="button" onClick={() => setView('forgot_password')} className="text-xs text-blue-600 hover:underline font-bold">
                        Forgot password?
                    </button>
                )}
            </div>
            <input
                type="password"
                required
                minLength={6}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
            />
            </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md transition-colors flex items-center justify-center"
        >
          {loading ? <Loader2 className="animate-spin h-5 w-5" /> : (view === 'login' ? 'Sign In' : view === 'signup' ? 'Sign Up' : 'Send Reset Link')}
        </button>
      </form>

      {view !== 'forgot_password' && (
        <>
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Or continue with</span>
            </div>
          </div>

          <button
            onClick={() => {
                setLoading(true);
                supabase.auth.signInWithOAuth({
                    provider: 'google',
                    options: {
                        redirectTo: `${window.location.origin}${next || '/dashboard'}`,
                    },
                }).then(({ error }) => {
                    if (error) {
                        setError(error.message);
                        setLoading(false);
                    }
                });
            }}
            disabled={loading}
            type="button"
            className="w-full bg-white border border-gray-300 text-gray-700 font-medium py-2 px-4 rounded-md hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.84z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            Google
          </button>
        </>
      )}

      <div className="mt-6 text-center text-sm text-gray-500">
        {view === 'login' ? (
          <>
            Don&apos;t have an account?{' '}
            <button onClick={() => setView('signup')} className="text-blue-600 hover:underline font-medium">
              Sign up for free
            </button>
          </>
        ) : view === 'signup' ? (
          <>
            Already have an account?{' '}
            <button onClick={() => setView('login')} className="text-blue-600 hover:underline font-medium">
              Log in
            </button>
          </>
        ) : (
            <button onClick={() => setView('login')} className="text-blue-600 hover:underline font-medium flex items-center justify-center gap-2 mx-auto">
              <ArrowLeft className="w-3 h-3" /> Back to Login
            </button>
        )}
      </div>
    </div>
  );
}
