import { NextResponse } from 'next/server';
import { supabaseService } from '@/lib/supabase';
import { ADMIN_EMAILS } from '@/lib/constants';

export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseService.auth.getUser(token);

    if (authError || !user || !user.email) return NextResponse.json({ error: 'Invalid Session' }, { status: 401 });

    if (!ADMIN_EMAILS.includes(user.email)) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

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
