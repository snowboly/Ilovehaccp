"use client";

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { Loader2, ShieldCheck, AlertCircle } from 'lucide-react';
import Link from 'next/link';

interface AuthFormProps {
  type: 'login' | 'signup';
}

export default function AuthForm({ type }: AuthFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (type === 'signup') {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        // Auto login or show success message
        alert('Account created! You can now log in.');
        router.push('/login');
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        router.push('/dashboard');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-8 bg-white rounded-xl shadow-sm border">
      <div className="flex flex-col items-center mb-8">
        <Link href="/" className="mb-4">
          <ShieldCheck className="h-10 w-10 text-blue-600" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          {type === 'login' ? 'Welcome back' : 'Create your account'}
        </h1>
        <p className="text-gray-500 text-sm mt-2">
          {type === 'login' 
            ? 'Enter your credentials to access your plans' 
            : 'Start building your food safety compliance today'}
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
            placeholder="support@ilovehaccp.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Password</label>
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

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md transition-colors flex items-center justify-center"
        >
          {loading ? <Loader2 className="animate-spin h-5 w-5" /> : (type === 'login' ? 'Sign In' : 'Sign Up')}
        </button>
      </form>

      <div className="mt-6 text-center text-sm text-gray-500">
        {type === 'login' ? (
          <>
            Don't have an account?{' '}
            <Link href="/signup" className="text-blue-600 hover:underline font-medium">
              Sign up for free
            </Link>
          </>
        ) : (
          <>
            Already have an account?{' '}
            <Link href="/login" className="text-blue-600 hover:underline font-medium">
              Log in
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
