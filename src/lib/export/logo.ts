import 'server-only';
import { resolveDocxImageType } from '@/lib/export/word/image';

type LogoAssets = {
  pdfLogo: string | null;
  wordLogo: Buffer | null;
};

const normalizeContentType = (contentType: string): string =>
  contentType === 'image/jpg' ? 'image/jpeg' : contentType;

const resolveWordLogo = (buffer: Buffer): Buffer | null =>
  resolveDocxImageType(buffer) ? buffer : null;

const parseDataUrl = (value: string): LogoAssets | null => {
  // Strict regex for image mime types
  const match = value.match(/^data:(image\/(png|jpeg|jpg|webp));base64,([A-Za-z0-9+/=]+)$/);
  if (!match) {
    return null;
  }

  const [, rawMimeType, , data] = match;
  const mimeType = normalizeContentType(rawMimeType);
  if (!mimeType || !data) {
    return null;
  }

  try {
    const buffer = Buffer.from(data, 'base64');
    // Sanity check buffer size (e.g. max 5MB)
    if (buffer.length > 5 * 1024 * 1024) return null;
    
    return { pdfLogo: `data:${mimeType};base64,${data}`, wordLogo: resolveWordLogo(buffer) };
  } catch {
    return null;
  }
};

const isValidUrl = (url: string): boolean => {
  try {
    const parsed = new URL(url);
    
    // 1. Protocol must be HTTPS
    if (parsed.protocol !== 'https:') return false;

    // 2. Domain Allowlist
    // We expect logos to come from our Supabase Storage
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (!supabaseUrl) return false; // Fail closed if config missing

    const allowedHost = new URL(supabaseUrl).hostname;
    
    // Exact match or subdomain match
    if (parsed.hostname === allowedHost) return true;
    if (parsed.hostname.endsWith('.' + allowedHost)) return true;

    return false;
  } catch {
    return false;
  }
};

export const fetchLogoAssets = async (logoUrl?: string | null): Promise<LogoAssets> => {
  if (!logoUrl) {
    return { pdfLogo: null, wordLogo: null };
  }

  if (logoUrl.startsWith('data:')) {
    return parseDataUrl(logoUrl) ?? { pdfLogo: null, wordLogo: null };
  }

  // SSRF Protection: Validate URL before fetching
  if (!isValidUrl(logoUrl)) {
    console.warn(`[Security] Blocked potential SSRF attempt for logo URL: ${logoUrl}`);
    return { pdfLogo: null, wordLogo: null };
  }

  try {
    const res = await fetch(logoUrl, {
      method: 'GET',
      headers: {
        'Accept': 'image/png, image/jpeg, image/webp'
      },
      // Prevent redirects to unsafe domains
      redirect: 'error',
      // Timeout to prevent DoS
      signal: AbortSignal.timeout(5000) 
    });

    if (!res.ok) {
      return { pdfLogo: null, wordLogo: null };
    }

    const contentTypeHeader = res.headers.get('content-type');
    if (!contentTypeHeader || !contentTypeHeader.startsWith('image/')) {
        return { pdfLogo: null, wordLogo: null };
    }
    const contentType = normalizeContentType(contentTypeHeader.split(';')[0].trim());

    const arrayBuffer = await res.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64 = buffer.toString('base64');

    return {
      pdfLogo: `data:${contentType};base64,${base64}`,
      wordLogo: resolveWordLogo(buffer)
    };
  } catch (error) {
    console.warn('Failed to fetch logo assets', error);
    return { pdfLogo: null, wordLogo: null };
  }
};
