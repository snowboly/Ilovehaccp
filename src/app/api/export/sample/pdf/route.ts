import React from 'react';
import { NextResponse } from 'next/server';
import { renderToBuffer } from '@react-pdf/renderer';
import HACCPDocument from '@/components/pdf/HACCPDocument';
import { getDictionary } from '@/lib/locales';
import { generateDocxBuffer } from '@/lib/export/docx/generateDocx';
import {
  applyWatermark,
  generateCleanPdfFromDocx,
  getDefaultWatermarkConfig,
  resolvePdfPipeline
} from '@/lib/export/pdf';
import { samplePlanFixture } from '@/lib/export/sample/fixture';

export const runtime = 'nodejs';

const WATERMARK_TEXT = 'PREVIEW — NOT FOR OFFICIAL USE';
const SAMPLE_FILENAME = 'Sample_HACCP_Plan.pdf';

const logLegacyPipelineUsage = (reason: string) => {
  console.warn('[DEPRECATED] Legacy PDF pipeline invoked', {
    reason,
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
    return renderLegacySamplePdf();
  }

  try {
    const docxBuffer = await generateDocxBuffer(samplePlanFixture, 'en');
    return await generateCleanPdfFromDocx(docxBuffer);
  } catch (error) {
    // Always fall back to legacy PDF for sample route - LibreOffice may not be available
    console.warn('[sample-pdf] DOCX conversion failed, falling back to legacy PDF:', error);
    logLegacyPipelineUsage('DOCX conversion failed - LibreOffice unavailable');
    return renderLegacySamplePdf();
  }
}

export async function GET() {
  try {
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
  } catch (error) {
    console.error('[sample-pdf] Failed to generate sample PDF:', error);
    return NextResponse.json(
      { error: 'Failed to generate sample PDF' },
      { status: 500 }
    );
  }
}


