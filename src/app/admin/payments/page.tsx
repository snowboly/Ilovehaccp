import { supabaseService } from '@/lib/supabase';
import { verifyAdminAccess } from '@/lib/admin-auth';
import { CreditCard } from 'lucide-react';

export default async function AdminPaymentsPage() {
  await verifyAdminAccess();

  // Fetch only paid plans
  const { data: payments } = await supabaseService
    .from('plans')
    .select('*')
    .eq('payment_status', 'paid')
    .order('created_at', { ascending: false });

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <h1 className="text-3xl font-black text-slate-900">Payment History</h1>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-bold text-xs">
            <tr>
              <th className="p-4">Date</th>
              <th className="p-4">Business</th>
              <th className="p-4">Tier</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-right">Plan ID</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {payments?.map((payment: any) => (
              <tr key={payment.id} className="hover:bg-slate-50 transition-colors">
                <td className="p-4 text-slate-500 font-mono text-xs">
                  {new Date(payment.created_at).toLocaleDateString()}
                </td>
                <td className="p-4 font-bold text-slate-900">
                  {payment.business_name}
                </td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${
                    payment.tier === 'expert' ? 'bg-purple-50 text-purple-700' : 'bg-blue-50 text-blue-700'
                  }`}>
                    {payment.tier || 'Professional'}
                  </span>
                </td>
                <td className="p-4">
                  <span className="flex items-center gap-1 text-emerald-600 font-bold text-xs">
                    <CreditCard className="w-3 h-3" /> Paid
                  </span>
                </td>
                <td className="p-4 text-right font-mono text-xs text-slate-400">
                  {payment.id}
                </td>
              </tr>
            ))}
            {payments?.length === 0 && (
              <tr><td colSpan={5} className="p-8 text-center text-slate-400">No payments found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
