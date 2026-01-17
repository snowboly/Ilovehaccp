import { NextResponse } from 'next/server';
import { supabaseService } from '@/lib/supabase';

export async function POST(req: Request) {
  try {
    // Optional: Link to user if logged in
    const authHeader = req.headers.get('Authorization');
    let userId = null;
    
    if (authHeader) {
        const token = authHeader.replace('Bearer ', '');
        const { data: { user } } = await supabaseService.auth.getUser(token);
        if (user) userId = user.id;
    }

    const { data, error } = await supabaseService
        .from('drafts')
        .insert({ 
            user_id: userId,
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
