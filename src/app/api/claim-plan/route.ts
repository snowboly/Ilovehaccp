import { NextResponse } from 'next/server';
import { supabaseService } from '@/lib/supabase';
import { createClient } from '@/utils/supabase/server';

export async function POST(req: Request) {
  try {
    // 1. Check if user is authenticated using SSR client (cookies)
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { planId } = await req.json();

    if (!planId) {
      return NextResponse.json({ error: 'Plan ID is required' }, { status: 400 });
    }

    // 2. Fetch the plan using Service Role (bypass RLS)
    const { data: plan, error: fetchError } = await supabaseService
      .from('plans')
      .select('id, user_id')
      .eq('id', planId)
      .single();

    if (fetchError || !plan) {
      return NextResponse.json({ error: 'Plan not found' }, { status: 404 });
    }

    // 3. Check ownership
    if (plan.user_id) {
      if (plan.user_id === user.id) {
        return NextResponse.json({ message: 'Plan already in your dashboard' });
      }
      return NextResponse.json({ error: 'This plan belongs to another user' }, { status: 403 });
    }

    // 4. Claim the plan
    const { error: updateError } = await supabaseService
      .from('plans')
      .update({ user_id: user.id })
      .eq('id', planId);

    if (updateError) {
      console.error('Claim error:', updateError);
      return NextResponse.json({ error: 'Failed to claim plan' }, { status: 500 });
    }

    return NextResponse.json({ message: 'Plan successfully imported' });

  } catch (error) {
    console.error('Claim Plan Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}