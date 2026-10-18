import { test, expect } from '@playwright/test';
import { seedQr, clearDb } from './utils';

test.describe('Business Activation Flow', () => {
  test.beforeEach(async () => {
    await clearDb();
  });

  test('should successfully activate a blank device and verify DB status', async ({ page }) => {
    // Seed a blank QR first
    const qr = await seedQr({ code: 'CS-TEST-ACTIVATE', status: 'blank' });

    // Open activation page as new customer
    await page.goto(`/activate/${qr.code}`);
    await expect(page.getByRole('heading', { name: 'Aktivasi Perangkat' })).toBeVisible();

    // Fill form
    await page.fill('input[type="tel"]', '081298765432');
    const pinInputs = page.locator('input[placeholder="••••••"]');
    await pinInputs.nth(0).fill('123456');
    await pinInputs.nth(1).fill('123456');
    await page.fill('input[placeholder="Kopi Senja"]', 'Cafe Test E2E');
    await page.fill('input[name="googleMapsReviewUrl"]', 'https://maps.app.goo.gl/cafe-test-e2e');
    await page.click('button[type="submit"]:has-text("Aktifkan Perangkat")');

    // Should redirect to dashboard and show success
    await expect(page).toHaveURL(/\/dashboard/);
    await expect(page.getByText('Cafe Test E2E').first()).toBeVisible();

    // Verify DB
    const res = await page.request.post('/api/test-db', {
      data: { action: 'verifyQr', payload: { code: qr.code } }
    });
    const { qr: verifiedQr } = await res.json();
    
    expect(verifiedQr.status).toBe('active');
    expect(verifiedQr.businessId).not.toBeNull();
  });
});
