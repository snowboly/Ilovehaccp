import { supabaseService } from '@/lib/supabase';
import { Activity } from 'lucide-react';
import AdminGuard from '@/components/admin/AdminGuard';

export default async function AdminPage() {
  const [
    { count: totalPlans },
    { count: pendingReviews },
    { count: paidExports },
    { count: expertReviews },
    { data: recentLogs }
  ] = await Promise.all([
    supabaseService
      .from('plans')
      .select('*', { count: 'exact', head: true }),
    supabaseService
      .from('plans')
      .select('*', { count: 'exact', head: true })
      .eq('review_requested', true)
      .neq('review_status', 'completed'),
    supabaseService
      .from('plans')
      .select('*', { count: 'exact', head: true })
      .eq('payment_status', 'paid')
      .eq('tier', 'professional'),
    supabaseService
      .from('plans')
      .select('*', { count: 'exact', head: true })
      .eq('payment_status', 'paid')
      .eq('tier', 'expert'),
    supabaseService
      .from('admin_audit_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5)
  ]);

  return (
    <AdminGuard>
      <div className="max-w-6xl mx-auto space-y-8">
        <h1 className="text-3xl font-black text-slate-900">Dashboard Overview</h1>
        <div className="grid md:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Plans</p>
            <p className="text-3xl font-black text-slate-900 mt-2">{totalPlans || 0}</p>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Paid Exports (€39)</p>
            <p className="text-3xl font-black text-blue-600 mt-2">{paidExports || 0}</p>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Expert Reviews (€79)</p>
            <p className="text-3xl font-black text-emerald-600 mt-2">{expertReviews || 0}</p>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Pending Reviews</p>
            <p className="text-3xl font-black text-amber-500 mt-2">{pendingReviews || 0}</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center gap-2">
            <Activity className="w-5 h-5 text-slate-400" />
            <h2 className="font-bold text-slate-900">Recent System Activity</h2>
          </div>
          <div className="divide-y divide-slate-100">
            {recentLogs && recentLogs.length > 0 ? (
              recentLogs.map((log: any) => (
                <div
                  key={log.id}
                  className="p-4 flex items-center justify-between text-sm hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <span className="font-mono text-xs text-slate-400">
                      {new Date(log.created_at).toLocaleDateString()} {new Date(log.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </span>
                    <span className="font-bold text-slate-700 uppercase tracking-wider text-xs">
                      {log.action}
                    </span>
                  </div>
                  <span className="text-slate-500 text-xs font-mono max-w-xs truncate">
                    {JSON.stringify(log.details)}
                  </span>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-slate-400 text-sm">No recent activity found.</div>
            )}
          </div>
        </div>
      </div>
    </AdminGuard>
  );
}
