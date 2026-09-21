import { validateGoogleMapsUrl } from '../lib/utils/validation.js';
import { signSessionPayload, verifySessionPayload } from '../lib/auth/token.js';

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

console.log('\n✅ ALL SECURITY UNIT TESTS PASSED!');
