import { NextResponse } from 'next/server';
import { supabaseService } from '@/lib/supabase';
import { validateAdminRequest } from '@/lib/admin-auth';

export async function GET(req: Request) {
  try {
    const { user, error: authError, status } = await validateAdminRequest(req);
    if (authError || !user) return NextResponse.json({ error: authError }, { status: status || 401 });

    // Parallel Fetching
    const [
        { count: totalPlans },
        { count: pendingReviews },
        { count: completedReviews },
        { count: paidPlans }
    ] = await Promise.all([
        supabaseService.from('plans').select('*', { count: 'exact', head: true }),
        supabaseService.from('plans').select('*', { count: 'exact', head: true }).eq('review_requested', true).neq('review_status', 'completed'),
        supabaseService.from('plans').select('*', { count: 'exact', head: true }).eq('review_status', 'completed'),
        supabaseService.from('plans').select('*', { count: 'exact', head: true }).eq('payment_status', 'paid')
    ]);

    return NextResponse.json({ 
        stats: {
            totalPlans: totalPlans || 0,
            pendingReviews: pendingReviews || 0,
            completedReviews: completedReviews || 0,
            paidPlans: paidPlans || 0
        }
    });

  } catch (error: any) {
    console.error('Admin Stats Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
