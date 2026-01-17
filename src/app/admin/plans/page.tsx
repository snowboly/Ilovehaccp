import { supabaseService } from '@/lib/supabase';
import { verifyAdminAccess } from '@/lib/admin-auth';
import { FileText, Download } from 'lucide-react';

export default async function AdminPlansPage() {
  await verifyAdminAccess();

  const { data: plans } = await supabaseService
    .from('plans')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(50); // Pagination recommended for future

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <h1 className="text-3xl font-black text-slate-900">All Plans</h1>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-bold text-xs">
            <tr>
              <th className="p-4">Date</th>
              <th className="p-4">Business</th>
              <th className="p-4">Product</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-right">Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {plans?.map((plan: any) => (
              <tr key={plan.id} className="hover:bg-slate-50 transition-colors">
                <td className="p-4 text-slate-500 font-mono text-xs">
                  {new Date(plan.created_at).toLocaleDateString()}
                </td>
                <td className="p-4 font-bold text-slate-900">
                  {plan.business_name || "Untitled"}
                </td>
                <td className="p-4 text-slate-600">
                  {plan.product_name}
                </td>
                <td className="p-4">
                  {plan.payment_status === 'paid' ? (
                    <span className="text-emerald-600 font-bold text-xs bg-emerald-50 px-2 py-1 rounded">PAID ({plan.tier})</span>
                  ) : (
                    <span className="text-slate-400 font-bold text-xs bg-slate-100 px-2 py-1 rounded">DRAFT</span>
                  )}
                </td>
                <td className="p-4 text-right font-mono text-xs text-slate-400">
                  {plan.id}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
