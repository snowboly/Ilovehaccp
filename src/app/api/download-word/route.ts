import { NextResponse } from 'next/server';
import { supabaseService } from '@/lib/supabase';
import { generateWordDocument } from '@/lib/word-generator';
import { isExportAllowed } from '@/lib/export/permissions';

const ADMIN_EMAILS = [
    'admin@ilovehaccp.com', 
    'joao@scriptworkflow.com'
];

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const planId = searchParams.get('planId');
    const lang = (searchParams.get('lang') || 'en') as 'en' | 'es' | 'fr' | 'pt';

    if (!planId) {
      return NextResponse.json({ error: 'Missing planId' }, { status: 400 });
    }

    // 1. Auth Check
    const authHeader = req.headers.get('Authorization');
    let user = null;
    
    if (authHeader) {
        const token = authHeader.replace('Bearer ', '');
        const { data, error } = await supabaseService.auth.getUser(token);
        if (!error && data.user) user = data.user;
    }

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Fetch Plan
    const { data: plan, error } = await supabaseService
        .from('plans')
        .select('*')
        .eq('id', planId)
        .single();

    if (error || !plan) {
        return NextResponse.json({ error: 'Plan not found' }, { status: 404 });
    }

    // 2.5 Validation Gate (Audit Safe - Single Source of Truth)
    const permission = isExportAllowed(plan);
    if (!permission.allowed) {
        return NextResponse.json({ error: permission.reason }, { status: 422 });
    }

    // 3. Permission Check
    const isOwner = plan.user_id === user.id;
    const isPaid = plan.payment_status === 'paid';
    const isAdmin = user.email && ADMIN_EMAILS.includes(user.email);

    if (isAdmin) {
        // Admin Access Granted
    } else if (isOwner && isPaid) {
        // Customer Access Granted
    } else {
         return NextResponse.json({ error: 'Forbidden: Payment required or Unauthorized' }, { status: 403 });
    }

    // 3.5 Fetch Plan Version
    const { data: latestVersion } = await supabaseService
        .from('haccp_plan_versions')
        .select('version_number')
        .eq('plan_id', planId)
        .order('version_number', { ascending: false })
        .limit(1)
        .single();

    const planVersion = latestVersion?.version_number || 1;

    // 4. Generate Doc
    const fullPlan = plan.full_plan || {};
    const originalInputs = fullPlan._original_inputs || {};
    const productInputs = originalInputs.product || {};

    const buffer = await generateWordDocument({
        businessName: plan.business_name,
        full_plan: fullPlan,
        planVersion,
        template: originalInputs.template || fullPlan.validation?.document_style,
        productName: productInputs.product_name || plan.product_name || "HACCP Plan",
        productDescription: productInputs.product_category || plan.product_description || "Generated Plan",
        mainIngredients: productInputs.key_ingredients || "Standard",
        intendedUse: productInputs.intended_use || plan.intended_use || "General",
        storageType: productInputs.storage_conditions || plan.storage_type || "Standard",
        shelfLife: productInputs.shelf_life || "As per label"
    }, lang);

    // 5. Return Stream
    return new NextResponse(buffer as any, {
        headers: {
            'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'Content-Disposition': `attachment; filename="HACCP_Plan_${plan.business_name.replace(/\s+/g, '_')}.docx"`
        }
    });

  } catch (error: any) {
    console.error('Word Gen Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}