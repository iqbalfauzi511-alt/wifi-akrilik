# 01 — Laporan Audit Teknis dan Kesesuaian Sistem Cobascan

**Tanggal Audit:** Oktober 2026  
**Auditor:** AI Software Project Analyst & Academic Technical Writer  
**Objek Audit:** Repositori source code, konfigurasi, basis data, dan dokumentasi Cobascan  
**URL Produksi:** [https://cobascan.my.id](https://cobascan.my.id)  

---

## 1. Ringkasan Eksekutif Audit

Audit ini dilakukan terhadap seluruh komponen repositori Cobascan untuk memverifikasi keselarasan antara dokumentasi perancangan (*Market Requirements Document* dan *Product Requirements Document*) dengan implementasi kode sumber (*source code*) nyata. Hasil audit menunjukkan bahwa platform Cobascan berada pada tahap **fungsional penuh (*production ready*)** untuk modul utama:
1. Autentikasi Pemilik Usaha berbasis Nomor WhatsApp + PIN 6-digit.
2. Pengalaman pindaian pengunjung (*Visitor Scan Experience*) dengan mekanisme penyaring ulasan (*Rating Gatekeeper*).
3. Pertukaran akses Wi-Fi (*Review-to-reveal Wi-Fi*).
4. Dashboard Pemilik Bisnis berbasis Bento Grid responsif (dioptimalkan untuk mobile dan layar laptop/desktop).
5. Panel Administrator untuk pembuatan batch stand akrilik dan manajemen basis data.

---

## 2. Verifikasi Teknologi Aktual (Tech Stack Verification)

Berdasarkan pemeriksaan langsung terhadap `package.json`, konfigurasi Next.js, dan koneksi runtime database, berikut adalah tabel verifikasi tumpukan teknologi:

| Lapisan Sistem | Teknologi yang Tercatat di Dokumen | Status Verifikasi Kode | Bukti Implementasi / Catatan File |
| :--- | :--- | :---: | :--- |
| **Framework Utama** | Next.js 14 (App Router) | **Terverifikasi** | `package.json`: `"next": "^14.2.35"`, arsitektur folder `app/` |
| **Library Antarmuka** | React 18 | **Terverifikasi** | `package.json`: `"react": "^18.3.1"`, `"react-dom": "^18.3.1"` |
| **Styling & CSS** | Tailwind CSS v3 | **Terverifikasi** | `tailwind.config.js`, `postcss.config.mjs`, `@tailwindcss` plugins |
| **Ikonografi** | Lucide React | **Terverifikasi** | `package.json`: `"lucide-react": "^0.475.0"` |
| **Basis Data Utama** | Supabase (PostgreSQL) | **Terverifikasi** | `lib/db/index.js` menggunakan koneksi pooling Postgres-JS ke Supabase Cloud |
| **ORM / Query Builder** | Drizzle ORM | **Terverifikasi** | `drizzle-orm": "^0.39.3"`, skema di `lib/db/schema.js`, queries di `lib/db/queries/` |
| **Driver Basis Data** | Postgres-js & PGlite | **Terverifikasi** | `postgres: "^3.4.5"`, fallback lokal `@electric-sql/pglite: "^0.5.8"` di `lib/db/index.js` |
| **Generator QR Code** | node-qrcode | **Terverifikasi** | `package.json`: `"qrcode": "^1.5.4"`, utilitas di `lib/utils/qr.js` |
| **Hosting & Deployment**| Vercel Cloud | **Terverifikasi** | Konfigurasi CI/CD terhubung ke branch `main` GitHub |
| **Pengujian E2E** | Playwright | **Terverifikasi** | `playwright.config.js`, test suite di folder `tests/` |

---

## 3. Audit Modul dan Fungsionalitas Nyata

### 3.1. Modul Autentikasi dan Manajemen Sesi
- **Implementasi Nyata**:
  - File: `lib/actions/owner-auth-actions.js`, `lib/auth/session.js`, `middleware.js`.
  - **Pemilik Usaha (Owner)**: Menggunakan Nomor WhatsApp dan PIN 6 digit angka. PIN disimpan dalam bentuk hash terenkripsi. Sesi disimpan dalam cookie HTTP-only yang divalidasi oleh `middleware.js`.
  - **Administrator**: Menggunakan Email dan Password khusus admin yang diverifikasi melalui database/Supabase Auth.
  - **Fitur Keamanan**: Terdapat pembatasan percobaan gagal (*rate-limiting*) dan penguncian akun sementara (`failed_login_attempts`, `locked_until`) di tabel `users`.
- **Status**: **Implemented & Fully Functional**.

### 3.2. Modul Aktivasi Stand Meja (`/activate/[code]`)
- **Implementasi Nyata**:
  - File: `app/activate/[code]/page.jsx`, `components/customer/ActivationForm.jsx`.
  - Alur: Pengguna memindai stand fisik yang berstatus `blank` atau `sold`. Form meminta input nama usaha, nomor WhatsApp pemilik, pembuatan PIN 6 angka, link Google Maps, serta konfigurasi opsional nama & kata sandi Wi-Fi.
  - Setelah form disubmit, sistem secara transaksional membuat akun user baru, data profil bisnis, dan mengubah status QR menjadi `active`.
- **Status**: **Implemented**.

### 3.3. Modul Pengunjung / Visitor Scan (`/q/[code]`)
- **Implementasi Nyata**:
  - File: `app/q/[code]/page.jsx`, `components/visitor/VisitorScanExperience.jsx`, `lib/actions/feedback-actions.js`.
  - **Rating Gatekeeper**:
    - **Bintang 4–5**: Memicu pengalihan langsung (*client-side redirect*) ke link Google Maps Review (`https://search.google.com/local/writereview?...`). Ketika pengunjung kembali ke tab peramban, timer placebo 5 detik berjalan lalu membuka kunci sandi Wi-Fi.
    - **Bintang 1–2**: Membuka form masukan internal privat. Pesan disimpan langsung ke tabel `customer_feedback`.
  - **Proteksi Privasi**: Nomor WhatsApp pemilik bisnis **tidak pernah dimuat** pada bundle kode klien pengunjung ataupun respons API publik.
- **Status**: **Implemented**.

### 3.4. Modul Dashboard Pemilik Usaha (`/dashboard`)
- **Implementasi Nyata**:
  - File: `app/dashboard/page.jsx`, `components/customer/OwnerSettingsPage.jsx`, `components/customer/DeviceList.jsx`, `components/charts/ScanActivityChart.jsx`.
  - **Komponen Dashboard**:
    - **3 Bento Cards Ringkasan**: Jumlah perangkat aktif, total pindaian riil, dan konversi ulasan beserta notifikasi badge keluhan baru.
    - **Grafik Spline Aktivitas Pindaian**: Menampilkan tren pindaian harian dengan filter periode (7 hari, 30 hari, bulan ini, bulan lalu).
    - **Manajemen Multi-Perangkat**: Daftar perangkat akrilik yang dimiliki toko dengan opsi edit nama meja, link Maps terpisah, dan status Wi-Fi.
    - **Modal Tambah QR Baru**: Memungkinkan pemilik menautkan stand akrilik baru ke akun yang sudah ada hanya dengan memasukkan kode unik stand.
    - **Inbox Ulasan & Keluhan Tamu**: Menampilkan riwayat masukan bintang 1–2 lengkap dengan nama tamu, tanggal, rating, pesan kritik, serta tombol cepat tindak lanjut WhatsApp ke tamu.
    - **Form Keamanan**: Penggantian PIN 6-digit dan perubahan nomor WhatsApp terdaftar.
- **Status**: **Implemented & Optimized for Mobile and Desktop**.

### 3.5. Modul Admin Platform (`/admin`)
- **Implementasi Nyata**:
  - File: `app/admin/qr/page.jsx`, `components/admin/AdminQrManager.jsx`, `app/admin/businesses/page.jsx`, `app/admin/users/page.jsx`.
  - Menghasilkan batch kode unik Cobascan (misal: batch isi 50 unit berawalan `CS-XXXXXX`).
  - Ekspor bundle kode QR dalam format grafis untuk kebutuhan percetakan stiker akrilik.
  - Pemantauan metrik seluruh sistem dan pengelolaan status perangkat.
- **Status**: **Implemented**.

---

## 4. Evaluasi Kesesuaian MRD/PRD vs Kode Aktual

| Kebutuhan Produk (MRD / PRD) | Implementasi Aktual pada Repositori | Status Evaluasi | Bukti Kode / Keterangan |
| :--- | :--- | :---: | :--- |
| **Login Owner Tanpa Email (WA + PIN)** | Formulir login di `/login` menerima input Nomor WhatsApp dan PIN 6 angka. | **Implemented** | `app/login/page.jsx`, `lib/actions/owner-auth-actions.js` |
| **Smart Rating Filter (1-2 vs 4-5)** | Logika percabangan bintang 1-2 ke form privat, bintang 4-5 ke Google Maps. | **Implemented** | `components/visitor/VisitorScanExperience.jsx` |
| **Revealed Wi-Fi Password via Review** | Sandi Wi-Fi tersembunyi hingga pengunjung menyelesaikan alur ulasan. | **Implemented** | `components/visitor/VisitorScanExperience.jsx`, `app/api/q/[code]/reveal-wifi/route.js` |
| **Auto-Generate Google Review Link** | Konverter tautan Google Maps biasa menjadi link ulasan instan (`writereview`). | **Implemented** | `lib/actions/maps-actions.js`, `lib/utils/maps.js` |
| **Multi-Stand per Akun Usaha** | Satu akun bisnis dapat memiliki banyak perangkat di tabel `qr_codes`. | **Implemented** | Skema relasi `businesses` ke banyak `qr_codes`, UI di `DeviceList.jsx` |
| **Privasi Nomor WA Pemilik** | Atribut nomor WA owner dihapus dari semua payload API publik pengunjung. | **Implemented** | `app/q/[code]/page.jsx`, `lib/actions/feedback-actions.js` |
| **Tampilan Responsif Mobile & Desktop** | Lebar container disesuaikan (`max-w-5xl` di laptop) dan grid adaptif. | **Implemented** | `components/customer/OwnerSettingsPage.jsx` |
| **Payment Gateway Midtrans / Otomatisasi Pembelian** | Pembelian unit fisik saat ini dilakukan secara manual/eksternal (marketplace). Belum ada integrasi payment gateway otomatis di web. | **Planned** | [DATA DIPERLUKAN] Transaksi kasir/checkout belum diintegrasikan di aplikasi web. |
| **Broadcast Promo WhatsApp ke Tamu** | Tercantum sebagai rencana masa depan di MRD. | **Planned** | Belum ada implementasi gateway pesan massal otomatis di kode saat ini. |
| **Grafir / Personalisasi Logo Akrilik** | Proses operasional manufaktur fisik di luar kode perangkat lunak. | **Operational** | Bergantung pada rantai pasok vendor akrilik fisik. |

---

## 5. Audit Struktur Basis Data (Database Schema)

Skema basis data dikelola menggunakan Drizzle ORM pada file `lib/db/schema.js`:
1. **`users`**: Menyimpan data identitas admin (email & password hash) serta pemilik usaha (nomor WhatsApp unik, pin hash, limit failed login, timestamp).
2. **`businesses`**: Profil entitas usaha (nama bisnis, logo, tautan Google Review utama, status Wi-Fi default, sandi Wi-Fi default).
3. **`qr_batches`**: Pengelompokan produksi batch stand akrilik fisik yang digenerate oleh admin.
4. **`qr_codes`**: Unit stand akrilik individual. Menyimpan kode alfanumerik unik (`CS-XXXXXX`), status perangkat (`blank`, `sold`, `active`, `disabled`), relasi ke `business_id`, serta konfigurasi override nama meja dan Wi-Fi per meja.
5. **`scan_logs`**: Rekam jejak setiap kali stand di-scan atau di-tap oleh pengunjung (mencatat `qr_id`, waktu pindaian, user agent peramban, dan tipe aksi).
6. **`customer_feedback`**: Rekam kritik dan masukan dari tamu bintang 1–2 (mencatat `business_id`, `qr_id`, nilai rating, pesan ulasan, nama tamu, nomor telepon tamu opsional).

---

## 6. Identifikasi File Bekas / Dead Code & Rekomendasi Pembersihan

Hasil audit menemukan sejumlah file sisa pengembangan masa lalu yang telah diklasifikasikan:

1. **Folder Kosong `/src/`**:
   - Berisi subdirektori kosong `components`, `hooks`, `lib`, `pages`.
   - **Tindakan**: Telah dihapus permanen (`rm -rf src`) karena proyek menggunakan struktur root Next.js 14 (`app/`, `components/`, `lib/`).
2. **Script Uji Coba Sementara di Root**:
   - `parse-maps.mjs`, `test-cid.mjs`, `test-convert.mjs`, `test-count.mjs`, `test-fetch-maps.mjs`, `test-fetch-maps2.mjs`.
   - **Tindakan**: Telah diarsipkan ke `scripts/scratch/` agar root repositori bersih dan tertib.
3. **Komponen Yatim (*Orphaned Components*)**:
   - `components/ui/StatCard.jsx`: Memiliki 0 import di seluruh proyek.
   - `components/customer/CustomerQrTable.jsx` & `components/customer/SettingsForm.jsx`: Komponen lama yang hanya diimpor oleh sub-page legacy `/dashboard/devices` dan `/dashboard/settings`. Dashboard utama saat ini telah menggunakan komponen terpadu `OwnerSettingsPage.jsx` dan `DeviceList.jsx`.
4. **Rute Legacy yang Terisolasi**:
   - Sub-rute seperti `/dashboard/wifi`, `/dashboard/devices`, `/dashboard/reviews`, `/dashboard/stats`, `/dashboard/settings`, dan `/business/settings` merupakan sisa rancangan multi-halaman sebelum disatukan menjadi Bento Dashboard tunggal. Seluruh fungsionalitasnya kini telah terintegrasi di `/dashboard`.
