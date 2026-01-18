import { NextResponse } from 'next/server';
import { supabaseService } from '@/lib/supabase';
import { ADMIN_EMAILS } from '@/lib/constants';

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseService.auth.getUser(token);

    if (authError || !user || !user.email) return NextResponse.json({ error: 'Invalid Session' }, { status: 401 });

    if (!ADMIN_EMAILS.includes(user.email)) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

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
