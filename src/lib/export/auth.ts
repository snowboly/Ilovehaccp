import { createHmac, timingSafeEqual } from 'crypto';

const getTokenSecret = (): string => {
  const secret = process.env.EXPORT_TOKEN_SECRET || process.env.ACCESS_TOKEN_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!secret) {
    throw new Error('EXPORT_TOKEN_SECRET is not configured');
  }
  return secret;
};

export interface ExportTokenPayload {
  id: string;
  type: 'plan' | 'draft';
  exp: number; // Unix timestamp
}

export function verifyExportToken(token: string): ExportTokenPayload | null {
  try {
    if (!token.includes('.')) return null;
    
    const [payloadB64, signature] = token.split('.');
    if (!payloadB64 || !signature) return null;

    const payloadStr = Buffer.from(payloadB64, 'base64').toString('utf-8');
    const payload = JSON.parse(payloadStr) as ExportTokenPayload;

    // Check expiration
    if (Date.now() > payload.exp * 1000) return null;

    // Verify Signature
    const hmac = createHmac('sha256', getTokenSecret());
    hmac.update(payloadB64);
    const expectedSig = hmac.digest('hex');

    // Constant time comparison
    const sigBuffer = Buffer.from(signature);
    const expectedBuffer = Buffer.from(expectedSig);
    
    if (sigBuffer.length !== expectedBuffer.length || !timingSafeEqual(sigBuffer, expectedBuffer)) {
        return null;
    }

    return payload;
  } catch (e) {
    console.error('Token Verification Failed:', e);
    return null;
  }
}
