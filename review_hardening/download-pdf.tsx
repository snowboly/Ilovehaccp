import { NextResponse } from 'next/server';
import { renderToBuffer } from '@react-pdf/renderer';
import HACCPDocument from '@/components/pdf/HACCPDocument';
import { supabaseService } from '@/lib/supabase';
import { getDictionary } from '@/lib/locales';
import { isExportAllowed } from '@/lib/export/permissions';

const ADMIN_EMAILS = ['admin@ilovehaccp.com', 'joao@scriptworkflow.com'];

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const planId = searchParams.get('planId');

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

    // 2. Fetch Plan
    const { data: plan, error } = await supabaseService
        .from('plans')
        .select('*')
        .eq('id', planId)
        .single();

    if (error || !plan) return NextResponse.json({ error: 'Plan not found' }, { status: 404 });

    // 3. Ownership & Permission Check
    const isAdmin = user.email && ADMIN_EMAILS.includes(user.email);
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
    const dict = getDictionary('en').pdf;
    const fullPlan = plan.full_plan || {};
    const originalInputs = fullPlan._original_inputs || {};
    
    const pdfData = {
        businessName: plan.business_name,
        productName: plan.product_name || "HACCP Plan",
        productDescription: plan.product_description || "Generated Plan",
        intendedUse: plan.intended_use || "General",
        storageType: plan.storage_type || "Standard",
        analysis: plan.hazard_analysis || [],
        fullPlan: fullPlan,
        planVersion,
        isPaid: plan.payment_status === 'paid' || isAdmin // Admin gets clean copy
    };

    const pdfBuffer = await renderToBuffer(
        <HACCPDocument 
            data={pdfData}
            dict={dict}
            logo={originalInputs.logo || null}
            template={originalInputs.template || 'audit-classic'}
        />
    );

    return new NextResponse(pdfBuffer as any, {
        headers: {
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename="HACCP_Plan_${plan.business_name.replace(/\s+/g, '_')}.pdf"`
        }
    });

  } catch (error: any) {
    console.error('PDF Gen Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
