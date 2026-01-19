"use client";

import { useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import { 
  CreditCard, 
  Trash2, 
  AlertTriangle, 
  Settings as SettingsIcon,
  LogOut,
  ChevronLeft,
  Loader2,
  ExternalLink
} from 'lucide-react';
import Link from 'next/link';

export default function SettingsPage() {
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleManageBilling = async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        alert('Please log in again.');
        router.push('/login');
        return;
      }

      const response = await fetch('/api/create-portal', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${session.access_token}`
        }
      });
      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert(data.error || 'Failed to open billing portal');
      }
    } catch (error) {
      console.error('Billing error:', error);
      alert('Error accessing billing portal');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm(
      "DANGER: This will permanently delete your account and ALL your HACCP plans. This action cannot be undone. Are you sure?"
    );

    if (confirmed) {
      setLoading(true);
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
            alert("Please log in again.");
            router.push('/login');
            return;
        }

        const response = await fetch('/api/delete-account', { 
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${session.access_token}`
            }
        });
        
        if (response.ok) {
            await supabase.auth.signOut();
            router.push('/');
        } else {
            const data = await response.json();
            alert(data.error || 'Failed to delete account. Please contact support.');
        }
      } catch (error) {
        console.error('Delete error:', error);
        alert('Error deleting account');
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white border-b px-4 lg:px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-4">
            <Link href="/dashboard" className="text-gray-500 hover:text-blue-600 transition-colors">
                <ChevronLeft className="h-6 w-6" />
            </Link>
            <span className="font-bold text-xl text-gray-900 flex items-center gap-2">
                <SettingsIcon className="h-5 w-5 text-gray-400" /> Settings
            </span>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-8 max-w-2xl space-y-8">
        
        {/* Billing Section */}
        <section className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-100">
                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <CreditCard className="h-5 w-5 text-blue-600" /> Billing & Invoices
                </h2>
                <p className="text-sm text-gray-500 mt-1">Manage your payment methods and download past invoices.</p>
            </div>
            <div className="p-6 bg-gray-50/50">
                <button 
                    onClick={handleManageBilling}
                    disabled={loading}
                    className="flex items-center gap-2 bg-white border border-gray-300 text-gray-700 px-6 py-3 rounded-xl font-bold hover:bg-gray-50 hover:border-gray-400 transition-all shadow-sm disabled:opacity-50"
                >
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ExternalLink className="h-4 w-4" />}
                    Open Customer Portal
                </button>
            </div>
        </section>

        {/* Danger Zone */}
        <section className="bg-white rounded-2xl border border-red-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-red-50 bg-red-50/30">
                <h2 className="text-lg font-bold text-red-900 flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-red-600" /> Danger Zone
                </h2>
                <p className="text-sm text-red-700/80 mt-1">Irreversible account actions.</p>
            </div>
            <div className="p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="font-bold text-gray-900">Delete Account</h3>
                        <p className="text-sm text-gray-500">Permanently remove your data and plans.</p>
                    </div>
                    <button 
                        onClick={handleDeleteAccount}
                        disabled={loading}
                        className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl font-bold transition-colors shadow-lg shadow-red-500/20 disabled:opacity-50"
                    >
                        Delete
                    </button>
                </div>
            </div>
        </section>

      </main>
    </div>
  );
}
