import { NextResponse } from 'next/server';
import { supabaseService } from '@/lib/supabase';

const ADMIN_EMAILS = ['admin@ilovehaccp.com', 'joao@ilovehaccp.com'];

// Lightweight selection for list views
const LIST_COLUMNS = `
  id, 
  created_at, 
  business_name, 
  business_type, 
  product_name, 
  product_description,
  payment_status, 
  tier, 
  status, 
  review_requested, 
  review_status, 
  review_comments
`;

export async function GET(req: Request) {
  try {
    // 1. Auth Check
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseService.auth.getUser(token);

    if (authError || !user || !user.email) return NextResponse.json({ error: 'Invalid Session' }, { status: 401 });

    if (!ADMIN_EMAILS.includes(user.email)) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // 2. Pagination Params
    const url = new URL(req.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '20');
    
    // Validate
    const safeLimit = Math.min(Math.max(limit, 1), 100); // Max 100 per page
    const safePage = Math.max(page, 1);
    
    const from = (safePage - 1) * safeLimit;
    const to = from + safeLimit - 1;

    // 3. Fetch Data
    const { data: plans, count, error } = await supabaseService
        .from('plans')
        .select(LIST_COLUMNS, { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(from, to);

    if (error) throw error;

    return NextResponse.json({ 
        plans, 
        pagination: {
            page: safePage,
            limit: safeLimit,
            total: count || 0,
            totalPages: Math.ceil((count || 0) / safeLimit)
        }
    });

  } catch (error: any) {
    console.error('Admin Plans List Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}