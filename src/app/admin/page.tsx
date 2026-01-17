import { createClient } from '@/utils/supabase/server';
import { supabaseService } from '@/lib/supabase';
import { ADMIN_EMAILS } from '@/lib/constants';
import { redirect } from 'next/navigation';
import { 
  ShieldCheck, 
  FileText, 
  AlertCircle, 
  Activity,
  LayoutDashboard
} from 'lucide-react';

export default async function AdminPage() {
  // 1. Server-Side Security Check
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user || !user.email || !ADMIN_EMAILS.includes(user.email)) {
    redirect('/dashboard'); // or /login
  }

  // 2. Fetch Admin Data (using Service Role for full access)
  const [
    { count: totalPlans },
    { count: pendingReviews },
    { data: recentLogs }
  ] = await Promise.all([
    supabaseService.from('plans').select('*', { count: 'exact', head: true }),
    supabaseService.from('plans').select('*', { count: 'exact', head: true }).eq('review_requested', true).neq('review_status', 'completed'),
    supabaseService.from('admin_audit_logs').select('*').order('created_at', { ascending: false }).limit(5)
  ]);

  // 3. Render Minimal Dashboard
  return (
    <div className="min-h-screen bg-slate-50 p-8 font-sans">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-slate-900 p-3 rounded-xl text-white">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">Admin Console</h1>
              <p className="text-slate-500 text-sm font-medium">Secure Access • {user.email}</p>
            </div>
          </div>
          <a href="/admin/dashboard" className="text-sm font-bold text-blue-600 hover:underline flex items-center gap-1">
            Open Full Dashboard <LayoutDashboard className="w-4 h-4" />
          </a>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="bg-blue-50 p-3 rounded-xl text-blue-600">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Plans</p>
                <p className="text-3xl font-black text-slate-900">{totalPlans || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="bg-amber-50 p-3 rounded-xl text-amber-600">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Pending Reviews</p>
                <p className="text-3xl font-black text-amber-600">{pendingReviews || 0}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center gap-2">
            <Activity className="w-5 h-5 text-slate-400" />
            <h2 className="font-bold text-slate-900">Recent System Activity</h2>
          </div>
          <div className="divide-y divide-slate-100">
            {recentLogs && recentLogs.length > 0 ? (
              recentLogs.map((log: any) => (
                <div key={log.id} className="p-4 flex items-center justify-between text-sm hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-4">
                    <span className="font-mono text-xs text-slate-400">
                      {new Date(log.created_at).toLocaleDateString()} {new Date(log.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </span>
                    <span className="font-bold text-slate-700">{log.action}</span>
                  </div>
                  <span className="text-slate-500 text-xs max-w-xs truncate">{JSON.stringify(log.details)}</span>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-slate-400 text-sm">No recent activity found.</div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}