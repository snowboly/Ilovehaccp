
import { NextResponse } from 'next/server';
import { supabaseService } from '@/lib/supabase';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (!id) {
    return NextResponse.json({ error: 'Missing plan ID' }, { status: 400 });
  }

  try {
    // Use service role to bypass RLS (so anonymous users can view via link)
    const { data: plan, error } = await supabaseService
      .from('plans')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    if (!plan) return NextResponse.json({ error: 'Plan not found' }, { status: 404 });

    return NextResponse.json({ plan });
  } catch (error: any) {
    console.error('Fetch Plan Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
