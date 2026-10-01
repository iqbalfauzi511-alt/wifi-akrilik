# COBASCAN — Konsep Proyek Lengkap
> **Smart Wi-Fi & Google Review Acrylic Stand**  
> Dokumen ini menjelaskan seluruh konsep proyek Cobascan secara komprehensif — mulai dari ide bisnis, arsitektur sistem, tech stack, database schema, hingga alur kerja teknis. Cocok digunakan sebagai bahan dasar penulisan skripsi, proposal, atau dokumentasi teknis.

---

## 1. APA ITU COBASCAN?

Cobascan adalah produk **phygital** (physical + digital) yang menggabungkan:

1. **Fisik** — Stand akrilik meja yang memuat QR Code dan NFC tag, diproduksi dan dijual kepada pelaku bisnis (kafe, restoran, barbershop, salon, UMKM).
2. **Digital** — Platform web berbasis cloud yang mengelola semua interaksi dari stand tersebut: ulasan Google Maps, feedback internal, dan akses Wi-Fi pelanggan.

**Masalah yang diselesaikan:**  
Pelaku bisnis kecil-menengah kesulitan mendapatkan ulasan Google Maps yang konsisten, sehingga reputasi online mereka stagnan. Di sisi lain, mereka tidak punya cara efektif untuk menangkap keluhan pelanggan sebelum berujung pada ulasan negatif publik.

**Solusi Cobascan:**  
Pelanggan yang scan QR code akan diarahkan ke halaman web interaktif. Sistem secara cerdas memisahkan alur berdasarkan rating:
- **Rating >= 3 bintang** → diarahkan ke Google Maps untuk memberi ulasan publik.
- **Rating 1–2 bintang** → diminta mengisi feedback privat yang masuk ke dashboard pemilik bisnis, bukan ke Google Maps.

Ini disebut mekanisme **"Rating Gatekeeper"** — inti bisnis dari Cobascan.

---

## 2. MODEL BISNIS

### B2C (Produk Fisik)
- Cobascan menjual **stand akrilik** beserta QR Code yang sudah terdaftar di platform.
- Pemilik bisnis membeli stand, lalu melakukan **aktivasi mandiri** via web → memasukkan nama bisnis, Google Maps URL, dan data Wi-Fi.

### B2B (SaaS Dashboard)
- Setelah aktivasi, pemilik bisnis mendapat akses **dashboard web** untuk:
  - Memantau jumlah scan QR per hari/minggu
  - Melihat feedback masuk dari pelanggan yang memberi rating rendah
  - Mengubah password Wi-Fi dan konfigurasi bisnis
  - Melihat statistik performa (scan, feedback, rata-rata rating)

### Revenue Model
- **One-time purchase** stand akrilik (harga produk fisik).
- Potensi **subscription** dashboard premium untuk fitur analitik lanjutan.

---

## 3. TECH STACK

### Frontend
| Teknologi | Versi | Peran |
|---|---|---|
| **Next.js** | 14 (App Router) | Framework fullstack React — SSR, SSG, API Routes |
| **React** | 18.3 | UI library komponen |
| **Tailwind CSS** | 3.4 | Utility-first CSS styling |
| **Lucide React** | 0.475 | Icon library |
| **clsx + tailwind-merge** | — | Conditional class name utilities |

### Backend / API
| Teknologi | Peran |
|---|---|
| **Next.js API Routes** | Server-side endpoints (REST API internal) |
| **Next.js Server Actions** | Form submissions & mutations tanpa API route eksplisit |
| **Middleware (Next.js)** | Auth guard untuk route /dashboard dan /admin |

### Database & ORM
| Teknologi | Peran |
|---|---|
| **PostgreSQL** (via Supabase) | Database utama — hosted cloud, free tier |
| **Supabase** | Backend-as-a-Service: PostgreSQL + Auth + Storage |
| **Drizzle ORM** | Type-safe query builder untuk PostgreSQL |
| **drizzle-kit** | CLI untuk generate & push schema migrations |

### Auth
| Teknologi | Peran |
|---|---|
| **Supabase Auth** | Untuk Admin (email + password login) |
| **Custom Session Cookie** (smartwifi_session) | Untuk Owner (WhatsApp number + 6-digit PIN) |

### Utilities & Tooling
| Teknologi | Peran |
|---|---|
| **qrcode** (npm) | Generate QR Code dalam format PNG/SVG/Base64 |
| **jszip** | Bulk download QR Code dalam format ZIP (admin) |
| **@electric-sql/pglite** | Local SQLite-compatible DB (untuk testing) |
| **Playwright** | End-to-end testing framework |
| **ESLint** | Linting & code quality |

### Deployment
| Layanan | Peran |
|---|---|
| **Vercel** | Hosting Next.js — serverless deployment |
| **Supabase** | Cloud PostgreSQL database |
| Domain | cobascan.my.id |

---

## 4. ARSITEKTUR SISTEM

```
FISIK / HARDWARE
Stand Akrilik + QR Code + NFC Tag (di meja bisnis)
        |
        | Pelanggan scan
        v
PLATFORM WEB (Next.js 14) — cobascan.my.id
        |
  +-----+-----+----------+
  |           |          |
Visitor    Owner      Admin
Page       Dashboard  Panel
/q/[code]  /dashboard /admin
  |           |          |
  +-----+-----+----------+
        |
  Next.js API Routes & Server Actions
  /api/q/[code]/reveal-wifi
  /api/q/[code]/track
  /api/admin/*
  /api/dashboard/*
        |
   Drizzle ORM
        |
  SUPABASE / PostgreSQL
  users | businesses | qr_batches
  qr_codes | scan_logs | customer_feedback
```

**Pola arsitektur:** Fullstack monolith berbasis Next.js App Router. Tidak ada backend terpisah — semua API, auth, dan rendering ada dalam satu codebase Next.js, di-deploy ke Vercel sebagai serverless functions.

---

## 5. STRUKTUR FOLDER PROYEK

```
smart wifi/
├── app/                          # Next.js App Router
│   ├── page.jsx                  # Landing page (marketing)
│   ├── layout.jsx                # Root layout
│   ├── globals.css               # Global CSS
│   ├── q/[code]/                 # Halaman visitor scan (/q/ABC123)
│   ├── dashboard/                # Owner dashboard (protected)
│   ├── admin/                    # Admin panel (role=admin)
│   ├── auth/                     # Auth callbacks (Supabase)
│   ├── login/                    # Login page
│   ├── activate/                 # Aktivasi QR code baru
│   ├── business/                 # Setup profil bisnis
│   └── api/                      # REST API endpoints
│       ├── q/[code]/
│       │   ├── reveal-wifi/      # POST: reveal WiFi credentials
│       │   └── track/            # GET: track scan actions
│       ├── admin/                # Admin-only APIs
│       └── dashboard/            # Owner dashboard APIs
├── components/
│   ├── visitor/
│   │   └── VisitorScanExperience.jsx  # CORE: Rating Gatekeeper UI
│   ├── dashboard/                # Owner dashboard components
│   └── admin/                    # Admin panel components
├── lib/
│   ├── db/
│   │   ├── schema.js             # Drizzle schema (source of truth)
│   │   └── index.js              # DB connection
│   ├── actions/                  # Next.js Server Actions
│   │   ├── owner-auth-actions.js
│   │   ├── feedback-actions.js
│   │   └── qr-actions.js
│   └── supabase/                 # Supabase client utilities
├── middleware.js                 # Auth middleware (route protection)
├── drizzle/                      # Auto-generated SQL migrations
├── drizzle.config.js
├── scripts/                      # DB seed scripts
├── documentation/                # Dokumentasi proyek
├── PRD.md                        # Product Requirements Document
├── MRD.md                        # Market Requirements Document
└── package.json
```

---

## 6. DATABASE SCHEMA (PostgreSQL via Drizzle ORM)

Database terdiri dari **6 tabel utama**:

---

### 6.1 Tabel `users`
Menyimpan semua akun pengguna sistem (Admin & Owner bisnis).

| Kolom | Tipe | Keterangan |
|---|---|---|
| id | UUID (PK) | Primary key, auto-generated |
| email | VARCHAR(255) | Email — hanya untuk Admin, nullable |
| name | VARCHAR(255) | Nama pengguna |
| avatar_url | TEXT | URL foto profil |
| password_hash | TEXT | Bcrypt hash password (Admin) |
| email_verified | BOOLEAN | Status verifikasi email |
| role | VARCHAR(32) | 'admin' atau 'customer' (default) |
| whatsapp_number | VARCHAR(32) | Nomor WA (UNIQUE) — untuk Owner |
| pin_hash | TEXT | Hash PIN 6 digit — untuk Owner |
| failed_login_attempts | INTEGER | Counter percobaan login gagal |
| locked_until | TIMESTAMP | Lockout timestamp setelah gagal berkali |
| created_at | TIMESTAMP | Waktu buat akun |
| updated_at | TIMESTAMP | Waktu update terakhir |

**Catatan desain:** Satu tabel `users` digunakan untuk dua jenis user dengan mekanisme auth berbeda. Admin menggunakan Supabase Auth (email+password). Owner menggunakan custom session cookie dengan WhatsApp+PIN.

---

### 6.2 Tabel `businesses`
Data profil bisnis yang dimiliki oleh Owner.

| Kolom | Tipe | Keterangan |
|---|---|---|
| id | UUID (PK) | Primary key |
| owner_id | UUID (FK → users.id) | Relasi ke pemilik bisnis |
| business_name | VARCHAR(255) | Nama bisnis (wajib) |
| logo_url | TEXT | URL logo bisnis |
| google_maps_review_url | TEXT | URL langsung ke form review Google Maps |
| google_maps_url | TEXT | URL halaman Google Maps bisnis |
| wifi_enabled | BOOLEAN | Apakah fitur Wi-Fi aktif |
| wifi_name | VARCHAR(255) | Nama SSID Wi-Fi |
| wifi_password | VARCHAR(255) | Password Wi-Fi |
| whatsapp_number | VARCHAR(32) | Nomor WA customer service bisnis |
| instagram_url | TEXT | URL profil Instagram bisnis |
| created_at | TIMESTAMP | Waktu registrasi bisnis |
| updated_at | TIMESTAMP | Waktu update terakhir |

---

### 6.3 Tabel `qr_batches`
Kelompok/batch QR Code yang diproduksi bersama (manajemen inventori Admin).

| Kolom | Tipe | Keterangan |
|---|---|---|
| id | UUID (PK) | Primary key |
| batch_code | VARCHAR(64) | Kode unik batch (UNIQUE) |
| created_at | TIMESTAMP | Waktu batch dibuat |

---

### 6.4 Tabel `qr_codes`
Setiap QR Code individual yang ada di stand akrilik.

| Kolom | Tipe | Keterangan |
|---|---|---|
| id | UUID (PK) | Primary key |
| code | VARCHAR(64) | Kode unik QR (UNIQUE) — dipakai di URL /q/[code] |
| status | VARCHAR(32) | 'blank' / 'sold' / 'active' / 'disabled' |
| business_id | UUID (FK → businesses.id) | Terhubung ke bisnis setelah aktivasi |
| batch_id | UUID (FK → qr_batches.id) | Kelompok produksi |
| device_name | VARCHAR(255) | Nama lokasi stand (misal: "Meja 1", "Kasir") |
| google_maps_review_url | TEXT | Override URL review (per-QR, opsional) |
| google_maps_url | TEXT | Override URL Maps (per-QR, opsional) |
| wifi_enabled | BOOLEAN | Override toggle Wi-Fi (per-QR) |
| wifi_name | VARCHAR(255) | Override SSID (per-QR) |
| wifi_password | VARCHAR(255) | Override password Wi-Fi (per-QR) |
| created_at | TIMESTAMP | Waktu QR dibuat |
| updated_at | TIMESTAMP | Waktu update |
| sold_at | TIMESTAMP | Waktu terjual ke bisnis |
| activated_at | TIMESTAMP | Waktu QR diaktifkan oleh Owner |

**Lifecycle status QR:**

```
blank → sold → active → disabled
```

- `blank`: Baru di-generate admin, belum terjual
- `sold`: Sudah terjual ke bisnis, belum diaktivasi Owner
- `active`: Sudah diaktivasi Owner, bisa di-scan pelanggan
- `disabled`: Dinonaktifkan (misal: stand rusak, bisnis tutup)

---

### 6.5 Tabel `scan_logs`
Log setiap interaksi pelanggan dengan QR Code.

| Kolom | Tipe | Keterangan |
|---|---|---|
| id | UUID (PK) | Primary key |
| qr_id | UUID (FK → qr_codes.id) | QR yang di-scan |
| scanned_at | TIMESTAMP | Waktu scan terjadi |
| user_agent | TEXT | Browser/device info pengunjung |
| action_type | VARCHAR(32) | Jenis aksi yang dilakukan |

**Action types yang direkam:**

| Action | Deskripsi |
|---|---|
| page_view | Halaman visitor dibuka |
| buka_review | Pelanggan klik untuk buka Google Maps |
| kirim_feedback | Pelanggan submit feedback 1-2 bintang |
| lihat_wifi | Pelanggan klik "Lihat Password Wi-Fi" |
| salin_wifi | Pelanggan klik "Salin Password" |

---

### 6.6 Tabel `customer_feedback`
Feedback privat dari pelanggan yang memberi rating rendah (1–2 bintang).

| Kolom | Tipe | Keterangan |
|---|---|---|
| id | UUID (PK) | Primary key |
| business_id | UUID (FK → businesses.id) | Bisnis yang mendapat feedback |
| qr_id | UUID (FK → qr_codes.id) | QR Code yang digunakan |
| rating | INTEGER | Nilai rating 1–5 |
| message | TEXT | Isi pesan/keluhan pelanggan |
| customer_name | VARCHAR(255) | Nama pelanggan (opsional) |
| customer_phone | VARCHAR(32) | Nomor HP pelanggan (opsional) |
| created_at | TIMESTAMP | Waktu feedback dikirim |

---

### ERD Ringkas

```
users (1) ──── (N) businesses
                      |
               (N) qr_codes ──── (1) qr_batches
                      |
                 (N) scan_logs

businesses (1) ──── (N) customer_feedback
qr_codes   (1) ──── (N) customer_feedback
```

---

## 7. ALUR KERJA (USER FLOW)

### 7.1 Alur Pengadaan & Aktivasi

```
Admin generate QR batch
      |
      v
QR Code status = 'blank'
      |
      v
Bisnis beli stand akrilik
      |
      v
Admin update status → 'sold' + assign ke bisnis
      |
      v
Owner login (WA + PIN) → buka halaman /activate
      |
      v
Owner isi: nama bisnis, Google Maps URL, Wi-Fi info
      |
      v
QR Code status → 'active'
      |
      v
Stand dipasang di meja → siap di-scan
```

### 7.2 Alur Pelanggan Scan (Rating Gatekeeper)

```
Pelanggan scan QR Code
      |
      v
Halaman /q/[code] dibuka
scan_logs: action='page_view' disimpan
      |
      v
Pelanggan pilih rating bintang (1–5)
      |
      +------------------------------+
      |                              |
Rating 1-2 bintang          Rating 3-5 bintang
      |                              |
      v                              v
Form feedback muncul       Redirect ke Google Maps
(privat)                   scan_logs: 'buka_review'
      |                              |
      v                              v
Feedback disimpan ke DB    Pelanggan beri ulasan
(customer_feedback)        di Google Maps
scan_logs: 'kirim_feedback'         |
      |                              |
      +------------------+-----------+
                         |
                         v
               PLACEBO LOADING (5 detik)
               "Memverifikasi ulasan..."
                         |
                         v
               Tombol "Lihat Wi-Fi" muncul
               scan_logs: 'lihat_wifi'
                         |
                         v
               Password Wi-Fi ditampilkan
               scan_logs: 'salin_wifi' (jika disalin)
```

### 7.3 Mekanisme "Placebo Loading"

Saat pelanggan kembali dari Google Maps, sistem menampilkan loading bar 5 detik dengan teks seperti *"Memverifikasi ulasan bintang 5 Anda..."*

**Teknisnya:** Ini **bukan** verifikasi nyata. Sistem tidak bisa mengakses Google Maps API untuk mengonfirmasi ulasan. Loading ini adalah psychological trigger — membuat pelanggan percaya sistemnya canggih, mendorong mereka untuk benar-benar memberi ulasan sebelum klaim Wi-Fi.

Deteksi return pelanggan dilakukan via:
- `document.addEventListener('visibilitychange')` — deteksi tab kembali aktif
- `window.addEventListener('focus')` — deteksi focus kembali ke window

---

## 8. SISTEM AUTENTIKASI

### Owner (Pemilik Bisnis)
- **Login:** Nomor WhatsApp + PIN 6 digit
- **Session:** Custom HTTP-only cookie `smartwifi_session` berisi payload base64url
- **PIN:** Di-hash menggunakan bcrypt sebelum disimpan ke DB
- **Lockout:** Setelah gagal login beberapa kali → `locked_until` diset

### Admin (Cobascan Internal)
- **Login:** Email + Password via Supabase Auth
- **Session:** Supabase JWT cookie (prefix `sb-`)
- **Authorization:** Email di-whitelist hardcode di `middleware.js` (`ADMIN_EMAILS`)

### Middleware Route Protection
File `middleware.js` berjalan di setiap request (Edge Runtime):
- Route `/dashboard/*` → wajib ada session (Owner atau Admin)
- Route `/admin/*` → wajib `role = 'admin'`
- Route lain (termasuk `/q/[code]`) → **public**, tidak butuh auth

---

## 9. API ENDPOINTS

### Public (Tidak butuh auth)
| Method | Path | Fungsi |
|---|---|---|
| GET | /q/[code] | Halaman visitor (Server Component) |
| GET | /api/q/[code]/track?action=X | Catat scan action ke scan_logs |
| POST | /api/q/[code]/reveal-wifi | Kembalikan Wi-Fi credentials |

### Protected — Owner
| Path | Fungsi |
|---|---|
| /dashboard | Dashboard utama owner |
| /dashboard/settings | Edit profil bisnis |
| /dashboard/feedback | Lihat feedback masuk |

### Protected — Admin
| Path | Fungsi |
|---|---|
| /admin | Admin panel |
| /api/admin/generate-qr | Generate batch QR baru |
| /api/admin/qr-list | Daftar semua QR codes |

---

## 10. FITUR UTAMA PER AKTOR

### Pelanggan (Visitor — tidak perlu login)
- Scan QR Code → halaman interaktif
- Beri rating bintang (1–5)
- Feedback privat (1–2 bintang) → masuk ke dashboard Owner
- Redirect ke Google Maps (3–5 bintang)
- Lihat & salin password Wi-Fi (setelah rating)

### Owner Bisnis (login WA + PIN)
- Statistik scan (total scan, per QR, per hari)
- Membaca feedback privat dari pelanggan
- Edit nama bisnis, logo, Google Maps URL
- Aktifkan/nonaktifkan Wi-Fi
- Ganti password Wi-Fi
- Kelola multiple QR Code (per meja/lokasi)

### Admin Cobascan (login email + password)
- Generate batch QR Code baru (bulk)
- Download QR Code sebagai PNG (ZIP)
- Monitor semua bisnis dan QR aktif
- Assign QR ke bisnis (saat terjual)

---

## 11. DEPLOYMENT & ENVIRONMENT

### Environment Variables
```
DATABASE_URL=postgresql://...supabase.co:5432/postgres
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SESSION_SECRET=...
NEXT_PUBLIC_BASE_URL=https://cobascan.my.id
```

### Deployment Flow
```
Push ke GitHub
      |
      v
Vercel auto-build (next build)
      |
      v
Deploy ke Vercel Edge Network
      |
      v
Database tetap di Supabase (tidak di-deploy ulang)
```

---

## 12. KESIMPULAN TEKNIS

| Aspek | Detail |
|---|---|
| Framework | Next.js 14 App Router (fullstack) |
| Database | PostgreSQL (Supabase) + Drizzle ORM |
| Auth | Dual: Supabase Auth (Admin) + Custom Cookie (Owner) |
| Deployment | Vercel (serverless) + Supabase (DB cloud) |
| Touchpoint Fisik | Stand Akrilik + QR Code + NFC |
| Mekanisme Inti | Rating Gatekeeper |
| Tabel Database | 6 tabel utama |
| Domain | cobascan.my.id |

---

## 13. POIN KUNCI UNTUK SKRIPSI DIGITAL MARKETING

### Keunikan Teknis (Diferensiasi)
1. **Rating Gatekeeper Logic** — Algoritma pemisah ulasan berdasarkan threshold bintang. Bukan sekadar redirect, ini strategi reputasi digital yang dikodekan langsung ke sistem.
2. **Placebo Loading UX** — Psychological UX pattern untuk meningkatkan conversion ke Google Maps tanpa memerlukan akses API eksternal manapun.
3. **Phygital Integration** — Jembatan antara produk fisik (stand akrilik) dan platform digital (SaaS dashboard) dalam satu ekosistem terintegrasi.
4. **Dual Auth System** — Dua mekanisme auth berbeda dalam satu aplikasi untuk dua segmen pengguna: Admin teknis vs Owner non-teknis.

### Angle Digital Marketing
- **Customer Acquisition:** QR Code sebagai touchpoint fisik yang masuk ke funnel digital
- **Conversion Funnel:** Visitor scan → rating → review publik (Google Maps) → reputasi naik → lebih banyak pelanggan baru
- **Data Collection:** scan_logs memungkinkan analisis perilaku pelanggan (kapan ramai scan, berapa % yang kasih feedback)
- **Reputation Management:** Memfilter ulasan negatif dari Google Maps publik sebelum publish → melindungi rating bintang bisnis

---

*Dokumen dibuat berdasarkan analisis source code aktual proyek Cobascan.*  
*Referensi utama: `lib/db/schema.js`, `components/visitor/VisitorScanExperience.jsx`, `middleware.js`*
