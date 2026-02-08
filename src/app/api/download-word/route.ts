import { NextResponse } from 'next/server';
import { supabaseService } from '@/lib/supabase';
import { checkAdminRole } from '@/lib/admin-auth';
import { generateWordDocument } from '@/lib/word-generator';
import { isExportAllowed } from '@/lib/export/permissions';
import { fetchLogoAssets } from '@/lib/export/logo';
import { verifyExportToken } from '@/lib/export/auth';
import { transformDraftToPlan } from '@/lib/export/transform';
import { logAccess } from '@/lib/audit';
import { SUPPORTED_LOCALES, type Language } from '@/lib/locales';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const planId = searchParams.get('planId');
    const tokenParam = searchParams.get('token');
    const langParam = searchParams.get('lang');
    const lang = SUPPORTED_LOCALES.includes(langParam as Language) ? (langParam as Language) : 'en';

    if (!planId) return NextResponse.json({ error: 'Missing planId' }, { status: 400 });

    let user = null;
    let tokenPayload = null;
    let isAdmin = false;

    // 1. Auth Resolution
    if (tokenParam) {
      tokenPayload = verifyExportToken(tokenParam);
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
      let planQuery = supabaseService.from('plans').select('*').eq('id', planId);
      if (!isAdmin && user) planQuery = planQuery.eq('user_id', user.id);
      
      const { data: p } = await planQuery.single();
      
      if (p) {
        plan = p;
        resourceType = 'plan';
      } else {
        let draftQuery = supabaseService.from('drafts').select('*').eq('id', planId);
        if (!isAdmin && user) draftQuery = draftQuery.eq('user_id', user.id);
        
        const { data: d } = await draftQuery.single();
        if (d) {
          plan = transformDraftToPlan(d);
          resourceType = 'draft';
        }
      }
    }

    if (!plan) return NextResponse.json({ error: 'Plan not found' }, { status: 404 });

    // 2.5 Validation Gate
    const permission = isExportAllowed(plan);
    if (!permission.allowed) {
        return NextResponse.json({ error: permission.reason }, { status: 422 });
    }

    // 3. Permission & Payment Check
    if (!tokenPayload && !isAdmin && user && plan.user_id !== user.id) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const isPaid = plan.payment_status === 'paid' || plan.export_paid || plan.review_paid;
    if (!isPaid && !isAdmin) {
         await logAccess(
           { email: user?.email || 'token-user', role: isAdmin ? 'admin' : 'user' }, 
           'LOGIN_FAILURE', // Using login failure to denote access failure
           { type: resourceType, id: planId }, 
           { reason: 'Unpaid Word Export Attempt' }
         );
         return NextResponse.json({ error: 'Forbidden: Payment required' }, { status: 403 });
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

    const { wordLogo } = await fetchLogoAssets(productInputs.logo_url);

    const buffer = await generateWordDocument({
        businessName: plan.business_name,
        full_plan: fullPlan,
        planVersion,
        template: originalInputs.template || fullPlan.validation?.document_style,
        productName: productInputs.product_name || plan.product_name || "HACCP Plan",
        productDescription: productInputs.product_category || plan.product_description || "Generated Plan",
        mainIngredients: productInputs.key_ingredients || "Standard",
        intendedUse: productInputs.intended_consumer_group || productInputs.intended_use || plan.intended_use || "General",
        intendedConsumer: productInputs.intended_consumer_group || "General public",
        storageType: productInputs.storage_conditions || plan.storage_type || "Standard",
        shelfLife: productInputs.shelf_life || "As per label",
        logoBuffer: wordLogo
    }, lang);

    // 5. Audit Log
    await logAccess(
      { email: user?.email || 'token-user', role: isAdmin ? 'admin' : (user ? 'user' : 'anon'), id: user?.id },
      'EXPORT_WORD',
      { type: resourceType, id: planId },
      { lang, method: tokenPayload ? 'token' : 'auth' }
    );

    const safeBusinessName = String(plan.business_name || 'Draft').replace(/\s+/g, '_');

    return new NextResponse(buffer as any, {
        headers: {
            'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'Content-Disposition': `attachment; filename="HACCP_Plan_${safeBusinessName}.docx"`
        }
    });

  } catch (error: any) {
    console.error('Word Gen Error:', error);
    return NextResponse.json({ error: 'Failed to generate document. Please try again.' }, { status: 500 });
  }
}
