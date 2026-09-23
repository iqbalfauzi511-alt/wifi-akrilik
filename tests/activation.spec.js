import { test, expect } from '@playwright/test';
import { loginAs, seedQr, clearDb } from './utils';

test.describe('Business Activation Flow', () => {
  test.beforeEach(async () => {
    await clearDb();
  });

  test('should successfully activate a blank device and verify DB status', async ({ page, context }) => {
    await loginAs(context, 'business@test.com');

    // Seed a blank QR first
    const qr = await seedQr({ code: 'CS-TEST-ACTIVATE', status: 'blank' });

    // Open activation page
    await page.goto(`/activate/${qr.code}`);
    await expect(page.locator('text="Informasi Bisnis Anda"')).toBeVisible();

    // Fill form
    await page.fill('input[name="businessName"]', 'Cafe Test E2E');
    await page.fill('input[name="googleMapsUrl"]', 'https://maps.app.goo.gl/cafe-test-e2e');
    await page.click('button[type="submit"]:has-text("Simpan")');

    // Should redirect to dashboard and show success
    await expect(page).toHaveURL(/\/dashboard/);
    await expect(page.locator('text="Cafe Test E2E"')).toBeVisible();
    await expect(page.locator('text="Perangkat Anda"').first()).toBeVisible();

    // Verify DB
    const res = await page.request.post('/api/test-db', {
      data: { action: 'verifyQr', payload: { code: qr.code } }
    });
    const { qr: verifiedQr } = await res.json();
    
    expect(verifiedQr.status).toBe('active');
    expect(verifiedQr.businessId).not.toBeNull();
  });
});
