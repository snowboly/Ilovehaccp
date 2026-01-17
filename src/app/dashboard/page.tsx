"use client";

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  FileText,
  Download,
  Clock,
  Edit,
  Plus,
  Trash2,
  Link2,
  Lock,
  XCircle,
  CheckCircle2,
  AlertTriangle,
  FileDigit,
  LayoutDashboard,
  ShieldCheck,
  Settings,
  LogOut,
  ArrowRight,
  MoreVertical,
  Loader2,
  History
} from 'lucide-react';
import { Suspense } from 'react';
import { getDictionary } from '@/lib/locales';
import { isExportAllowed } from '@/lib/export/permissions';

interface Plan {
  id: string;
  product_name: string;
  business_name: string;
  created_at: string;
  status: string;
  payment_status: string;
  tier?: 'professional' | 'expert';
  hazard_analysis: any;
  full_plan: any;
  intended_use: string;
  storage_type: string;
  business_type: string;
  review_requested?: boolean;
  review_status?: 'pending' | 'completed';
  review_comments?: string;
  reviewed_at?: string;
  is_locked?: boolean;
}

function DashboardContent() {
  const dict = getDictionary('en').pdf;
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [importId, setImportId] = useState('');
  const [importing, setImporting] = useState(false);
  const [importConfirmation, setImportConfirmation] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (searchParams.get('session_id')) {
        setShowSuccess(true);
        window.history.replaceState({}, '', '/dashboard');
    }

    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login');
        return;
      }
      setUser(session.user);
      fetchPlans();
    };
    checkUser();
  }, [router, searchParams]);

  const fetchPlans = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('plans')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setPlans(data || []);
    } catch (err) {
      console.error('Error fetching plans:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this plan? This cannot be undone.')) return;
    
    try {
      const { error } = await supabase
        .from('plans')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      setPlans(plans.filter(p => p.id !== id));
    } catch (err: any) {
      console.error('Error deleting plan:', err);
      if (err.code === '23503') { // Foreign Key Violation
          alert('Cannot delete plan: It has active dependencies (like expert review requests or audit logs). Please run the latest database migration to enable cascading deletes.');
      } else {
          alert('Failed to delete plan. Please try again.');
      }
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  const handleDownloadWord = async (plan: Plan) => {
      try {
          const { data: { session } } = await supabase.auth.getSession();
          if (!session) return;

          const res = await fetch(`/api/download-word?planId=${plan.id}`, {
              headers: { Authorization: `Bearer ${session.access_token}` }
          });
          
          if (!res.ok) {
              const err = await res.json();
              alert(err.error || 'Download failed');
              return;
          }
          
          const blob = await res.blob();
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `HACCP_Plan_${plan.business_name.replace(/\s+/g, '_')}.docx`;
          document.body.appendChild(a);
          a.click();
          a.remove();
      } catch (e) {
          console.error(e);
          alert('Failed to download Word document.');
      }
  };

  const handleDownloadPdf = async (plan: Plan) => {
      try {
          const { data: { session } } = await supabase.auth.getSession();
          if (!session) return;

          // Default to EN if no language context (dashboard is EN-only for now or we can use useLanguage if we add it)
          const res = await fetch(`/api/download-pdf?planId=${plan.id}&lang=en`, {
              headers: { Authorization: `Bearer ${session.access_token}` }
          });
          
          if (!res.ok) {
              const err = await res.json();
              alert(err.error || 'Download failed');
              return;
          }
          
          const blob = await res.blob();
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `HACCP_Plan_${plan.business_name.replace(/\s+/g, '_')}.pdf`;
          document.body.appendChild(a);
          a.click();
          a.remove();
          window.URL.revokeObjectURL(url);
      } catch (e) {
          console.error(e);
          alert('Failed to download PDF.');
      }
  };

  const handleUpgrade = async (plan: Plan, tier: 'professional' | 'expert') => {
    try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) { router.push('/login'); return; }

        const res = await fetch('/api/create-checkout', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${session.access_token}`
            },
            body: JSON.stringify({ tier, planId: plan.id, businessName: plan.business_name })
        });

        const data = await res.json();
        if (data.url) {
            window.location.href = data.url;
        } else {
            alert(data.error || "Failed to start checkout");
        }
    } catch (e) {
        console.error(e);
        alert("System error starting checkout.");
    }
  };

  const handleImport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!importId) return;
    
    let cleanId = importId.trim();
    if (cleanId.includes('id=')) {
        cleanId = cleanId.split('id=')[1].split('&')[0];
    }
    setImportConfirmation(cleanId);
  };

  const confirmImport = async () => {
    if (!importConfirmation) return;

    setImporting(true);
    try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;

        const res = await fetch('/api/claim-plan', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${session.access_token}`
            },
            body: JSON.stringify({ planId: importConfirmation })
        });
        
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to import');
        
        alert('Plan imported successfully!');
        setImportId('');
        setImportConfirmation(null);
        fetchPlans();
    } catch (err: any) {
        alert(err.message);
    } finally {
        setImporting(false);
    }
  };

  const drafts = plans.filter(p => p.status === 'draft');
  const generatedPlans = plans.filter(p => p.status !== 'draft');

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b px-4 lg:px-6 h-16 flex items-center justify-between">
        <Link href="/dashboard" className="flex items-center gap-2">
          <ShieldCheck className="h-6 w-6 text-blue-600" />
          <span className="font-bold text-xl">ilovehaccp.com</span>
        </Link>
        <div className="flex items-center gap-4">
          <div className="hidden md:flex flex-col items-end mr-2">
             <span className="text-xs text-gray-400 font-medium">Logged in as</span>
             <span className="text-sm font-bold text-gray-700">{user?.email}</span>
          </div>
          <Link href="/dashboard/settings" className="text-gray-400 hover:text-gray-600 transition-colors p-2">
            <Settings className="h-5 w-5" />
          </Link>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 text-gray-500 hover:text-red-600 transition-colors bg-gray-100 hover:bg-red-50 px-3 py-2 rounded-lg text-sm font-medium"
          >
            <LogOut className="h-4 w-4" /> <span className="hidden sm:inline">Log Out</span>
          </button>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-8">
        {showSuccess && (
            <div className="mb-8 bg-emerald-50 border border-emerald-200 text-emerald-800 px-6 py-4 rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                    <div>
                        <span className="font-bold text-lg text-emerald-900 block">
                            {plans.find(p => p.id === searchParams.get('plan_id'))?.tier === 'expert' ? 'Review Requested' : 'Export Unlocked'}
                        </span>
                        <span className="font-medium text-sm">
                            {plans.find(p => p.id === searchParams.get('plan_id'))?.tier === 'expert'
                                ? (
                                    <>
                                        Your HACCP plan has been submitted for expert review. You will be notified when feedback is available.
                                        <br/>
                                        <span className="text-xs opacity-75">Expert reviews do not replace official audits or approvals.</span>
                                    </>
                                )
                                : 'You can now download your HACCP plan as a Word or PDF document.'}
                        </span>
                    </div>
                </div>
                <button onClick={() => setShowSuccess(false)} className="text-emerald-400 hover:text-emerald-600">
                    <XCircle className="w-5 h-5" />
                </button>
            </div>
        )}

        {/* Resume Draft Banner */}
        {drafts.length > 0 && (
            <div className="mb-8 bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-6 rounded-2xl shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div className="bg-white/20 p-3 rounded-full">
                        <History className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h3 className="font-bold text-xl">You have an unfinished HACCP plan</h3>
                        <p className="text-blue-100 text-sm">Don't lose your progress. Resume where you left off.</p>
                    </div>
                </div>
                <Link 
                    href={`/builder?id=${drafts[0].id}`}
                    className="whitespace-nowrap bg-white text-blue-700 hover:bg-blue-50 px-6 py-3 rounded-xl font-bold transition-all shadow-sm flex items-center gap-2"
                >
                    Resume Draft <ArrowRight className="w-4 h-4" />
                </Link>
            </div>
        )}

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Dashboard</h1>
            <p className="text-gray-500">Manage your food safety documentation</p>
          </div>
          <Link
            href="/builder?new=true"
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            <Plus className="h-5 w-5" />
            Create New Plan
          </Link>
        </div>

        {/* Section A: In Progress */}
        {drafts.length > 0 && (
            <section className="mb-12">
                <div className="flex items-center gap-2 mb-6">
                    <div className="bg-amber-100 p-2 rounded-lg">
                        <History className="w-5 h-5 text-amber-600" />
                    </div>
                    <h2 className="text-xl font-black text-slate-900">In Progress (Autosaved)</h2>
                </div>
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {drafts.map(plan => (
                        <div key={plan.id} className="bg-white rounded-xl border-2 border-dashed border-slate-200 p-6 flex flex-col justify-between hover:border-blue-300 transition-colors">
                            <div>
                                <h3 className="font-bold text-slate-900 mb-1">{plan.product_name || 'Unnamed Draft'}</h3>
                                <p className="text-slate-500 text-xs mb-4 uppercase font-black tracking-widest">{plan.business_name || 'No business set'}</p>
                                <div className="flex items-center gap-2 text-[10px] text-slate-400 font-bold">
                                    <Clock className="w-3 h-3" /> Updated {new Date(plan.created_at).toLocaleDateString()}
                                </div>
                            </div>
                            <div className="mt-6 flex gap-2">
                                <Link 
                                    href={`/builder?id=${plan.id}`}
                                    className="flex-1 bg-slate-900 text-white py-2 rounded-lg text-xs font-black text-center hover:bg-black"
                                >
                                    Resume
                                </Link>
                                <button 
                                    onClick={() => handleDelete(plan.id)}
                                    className="p-2 text-slate-400 hover:text-red-600"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        )}

        {/* Section B: Generated Plans */}
        <section>
            <div className="flex items-center gap-2 mb-6">
                <div className="bg-blue-100 p-2 rounded-lg">
                    <ShieldCheck className="w-5 h-5 text-blue-600" />
                </div>
                <h2 className="text-xl font-black text-slate-900">HACCP Plans</h2>
            </div>

            {generatedPlans.length === 0 ? (
                <div className="bg-white rounded-xl border border-dashed border-gray-300 p-12 text-center">
                    <div className="bg-blue-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                        <FileText className="h-8 w-8 text-blue-600" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-1">No generated plans yet</h3>
                    <p className="text-gray-500 mb-6">Complete the builder to generate your first professional plan.</p>
                </div>
            ) : (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {generatedPlans.map((plan) => {
                        const exportPermission = isExportAllowed(plan);
                        return (
                            <div key={plan.id} className="bg-white rounded-xl border shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col border-slate-200">
                                <div className="p-6 flex-1">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className={`px-2 py-1 rounded text-[10px] font-black uppercase tracking-tighter border ${
                                            plan.payment_status === 'paid' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-blue-50 text-blue-700 border-blue-100'
                                        }`}>
                                            {plan.payment_status === 'paid' ? (plan.tier === 'expert' ? 'Expert' : 'Professional') : 'Free Draft'}
                                        </div>
                                        <button onClick={() => handleDelete(plan.id)} className="text-slate-300 hover:text-red-600"><Trash2 className="w-4 h-4"/></button>
                                    </div>
                                    <h3 className="font-bold text-lg mb-1">{plan.product_name || 'Untitled Plan'}</h3>
                                    <p className="text-gray-500 text-sm mb-4">{plan.business_name}</p>
                                    
                                    <div className="space-y-3 mb-4">
                                        <div className="flex items-center justify-between text-xs border-b border-slate-50 pb-2">
                                            <span className="text-slate-400 font-bold uppercase tracking-tighter">Version</span>
                                            <span className="font-black text-slate-900 bg-slate-100 px-2 py-0.5 rounded">v1</span>
                                        </div>
                                        
                                        <div className="flex flex-col gap-1">
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Audit Readiness</span>
                                            {(() => {
                                                const status = plan.full_plan?.validation?.section_1_overall_assessment?.audit_readiness;
                                                if (!status) return (
                                                    <div className="flex items-center gap-2 text-slate-400 font-bold text-sm">
                                                        <div className="w-2 h-2 rounded-full bg-slate-300"></div> Not Validated
                                                    </div>
                                                );
                                                if (status === 'Major Gaps') return (
                                                    <div className="flex items-center gap-2 text-red-600 font-black text-sm">
                                                        <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div> Major Gaps Found
                                                    </div>
                                                );
                                                return (
                                                    <div className="flex items-center gap-2 text-emerald-600 font-black text-sm">
                                                        <div className="w-2 h-2 rounded-full bg-emerald-500"></div> Compliance OK
                                                    </div>
                                                );
                                            })()}
                                        </div>

                                        {plan.tier === 'expert' && (
                                            <div className="pt-2 border-t border-slate-50 mt-2">
                                                <div className="flex items-center justify-between mb-1">
                                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Expert Review</span>
                                                    {plan.review_status === 'completed' ? (
                                                        <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                                                            <CheckCircle2 className="w-3 h-3" /> Completed
                                                        </span>
                                                    ) : (
                                                        <span className="text-[10px] text-amber-600 font-bold flex items-center gap-1 animate-pulse">
                                                            <Clock className="w-3 h-3" /> In Queue
                                                        </span>
                                                    )}
                                                </div>
                                                {plan.review_comments && (
                                                    <div className="bg-blue-50 p-3 rounded-lg border border-blue-100 mt-2">
                                                        <p className="text-[11px] font-bold text-blue-900 mb-1 flex items-center gap-1">
                                                            <ShieldCheck className="w-3 h-3" /> Reviewer Recommendations:
                                                        </p>
                                                        <p className="text-[11px] text-blue-800 leading-relaxed whitespace-pre-wrap italic">
                                                            "{plan.review_comments}"
                                                        </p>
                                                        <p className="text-[9px] text-blue-400 mt-2">Note: Expert reviews are advisory and do not replace official audits or approvals.</p>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    {/* Upgrade Actions for Unpaid */}
                                    {plan.payment_status !== 'paid' && (
                                        <div className="mt-4 pt-4 border-t border-slate-100 space-y-2">
                                            <p className="text-[10px] text-slate-400 font-medium mb-2 leading-tight">
                                                Export is optional. Useful for sharing with inspectors or consultants.
                                            </p>
                                            <button 
                                                onClick={() => handleUpgrade(plan, 'professional')}
                                                className="w-full bg-blue-50 hover:bg-blue-100 text-blue-700 py-2 rounded-xl text-xs font-black transition-all"
                                            >
                                                Get Official Documents (€39)
                                            </button>
                                            <button 
                                                onClick={() => handleUpgrade(plan, 'expert')}
                                                className="w-full bg-slate-900 hover:bg-black text-white py-2 rounded-xl text-xs font-black transition-all"
                                            >
                                                Add Expert Review (€79)
                                            </button>
                                        </div>
                                    )}
                                </div>
                                <div className="border-t bg-gray-50 p-4 grid grid-cols-2 gap-2">
                                    <Link 
                                        href={`/builder?id=${plan.id}`}
                                        className="flex items-center justify-center gap-1 bg-white border border-gray-200 text-gray-700 py-2 rounded-lg text-xs font-bold hover:bg-gray-100 transition-colors"
                                    >
                                        <Edit className="h-3 w-3" /> Edit
                                    </Link>
                                    
                                    {exportPermission.allowed ? (
                                        <div className="relative group">
                                            <button
                                                onClick={() => handleDownloadPdf(plan)}
                                                className="w-full flex items-center justify-center gap-1 bg-blue-600 text-white py-2 rounded-lg text-xs font-bold hover:bg-blue-700 transition-colors"
                                            >
                                                <Download className="h-3 w-3" /> PDF
                                            </button>
                                            {plan.payment_status !== 'paid' && (
                                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-40 bg-slate-900 text-white text-[10px] p-2 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity text-center pointer-events-none z-20">
                                                    Includes Watermark. Upgrade to remove.
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <button 
                                            disabled 
                                            className="flex items-center justify-center gap-1 bg-red-50 text-red-400 border border-red-100 py-2 rounded-lg text-xs font-bold cursor-not-allowed w-full"
                                            title="Validation Failed: Fix Major Gaps to Unlock Export"
                                        >
                                            <Lock className="h-3 w-3" /> Blocked
                                        </button>
                                    )}

                                    {plan.payment_status === 'paid' && exportPermission.allowed ? (
                                        <button
                                            onClick={() => handleDownloadWord(plan)}
                                            className="col-span-2 flex items-center justify-center gap-1 bg-slate-900 text-white py-2 rounded-lg text-xs font-bold hover:bg-black transition-colors"
                                        >
                                            <FileText className="h-3 w-3" /> Download Word (.docx)
                                        </button>
                                    ) : plan.payment_status !== 'paid' ? (
                                        <div className="col-span-2 text-center pt-1">
                                            <span className="text-[9px] text-slate-400 font-medium">Upgrade to unlock Word export</span>
                                        </div>
                                    ) : null}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </section>

        <div className="mt-12 border-t pt-8">
            <div className="max-w-xl">
                <h3 className="text-lg font-bold text-gray-900 mb-2">Missing a plan?</h3>
                <p className="text-gray-500 text-sm mb-4">
                    If you generated a plan before signing up, enter the Plan ID below to add it to your dashboard.
                </p>
                <form onSubmit={handleImport} className="flex gap-3">
                    <div className="relative flex-1">
                        <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input 
                            type="text" 
                            placeholder="Paste Plan ID..." 
                            value={importId}
                            onChange={(e) => setImportId(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            disabled={importing}
                        />
                    </div>
                    <button 
                        type="submit" 
                        disabled={importing || !importId}
                        className="bg-gray-900 text-white px-6 py-2 rounded-lg font-medium hover:bg-black transition-colors disabled:opacity-50"
                    >
                        {importing ? 'Importing...' : 'Import Plan'}
                    </button>
                </form>
            </div>
        </div>

        {/* Import Confirmation Modal */}
        {importConfirmation && (
            <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-2xl">
                    <div className="flex items-center gap-3 mb-4 text-amber-600">
                        <AlertTriangle className="w-8 h-8" />
                        <h3 className="font-bold text-lg">Confirm Import</h3>
                    </div>
                    <p className="text-gray-600 mb-6">
                        You are about to import HACCP plan ID <span className="font-mono bg-gray-100 px-2 py-0.5 rounded font-bold text-gray-800">{importConfirmation}</span>.
                        <br/><br/>
                        Ensure this is the correct ID before proceeding.
                    </p>
                    <div className="flex gap-3 justify-end">
                        <button 
                            onClick={() => setImportConfirmation(null)}
                            className="px-4 py-2 text-gray-600 font-bold hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            Cancel
                        </button>
                        <button 
                            onClick={confirmImport}
                            disabled={importing}
                            className="px-4 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                        >
                            {importing && <Loader2 className="w-4 h-4 animate-spin" />}
                            {importing ? 'Importing...' : 'Yes, Import Plan'}
                        </button>
                    </div>
                </div>
            </div>
        )}
      </main>
    </div>
  );
}

export default function Dashboard() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin h-8 w-8 text-blue-600" /></div>}>
      <DashboardContent />
    </Suspense>
  );
}
