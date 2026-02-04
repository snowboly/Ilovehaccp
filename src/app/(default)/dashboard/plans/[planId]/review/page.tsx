import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/server';
import { supabaseService } from '@/lib/supabase';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

type ReviewNotes = {
  major?: string[];
  minor?: string[];
  general?: string;
};

type ReviewRecord = {
  id: string;
  content: ReviewNotes | null;
  created_at: string;
};

type PlanRow = {
  id: string;
  user_id: string | null;
};

const formatDateTime = (value?: string | null) => {
  if (!value) return '—';
  return new Date(value).toLocaleString();
};

export default async function PlanReviewPage({ params }: { params: Promise<{ planId: string }> }) {
  const { planId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?next=/dashboard/plans/${planId}/review`);
  }

  const { data: plan, error: planError } = await supabaseService
    .from('plans')
    .select('id, user_id')
    .eq('id', planId)
    .maybeSingle();

  if (planError) {
    throw planError;
  }

  if (!plan) {
    notFound();
  }

  if (plan.user_id && plan.user_id !== user.id) {
    redirect('/dashboard');
  }

  const { data: review } = await supabaseService
    .from('reviews')
    .select('id, content, created_at')
    .eq('plan_id', planId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  const latestReview = review as ReviewRecord | null;
  const notes = latestReview?.content ?? null;
  const major = notes?.major ?? [];
  const minor = notes?.minor ?? [];
  const general = notes?.general ?? '';

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-6 py-10 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Review Feedback</h1>
          <Link href="/dashboard" className="text-blue-600 hover:underline">
            Back to Dashboard
          </Link>
        </div>

        {!latestReview && (
          <div className="rounded-lg border border-dashed border-gray-200 bg-white p-6 text-sm text-gray-500">
            No review has been shared yet.
          </div>
        )}

        {latestReview && (
          <div className="rounded-lg border bg-white p-6 shadow-sm space-y-5">
            <div className="text-sm text-gray-500">
              Reviewed on: <span className="font-semibold text-gray-900">{formatDateTime(latestReview.created_at)}</span>
            </div>
            <div>
              <h2 className="text-sm font-semibold text-gray-900 mb-2">Major gaps</h2>
              {major.length > 0 ? (
                <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                  {major.map((gap, index) => (
                    <li key={index}>{gap}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-500">None</p>
              )}
            </div>
            <div>
              <h2 className="text-sm font-semibold text-gray-900 mb-2">Minor gaps</h2>
              {minor.length > 0 ? (
                <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                  {minor.map((gap, index) => (
                    <li key={index}>{gap}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-500">None</p>
              )}
            </div>
            <div>
              <h2 className="text-sm font-semibold text-gray-900 mb-2">General comments</h2>
              {general ? (
                <p className="whitespace-pre-wrap text-sm text-gray-700">{general}</p>
              ) : (
                <p className="text-sm text-gray-500">None</p>
              )}
            </div>
            <p className="text-xs text-gray-400">Feedback only — not approval.</p>
          </div>
        )}
      </div>
    </div>
  );
}
