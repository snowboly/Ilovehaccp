import { NextResponse } from 'next/server';
import { supabaseService } from '@/lib/supabase';
import { supabase } from '@/lib/supabase'; // Client for auth check

export async function POST(req: Request) {
  try {
    // 1. Check if user is authenticated
    // We use the standard client to verify the session from the request cookies/headers if possible,
    // but in an API route, it's often easier to rely on the service client IF we trust the sender.
    // However, best practice is to get the user from the session.
    
    // Create a Supabase client for the request context (if using cookies)
    // or just rely on the fact that we are in a protected route? 
    // We'll use the server-side auth helper pattern if we had it, but here we can just check the header.
    
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

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
