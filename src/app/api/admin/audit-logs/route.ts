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
