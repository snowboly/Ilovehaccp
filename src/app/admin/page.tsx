import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import { checkAdminRole } from '@/lib/admin-auth';
import Link from 'next/link';
import { supabaseService } from '@/lib/supabase';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

type PlanRow = {
  id: string;
  created_at: string;
  review_status: string | null;
  review_requested: boolean | null;
  draft_id: string | null;
  user_id: string | null;
  reviewed_at?: string | null;
};

type DraftRow = {
  id: string;
  name: string | null;
  created_at: string;
};

type ReviewRow = {
  plan_id: string;
  created_at: string;
  reviewer_id: string | null;
};

const formatDate = (value?: string | null) => {
  if (!value) return '—';
  return new Date(value).toLocaleDateString();
};

export default async function AdminPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login?next=/admin');
  }

  const isAdmin = await checkAdminRole(user.id, user.email);
  if (!isAdmin) {
    redirect('/dashboard');
  }

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const sevenDaysAgoIso = sevenDaysAgo.toISOString();

  const [
    { data: queuePlans },
    { data: reviewedPlans },
    { count: recentReviewedCount },
    { count: recentPlansCount },
  ] = await Promise.all([
    supabaseService
      .from('plans')
      .select('id, created_at, review_status, review_requested, draft_id, user_id')
      .eq('review_requested', true)
      .or('review_status.is.null,review_status.neq.reviewed')
      .order('created_at', { ascending: true }),
    supabaseService
      .from('plans')
      .select('id, created_at, review_status, review_requested, draft_id, user_id, reviewed_at')
      .eq('review_status', 'reviewed')
      .order('reviewed_at', { ascending: false, nullsFirst: false })
      .order('created_at', { ascending: false }),
    supabaseService
      .from('plans')
      .select('id', { count: 'exact', head: true })
      .eq('review_status', 'reviewed')
      .gte('reviewed_at', sevenDaysAgoIso),
    supabaseService
      .from('plans')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', sevenDaysAgoIso),
  ]);

  const queuedPlans = (queuePlans ?? []) as PlanRow[];
  const completedPlans = (reviewedPlans ?? []) as PlanRow[];
  const allPlans = [...queuedPlans, ...completedPlans];
  const draftIds = Array.from(new Set(allPlans.map((plan) => plan.draft_id).filter(Boolean))) as string[];
  const userIds = Array.from(new Set(allPlans.map((plan) => plan.user_id).filter(Boolean))) as string[];
  const completedPlanIds = completedPlans.map((plan) => plan.id);

  const [{ data: drafts }, { data: completedReviews }, userResponses] = await Promise.all([
    draftIds.length > 0
      ? supabaseService
        .from('drafts')
        .select('id, name, created_at')
        .in('id', draftIds)
      : Promise.resolve({ data: [] as DraftRow[] }),
    completedPlanIds.length > 0
      ? supabaseService
        .from('reviews')
        .select('plan_id, created_at, reviewer_id')
        .in('plan_id', completedPlanIds)
        .order('created_at', { ascending: false })
      : Promise.resolve({ data: [] as ReviewRow[] }),
    Promise.all(userIds.map((userId) => supabaseService.auth.admin.getUserById(userId))),
  ]);

  const draftMap = new Map((drafts ?? []).map((draft) => [draft.id, draft]));
  const userEmailMap = new Map<string, string>();
  userResponses.forEach((response) => {
    const email = response.data?.user?.email;
    const id = response.data?.user?.id;
    if (id && email) {
      userEmailMap.set(id, email);
    }
  });
  const reviewMap = new Map<string, ReviewRow>();
  const reviewerIds = new Set<string>();
  (completedReviews ?? []).forEach((review) => {
    if (!reviewMap.has(review.plan_id)) {
      reviewMap.set(review.plan_id, review);
    }
    if (review.reviewer_id) {
      reviewerIds.add(review.reviewer_id);
    }
  });
  const reviewerLookups = await Promise.all(
    Array.from(reviewerIds)
      .filter((reviewerId) => !userEmailMap.has(reviewerId))
      .map((reviewerId) => supabaseService.auth.admin.getUserById(reviewerId))
  );
  reviewerLookups.forEach((response) => {
    const email = response.data?.user?.email;
    const id = response.data?.user?.id;
    if (id && email) {
      userEmailMap.set(id, email);
    }
  });

  const queueCount = queuedPlans.length;
  const completedCount = completedPlans.length;
  const recentReviewedTotal = recentReviewedCount ?? 0;
  const recentPlansTotal = recentPlansCount ?? 0;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-black text-slate-900">Admin Dashboard</h1>
        <p className="text-sm text-slate-500">Review queue overview.</p>
      </header>

      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Pending Reviews</p>
          <p className="mt-2 text-3xl font-black text-amber-500">{queueCount}</p>
          <p className="mt-1 text-xs text-slate-500">Awaiting review assignment.</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Reviews Completed (7d)</p>
          <p className="mt-2 text-3xl font-black text-emerald-600">{recentReviewedTotal}</p>
          <p className="mt-1 text-xs text-slate-500">Completed in the last week.</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Plans Generated (7d)</p>
          <p className="mt-2 text-3xl font-black text-blue-600">{recentPlansTotal}</p>
          <p className="mt-1 text-xs text-slate-500">New plans created in 7 days.</p>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900">Review Queue</h2>
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">{queueCount} total</span>
        </div>
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs font-bold uppercase text-slate-500">
              <tr>
                <th className="p-4">Plan</th>
                <th className="p-4">User</th>
                <th className="p-4">Tier</th>
                <th className="p-4">Requested</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {queuedPlans.map((plan) => {
                const draft = plan.draft_id ? draftMap.get(plan.draft_id) : null;
                const draftLabel = draft?.name?.trim() || `HACCP Plan – ${formatDate(plan.created_at)}`;
                const userEmail = plan.user_id ? userEmailMap.get(plan.user_id) : null;
                const statusLabel = plan.review_status ? 'In Review' : 'Pending';
                return (
                  <tr key={plan.id} className="transition-colors hover:bg-slate-50">
                    <td className="p-4">
                      <div className="font-semibold text-slate-900">{draftLabel}</div>
                      <div className="text-xs font-mono text-slate-400">{plan.id}</div>
                    </td>
                    <td className="p-4 text-sm text-slate-600">{userEmail ?? '—'}</td>
                    <td className="p-4 text-sm text-slate-600">{plan.review_requested ? '€99' : '—'}</td>
                    <td className="p-4 text-sm text-slate-600">{formatDate(plan.created_at)}</td>
                    <td className="p-4">
                      <span className="rounded-full bg-amber-50 px-2 py-1 text-xs font-semibold uppercase text-amber-600">
                        {statusLabel}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <Link
                        href={`/admin/plans/${plan.id}/review`}
                        className="inline-flex items-center justify-center rounded-lg bg-slate-900 px-3 py-2 text-xs font-semibold text-white transition hover:bg-slate-800"
                      >
                        Review
                      </Link>
                    </td>
                  </tr>
                );
              })}
              {queueCount === 0 && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-sm text-slate-400">
                    No plans are waiting for review.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900">Completed Reviews</h2>
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">{completedCount} total</span>
        </div>
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs font-bold uppercase text-slate-500">
              <tr>
                <th className="p-4">Plan</th>
                <th className="p-4">User</th>
                <th className="p-4">Reviewed On</th>
                <th className="p-4">Reviewer</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">View</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {completedPlans.map((plan) => {
                const draft = plan.draft_id ? draftMap.get(plan.draft_id) : null;
                const draftLabel = draft?.name?.trim() || `HACCP Plan – ${formatDate(plan.created_at)}`;
                const userEmail = plan.user_id ? userEmailMap.get(plan.user_id) : null;
                const latestReview = reviewMap.get(plan.id);
                const reviewedOn = plan.reviewed_at || latestReview?.created_at || null;
                const reviewerId = latestReview?.reviewer_id ?? null;
                const reviewerLabel = reviewerId
                  ? userEmailMap.get(reviewerId) ?? `${reviewerId.slice(0, 8)}…`
                  : '—';
                return (
                  <tr key={plan.id} className="transition-colors hover:bg-slate-50">
                    <td className="p-4">
                      <div className="font-semibold text-slate-900">{draftLabel}</div>
                      <div className="text-xs font-mono text-slate-400">{plan.id}</div>
                    </td>
                    <td className="p-4 text-sm text-slate-600">{userEmail ?? '—'}</td>
                    <td className="p-4 text-sm text-slate-600">{formatDate(reviewedOn)}</td>
                    <td className="p-4 text-sm text-slate-600">{reviewerLabel}</td>
                    <td className="p-4">
                      <span className="rounded-full bg-emerald-50 px-2 py-1 text-xs font-semibold uppercase text-emerald-600">
                        Reviewed
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <Link
                        href={`/admin/plans/${plan.id}/review`}
                        className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                );
              })}
              {completedCount === 0 && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-sm text-slate-400">
                    No completed reviews yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
