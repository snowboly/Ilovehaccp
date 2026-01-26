import { NextResponse } from 'next/server';
import { supabaseService } from '@/lib/supabase';
import { generateAccessToken } from '@/lib/token';

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get('Authorization');
    let user = null;

    if (authHeader) {
        const token = authHeader.replace('Bearer ', '');
        const { data, error: authError } = await supabaseService.auth.getUser(token);
        
        if (authError || !data.user) {
            console.error('Draft Creation Auth Failed:', authError);
            return NextResponse.json({ error: 'Invalid Session' }, { status: 401 });
        }
        user = data.user;
    }

    const today = new Date().toISOString().split('T')[0];
    const draftData = {
        name: `HACCP Draft – ${today}`,
        answers: {},
        user_id: user ? user.id : null
    };

    const { data, error } = await supabaseService
        .from('drafts')
        .insert(draftData)
        .select()
        .single();

    if (error) throw error;

    const response: any = { draftId: data.id };

    // If anonymous, issue a claim token
    if (!user) {
        const claimToken = generateAccessToken(
            data.id,
            'draft',
            'claim',
            7 * 24 * 60 * 60 // 7 days claim window
        );
        response.claimToken = claimToken;
    }

    return NextResponse.json(response);
  } catch (error: any) {
    console.error('Draft Create Error:', error);
    return NextResponse.json({ error: 'Failed to create draft' }, { status: 500 });
  }
}
