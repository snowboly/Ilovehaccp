import 'server-only';
import { convertDocxToPdfWithLibreOffice } from './libreoffice';

export async function convertDocxToPdf(docxBuffer: Buffer): Promise<Buffer> {
  return convertDocxToPdfWithLibreOffice(docxBuffer);
}
