import 'server-only';
import { PDFDocument, StandardFonts, rgb, degrees } from 'pdf-lib';
import type { WatermarkConfig } from './watermarkConfig';

export async function applyWatermark(pdfBuffer: Buffer, config: WatermarkConfig): Promise<Buffer> {
  const pdfDoc = await PDFDocument.load(pdfBuffer);
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

  for (const page of pdfDoc.getPages()) {
    const { width, height } = page.getSize();

    const totalTextHeight =
      config.textLines.length * config.fontSize +
      (config.textLines.length - 1) * config.lineGap;

    let startY = height / 2 + totalTextHeight / 2 - config.fontSize;

    for (const line of config.textLines) {
      const textWidth = font.widthOfTextAtSize(line, config.fontSize);
      const x = width / 2 - textWidth / 2;
      const y = startY;

      page.drawText(line, {
        x,
        y,
        size: config.fontSize,
        font,
        color: rgb(config.color.r, config.color.g, config.color.b),
        opacity: config.opacity,
        rotate: degrees(config.rotationDegrees)
      });

      startY -= config.fontSize + config.lineGap;
    }
  }

  const watermarked = await pdfDoc.save();
  return Buffer.from(watermarked);
}
