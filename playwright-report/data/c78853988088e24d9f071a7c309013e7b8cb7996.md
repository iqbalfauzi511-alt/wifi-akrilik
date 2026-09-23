# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: customer.spec.js >> Customer Public Flow >> should display 404 for invalid code
- Location: tests/customer.spec.js:9:7

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('text="tidak terdaftar"')
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" locator('text="tidak terdaftar"') with timeout 5000ms
  - waiting for locator('text="tidak terdaftar"')

```

```yaml
- img
- heading "Cobascan Tidak Ditemukan" [level=2]
- paragraph: Kode yang Anda akses (INVALID-CODE) tidak terdaftar pada sistem Cobascan.
- link "Kembali ke Beranda":
  - /url: /
  - button "Kembali ke Beranda"
- alert
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | import { clearDb, seedQr } from './utils';
  3  | 
  4  | test.describe('Customer Public Flow', () => {
  5  |   test.beforeEach(async () => {
  6  |     await clearDb();
  7  |   });
  8  | 
  9  |   test('should display 404 for invalid code', async ({ page }) => {
  10 |     await page.goto('/q/INVALID-CODE');
  11 |     await expect(page.locator('text="Cobascan Tidak Ditemukan"')).toBeVisible();
> 12 |     await expect(page.locator('text="tidak terdaftar"')).toBeVisible();
     |                                                          ^ Error: expect(locator).toBeVisible() failed
  13 |     // Verify no stack trace is visible
  14 |     await expect(page.locator('text="Exception"')).not.toBeVisible();
  15 |     await expect(page.locator('text="SQL"')).not.toBeVisible();
  16 |   });
  17 | 
  18 |   test('should display inactive message for disabled code', async ({ page }) => {
  19 |     const qr = await seedQr({ code: 'CS-DISABLED-1', status: 'disabled' });
  20 |     await page.goto(`/q/${qr.code}`);
  21 |     await expect(page.locator('text="QR Tidak Aktif"')).toBeVisible();
  22 |   });
  23 | 
  24 |   test('should redirect to maps if wifi is disabled', async ({ page }) => {
  25 |     const qr = await seedQr({ 
  26 |       code: 'CS-MAPS-ONLY', 
  27 |       status: 'active',
  28 |       wifiEnabled: false
  29 |     });
  30 |     
  31 |     // Instead of waiting for Google Maps to fully load (which can timeout or block headless)
  32 |     // We just wait for the response to be a redirect
  33 |     await page.goto(`/q/${qr.code}`);
  34 |     
  35 |     await expect(page).toHaveURL(/maps\.app\.goo\.gl/, { timeout: 10000 });
  36 |   });
  37 | 
  38 |   test('should show VisitorScanExperience if wifi is enabled and verify wifi data freshness', async ({ page, context }) => {
  39 |     const qr = await seedQr({ 
  40 |       code: 'CS-WIFI-TEST', 
  41 |       status: 'active',
  42 |       wifiEnabled: true,
  43 |       wifiPassword: 'TEST_PASSWORD'
  44 |     });
  45 |     
  46 |     await page.goto(`/q/${qr.code}/wifi`);
  47 |     await expect(page.locator('text="Wi-Fi Tamu"')).toBeVisible();
  48 |     
  49 |     // Check password
  50 |     await page.click('button:has-text("Lihat Password")');
  51 |     // Note: the reveal-wifi endpoint is called here
  52 |     await expect(page.locator('text="TEST_PASSWORD"')).toBeVisible();
  53 | 
  54 |     // Now let's simulate the business changing the password in the DB
  55 |     await page.request.post('/api/test-db', {
  56 |       data: {
  57 |         action: 'insertQr',
  58 |         payload: {
  59 |           code: 'CS-WIFI-TEST', 
  60 |           status: 'active',
  61 |           wifiEnabled: true,
  62 |           wifiPassword: 'NEW_PASSWORD'
  63 |         }
  64 |       }
  65 |     });
  66 |     
  67 |     // Customer refreshes
  68 |     await page.reload();
  69 |     await expect(page.locator('text="Wi-Fi Tamu"')).toBeVisible();
  70 |     await page.click('button:has-text("Lihat Password")');
  71 |     await expect(page.locator('text="NEW_PASSWORD"')).toBeVisible();
  72 |   });
  73 | });
  74 | 
```