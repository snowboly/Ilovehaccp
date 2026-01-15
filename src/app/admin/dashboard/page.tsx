"use client";

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { Loader2, FileText, Download, ShieldAlert, CheckCircle2, XCircle, Eye, AlertTriangle, Send } from 'lucide-react';

export default function AdminDashboard() {
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'pending' | 'all'>('pending');
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.push('/login'); return; }

      const res = await fetch('/api/admin/plans', {
        headers: { 'Authorization': `Bearer ${session.access_token}` }
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
              fetchPlans(); // Refresh
          }
      } catch (e) {
          alert("Failed to update status");
      }
  };

  const handleDownloadWord = async (plan: any) => {
      try {
          const { data: { session } } = await supabase.auth.getSession();
          if (!session) return;
          
          const res = await fetch(`/api/download-word?planId=${plan.id}`, {
              headers: { Authorization: `Bearer ${session.access_token}` }
          });
          
          if (!res.ok) {
              const err = await res.json();
              alert(`Download Failed: ${err.error}`);
              return;
          }
          
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

  const openReviewModal = (plan: any) => {
      setSelectedPlan(plan);
      setReviewComment(plan.review_comments || '');
  };

  const submitReview = async (action: 'ADD_COMMENT' | 'COMPLETE_REVIEW') => {
      if (!selectedPlan) return;
      if (action === 'COMPLETE_REVIEW' && !confirm('Mark this review as COMPLETED? This cannot be undone.')) return;

      setSubmittingReview(true);
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
                  planId: selectedPlan.id,
                  action,
                  comment: reviewComment
              })
          });

          if (!res.ok) throw new Error('Action failed');

          if (action === 'COMPLETE_REVIEW') {
              alert('Review completed successfully.');
              setSelectedPlan(null);
              fetchPlans();
          } else {
              alert('Comment saved.');
          }
      } catch (e: any) {
          alert(e.message);
      } finally {
          setSubmittingReview(false);
      }
  };

  const pendingReviews = plans.filter(p => p.review_requested && p.review_status !== 'completed');
  const displayedPlans = activeTab === 'pending' ? pendingReviews : plans;

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
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
            <ShieldAlert className="w-8 h-8 text-red-600" />
            <div>
                <h1 className="text-3xl font-black text-slate-900">Oversight Console</h1>
                <p className="text-slate-500">Review plans, monitor compliance requests, and audit logs.</p>
            </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-6">
            <button 
                onClick={() => setActiveTab('pending')}
                className={`px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 ${activeTab === 'pending' ? 'bg-amber-100 text-amber-800' : 'bg-white text-slate-500 hover:bg-slate-100'}`}
            >
                <AlertTriangle className="w-4 h-4" /> Pending Reviews ({pendingReviews.length})
            </button>
            <button 
                onClick={() => setActiveTab('all')}
                className={`px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 ${activeTab === 'all' ? 'bg-blue-100 text-blue-800' : 'bg-white text-slate-500 hover:bg-slate-100'}`}
            >
                All Plans
            </button>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <table className="w-full text-left">
                <thead className="bg-slate-100 border-b border-slate-200">
                    <tr>
                        <th className="p-4 font-bold text-slate-600">Date</th>
                        <th className="p-4 font-bold text-slate-600">Business</th>
                        <th className="p-4 font-bold text-slate-600">Status</th>
                        <th className="p-4 font-bold text-slate-600">Review</th>
                        <th className="p-4 font-bold text-slate-600">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {displayedPlans.map(plan => (
                        <tr key={plan.id} className="hover:bg-slate-50">
                            <td className="p-4 text-slate-600 text-sm">{new Date(plan.created_at).toLocaleDateString()}</td>
                            <td className="p-4">
                                <div className="font-bold text-slate-900">{plan.business_name}</div>
                                <div className="text-xs text-slate-500">{plan.product_name}</div>
                            </td>
                            <td className="p-4">
                                {plan.payment_status === 'paid' ? (
                                    <span className="flex items-center gap-1 text-emerald-700 font-bold text-xs bg-emerald-100 px-2 py-1 rounded-full w-fit">
                                        <CheckCircle2 className="w-3 h-3" /> PAID
                                    </span>
                                ) : (
                                    <span className="flex items-center gap-1 text-slate-500 font-bold text-xs bg-slate-100 px-2 py-1 rounded-full w-fit">
                                        <XCircle className="w-3 h-3" /> UNPAID
                                    </span>
                                )}
                            </td>
                            <td className="p-4">
                                {plan.review_status === 'completed' ? (
                                    <span className="text-emerald-600 font-bold text-xs flex items-center gap-1">
                                        <CheckCircle2 className="w-3 h-3" /> Reviewed
                                    </span>
                                ) : plan.review_requested ? (
                                    <span className="text-amber-600 font-bold text-xs flex items-center gap-1 animate-pulse">
                                        <AlertTriangle className="w-3 h-3" /> Pending
                                    </span>
                                ) : (
                                    <span className="text-slate-400 text-xs">-</span>
                                )}
                            </td>
                            <td className="p-4 flex gap-2">
                                <button 
                                    onClick={() => openReviewModal(plan)}
                                    className="p-2 bg-slate-100 text-slate-700 rounded hover:bg-slate-200"
                                    title="View & Review"
                                >
                                    <Eye className="w-4 h-4" />
                                </button>
                                <button 
                                    onClick={() => handleDownloadWord(plan)}
                                    className="p-2 bg-blue-50 text-blue-700 rounded hover:bg-blue-100"
                                    title="Download Word"
                                >
                                    <FileText className="w-4 h-4" />
                                </button>
                                <button 
                                    onClick={() => handleToggleStatus(plan.id, plan.payment_status)}
                                    className="p-2 bg-gray-50 text-gray-400 rounded hover:bg-gray-100 text-xs font-mono"
                                    title="Toggle Payment"
                                >
                                    $
                                </button>
                            </td>
                        </tr>
                    ))}
                    {displayedPlans.length === 0 && (
                        <tr>
                            <td colSpan={5} className="p-8 text-center text-slate-400 font-medium">No plans found.</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
      </div>

      {/* Review Modal */}
      {selectedPlan && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
                  {/* Header */}
                  <div className="bg-slate-50 p-6 border-b flex justify-between items-center">
                      <div>
                          <h2 className="text-xl font-black text-slate-900">Expert Review Console</h2>
                          <p className="text-sm text-slate-500">Plan ID: <span className="font-mono">{selectedPlan.id}</span></p>
                      </div>
                      <button onClick={() => setSelectedPlan(null)} className="text-slate-400 hover:text-slate-600">
                          <XCircle className="w-6 h-6" />
                      </button>
                  </div>

                  {/* Body */}
                  <div className="flex-1 overflow-y-auto p-6 grid grid-cols-2 gap-8">
                      {/* Left: Plan Details (Read Only) */}
                      <div className="space-y-6">
                          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                              <h3 className="font-bold text-slate-700 mb-2">Business Context</h3>
                              <div className="grid grid-cols-2 gap-4 text-sm">
                                  <div>
                                      <span className="text-slate-400 block text-xs uppercase">Business Name</span>
                                      <span className="font-medium">{selectedPlan.business_name}</span>
                                  </div>
                                  <div>
                                      <span className="text-slate-400 block text-xs uppercase">Type</span>
                                      <span className="font-medium">{selectedPlan.business_type}</span>
                                  </div>
                              </div>
                          </div>

                          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                              <h3 className="font-bold text-slate-700 mb-2">Hazard Analysis Snapshot</h3>
                              <div className="text-xs font-mono bg-white p-2 rounded border border-slate-200 max-h-60 overflow-y-auto">
                                  {JSON.stringify(selectedPlan.hazard_analysis, null, 2)}
                              </div>
                          </div>
                      </div>

                      {/* Right: Review Actions */}
                      <div className="flex flex-col h-full">
                          <div className="mb-4 bg-amber-50 border border-amber-200 p-4 rounded-xl text-amber-800 text-sm">
                              <div className="flex items-center gap-2 font-bold mb-1">
                                  <AlertTriangle className="w-4 h-4" /> Compliance Warning
                              </div>
                              <p>Do NOT use words like "Approved" or "Certified". Provide guidance only. Final responsibility remains with the user.</p>
                          </div>

                          <label className="font-bold text-slate-700 mb-2">Reviewer Comments & Recommendations</label>
                          <textarea 
                              className="flex-1 w-full border border-slate-300 rounded-xl p-4 focus:ring-2 focus:ring-blue-500 outline-none resize-none font-mono text-sm"
                              placeholder="Enter your findings, missing elements, and recommendations here..."
                              value={reviewComment}
                              onChange={(e) => setReviewComment(e.target.value)}
                          />
                          
                          <div className="flex justify-between items-center mt-6">
                                <button 
                                    onClick={() => submitReview('ADD_COMMENT')}
                                    disabled={submittingReview}
                                    className="text-slate-500 hover:text-slate-800 font-bold text-sm"
                                >
                                    Save Draft Comment
                                </button>
                                <button 
                                    onClick={() => submitReview('COMPLETE_REVIEW')}
                                    disabled={submittingReview}
                                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg disabled:opacity-50"
                                >
                                    {submittingReview ? <Loader2 className="animate-spin w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                                    Mark Review Complete
                                </button>
                          </div>
                      </div>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
}
