# Product Requirements Document (PRD)
# Cobascan — Smart Wi-Fi & Google Review Acrylic Stand

**Versi:** 2.1  
**Tanggal:** Oktober 2026  
**Status:** Implemented & Production Ready  
**Situs Resmi:** [cobascan.my.id](https://cobascan.my.id)  

---

## 1. Executive Summary

**Cobascan** adalah platform *phygital* (fisik + digital) yang dirancang khusus untuk pelaku usaha fisik (F&B, Kafe, Restoran, Barbershop, Salon, dsb.) guna:
1. **Meningkatkan Ulasan Positif Google Maps secara Eksponensial**: Pengunjung didorong memberikan ulasan bintang 4–5 dengan imbalan akses langsung Wi-Fi tanpa perlu tanya kasir/waiter.
2. **Memfilter & Menyelamatkan Reputasi Toko (Rating Filtering)**: Ulasan kritis (bintang 1–2) tidak diteruskan ke Google Maps publik, melainkan dialihkan secara privat ke Dashboard Pemilik Bisnis.
3. **Melindungi Privasi Nomor WhatsApp Pemilik**: Nomor WhatsApp pemilik hanya digunakan sebagai kredensial login (WhatsApp + PIN 6-digit) dan tidak pernah dibocorkan kepada tamu/pengunjung.
4. **Memberikan Pengalaman Multi-Perangkat Tanpa Hambatan**: Satu pemilik dapat mengelola banyak stand akrilik di berbagai meja atau cabang dalam satu akun dashboard.

---

## 2. User Persona & Roles

### 2.1. Pemilik Bisnis (Store Owner)
- **Karakteristik**: Sibuk, mengutamakan kepraktisan, tidak ingin ribet dengan registrasi email/password atau verifikasi OTP SMS yang sering gagal.
- **Kebutuhan**:
  - Ingin ulasan Google Maps bertambah cepat tanpa harus mengemis ke pelanggan.
  - Ingin mengetahui keluhan pelanggan sebelum menjadi ulasan negatif di Google Maps.
  - Ingin login cepat hanya dengan nomor WhatsApp dan PIN 6 angka.
  - Ingin menambah stand akrilik baru tanpa membuat akun baru.

### 2.2. Pengunjung Toko (Guest / Visitor)
- **Karakteristik**: Menggunakan smartphone (iOS/Android), butuh internet cepat (Wi-Fi), malas mengetik URL panjang atau password rumit.
- **Kebutuhan**:
  - Scan QR atau Tap NFC di meja -> langsung terbuka formulir penilaian.
  - Kemudahan menyalin password Wi-Fi atau auto-redirect ke Google Maps.

### 2.3. Super Administrator (Cobascan Ops)
- **Kebutuhan**:
  - Men-generate paket kode QR/NFC secara batch sebelum dicetak pada stand akrilik fisik.
  - Mengekspor kode dan QR dalam format cetak (PNG/SVG/ZIP).
  - Memantau status perangkat (`blank`, `sold`, `active`, `disabled`), pengguna, dan analitik scan platform.

---

## 3. Product Architecture & User Journey

### 3.1. Alur Siklus Hidup Stand Akrilik (Hardware Lifecycle)
```
[Admin Generate Batch] ──> [Status: Blank]
                                │
                                ▼
                       [Cetak Stiker/Akrilik]
                                │
                                ▼
                       [Dijual ke Pemilik Usaha] ──> [Status: Sold]
                                │
                                ▼
                       [Scan Pertama oleh Owner]
                                │
                   ┌────────────┴────────────┐
                   ▼                         ▼
         [Owner Baru: Daftar]      [Owner Lama: Tautkan]
         • Nomor WA & PIN          • Login ke akun existing
         • Nama Bisnis & Maps      • Otomatis tambah device
                   │                         │
                   └────────────┬────────────┘
                                │
                                ▼
                    [Status: Active di Meja]
```

### 3.2. Alur Pengalaman Tamu (Visitor Experience)
```
[Pengunjung Scan QR / Tap NFC di Meja]
                 │
                 ▼
        Halaman: /q/[code]
                 │
                 ▼
       [Beri Rating Bintang 1–5]
                 │
    ┌────────────┴────────────┐
    ▼                         ▼
[Bintang 1–2: Kritis]      [Bintang 3–5: Positif]
    │                         │
    ▼                         ▼
[Form Masukan Privat]      [Buka Google Maps Review]
• Pesan keluhan            • Auto-open link ulasan toko
• Nama & No WA Tamu (opsional)  • Return detector (5s placebo)
    │                         │
    ▼                         ▼
[Tersimpan di DB]          [Password Wi-Fi Terbuka]
• Masuk Inbox Owner        • Tombol Salin Password
• Nomor Owner 100% aman    • Tombol Koneksikan Wi-Fi
```

### 3.3. Alur Dashboard Pemilik Bisnis (Owner Dashboard)
```
[Buka /login] ──> [Input WhatsApp & PIN 6 Digit]
                         │
                         ▼
        [Unified Bento Dashboard: /dashboard]
  ├── Metric Cards (Total Perangkat, Scan Riil, Review)
  ├── Scan Activity Chart (Grafik tren harian 7h/30h)
  ├── Profil & Identitas Pemilik
  ├── Daftar Perangkat Akrilik (Atur Wi-Fi, Nama, Maps)
  ├── Modal Tambah QR Baru (Tautkan kode stiker baru)
  ├── Inbox Ulasan & Keluhan Tamu (Rating 1–2 + follow up WA)
  └── Pengaturan Keamanan (Ganti PIN, Ganti Nomor WA)
```

---

## 4. Detailed Feature Specifications

### 4.1. Autentikasi Pemilik Bisnis (Owner WhatsApp + PIN)
- **Metode**: WhatsApp Number + 6-digit numeric PIN.
- **Karakteristik**:
  - Zero OTP friction (tidak memerlukan pulsa SMS atau gateway WhatsApp berbayar).
  - PIN disimpan dalam format hash aman (`bcrypt`).
  - Brute-force protection: rate limiting & akun terkunci sementara jika salah PIN berturut-turut.
- **Dukungan Ganti Kredensial**:
  - Pemilik dapat mengganti PIN dengan memverifikasi PIN lama.
  - Pemilik dapat mengganti nomor WhatsApp dengan otorisasi PIN saat ini.

### 4.2. Smart Rating Gatekeeper (Penyaring Reputasi)
- **Rating 4–5 (Promoter)**:
  - Tombol aksi utama langsung membuka URL Google Maps Review (`https://search.google.com/local/writereview?placeid=...` atau CID link).
  - Setelah pengunjung kembali ke halaman web, sistem menjalankan verifikasi cerdas (placebo verification timer) lalu membuka gembok akses password Wi-Fi.
- **Rating 1–2 (Detractor)**:
  - Pengunjung diarahkan ke formulir masukan internal tanpa diarahkan ke Google Maps.
  - Masukan tersimpan ke tabel `customer_feedback` secara privat.
  - **Privasi Terjamin**: Nomor WhatsApp pemilik TIDAK PERNAH dikirimkan ke client/browser pengunjung.

### 4.3. Fitur Wi-Fi Meja Pintar (Smart Wi-Fi)
- Konfigurasi Wi-Fi bersifat opsional dan fleksibel:
  - Dapat diaktifkan/dinonaktifkan per perangkat (misal: lantai 1 pakai SSID A, lantai 2 pakai SSID B).
  - Sandi Wi-Fi dapat disalin dengan satu ketukan (*one-tap copy*).
  - Dukungan format URI Wi-Fi (`WIFI:S:ssid;T:WPA;P:password;;`) untuk koneksi otomatis di perangkat yang mendukung.

### 4.4. Generator Link Google Review Otomatis (Link Converter)
- Menyelesaikan masalah klasik pemilik toko yang kesulitan mendapatkan URL Review langsung dari Google Maps.
- Pemilik cukup memasukkan URL toko dari Google Maps (`maps.app.goo.gl` atau URL browser panjang).
- Sistem di server mengekstrak Place ID / CID secara otomatis dan mengonversinya menjadi URL langsung form ulasan Google (`writereview`).

### 4.5. Multi-Device Management (Satu Akun, Banyak Meja/Cabang)
- Tombol `+ Tambah QR` di dashboard pemilik memungkinkan pemilik membeli stiker/akrilik baru dan memasukkannya ke dashboard yang sama dalam 5 detik.
- Setiap perangkat dapat diberi label khusus (misal: "Meja VIP", "Lantai 2", "Kasir").

---

## 5. Non-Functional Requirements (NFR)

1. **Responsiveness & Cross-Device**:
   - Tampilan pengunjung: Dioptimalkan untuk layar ponsel pintar vertikal (mobile-first, tap target >= 44px).
   - Tampilan dashboard: Responsif mulus dari ponsel (640px) hingga laptop/desktop (1024px+).
2. **Performa**:
   - Server-side rendered (Next.js App Router) dengan waktu muat halaman scan pengunjung `< 1.2 detik`.
   - Payload JS pengunjung minimal (< 110 KB).
3. **Keandalan Database**:
   - Supabase PostgreSQL dengan connection pooling PgBouncer (`prepare: false`).
   - Fallback offline/development menggunakan PGlite lokal.
4. **Keamanan Data**:
   - Kebijakan Zero-Leakage: Atribut kontak pemilik (`whatsapp_number`, `pin_hash`) dilarang keras masuk ke payload public scan API (`/api/q/[code]/*`).

---

## 6. Matrix Status Fitur

| Modul | Fitur | Status | File Implementasi |
| :--- | :--- | :---: | :--- |
| **Auth** | Login WhatsApp + PIN | Selesai | `app/login/page.jsx`, `lib/actions/owner-auth-actions.js` |
| **Auth** | Proteksi Middleware & Session | Selesai | `middleware.js`, `lib/auth/session.js` |
| **Aktivasi** | Form Aktivasi Stand Baru | Selesai | `app/activate/[code]/page.jsx`, `components/customer/ActivationForm.jsx` |
| **Visitor** | Rating Gatekeeper (1-2 vs 4-5) | Selesai | `components/visitor/VisitorScanExperience.jsx` |
| **Visitor** | Review-to-reveal Wi-Fi | Selesai | `components/visitor/VisitorScanExperience.jsx`, `app/api/q/[code]/reveal-wifi/route.js` |
| **Visitor** | Input Masukan Tamu Privat | Selesai | `lib/actions/feedback-actions.js` |
| **Dashboard** | Bento Overview Cards | Selesai | `components/customer/OwnerSettingsPage.jsx` |
| **Dashboard** | Grafik Aktivitas Scan Spline | Selesai | `components/charts/ScanActivityChart.jsx` |
| **Dashboard** | Manajemen Multi-Perangkat | Selesai | `components/customer/DeviceList.jsx` |
| **Dashboard** | Modal Tambah QR Baru | Selesai | `components/customer/OwnerSettingsPage.jsx` |
| **Dashboard** | Inbox Ulasan & Follow-up WA | Selesai | `components/customer/OwnerSettingsPage.jsx` |
| **Dashboard** | Ganti PIN & Ganti Nomor WA | Selesai | `components/customer/OwnerSettingsPage.jsx` |
| **Admin** | Batch Generator & Export QR | Selesai | `app/admin/qr/page.jsx`, `components/admin/AdminQrManager.jsx` |
| **Admin** | Manajemen Bisnis & Pengguna | Selesai | `app/admin/businesses/page.jsx`, `app/admin/users/page.jsx` |
