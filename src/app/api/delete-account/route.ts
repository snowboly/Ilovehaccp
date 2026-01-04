import { NextResponse } from 'next/server';
import { supabaseService } from '@/lib/supabase';

export async function DELETE(req: Request) {
  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseService.auth.getUser(token);

    if (authError || !user) {
        return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
    }

    // 1. Delete user's plans (RLS usually handles this if cascade is set, but let's be explicit)
    const { error: plansError } = await supabaseService
        .from('plans')
        .delete()
        .eq('user_id', user.id);
    
    if (plansError) throw plansError;

    // 2. Delete user from Supabase Auth
    const { error: deleteError } = await supabaseService.auth.admin.deleteUser(user.id);
    
    if (deleteError) throw deleteError;
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Delete account error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}