'use client';

import { useState } from 'react';
import { createClient } from '@/utils/supabase/client';

type ReviewStatusToggleProps = {
  planId: string;
  initialStatus: string | null;
  onStatusChange?: (newStatus: string) => void;
};

export default function ReviewStatusToggle({
  planId,
  initialStatus,
  onStatusChange,
}: ReviewStatusToggleProps) {
  const supabase = createClient();
  const [status, setStatus] = useState(initialStatus);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isConcluded = status === 'concluded' || status === 'reviewed';

  const handleToggle = async () => {
    setLoading(true);
    setError(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setError('Not authenticated');
        return;
      }

      const newStatus = isConcluded ? 'in_progress' : 'concluded';

      const res = await fetch('/api/admin/review-status', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ planId, status: newStatus }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to update status');
      }

      setStatus(data.plan.review_status);
      onStatusChange?.(data.plan.review_status);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handleToggle}
        disabled={loading}
        className={`inline-flex items-center justify-center rounded-lg px-3 py-2 text-xs font-semibold transition ${
          isConcluded
            ? 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
            : 'bg-emerald-600 text-white hover:bg-emerald-700'
        } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        {loading ? (
          <span className="flex items-center gap-1">
            <svg
              className="animate-spin h-3 w-3"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
            Updating...
          </span>
        ) : isConcluded ? (
          'Reopen'
        ) : (
          'Mark concluded'
        )}
      </button>
      {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
  );
}
