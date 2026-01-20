import { supabaseService } from '@/lib/supabase';
import { Eye, CheckCircle2, Clock } from 'lucide-react';
import Link from 'next/link';

export default async function AdminReviewsPage() {
  const { data: plans } = await supabaseService
    .from('plans')
    .select('id, created_at, business_name, review_status, user_id, tier')
    .eq('review_requested', true)
    .order('created_at', { ascending: false });

  // Fetch user emails separately or use a join if profiles exist. 
  // For simplicity, assuming we might need to fetch users or display IDs if profiles aren't easily joined on 'plans' directly in Supabase JS without setup.
  // Actually, 'plans' table doesn't have email. 'auth.users' is separate. 
  // I will just show ID and Business Name for now to ensure speed, or I can fetch user emails in parallel if needed.
  
  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <h1 className="text-3xl font-black text-slate-900">Expert Review Requests</h1>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-bold text-xs">
            <tr>
              <th className="p-4">Date</th>
              <th className="p-4">Business / Plan ID</th>
              <th className="p-4">Tier</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {plans?.map((plan: any) => (
              <tr key={plan.id} className="hover:bg-slate-50 transition-colors">
                <td className="p-4 text-slate-500 font-mono text-xs">
                  {new Date(plan.created_at).toLocaleDateString()}
                </td>
                <td className="p-4">
                  <div className="font-bold text-slate-900">{plan.business_name || "Untitled"}</div>
                  <div className="text-xs text-slate-400 font-mono">{plan.id}</div>
                </td>
                <td className="p-4">
                  <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded text-xs font-bold uppercase">{plan.tier || 'Standard'}</span>
                </td>
                <td className="p-4">
                  {plan.review_status === 'completed' ? (
                    <span className="flex items-center gap-1 text-emerald-600 font-bold text-xs bg-emerald-50 px-2 py-1 rounded-full w-fit">
                      <CheckCircle2 className="w-3 h-3" /> Completed
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-amber-600 font-bold text-xs bg-amber-50 px-2 py-1 rounded-full w-fit">
                      <Clock className="w-3 h-3" /> Pending
                    </span>
                  )}
                </td>
                <td className="p-4 text-right">
                  <Link 
                    href={`/admin/reviews/${plan.id}`} 
                    className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-bold text-xs bg-blue-50 hover:bg-blue-100 px-3 py-2 rounded-lg transition-colors"
                  >
                    <Eye className="w-3 h-3" /> Open Plan
                  </Link>
                </td>
              </tr>
            ))}
            {plans?.length === 0 && (
              <tr>
                <td colSpan={5} className="p-8 text-center text-slate-400">No review requests found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
