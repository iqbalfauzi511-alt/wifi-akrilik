import crypto from 'crypto';

/**
 * Resolves the HMAC session secret key.
 * In production, SESSION_SECRET or SUPABASE_SERVICE_ROLE_KEY is strictly required.
 */
export function getSessionSecret() {
  const secret = process.env.SESSION_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!secret) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error(
        'CRITICAL SECURITY ERROR: SESSION_SECRET or SUPABASE_SERVICE_ROLE_KEY must be configured in production.'
      );
    }
    console.warn('[SECURITY WARNING] Using dev fallback secret. Set SESSION_SECRET in production!');
    return 'cobascan-dev-secret-only-not-for-production-use';
  }
  return secret;
}

/**
 * Sign session data with HMAC-SHA256
 * Returns format: "payload_base64.signature_hex"
 */
export function signSessionPayload(payload) {
  try {
    const secret = getSessionSecret();
    const payloadString = JSON.stringify(payload);
    const payloadBase64 = Buffer.from(payloadString, 'utf8').toString('base64url');
    const signature = crypto
      .createHmac('sha256', secret)
      .update(payloadBase64)
      .digest('hex');
    return `${payloadBase64}.${signature}`;
  } catch (err) {
    console.error('Error signing session payload:', err);
    return null;
  }
}

/**
 * Verify and decode an HMAC-SHA256 signed session token
 * Returns parsed payload or null if invalid or tampered
 * Strictly rejects legacy unsigned plaintext cookies
 */
export function verifySessionPayload(token) {
  if (!token || typeof token !== 'string') return null;

  try {
    const parts = token.split('.');
    if (parts.length !== 2) {
      // Legacy unsigned formats are strictly rejected
      return null;
    }

    const [payloadBase64, providedSignature] = parts;
    if (!payloadBase64 || !providedSignature || providedSignature.length !== 64) {
      return null;
    }

    const secret = getSessionSecret();
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(payloadBase64)
      .digest('hex');

    const providedBuffer = Buffer.from(providedSignature, 'hex');
    const expectedBuffer = Buffer.from(expectedSignature, 'hex');

    // Constant-time comparison to prevent timing attacks
    if (
      providedBuffer.length !== expectedBuffer.length ||
      !crypto.timingSafeEqual(providedBuffer, expectedBuffer)
    ) {
      console.warn('Tampered or invalid session signature detected');
      return null;
    }

    const payloadJson = Buffer.from(payloadBase64, 'base64url').toString('utf8');
    return JSON.parse(payloadJson);
  } catch (err) {
    console.warn('Failed to verify session token:', err?.message || err);
    return null;
  }
}
