import 'server-only';
import { convertDocxToPdf } from './convertDocxToPdf';
import { applyWatermark } from './watermark/applyWatermark';
import { defaultWatermarkConfig, type WatermarkConfig } from './watermark/watermarkConfig';

export type GeneratePdfOptions = {
  docxBuffer: Buffer;
  watermark?: boolean;
  watermarkConfig?: WatermarkConfig;
};

export async function generatePdfFromDocx(options: GeneratePdfOptions): Promise<Buffer> {
  const { docxBuffer, watermark = false, watermarkConfig } = options;

  const pdfBuffer = await convertDocxToPdf(docxBuffer);

  if (!watermark) {
    return pdfBuffer;
  }

  return applyWatermark(pdfBuffer, watermarkConfig ?? defaultWatermarkConfig);
}
