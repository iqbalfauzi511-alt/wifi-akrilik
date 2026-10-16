import { validateGoogleMapsUrl } from '../lib/utils/validation.js';
import { signSessionPayload, verifySessionPayload, getSessionSecret } from '../lib/auth/token.js';
import { verifySessionPayloadEdge } from '../lib/auth/token-edge.js';

console.log('--- TEST 1: Google Maps URL Validation & Anti-Phishing ---');

const validUrls = [
  'https://maps.app.goo.gl/abcdef123',
  'https://maps.google.com/maps?cid=12345',
  'https://g.page/r/abcdef123',
  'https://maps.google.co.id/maps/place/Kopi+Senja',
  'https://search.google.com/local/writereview?placeid=ChIJ123',
];

for (const url of validUrls) {
  const res = validateGoogleMapsUrl(url);
  if (!res.isValid) {
    console.error(`❌ Expected VALID for ${url}, got error: ${res.error}`);
    process.exit(1);
  } else {
    console.log(`✓ Valid: ${url}`);
  }
}

const invalidUrls = [
  'https://evil-maps.com/review',
  'https://phishinggoogle.com/',
  'https://maps.attacker.com/google.com',
  'http://google.com.malicious.net/login',
  'https://google.fake.org/maps',
  'javascript:alert(1)',
];

for (const url of invalidUrls) {
  const res = validateGoogleMapsUrl(url);
  if (res.isValid) {
    console.error(`❌ Expected INVALID for phishing URL ${url}, but was accepted!`);
    process.exit(1);
  } else {
    console.log(`✓ Blocked phishing: ${url}`);
  }
}

console.log('\n--- TEST 2: HMAC Session Signing & Anti-Tampering ---');

const testPayload = { id: 'usr-123', email: 'owner@example.com', role: 'customer' };
const signedToken = signSessionPayload(testPayload);
console.log('Signed Token:', signedToken.substring(0, 30) + '...');

const verified = verifySessionPayload(signedToken);
if (!verified || verified.email !== 'owner@example.com') {
  console.error('❌ Verification failed for valid token!');
  process.exit(1);
}
console.log('✓ Valid token successfully verified');

// Test tampering (attacker changing role to 'admin' in base64 payload)
const [b64, sig] = signedToken.split('.');
const tamperedObj = JSON.parse(Buffer.from(b64, 'base64url').toString('utf8'));
tamperedObj.role = 'admin';
tamperedObj.email = 'attacker@bad.com';
const tamperedB64 = Buffer.from(JSON.stringify(tamperedObj), 'utf8').toString('base64url');
const tamperedToken = `${tamperedB64}.${sig}`;

const tamperedResult = verifySessionPayload(tamperedToken);
if (tamperedResult !== null) {
  console.error('❌ Tampered token was NOT rejected!');
  process.exit(1);
}
console.log('✓ Tampered token was properly rejected as null');

// Test 3: Legacy unsigned cookie rejection
console.log('\n--- TEST 3: Strict Rejection of Legacy Unsigned Cookies ---');
const legacyPlaintext = JSON.stringify({ whatsapp: '6285888159265', role: 'admin' });
const legacyResult = verifySessionPayload(legacyPlaintext);
if (legacyResult !== null) {
  console.error('❌ Legacy unsigned cookie was accepted!');
  process.exit(1);
}
console.log('✓ Unsigned legacy cookie strictly rejected');

const legacyUrlEncoded = encodeURIComponent(legacyPlaintext);
const legacyUrlResult = verifySessionPayload(legacyUrlEncoded);
if (legacyUrlResult !== null) {
  console.error('❌ URL-encoded legacy unsigned cookie was accepted!');
  process.exit(1);
}
console.log('✓ URL-encoded unsigned legacy cookie strictly rejected');

// Test 4: Edge Runtime Web Crypto Verification
console.log('\n--- TEST 4: Edge Runtime Web Crypto Verification ---');
const edgeVerified = await verifySessionPayloadEdge(signedToken);
if (!edgeVerified || edgeVerified.email !== 'owner@example.com') {
  console.error('❌ Edge verification failed for valid token!');
  process.exit(1);
}
console.log('✓ Edge verifier accepted valid HMAC token');

const edgeTampered = await verifySessionPayloadEdge(tamperedToken);
if (edgeTampered !== null) {
  console.error('❌ Edge verifier accepted tampered token!');
  process.exit(1);
}
console.log('✓ Edge verifier strictly rejected tampered token');

const edgeLegacy = await verifySessionPayloadEdge(legacyPlaintext);
if (edgeLegacy !== null) {
  console.error('❌ Edge verifier accepted unsigned plaintext token!');
  process.exit(1);
}
console.log('✓ Edge verifier strictly rejected unsigned plaintext token');

// Test 5: Production Secret Enforcement
console.log('\n--- TEST 5: Production Secret Requirement Enforcement ---');
const origNodeEnv = process.env.NODE_ENV;
const origSessionSecret = process.env.SESSION_SECRET;
const origSupabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

try {
  process.env.NODE_ENV = 'production';
  delete process.env.SESSION_SECRET;
  delete process.env.SUPABASE_SERVICE_ROLE_KEY;

  let threw = false;
  try {
    getSessionSecret();
  } catch (err) {
    threw = true;
  }
  if (!threw) {
    console.error('❌ Expected getSessionSecret to throw in production when secrets are missing!');
    process.exit(1);
  }
  console.log('✓ Production mode strictly throws error when SESSION_SECRET is missing');
} finally {
  process.env.NODE_ENV = origNodeEnv;
  if (origSessionSecret) process.env.SESSION_SECRET = origSessionSecret;
  if (origSupabaseKey) process.env.SUPABASE_SERVICE_ROLE_KEY = origSupabaseKey;
}

// Test 6: Safe Redirect URL (Anti-Open Redirect)
console.log('\n--- TEST 6: Internal Redirect Sanitization (Anti-Open Redirect) ---');
import { safeRedirectUrl } from '../lib/utils/validation.js';

const redirectTests = [
  { input: '/dashboard', expected: '/dashboard', desc: 'Valid internal route /dashboard' },
  { input: '/admin/qr', expected: '/admin/qr', desc: 'Valid internal route /admin/qr' },
  { input: '/activate/CS-ABC123', expected: '/activate/CS-ABC123', desc: 'Valid internal activation route' },
  { input: 'https://evil.com', expected: '/dashboard', desc: 'External scheme https:// rejected' },
  { input: 'http://attacker.com/login', expected: '/dashboard', desc: 'External scheme http:// rejected' },
  { input: '//evil.com/fake-login', expected: '/dashboard', desc: 'Protocol-relative //evil.com rejected' },
  { input: '/\\evil.com', expected: '/dashboard', desc: 'Backslash escape /\\evil.com rejected' },
  { input: 'javascript:alert(1)', expected: '/dashboard', desc: 'javascript: URI rejected' },
  { input: '', expected: '/dashboard', desc: 'Empty input falls back safely' },
  { input: null, expected: '/dashboard', desc: 'Null input falls back safely' },
];

for (const t of redirectTests) {
  const result = safeRedirectUrl(t.input, '/dashboard');
  if (result !== t.expected) {
    console.error(`❌ Redirect test failed for [${t.desc}]: expected ${t.expected}, got ${result}`);
    process.exit(1);
  } else {
    console.log(`✓ ${t.desc} -> ${result}`);
  }
}

// Test 7: Password / PIN Hashing with PBKDF2 (210,000 Iterations)
console.log('\n--- TEST 7: PBKDF2 Hashing (210,000 Iterations) & Timing Resistance ---');
import { hashPassword, verifyPassword, needsRehash } from '../lib/auth/password.js';

const testPin = '123456';
const newHash = hashPassword(testPin);
console.log('Generated hash:', newHash.substring(0, 40) + '...');

if (!newHash.startsWith('pbkdf2:210000:')) {
  console.error('❌ Hash format does not use versioned 210,000 iterations format!');
  process.exit(1);
}
console.log('✓ Hash uses versioned pbkdf2:210000 format');

if (!verifyPassword(testPin, newHash)) {
  console.error('❌ Failed to verify correct PIN against new hash!');
  process.exit(1);
}
console.log('✓ Valid PIN verified against new 210,000-iteration hash');

if (verifyPassword('654321', newHash)) {
  console.error('❌ Wrong PIN was accepted by verifyPassword!');
  process.exit(1);
}
console.log('✓ Wrong PIN was rejected by verifyPassword');

if (needsRehash(newHash)) {
  console.error('❌ needsRehash returned true for current 210,000-iteration hash!');
  process.exit(1);
}
console.log('✓ needsRehash returns false for current 210,000 hash');

// Test 8: Legacy Hash Verification & Seamless Upgrade Path
console.log('\n--- TEST 8: Legacy Hash Backward Compatibility & Upgrade ---');
// Simulate legacy 1,000-iteration hash: "salt:hash"
import crypto from 'crypto';
const legacySalt = crypto.randomBytes(16).toString('hex');
const legacyRawHash = crypto.pbkdf2Sync('999888', legacySalt, 1000, 64, 'sha512').toString('hex');
const legacyStoredHash = `${legacySalt}:${legacyRawHash}`;

if (!verifyPassword('999888', legacyStoredHash)) {
  console.error('❌ Failed to verify valid password against legacy 1k-iteration hash!');
  process.exit(1);
}
console.log('✓ Valid password successfully verified against legacy 1k-iteration hash');

if (verifyPassword('wrongpin', legacyStoredHash)) {
  console.error('❌ Wrong password accepted against legacy hash!');
  process.exit(1);
}
console.log('✓ Wrong password rejected against legacy hash');

if (!needsRehash(legacyStoredHash)) {
  console.error('❌ needsRehash failed to identify legacy hash for upgrade!');
  process.exit(1);
}
console.log('✓ needsRehash correctly identified legacy hash for seamless upgrade on next login');

console.log('\n✅ ALL SECURITY UNIT TESTS PASSED!');

