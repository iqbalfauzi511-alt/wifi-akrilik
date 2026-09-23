# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: activation.spec.js >> Business Activation Flow >> should successfully activate a blank device and verify DB status
- Location: tests/activation.spec.js:9:7

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('text="Informasi Bisnis Anda"')
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" locator('text="Informasi Bisnis Anda"') with timeout 5000ms
  - waiting for locator('text="Informasi Bisnis Anda"')

```

```yaml
- link "Kembali ke Dashboard":
  - /url: /dashboard
  - img
  - text: Kembali ke Dashboard
- img
- text: "Kode Cobascan:"
- strong: CS-TEST-ACTIVATE
- heading "Aktifkan Cobascan" [level=1]
- paragraph: Hubungkan QR & NFC Anda dengan Google Review dan fitur bisnis lainnya.
- text: "Akun terhubung:"
- strong: business@test.com
- text: Aktivasi Pertama 🚀
- strong: "Aktivasi Perangkat Pertama:"
- text: Masukkan profil bisnis Anda di bawah untuk mengaktifkan perangkat Cobascan ini. Data ini langsung terhubung dengan QR Code. Nama Bisnis / Toko *
- img
- textbox "Nama Bisnis / Toko *":
  - /placeholder: "Contoh: Kopi Senja - Cabang Melati"
- paragraph: Nama toko/cabang ini akan tampil di bagian atas halaman saat pelanggan scan QR atau tap NFC.
- text: Logo Bisnis
- button "File"
- button "Link URL"
- img
- paragraph: Klik atau seret logo ke sini
- paragraph: Format PNG, JPG, WebP, SVG (Otomatis disesuaikan untuk smartphone)
- paragraph: Logo ini akan tampil pada avatar halaman sambutan ketika pengunjung melakukan scan QR atau tap NFC Cobascan.
- text: Google Review Link *
- img
- textbox "Google Review Link *":
  - /placeholder: https://maps.app.goo.gl/... atau https://maps.google.com/...
- paragraph: Arahkan pelanggan langsung ke halaman review bisnis Anda di Google.
- text: Fitur Cobascan
- img
- text: Google Review Fungsi Utama
- paragraph: Arahkan pelanggan langsung ke halaman review bisnis.
- checkbox "Wi-Fi Access"
- text: Wi-Fi Access Fitur Tambahan
- paragraph: Berikan akses Wi-Fi kepada pelanggan melalui Cobascan.
- button "Aktifkan Cobascan":
  - text: Aktifkan Cobascan
  - img
- alert
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | import { loginAs, seedQr, clearDb } from './utils';
  3  | 
  4  | test.describe('Business Activation Flow', () => {
  5  |   test.beforeEach(async () => {
  6  |     await clearDb();
  7  |   });
  8  | 
  9  |   test('should successfully activate a blank device and verify DB status', async ({ page, context }) => {
  10 |     await loginAs(context, 'business@test.com');
  11 | 
  12 |     // Seed a blank QR first
  13 |     const qr = await seedQr({ code: 'CS-TEST-ACTIVATE', status: 'blank' });
  14 | 
  15 |     // Open activation page
  16 |     await page.goto(`/activate/${qr.code}`);
> 17 |     await expect(page.locator('text="Informasi Bisnis Anda"')).toBeVisible();
     |                                                                ^ Error: expect(locator).toBeVisible() failed
  18 | 
  19 |     // Fill form
  20 |     await page.fill('input[name="businessName"]', 'Cafe Test E2E');
  21 |     await page.fill('input[name="googleMapsUrl"]', 'https://maps.app.goo.gl/cafe-test-e2e');
  22 |     await page.click('button[type="submit"]:has-text("Simpan")');
  23 | 
  24 |     // Should redirect to dashboard and show success
  25 |     await expect(page).toHaveURL(/\/dashboard/);
  26 |     await expect(page.locator('text="Cafe Test E2E"')).toBeVisible();
  27 |     await expect(page.locator('text="Perangkat Anda"').first()).toBeVisible();
  28 | 
  29 |     // Verify DB
  30 |     const res = await page.request.post('/api/test-db', {
  31 |       data: { action: 'verifyQr', payload: { code: qr.code } }
  32 |     });
  33 |     const { qr: verifiedQr } = await res.json();
  34 |     
  35 |     expect(verifiedQr.status).toBe('active');
  36 |     expect(verifiedQr.businessId).not.toBeNull();
  37 |   });
  38 | });
  39 | 
```