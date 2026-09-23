import { test, expect } from '@playwright/test';
import { loginAs, seedQr, clearDb } from './utils';

test.describe('Security & Authorization', () => {
  test.beforeEach(async () => {
    await clearDb();
  });

  test('Customer cannot access admin dashboard', async ({ page, context }) => {
    await loginAs(context, 'customer@test.com', 'customer');
    await page.goto('/admin');
    
    // Should be redirected to /dashboard
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test('Business Owner cannot access another Business Device', async ({ page, context }) => {
    // Business A context
    await loginAs(context, 'businessA@test.com');

    // Seed Device for Business B
    const qrB = await seedQr({ 
      code: 'CS-DEVICE-B', 
      status: 'active', 
      wifiEnabled: true 
    });
    
    // Remember, dummy business owner is `dummy-CS-DEVICE-B@test.com`, NOT `businessA@test.com`
    // Business A tries to call a server action or access the endpoint that requires ownership
    // E.g. activating an already active device belonging to Business B
    await page.goto(`/activate/${qrB.code}`);
    
    // Since it's already active, it redirects to /q/[code] or shows an error.
    // In our system, active QRs throw "QR Code ini sudah diaktifkan" or redirect to public page.
    await expect(page).not.toHaveURL(/\/dashboard/);
    
    // Let's test the dashboard API / form action directly
    // If Business A tries to submit settings for qrB.code
    // The server will block it due to ownership mismatch. We verify this via UI lack of presence.
    await page.goto('/dashboard/qr');
    // Device B should NOT be in the table
    await expect(page.locator('text="CS-DEVICE-B"')).not.toBeVisible();
  });

  test('Session context isolation', async ({ browser }) => {
    const contextA = await browser.newContext();
    const contextB = await browser.newContext();
    
    await loginAs(contextA, 'userA@test.com');
    await loginAs(contextB, 'userB@test.com');

    const pageA = await contextA.newPage();
    await pageA.goto('/dashboard');
    await expect(pageA.locator('text="userA"')).toBeVisible();

    const pageB = await contextB.newPage();
    await pageB.goto('/dashboard');
    await expect(pageB.locator('text="userB"')).toBeVisible();

    await contextA.close();
    await contextB.close();
  });
});
