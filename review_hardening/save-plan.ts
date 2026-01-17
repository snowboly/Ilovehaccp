import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function POST(req: Request) {
  if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
  }

  const supabaseAdmin = createClient(supabaseUrl, supabaseKey);

  try {
    // 1. Auth Check (Strict)
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
        return NextResponse.json({ error: 'Unauthorized: Missing token' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);

    if (authError || !user) {
        return NextResponse.json({ error: 'Unauthorized: Invalid token' }, { status: 401 });
    }

    const authUserId = user.id;

    const body = await req.json();
    const { 
        planId, 
        draftId, // NEW: Link to draft
        businessName, 
        businessType, 
        analysis, 
        fullPlan,
        metadata,
        answers
    } = body;

    let result;
    let savedPlanId = planId;
    
    // 2. Save/Update Main Plan Record
    if (planId) {
        // Ownership Check
        const { data: existingPlan, error: fetchError } = await supabaseAdmin
            .from('plans')
            .select('user_id')
            .eq('id', planId)
            .single();

        if (fetchError || !existingPlan) {
            return NextResponse.json({ error: 'Plan not found' }, { status: 404 });
        }

        if (existingPlan.user_id !== authUserId) {
            return NextResponse.json({ error: 'Forbidden: You do not own this plan' }, { status: 403 });
        }

        // Proceed with Update
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
        // Create New Plan
        const { data, error } = await supabaseAdmin
            .from('plans')
            .insert({ 
                business_name: businessName, 
                business_type: businessType,
                hazard_analysis: analysis, 
                full_plan: fullPlan, 
                user_id: authUserId // Enforce authenticated user
            })
            .select()
            .single();
            
        if (error) throw error;
        result = data;
        savedPlanId = result.id;
    }

    // 2.5 Mark Draft as Generated
    if (draftId) {
        await supabaseAdmin
            .from('drafts')
            .update({ status: 'generated' })
            .eq('id', draftId);
    }

    // 3. Save Version Snapshot (With Auto-Increment)
    if (metadata && savedPlanId) {
        // Query latest version
        const { data: latestVersion, error: verError } = await supabaseAdmin
            .from('haccp_plan_versions')
            .select('version_number')
            .eq('plan_id', savedPlanId)
            .order('version_number', { ascending: false })
            .limit(1)
            .single();

        const newVersionNumber = (latestVersion?.version_number || 0) + 1;

        const { error: insertError } = await supabaseAdmin
            .from('haccp_plan_versions')
            .insert({
                plan_id: savedPlanId,
                version_number: newVersionNumber, 
                framework_version: metadata.framework_version,
                question_set_versions: metadata.question_set_versions,
                data_snapshot: { fullPlan, answers },
                created_by: authUserId
            });
            
        if (insertError) {
            console.error("Failed to save version snapshot:", insertError);
        } else {
            // OPTIONAL: Return the new version number to the client?
            // Currently we return 'result' (the plan). We could attach version.
            result.latest_version = newVersionNumber;
        }
    }

    return NextResponse.json({ success: true, plan: result });

  } catch (error: any) {
    console.error('Save Plan Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to save plan' }, { status: 500 });
  }
}
