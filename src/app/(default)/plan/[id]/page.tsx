"use client";

import { useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';

export default function PlanRedirect() {
  const router = useRouter();
  const params = useParams();

  useEffect(() => {
    if (params?.id) {
      router.replace(`/builder?id=${params.id}`);
    } else {
      router.replace('/builder');
    }
  }, [params, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="text-center space-y-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto" />
        <p className="text-slate-500 font-medium">Redirecting to your plan...</p>
      </div>
    </div>
  );
}
