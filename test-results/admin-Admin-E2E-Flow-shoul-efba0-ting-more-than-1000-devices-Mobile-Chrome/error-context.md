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
    - generic [ref=e3]:
      - banner [ref=e4]:
        - generic [ref=e5]:
          - link [ref=e6] [cursor=pointer]:
            - /url: /
          - heading "Cobascan Admin Portal" [level=1] [ref=e14]
        - generic [ref=e15]:
          - generic [ref=e16]: ADMIN
          - button "Keluar" [ref=e24] [cursor=pointer]
      - main [ref=e28]:
        - generic [ref=e29]:
          - generic [ref=e30]:
            - generic [ref=e31]:
              - generic [ref=e32]:
                - generic [ref=e33]: DATABASE CONNECTED
                - generic [ref=e35]: "Engine: PostgreSQL Supabase (Production)"
              - heading "Cobascan Admin Center" [level=1] [ref=e36]
              - paragraph [ref=e37]: Manufacturing batches, hardware provisioning, device fleet metrics, and partner businesses.
            - generic [ref=e38]:
              - link [ref=e39] [cursor=pointer]:
                - /url: /admin/users
                - button "Export Manifest" [ref=e40]
              - link [ref=e45] [cursor=pointer]:
                - /url: /admin/qr
                - button "Generate New Batch" [ref=e46]
          - generic [ref=e49]:
            - generic [ref=e50]:
              - generic [ref=e51]: TOTAL DEVICES
              - generic [ref=e56]: "1"
              - paragraph [ref=e58]: +1 unit bulan ini
            - generic [ref=e59]:
              - generic [ref=e60]: ACTIVE & DEPLOYED
              - generic [ref=e65]: "0"
              - paragraph [ref=e67]: 0.0% Fleet Ratio
            - generic [ref=e68]:
              - generic [ref=e69]: AVAILABLE STOCK
              - generic [ref=e75]: "1"
              - paragraph [ref=e77]: Packaged & Flashed
            - generic [ref=e78]:
              - generic [ref=e79]: DISABLED/RETIRED
              - generic [ref=e85]: "0"
              - paragraph [ref=e87]: 0.0% attrition
            - generic [ref=e88]:
              - generic [ref=e89]: PARTNER VENUES
              - generic [ref=e94]: "0"
              - paragraph [ref=e96]: Avg 0.0 nodes/venue
            - generic [ref=e97]:
              - generic [ref=e98]: GLOBAL INTERACTIONS
              - generic [ref=e102]: "0"
              - paragraph [ref=e104]: Akumulasi Real-Time
            - generic [ref=e105]:
              - generic [ref=e106]: ACTIVATION RATE
              - generic [ref=e110]: 0.0%
              - paragraph [ref=e112]: High Conversion
          - generic [ref=e113]:
            - generic [ref=e114]:
              - generic [ref=e115]:
                - generic [ref=e116]:
                  - text: PENCETAKAN QR
                  - heading "Batch Provisioning & Generator QR" [level=2] [ref=e117]
                  - paragraph [ref=e118]: Cetak batch kode QR unik secara massal untuk digunakan oleh bisnis mitra.
                - generic [ref=e119]:
                  - generic [ref=e120]: "Cetak Cepat:"
                  - link "6 10 50 100 500" [ref=e121] [cursor=pointer]:
                    - /url: /admin/qr
                    - generic [ref=e122]:
                      - generic [ref=e123]: "6"
                      - generic [ref=e124]: "10"
                      - generic [ref=e125]: "50"
                      - generic [ref=e126]: "100"
                      - generic [ref=e127]: "500"
              - generic [ref=e129]:
                - heading "Buat Batch Baru" [level=4] [ref=e132]
                - paragraph [ref=e133]: Cetak kode QR fisik baru
                - link [ref=e134] [cursor=pointer]:
                  - /url: /admin/qr
                  - button "+ Tambah Batch" [ref=e135]
            - generic [ref=e136]:
              - generic [ref=e139]:
                - text: "Rute publik:"
                - strong [ref=e140]: /q/:code
              - link "Buka Generator Batch" [ref=e141] [cursor=pointer]:
                - /url: /admin/qr
          - generic [ref=e145]:
            - generic [ref=e146]:
              - generic [ref=e148]:
                - heading "Fleet Distribution" [level=3] [ref=e149]
                - paragraph [ref=e150]: Physical hardware lifecycle state
              - generic [ref=e159]:
                - generic [ref=e160]: "1"
                - generic [ref=e161]: NODES
              - generic [ref=e162]:
                - generic [ref=e163]: Active 0.0%
                - generic [ref=e166]: Stock 100.0%
                - generic [ref=e169]: Retired 0.0%
            - generic [ref=e172]:
              - generic [ref=e173]:
                - generic [ref=e175]:
                  - generic [ref=e176]:
                    - heading "Laju Aktivasi Armada" [level=3] [ref=e177]
                    - generic [ref=e178]: +0 Unit (30 Hari)
                  - paragraph [ref=e179]: Stand fisik diaktivasi dalam 30 hari terakhir
                - generic [ref=e182]:
                  - generic [ref=e183]:
                    - generic [ref=e184]: 0.0%
                    - generic [ref=e185]: 0 dari 1 stand aktif
                  - generic [ref=e186]:
                    - 'generic "Aktif: 0.0%"'
                    - 'generic "Tersedia: 100.0%" [ref=e187]'
                  - generic [ref=e188]:
                    - generic [ref=e189]:
                      - generic [ref=e190]: Aktif Terpasang
                      - generic [ref=e191]: 0 Unit
                    - generic [ref=e192]:
                      - generic [ref=e193]: Stok / Blank
                      - generic [ref=e194]: 1 Unit
              - generic [ref=e195]:
                - generic [ref=e196]: "Total Armada Terdaftar:"
                - generic [ref=e197]: 1 Unit
            - generic [ref=e198]:
              - generic [ref=e199]:
                - generic [ref=e201]:
                  - heading "Adopsi Fitur Mitra Bisnis" [level=3] [ref=e202]
                  - paragraph [ref=e203]: Distribusi konfigurasi Wi-Fi vs Google Maps Direct
                - generic [ref=e207]:
                  - generic [ref=e209]:
                    - generic [ref=e210]: Wi-Fi Tamu + Google Maps
                    - generic [ref=e216]:
                      - strong [ref=e217]: 0.0%
                      - generic [ref=e218]: (0 Mitra)
                  - generic [ref=e221]:
                    - generic [ref=e222]: Direct Google Maps Saja
                    - generic [ref=e226]:
                      - strong [ref=e227]: 0.0%
                      - generic [ref=e228]: (0 Mitra)
              - generic [ref=e230]:
                - generic [ref=e231]: "Total Mitra Terdaftar:"
                - generic [ref=e232]: 0 Bisnis Terverifikasi
          - generic [ref=e233]:
            - generic [ref=e235]:
              - text: SECTION 2
              - heading "Device Registry & Fleet Management Table" [level=2] [ref=e236]
              - paragraph [ref=e237]: Live provisioned nodes, assignment logs, cloud routing switches, and cryptographic resets.
            - generic [ref=e238]:
              - generic [ref=e239]:
                - generic [ref=e240]:
                  - heading "Manajemen QR Code" [level=2] [ref=e241]
                  - paragraph [ref=e242]: Kelola paket batch QR, cetak akrilik, aktivasi, dan reset inventori platform.
                - generic [ref=e243]:
                  - button "Download ZIP (1)" [ref=e244] [cursor=pointer]
                  - button "Generate QR Batch" [ref=e248] [cursor=pointer]
              - generic [ref=e250]:
                - generic [ref=e252]:
                  - button "all" [ref=e253] [cursor=pointer]
                  - button "blank" [ref=e254] [cursor=pointer]
                  - button "sold" [ref=e255] [cursor=pointer]
                  - button "active" [ref=e256] [cursor=pointer]
                  - button "disabled" [ref=e257] [cursor=pointer]
                - textbox "Cari kode QR, batch, atau bisnis..." [ref=e262]
              - table [ref=e265]:
                - rowgroup [ref=e266]:
                  - row [ref=e267]:
                    - columnheader [ref=e268]:
                      - button "Pilih semua" [ref=e269] [cursor=pointer]
                    - columnheader "HARDWARE CODE" [ref=e272]
                    - columnheader "BATCH ID" [ref=e273]
                    - columnheader "FLEET STATUS" [ref=e274]
                    - columnheader "ASSIGNED PARTNER" [ref=e275]
                    - columnheader "SCANS" [ref=e276]
                    - columnheader "CREATED DATE" [ref=e277]
                    - columnheader "HARDWARE ACTIONS" [ref=e278]
                - rowgroup [ref=e279]:
                  - row [ref=e280]:
                    - cell [ref=e281]:
                      - button [ref=e282] [cursor=pointer]
                    - cell "CS-TEST-ACTIVATE" [ref=e285]
                    - cell "SINGLE" [ref=e294]
                    - cell "Available" [ref=e296]
                    - cell "Unassigned (In Warehouse Stock)" [ref=e299]
                    - cell "0" [ref=e300]
                    - cell "Sep 23, 2026" [ref=e301]
                    - cell [ref=e302]:
                      - generic [ref=e303]:
                        - button "Preview" [ref=e304] [cursor=pointer]
                        - button "Download" [ref=e305] [cursor=pointer]
                        - button "Packaged" [ref=e306] [cursor=pointer]
              - generic [ref=e309]:
                - generic [ref=e310]:
                  - generic [ref=e311]:
                    - heading "Generate QR Code Baru" [level=3] [ref=e312]
                    - paragraph [ref=e313]: Pilih tipe pembuatan QR Code dengan status BLANK (siap cetak/jual).
                  - button [ref=e314] [cursor=pointer]
                - generic [ref=e319]:
                  - generic [ref=e320]:
                    - generic [ref=e321]: "Tipe Pembuatan QR:"
                    - generic [ref=e322]:
                      - button "📦 Paket (Batch) 1 Paket untuk 1 Kafe. Aktivasi 1 QR otomatis mengaktifkan semua QR dalam paket." [ref=e323] [cursor=pointer]:
                        - generic [ref=e324]: 📦 Paket (Batch)
                        - paragraph [ref=e326]: 1 Paket untuk 1 Kafe. Aktivasi 1 QR otomatis mengaktifkan semua QR dalam paket.
                      - button "🏷️ Satuan (Mandiri) Aktivasi 1 per 1. Setiap QR berdiri sendiri dan diaktivasi masing-masing (eceran)." [active] [ref=e327] [cursor=pointer]:
                        - generic [ref=e328]: 🏷️ Satuan (Mandiri)
                        - paragraph [ref=e331]: Aktivasi 1 per 1. Setiap QR berdiri sendiri dan diaktivasi masing-masing (eceran).
                  - generic [ref=e332]:
                    - generic [ref=e333]:
                      - generic [ref=e334]: "Jumlah QR Code:"
                      - generic [ref=e335]: Bebas (1 - 1.000)
                    - 'spinbutton "Masukkan jumlah (misal: 1, 7, 13, 50)" [ref=e337]': "5"
                    - generic [ref=e338]:
                      - generic [ref=e339]: "Preset Cepat:"
                      - button "1" [ref=e340] [cursor=pointer]
                      - button "2" [ref=e341] [cursor=pointer]
                      - button "3" [ref=e342] [cursor=pointer]
                      - button "7" [ref=e343] [cursor=pointer]
                      - button "10" [ref=e344] [cursor=pointer]
                      - button "13" [ref=e345] [cursor=pointer]
                      - button "25" [ref=e346] [cursor=pointer]
                      - button "50" [ref=e347] [cursor=pointer]
                      - button "100" [ref=e348] [cursor=pointer]
                      - button "500" [ref=e349] [cursor=pointer]
                    - paragraph [ref=e350]: QR yang dibuat berdiri sendiri tanpa grup batch. Setiap unit diaktivasi 1 per 1 secara terpisah.
                  - generic [ref=e351]:
                    - button "Batal" [ref=e352] [cursor=pointer]
                    - button "Generate Sekarang" [ref=e353] [cursor=pointer]
    - generic [ref=e354]:
      - link "Ringkasan" [ref=e355] [cursor=pointer]:
        - /url: /admin
      - link "Cobascan" [ref=e362] [cursor=pointer]:
        - /url: /admin/qr
      - link "Users" [ref=e370] [cursor=pointer]:
        - /url: /admin/users
  - alert [ref=e377]
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