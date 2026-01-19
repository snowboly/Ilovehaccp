import { NextResponse } from 'next/server';
import { supabaseService } from '@/lib/supabase';
import { validateAdminRequest } from '@/lib/admin-auth';

export async function GET(req: Request) {
  try {
    const { user, error: authError, status } = await validateAdminRequest(req);
    if (authError || !user) return NextResponse.json({ error: authError }, { status: status || 401 });

    // Pagination Params
    const url = new URL(req.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '50');
    const safeLimit = Math.min(Math.max(limit, 1), 100);
    const safePage = Math.max(page, 1);
    
    const from = (safePage - 1) * safeLimit;
    const to = from + safeLimit - 1;

    const { data: logs, count, error } = await supabaseService
        .from('access_logs')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(from, to);

    if (error) throw error;

    return NextResponse.json({ 
        logs,
        pagination: {
            page: safePage,
            limit: safeLimit,
            total: count || 0,
            totalPages: Math.ceil((count || 0) / safeLimit)
        }
    });

  } catch (error: any) {
    console.error('Admin Audit Logs Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
