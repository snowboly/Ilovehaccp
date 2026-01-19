"use client";

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import { Loader2, Lock, CheckCircle2, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function UpdatePasswordPage() {
  const supabase = createClient();
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  // Redirect if no session (invalid link)
  useEffect(() => {
    const checkSession = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
            // Ideally, handle the #access_token fragment parsing if Supabase uses hash
            // But usually the client SDK handles it. 
            // If checking immediately fails, we might need to wait for auth state change
        }
    };
    checkSession();
  }, []);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.updateUser({
        password: password
      });

      if (error) throw error;
      setSuccess(true);
      setTimeout(() => router.push('/dashboard'), 3000); // Auto redirect
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans">
        <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8 text-center border border-slate-100">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-8 h-8 text-emerald-600" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 mb-4">Password Updated!</h1>
          <p className="text-slate-500 mb-8">
            Your password has been changed successfully. Redirecting you to the dashboard...
          </p>
          <Link href="/dashboard" className="text-blue-600 font-bold hover:underline">
            Go to Dashboard Now
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8 border border-slate-100">
        <div className="text-center mb-8">
            <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <Lock className="w-8 h-8 text-blue-600" />
            </div>
            <h1 className="text-2xl font-black text-slate-900">Set New Password</h1>
            <p className="text-slate-500 text-sm mt-2">
                Enter your new password below.
            </p>
        </div>

        <form onSubmit={handleUpdate} className="space-y-6">
            {error && (
            <div className="p-4 bg-red-50 text-red-600 text-sm rounded-xl flex items-center gap-2 font-medium">
                <AlertCircle className="h-5 w-5 flex-shrink-0" />
                {error}
            </div>
            )}

            <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">New Password</label>
                <input
                    type="password"
                    required
                    minLength={6}
                    className="w-full p-3 border-2 border-slate-100 rounded-xl focus:border-blue-600 outline-none transition-colors font-medium"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
            </div>

            <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-4 rounded-xl shadow-xl shadow-blue-500/20 transition-all transform hover:scale-[1.02] active:scale-95 flex items-center justify-center"
            >
                {loading ? <Loader2 className="animate-spin h-5 w-5" /> : 'Update Password'}
            </button>
        </form>
      </div>
    </div>
  );
}
