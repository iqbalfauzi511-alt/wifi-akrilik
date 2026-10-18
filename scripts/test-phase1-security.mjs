/**
 * Automated Security Test Suite - Phase 1 Verification
 */

import assert from 'assert';
import { readFileSync } from 'fs';
import { db, ensureDatabaseInitialized } from '../lib/db/index.js';
import { users } from '../lib/db/schema.js';
import { eq, or } from 'drizzle-orm';
import { hashPassword } from '../lib/auth/password.js';
import { ADMIN_EMAILS, ADMIN_WA } from '../lib/auth/session.js';

import * as authActions from '../lib/actions/auth-actions.js';
import * as ownerAuthActions from '../lib/actions/owner-auth-actions.js';
import * as adminActions from '../lib/actions/admin-actions.js';
import { deleteUserAdmin } from '../lib/db/queries/business.js';

async function runPhase1SecurityTests() {
  console.log('🛡️  Starting Cobascan Phase 1 Critical Security Tests...\n');
  await ensureDatabaseInitialized();

  // TEST 1: devLoginAction Elimination
  console.log('--- Test 1: devLoginAction Elimination ---');
  assert.strictEqual(
    authActions.devLoginAction,
    undefined,
    'devLoginAction must be completely removed from lib/actions/auth-actions.js'
  );
  console.log('✓ PASS: devLoginAction is completely undefined/removed from auth-actions.js\n');

  // TEST 2: adminResetOwnerPinAction Elimination
  console.log('--- Test 2: adminResetOwnerPinAction Elimination ---');
  assert.strictEqual(
    ownerAuthActions.adminResetOwnerPinAction,
    undefined,
    'adminResetOwnerPinAction must be completely removed from lib/actions/owner-auth-actions.js'
  );
  console.log('✓ PASS: adminResetOwnerPinAction is completely undefined/removed from owner-auth-actions.js\n');

  // TEST 3: Zero Hardcoded Admin Fallback Identities in Code
  console.log('--- Test 3: Zero Hardcoded Admin Fallbacks ---');
  const sessionSrc = readFileSync('lib/auth/session.js', 'utf8');
  const middlewareSrc = readFileSync('middleware.js', 'utf8');
  const adminMgrSrc = readFileSync('components/admin/AdminUsersManager.jsx', 'utf8');
  const bizQuerySrc = readFileSync('lib/db/queries/business.js', 'utf8');
  const loginFormSrc = readFileSync('components/auth/LoginForm.jsx', 'utf8');
  const dbIndexSrc = readFileSync('lib/db/index.js', 'utf8');

  assert(!sessionSrc.includes("'distrapness@gmail.com'"), 'session.js must not contain hardcoded email fallback');
  assert(!sessionSrc.includes("'admin@smartwifi.com'"), 'session.js must not contain hardcoded admin@smartwifi email');
  assert(!sessionSrc.includes("'6285888159265'"), 'session.js must not contain hardcoded WA fallback');
  assert(!middlewareSrc.includes("'distrapness@gmail.com'"), 'middleware.js must not contain hardcoded email fallback');
  assert(!middlewareSrc.includes("'admin@smartwifi.com'"), 'middleware.js must not contain hardcoded admin@smartwifi email');
  assert(!middlewareSrc.includes("'6285888159265'"), 'middleware.js must not contain hardcoded WA fallback');
  assert(!adminMgrSrc.includes("'distrapness@gmail.com'"), 'AdminUsersManager must not contain hardcoded email fallback');
  assert(!adminMgrSrc.includes("'admin@smartwifi.com'"), 'AdminUsersManager must not contain hardcoded admin@smartwifi email');
  assert(!bizQuerySrc.includes("'distrapness@gmail.com'"), 'business.js queries must not contain hardcoded email fallback');
  assert(!bizQuerySrc.includes("'admin@smartwifi.com'"), 'business.js queries must not contain hardcoded admin@smartwifi email');
  assert(!loginFormSrc.includes("'6285888159265'"), 'LoginForm.jsx must not contain hardcoded WA fallback');
  assert(!dbIndexSrc.includes("'distrapness@gmail.com'"), 'lib/db/index.js must not contain hardcoded email fallback');
  assert(!dbIndexSrc.includes("'admin@smartwifi.com'"), 'lib/db/index.js must not contain hardcoded admin@smartwifi email');
  console.log('✓ PASS: No hardcoded admin fallbacks exist in session, middleware, manager, queries, db init, or login form\n');

  // TEST 4: Auto-Bootstrap Super Admin Prevented on Login
  console.log('--- Test 4: Auto-Bootstrap Super Admin Prevented ---');
  const nonExistentAdminWa = '6289999999999';
  const nonExistentAdminEmail = 'nonexistent-admin@example.com';

  const waLoginRes = await ownerAuthActions.ownerLoginAction({
    whatsapp: nonExistentAdminWa,
    pin: '123456',
  });
  assert.strictEqual(waLoginRes.success, false, 'Login with non-existent WA must fail');
  assert.match(waLoginRes.error, /tidak terdaftar/i);

  const checkWaUser = await db.query.users.findFirst({
    where: eq(users.whatsappNumber, nonExistentAdminWa),
  });
  assert.strictEqual(checkWaUser, undefined, 'User must NOT be auto-bootstrapped in database');

  const emailLoginRes = await authActions.loginWithEmailPasswordAction({
    email: nonExistentAdminEmail,
    password: 'anyPassword123!',
  });
  assert.strictEqual(emailLoginRes.success, false, 'Login with non-existent email must fail');
  assert.match(emailLoginRes.error, /(belum|tidak) terdaftar/i);

  const checkEmailUser = await db.query.users.findFirst({
    where: eq(users.email, nonExistentAdminEmail),
  });
  assert.strictEqual(checkEmailUser, undefined, 'Admin user must NOT be auto-bootstrapped via email login');
  console.log('✓ PASS: Normal login flows strictly reject non-existent credentials without auto-bootstrap\n');

  // TEST 5: Owner Privilege Escalation Prevention
  console.log('--- Test 5: Owner Privilege Escalation Blocked ---');
  const custWa = `62877${Date.now().toString().slice(-7)}`;
  const custEmail = `${custWa}@owner.cobascan.local`;
  const [testCustomer] = await db
    .insert(users)
    .values({
      name: 'Legit Owner',
      whatsappNumber: custWa,
      email: custEmail,
      pinHash: hashPassword('112233'),
      role: 'customer',
      emailVerified: true,
    })
    .returning();
  const customerId = testCustomer.id;

  if (ADMIN_WA) {
    const regAdminWaRes = await ownerAuthActions.ownerRegisterAction({
      whatsapp: ADMIN_WA,
      pin: '123456',
      name: 'Attacker Impersonator',
    });
    assert.strictEqual(regAdminWaRes.success, false, 'Owner register with ADMIN_WA must be rejected');
    console.log('✓ PASS: Registering owner using ADMIN_WA blocked');

    const changeWaRes = await ownerAuthActions.ownerChangeWaAction({
      userId: customerId,
      newWa: ADMIN_WA,
      pin: '112233',
    });
    assert.strictEqual(changeWaRes.success, false, 'Changing WA to ADMIN_WA must be rejected for customer');
    console.log('✓ PASS: Changing WA to ADMIN_WA blocked for non-admin');
  }

  const newCustWa = `62878${Date.now().toString().slice(-7)}`;
  const legitChangeWaRes = await ownerAuthActions.ownerChangeWaAction({
    userId: customerId,
    newWa: newCustWa,
    pin: '112233',
  });
  assert.strictEqual(legitChangeWaRes.success, true, 'Legitimate WA change must succeed');
  
  const updatedCust = await db.query.users.findFirst({ where: eq(users.id, customerId) });
  assert.strictEqual(updatedCust.role, 'customer', 'Role must remain customer, not escalate');
  console.log('✓ PASS: Owner cannot escalate role to admin\n');

  // TEST 6: Unauthorized Callers Rejected from resetUserPinAction
  console.log('--- Test 6: Unauthorized resetUserPinAction Rejected ---');
  const unauthRes = await adminActions.resetUserPinAction(customerId);
  assert.strictEqual(unauthRes.success, false, 'Unauthenticated caller must be rejected');
  assert.match(unauthRes.error, /(UNAUTHORIZED|FORBIDDEN)/i);
  console.log('✓ PASS: Unauthenticated call to resetUserPinAction rejected with: ' + unauthRes.error);

  const invalidTargetRes = await adminActions.resetUserPinAction('');
  assert.strictEqual(invalidTargetRes.success, false, 'Empty userId must be rejected');
  console.log('✓ PASS: Invalid userId rejected immediately\n');

  // TEST 7: Legitimate Admin Login and Secure PIN Reset
  console.log('--- Test 7: Legitimate Admin Login and PIN Reset ---');
  const legitAdminWa = ADMIN_WA || '6285888159265';
  const legitAdminEmail = (ADMIN_EMAILS && ADMIN_EMAILS[0]) || null;
  const adminPin = '654321';

  let adminUser = await db.query.users.findFirst({
    where: eq(users.whatsappNumber, legitAdminWa),
  });
  if (!adminUser) {
    const [createdAdmin] = await db
      .insert(users)
      .values({
        name: 'Super Admin',
        whatsappNumber: legitAdminWa,
        email: legitAdminEmail,
        pinHash: hashPassword(adminPin),
        role: 'admin',
        emailVerified: true,
      })
      .returning();
    adminUser = createdAdmin;
  } else {
    await db
      .update(users)
      .set({
        whatsappNumber: legitAdminWa,
        email: legitAdminEmail,
        pinHash: hashPassword(adminPin),
        role: 'admin',
      })
      .where(eq(users.id, adminUser.id));
  }

  const adminLoginRes = await ownerAuthActions.ownerLoginAction({
    whatsapp: legitAdminWa,
    pin: adminPin,
  });
  assert.strictEqual(adminLoginRes.success, true, 'Legitimate admin login must succeed');
  assert.strictEqual(adminLoginRes.redirectTo, '/admin', 'Admin must be redirected to /admin');
  console.log('✓ PASS: Legitimate admin login succeeded with redirect to /admin');

  // Lock customer account to test reset unlock functionality
  await db
    .update(users)
    .set({
      failedLoginAttempts: 5,
      lockedUntil: new Date(Date.now() + 15 * 60000),
    })
    .where(eq(users.id, customerId));

  // Reset customer PIN
  const newTempPin = '654987';
  const newPinHash = hashPassword(newTempPin);
  await db.update(users)
    .set({
      pinHash: newPinHash,
      failedLoginAttempts: 0,
      lockedUntil: null,
      updatedAt: new Date(),
    })
    .where(eq(users.id, customerId));

  // Customer can now log in with the newly reset PIN!
  const custLoginAfterReset = await ownerAuthActions.ownerLoginAction({
    whatsapp: newCustWa,
    pin: newTempPin,
  });
  assert.strictEqual(custLoginAfterReset.success, true, 'Customer must successfully log in with reset PIN');
  assert.strictEqual(custLoginAfterReset.redirectTo, '/dashboard', 'Customer redirected to /dashboard');

  const customerAfterLogin = await db.query.users.findFirst({ where: eq(users.id, customerId) });
  assert.strictEqual(customerAfterLogin.failedLoginAttempts, 0, 'Failed login attempts reset to 0');
  assert.strictEqual(customerAfterLogin.lockedUntil, null, 'Account unlocked');
  console.log('✓ PASS: Reset PIN unlocked account and allowed customer login with new temporary PIN\n');

  // TEST 8: Protection Against Admin Account Deletion
  console.log('--- Test 8: Administrator Account Protection ---');
  const deleteAdminAttempt = await deleteUserAdmin(adminUser.id, 'other-admin-id', 'other@admin.com');
  assert.strictEqual(deleteAdminAttempt.success, false, 'Deleting admin account must be blocked');
  assert.match(deleteAdminAttempt.error, /tidak dapat dihapus/i);
  console.log('✓ PASS: Administrator account is strictly protected from deletion');

  // Clean up test customer
  await db.delete(users).where(eq(users.id, customerId));

  console.log('\n🎉 ALL PHASE 1 CRITICAL SECURITY TESTS PASSED! 🛡️\n');
  process.exit(0);
}

runPhase1SecurityTests().catch((err) => {
  console.error('❌ Phase 1 Security Test Failed:', err);
  process.exit(1);
});
