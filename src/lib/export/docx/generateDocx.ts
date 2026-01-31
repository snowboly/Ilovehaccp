import 'server-only';
import { generateWordDocument } from '@/lib/word-generator';
import PizZip from 'pizzip';

export async function generateDocxBuffer(data: any, lang: string): Promise<Buffer> {
  const buffer = await generateWordDocument(data, lang);
  assertDocxMediaExtensions(buffer);
  return buffer;
}

const ALLOWED_MEDIA_EXTENSIONS = new Set(['png', 'jpg', 'jpeg', 'svg']);

const assertDocxMediaExtensions = (buffer: Buffer) => {
  const zip = new PizZip(buffer);
  const mediaFiles = zip.file(/word\/media\//) ?? [];
  const invalid = mediaFiles.filter((file) => {
    const name = (file as { name?: string }).name || '';
    const ext = name.split('.').pop()?.toLowerCase();
    return !ext || !ALLOWED_MEDIA_EXTENSIONS.has(ext);
  });

  if (invalid.length > 0) {
    const names = invalid.map((file) => (file as { name?: string }).name).join(', ');
    throw new Error(`[docx] Unsupported media extension(s): ${names}`);
  }
};
