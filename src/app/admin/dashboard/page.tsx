"use client";

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { Loader2, FileText, Download, ShieldAlert } from 'lucide-react';

// Replace with your actual admin email(s) in /api/admin/plans/route.ts
// Client-side check is removed in favor of secure server-side validation.

export default function AdminDashboard() {
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    fetchPaidPlans();
  }, []);

  const fetchPaidPlans = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        router.push('/login');
        return;
      }

      // Secure Fetch
      const res = await fetch('/api/admin/plans', {
        headers: {
            'Authorization': `Bearer ${session.access_token}`
        }
      });

      if (res.status === 401 || res.status === 403) {
        setError('Access Denied: You are not an administrator.');
        setLoading(false);
        return;
      }

      if (!res.ok) throw new Error('Failed to fetch data');

      const data = await res.json();
      setPlans(data.plans || []);
    } catch (err) {
      console.error('Error fetching plans:', err);
      setError('System Error');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadWord = async (plan: any) => {
      try {
          const { data: { session } } = await supabase.auth.getSession();
          if (!session) return;

          // Admin download relies on the same API, assuming the API logic allows Owner OR Admin.
          // Note: The /api/download-word route currently checks "Owner OR Paid". 
          // Since this is a Paid plan, it *might* pass if we relax the check or if we implement the Admin check there too.
          // Let's assume /api/download-word needs an update to allow Admin by email too.
          
          const res = await fetch(`/api/download-word?planId=${plan.id}`, {
              headers: { Authorization: `Bearer ${session.access_token}` }
          });
          
          if (!res.ok) throw new Error('Download failed');
          
          const blob = await res.blob();
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `HACCP_Plan_${plan.business_name.replace(/\s+/g, '_')}_ADMIN.docx`;
          document.body.appendChild(a);
          a.click();
          a.remove();
      } catch (e) {
          console.error(e);
          alert('Failed to download Word document.');
      }
  };

  if (loading) return <div className="flex justify-center items-center h-screen"><Loader2 className="animate-spin text-blue-600 w-8 h-8" /></div>;

  if (error) return (
    <div className="flex flex-col justify-center items-center h-screen gap-4">
        <ShieldAlert className="w-16 h-16 text-red-500" />
        <h1 className="text-2xl font-bold text-slate-800">{error}</h1>
        <button onClick={() => router.push('/')} className="text-blue-600 hover:underline">Go Home</button>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
            <ShieldAlert className="w-8 h-8 text-red-600" />
            <h1 className="text-3xl font-black text-slate-900">Admin Dashboard</h1>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <table className="w-full text-left">
                <thead className="bg-slate-100 border-b border-slate-200">
                    <tr>
                        <th className="p-4 font-bold text-slate-600">Date</th>
                        <th className="p-4 font-bold text-slate-600">Business Name</th>
                        <th className="p-4 font-bold text-slate-600">Type</th>
                        <th className="p-4 font-bold text-slate-600">Status</th>
                        <th className="p-4 font-bold text-slate-600">Action</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {plans.map(plan => (
                        <tr key={plan.id} className="hover:bg-slate-50">
                            <td className="p-4 text-slate-600">{new Date(plan.created_at).toLocaleDateString()}</td>
                            <td className="p-4 font-bold text-slate-900">{plan.business_name}</td>
                            <td className="p-4 text-slate-600">{plan.business_type}</td>
                            <td className="p-4">
                                <span className="bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full text-xs font-bold uppercase">Paid</span>
                            </td>
                            <td className="p-4">
                                <button 
                                    onClick={() => handleDownloadWord(plan)}
                                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-blue-700 transition-colors text-sm"
                                >
                                    <FileText className="w-4 h-4" /> Download DOCX
                                </button>
                            </td>
                        </tr>
                    ))}
                    {plans.length === 0 && (
                        <tr>
                            <td colSpan={5} className="p-8 text-center text-slate-400 font-medium">No paid plans found.</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
      </div>
    </div>
  );
}
