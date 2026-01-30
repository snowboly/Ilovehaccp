import React from 'react';
import { NextResponse } from 'next/server';
import { supabaseService } from '@/lib/supabase';
import { renderToBuffer, type DocumentProps } from '@react-pdf/renderer';
import HACCPDocument from '@/components/pdf/HACCPDocument';
import { MinneapolisPdfDocument } from '@/lib/export/template/renderMinneapolisPdf';
import { buildTemplateData } from '@/lib/export/template/buildTemplateData';
import { checkAdminRole } from '@/lib/admin-auth';
import { getDictionary } from '@/lib/locales';
import { isExportAllowed } from '@/lib/export/permissions';
import { fetchLogoAssets } from '@/lib/export/logo';
import { verifyExportToken } from '@/lib/export/auth';
import { transformDraftToPlan } from '@/lib/export/transform';
import { logAccess } from '@/lib/audit';

// Feature flag: Use Minneapolis-style template for PDF (matches DOCX structure)
const PDF_USE_MINNEAPOLIS_TEMPLATE = process.env.PDF_USE_MINNEAPOLIS_TEMPLATE !== 'false';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const planId = searchParams.get('planId');
    const tokenParam = searchParams.get('token');
    const lang = (searchParams.get('lang') || 'en') as 'en' | 'es' | 'fr' | 'pt';

    if (!planId) return NextResponse.json({ error: 'Missing planId' }, { status: 400 });

    let user = null;
    let tokenPayload = null;
    let isAdmin = false;

    // 1. Auth Resolution
    if (tokenParam) {
      tokenPayload = verifyExportToken(tokenParam);
      // Validate token authorizes THIS resource
      if (!tokenPayload || tokenPayload.id !== planId) {
        await logAccess({ email: 'unknown', role: 'anon' }, 'LOGIN_FAILURE', { type: 'system', id: planId }, { reason: 'Invalid Token' });
        return NextResponse.json({ error: 'Invalid or expired token' }, { status: 403 });
      }
    } else {
      const authHeader = req.headers.get('Authorization');
      if (authHeader) {
        const token = authHeader.replace('Bearer ', '');
        const { data, error } = await supabaseService.auth.getUser(token);
        if (!error && data.user) {
          user = data.user;
          isAdmin = await checkAdminRole(user.id, user.email);
        }
      }
    }

    if (!user && !tokenPayload) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Fetch Plan (Strict Scoping)
    let plan = null;
    let resourceType: 'plan' | 'draft' = 'plan';

    if (tokenPayload) {
      // Trust Token Type
      resourceType = tokenPayload.type;
      const table = resourceType === 'draft' ? 'drafts' : 'plans';
      const { data } = await supabaseService.from(table).select('*').eq('id', planId).single();
      
      if (resourceType === 'draft' && data) {
         plan = transformDraftToPlan(data);
      } else {
         plan = data;
      }
    } else {
      // Trust User (Scoped)
      // Attempt 1: Plans
      let planQuery = supabaseService.from('plans').select('*').eq('id', planId);
      if (!isAdmin && user) planQuery = planQuery.eq('user_id', user.id);
      
      const { data: p } = await planQuery.single();
      
      if (p) {
        plan = p;
        resourceType = 'plan';
      } else {
        // Attempt 2: Drafts (Scoped)
        let draftQuery = supabaseService.from('drafts').select('*').eq('id', planId);
        if (!isAdmin && user) draftQuery = draftQuery.eq('user_id', user.id);
        
        const { data: d } = await draftQuery.single();
        if (d) {
          plan = transformDraftToPlan(d);
          resourceType = 'draft';
        }
      }
    }

    if (!plan) {
      return NextResponse.json({ error: 'Plan not found' }, { status: 404 });
    }

    // 3. Validation Gate
    const permission = isExportAllowed(plan);
    if (!permission.allowed) {
        return NextResponse.json({ error: permission.reason }, { status: 422 });
    }

    // 4. Permission Check (Double Check for sanity, though query scoping handles it)
    if (!tokenPayload && !isAdmin && user && plan.user_id !== user.id) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
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
    const baseFullPlan =
        plan.full_plan ||
        ({
            _original_inputs: plan.answers || {},
            hazard_analysis: plan.hazard_analysis || []
        } as any);
    const originalInputs = {
        ...(baseFullPlan?._original_inputs || {}),
        ...(plan.answers || {})
    };
    const fullPlan = {
        ...baseFullPlan,
        _original_inputs: originalInputs,
        hazard_analysis: Array.isArray(baseFullPlan?.hazard_analysis)
            ? baseFullPlan.hazard_analysis
            : plan.hazard_analysis || []
    };
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
        isPaid: plan.payment_status === 'paid' || plan.export_paid || plan.review_paid || isAdmin
    };

    let pdfLogo: string | null = null;
    try {
        const logoResult = await fetchLogoAssets(originalInputs.product?.logo_url);
        pdfLogo = logoResult.pdfLogo;
    } catch (logoError) {
        console.error('[download-pdf] logo fetch error (continuing without logo):', logoError);
        // Continue without logo rather than failing
    }

    let pdfBuffer;
    try {
        if (PDF_USE_MINNEAPOLIS_TEMPLATE && lang === 'en') {
            // Use Minneapolis-style template (matches DOCX structure)
            const isPaid = plan.payment_status === 'paid' || plan.export_paid || plan.review_paid || isAdmin;
            const templateData = buildTemplateData(
                { fullPlan, businessName: plan.business_name, productName: productInputs.product_name, planVersion },
                isPaid,
                null // Logo buffer not used in this PDF template (could be added later)
            );
            const pdfElement = React.createElement(
                MinneapolisPdfDocument as React.ComponentType<any>,
                { data: templateData }
            ) as React.ReactElement<DocumentProps>;
            pdfBuffer = await renderToBuffer(pdfElement);
        } else {
            // Legacy template
            const legacyElement = React.createElement(
                HACCPDocument as React.ComponentType<any>,
                {
                    data: pdfData,
                    dict,
                    logo: pdfLogo,
                    template: originalInputs.template || 'audit-classic'
                }
            ) as React.ReactElement<DocumentProps>;
            pdfBuffer = await renderToBuffer(legacyElement);
        }
    } catch (renderError: any) {
        console.error('[download-pdf] PDF render error:', renderError?.message || renderError);
        return NextResponse.json({ error: 'Failed to render PDF. Please try again or contact support.' }, { status: 500 });
    }

    const safeBusinessName = String(plan.business_name || 'Draft').replace(/\s+/g, '_');

    // 6. Audit Log
    await logAccess(
      { email: user?.email || 'token-user', role: isAdmin ? 'admin' : (user ? 'user' : 'anon'), id: user?.id },
      'EXPORT_PDF',
      { type: resourceType, id: planId },
      { lang, method: tokenPayload ? 'token' : 'auth' }
    );

    // FIX: Robust Buffer handling for Node.js
    const finalBuffer = Buffer.isBuffer(pdfBuffer)
      ? pdfBuffer
      : Buffer.from((pdfBuffer as any) instanceof ArrayBuffer ? new Uint8Array(pdfBuffer as any) : pdfBuffer as any);

    return new NextResponse(finalBuffer, {
        headers: {
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename="HACCP_Plan_${safeBusinessName}.pdf"`,
            'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate'
        }
    });

  } catch (error: any) {
    console.error('[download-pdf] error', error);
    if (error instanceof Error) {
       console.error(error.stack);
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
