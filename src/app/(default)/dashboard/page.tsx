"use client";

import { useEffect, useRef, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  Plus,
  Link2,
  XCircle,
  AlertTriangle,
  Settings,
  LogOut,
  Loader2
} from 'lucide-react';
import { Suspense } from 'react';
import type { Plan, Draft } from '@/types/plan';
import { useLanguage } from '@/lib/i18n';

function DashboardContent() {
  const supabase = createClient();
  const { t } = useLanguage();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [draftNamesByPlanId, setDraftNamesByPlanId] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [importId, setImportId] = useState('');
  const [importing, setImporting] = useState(false);
  const [importConfirmation, setImportConfirmation] = useState<string | null>(null);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const toastTimer = useRef<NodeJS.Timeout | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();

  const notify = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 5000);
  };

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
        .neq('status', 'abandoned')
        .is('deleted_at', null)
        .order('updated_at', { ascending: false });

      if (draftsError) throw draftsError;

      const paidPlans = (plansData || []).filter(plan =>
        plan.export_paid || plan.review_paid || plan.payment_status === 'paid'
      );
      const paidDraftIds = new Set(
        paidPlans
          .map((plan) => plan.draft_id)
          .filter((draftId): draftId is string => Boolean(draftId))
      );
      setPlans(paidPlans as any);
      setDrafts(
        (draftsData || [])
          .filter((draft) => !paidDraftIds.has(draft.id))
          .map(d => ({
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
    if (!confirm(t('messages.confirmDeleteDraft'))) return;
    const prev = drafts;
    setDrafts(drafts.filter(draft => draft.id !== id));
    try {
      const { error } = await supabase
        .from('drafts')
        .update({ status: 'abandoned', deleted_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;
    } catch (err: any) {
      console.error('Error deleting draft:', err);
      setDrafts(prev);
      if (err.code === '23503') {
        notify('error', t('messages.cannotDeleteDependencies'));
      } else {
        notify('error', err.message || t('messages.deleteFailed'));
      }
    }
  };

  const handleRenameDraft = async (id: string, currentName?: string | null) => {
    const nextName = prompt(t('messages.enterNewDraftName'), currentName || '');
    if (nextName === null) return;
    const trimmedName = nextName.trim();
    if (!trimmedName) {
      notify('error', t('messages.draftNameEmpty'));
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
      notify('error', err.message || t('messages.renameFailed'));
    }
  };

  const handleDeletePlan = async (id: string) => {
    if (!confirm(t('messages.confirmDeletePlan'))) return;
    const prev = plans;
    setPlans(plans.filter(plan => plan.id !== id));
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setPlans(prev);
        router.push('/login');
        return;
      }

      const res = await fetch(`/api/plans/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${session.access_token}` }
      });

      if (!res.ok) {
        const err = await res.json().catch(() => null);
        throw new Error(err?.error || t('messages.deleteFailed'));
      }

      notify('success', t('messages.deleteSuccess'));
    } catch (err: any) {
      console.error('Error deleting plan:', err);
      setPlans(prev);
      notify('error', err.message || t('messages.deleteFailed'));
    }
  };
  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  const handleDownload = async (planId: string, format: 'pdf' | 'word', businessName?: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.push('/login'); return; }

      const endpoint = format === 'pdf' ? 'download-pdf' : 'download-word';
      const res = await fetch(`/api/${endpoint}?planId=${planId}`, {
        headers: { Authorization: `Bearer ${session.access_token}` }
      });

      if (!res.ok) {
        const err = await res.json().catch(() => null);
        notify('error', err?.error || `${t('messages.downloadFailed')} ${format.toUpperCase()}`);
        return;
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const safeName = (businessName || 'HACCP_Plan').replace(/[^a-zA-Z0-9_-]/g, '_');
      a.download = `${safeName}.${format === 'pdf' ? 'pdf' : 'docx'}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch {
      notify('error', `${t('messages.downloadFailed')} ${format.toUpperCase()}`);
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
            notify('error', data.error || t('messages.checkoutFailed'));
        }
    } catch (e) {
        console.error(e);
        notify('error', t('messages.systemError'));
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
        if (!res.ok) throw new Error(data.error || t('messages.importFailed'));

        notify('success', t('messages.importSuccess'));
        setImportId('');
        setImportConfirmation(null);
        fetchPlans();
    } catch (err: any) {
        notify('error', err.message || t('messages.importFailed'));
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
    <div className="min-h-screen bg-[#F9FAFB]">
      <nav className="bg-white border-b border-slate-200/70 px-4 lg:px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors">
          <span className="text-sm font-medium">← {t('dashboard.backToHome')}</span>
        </Link>
        <div className="flex items-center gap-4">
          <div className="hidden md:flex flex-col items-end mr-2">
             <span className="text-xs text-gray-400 font-medium">{t('nav.loggedInAs')}</span>
             <span className="text-sm font-bold text-gray-700">{user?.email}</span>
          </div>
          <Link href="/dashboard/settings" className="text-gray-400 hover:text-gray-600 transition-colors p-2">
            <Settings className="h-5 w-5" />
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-gray-500 hover:text-red-600 transition-colors bg-gray-100 hover:bg-red-50 px-3 py-2 rounded-lg text-sm font-medium"
          >
            <LogOut className="h-4 w-4" /> <span className="hidden sm:inline">{t('nav.logout')}</span>
          </button>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-8">
        {showSuccess && (
          <div className="mb-6 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-lg flex items-center justify-between">
            <span className="text-sm font-medium">
              {(() => {
                const plan = plans.find(p => p.id === searchParams.get('plan_id'));
                if (plan?.review_paid) return t('messages.reviewRequested');
                if (plan?.export_paid) return t('messages.exportUnlocked');
                return t('messages.paymentSuccess');
              })()}
            </span>
            <button onClick={() => setShowSuccess(false)} className="text-emerald-600">
              <XCircle className="w-5 h-5" />
            </button>
          </div>
        )}

        {toast && (
          <div className={`mb-6 px-4 py-3 rounded-lg flex items-center justify-between text-sm font-medium border ${
            toast.type === 'success'
              ? 'border-emerald-200 text-emerald-800 bg-emerald-50'
              : 'border-red-200 text-red-800 bg-red-50'
          }`}>
            <span>{toast.message}</span>
            <button onClick={() => setToast(null)} className={toast.type === 'success' ? 'text-emerald-600' : 'text-red-600'}>
              <XCircle className="w-5 h-5" />
            </button>
          </div>
        )}

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{t('dashboard.title')}</h1>
            <p className="text-gray-500 text-sm">{t('dashboard.subtitle')}</p>
          </div>
          <Link
            href="/builder?new=true"
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            <Plus className="h-5 w-5" />
            {t('dashboard.createNewPlan')}
          </Link>
        </div>

        <section className="mb-10">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">{t('dashboard.activeDrafts')}</h2>
          {drafts.length === 0 ? (
            <div className="text-sm text-gray-500">{t('dashboard.noActiveDrafts')}</div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
              <table className="min-w-full text-sm">
                <thead className="bg-slate-50 text-slate-600">
                  <tr>
                    <th className="text-left px-4 py-2 font-medium">{t('dashboard.tableHeaders.draft')}</th>
                    <th className="text-left px-4 py-2 font-medium">{t('dashboard.tableHeaders.business')}</th>
                    <th className="text-left px-4 py-2 font-medium">{t('dashboard.tableHeaders.updated')}</th>
                    <th className="text-right px-4 py-2 font-medium">{t('dashboard.tableHeaders.actions')}</th>
                  </tr>
                </thead>
                <tbody>
                  {drafts.map(draft => (
                    <tr key={draft.id} className="border-t border-slate-100 hover:bg-slate-50/70 transition-colors">
                      <td className="px-4 py-3">
                        {draft.name?.trim() || `HACCP Draft – ${new Date(draft.created_at).toLocaleDateString()}`}
                      </td>
                      <td className="px-4 py-3">{draft.business_name || t('dashboard.tableHeaders.draft')}</td>
                      <td className="px-4 py-3">{new Date(draft.created_at).toLocaleDateString()}</td>
                      <td className="px-4 py-3 text-right space-x-3">
                        <Link href={`/builder?draft=${draft.id}`} className="text-blue-600 hover:underline">
                          {t('actions.resume')}
                        </Link>
                        <button
                          onClick={() => handleRenameDraft(draft.id, draft.name)}
                          className="text-blue-600 hover:underline"
                        >
                          {t('actions.rename')}
                        </button>
                        <button onClick={() => handleDeleteDraft(draft.id)} className="text-red-600 hover:underline">
                          {t('actions.delete')}
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
          <h2 className="text-lg font-semibold text-gray-900 mb-3">{t('dashboard.documentsReviews')}</h2>
          {plans.length === 0 ? (
            <div className="text-sm text-gray-500">{t('dashboard.noPlansYet')}</div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
              <table className="min-w-full text-sm">
                <thead className="bg-slate-50 text-slate-600">
                  <tr>
                    <th className="text-left px-4 py-2 font-medium">{t('dashboard.tableHeaders.plan')}</th>
                    <th className="text-left px-4 py-2 font-medium">{t('dashboard.tableHeaders.date')}</th>
                    <th className="text-left px-4 py-2 font-medium">{t('dashboard.tableHeaders.files')}</th>
                    <th className="text-left px-4 py-2 font-medium">{t('dashboard.tableHeaders.review')}</th>
                    <th className="text-left px-4 py-2 font-medium">{t('dashboard.tableHeaders.summary')}</th>
                    <th className="text-right px-4 py-2 font-medium">{t('dashboard.tableHeaders.actions')}</th>
                  </tr>
                </thead>
                <tbody>
                  {/* Sort: reviews in progress first, then concluded, then others */}
                  {[...plans].sort((a, b) => {
                    const getOrder = (p: Plan) => {
                      if (p.review_status === 'in_progress' || p.review_status === 'pending' || p.review_requested) return 0;
                      if (p.review_status === 'concluded' || p.review_status === 'completed') return 1;
                      return 2;
                    };
                    return getOrder(a) - getOrder(b);
                  }).map(plan => {
                    const draftName = plan.draft_id ? draftNamesByPlanId[plan.draft_id] : undefined;
                    const planLabel = plan.business_name || draftName?.trim() || `HACCP Plan – ${new Date(plan.created_at).toLocaleDateString()}`;
                    const isExportPaid = plan.export_paid || plan.payment_status === 'paid';
                    const pdfUrl = plan.pdf_url ?? plan.full_plan?.documents?.pdf_url ?? null;
                    const docxUrl = plan.docx_url ?? plan.full_plan?.documents?.docx_url ?? null;
                    const hasReviewNotes = Boolean(plan.review_notes || plan.review_comments);

                    const isReviewInProgress = plan.review_status === 'in_progress' || plan.review_status === 'pending' || (plan.review_requested && !plan.review_status);
                    const isReviewConcluded = plan.review_status === 'completed' || plan.review_status === 'concluded';
                    const showUnderReview = !isReviewConcluded && (plan.review_requested || plan.review_status === 'pending' || plan.review_status === 'in_progress');
                    const reviewLabelKey = isReviewConcluded
                      ? 'concluded'
                      : showUnderReview
                        ? 'inProgress'
                        : plan.review_paid
                          ? 'paid'
                          : 'notRequested';
                    const reviewLabel = t(`dashboard.reviewStatus.${reviewLabelKey}`);

                    return (
                      <tr key={plan.id} className="border-t border-slate-100 hover:bg-slate-50/70 transition-colors">
                        <td className="px-4 py-3">
                          <span className="font-medium text-gray-900">{planLabel}</span>
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-500">
                          {new Date(plan.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                            {isExportPaid ? (
                              <>
                                <button onClick={() => handleDownload(plan.id, 'pdf', plan.business_name)} className="text-blue-600 hover:underline">
                                  PDF
                                </button>
                                <span className="hidden sm:inline text-slate-300">·</span>
                                <button onClick={() => handleDownload(plan.id, 'word', plan.business_name)} className="text-blue-600 hover:underline">
                                  Word
                                </button>
                              </>
                            ) : (
                              <>
                                {pdfUrl ? (
                                  <a href={pdfUrl} className="text-blue-600 hover:underline" target="_blank" rel="noreferrer">
                                    PDF
                                  </a>
                                ) : (
                                  <span className="text-gray-400">—</span>
                                )}
                                <span className="hidden sm:inline text-slate-300">·</span>
                                {docxUrl ? (
                                  <a href={docxUrl} className="text-blue-600 hover:underline" target="_blank" rel="noreferrer">
                                    Word
                                  </a>
                                ) : (
                                  <span className="text-gray-400">—</span>
                                )}
                              </>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${
                              reviewLabelKey === 'concluded'
                                ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                                : reviewLabelKey === 'inProgress'
                                  ? 'border-purple-200 bg-purple-50 text-purple-700'
                                  : reviewLabelKey === 'paid'
                                    ? 'border-blue-200 bg-blue-50 text-blue-700'
                                    : 'border-slate-200 bg-slate-50 text-slate-600'
                            }`}
                          >
                            {reviewLabelKey === 'concluded' && <span className="text-emerald-500">&#x1F7E2;</span>}
                            {reviewLabelKey === 'inProgress' && <span className="text-purple-500">&#x1F7E3;</span>}
                            {reviewLabel}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          {showUnderReview ? (
                            <span className="text-xs text-slate-500">{t('dashboard.reviewStatus.sentByEmail')}</span>
                          ) : isReviewConcluded && hasReviewNotes ? (
                            <Link href={`/dashboard/plans/${plan.id}/review`} className="text-blue-600 hover:underline text-sm">
                              {t('dashboard.viewSummary')}
                            </Link>
                          ) : (
                            <span className="text-gray-400">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex flex-col sm:flex-row justify-end items-end sm:items-center gap-2">
                            {plan.export_paid ? (
                              <span className="inline-flex items-center rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-semibold px-2 py-1 border border-emerald-200">
                                {t('actions.paid')}
                              </span>
                            ) : (
                              <button onClick={() => handleUpgrade(plan, 'professional')} className="text-blue-600 hover:underline text-sm font-medium">
                                {t('actions.unlockExport')}
                              </button>
                            )}

                            {showUnderReview ? (
                              <span className="inline-flex items-center rounded-full bg-purple-50 text-purple-700 text-[11px] font-semibold px-2 py-1 border border-purple-200">
                                {t('dashboard.reviewStatus.inReview')}
                              </span>
                            ) : plan.review_paid ? (
                              <span className="inline-flex items-center rounded-full bg-blue-50 text-blue-700 text-[11px] font-semibold px-2 py-1 border border-blue-200">
                                {t('actions.paid')}
                              </span>
                            ) : (
                              <button onClick={() => handleUpgrade(plan, 'expert')} className="text-blue-600 hover:underline text-sm font-medium">
                                {t('actions.requestReview')}
                              </button>
                            )}

                            {isReviewInProgress ? (
                              <span
                                className="text-slate-400 text-xs cursor-not-allowed"
                                title={t('messages.cannotDeleteReviewInProgress')}
                              >
                                {t('actions.delete')}
                              </span>
                            ) : (
                              <button onClick={() => handleDeletePlan(plan.id)} className="text-slate-400 hover:text-slate-600 text-xs">
                                {t('actions.delete')}
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <div className={`mt-12 border-t p${'t-8'}`}>
            <div className="max-w-xl">
                <h3 className="text-lg font-bold text-gray-900 mb-2">{t('dashboard.missingPlan')}</h3>
                <p className="text-gray-500 text-sm mb-4">
                    {t('dashboard.missingPlanDesc')}
                </p>
                <form onSubmit={handleImport} className="flex gap-3">
                    <div className="relative flex-1">
                        <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder={t('dashboard.pastePlanId')}
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
                        {importing ? t('dashboard.importing') : t('dashboard.importPlan')}
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
                        <h3 className="font-bold text-lg">{t('dashboard.confirmImport')}</h3>
                    </div>
                    <p className="text-gray-600 mb-6">
                        {t('dashboard.confirmImportDesc')} <span className="font-mono bg-gray-100 px-2 py-0.5 rounded font-bold text-gray-800">{importConfirmation}</span>.
                        <br/><br/>
                        {t('dashboard.ensureCorrectId')}
                    </p>
                    <div className="flex gap-3 justify-end">
                        <button
                            onClick={() => setImportConfirmation(null)}
                            className="px-4 py-2 text-gray-600 font-bold hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            {t('actions.cancel')}
                        </button>
                        <button
                            onClick={confirmImport}
                            disabled={importing}
                            className="px-4 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                        >
                            {importing && <Loader2 className="w-4 h-4 animate-spin" />}
                            {importing ? t('dashboard.importing') : t('dashboard.yesImportPlan')}
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
