import 'server-only';
import { generateWordDocument } from '@/lib/word-generator';
import PizZip from 'pizzip';
import path from 'node:path';

export async function generateDocxBuffer(data: any, lang: string): Promise<Buffer> {
  const buffer = await generateWordDocument(data, lang);
  const initialIssues = validateDocxHealth(buffer);
  if (initialIssues.length === 0) {
    return buffer;
  }

  console.warn('[docx] health check failed, regenerating:', initialIssues);
  const retryBuffer = await generateWordDocument(data, lang);
  const retryIssues = validateDocxHealth(retryBuffer);
  if (retryIssues.length > 0) {
    throw new Error(`[docx] Invalid DOCX output: ${retryIssues.join('; ')}`);
  }
  return retryBuffer;
}

const ALLOWED_MEDIA_EXTENSIONS = new Set(['png', 'jpg', 'jpeg', 'svg']);
const RELS_TAG = /<Relationship\b[^>]*\/>/g;
const DEFAULT_TAG = /<Default\b[^>]*>/g;

const validateDocxHealth = (buffer: Buffer): string[] => {
  const issues: string[] = [];
  const zip = new PizZip(buffer);
  const contentTypesEntry = zip.file('[Content_Types].xml');
  if (!contentTypesEntry) {
    issues.push('Missing [Content_Types].xml');
  }

  const contentTypes = parseContentTypes(contentTypesEntry?.asText?.() ?? '');
  const mediaFiles = zip.file(/word\/media\//) ?? [];
  const mediaExtensions = new Set<string>();

  mediaFiles.forEach((file) => {
    const name = (file as { name?: string }).name || '';
    const ext = name.split('.').pop()?.toLowerCase();
    if (!ext || ext === 'undefined') {
      issues.push(`Invalid media extension: ${name || 'unknown'}`);
      return;
    }
    mediaExtensions.add(ext);
    if (!ALLOWED_MEDIA_EXTENSIONS.has(ext)) {
      issues.push(`Unsupported media extension: ${name}`);
    }
  });

  mediaExtensions.forEach((ext) => {
    if (!contentTypes.has(ext)) {
      issues.push(`Missing content type for .${ext}`);
    }
  });

  const relsFiles = zip.file(/_rels\/[^/]*\.rels$/) ?? [];
  relsFiles.forEach((file) => {
    const relsPath = (file as { name?: string }).name || '';
    const xml = (file as { asText?: () => string }).asText?.() ?? '';
    const relationships = xml.match(RELS_TAG) ?? [];
    const baseDir = relsPath.replace(/_rels\/[^/]*\.rels$/, '');

    relationships.forEach((tag) => {
      const target = getXmlAttribute(tag, 'Target');
      if (!target) return;
      const mode = getXmlAttribute(tag, 'TargetMode');
      if (mode === 'External') return;
      if (hasUriScheme(target)) return;

      const resolved = resolveRelationshipTarget(baseDir, target);
      if (!resolved) {
        issues.push(`Invalid relationship target in ${relsPath}: ${target}`);
        return;
      }
      if (!zip.file(resolved)) {
        issues.push(`Missing relationship target ${resolved} referenced in ${relsPath}`);
      }
    });
  });

  return issues;
};

const parseContentTypes = (xml: string): Set<string> => {
  const extensions = new Set<string>();
  const matches = xml.match(DEFAULT_TAG) ?? [];
  matches.forEach((tag) => {
    const ext = getXmlAttribute(tag, 'Extension');
    if (ext) extensions.add(ext.toLowerCase());
  });
  return extensions;
};

const getXmlAttribute = (tag: string, attr: string): string | null => {
  const match = tag.match(new RegExp(`${attr}="([^"]+)"`));
  return match?.[1] ?? null;
};

const hasUriScheme = (target: string): boolean => /^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(target);

const resolveRelationshipTarget = (baseDir: string, target: string): string | null => {
  const normalizedTarget = target.split('#')[0];
  if (!normalizedTarget) return null;
  if (normalizedTarget.startsWith('/')) {
    return normalizedTarget.slice(1);
  }
  const joined = path.posix.normalize(path.posix.join(baseDir, normalizedTarget));
  if (joined.startsWith('..')) {
    return null;
  }
  return joined.replace(/^\.\//, '');
};
