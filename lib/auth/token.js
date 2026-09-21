import crypto from 'crypto';

// Secret key for HMAC signing. In production, use SESSION_SECRET or a persistent hash
const FALLBACK_SECRET = 'cobascan-smart-wifi-nfc-secret-key-salt-2025';
const SESSION_SECRET = process.env.SESSION_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY || FALLBACK_SECRET;

/**
 * Sign session data with HMAC-SHA256
 * Returns format: "payload_base64.signature_hex"
 */
export function signSessionPayload(payload) {
  try {
    const payloadString = JSON.stringify(payload);
    const payloadBase64 = Buffer.from(payloadString, 'utf8').toString('base64url');
    const signature = crypto
      .createHmac('sha256', SESSION_SECRET)
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
 */
export function verifySessionPayload(token) {
  if (!token || typeof token !== 'string') return null;

  try {
    const parts = token.split('.');
    if (parts.length !== 2) {
      // Backwards compatibility: check if it's legacy plaintext JSON
      try {
        const decoded = decodeURIComponent(token);
        if (decoded.startsWith('{') && decoded.endsWith('}')) {
          const parsed = JSON.parse(decoded);
          // Never trust client-provided role in legacy format
          return {
            ...parsed,
            role: 'customer', // strictly enforce customer role for legacy unsigned cookies
          };
        }
      } catch {
        return null;
      }
      return null;
    }

    const [payloadBase64, providedSignature] = parts;
    const expectedSignature = crypto
      .createHmac('sha256', SESSION_SECRET)
      .update(payloadBase64)
      .digest('hex');

    // Constant-time comparison to prevent timing attacks
    const providedBuffer = Buffer.from(providedSignature, 'hex');
    const expectedBuffer = Buffer.from(expectedSignature, 'hex');

    if (providedBuffer.length !== expectedBuffer.length || !crypto.timingSafeEqual(providedBuffer, expectedBuffer)) {
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
