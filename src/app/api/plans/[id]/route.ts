
import { NextResponse } from 'next/server';
import { supabaseService } from '@/lib/supabase';
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
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseService.auth.getUser(token);
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: plan, error } = await supabaseService
      .from('plans')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Plan not found' }, { status: 404 });
      }
      throw error;
    }
    if (!plan) return NextResponse.json({ error: 'Plan not found' }, { status: 404 });

    const isAdmin = await checkAdminRole(user.id, user.email);

    if (plan.user_id && plan.user_id !== user.id && !isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    return NextResponse.json({ plan });
  } catch (error: any) {
    console.error('Fetch Plan Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
