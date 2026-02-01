import 'server-only';
import { createHash } from 'node:crypto';
import { supabaseService } from '@/lib/supabase';

export type ArtifactType = 'clean.pdf' | 'preview.pdf' | 'plan.docx';

const DEFAULT_BUCKET = process.env.EXPORTS_BUCKET ?? 'exports';
export const DOCX_TEMPLATE_VERSION = 'docx-template-v1';

const isPlainObject = (value: unknown): value is Record<string, unknown> =>
  !!value && typeof value === 'object' && !Array.isArray(value);

const stableStringify = (value: unknown): string => {
  if (value === null || value === undefined) return 'null';
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  if (typeof value === 'string') return JSON.stringify(value);
  if (value instanceof Date) return JSON.stringify(value.toISOString());
  if (Array.isArray(value)) {
    return `[${value.map(stableStringify).join(',')}]`;
  }
  if (isPlainObject(value)) {
    const keys = Object.keys(value).sort();
    const entries = keys.map((key) => `${JSON.stringify(key)}:${stableStringify(value[key])}`);
    return `{${entries.join(',')}}`;
  }
  return JSON.stringify(String(value));
};

export function computeContentHash(
  payload: Record<string, unknown>,
  templateVersion: string,
  watermarkVersion?: string
): string {
  const canonical = stableStringify({
    templateVersion,
    watermarkVersion: watermarkVersion ?? null,
    payload
  });
  return createHash('sha256').update(canonical).digest('hex');
}

export function buildStoragePath(
  planId: string,
  templateVersion: string,
  contentHash: string,
  artifactType: ArtifactType
): string {
  return `plans/${planId}/exports/${templateVersion}/${contentHash}/${artifactType}`;
}

export function buildDocxTemplateVersion(templateVersion: string): string {
  return `${templateVersion}:${DOCX_TEMPLATE_VERSION}`;
}

export async function getCachedArtifact({
  path,
  bucket = DEFAULT_BUCKET
}: {
  path: string;
  bucket?: string;
}): Promise<{ exists: boolean; buffer?: Buffer }> {
  const { data, error } = await supabaseService.storage.from(bucket).download(path);

  if (error) {
    const statusCode = (error as any)?.statusCode ?? (error as any)?.status;
    if (statusCode === 404 || String(error.message || '').toLowerCase().includes('not found')) {
      return { exists: false };
    }
    throw error;
  }

  if (!data) {
    return { exists: false };
  }

  const arrayBuffer = await data.arrayBuffer();
  return { exists: true, buffer: Buffer.from(arrayBuffer) };
}

export async function putArtifact({
  path,
  buffer,
  contentType,
  bucket = DEFAULT_BUCKET
}: {
  path: string;
  buffer: Buffer;
  contentType: string;
  bucket?: string;
}): Promise<void> {
  const { error } = await supabaseService.storage.from(bucket).upload(path, buffer, {
    contentType,
    upsert: true
  });

  if (error) {
    throw error;
  }
}

export function resolvePdfArtifactType(isPaid: boolean): ArtifactType {
  return isPaid ? 'clean.pdf' : 'preview.pdf';
}

export async function getOrGenerateArtifact({
  getCached,
  generate,
  store
}: {
  getCached: () => Promise<Buffer | null>;
  generate: () => Promise<Buffer>;
  store: (buffer: Buffer) => Promise<void>;
}): Promise<{ buffer: Buffer; fromCache: boolean }> {
  const cached = await getCached();
  if (cached) {
    return { buffer: cached, fromCache: true };
  }

  const buffer = await generate();
  await store(buffer);
  return { buffer, fromCache: false };
}
