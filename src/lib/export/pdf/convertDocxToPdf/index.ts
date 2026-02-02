import 'server-only';
import { convertDocxToPdfWithLibreOffice, LibreOfficeNotAvailableError, isLibreOfficeNotAvailableError } from './libreoffice';
import { convertDocxToPdfWithGotenberg, isGotenbergConfigured, GotenbergConversionError } from './gotenberg';

export { LibreOfficeNotAvailableError, isLibreOfficeNotAvailableError };
export { GotenbergConversionError, isGotenbergConfigured };

/**
 * Convert DOCX buffer to PDF buffer.
 *
 * Strategy:
 * 1. If GOTENBERG_URL is set, use Gotenberg (recommended for production/Vercel)
 * 2. Otherwise, fall back to local LibreOffice (for local development)
 */
export async function convertDocxToPdf(docxBuffer: Buffer): Promise<Buffer> {
  if (isGotenbergConfigured()) {
    console.log('[convertDocxToPdf] Using Gotenberg for conversion');
    return convertDocxToPdfWithGotenberg(docxBuffer);
  }

  console.log('[convertDocxToPdf] Using local LibreOffice for conversion');
  return convertDocxToPdfWithLibreOffice(docxBuffer);
}
