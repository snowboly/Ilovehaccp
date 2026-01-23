import { NextResponse } from 'next/server';
import { supabaseService } from '@/lib/supabase';

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseService.auth.getUser(token);
    if (authError || !user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const today = new Date().toISOString().split('T')[0];
    const { data, error } = await supabaseService
        .from('drafts')
        .insert({ 
            user_id: user.id,
            name: `HACCP Draft – ${today}`,
            answers: {} 
        })
        .select()
        .single();

    if (error) throw error;

    return NextResponse.json({ draftId: data.id });
  } catch (error: any) {
    console.error('Draft Create Error:', error);
    return NextResponse.json({ error: 'Failed to create draft' }, { status: 500 });
  }
}
