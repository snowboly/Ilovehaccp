
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { createClient } from '@/utils/supabase/server';
import { checkAdminRole } from '@/lib/admin-auth';
import { verifyAccessToken } from '@/lib/token';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (!id) {
    return NextResponse.json({ error: 'Missing plan ID' }, { status: 400 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const tokenParam = searchParams.get('token');
    
    let user = null;
    let accessPayload = null;
    let isAdmin = false;

    // 1. Token Auth
    if (tokenParam) {
        accessPayload = verifyAccessToken(tokenParam);
        if (accessPayload) {
            if (accessPayload.id !== id || accessPayload.type !== 'plan' || accessPayload.scope !== 'view') {
                return NextResponse.json({ error: 'Invalid token scope' }, { status: 403 });
            }
        }
    }

    // 2. Session Auth (if no valid token)
    if (!accessPayload) {
        const supabase = await createClient();
        const { data, error } = await supabase.auth.getUser();
        if (!error && data.user) {
            user = data.user;
            isAdmin = await checkAdminRole(user.id, user.email);
        }
    }

    if (!user && !accessPayload) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 3. Data Fetching
    let plan;
    let fetchError;

    if (accessPayload || isAdmin) {
      // Use Admin Client (Bypass RLS)
      const res = await supabaseAdmin
        .from('plans')
        .select('*')
        .eq('id', id)
        .single();
      plan = res.data;
      fetchError = res.error;
    } else {
      // User: Use RLS Client
      const supabase = await createClient();
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
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: plan, error: fetchError } = await supabaseAdmin
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
    const { error: versionsError } = await supabaseAdmin
      .from('haccp_plan_versions')
      .delete()
      .eq('plan_id', id);

    if (versionsError) {
      console.error('Failed to delete plan versions:', versionsError);
      return NextResponse.json({ error: 'Failed to delete plan versions' }, { status: 500 });
    }

    const { error: deleteError } = await supabaseAdmin
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
