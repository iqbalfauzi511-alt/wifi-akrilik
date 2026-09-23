import { test, expect } from '@playwright/test';
import { clearDb, seedQr } from './utils';

test.describe('Customer Public Flow', () => {
  test.beforeEach(async () => {
    await clearDb();
  });

  test('should display 404 for invalid code', async ({ page }) => {
    await page.goto('/q/INVALID-CODE');
    await expect(page.locator('text="Cobascan Tidak Ditemukan"')).toBeVisible();
    await expect(page.locator('text="tidak terdaftar"')).toBeVisible();
    // Verify no stack trace is visible
    await expect(page.locator('text="Exception"')).not.toBeVisible();
    await expect(page.locator('text="SQL"')).not.toBeVisible();
  });

  test('should display inactive message for disabled code', async ({ page }) => {
    const qr = await seedQr({ code: 'CS-DISABLED-1', status: 'disabled' });
    await page.goto(`/q/${qr.code}`);
    await expect(page.locator('text="QR Tidak Aktif"')).toBeVisible();
  });

  test('should redirect to maps if wifi is disabled', async ({ page }) => {
    const qr = await seedQr({ 
      code: 'CS-MAPS-ONLY', 
      status: 'active',
      wifiEnabled: false
    });
    
    // Instead of waiting for Google Maps to fully load (which can timeout or block headless)
    // We just wait for the response to be a redirect
    await page.goto(`/q/${qr.code}`);
    
    await expect(page).toHaveURL(/maps\.app\.goo\.gl/, { timeout: 10000 });
  });

  test('should show VisitorScanExperience if wifi is enabled and verify wifi data freshness', async ({ page, context }) => {
    const qr = await seedQr({ 
      code: 'CS-WIFI-TEST', 
      status: 'active',
      wifiEnabled: true,
      wifiPassword: 'TEST_PASSWORD'
    });
    
    await page.goto(`/q/${qr.code}/wifi`);
    await expect(page.locator('text="Wi-Fi Tamu"')).toBeVisible();
    
    // Check password
    await page.click('button:has-text("Lihat Password")');
    // Note: the reveal-wifi endpoint is called here
    await expect(page.locator('text="TEST_PASSWORD"')).toBeVisible();

    // Now let's simulate the business changing the password in the DB
    await page.request.post('/api/test-db', {
      data: {
        action: 'insertQr',
        payload: {
          code: 'CS-WIFI-TEST', 
          status: 'active',
          wifiEnabled: true,
          wifiPassword: 'NEW_PASSWORD'
        }
      }
    });
    
    // Customer refreshes
    await page.reload();
    await expect(page.locator('text="Wi-Fi Tamu"')).toBeVisible();
    await page.click('button:has-text("Lihat Password")');
    await expect(page.locator('text="NEW_PASSWORD"')).toBeVisible();
  });
});
