/**
 * Edge-compatible Session Token Verification using Web Crypto API.
 * Usable inside Next.js Edge middleware and runtime environments.
 */

function getEdgeSecret() {
  const secret = process.env.SESSION_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!secret) {
    if (process.env.NODE_ENV === 'production') {
      return null;
    }
    return 'cobascan-dev-secret-only-not-for-production-use';
  }
  return secret;
}

/**
 * Verifies an HMAC-SHA256 signed session token ("payloadBase64.signatureHex")
 * Returns parsed payload object or null if invalid, tampered, or missing.
 */
export async function verifySessionPayloadEdge(token) {
  if (!token || typeof token !== 'string') return null;

  const parts = token.split('.');
  if (parts.length !== 2) return null;

  const [payloadBase64, signatureHex] = parts;
  if (!payloadBase64 || !signatureHex || signatureHex.length !== 64) {
    return null;
  }

  const secret = getEdgeSecret();
  if (!secret) {
    console.error('[SECURITY ERROR] Missing SESSION_SECRET in production.');
    return null;
  }

  try {
    const enc = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw',
      enc.encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify']
    );

    const sigBytes = new Uint8Array(32);
    for (let i = 0; i < 32; i++) {
      sigBytes[i] = parseInt(signatureHex.substring(i * 2, i * 2 + 2), 16);
    }

    const isValid = await crypto.subtle.verify('HMAC', key, sigBytes, enc.encode(payloadBase64));
    if (!isValid) return null;

    let b64 = payloadBase64.replace(/-/g, '+').replace(/_/g, '/');
    while (b64.length % 4) b64 += '=';
    const decodedJson = new TextDecoder().decode(Uint8Array.from(atob(b64), (c) => c.charCodeAt(0)));
    return JSON.parse(decodedJson);
  } catch {
    return null;
  }
}
