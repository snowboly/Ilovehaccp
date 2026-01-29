import { NextResponse } from 'next/server';
import { supabaseService } from '@/lib/supabase';
import { validateAdminRequest } from '@/lib/admin-auth';

async function logAdminAction(adminEmail: string, entityId: string, action: string, details: Record<string, unknown> = {}) {
  await supabaseService.from('access_logs').insert({
    actor_email: adminEmail,
    actor_role: 'admin',
    entity_type: 'plan',
    entity_id: entityId,
    action,
    details,
  });
}

export async function PATCH(req: Request) {
  try {
    // 1. Auth Check
    const { user, error: authError, status } = await validateAdminRequest(req);
    if (authError || !user) {
      return NextResponse.json({ error: authError }, { status: status || 401 });
    }

    // 2. Parse Request
    const { planId, status: newStatus } = await req.json();

    if (!planId) {
      return NextResponse.json({ error: 'Missing planId' }, { status: 400 });
    }

    if (!newStatus || !['in_progress', 'concluded'].includes(newStatus)) {
      return NextResponse.json(
        { error: 'Invalid status. Must be "in_progress" or "concluded"' },
        { status: 400 }
      );
    }

    // 3. Update the plan's review_status
    const updateData: Record<string, unknown> = {
      review_status: newStatus,
    };

    if (newStatus === 'concluded') {
      updateData.reviewed_at = new Date().toISOString();
    } else if (newStatus === 'in_progress') {
      updateData.reviewed_at = null;
    }

    const { data: updatedPlan, error: updateError } = await supabaseService
      .from('plans')
      .update(updateData)
      .eq('id', planId)
      .select('id, review_status, reviewed_at')
      .single();

    if (updateError) {
      throw updateError;
    }

    // 4. Log the action
    const action = newStatus === 'concluded' ? 'MARK_CONCLUDED' : 'SET_IN_PROGRESS';
    void logAdminAction(user.email!, planId, action, { new_status: newStatus });

    return NextResponse.json({
      success: true,
      plan: updatedPlan,
    });
  } catch (error: unknown) {
    console.error('Admin Review Status Error:', error);
    const message = error instanceof Error ? error.message : 'Failed to update review status';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
