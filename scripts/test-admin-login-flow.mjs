import { getDb, ensureDatabaseInitialized } from '../lib/db/index.js';
import { users } from '../lib/db/schema.js';
import { eq } from 'drizzle-orm';
import { verifyPassword } from '../lib/auth/password.js';

async function testAdmin() {
  console.log('--- Testing Admin User Provisioning and PIN Verification ---');
  await ensureDatabaseInitialized();
  const db = getDb();
  
  const admin = await db.query.users.findFirst({
    where: eq(users.whatsappNumber, '6285888159265'),
  });

  console.log('Admin Record:');
  console.log('- ID:', admin?.id);
  console.log('- Name:', admin?.name);
  console.log('- WhatsApp:', admin?.whatsappNumber);
  console.log('- Role:', admin?.role);
  console.log('- Has PIN Hash:', !!admin?.pinHash);

  if (!admin?.pinHash) {
    throw new Error('FAIL: Admin has no pinHash!');
  }

  const isPinValid = verifyPassword('654321', admin.pinHash);
  console.log('✓ PIN 654321 verification:', isPinValid);
  if (!isPinValid) {
    throw new Error('FAIL: PIN 654321 did not verify correctly!');
  }

  const isWrongPinRejected = !verifyPassword('000000', admin.pinHash);
  console.log('✓ Invalid PIN 000000 properly rejected:', isWrongPinRejected);
  if (!isWrongPinRejected) {
    throw new Error('FAIL: Invalid PIN was accepted!');
  }

  console.log('🎉 Admin authentication and provisioning test passed successfully!');
  process.exit(0);
}

testAdmin().catch((err) => {
  console.error('Error during test:', err);
  process.exit(1);
});
