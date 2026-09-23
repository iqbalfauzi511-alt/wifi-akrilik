import crypto from 'crypto';

const FALLBACK_SECRET = 'cobascan-smart-wifi-nfc-secret-key-salt-2025';
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

export async function loginAs(context, email, role = 'customer') {
  const payload = {
    email,
    name: email.split('@')[0],
    role
  };
  
  const token = signSessionPayload(payload);
  
  await context.addCookies([
    {
      name: 'smartwifi_session',
      value: token,
      domain: 'localhost',
      path: '/',
    }
  ]);
  
  // Seed the user in the database so that DB queries can find their business
  const res = await fetch('http://localhost:3000/api/test-db', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'seedBusiness',
      payload: { email, role }
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
  const data = await res.json();
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

