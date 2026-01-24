import { redirect, notFound } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import { Resend } from 'resend';
import { checkAdminRole } from '@/lib/admin-auth';
import { supabaseService } from '@/lib/supabase';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

type ReviewPageProps = {
  params: Promise<{ planId: string }>;
  searchParams?: Promise<{ edit?: string; submitted?: string }>;
};

type ReviewNotes = {
  major: string[];
  minor: string[];
  general: string;
};

type ReviewRecord = {
  id: string;
  content: ReviewNotes | null;
  created_at: string;
  reviewer_id: string | null;
};

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

const sendEmail = async (to: string, subject: string, body: string) => {
  if (!resend) {
    console.log('Email stub:', { to, subject, body });
    return;
  }

  const { error } = await resend.emails.send({
    from: 'iLoveHACCP <noreply@ilovehaccp.com>',
    to: [to],
    subject,
    html: body,
  });

  if (error) {
    console.error('Failed to send review email:', error);
  }
};

export default async function AdminPlanReviewPage({ params, searchParams }: ReviewPageProps) {
  const { planId } = await params;
  const resolvedSearchParams = await searchParams;
  const isEditing = resolvedSearchParams?.edit === '1';
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?next=/admin/plans/${planId}/review`);
  }

  const isAdmin = await checkAdminRole(user.id, user.email);
  if (!isAdmin) {
    redirect('/dashboard');
  }

  const { data: plan, error: planError } = await supabaseService
    .from('plans')
    .select('id, created_at, user_id, draft_id, product_name, review_status, reviewed_at')
    .eq('id', planId)
    .maybeSingle();

  if (planError) {
    throw planError;
  }

  if (!plan) {
    notFound();
  }

  const [userResponse, draftResponse, reviewResponse] = await Promise.all([
    plan.user_id
      ? supabaseService.auth.admin.getUserById(plan.user_id)
      : Promise.resolve({ data: { user: null }, error: null }),
    plan.draft_id
      ? supabaseService.from('drafts').select('id, name, plan_data, created_at').eq('id', plan.draft_id).maybeSingle()
      : Promise.resolve({ data: null, error: null }),
    supabaseService
      .from('reviews')
      .select('id, content, created_at, reviewer_id')
      .eq('plan_id', planId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  const userEmail = userResponse.data?.user?.email ?? 'Unknown';
  const draftName = draftResponse.data?.name?.trim();
  const fallbackDraftLabel = draftResponse.data
    ? `Draft – ${new Date(draftResponse.data.created_at).toLocaleDateString()}`
    : 'Not linked';
  const latestReview = reviewResponse.data as ReviewRecord | null;
  const latestNotes = latestReview?.content ?? null;
  const draftProductName =
    (draftResponse.data?.plan_data as { product_name?: string; productName?: string } | null)?.product_name
    ?? (draftResponse.data?.plan_data as { product_name?: string; productName?: string } | null)?.productName
    ?? null;
  const productName = plan.product_name || draftProductName || 'Not provided';
  const isReviewed = plan.review_status === 'reviewed';
  const isReadOnly = isReviewed && !isEditing;

  const parseNotes = (formData: FormData): ReviewNotes => {
    const major = formData
      .get('major')
      ?.toString()
      .split('\n')
      .map((entry) => entry.trim())
      .filter(Boolean) ?? [];
    const minor = formData
      .get('minor')
      ?.toString()
      .split('\n')
      .map((entry) => entry.trim())
      .filter(Boolean) ?? [];
    const general = formData.get('general')?.toString().trim() ?? '';

    return { major, minor, general };
  };

  const handleSaveReview = async (formData: FormData) => {
    'use server';

    const formSupabase = await createClient();
    const { data: { user: formUser } } = await formSupabase.auth.getUser();
    if (!formUser) {
      redirect(`/login?next=/admin/plans/${planId}/review`);
    }

    const formIsAdmin = await checkAdminRole(formUser.id, formUser.email);
    if (!formIsAdmin) {
      redirect('/dashboard');
    }

    const { data: currentPlan, error: currentPlanError } = await supabaseService
      .from('plans')
      .select('review_status, user_id')
      .eq('id', planId)
      .maybeSingle();

    if (currentPlanError) {
      throw currentPlanError;
    }

    const editMode = formData.get('edit_mode') === 'true';
    const wasReviewed = currentPlan?.review_status === 'reviewed';
    if (wasReviewed && !editMode) {
      throw new Error('Review is locked. Enable edit mode to update notes.');
    }

    const reviewNotes = parseNotes(formData);

    const { error: reviewInsertError } = await supabaseService
      .from('reviews')
      .insert({
        plan_id: planId,
        reviewer_id: formUser.id,
        content: reviewNotes,
      });

    if (reviewInsertError) {
      throw reviewInsertError;
    }

    const { error: updateError } = await supabaseService
      .from('plans')
      .update({
        review_status: 'reviewed',
        reviewed_at: new Date().toISOString(),
      })
      .eq('id', planId);

    if (updateError) {
      throw updateError;
    }

    if (!wasReviewed && currentPlan?.user_id) {
      const { data: ownerData, error: ownerError } = await supabaseService.auth.admin.getUserById(currentPlan.user_id);
      const ownerEmail = ownerData?.user?.email;
      if (ownerError) {
        console.error('Failed to fetch plan owner for review email:', ownerError);
      } else if (ownerEmail) {
        const reviewLink = `https://www.ilovehaccp.com/dashboard/plans/${planId}/review`;
        await sendEmail(
          ownerEmail,
          'Your HACCP Review Is Ready',
          `
            <div style="font-family: sans-serif; color: #333;">
              <h2>Your HACCP Review Is Ready</h2>
              <p>Your review has been completed and is available now.</p>
              <p>
                <a href="${reviewLink}" style="background-color: #2563eb; color: #fff; padding: 12px 18px; border-radius: 6px; text-decoration: none; display: inline-block;">
                  View Review
                </a>
              </p>
              <p style="font-size: 12px; color: #666;">Or copy this link: ${reviewLink}</p>
            </div>
          `
        );
      }
    }

    redirect(`/admin/plans/${planId}/review?submitted=1`);
  };

  const handleSaveDraft = async (formData: FormData) => {
    'use server';

    const formSupabase = await createClient();
    const { data: { user: formUser } } = await formSupabase.auth.getUser();
    if (!formUser) {
      redirect(`/login?next=/admin/plans/${planId}/review`);
    }

    const formIsAdmin = await checkAdminRole(formUser.id, formUser.email);
    if (!formIsAdmin) {
      redirect('/dashboard');
    }

    const { data: currentPlan, error: currentPlanError } = await supabaseService
      .from('plans')
      .select('review_status')
      .eq('id', planId)
      .maybeSingle();

    if (currentPlanError) {
      throw currentPlanError;
    }

    const editMode = formData.get('edit_mode') === 'true';
    const wasReviewed = currentPlan?.review_status === 'reviewed';
    if (wasReviewed && !editMode) {
      throw new Error('Review is locked. Enable edit mode to update notes.');
    }

    const reviewNotes = parseNotes(formData);

    const { error: reviewInsertError } = await supabaseService
      .from('reviews')
      .insert({
        plan_id: planId,
        reviewer_id: formUser.id,
        content: reviewNotes,
      });

    if (reviewInsertError) {
      throw reviewInsertError;
    }

    redirect(`/admin/plans/${planId}/review?draft=1`);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-[0.2em] text-slate-500 font-semibold">Admin Review</p>
        <h1 className="text-3xl font-black text-slate-900">HACCP Draft Review</h1>
        <p className="text-sm text-slate-500">Review the plan context and capture feedback.</p>
      </header>

      <section className="bg-white rounded-2xl border border-slate-200 shadow-sm">
        <div className="border-b border-slate-200 px-6 py-4">
          <h2 className="text-lg font-bold text-slate-900">Context</h2>
        </div>
        <div className="p-6 grid gap-6 md:grid-cols-2">
          <div>
            <p className="text-xs text-slate-400 uppercase tracking-wide">Plan ID</p>
            <p className="text-sm font-mono text-slate-700 break-all">{plan.id}</p>
          </div>
          <div>
            <p className="text-xs text-slate-400 uppercase tracking-wide">Created At</p>
            <p className="text-sm text-slate-700">{new Date(plan.created_at).toLocaleString()}</p>
          </div>
          <div>
            <p className="text-xs text-slate-400 uppercase tracking-wide">User Email</p>
            <p className="text-sm text-slate-700">{userEmail}</p>
          </div>
          <div>
            <p className="text-xs text-slate-400 uppercase tracking-wide">Draft</p>
            <p className="text-sm text-slate-700">
              {draftName || fallbackDraftLabel}
            </p>
            {plan.draft_id && (
              <p className="text-xs font-mono text-slate-400">Draft ID: {plan.draft_id}</p>
            )}
          </div>
          <div>
            <p className="text-xs text-slate-400 uppercase tracking-wide">Product Name</p>
            <p className="text-sm text-slate-700">{productName}</p>
          </div>
        </div>
      </section>

      <section className="bg-white rounded-2xl border border-slate-200 shadow-sm">
        <div className="border-b border-slate-200 px-6 py-4">
          <h2 className="text-lg font-bold text-slate-900">Review Form</h2>
          <p className="text-sm text-slate-500">Capture structured feedback before finalizing the review.</p>
        </div>
        <form action={handleSaveReview} className="p-6 space-y-6">
          <input type="hidden" name="edit_mode" value={isEditing ? 'true' : 'false'} />
          <div className="space-y-2">
            <label htmlFor="major" className="text-sm font-semibold text-slate-700">Major Gaps</label>
            <p className="text-xs text-slate-500">Enter one item per line.</p>
            <textarea
              id="major"
              name="major"
              rows={4}
              defaultValue={latestNotes?.major?.join('\n') ?? ''}
              readOnly={isReadOnly}
              className={`w-full rounded-xl border px-4 py-3 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 ${isReadOnly ? 'border-slate-100 bg-slate-50 text-slate-500' : 'border-slate-200'}`}
              placeholder="List major gaps..."
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="minor" className="text-sm font-semibold text-slate-700">Minor Gaps</label>
            <p className="text-xs text-slate-500">Enter one item per line.</p>
            <textarea
              id="minor"
              name="minor"
              rows={4}
              defaultValue={latestNotes?.minor?.join('\n') ?? ''}
              readOnly={isReadOnly}
              className={`w-full rounded-xl border px-4 py-3 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 ${isReadOnly ? 'border-slate-100 bg-slate-50 text-slate-500' : 'border-slate-200'}`}
              placeholder="List minor gaps..."
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="general" className="text-sm font-semibold text-slate-700">General Comments</label>
            <textarea
              id="general"
              name="general"
              rows={5}
              defaultValue={latestNotes?.general ?? ''}
              readOnly={isReadOnly}
              className={`w-full rounded-xl border px-4 py-3 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 ${isReadOnly ? 'border-slate-100 bg-slate-50 text-slate-500' : 'border-slate-200'}`}
              placeholder="Add general review comments..."
            />
          </div>
          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-500">
              Current status: <span className="font-semibold text-slate-700">{plan.review_status || 'unreviewed'}</span>
              {latestReview?.created_at && (
                <span className="ml-2 text-slate-400">Last review {new Date(latestReview.created_at).toLocaleString()}</span>
              )}
            </p>
            <div className="flex items-center gap-3">
              {isReviewed && !isEditing && (
                <a
                  href={`/admin/plans/${planId}/review?edit=1`}
                  className="inline-flex items-center justify-center rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 transition hover:border-slate-300"
                >
                  Edit Review
                </a>
              )}
              {isEditing && (
                <a
                  href={`/admin/plans/${planId}/review`}
                  className="inline-flex items-center justify-center rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-500 transition hover:border-slate-300"
                >
                  Cancel Edit
                </a>
              )}
              {!isReadOnly && (
                <>
                  <button
                    type="submit"
                    className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
                  >
                    Save Review
                  </button>
                  <button
                    type="submit"
                    formAction={handleSaveDraft}
                    className="inline-flex items-center justify-center rounded-xl border border-slate-200 px-5 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300"
                  >
                    Save Draft
                  </button>
                </>
              )}
            </div>
          </div>
        </form>
      </section>
    </div>
  );
}
