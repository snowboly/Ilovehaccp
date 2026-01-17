import { NextResponse } from 'next/server';
import { supabaseService } from '@/lib/supabase';

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseService.auth.getUser(token);

    if (authError || !user) return NextResponse.json({ error: 'Invalid Token' }, { status: 401 });

    const { draftId } = await req.json();

    // 1. Verify Draft exists and is currently anonymous (user_id IS NULL)
    // We strictly prevent stealing someone else's draft.
    const { data: draft, error: fetchError } = await supabaseService
        .from('drafts')
        .select('*')
        .eq('id', draftId)
        .single();

    if (fetchError || !draft) return NextResponse.json({ error: 'Draft not found' }, { status: 404 });

    if (draft.user_id && draft.user_id !== user.id) {
        return NextResponse.json({ error: 'Draft already claimed' }, { status: 403 });
    }

    // 2. Attach User
    const { error: updateError } = await supabaseService
        .from('drafts')
        .update({ user_id: user.id })
        .eq('id', draftId);

    if (updateError) throw updateError;

    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error('Attach Draft Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
