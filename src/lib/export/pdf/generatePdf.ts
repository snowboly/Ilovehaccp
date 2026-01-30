import 'server-only';
import { convertDocxToPdf } from './convertDocxToPdf';
import { applyWatermark } from './watermark/applyWatermark';
import { getDefaultWatermarkConfig, type WatermarkConfig } from './watermark/watermarkConfig';

export type GeneratePdfOptions = {
  docxBuffer: Buffer;
  watermark?: boolean;
  watermarkConfig?: WatermarkConfig;
};

export async function generateCleanPdfFromDocx(docxBuffer: Buffer): Promise<Buffer> {
  return convertDocxToPdf(docxBuffer);
}

export async function generatePreviewPdfFromDocx(
  docxBuffer: Buffer,
  watermarkConfig: WatermarkConfig = getDefaultWatermarkConfig()
): Promise<Buffer> {
  const pdfBuffer = await generateCleanPdfFromDocx(docxBuffer);
  return applyWatermark(pdfBuffer, watermarkConfig);
}

export async function generatePdfFromDocx(options: GeneratePdfOptions): Promise<Buffer> {
  const { docxBuffer, watermark = false, watermarkConfig } = options;

  if (!watermark) {
    return generateCleanPdfFromDocx(docxBuffer);
  }

  return generatePreviewPdfFromDocx(docxBuffer, watermarkConfig ?? getDefaultWatermarkConfig());
}
