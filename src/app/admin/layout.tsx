import { verifyAdminAccess } from '@/lib/admin-auth';
import { supabaseService } from '@/lib/supabase';
import { 
  Activity,
  UserCheck,
  Files,
  CreditCard,
  ShieldCheck
} from 'lucide-react';
import Link from 'next/link';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // 1. Server-Side Security Check
  const user = await verifyAdminAccess();

  // 2. Fetch Badge Data
  const { count: pendingReviews } = await supabaseService
    .from('plans')
    .select('*', { count: 'exact', head: true })
    .eq('review_requested', true)
    .neq('review_status', 'completed');

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col fixed h-full border-r border-slate-800 z-50">
        <div className="p-6 border-b border-slate-800">
            <h1 className="text-white font-black text-xl tracking-tight">Oversight<span className="text-blue-500">Console</span></h1>
            <p className="text-xs text-slate-500 mt-1">v4.0 Secure Admin</p>
        </div>
        <nav className="flex-1 p-4 space-y-1">
            <Link href="/admin" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-800 transition-colors">
                <Activity className="w-5 h-5" /> Overview
            </Link>
            <Link href="/admin/reviews" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-800 transition-colors">
                <UserCheck className="w-5 h-5" /> Expert Reviews
                {pendingReviews! > 0 && <span className="ml-auto bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">{pendingReviews}</span>}
            </Link>
            <Link href="/admin/plans" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-800 transition-colors">
                <Files className="w-5 h-5" /> All Plans
            </Link>
            <Link href="/admin/payments" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-800 transition-colors">
                <CreditCard className="w-5 h-5" /> Payments
            </Link>
            <Link href="/admin/logs" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-800 transition-colors">
                <ShieldCheck className="w-5 h-5" /> Audit Logs
            </Link>
        </nav>
        <div className="p-4 border-t border-slate-800">
            <div className="text-xs font-mono text-slate-500 truncate">{user.email}</div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 p-8">
        {children}
      </main>
    </div>
  );
}