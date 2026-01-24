import { NextResponse } from 'next/server';
import { supabaseService } from '@/lib/supabase';
import { verifyAccessToken } from '@/lib/token';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    
    // Auth Check: Token or Session
    const authHeader = req.headers.get('Authorization');
    const { searchParams } = new URL(req.url);
    const tokenParam = searchParams.get('token');
    
    let user = null;
    let accessPayload = null;

    if (tokenParam) {
        accessPayload = verifyAccessToken(tokenParam);
        if (accessPayload) {
            // Validate Token Scope
            if (accessPayload.id !== id || accessPayload.type !== 'draft' || accessPayload.scope !== 'view') {
                return NextResponse.json({ error: 'Invalid token scope' }, { status: 403 });
            }
        }
    }
    
    // If no valid token, fallback to Auth Header
    if (!accessPayload && authHeader) {
        const token = authHeader.replace('Bearer ', '');
        const { data, error } = await supabaseService.auth.getUser(token);
        if (!error && data.user) user = data.user;
    }

    if (!user && !accessPayload) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Query Construction
    let query = supabaseService.from('drafts').select('*').eq('id', id);

    // Apply scoping
    if (user) {
        query = query.eq('user_id', user.id);
    } 
    // If using access token, we trust the ID within the token (already checked above), 
    // so we don't need to enforce user_id match (allows sharing).
    
    const { data, error } = await query.single();

    if (error || !data) {
        return NextResponse.json({ error: 'Draft not found' }, { status: 404 });
    }

    return NextResponse.json({ draft: data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseService.auth.getUser(token);
    if (authError || !user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { answers, validation, plan_data, name, current_step } = body;

    const updateData: any = { updated_at: new Date().toISOString() };
    if (answers) updateData.answers = answers;
    if (validation) updateData.validation = validation;
    if (plan_data) updateData.plan_data = plan_data;
    if (name) updateData.name = name;
    if (current_step) updateData.current_step = current_step;

    const { data, error } = await supabaseService
        .from('drafts')
        .update(updateData)
        .eq('id', id)
        .eq('user_id', user.id)
        .select('id')
        .single();

    if (error || !data) {
        return NextResponse.json({ error: 'Draft not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Draft Update Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
