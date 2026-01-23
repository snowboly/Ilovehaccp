"use client";

import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  Plus,
  Link2,
  XCircle,
  AlertTriangle,
  ShieldCheck,
  Settings,
  LogOut,
  Loader2
} from 'lucide-react';
import { Suspense } from 'react';
type Draft = Plan & { name?: string | null };

interface Plan {
  id: string;
  draft_id?: string | null;
  product_name: string;
  business_name: string;
  created_at: string;
  name?: string | null;
  status: string;
  payment_status: string;
  tier?: 'professional' | 'expert';
  hazard_analysis: any;
  full_plan: any;
  intended_use: string;
  storage_type: string;
  business_type: string;
  pdf_url?: string | null;
  docx_url?: string | null;
  review_requested?: boolean;
  review_status?: 'pending' | 'completed';
  review_comments?: string;
  review_notes?: string | null;
  reviewed_at?: string;
  is_locked?: boolean;
}

function DashboardContent() {
  const supabase = createClient();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [draftNamesByPlanId, setDraftNamesByPlanId] = useState<Record<string, string>>({});
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

      // 1. Fetch Permanent Plans
      const { data: plansData, error: plansError } = await supabase
        .from('plans')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (plansError) throw plansError;

      // 2. Fetch Active Drafts
      const { data: draftsData, error: draftsError } = await supabase
        .from('drafts')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .is('deleted_at', null)
        .order('updated_at', { ascending: false });

      if (draftsError) throw draftsError;

      setPlans((plansData || []) as any);
      setDrafts(
        (draftsData || []).map(d => ({
          id: d.id,
          name: d.name ?? null,
          product_name: d.answers?.product?.product_name || 'Unfinished Draft',
          business_name: d.answers?.product?.businessLegalName || 'Draft',
          created_at: d.updated_at,
          status: 'draft',
          payment_status: 'unpaid',
          hazard_analysis: d.answers?.hazard_analysis || [],
          full_plan: d.plan_data,
          intended_use: d.answers?.product?.intended_use || '',
          storage_type: d.answers?.product?.storage_conditions || '',
          business_type: d.answers?.product?.product_category || '',
        }))
      );

      const planDraftIds = (plansData || [])
        .map(plan => plan.draft_id)
        .filter((draftId): draftId is string => Boolean(draftId));

      if (planDraftIds.length > 0) {
        const { data: planDrafts, error: planDraftsError } = await supabase
          .from('drafts')
          .select('id, name')
          .in('id', planDraftIds);

        if (planDraftsError) throw planDraftsError;

        const draftNameMap = (planDrafts || []).reduce<Record<string, string>>((acc, draft) => {
          if (draft.name) {
            acc[draft.id] = draft.name;
          }
          return acc;
        }, {});
        setDraftNamesByPlanId(draftNameMap);
      } else {
        setDraftNamesByPlanId({});
      }
    } catch (err) {
      console.error('Error fetching plans:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDraft = async (id: string) => {
    if (!confirm('Are you sure you want to delete this draft? This cannot be undone.')) return;
    try {
      const { error } = await supabase
        .from('drafts')
        .update({ status: 'abandoned', deleted_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;
      setDrafts(drafts.filter(draft => draft.id !== id));
    } catch (err: any) {
      console.error('Error deleting draft:', err);
      if (err.code === '23503') {
        alert('Cannot delete: It has active dependencies. Please contact support.');
      } else {
        alert(err.message || 'Failed to delete. Please try again.');
      }
    }
  };

  const handleRenameDraft = async (id: string, currentName?: string | null) => {
    const nextName = prompt('Enter a new draft name:', currentName || '');
    if (nextName === null) return;
    const trimmedName = nextName.trim();
    if (!trimmedName) {
      alert('Draft name cannot be empty.');
      return;
    }

    try {
      const { error } = await supabase
        .from('drafts')
        .update({ name: trimmedName })
        .eq('id', id);

      if (error) throw error;

      setDrafts(drafts.map(draft => (draft.id === id ? { ...draft, name: trimmedName } : draft)));
    } catch (err: any) {
      console.error('Error renaming draft:', err);
      alert(err.message || 'Failed to rename draft. Please try again.');
    }
  };

  const handleDeletePlan = async (id: string) => {
    if (!confirm('Are you sure you want to delete this plan? This cannot be undone.')) return;
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login');
        return;
      }

      const res = await fetch(`/api/plans/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${session.access_token}` }
      });

      if (!res.ok) {
        const err = await res.json().catch(() => null);
        throw new Error(err?.error || 'Failed to delete plan');
      }

      setPlans(plans.filter(plan => plan.id !== id));
    } catch (err: any) {
      console.error('Error deleting plan:', err);
      if (err.code === '23503') {
        alert('Cannot delete: It has active dependencies. Please contact support.');
      } else {
        alert(err.message || 'Failed to delete. Please try again.');
      }
    }
  };
  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
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
          <div className="mb-6 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-lg flex items-center justify-between">
            <span className="text-sm font-medium">
              {plans.find(p => p.id === searchParams.get('plan_id'))?.tier === 'expert'
                ? 'Review requested successfully.'
                : 'Export unlocked successfully.'}
            </span>
            <button onClick={() => setShowSuccess(false)} className="text-emerald-600">
              <XCircle className="w-5 h-5" />
            </button>
          </div>
        )}

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Dashboard</h1>
            <p className="text-gray-500 text-sm">Manage your food safety documentation</p>
          </div>
          <Link
            href="/builder?new=true"
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            <Plus className="h-5 w-5" />
            Create New Plan
          </Link>
        </div>

        <section className="mb-10">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Active Drafts</h2>
          {drafts.length === 0 ? (
            <div className="text-sm text-gray-500">No active drafts.</div>
          ) : (
            <div className="overflow-x-auto border rounded-lg bg-white">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50 text-gray-600">
                  <tr>
                    <th className="text-left px-4 py-2 font-medium">Draft</th>
                    <th className="text-left px-4 py-2 font-medium">Business</th>
                    <th className="text-left px-4 py-2 font-medium">Updated</th>
                    <th className="text-right px-4 py-2 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {drafts.map(draft => (
                    <tr key={draft.id} className="border-t">
                      <td className="px-4 py-2">
                        {draft.name?.trim() || `HACCP Draft – ${new Date(draft.created_at).toLocaleDateString()}`}
                      </td>
                      <td className="px-4 py-2">{draft.business_name || 'Draft'}</td>
                      <td className="px-4 py-2">{new Date(draft.created_at).toLocaleDateString()}</td>
                      <td className="px-4 py-2 text-right space-x-2">
                        <Link href={`/builder?draft=${draft.id}`} className="text-blue-600 hover:underline">
                          Resume
                        </Link>
                        <button
                          onClick={() => handleRenameDraft(draft.id, draft.name)}
                          className="text-blue-600 hover:underline"
                        >
                          Rename
                        </button>
                        <button onClick={() => handleDeleteDraft(draft.id)} className="text-red-600 hover:underline">
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Documents &amp; Reviews</h2>
          {plans.length === 0 ? (
            <div className="text-sm text-gray-500">No generated plans yet.</div>
          ) : (
            <div className="overflow-x-auto border rounded-lg bg-white">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50 text-gray-600">
                  <tr>
                    <th className="text-left px-4 py-2 font-medium">Plan</th>
                    <th className="text-left px-4 py-2 font-medium">PDF</th>
                    <th className="text-left px-4 py-2 font-medium">Word</th>
                    <th className="text-left px-4 py-2 font-medium">Review Notes</th>
                    <th className="text-left px-4 py-2 font-medium">Status</th>
                    <th className="text-right px-4 py-2 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {plans.map(plan => {
                    const draftName = plan.draft_id ? draftNamesByPlanId[plan.draft_id] : undefined;
                    const planLabel = draftName?.trim() || `HACCP Plan – ${new Date(plan.created_at).toLocaleDateString()}`;
                    const pdfUrl = plan.pdf_url ?? plan.full_plan?.documents?.pdf_url ?? null;
                    const docxUrl = plan.docx_url ?? plan.full_plan?.documents?.docx_url ?? null;
                    const reviewStatus = plan.review_status === 'completed'
                      ? 'Reviewed'
                      : plan.review_requested
                        ? 'Review Requested'
                        : pdfUrl || docxUrl
                          ? 'Exported'
                          : 'Draft Exported';
                    const hasReviewNotes = Boolean(plan.review_notes || plan.review_comments);
                    return (
                      <tr key={plan.id} className="border-t">
                        <td className="px-4 py-2">{planLabel}</td>
                        <td className="px-4 py-2">
                          {pdfUrl ? (
                            <a href={pdfUrl} className="text-blue-600 hover:underline" target="_blank" rel="noreferrer">
                              PDF
                            </a>
                          ) : (
                            <span className="text-gray-400">—</span>
                          )}
                        </td>
                        <td className="px-4 py-2">
                          {docxUrl ? (
                            <a href={docxUrl} className="text-blue-600 hover:underline" target="_blank" rel="noreferrer">
                              Word
                            </a>
                          ) : (
                            <span className="text-gray-400">—</span>
                          )}
                        </td>
                        <td className="px-4 py-2">
                          {hasReviewNotes ? (
                            <Link href={`/dashboard/plans/${plan.id}/review`} className="text-blue-600 hover:underline">
                              View
                            </Link>
                          ) : (
                            <span className="text-gray-400">—</span>
                          )}
                        </td>
                        <td className="px-4 py-2">
                          {reviewStatus}
                        </td>
                        <td className="px-4 py-2 text-right space-x-3">
                          <button onClick={() => handleUpgrade(plan, 'professional')} className="text-blue-600 hover:underline">
                            Upgrade Pro
                          </button>
                          <button onClick={() => handleUpgrade(plan, 'expert')} className="text-blue-600 hover:underline">
                            Request Review
                          </button>
                          <button onClick={() => handleDeletePlan(plan.id)} className="text-red-600 hover:underline">
                            Delete
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
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
