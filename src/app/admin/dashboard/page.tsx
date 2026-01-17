"use client";

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { ADMIN_EMAILS } from '@/lib/constants';
import { 
    Loader2, FileText, Download, ShieldAlert, CheckCircle2, XCircle, 
    Eye, AlertTriangle, Send, LayoutDashboard, FileCheck, Files, 
    Users, Clock, Search, ChevronRight, Save, ChevronLeft
} from 'lucide-react';

// --- Types ---
type ViewState = 'overview' | 'reviews' | 'plans' | 'users' | 'audit';

export default function AdminDashboard() {
  // State
  const [activeView, setActiveView] = useState<ViewState>('overview');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Data State
  const [plans, setPlans] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);

  // Pagination State
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Review Workspace State
  const [selectedReviewPlan, setSelectedReviewPlan] = useState<any>(null); // For Review Detail View
  const [loadingReview, setLoadingReview] = useState(false); // New: loading state for single plan fetch
  const [reviewComment, setReviewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const router = useRouter();

  // Initial Load
  useEffect(() => {
    fetchData('overview', 1); // Load overview by default
  }, []);

  // Fetch Data based on View or Page Change
  useEffect(() => {
      fetchData(activeView, page);
  }, [activeView, page]);

  const fetchData = async (view: ViewState, currentPage: number) => {
    setLoading(true);
    try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;
        const headers = { 'Authorization': `Bearer ${session.access_token}` };

        if (view === 'overview') {
            const res = await fetch('/api/admin/stats', { headers });
            if (!res.ok) throw new Error('Failed to fetch stats');
            const data = await res.json();
            setStats(data.stats);
            // Also fetch recent plans for activity list (Page 1 always)
            const plansRes = await fetch('/api/admin/plans?limit=5', { headers });
            const plansData = await plansRes.json();
            setPlans(plansData.plans || []);
        }
        else if (view === 'reviews' || view === 'plans') {
            const res = await fetch(`/api/admin/plans?page=${currentPage}&limit=20`, { headers });
            if (!res.ok) throw new Error('Failed to fetch plans');
            const data = await res.json();
            setPlans(data.plans || []);
            setTotalPages(data.pagination.totalPages);
            setTotalCount(data.pagination.total);
        }
        else if (view === 'users') {
            const res = await fetch(`/api/admin/users?page=${currentPage}&limit=20`, { headers });
            if (!res.ok) throw new Error('Failed to fetch users');
            const data = await res.json();
            setUsers(data.users || []);
            setTotalPages(data.pagination.totalPages);
            setTotalCount(data.pagination.total);
        }
        else if (view === 'audit') {
            const res = await fetch(`/api/admin/audit-logs?page=${currentPage}&limit=20`, { headers });
            if (!res.ok) throw new Error('Failed to fetch logs');
            const data = await res.json();
            setLogs(data.logs || []);
            setTotalPages(data.pagination.totalPages);
            setTotalCount(data.pagination.total);
        }
    } catch (err: any) {
        console.error(err);
        // Don't block UI on error, just log
    } finally {
        setLoading(false);
    }
  };

  // --- Actions ---

  const handleSelectPlanForReview = async (planId: string) => {
      setLoadingReview(true);
      try {
          const { data: { session } } = await supabase.auth.getSession();
          if (!session) return;
          
          // Fetch FULL details including heavy JSON blobs
          const res = await fetch(`/api/admin/plans/${planId}`, {
              headers: { 'Authorization': `Bearer ${session.access_token}` }
          });
          
          if (!res.ok) throw new Error('Failed to load plan details');
          const data = await res.json();
          
          setSelectedReviewPlan(data.plan);
          setReviewComment(data.plan.review_comments || '');
      } catch (e) {
          alert('Could not load plan details.');
          console.error(e);
      } finally {
          setLoadingReview(false);
      }
  };

  const handleReviewAction = async (action: 'ADD_COMMENT' | 'COMPLETE_REVIEW') => {
    if (!selectedReviewPlan) return;
    if (action === 'COMPLETE_REVIEW' && !confirm('Mark this review as COMPLETED? This cannot be undone.')) return;

    setSubmitting(true);
    try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;

        const res = await fetch('/api/admin/review', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${session.access_token}`
            },
            body: JSON.stringify({
                planId: selectedReviewPlan.id,
                action,
                comment: reviewComment
            })
        });

        if (!res.ok) throw new Error('Action failed');

        if (action === 'COMPLETE_REVIEW') {
            alert('Review completed successfully.');
            setSelectedReviewPlan(null); // Go back to list
            fetchData('reviews', page); // Refresh list
        } else {
            alert('Comment saved.');
        }
    } catch (e: any) {
        alert(e.message);
    } finally {
        setSubmitting(false);
    }
  };

  const handleDownloadWord = async (plan: any) => {
    try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;
        const res = await fetch(`/api/download-word?planId=${plan.id}`, {
            headers: { Authorization: `Bearer ${session.access_token}` }
        });
        if (!res.ok) { alert('Download failed'); return; }
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `HACCP_${plan.business_name}.docx`;
        document.body.appendChild(a);
        a.click();
        a.remove();
    } catch (e) { alert('Download failed'); }
  };

  const handleToggleStatus = async (planId: string, currentStatus: string | null) => {
      const newStatus = currentStatus === 'paid' ? null : 'paid';
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      if (!confirm(`Mark plan as ${newStatus ? 'PAID' : 'UNPAID'}?`)) return;

      try {
          const res = await fetch('/api/admin/toggle-status', {
              method: 'POST',
              headers: { 
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${session.access_token}` 
              },
              body: JSON.stringify({ planId, status: newStatus })
          });
          if (res.ok) {
              fetchData(activeView, page); // Refresh
          }
      } catch (e) {
          alert("Failed to update status");
      }
  };

  // --- Views ---

  const renderPagination = () => (
      <div className="flex items-center justify-between p-4 border-t border-slate-200 bg-slate-50">
          <span className="text-xs text-slate-500">
              Page <strong>{page}</strong> of <strong>{totalPages}</strong> ({totalCount} items)
          </span>
          <div className="flex gap-2">
              <button 
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-3 py-1 bg-white border border-slate-300 rounded text-xs font-bold disabled:opacity-50"
              >
                  Previous
              </button>
              <button 
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-3 py-1 bg-white border border-slate-300 rounded text-xs font-bold disabled:opacity-50"
              >
                  Next
              </button>
          </div>
      </div>
  );

  const renderSidebar = () => (
      <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col fixed h-full">
          <div className="p-6 border-b border-slate-800">
              <h1 className="text-white font-black text-xl tracking-tight">Oversight<span className="text-blue-500">Console</span></h1>
              <p className="text-xs text-slate-500 mt-1">v3.1 Secure Admin</p>
          </div>
          <nav className="flex-1 p-4 space-y-1">
              <button onClick={() => { setActiveView('overview'); setPage(1); setSelectedReviewPlan(null); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeView === 'overview' ? 'bg-blue-600 text-white' : 'hover:bg-slate-800'}`}>
                  <LayoutDashboard className="w-5 h-5" /> Overview
              </button>
              <button onClick={() => { setActiveView('reviews'); setPage(1); setSelectedReviewPlan(null); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeView === 'reviews' ? 'bg-blue-600 text-white' : 'hover:bg-slate-800'}`}>
                  <FileCheck className="w-5 h-5" /> Expert Reviews
                  {stats?.pendingReviews > 0 && <span className="ml-auto bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">{stats.pendingReviews}</span>}
              </button>
              <button onClick={() => { setActiveView('plans'); setPage(1); setSelectedReviewPlan(null); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeView === 'plans' ? 'bg-blue-600 text-white' : 'hover:bg-slate-800'}`}>
                  <Files className="w-5 h-5" /> All Plans
              </button>
              <button onClick={() => { setActiveView('users'); setPage(1); setSelectedReviewPlan(null); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeView === 'users' ? 'bg-blue-600 text-white' : 'hover:bg-slate-800'}`}>
                  <Users className="w-5 h-5" /> Users
              </button>
              <button onClick={() => { setActiveView('audit'); setPage(1); setSelectedReviewPlan(null); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeView === 'audit' ? 'bg-blue-600 text-white' : 'hover:bg-slate-800'}`}>
                  <ShieldAlert className="w-5 h-5" /> Audit Log
              </button>
          </nav>
      </aside>
  );

  const renderOverview = () => (
      <div className="space-y-8">
          <h2 className="text-2xl font-bold text-slate-900">Dashboard Overview</h2>
          <div className="grid grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                  <p className="text-slate-500 text-xs font-bold uppercase">Pending Reviews</p>
                  <p className="text-4xl font-black text-amber-500 mt-2">{stats?.pendingReviews || 0}</p>
              </div>
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                  <p className="text-slate-500 text-xs font-bold uppercase">Completed Reviews</p>
                  <p className="text-4xl font-black text-emerald-500 mt-2">{stats?.completedReviews || 0}</p>
              </div>
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                  <p className="text-slate-500 text-xs font-bold uppercase">Total Plans</p>
                  <p className="text-4xl font-black text-blue-600 mt-2">{stats?.totalPlans || 0}</p>
              </div>
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                  <p className="text-slate-500 text-xs font-bold uppercase">Paid Plans</p>
                  <p className="text-4xl font-black text-slate-900 mt-2">{stats?.paidPlans || 0}</p>
              </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-6">
              <h3 className="font-bold text-slate-900 mb-4">Recent Activity Stream (Read-Only)</h3>
              <div className="space-y-4">
                  {plans.slice(0, 5).map(plan => (
                      <div key={plan.id} className="flex items-center gap-4 text-sm border-b border-slate-50 pb-2 last:border-0">
                          <span className="text-slate-400 font-mono text-xs">{new Date(plan.created_at).toLocaleDateString()}</span>
                          <span className="font-bold text-slate-700">{plan.business_name}</span>
                          <span className="text-slate-500">
                              {plan.review_requested ? 'requested a review' : 'created a plan'}
                          </span>
                      </div>
                  ))}
              </div>
          </div>
      </div>
  );

  const renderReviewWorkspace = () => {
      const plan = selectedReviewPlan;
      if (loadingReview) return <div className="h-full flex items-center justify-center"><Loader2 className="animate-spin w-8 h-8 text-blue-600" /></div>;
      if (!plan) return null;

      return (
          <div className="h-[calc(100vh-8rem)] flex flex-col">
              <div className="flex items-center justify-between mb-6">
                  <button onClick={() => setSelectedReviewPlan(null)} className="text-slate-500 hover:text-blue-600 flex items-center gap-2 font-bold">
                      <ChevronRight className="w-4 h-4 rotate-180" /> Back to List
                  </button>
                  <div className="flex items-center gap-4">
                      <span className="bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" /> Review Mode Active
                      </span>
                  </div>
              </div>

              <div className="flex-1 grid grid-cols-2 gap-8 min-h-0">
                  {/* Left: Read Only Context */}
                  <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden flex flex-col">
                      <div className="bg-slate-50 p-4 border-b border-slate-200 font-bold text-slate-700">Plan Context (Read-Only)</div>
                      <div className="p-6 overflow-y-auto flex-1 space-y-6">
                           <div>
                               <label className="text-xs font-bold text-slate-400 uppercase">Business</label>
                               <p className="font-bold text-slate-900 text-lg">{plan.business_name}</p>
                               <p className="text-slate-500">{plan.business_type}</p>
                           </div>
                           <div>
                               <label className="text-xs font-bold text-slate-400 uppercase">Product Scope</label>
                               <p className="text-slate-800">{plan.product_name}</p>
                               <p className="text-slate-500 text-sm mt-1">{plan.product_description}</p>
                           </div>
                           <div>
                               <label className="text-xs font-bold text-slate-400 uppercase">Hazard Analysis Snapshot</label>
                               <div className="mt-2 bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs font-mono max-h-60 overflow-y-auto">
                                   {plan.hazard_analysis ? JSON.stringify(plan.hazard_analysis, null, 2) : 'No Data'}
                               </div>
                           </div>
                      </div>
                  </div>

                  {/* Right: Reviewer Controls */}
                  <div className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden flex flex-col text-white">
                      <div className="bg-slate-900 p-4 border-b border-slate-700 font-bold text-slate-100 flex items-center gap-2">
                          <FileCheck className="w-4 h-4 text-blue-400" /> Reviewer Workspace
                      </div>
                      <div className="p-6 flex-1 flex flex-col">
                          <div className="mb-6 bg-blue-500/10 border border-blue-500/20 p-4 rounded-xl text-blue-200 text-sm">
                              <p>Provide guidance on what to clarify. Do not make decisions or set critical limits for the user.</p>
                          </div>

                          <label className="font-bold text-slate-300 mb-2">Expert Comments</label>
                          <textarea 
                              className="flex-1 w-full bg-slate-900 border border-slate-700 rounded-xl p-4 focus:ring-2 focus:ring-blue-500 outline-none resize-none font-mono text-sm text-slate-200"
                              placeholder="Type guidance here..."
                              value={reviewComment}
                              onChange={(e) => setReviewComment(e.target.value)}
                          />

                          <div className="flex gap-4 mt-6 pt-6 border-t border-slate-700">
                              <button 
                                  onClick={() => handleReviewAction('ADD_COMMENT')}
                                  disabled={submitting}
                                  className="flex-1 bg-slate-700 hover:bg-slate-600 text-white py-3 rounded-xl font-bold transition-colors flex items-center justify-center gap-2"
                              >
                                  <Save className="w-4 h-4" /> Save Draft
                              </button>
                              <button 
                                  onClick={() => handleReviewAction('COMPLETE_REVIEW')}
                                  disabled={submitting}
                                  className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white py-3 rounded-xl font-bold transition-colors flex items-center justify-center gap-2"
                              >
                                  {submitting ? <Loader2 className="animate-spin w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                                  Mark Completed
                              </button>
                          </div>
                          
                          <p className="text-center text-slate-500 text-xs mt-4">
                              "Expert review provides guidance only. Final responsibility remains with the HACCP team."
                          </p>
                      </div>
                  </div>
              </div>
          </div>
      );
  };

  const renderReviewsList = () => (
      <div className="space-y-6">
          <h2 className="text-2xl font-bold text-slate-900">Expert Reviews</h2>
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
              <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500">
                      <tr>
                          <th className="p-4">Requested</th>
                          <th className="p-4">Plan Context</th>
                          <th className="p-4">Status</th>
                          <th className="p-4 text-right">Action</th>
                      </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                      {plans.filter(p => p.review_requested).map(plan => (
                          <tr key={plan.id} className="hover:bg-slate-50">
                              <td className="p-4 text-slate-500">
                                  {new Date(plan.created_at).toLocaleDateString()}
                              </td>
                              <td className="p-4">
                                  <div className="font-bold text-slate-900">{plan.business_name}</div>
                                  <div className="text-xs text-slate-500">ID: {plan.id.slice(0,8)}...</div>
                              </td>
                              <td className="p-4">
                                  {plan.review_status === 'completed' ? (
                                      <span className="bg-emerald-100 text-emerald-800 px-2 py-1 rounded-full text-xs font-bold">Completed</span>
                                  ) : (
                                      <span className="bg-amber-100 text-amber-800 px-2 py-1 rounded-full text-xs font-bold animate-pulse">Pending Review</span>
                                  )}
                              </td>
                              <td className="p-4 text-right">
                                  <button 
                                      onClick={() => handleSelectPlanForReview(plan.id)}
                                      className="text-blue-600 font-bold hover:underline flex items-center gap-1 ml-auto"
                                  >
                                      View Review <Eye className="w-3 h-3" />
                                  </button>
                              </td>
                          </tr>
                      ))}
                      {plans.filter(p => p.review_requested).length === 0 && (
                          <tr><td colSpan={4} className="p-8 text-center text-slate-400">No review requests found.</td></tr>
                      )}
                  </tbody>
              </table>
              {renderPagination()}
          </div>
      </div>
  );

  const renderPlansList = () => (
      <div className="space-y-6">
          <h2 className="text-2xl font-bold text-slate-900">All Plans (Read-Only)</h2>
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
              <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500">
                      <tr>
                          <th className="p-4">Date</th>
                          <th className="p-4">Business</th>
                          <th className="p-4">Status</th>
                          <th className="p-4 text-right">View</th>
                      </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                      {plans.map(plan => (
                          <tr key={plan.id} className="hover:bg-slate-50">
                              <td className="p-4 text-slate-500">{new Date(plan.created_at).toLocaleDateString()}</td>
                              <td className="p-4 font-bold text-slate-900">{plan.business_name}</td>
                              <td className="p-4">
                                  {plan.payment_status === 'paid' ? 
                                      <span className="text-emerald-600 font-bold text-xs">PAID ({plan.tier})</span> : 
                                      <span className="text-slate-400 text-xs">Draft</span>
                                  }
                              </td>
                              <td className="p-4 text-right flex gap-2 justify-end">
                                  <button onClick={() => handleToggleStatus(plan.id, plan.payment_status)} className="p-1 text-slate-300 hover:text-slate-600" title="Toggle Payment">$</button>
                                  <button onClick={() => handleDownloadWord(plan)} className="text-slate-400 hover:text-blue-600">
                                      <Download className="w-4 h-4" />
                                  </button>
                              </td>
                          </tr>
                      ))}
                  </tbody>
              </table>
              {renderPagination()}
          </div>
      </div>
  );

  const renderUsersList = () => (
      <div className="space-y-6">
          <h2 className="text-2xl font-bold text-slate-900">User Registry</h2>
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
              <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500">
                      <tr>
                          <th className="p-4">Email</th>
                          <th className="p-4">Joined</th>
                          <th className="p-4">Plans</th>
                          <th className="p-4 text-right">ID</th>
                      </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                      {users.map(u => (
                          <tr key={u.id} className="hover:bg-slate-50">
                              <td className="p-4 font-bold text-slate-900">{u.email}</td>
                              <td className="p-4 text-slate-500">{new Date(u.created_at).toLocaleDateString()}</td>
                              <td className="p-4 font-bold text-slate-900">{u.plan_count}</td>
                              <td className="p-4 text-right text-xs font-mono text-slate-400">{u.id.slice(0,8)}...</td>
                          </tr>
                      ))}
                  </tbody>
              </table>
              {renderPagination()}
          </div>
      </div>
  );

  const renderAuditLog = () => (
      <div className="space-y-6">
          <h2 className="text-2xl font-bold text-slate-900">Audit Log (Immutable)</h2>
          <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden text-slate-300">
              <table className="w-full text-left text-sm font-mono">
                  <thead className="bg-slate-950 border-b border-slate-800 text-slate-500 uppercase text-xs">
                      <tr>
                          <th className="p-4">Timestamp</th>
                          <th className="p-4">Admin</th>
                          <th className="p-4">Action</th>
                          <th className="p-4">Details</th>
                      </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                      {logs.map(log => (
                          <tr key={log.id} className="hover:bg-slate-800/50">
                              <td className="p-4 text-slate-500">{new Date(log.created_at).toLocaleString()}</td>
                              <td className="p-4 text-blue-400">{log.actor_email}</td>
                              <td className="p-4 text-white font-bold">{log.action}</td>
                              <td className="p-4 text-slate-500 truncate max-w-xs">{JSON.stringify(log.details)}</td>
                          </tr>
                      ))}
                  </tbody>
              </table>
              {renderPagination()}
          </div>
      </div>
  );

  // --- Main Render ---

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans text-slate-900">
        {renderSidebar()}
        <main className="flex-1 ml-64 p-8">
            {activeView === 'overview' && renderOverview()}
            {activeView === 'reviews' && (!selectedReviewPlan ? renderReviewsList() : renderReviewWorkspace())}
            {activeView === 'plans' && renderPlansList()}
            {activeView === 'users' && renderUsersList()}
            {activeView === 'audit' && renderAuditLog()}
        </main>
    </div>
  );
}
