import { NextResponse } from 'next/server';
import { supabaseService } from '@/lib/supabase';
import { verifyAccessToken } from '@/lib/token';
import { logAccess } from '@/lib/audit';

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseService.auth.getUser(token);

    if (authError || !user) return NextResponse.json({ error: 'Invalid Token' }, { status: 401 });

    const { draftId, claimToken } = await req.json();

    if (!draftId) return NextResponse.json({ error: 'Missing draftId' }, { status: 400 });

    // 0. Rate Limiting (5 attempts / min)
    const { count } = await supabaseService
        .from('access_logs')
        .select('*', { count: 'exact', head: true })
        .eq('actor_email', user.email || 'unknown')
        .eq('action', 'ATTACH_DRAFT_ATTEMPT')
        .gte('created_at', new Date(Date.now() - 60000).toISOString());

    if (count !== null && count >= 5) {
        await logAccess({ email: user.email, role: 'user', id: user.id }, 'ATTACH_DRAFT_BLOCKED', { type: 'draft', id: draftId }, { reason: 'Rate Limit' });
        return NextResponse.json({ error: 'Too many attempts. Please try again later.' }, { status: 429 });
    }

    // Log Attempt
    await logAccess({ email: user.email, role: 'user', id: user.id }, 'ATTACH_DRAFT_ATTEMPT', { type: 'draft', id: draftId });

    // 1. Verify Draft exists
    const { data: draft, error: fetchError } = await supabaseService
        .from('drafts')
        .select('id, user_id')
        .eq('id', draftId)
        .single();

    if (fetchError || !draft) return NextResponse.json({ error: 'Draft not found' }, { status: 404 });

    // 2. Ownership Logic
    // Scenario A: Already Owned by User -> No-op Success
    if (draft.user_id === user.id) {
        return NextResponse.json({ success: true, message: 'Already attached' });
    }

    // Scenario B: Owned by someone else -> Hard Fail
    if (draft.user_id) {
        return NextResponse.json({ error: 'Draft already claimed' }, { status: 403 });
    }

    // Scenario C: Anonymous (Unclaimed) -> Requires Proof
    if (!claimToken) {
        return NextResponse.json({ error: 'Missing claim token' }, { status: 400 });
    }

    const payload = verifyAccessToken(claimToken);
    if (!payload || payload.id !== draftId || payload.scope !== 'claim') {
        await logAccess({ email: user.email, role: 'user', id: user.id }, 'ATTACH_DRAFT_FAILED', { type: 'draft', id: draftId }, { reason: 'Invalid Claim Token' });
        return NextResponse.json({ error: 'Invalid or expired claim token' }, { status: 403 });
    }

    // 3. Attach User
    const { error: updateError } = await supabaseService
        .from('drafts')
        .update({ user_id: user.id })
        .eq('id', draftId);

    if (updateError) throw updateError;

    await logAccess({ email: user.email, role: 'user', id: user.id }, 'ATTACH_DRAFT_SUCCESS', { type: 'draft', id: draftId });

    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error('Attach Draft Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
