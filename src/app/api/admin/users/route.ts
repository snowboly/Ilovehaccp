import { NextResponse } from 'next/server';
import { supabaseService } from '@/lib/supabase';

const ADMIN_EMAILS = [
    'admin@ilovehaccp.com', 
    'joao@scriptworkflow.com'
];

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

    // List users
    const { data, error } = await supabaseService.auth.admin.listUsers({
        page: safePage,
        perPage: safeLimit
    });

    if (error) throw error;

    const users = data.users || [];
    const total = (data as any).total || 0;

    // Get plan counts for each user to enrich
    const enrichedUsers = await Promise.all(users.map(async (u) => {
        const { count } = await supabaseService
            .from('plans')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', u.id);
        
        return {
            id: u.id,
            email: u.email,
            created_at: u.created_at,
            last_sign_in_at: u.last_sign_in_at,
            plan_count: count || 0
        };
    }));

    return NextResponse.json({ 
        users: enrichedUsers,
        pagination: {
            page: safePage,
            limit: safeLimit,
            total: total || 0,
            totalPages: Math.ceil((total || 0) / safeLimit)
        }
    });

  } catch (error: any) {
    console.error('Admin Users Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
