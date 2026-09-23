# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: security.spec.js >> Security & Authorization >> Session context isolation
- Location: tests/security.spec.js:45:7

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator:  locator('text="userA"')
Expected: visible
Received: hidden
Timeout:  5000ms

Call log:
  - Expect "toBeVisible" locator('text="userA"') with timeout 5000ms
  - waiting for locator('text="userA"')
    14 × locator resolved to <div class="text-xs font-semibold text-slate-900 leading-none">userA</div>
       - unexpected value "hidden"

```

```yaml
- banner:
  - link:
    - /url: /
    - img
  - heading "Customer Dashboard" [level=1]
  - img
  - text: CUSTOMER
  - button "Keluar":
    - img
- main:
  - heading "Halo, userA 👋" [level=2]
  - paragraph: Selamat datang! Silakan daftarkan profil bisnis Anda atau aktivasi perangkat baru.
  - link "Pengaturan Bisnis":
    - /url: /dashboard/settings
    - button "Pengaturan Bisnis":
      - img
      - text: Pengaturan Bisnis
  - link "Perangkat Aktif":
    - /url: /dashboard/qr
    - button "Perangkat Aktif":
      - img
      - text: Perangkat Aktif
  - img
  - heading "Akses Terbatas" [level=3]
  - paragraph: Anda harus memindai (scan) kode QR pada fisik perangkat Cobascan yang Anda beli untuk mengaktifkan akses ke Dashboard ini.
- link "Dashboard":
  - /url: /dashboard
  - img
  - text: Dashboard
- link "Cobascan":
  - /url: /dashboard/qr
  - img
  - text: Cobascan
- link "Pengaturan":
  - /url: /dashboard/settings
  - img
  - text: Pengaturan
- alert
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | import { loginAs, seedQr, clearDb } from './utils';
  3  | 
  4  | test.describe('Security & Authorization', () => {
  5  |   test.beforeEach(async () => {
  6  |     await clearDb();
  7  |   });
  8  | 
  9  |   test('Customer cannot access admin dashboard', async ({ page, context }) => {
  10 |     await loginAs(context, 'customer@test.com', 'customer');
  11 |     await page.goto('/admin');
  12 |     
  13 |     // Should be redirected to /dashboard
  14 |     await expect(page).toHaveURL(/\/dashboard/);
  15 |   });
  16 | 
  17 |   test('Business Owner cannot access another Business Device', async ({ page, context }) => {
  18 |     // Business A context
  19 |     await loginAs(context, 'businessA@test.com');
  20 | 
  21 |     // Seed Device for Business B
  22 |     const qrB = await seedQr({ 
  23 |       code: 'CS-DEVICE-B', 
  24 |       status: 'active', 
  25 |       wifiEnabled: true 
  26 |     });
  27 |     
  28 |     // Remember, dummy business owner is `dummy-CS-DEVICE-B@test.com`, NOT `businessA@test.com`
  29 |     // Business A tries to call a server action or access the endpoint that requires ownership
  30 |     // E.g. activating an already active device belonging to Business B
  31 |     await page.goto(`/activate/${qrB.code}`);
  32 |     
  33 |     // Since it's already active, it redirects to /q/[code] or shows an error.
  34 |     // In our system, active QRs throw "QR Code ini sudah diaktifkan" or redirect to public page.
  35 |     await expect(page).not.toHaveURL(/\/dashboard/);
  36 |     
  37 |     // Let's test the dashboard API / form action directly
  38 |     // If Business A tries to submit settings for qrB.code
  39 |     // The server will block it due to ownership mismatch. We verify this via UI lack of presence.
  40 |     await page.goto('/dashboard/qr');
  41 |     // Device B should NOT be in the table
  42 |     await expect(page.locator('text="CS-DEVICE-B"')).not.toBeVisible();
  43 |   });
  44 | 
  45 |   test('Session context isolation', async ({ browser }) => {
  46 |     const contextA = await browser.newContext();
  47 |     const contextB = await browser.newContext();
  48 |     
  49 |     await loginAs(contextA, 'userA@test.com');
  50 |     await loginAs(contextB, 'userB@test.com');
  51 | 
  52 |     const pageA = await contextA.newPage();
  53 |     await pageA.goto('/dashboard');
> 54 |     await expect(pageA.locator('text="userA"')).toBeVisible();
     |                                                 ^ Error: expect(locator).toBeVisible() failed
  55 | 
  56 |     const pageB = await contextB.newPage();
  57 |     await pageB.goto('/dashboard');
  58 |     await expect(pageB.locator('text="userB"')).toBeVisible();
  59 | 
  60 |     await contextA.close();
  61 |     await contextB.close();
  62 |   });
  63 | });
  64 | 
```