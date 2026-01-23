import { NextResponse } from 'next/server';
import { supabaseService } from '@/lib/supabase';
import { renderToBuffer } from '@react-pdf/renderer';
import HACCPDocument from '@/components/pdf/HACCPDocument';
import { checkAdminRole } from '@/lib/admin-auth';
import { getDictionary } from '@/lib/locales';
import { isExportAllowed } from '@/lib/export/permissions';
import { fetchLogoAssets } from '@/lib/export/logo';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const planId = searchParams.get('planId');
    const lang = (searchParams.get('lang') || 'en') as 'en' | 'es' | 'fr' | 'pt';

    if (!planId) return NextResponse.json({ error: 'Missing planId' }, { status: 400 });

    // 1. Auth Check
    const authHeader = req.headers.get('Authorization');
    let user = null;
    if (authHeader) {
        const token = authHeader.replace('Bearer ', '');
        const { data, error } = await supabaseService.auth.getUser(token);
        if (!error && data.user) user = data.user;
    }
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // 2. Fetch Plan (with fallback to Drafts)
    let { data: plan, error } = await supabaseService
        .from('plans')
        .select('*')
        .eq('id', planId)
        .single();

    // Fallback to Drafts if not found in Plans
    if (!plan || error) {
        const { data: draft, error: draftError } = await supabaseService
            .from('drafts')
            .select('*')
            .eq('id', planId)
            .single();

        if (draft && !draftError) {
            // Construct a virtual plan from draft data
            plan = {
                id: draft.id,
                user_id: draft.user_id,
                business_name: draft.answers?.product?.businessLegalName || 'Draft',
                product_name: draft.answers?.product?.product_name || 'Draft Plan',
                payment_status: 'unpaid', // Drafts are always unpaid
                full_plan: draft.plan_data,
                hazard_analysis: draft.answers?.hazard_analysis || [],
                answers: draft.answers || {}
            };
        } else {
            return NextResponse.json({ error: 'Plan not found' }, { status: 404 });
        }
    }

    // 3. Ownership & Permission Check
    const isAdmin = await checkAdminRole(user.id, user.email);
    if (plan.user_id !== user.id && !isAdmin) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // 4. Hardened Validation Gate (Single Source of Truth)
    const permission = isExportAllowed(plan);
    if (!permission.allowed) {
        return NextResponse.json({ error: permission.reason }, { status: 422 });
    }

    // 4.5 Fetch Plan Version
    const { data: latestVersion } = await supabaseService
        .from('haccp_plan_versions')
        .select('version_number')
        .eq('plan_id', planId)
        .order('version_number', { ascending: false })
        .limit(1)
        .single();

    const planVersion = latestVersion?.version_number || 1;

    // 5. Generate PDF
    const dict = getDictionary(lang).pdf;
    const fullPlan =
        plan.full_plan ||
        ({
            _original_inputs: plan.answers || {},
            hazard_analysis: plan.hazard_analysis || []
        } as any);
    const originalInputs = fullPlan._original_inputs || plan.answers || {};
    const productInputs = originalInputs.product || {};
    
    const pdfData = {
        businessName: plan.business_name,
        productName: productInputs.product_name || plan.product_name || "HACCP Plan",
        productDescription: productInputs.product_category || plan.product_description || "Generated Plan",
        intendedUse: productInputs.intended_use || plan.intended_use || "General",
        storageType: productInputs.storage_conditions || plan.storage_type || "Standard",
        mainIngredients: productInputs.key_ingredients || "Standard",
        shelfLife: productInputs.shelf_life || "As per label",
        analysis: plan.hazard_analysis || [],
        fullPlan: fullPlan,
        planVersion,
        lang,
        isPaid: plan.payment_status === 'paid' || isAdmin // Admin gets clean copy
    };

    const { pdfLogo } = await fetchLogoAssets(originalInputs.product?.logo_url);

    const pdfBuffer = await renderToBuffer(
        <HACCPDocument 
            data={pdfData}
            dict={dict}
            logo={pdfLogo}
            template={originalInputs.template || 'audit-classic'}
        />
    );

    const safeBusinessName = String(plan.business_name || 'Draft').replace(/\s+/g, '_');

    return new NextResponse(pdfBuffer as any, {
        headers: {
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename="HACCP_Plan_${safeBusinessName}.pdf"`
        }
    });

  } catch (error: any) {
    console.error('PDF Gen Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
