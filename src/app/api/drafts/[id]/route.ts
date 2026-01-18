import { NextResponse } from 'next/server';
import { supabaseService } from '@/lib/supabase';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    
    const { data, error } = await supabaseService
        .from('drafts')
        .select('*')
        .eq('id', id)
        .single();

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
    const body = await req.json();
    const { answers, validation, plan_data } = body;

    const updateData: any = { updated_at: new Date().toISOString() };
    if (answers) updateData.answers = answers;
    if (validation) updateData.validation = validation;
    if (plan_data) updateData.plan_data = plan_data;

    const { error } = await supabaseService
        .from('drafts')
        .update(updateData)
        .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Draft Update Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}