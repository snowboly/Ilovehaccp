import React from 'react';
import { NextResponse } from 'next/server';
import { renderToBuffer } from '@react-pdf/renderer';
import HACCPDocument from '@/components/pdf/HACCPDocument';
import { getDictionary } from '@/lib/locales';
import { generateDocxBuffer } from '@/lib/export/docx/generateDocx';
import { applyWatermark, generateCleanPdfFromDocx, getDefaultWatermarkConfig } from '@/lib/export/pdf';
import { samplePlanFixture } from '@/lib/export/sample/fixture';

export const runtime = 'nodejs';
const WATERMARK_TEXT = 'PREVIEW — NOT FOR OFFICIAL USE';
const SAMPLE_FILENAME = 'Sample_HACCP_Plan.pdf';

const resolvePdfPipeline = (env: NodeJS.ProcessEnv) => {
  const pipeline = (env.EXPORT_PDF_PIPELINE ?? 'docx') as 'docx' | 'legacy';
  return {
    pipeline,
    useLegacy: pipeline === 'legacy',
    isProd: env.NODE_ENV === 'production'
  };
};

const logLegacyPipelineUsage = (context: { reason: string }) => {
  console.warn('[DEPRECATED] Legacy PDF pipeline invoked', {
    ...context,
    timestamp: new Date().toISOString(),
    advisory: 'Legacy pipeline is frozen. Migrate to DOCX pipeline.'
  });
};

/**
 * Public sample export route (no auth by design). Uses fixture data only.
 * Rollback docx conversion with EXPORT_PDF_PIPELINE=legacy.
 */
async function renderLegacySamplePdf(): Promise<Buffer> {
  const dict = getDictionary('en').pdf;
  const pdfData = {
    businessName: samplePlanFixture.businessName,
    productName: samplePlanFixture.productName,
    productDescription: samplePlanFixture.productDescription,
    intendedUse: samplePlanFixture.intendedUse,
    storageType: samplePlanFixture.storageType,
    mainIngredients: samplePlanFixture.mainIngredients,
    shelfLife: samplePlanFixture.shelfLife,
    analysis: samplePlanFixture.fullPlan.hazard_analysis || [],
    fullPlan: samplePlanFixture.fullPlan,
    planVersion: samplePlanFixture.planVersion,
    lang: 'en',
    isPaid: false
  };

  const pdfElement = React.createElement(HACCPDocument, {
    data: pdfData,
    dict,
    logo: null,
    template: 'minneapolis-v1'
  }) as React.ReactElement<any>;

  const pdfBuffer = await renderToBuffer(pdfElement);
  return Buffer.isBuffer(pdfBuffer)
    ? pdfBuffer
    : Buffer.from((pdfBuffer as any) instanceof ArrayBuffer ? new Uint8Array(pdfBuffer as any) : pdfBuffer as any);
}

async function generateSamplePdf(): Promise<Buffer> {
  const pipelineConfig = resolvePdfPipeline(process.env);

  if (pipelineConfig.useLegacy) {
    logLegacyPipelineUsage({ reason: 'EXPORT_PDF_PIPELINE=legacy' });
    return renderLegacySamplePdf();
  }

  try {
    const docxBuffer = await generateDocxBuffer(samplePlanFixture, 'en');
    return await generateCleanPdfFromDocx(docxBuffer);
  } catch (error) {
    if (pipelineConfig.isProd) {
      throw error;
    }

    logLegacyPipelineUsage({ reason: 'DOCX conversion unavailable' });
    console.warn('DOCX conversion unavailable, falling back to legacy sample PDF.', error);
    return renderLegacySamplePdf();
  }
}

export async function GET() {
  const pdfBuffer = await generateSamplePdf();
  const watermarkConfig = {
    ...getDefaultWatermarkConfig(),
    textLines: [WATERMARK_TEXT]
  };
  const watermarkedPdf = await applyWatermark(pdfBuffer, watermarkConfig);

  return new NextResponse(new Uint8Array(watermarkedPdf), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="${SAMPLE_FILENAME}"`,
      'Cache-Control': 'public, max-age=600'
    }
  });
}
