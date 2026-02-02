import 'server-only';
import { convertDocxToPdfWithLibreOffice, LibreOfficeNotAvailableError, isLibreOfficeNotAvailableError } from './libreoffice';

export { LibreOfficeNotAvailableError, isLibreOfficeNotAvailableError };

export async function convertDocxToPdf(docxBuffer: Buffer): Promise<Buffer> {
  return convertDocxToPdfWithLibreOffice(docxBuffer);
}
