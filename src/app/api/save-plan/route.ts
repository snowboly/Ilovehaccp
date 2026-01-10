import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase with Service Role Key to bypass RLS
// Note: This must be inside a function or check if we want to avoid build-time errors if env is missing
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function POST(req: Request) {
  if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
  }

  const supabaseAdmin = createClient(supabaseUrl, supabaseKey);

  try {
    const body = await req.json();
    const { 
        planId, 
        userId, 
        businessName, 
        businessType, 
        analysis, 
        fullPlan 
    } = body;

    let result;
    
    if (planId) {
        // Update existing plan
        const { data, error } = await supabaseAdmin
            .from('plans')
            .update({ 
                business_name: businessName, 
                business_type: businessType,
                hazard_analysis: analysis, 
                full_plan: fullPlan,
            })
            .eq('id', planId)
            .select()
            .single();
            
        if (error) throw error;
        result = data;
    } else {
        // Insert new plan
        const { data, error } = await supabaseAdmin
            .from('plans')
            .insert({ 
                business_name: businessName, 
                business_type: businessType,
                hazard_analysis: analysis, 
                full_plan: fullPlan, 
                user_id: userId 
            })
            .select()
            .single();
            
        if (error) throw error;
        result = data;
    }

    return NextResponse.json({ success: true, plan: result });

  } catch (error: any) {
    console.error('Save Plan Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to save plan' }, { status: 500 });
  }
}