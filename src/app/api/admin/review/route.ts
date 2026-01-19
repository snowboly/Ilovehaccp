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

export async function POST(req: Request) {
  try {
    // 1. Auth Check
    const { user, error: authError, status } = await validateAdminRequest(req);
    if (authError || !user) return NextResponse.json({ error: authError }, { status: status || 401 });

    // 2. Parse Request
    const { planId, action, comment } = await req.json();

    if (!planId || !action) {
        return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // 3. Handle Actions
    if (action === 'ADD_COMMENT') {
        const { error } = await supabaseService
            .from('plans')
            .update({ review_comments: comment })
            .eq('id', planId);

        if (error) throw error;
        await logAdminAction(user.email!, planId, 'ADD_COMMENT', { comment_length: comment.length });

    } else if (action === 'COMPLETE_REVIEW') {
        const { error } = await supabaseService
            .from('plans')
            .update({ 
                review_status: 'completed',
                reviewed_at: new Date().toISOString()
            })
            .eq('id', planId);

        if (error) throw error;
        await logAdminAction(user.email!, planId, 'COMPLETE_REVIEW');

    } else {
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error('Admin Review Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
