import { NextResponse } from 'next/server';
import { supabaseService } from '@/lib/supabase';
import { validateAdminRequest } from '@/lib/admin-auth';

async function logAdminAction(adminEmail: string, entityId: string, action: string, details: any = {}) {
    await supabaseService.from('access_logs').insert({
        actor_email: adminEmail,
        actor_role: 'admin',
        entity_type: 'plan',
        entity_id: entityId,
        action,
        details
    });
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 1. Auth Check
    const { user, error: authError, status } = await validateAdminRequest(req);
    if (authError || !user) return NextResponse.json({ error: authError }, { status: status || 401 });

    const { id } = await params;

    // 2. Fetch Full Plan Details
    const { data: plan, error } = await supabaseService
        .from('plans')
        .select('*')
        .eq('id', id)
        .single();

    if (error) throw error;

    // 3. Log the View Action (Audit Trail)
    // We execute this asynchronously so it doesn't block the read, 
    // or await it if strict audit is required. Awaiting for safety.
    await logAdminAction(user.email, id, 'VIEW_PLAN', { source: 'admin_dashboard_detail' });

    return NextResponse.json({ plan });

  } catch (error: any) {
    console.error('Admin Single Plan Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
