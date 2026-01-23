"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import Link from "next/link";

interface PlanReview {
  id: string;
  user_id?: string | null;
  review_notes?: {
    major?: string[];
    minor?: string[];
    general?: string;
    major_gaps?: string[];
    minor_gaps?: string[];
    general_notes?: string;
  } | null;
  review_comments?: string | null;
  review_status?: string | null;
  reviewed_at?: string | null;
}

export default function PlanReviewPage({ params }: { params: { planId: string } }) {
  const supabase = createClient();
  const router = useRouter();
  const [plan, setPlan] = useState<PlanReview | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadPlan = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push("/login");
        return;
      }

      try {
        const res = await fetch(`/api/plans/${params.planId}`, {
          headers: { Authorization: `Bearer ${session.access_token}` },
        });
        if (!res.ok) {
          const data = await res.json().catch(() => null);
          throw new Error(data?.error || "Failed to load review notes.");
        }
        const data = await res.json();
        setPlan(data.plan || null);
      } catch (err: any) {
        setError(err.message || "Failed to load review notes.");
      }
    };

    loadPlan();
  }, [params.planId, router, supabase]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Review Notes</h1>
          <Link href="/dashboard" className="text-blue-600 hover:underline">
            Back to Dashboard
          </Link>
        </div>

        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-800 text-sm">
            {error}
          </div>
        )}

        {!error && !plan && (
          <div className="text-sm text-gray-500">Loading review notes…</div>
        )}

        {plan && (
          <div className="rounded-lg border bg-white p-6 shadow-sm space-y-4">
            <div className="text-sm text-gray-500">
              Status: <span className="font-semibold text-gray-900">{plan.review_status || "Not available"}</span>
            </div>
            {plan.reviewed_at && (
              <div className="text-sm text-gray-500">
                Reviewed at: <span className="font-semibold text-gray-900">{new Date(plan.reviewed_at).toLocaleString()}</span>
              </div>
            )}
            <div>
              <h2 className="text-sm font-semibold text-gray-900 mb-2">Notes</h2>
              {plan.review_notes ? (
                <div className="space-y-4 text-sm text-gray-700">
                  <div>
                    <div className="font-semibold text-gray-900 mb-1">Major gaps</div>
                    {(plan.review_notes.major ?? plan.review_notes.major_gaps ?? []).length ? (
                      <ul className="list-disc list-inside space-y-1">
                        {(plan.review_notes.major ?? plan.review_notes.major_gaps ?? []).map((gap, index) => (
                          <li key={index}>{gap}</li>
                        ))}
                      </ul>
                    ) : (
                      <div className="text-gray-500">None</div>
                    )}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900 mb-1">Minor gaps</div>
                    {(plan.review_notes.minor ?? plan.review_notes.minor_gaps ?? []).length ? (
                      <ul className="list-disc list-inside space-y-1">
                        {(plan.review_notes.minor ?? plan.review_notes.minor_gaps ?? []).map((gap, index) => (
                          <li key={index}>{gap}</li>
                        ))}
                      </ul>
                    ) : (
                      <div className="text-gray-500">None</div>
                    )}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900 mb-1">General comments</div>
                    {plan.review_notes.general ?? plan.review_notes.general_notes ? (
                      <p className="whitespace-pre-wrap">{plan.review_notes.general ?? plan.review_notes.general_notes}</p>
                    ) : (
                      <div className="text-gray-500">None</div>
                    )}
                  </div>
                </div>
              ) : plan.review_comments ? (
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{plan.review_comments}</p>
              ) : (
                <p className="text-sm text-gray-500">No review available.</p>
              )}
            </div>
            <p className="text-xs text-gray-400">Feedback only — not approval.</p>
          </div>
        )}
      </div>
    </div>
  );
}
