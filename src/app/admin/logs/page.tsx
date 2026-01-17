import { supabaseService } from '@/lib/supabase';
import { verifyAdminAccess } from '@/lib/admin-auth';
import { ShieldAlert } from 'lucide-react';

export default async function AdminLogsPage() {
  await verifyAdminAccess();

  const { data: logs } = await supabaseService
    .from('admin_audit_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(100);

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <h1 className="text-3xl font-black text-slate-900">Security Audit Logs</h1>

      <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden text-slate-300 shadow-xl">
        <table className="w-full text-left text-sm font-mono">
          <thead className="bg-slate-950 border-b border-slate-800 text-slate-500 uppercase text-xs">
            <tr>
              <th className="p-4">Timestamp</th>
              <th className="p-4">Admin User</th>
              <th className="p-4">Action</th>
              <th className="p-4">Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {logs?.map((log: any) => (
              <tr key={log.id} className="hover:bg-slate-800/50 transition-colors">
                <td className="p-4 text-slate-500 whitespace-nowrap">
                  {new Date(log.created_at).toLocaleString()}
                </td>
                <td className="p-4 text-blue-400">
                  {log.actor_email || log.admin_email}
                </td>
                <td className="p-4">
                  <span className="font-bold text-white bg-slate-800 px-2 py-1 rounded border border-slate-700">
                    {log.action}
                  </span>
                </td>
                <td className="p-4 text-slate-500 truncate max-w-md">
                  {JSON.stringify(log.details)}
                </td>
              </tr>
            ))}
            {logs?.length === 0 && (
              <tr><td colSpan={4} className="p-8 text-center text-slate-600">No logs found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
