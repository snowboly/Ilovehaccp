import React from 'react';
import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { renderToBuffer } from '@react-pdf/renderer';
import HACCPDocument from '@/components/pdf/HACCPDocument';
import { getDictionary } from '@/lib/locales';
import { fetchLogoAssets } from '@/lib/export/logo';
import { isExportAllowed } from '@/lib/export/permissions';
import { generateDocxBuffer } from '@/lib/export/docx/generateDocx';
import { validateCriticalLimits } from '@/lib/export/criticalLimitValidation';
import {
  buildStoragePath,
  computeContentHash,
  getCachedArtifact,
  putArtifact,
  type ArtifactType
} from '@/lib/export/cache/exportCache';
import {
  applyWatermark,
  generateCleanPdfFromDocx,
  getDefaultWatermarkConfig
} from '@/lib/export/pdf';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const sanitizeFileName = (name: string) => name.replace(/[^a-z0-9._-]/gi, '_');

const LEGACY_FALLBACK_ENABLED = process.env.PDF_USE_LEGACY_EXPORTER === 'true';
const DOCX_PDF_ENABLED = process.env.PDF_USE_DOCX_CONVERSION !== 'false';
const DEFAULT_TEMPLATE_VERSION = 'minneapolis-v1';
const WATERMARK_VERSION = 'wm-v1';

/**
 * PDF Pipeline Selection
 * - "docx" (default): Generate PDF from DOCX conversion (current production behavior)
 * - "legacy": Use legacy react-pdf renderer directly
 *
 * To rollback to legacy pipeline, set: EXPORT_PDF_PIPELINE=legacy
 */
const PDF_PIPELINE = (process.env.EXPORT_PDF_PIPELINE ?? 'docx') as 'docx' | 'legacy';
type NextResponseBody = ArrayBuffer | Uint8Array | string;
const toBodyInit = (data: Buffer | Uint8Array | ArrayBuffer): NextResponseBody => {
  if (data instanceof ArrayBuffer) return data;
  if (data instanceof Uint8Array && !Buffer.isBuffer(data)) return data;
  return new Uint8Array(data);
};
export const selectPdfArtifactForRequest = (exportUnlocked: boolean): ArtifactType =>
  exportUnlocked ? 'clean.pdf' : 'preview.pdf';

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
  }) as React.ReactElement<any>;

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

    if (!planId && body?.data) {
      const data = body.data as Record<string, any>;
      const templateVersion = String(data.template || DEFAULT_TEMPLATE_VERSION);
      const baseFullPlan = data.fullPlan ?? data.full_plan ?? {};
      const fullPlan = {
        ...baseFullPlan,
        hazard_analysis: Array.isArray(baseFullPlan?.hazard_analysis)
          ? baseFullPlan.hazard_analysis
          : data.analysis || data.hazard_analysis || []
      };
      const plan = {
        business_name: data.businessName || data.business_name || 'HACCP Plan',
        product_name: data.productName || data.product_name || 'HACCP Plan',
        product_description: data.productDescription || data.product_description || '',
        intended_use: data.intendedUse || data.intended_use || '',
        storage_type: data.storageType || data.storage_type || '',
        hazard_analysis: fullPlan.hazard_analysis
      };
      const productInputs = {
        product_name: plan.product_name,
        product_category: plan.product_description,
        intended_use: plan.intended_use,
        storage_conditions: plan.storage_type,
        key_ingredients: data.mainIngredients || data.main_ingredients || '',
        shelf_life: data.shelfLife || data.shelf_life || '',
        logo_url: data.logoUrl || data.logo_url || null
      };
      const { pdfLogo } = await fetchLogoAssets(productInputs.logo_url);
      let samplePdf = await renderLegacyPdf({
        plan,
        fullPlan,
        lang,
        template: templateVersion,
        logo: pdfLogo,
        productInputs,
        isPaid: false
      });
      samplePdf = await applyWatermark(samplePdf, getDefaultWatermarkConfig());
      const fileName = sanitizeFileName(body?.fileName || 'HACCP_Plan.pdf');
      const responseBody = toBodyInit(samplePdf);
      return new NextResponse(responseBody as any, {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `inline; filename="${fileName}"`,
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
          Pragma: 'no-cache',
          Expires: '0'
        }
      });
    }

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

    const criticalLimitIssues = validateCriticalLimits(fullPlan);
    if (criticalLimitIssues.length > 0) {
      return NextResponse.json(
        { error: 'Critical limits below standard require justification and reference.', issues: criticalLimitIssues },
        { status: 422 }
      );
    }

    const productInputs = originalInputs.product || {};
    const { wordLogo, pdfLogo } = await fetchLogoAssets(productInputs.logo_url);

    const exportUnlocked =
      plan.payment_status === 'paid' ||
      plan.export_paid ||
      plan.review_paid;

    const templateVersion = String(
      originalInputs.template || fullPlan.validation?.document_style || DEFAULT_TEMPLATE_VERSION
    );

    // Pipeline selection: "docx" (default) or "legacy"
    console.info('[export/pdf] pipeline:', PDF_PIPELINE);

    // DOCX pipeline (default): Generate PDF from DOCX conversion
    const exportPayload = {
      businessName: plan.business_name,
      full_plan: fullPlan,
      planVersion,
      template: templateVersion,
      productName: productInputs.product_name || plan.product_name || 'HACCP Plan',
      productDescription: productInputs.product_category || plan.product_description || 'Generated Plan',
      mainIngredients: productInputs.key_ingredients || 'Standard',
      intendedUse: productInputs.intended_use || plan.intended_use || 'General',
      storageType: productInputs.storage_conditions || plan.storage_type || 'Standard',
      shelfLife: productInputs.shelf_life || 'As per label',
      logoUrl: productInputs.logo_url || null,
      isPaid: exportUnlocked
    };

    const docxContentHash = computeContentHash(exportPayload, templateVersion);
    const docxPath = buildStoragePath(planId, templateVersion, docxContentHash, 'plan.docx');

    const useLegacyPipeline = PDF_PIPELINE === 'legacy' || !DOCX_PDF_ENABLED;
    const pdfPipelineVersion = useLegacyPipeline ? 'legacy-v1' : 'docx-v1';
    const cleanHash = computeContentHash(exportPayload, templateVersion, pdfPipelineVersion);
    const previewHash = computeContentHash(
      exportPayload,
      templateVersion,
      `${pdfPipelineVersion}:${WATERMARK_VERSION}`
    );
    const cleanPath = buildStoragePath(planId, templateVersion, cleanHash, 'clean.pdf');
    const previewPath = buildStoragePath(planId, templateVersion, previewHash, 'preview.pdf');

    let docxBuffer: Buffer | null = null;
    const cachedDocx = await getCachedArtifact({ path: docxPath });
    if (cachedDocx.exists && cachedDocx.buffer) {
      console.info('[export/pdf] cache hit', { planId, artifact: 'plan.docx' });
      docxBuffer = cachedDocx.buffer;
    } else {
      console.info('[export/pdf] cache miss', { planId, artifact: 'plan.docx' });
      docxBuffer = await generateDocxBuffer(
        { ...exportPayload, logoBuffer: wordLogo },
        lang
      );
      await putArtifact({
        path: docxPath,
        buffer: docxBuffer,
        contentType:
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      });
    }

    const requestedArtifact = selectPdfArtifactForRequest(exportUnlocked);
    const requestedPath = requestedArtifact === 'clean.pdf' ? cleanPath : previewPath;
    const cachedPdf = await getCachedArtifact({ path: requestedPath });
    if (cachedPdf.exists && cachedPdf.buffer) {
      console.info('[export/pdf] cache hit', { planId, artifact: requestedArtifact });
      const fileName = sanitizeFileName(body?.fileName || `${plan.business_name || 'HACCP_Plan'}.pdf`);
      const responseBody = toBodyInit(cachedPdf.buffer);
      return new NextResponse(responseBody as any, {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `inline; filename="${fileName}"`,
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
          Pragma: 'no-cache',
          Expires: '0'
        }
      });
    }

    console.info('[export/pdf] cache miss', { planId, artifact: requestedArtifact });

    if (!DOCX_PDF_ENABLED && !LEGACY_FALLBACK_ENABLED) {
      return NextResponse.json({ error: 'DOCX-based PDF exports are disabled.' }, { status: 503 });
    }

    let pdfBuffer: Buffer;
    try {
      if (useLegacyPipeline) {
        let legacyPdf = await renderLegacyPdf({
          plan: { ...plan, planVersion },
          fullPlan,
          lang,
          template: templateVersion,
          logo: pdfLogo,
          productInputs,
          isPaid: exportUnlocked
        });

        if (!exportUnlocked) {
          legacyPdf = await applyWatermark(legacyPdf, getDefaultWatermarkConfig());
        }

        pdfBuffer = legacyPdf;
      } else {
        if (!docxBuffer) {
          throw new Error('DOCX buffer missing for PDF export.');
        }
        const cleanPdf = await generateCleanPdfFromDocx(docxBuffer);
        pdfBuffer = exportUnlocked
          ? cleanPdf
          : await applyWatermark(cleanPdf, getDefaultWatermarkConfig());
      }

      await putArtifact({
        path: requestedPath,
        buffer: pdfBuffer,
        contentType: 'application/pdf'
      });
    } catch (error) {
      console.error('[export/pdf] DOCX conversion failed', { planId, userId, error });
      if (!LEGACY_FALLBACK_ENABLED) {
        throw error;
      }

      let legacyPdf = await renderLegacyPdf({
        plan: { ...plan, planVersion },
        fullPlan,
        lang,
        template: templateVersion,
        logo: pdfLogo,
        productInputs,
        isPaid: exportUnlocked
      });

      if (!exportUnlocked) {
        legacyPdf = await applyWatermark(legacyPdf, getDefaultWatermarkConfig());
      }

      pdfBuffer = legacyPdf;
    }

    const fileName = sanitizeFileName(body?.fileName || `${plan.business_name || 'HACCP_Plan'}.pdf`);

    const responseBody = toBodyInit(pdfBuffer);
    console.info('[export/pdf] served', { planId, artifact: requestedArtifact });
    return new NextResponse(responseBody as any, {
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

    if (LEGACY_FALLBACK_ENABLED && DOCX_PDF_ENABLED) {
      console.warn('[export/pdf] Falling back to legacy PDF renderer:', error);
    }

    const message = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
