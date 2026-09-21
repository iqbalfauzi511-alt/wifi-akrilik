import { validateInstagramUrl } from '../lib/utils/validation.js';

async function runTests() {
  console.log('🚀 Running Complete HTTP Integration & Instagram URL Verification Tests...\n');
  const baseUrl = 'http://localhost:3000';
  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`✅ PASS: ${message}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${message}`);
      failed++;
    }
  }

  // Test 1: Instagram URL Validation Unit Tests
  console.log('1️⃣ Testing Server-Side Instagram URL Validation Rules:');
  
  // Valid URLs
  const v1 = validateInstagramUrl('https://instagram.com/kopisenja');
  assert(v1.isValid && v1.normalized.startsWith('https://'), 'Accepts https://instagram.com/kopisenja');

  const v2 = validateInstagramUrl('https://www.instagram.com/kopisenja/');
  assert(v2.isValid && v2.normalized.startsWith('https://'), 'Accepts https://www.instagram.com/kopisenja/');

  const v3 = validateInstagramUrl('http://instagram.com/kopisenja');
  assert(v3.isValid && v3.normalized.startsWith('https://'), 'Accepts and normalizes http:// to https://');

  const v4 = validateInstagramUrl('http://www.instagram.com/kopisenja/');
  assert(v4.isValid && v4.normalized.startsWith('https://'), 'Accepts and normalizes http://www.instagram.com/');

  // Invalid URLs (Must be rejected)
  const inv1 = validateInstagramUrl('kopisenja');
  assert(!inv1.isValid, 'Rejects plain username "kopisenja"');

  const inv2 = validateInstagramUrl('@kopisenja');
  assert(!inv2.isValid, 'Rejects handle with @ "@kopisenja"');

  const inv3 = validateInstagramUrl('instagram.com/kopisenja');
  assert(!inv3.isValid, 'Rejects URL without protocol "instagram.com/kopisenja"');

  const inv4 = validateInstagramUrl('https://facebook.com/kopisenja');
  assert(!inv4.isValid, 'Rejects facebook URL');

  const inv5 = validateInstagramUrl('https://tiktok.com/@kopisenja');
  assert(!inv5.isValid, 'Rejects tiktok URL');

  assert(
    inv1.error.includes('Link Instagram tidak valid'),
    'Returns exact required error message on invalid input'
  );
  console.log('');

  // Test 2: Landing Page
  console.log('2️⃣ Testing Landing Page:');
  const resHome = await fetch(`${baseUrl}/`);
  const htmlHome = await resHome.text();
  assert(resHome.status === 200, 'Landing page returns HTTP 200');
  assert(htmlHome.includes('Smart Wi-Fi'), 'Contains "Smart Wi-Fi" branding');
  assert(htmlHome.includes('Cara Kerja'), 'Contains "Cara Kerja" section');
  console.log('');

  // Test 3: Unactivated QR (SW-BLANK1)
  console.log('3️⃣ Testing Unactivated QR Page (/q/SW-BLANK1):');
  const resBlank = await fetch(`${baseUrl}/q/SW-BLANK1`);
  const htmlBlank = await resBlank.text();
  assert(resBlank.status === 200, 'Unactivated QR returns HTTP 200');
  assert(htmlBlank.includes('QR Belum Diaktifkan'), 'Displays "QR Belum Diaktifkan" notice');
  assert(htmlBlank.includes('/activate/SW-BLANK1'), 'Includes activation button');
  console.log('');

  // Test 4: Active QR Visitor Page (/q/SW-KOP001) - Instagram Link
  console.log('4️⃣ Testing Active QR Visitor Page (/q/SW-KOP001) & Instagram Redirect:');
  const resActive = await fetch(`${baseUrl}/q/SW-KOP001`, {
    headers: { 'user-agent': 'TestVisitorAgent/1.0' }
  });
  const htmlActive = await resActive.text();
  assert(resActive.status === 200, 'Active QR returns HTTP 200');
  assert(htmlActive.includes('Kopi Senja'), 'Shows cafe name "Kopi Senja"');
  assert(
    htmlActive.includes('href="https://www.instagram.com/kopisenja/"') ||
    htmlActive.includes('https://www.instagram.com/kopisenja/'),
    'Contains exact stored business.instagram_url'
  );
  assert(htmlActive.includes('target="_blank"'), 'Instagram button opens with target="_blank"');
  assert(htmlActive.includes('rel="noopener noreferrer"'), 'Instagram button uses rel="noopener noreferrer"');
  assert(htmlActive.includes('FOLLOW INSTAGRAM'), 'Has "FOLLOW INSTAGRAM" action button');
  assert(htmlActive.includes('SAYA SUDAH FOLLOW'), 'Has "SAYA SUDAH FOLLOW" password reveal trigger');
  console.log('');

  // Test 5: Login Page
  console.log('5️⃣ Testing Login Page:');
  const resLogin = await fetch(`${baseUrl}/login`);
  const htmlLogin = await resLogin.text();
  assert(resLogin.status === 200, 'Login page returns HTTP 200');
  assert(htmlLogin.includes('Continue with Google'), 'Includes Google Sign-In button');
  assert(htmlLogin.includes('admin@smartwifi.com'), 'Includes instant test login for Admin');
  assert(htmlLogin.includes('ahmad@kopisenja.com'), 'Includes instant test login for Customer');
  console.log('');

  // Test 6: Route Protection
  console.log('6️⃣ Testing Middleware Route Protection (Unauthenticated):');
  const resDashNoAuth = await fetch(`${baseUrl}/dashboard`, { redirect: 'manual' });
  assert(resDashNoAuth.status === 307 || resDashNoAuth.status === 302, 'Redirects unauthenticated /dashboard access');
  const resAdminNoAuth = await fetch(`${baseUrl}/admin`, { redirect: 'manual' });
  assert(resAdminNoAuth.status === 307 || resAdminNoAuth.status === 302, 'Redirects unauthenticated /admin access');
  console.log('');

  // Test 7: Customer Session Authenticated Dashboard
  console.log('7️⃣ Testing Customer Dashboard with Customer Session:');
  const customerSessionCookie = encodeURIComponent(
    JSON.stringify({
      email: 'ahmad@kopisenja.com',
      name: 'Ahmad',
      role: 'customer',
    })
  );

  const resCustomerDash = await fetch(`${baseUrl}/dashboard`, {
    headers: {
      Cookie: `smartwifi_session=${customerSessionCookie}`,
    },
  });
  const htmlCustomerDash = await resCustomerDash.text();
  assert(resCustomerDash.status === 200, 'Customer dashboard returns HTTP 200');
  assert(htmlCustomerDash.includes('Halo') && htmlCustomerDash.includes('Ahmad'), 'Greets "Halo, Ahmad"');
  assert(htmlCustomerDash.includes('Kopi Senja'), 'Shows active business "Kopi Senja"');
  assert(htmlCustomerDash.includes('KOPI SENJA'), 'Shows Wi-Fi SSID');
  console.log('');

  // Test 8: Customer Settings Form includes Link Instagram
  console.log('8️⃣ Testing Customer Settings Form Link Instagram:');
  const resSettings = await fetch(`${baseUrl}/dashboard/settings`, {
    headers: {
      Cookie: `smartwifi_session=${customerSessionCookie}`,
    },
  });
  const htmlSettings = await resSettings.text();
  assert(resSettings.status === 200, 'Settings returns HTTP 200');
  assert(htmlSettings.includes('Link Instagram'), 'Form has label "Link Instagram"');
  assert(htmlSettings.includes('https://instagram.com/kopisenja'), 'Has helper text with example URL');
  console.log('');

  // Test 9: Admin Session Accessing Admin Portal (/admin)
  console.log('9️⃣ Testing Admin Portal (/admin) with Admin Session:');
  const adminSessionCookie = encodeURIComponent(
    JSON.stringify({
      email: 'admin@smartwifi.com',
      name: 'Admin Utama',
      role: 'admin',
    })
  );

  const resAdminDash = await fetch(`${baseUrl}/admin`, {
    headers: {
      Cookie: `smartwifi_session=${adminSessionCookie}`,
    },
  });
  const htmlAdminDash = await resAdminDash.text();
  assert(resAdminDash.status === 200, 'Admin portal returns HTTP 200');
  assert(htmlAdminDash.includes('Smart Wi-Fi Admin'), 'Shows "Smart Wi-Fi Admin" title');
  assert(htmlAdminDash.includes('Total QR'), 'Shows Total QR statistic');
  console.log('');

  // Test 10: Admin Users Page Shows Instagram URL
  console.log('🔟 Testing Admin Users Page shows Instagram URL:');
  const resAdminUsers = await fetch(`${baseUrl}/admin/users`, {
    headers: {
      Cookie: `smartwifi_session=${adminSessionCookie}`,
    },
  });
  const htmlAdminUsers = await resAdminUsers.text();
  assert(resAdminUsers.status === 200, 'Admin users page returns HTTP 200');
  assert(htmlAdminUsers.includes('Link Instagram'), 'Header column is "Link Instagram"');
  assert(htmlAdminUsers.includes('https://www.instagram.com/kopisenja/'), 'Contains exact clickable URL');
  console.log('');

  console.log('==================================================');
  console.log(`Summary: ${passed} PASSED, ${failed} FAILED`);
  console.log('==================================================');

  if (failed > 0) {
    process.exit(1);
  } else {
    console.log('🎉 ALL INSTAGRAM URL AND INTEGRATION TESTS PASSED!');
    process.exit(0);
  }
}

runTests().catch((err) => {
  console.error('Test execution error:', err);
  process.exit(1);
});
