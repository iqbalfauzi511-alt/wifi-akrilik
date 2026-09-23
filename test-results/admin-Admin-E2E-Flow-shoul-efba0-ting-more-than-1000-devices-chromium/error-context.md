# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: admin.spec.js >> Admin E2E Flow >> should prevent generating more than 1000 devices
- Location: tests/admin.spec.js:39:7

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: page.fill: Test timeout of 30000ms exceeded.
Call log:
  - waiting for locator('input[name="quantity"]')

```

# Page snapshot

```yaml
- generic [ref=e1]:
  - generic [ref=e2]:
    - complementary [ref=e3]:
      - generic [ref=e4]:
        - link "Cobascan Cobascan ADMIN CONSOLE" [ref=e6] [cursor=pointer]:
          - /url: /
          - img "Cobascan" [ref=e8]
          - generic [ref=e9]:
            - generic [ref=e10]: Cobascan
            - generic [ref=e11]: ADMIN CONSOLE
        - navigation [ref=e12]:
          - link "Dashboard" [ref=e13] [cursor=pointer]:
            - /url: /admin
          - link "My Cobascan" [ref=e19] [cursor=pointer]:
            - /url: /admin/qr
          - link "Pengguna & Bisnis" [ref=e26] [cursor=pointer]:
            - /url: /admin/users
      - link "Kembali ke Beranda" [ref=e33] [cursor=pointer]:
        - /url: /
    - generic [ref=e39]:
      - banner [ref=e40]:
        - heading "Cobascan Admin Portal" [level=1] [ref=e43]
        - generic [ref=e44]:
          - generic [ref=e45]:
            - generic [ref=e50]:
              - generic [ref=e51]: admin@smartwifi.com
              - generic [ref=e52]: admin@smartwifi.com
            - generic [ref=e53]: ADMIN
          - button "Keluar" [ref=e56] [cursor=pointer]
      - main [ref=e60]:
        - generic [ref=e61]:
          - generic [ref=e62]:
            - generic [ref=e63]:
              - generic [ref=e64]:
                - generic [ref=e65]: DATABASE CONNECTED
                - generic [ref=e67]: "Engine: PostgreSQL Supabase (Production)"
              - heading "Cobascan Admin Center" [level=1] [ref=e68]
              - paragraph [ref=e69]: Manufacturing batches, hardware provisioning, device fleet metrics, and partner businesses.
            - generic [ref=e70]:
              - generic [ref=e71]: FLEET SYNC ACTIVE
              - link [ref=e74] [cursor=pointer]:
                - /url: /admin/users
                - button "Export Manifest" [ref=e75]
              - link [ref=e80] [cursor=pointer]:
                - /url: /admin/qr
                - button "Generate New Batch" [ref=e81]
          - generic [ref=e84]:
            - generic [ref=e85]:
              - generic [ref=e86]: TOTAL DEVICES
              - generic [ref=e91]: "1"
              - paragraph [ref=e93]: +1 unit bulan ini
            - generic [ref=e94]:
              - generic [ref=e95]: ACTIVE & DEPLOYED
              - generic [ref=e100]: "0"
              - paragraph [ref=e102]: 0.0% Fleet Ratio
            - generic [ref=e103]:
              - generic [ref=e104]: AVAILABLE STOCK
              - generic [ref=e110]: "1"
              - paragraph [ref=e112]: Packaged & Flashed
            - generic [ref=e113]:
              - generic [ref=e114]: DISABLED/RETIRED
              - generic [ref=e119]: "0"
              - paragraph [ref=e121]: 0.0% attrition
            - generic [ref=e122]:
              - generic [ref=e123]: PARTNER VENUES
              - generic [ref=e128]: "0"
              - paragraph [ref=e130]: Avg 0.0 nodes/venue
            - generic [ref=e131]:
              - generic [ref=e132]: GLOBAL INTERACTIONS
              - generic [ref=e136]: "0"
              - paragraph [ref=e138]: Akumulasi Real-Time
            - generic [ref=e139]:
              - generic [ref=e140]: ACTIVATION RATE
              - generic [ref=e144]: 0.0%
              - paragraph [ref=e146]: High Conversion
          - generic [ref=e147]:
            - generic [ref=e148]:
              - generic [ref=e149]:
                - generic [ref=e150]:
                  - text: PENCETAKAN QR
                  - heading "Batch Provisioning & Generator QR" [level=2] [ref=e151]
                  - paragraph [ref=e152]: Cetak batch kode QR unik secara massal untuk digunakan oleh bisnis mitra.
                - generic [ref=e153]:
                  - generic [ref=e154]: "Cetak Cepat:"
                  - link "6 10 50 100 500" [ref=e155] [cursor=pointer]:
                    - /url: /admin/qr
                    - generic [ref=e156]:
                      - generic [ref=e157]: "6"
                      - generic [ref=e158]: "10"
                      - generic [ref=e159]: "50"
                      - generic [ref=e160]: "100"
                      - generic [ref=e161]: "500"
              - generic [ref=e163]:
                - heading "Buat Batch Baru" [level=4] [ref=e166]
                - paragraph [ref=e167]: Cetak kode QR fisik baru
                - link [ref=e168] [cursor=pointer]:
                  - /url: /admin/qr
                  - button "+ Tambah Batch" [ref=e169]
            - generic [ref=e170]:
              - generic [ref=e173]:
                - text: "Rute publik:"
                - strong [ref=e174]: /q/:code
              - link "Buka Generator Batch" [ref=e175] [cursor=pointer]:
                - /url: /admin/qr
          - generic [ref=e179]:
            - generic [ref=e180]:
              - generic [ref=e182]:
                - heading "Fleet Distribution" [level=3] [ref=e183]
                - paragraph [ref=e184]: Physical hardware lifecycle state
              - generic [ref=e193]:
                - generic [ref=e194]: "1"
                - generic [ref=e195]: NODES
              - generic [ref=e196]:
                - generic [ref=e197]: Active 0.0%
                - generic [ref=e200]: Stock 100.0%
                - generic [ref=e203]: Retired 0.0%
            - generic [ref=e206]:
              - generic [ref=e207]:
                - generic [ref=e209]:
                  - generic [ref=e210]:
                    - heading "Laju Aktivasi Armada" [level=3] [ref=e211]
                    - generic [ref=e212]: +0 Unit (30 Hari)
                  - paragraph [ref=e213]: Stand fisik diaktivasi dalam 30 hari terakhir
                - generic [ref=e216]:
                  - generic [ref=e217]:
                    - generic [ref=e218]: 0.0%
                    - generic [ref=e219]: 0 dari 1 stand aktif
                  - generic [ref=e220]:
                    - 'generic "Aktif: 0.0%"'
                    - 'generic "Tersedia: 100.0%" [ref=e221]'
                  - generic [ref=e222]:
                    - generic [ref=e223]:
                      - generic [ref=e224]: Aktif Terpasang
                      - generic [ref=e225]: 0 Unit
                    - generic [ref=e226]:
                      - generic [ref=e227]: Stok / Blank
                      - generic [ref=e228]: 1 Unit
              - generic [ref=e229]:
                - generic [ref=e230]: "Total Armada Terdaftar:"
                - generic [ref=e231]: 1 Unit
            - generic [ref=e232]:
              - generic [ref=e233]:
                - generic [ref=e235]:
                  - heading "Adopsi Fitur Mitra Bisnis" [level=3] [ref=e236]
                  - paragraph [ref=e237]: Distribusi konfigurasi Wi-Fi vs Google Maps Direct
                - generic [ref=e241]:
                  - generic [ref=e243]:
                    - generic [ref=e244]: Wi-Fi Tamu + Google Maps
                    - generic [ref=e250]:
                      - strong [ref=e251]: 0.0%
                      - generic [ref=e252]: (0 Mitra)
                  - generic [ref=e255]:
                    - generic [ref=e256]: Direct Google Maps Saja
                    - generic [ref=e260]:
                      - strong [ref=e261]: 0.0%
                      - generic [ref=e262]: (0 Mitra)
              - generic [ref=e264]:
                - generic [ref=e265]: "Total Mitra Terdaftar:"
                - generic [ref=e266]: 0 Bisnis Terverifikasi
          - generic [ref=e267]:
            - generic [ref=e269]:
              - text: SECTION 2
              - heading "Device Registry & Fleet Management Table" [level=2] [ref=e270]
              - paragraph [ref=e271]: Live provisioned nodes, assignment logs, cloud routing switches, and cryptographic resets.
            - generic [ref=e272]:
              - generic [ref=e273]:
                - generic [ref=e274]:
                  - heading "Manajemen QR Code" [level=2] [ref=e275]
                  - paragraph [ref=e276]: Kelola paket batch QR, cetak akrilik, aktivasi, dan reset inventori platform.
                - generic [ref=e277]:
                  - button "Download ZIP (1)" [ref=e278] [cursor=pointer]
                  - button "Generate QR Batch" [ref=e282] [cursor=pointer]
              - generic [ref=e284]:
                - generic [ref=e286]:
                  - button "all" [ref=e287] [cursor=pointer]
                  - button "blank" [ref=e288] [cursor=pointer]
                  - button "sold" [ref=e289] [cursor=pointer]
                  - button "active" [ref=e290] [cursor=pointer]
                  - button "disabled" [ref=e291] [cursor=pointer]
                - textbox "Cari kode QR, batch, atau bisnis..." [ref=e296]
              - table [ref=e299]:
                - rowgroup [ref=e300]:
                  - row [ref=e301]:
                    - columnheader [ref=e302]:
                      - button "Pilih semua" [ref=e303] [cursor=pointer]
                    - columnheader "HARDWARE CODE" [ref=e306]
                    - columnheader "BATCH ID" [ref=e307]
                    - columnheader "FLEET STATUS" [ref=e308]
                    - columnheader "ASSIGNED PARTNER" [ref=e309]
                    - columnheader "SCANS" [ref=e310]
                    - columnheader "CREATED DATE" [ref=e311]
                    - columnheader "HARDWARE ACTIONS" [ref=e312]
                - rowgroup [ref=e313]:
                  - row [ref=e314]:
                    - cell [ref=e315]:
                      - button [ref=e316] [cursor=pointer]
                    - cell "CS-TEST-ACTIVATE" [ref=e319]
                    - cell "SINGLE" [ref=e328]
                    - cell "Available" [ref=e330]
                    - cell "Unassigned (In Warehouse Stock)" [ref=e333]
                    - cell "0" [ref=e334]
                    - cell "Sep 23, 2026" [ref=e335]
                    - cell [ref=e336]:
                      - generic [ref=e337]:
                        - button "Preview" [ref=e338] [cursor=pointer]
                        - button "Download" [ref=e339] [cursor=pointer]
                        - button "Packaged" [ref=e340] [cursor=pointer]
              - generic [ref=e343]:
                - generic [ref=e344]:
                  - generic [ref=e345]:
                    - heading "Generate QR Code Baru" [level=3] [ref=e346]
                    - paragraph [ref=e347]: Pilih tipe pembuatan QR Code dengan status BLANK (siap cetak/jual).
                  - button [ref=e348] [cursor=pointer]
                - generic [ref=e353]:
                  - generic [ref=e354]:
                    - generic [ref=e355]: "Tipe Pembuatan QR:"
                    - generic [ref=e356]:
                      - button "📦 Paket (Batch) 1 Paket untuk 1 Kafe. Aktivasi 1 QR otomatis mengaktifkan semua QR dalam paket." [ref=e357] [cursor=pointer]:
                        - generic [ref=e358]: 📦 Paket (Batch)
                        - paragraph [ref=e360]: 1 Paket untuk 1 Kafe. Aktivasi 1 QR otomatis mengaktifkan semua QR dalam paket.
                      - button "🏷️ Satuan (Mandiri) Aktivasi 1 per 1. Setiap QR berdiri sendiri dan diaktivasi masing-masing (eceran)." [active] [ref=e361] [cursor=pointer]:
                        - generic [ref=e362]: 🏷️ Satuan (Mandiri)
                        - paragraph [ref=e365]: Aktivasi 1 per 1. Setiap QR berdiri sendiri dan diaktivasi masing-masing (eceran).
                  - generic [ref=e366]:
                    - generic [ref=e367]:
                      - generic [ref=e368]: "Jumlah QR Code:"
                      - generic [ref=e369]: Bebas (1 - 1.000)
                    - 'spinbutton "Masukkan jumlah (misal: 1, 7, 13, 50)" [ref=e371]': "5"
                    - generic [ref=e372]:
                      - generic [ref=e373]: "Preset Cepat:"
                      - button "1" [ref=e374] [cursor=pointer]
                      - button "2" [ref=e375] [cursor=pointer]
                      - button "3" [ref=e376] [cursor=pointer]
                      - button "7" [ref=e377] [cursor=pointer]
                      - button "10" [ref=e378] [cursor=pointer]
                      - button "13" [ref=e379] [cursor=pointer]
                      - button "25" [ref=e380] [cursor=pointer]
                      - button "50" [ref=e381] [cursor=pointer]
                      - button "100" [ref=e382] [cursor=pointer]
                      - button "500" [ref=e383] [cursor=pointer]
                    - paragraph [ref=e384]: QR yang dibuat berdiri sendiri tanpa grup batch. Setiap unit diaktivasi 1 per 1 secara terpisah.
                  - generic [ref=e385]:
                    - button "Batal" [ref=e386] [cursor=pointer]
                    - button "Generate Sekarang" [ref=e387] [cursor=pointer]
  - alert [ref=e388]
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | import { loginAs } from './utils';
  3  | 
  4  | test.describe('Admin E2E Flow', () => {
  5  |   test.beforeEach(async ({ context }) => {
  6  |     // Inject admin cookie
  7  |     await loginAs(context, 'admin@smartwifi.com', 'admin');
  8  |   });
  9  | 
  10 |   test('should generate single device successfully and verify status BLANK', async ({ page }) => {
  11 |     // Navigate to admin
  12 |     await page.goto('/admin');
  13 |     await expect(page).toHaveURL(/\/admin/);
  14 |     
  15 |     // Open generator modal
  16 |     await page.click('button:has-text("Generate QR")');
  17 |     await expect(page.locator('text="Generate QR Code Baru"').first()).toBeVisible();
  18 |     
  19 |     // Change mode to individual
  20 |     await page.click('button:has-text("Satuan")');
  21 |     
  22 |     // Set quantity to 1
  23 |     await page.fill('input[name="quantity"]', '1');
  24 |     
  25 |     // Submit
  26 |     const [response] = await Promise.all([
  27 |       page.waitForResponse(resp => resp.url().includes('/admin') && resp.status() === 200),
  28 |       page.click('button[type="submit"]:has-text("Generate")')
  29 |     ]);
  30 | 
  31 |     // Verify UI success
  32 |     await expect(page.locator('text="Berhasil membuat"')).toBeVisible();
  33 | 
  34 |     // Verify DB integrity via our test API endpoint
  35 |     // First grab the newly generated code from the UI if possible, or we can just verify total count
  36 |     // Wait for the modal to close or toast to appear
  37 |   });
  38 | 
  39 |   test('should prevent generating more than 1000 devices', async ({ page }) => {
  40 |     await page.goto('/admin');
  41 |     await page.click('button:has-text("Generate QR")');
  42 |     await page.click('button:has-text("Satuan")');
  43 |     
  44 |     // Set quantity to 1500
> 45 |     await page.fill('input[name="quantity"]', '1500');
     |                ^ Error: page.fill: Test timeout of 30000ms exceeded.
  46 |     await page.click('button[type="submit"]:has-text("Generate")');
  47 |     
  48 |     // Error should show
  49 |     await expect(page.locator('text="Maksimum QR yang dapat di-generate sekaligus adalah 1.000 unit"')).toBeVisible();
  50 |   });
  51 | });
  52 | 
```