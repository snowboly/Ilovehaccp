import React from 'react';
import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { renderToBuffer } from '@react-pdf/renderer';
import HACCPDocument from '@/components/pdf/HACCPDocument';
import { getDictionary } from '@/lib/locales';
import { generateWordDocument } from '@/lib/word-generator';
import { fetchLogoAssets } from '@/lib/export/logo';
import { isExportAllowed } from '@/lib/export/permissions';
import { applyWatermark, defaultWatermarkConfig, generatePdfFromDocx } from '@/lib/export/pdf';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const sanitizeFileName = (name: string) => name.replace(/[^a-z0-9._-]/gi, '_');

const LEGACY_FALLBACK_ENABLED = process.env.PDF_USE_LEGACY_EXPORTER === 'true';
const DOCX_PDF_ENABLED = process.env.PDF_USE_DOCX_CONVERSION !== 'false';

async function renderLegacyPdf({
  plan,
  fullPlan,
  lang,
  template,
  logo,
  productInputs,
  isPaid
}: {
  plan: any;
  fullPlan: any;
  lang: 'en' | 'es' | 'fr' | 'pt';
  template: string;
  logo: string | null;
  productInputs: Record<string, any>;
  isPaid: boolean;
}): Promise<Buffer> {
  const dict = getDictionary(lang).pdf;
  const pdfData = {
    businessName: plan.business_name,
    productName: productInputs.product_name || plan.product_name || 'HACCP Plan',
    productDescription: productInputs.product_category || plan.product_description || 'Generated Plan',
    intendedUse: productInputs.intended_use || plan.intended_use || 'General',
    storageType: productInputs.storage_conditions || plan.storage_type || 'Standard',
    mainIngredients: productInputs.key_ingredients || 'Standard',
    shelfLife: productInputs.shelf_life || 'As per label',
    analysis: plan.hazard_analysis || [],
    fullPlan,
    planVersion: plan.planVersion || 1,
    lang,
    isPaid
  };

  const pdfElement = React.createElement(HACCPDocument, {
    data: pdfData,
    dict,
    logo,
    template
  });

  const pdfBuffer = await renderToBuffer(pdfElement);
  return Buffer.isBuffer(pdfBuffer)
    ? pdfBuffer
    : Buffer.from((pdfBuffer as any) instanceof ArrayBuffer ? new Uint8Array(pdfBuffer as any) : pdfBuffer as any);
}

export async function POST(req: Request) {
  let planId: string | undefined;
  let userId: string | undefined;

  try {
    const body = await req.json();
    planId = body?.planId as string | undefined;
    const lang = (body?.lang || 'en') as 'en' | 'es' | 'fr' | 'pt';

    if (!planId) {
      return NextResponse.json({ error: 'Missing planId' }, { status: 400 });
    }

    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
          set() {},
          remove() {}
        }
      }
    );

    const { data: authData } = await supabase.auth.getUser();
    const user = authData.user;
    userId = user?.id;

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: plan, error: planError } = await supabase
      .from('plans')
      .select('*')
      .eq('id', planId)
      .single();

    if (planError || !plan) {
      return NextResponse.json({ error: 'Plan not found' }, { status: 404 });
    }

    const permission = isExportAllowed(plan);
    if (!permission.allowed) {
      return NextResponse.json({ error: permission.reason }, { status: 422 });
    }

    const { data: latestVersion } = await supabase
      .from('haccp_plan_versions')
      .select('version_number')
      .eq('plan_id', planId)
      .order('version_number', { ascending: false })
      .limit(1)
      .single();

    const planVersion = latestVersion?.version_number || 1;

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
    const { wordLogo, pdfLogo } = await fetchLogoAssets(productInputs.logo_url);

    const isPaid =
      plan.payment_status === 'paid' ||
      plan.export_paid ||
      plan.review_paid;

    let pdfBuffer: Buffer;

    if (DOCX_PDF_ENABLED) {
      try {
        const docxBuffer = await generateWordDocument(
          {
            businessName: plan.business_name,
            full_plan: fullPlan,
            planVersion,
            template: originalInputs.template || fullPlan.validation?.document_style,
            productName: productInputs.product_name || plan.product_name || 'HACCP Plan',
            productDescription: productInputs.product_category || plan.product_description || 'Generated Plan',
            mainIngredients: productInputs.key_ingredients || 'Standard',
            intendedUse: productInputs.intended_use || plan.intended_use || 'General',
            storageType: productInputs.storage_conditions || plan.storage_type || 'Standard',
            shelfLife: productInputs.shelf_life || 'As per label',
            logoBuffer: wordLogo,
            isPaid
          },
          lang
        );

        pdfBuffer = await generatePdfFromDocx({
          docxBuffer,
          watermark: !isPaid
        });
      } catch (error) {
        console.error('[export/pdf] DOCX conversion failed', { planId, userId, error });
        if (!LEGACY_FALLBACK_ENABLED) {
          throw error;
        }

        console.warn('[export/pdf] Falling back to legacy PDF renderer:', error);
        pdfBuffer = await renderLegacyPdf({
          plan: { ...plan, planVersion },
          fullPlan,
          lang,
          template: originalInputs.template || 'audit-classic',
          logo: pdfLogo,
          productInputs,
          isPaid
        });
        if (!isPaid) {
          pdfBuffer = await applyWatermark(pdfBuffer, defaultWatermarkConfig);
        }
      }
    } else {
      pdfBuffer = await renderLegacyPdf({
        plan: { ...plan, planVersion },
        fullPlan,
        lang,
        template: originalInputs.template || 'audit-classic',
        logo: pdfLogo,
        productInputs,
        isPaid
      });
      if (!isPaid) {
        pdfBuffer = await applyWatermark(pdfBuffer, defaultWatermarkConfig);
      }
    }

    const baseName = plan.business_name || 'HACCP_Plan';
    const fileName = sanitizeFileName(body?.fileName || `${baseName}.pdf`);

    return new NextResponse(pdfBuffer as any, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="${fileName}"`,
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        Pragma: 'no-cache',
        Expires: '0'
      }
    });
  } catch (error: any) {
    console.error('PDF Export Error:', { planId, userId, error });
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
