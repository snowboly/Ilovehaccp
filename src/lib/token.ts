import { createHmac, timingSafeEqual } from 'crypto';

const SECRET = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'dev-secret';

export interface AccessTokenPayload {
  id: string;      // Resource ID (plan_id or draft_id)
  type: 'plan' | 'draft';
  scope: 'view' | 'export';
  email?: string;  // Optional: bind to email for audit
  exp: number;     // Unix timestamp
}

export function generateAccessToken(
  id: string, 
  type: 'plan' | 'draft', 
  scope: 'view' | 'export',
  expiresInSeconds: number = 7 * 24 * 60 * 60 // Default 7 days
): string {
  const payload: AccessTokenPayload = {
    id,
    type,
    scope,
    exp: Math.floor(Date.now() / 1000) + expiresInSeconds
  };

  const payloadStr = Buffer.from(JSON.stringify(payload)).toString('base64');
  const hmac = createHmac('sha256', SECRET);
  hmac.update(payloadStr);
  const signature = hmac.digest('hex');

  return `${payloadStr}.${signature}`;
}

export function verifyAccessToken(token: string): AccessTokenPayload | null {
  try {
    if (!token || !token.includes('.')) return null;
    
    const [payloadB64, signature] = token.split('.');
    if (!payloadB64 || !signature) return null;

    const payloadStr = Buffer.from(payloadB64, 'base64').toString('utf-8');
    const payload = JSON.parse(payloadStr) as AccessTokenPayload;

    // Check expiration
    if (Date.now() > payload.exp * 1000) return null;

    // Verify Signature
    const hmac = createHmac('sha256', SECRET);
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
