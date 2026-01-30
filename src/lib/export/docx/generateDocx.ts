import 'server-only';
import { generateWordDocument } from '@/lib/word-generator';

export async function generateDocxBuffer(data: any, lang: string): Promise<Buffer> {
  return generateWordDocument(data, lang);
}
