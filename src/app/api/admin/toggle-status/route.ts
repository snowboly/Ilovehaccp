import { NextResponse } from 'next/server';
import { supabaseService } from '@/lib/supabase';
import { validateAdminRequest } from '@/lib/admin-auth';

export async function POST(req: Request) {
  try {
    const { user, error: authError, status: authStatus } = await validateAdminRequest(req);
    if (authError || !user) return NextResponse.json({ error: authError }, { status: authStatus || 401 });

    const { planId, status } = await req.json();

    const { error } = await supabaseService
        .from('plans')
        .update({ payment_status: status })
        .eq('id', planId);

    if (error) throw error;

    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error('Admin Toggle Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
