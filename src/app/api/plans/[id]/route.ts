
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { createClient } from '@/utils/supabase/server';
import { checkAdminRole } from '@/lib/admin-auth';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (!id) {
    return NextResponse.json({ error: 'Missing plan ID' }, { status: 400 });
  }

  try {
    // 1. Initialize RLS-enabled client (uses Cookies)
    const supabase = await createClient();

    // 2. Authenticate
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 3. Check Admin Status
    // Note: checkAdminRole internally uses the service role, which is correct for permission checks.
    const isAdmin = await checkAdminRole(user.id, user.email);

    // 4. Fetch Data (Branching Logic)
    let plan;
    let fetchError;

    if (isAdmin) {
      // Admin: Use Service Role (Bypass RLS) to ensure access to any plan
      const res = await supabaseAdmin
        .from('plans')
        .select('*')
        .eq('id', id)
        .single();
      plan = res.data;
      fetchError = res.error;
    } else {
      // User: Use RLS Client (Enforce RLS)
      // IDOR Protection: DB will return null/error if user doesn't own the plan
      const res = await supabase
        .from('plans')
        .select('*')
        .eq('id', id)
        .single();
      plan = res.data;
      fetchError = res.error;
    }

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        return NextResponse.json({ error: 'Plan not found' }, { status: 404 });
      }
      throw fetchError;
    }
    if (!plan) return NextResponse.json({ error: 'Plan not found' }, { status: 404 });

    return NextResponse.json({ plan });
  } catch (error: any) {
    console.error('Fetch Plan Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (!id) {
    return NextResponse.json({ error: 'Missing plan ID' }, { status: 400 });
  }

  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseService.auth.getUser(token);
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: plan, error: fetchError } = await supabaseService
      .from('plans')
      .select('id, user_id')
      .eq('id', id)
      .single();

    if (fetchError || !plan) {
      return NextResponse.json({ error: 'Plan not found' }, { status: 404 });
    }

    const isAdmin = await checkAdminRole(user.id, user.email);
    if (plan.user_id && plan.user_id !== user.id && !isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Remove version history first to avoid FK conflicts
    const { error: versionsError } = await supabaseService
      .from('haccp_plan_versions')
      .delete()
      .eq('plan_id', id);

    if (versionsError) {
      console.error('Failed to delete plan versions:', versionsError);
      return NextResponse.json({ error: 'Failed to delete plan versions' }, { status: 500 });
    }

    const { error: deleteError } = await supabaseService
      .from('plans')
      .delete()
      .eq('id', id);

    if (deleteError) {
      console.error('Failed to delete plan:', deleteError);
      return NextResponse.json({ error: 'Failed to delete plan' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Delete Plan Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
