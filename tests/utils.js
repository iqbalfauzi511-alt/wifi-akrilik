import crypto from 'crypto';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const FALLBACK_SECRET = 'cobascan-dev-secret-only-not-for-production-use';
const SESSION_SECRET = process.env.SESSION_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY || FALLBACK_SECRET;

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

export async function loginAs(context, identity, role = 'customer') {
  const isWa = typeof identity === 'string' && /^\d+$/.test(identity);
  const payload = {
    role,
    ...(isWa
      ? { whatsapp: identity, name: 'Super Admin', email: `${identity}@admin.cobascan.local` }
      : { email: identity, name: identity.split('@')[0] })
  };
  
  const token = signSessionPayload(payload);
  
  await context.addCookies([
    {
      name: 'smartwifi_session',
      value: token,
      url: 'http://localhost:3000',
    }
  ]);
  
  // Seed the user in the database so that DB queries can find their business
  const res = await fetch('http://localhost:3000/api/test-db', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'seedBusiness',
      payload: { 
        email: isWa ? null : identity, 
        whatsapp: isWa ? identity : null,
        role, 
        name: payload.name 
      }
    })
  });
  const data = await res.json();
  if (data.error) {
    throw new Error('Test DB Error: ' + data.error);
  }
  return data.user;
}

export async function seedQr(payload) {
  const res = await fetch('http://localhost:3000/api/test-db', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'insertQr',
      payload
    })
  });
  const text = await res.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch (err) {
    console.error('seedQr failed. Status:', res.status, 'Body:', text);
    throw new Error(`seedQr failed (${res.status}): ${text.slice(0, 300)}`);
  }
  if (data.error) {
    throw new Error('Test DB Error: ' + data.error);
  }
  return data.qr;
}

export async function clearDb() {
  await fetch('http://localhost:3000/api/test-db', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'clearDb',
      payload: {}
    })
  });
}

