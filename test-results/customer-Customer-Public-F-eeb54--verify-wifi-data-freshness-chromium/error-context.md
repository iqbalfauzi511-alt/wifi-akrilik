# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: customer.spec.js >> Customer Public Flow >> should show VisitorScanExperience if wifi is enabled and verify wifi data freshness
- Location: tests/customer.spec.js:38:7

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: page.click: Test timeout of 30000ms exceeded.
Call log:
  - waiting for locator('button:has-text("Lihat Password")')

```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic [ref=e3]:
    - generic [ref=e10]:
      - generic [ref=e11]: Terverifikasi di Cobascan
      - heading "Dummy Business" [level=1] [ref=e16]
      - paragraph [ref=e17]: Selamat datang! Nikmati layanan dan fasilitas terbaik kami selama kunjungan Anda.
    - generic [ref=e18]:
      - generic [ref=e19]:
        - generic [ref=e20]: Google Review
        - generic [ref=e24]: Hanya butuh ~15 detik
      - generic [ref=e25]:
        - heading "Bagikan Pengalaman Anda" [level=2] [ref=e26]
        - paragraph [ref=e27]: Ulasan Anda di Google Maps sangat membantu kami. Ketuk tombol untuk memberikan ulasan sekaligus membuka akses password Wi-Fi gratis kami.
      - generic [ref=e28]:
        - generic [ref=e29]: "Bagikan Ulasan Anda:"
        - generic [ref=e30]:
          - button "Beri bintang 1 di Google Maps" [ref=e31] [cursor=pointer]
          - button "Beri bintang 2 di Google Maps" [ref=e34] [cursor=pointer]
          - button "Beri bintang 3 di Google Maps" [ref=e37] [cursor=pointer]
          - button "Beri bintang 4 di Google Maps" [ref=e40] [cursor=pointer]
          - button "Beri bintang 5 di Google Maps" [ref=e43] [cursor=pointer]
      - button "Tulis Ulasan di Google Maps" [ref=e46] [cursor=pointer]
    - generic [ref=e57]:
      - generic [ref=e58]:
        - generic [ref=e59]: Akses Wi-Fi Tamu
        - generic [ref=e66]: Terkunci (Beri Rating Dulu)
      - paragraph [ref=e70]: Password Wi-Fi dilindungi. Anda dapat membukanya setelah memberikan ulasan Google Maps di atas.
      - generic [ref=e71]:
        - generic [ref=e72]:
          - generic [ref=e73]: NAMA WI-FI (SSID)
          - generic [ref=e74]: Wi-Fi Tamu
        - generic [ref=e75]:
          - generic [ref=e76]: PASSWORD
          - generic [ref=e77]:
            - generic [ref=e78]: ••••••••••••
            - button "Beri Rating Dulu" [ref=e79] [cursor=pointer]
      - button "Beri Rating untuk Buka Wi-Fi" [ref=e84] [cursor=pointer]
    - generic [ref=e88]:
      - generic [ref=e89]:
        - generic [ref=e90]: Powered by
        - strong [ref=e91]: Cobascan
      - paragraph [ref=e93]: Layanan Portal QR Code
  - alert [ref=e94]
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
  12 |     await expect(page.locator('text="tidak terdaftar"')).toBeVisible();
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
> 50 |     await page.click('button:has-text("Lihat Password")');
     |                ^ Error: page.click: Test timeout of 30000ms exceeded.
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