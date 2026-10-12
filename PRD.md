# Product Requirements Document (PRD)
**Product Name:** COBASCAN
**Version:** 1.0
**Status:** In Development
**Date:** Oktober 2026

---

## 1. Executive Summary
**COBASCAN** adalah produk *phygital* (Physical-Digital) inovatif yang dirancang untuk membantu Usaha Mikro, Kecil, dan Menengah (UMKM) dalam memaksimalkan pengumpulan ulasan organik (*Google Review*) dan memberikan layanan digital ekstra (seperti Wi-Fi otomatis) kepada pelanggan mereka. 

Produk ini terdiri dari dua komponen utama:
1. **Perangkat Fisik:** Stand Akrilik premium yang tertanam teknologi NFC dan QR Code dinamis.
2. **Platform Perangkat Lunak (Web/Cloud):** Sistem *dashboard* bagi pemilik usaha untuk mengatur tautan *review*, detail Wi-Fi, serta memantau data pemindaian perangkat secara *real-time*.

---

## 2. Problem Statement
Pelaku UMKM lokal (seperti kafe, restoran, klinik, dan barbershop) sangat bergantung pada *rating* dan ulasan *Google Maps* untuk menarik pelanggan baru. Namun, mereka menghadapi hambatan nyata:
- **Friction Barrier:** Pelanggan yang puas sering kali merasa enggan memberikan ulasan karena prosesnya rumit (harus buka aplikasi, mencari nama toko, lalu mengetik).
- **Kurangnya Media Interaksi Lokal:** Pelanggan sering kali masih harus bertanya secara manual mengenai *password* Wi-Fi, yang mengurangi efisiensi pelayanan staf.
- **Keterbatasan Literasi Digital:** Banyak solusi *software* yang mahal dan menggunakan sistem langganan bulanan (SaaS) yang memberatkan UMKM.

---

## 3. Product Vision & Goals
- **Vision:** Menjadi penghubung nirkontak nomor satu di Indonesia yang menjembatani interaksi fisik di tempat usaha (UMKM) ke pengalaman digital.
- **Goals:** 
  - Menciptakan pengalaman *tap & scan* instan yang minim hambatan.
  - Meningkatkan volume ulasan organik bagi UMKM pengguna COBASCAN minimal 20-30% pada kuartal pertama pemakaian.
  - Mengembangkan sistem perangkat lunak awan yang reliabel dengan model bisnis beli putus (tanpa langganan) demi keterjangkauan UMKM.

---

## 4. Target Audience
1. **Target Pembeli (B2B):** Pemilik/Manajer UMKM di sektor *Food and Beverage* (kafe, kedai kopi, restoran), jasa layanan (salon kecantikan, barbershop, spa, klinik), dan ritel fisik.
2. **Target Pengguna Akhir (B2C):** Pengunjung atau pelanggan UMKM yang membawa *smartphone* (mendukung kamera QR Code atau teknologi NFC).

---

## 5. Key Features & Requirements

### 5.1. Customer Experience (End-User)
- **NFC Tap & QR Scan:** Pengguna dapat menyentuhkan ponsel (*Tap*) pada akrilik NFC atau memindai kode QR tanpa perlu mengunduh aplikasi tambahan apa pun.
- **Dynamic Digital Page:** Halaman pendaratan digital yang responsif di ponsel pelanggan yang memuat informasi profil bisnis (logo, nama).
- **One-Click Google Review:** Tombol instan yang akan membuka profil Google Maps milik *merchant* dan langsung memicu *form* ulasan bintang 5.
- **Auto Wi-Fi Connect:** Tombol untuk menyalin *password* Wi-Fi atau menghubungkan jaringan secara otomatis bagi perangkat yang didukung.

### 5.2. Merchant Dashboard (Pemilik Usaha)
- **Secure Authentication:** Login menggunakan Nomor WhatsApp dan PIN 6-digit yang dilengkapi sistem perlindungan *Anti Brute-Force* (penguncian akun sementara jika gagal beruntun).
- **Business Profile Management:** Pengaturan nama bisnis, unggah logo toko, dan sinkronisasi URL Google Maps Review.
- **Wi-Fi Settings:** Penyiapan SSID jaringan dan *password* yang bisa diperbarui kapan pun.
- **Device Management (Perangkat Akrilik):** Memantau perangkat yang terhubung ke akun, beserta kemampuan melakukan pengaturan *override* jaringan Wi-Fi untuk setiap perangkat yang spesifik.
- **Scan Analytics:** Pencatatan jumlah pemindaian (tap/scan) berdasarkan waktu untuk mengetahui seberapa aktif pelanggan berinteraksi.

### 5.3. Admin Console (Super Admin)
- **Batch & QR Code Generation:** Pembuatan ID unik untuk setiap kepingan NFC dan cetakan QR secara massal (*batch processing*) ke dalam sistem *database* sebelum perakitan perangkat fisik.
- **Device Provisioning:** Mengaktifkan, memblokir, atau melacak status distribusi fisik QR (berstatus *blank*, *sold*, atau *activated*).
- **User Monitoring:** Manajemen profil klien (merchant) yang mendaftar di dalam sistem.

---

## 6. System Architecture & Tech Stack

Sistem dibangun menggunakan pendekatan modern *Fullstack Serverless* untuk performa maksimal dan efisiensi biaya awal:

- **Frontend & Backend Framework:** [Next.js 14](https://nextjs.org/) (App Router), React 18
- **Styling:** Tailwind CSS (dengan *Micro-animations* GSAP)
- **Database & Authentication:** 
  - **Supabase (PostgreSQL)** sebagai penyedia *database* utama di *cloud*.
  - **Drizzle ORM** untuk pengelolaan skema, query tipe-aman (*type-safe*), dan migrasi data.
  - **Custom JWT Auth:** Manajemen sesi (Session) otentikasi mandiri berbasis JSON Web Token untuk nomor WhatsApp.
- **Cloud Hosting & Deployment:** [Vercel](https://vercel.com/) Edge Network
- **Hardware Integration:** Chip NTAG213 (NFC) diprogram dengan URL dinamis bawaan COBASCAN.

---

## 7. User Flow 

### 7.1 Flow Akuisisi (Pembelian)
1. UMKM melihat iklan *Meta Ads* atau *Tiktok Reels*.
2. Membuka *Landing Page* (`cobascan.my.id`).
3. Menekan CTA WhatsApp dan membeli perangkat dengan harga sekali bayar (Rp 89.000).
4. UMKM menerima kotak fisik perangkat COBASCAN.

### 7.2 Flow Aktivasi Perangkat
1. UMKM melakukan pemindaian QR pada perangkat fisik untuk pertama kali.
2. Sistem mendeteksi status "Blank/Belum Diaktifkan", kemudian mengarahkan ke halaman registrasi akun.
3. UMKM membuat akun menggunakan **Nomor WhatsApp**, mengatur **PIN 6-angka**, lalu login.
4. UMKM mengatur URL Google Review dan data Wi-Fi. Perangkat resmi *Terkunci* ke akun mereka.

### 7.3 Flow Pelanggan Akhir (Reviewing)
1. Pelanggan selesai bertransaksi di kasir.
2. Staf UMKM menawarkan, "Kak, boleh minta *review*-nya? Tap saja di sini untuk langsung akses Wi-Fi gratis."
3. Pelanggan melakukan *Tap* menggunakan ponsel.
4. Halaman *Digital Page* terbuka. Pelanggan menekan tombol "Berikan Ulasan".
5. Aplikasi Google Maps pelanggan terbuka, langsung pada halaman penulisan *Review*.

---

## 8. Monetization Strategy
- **Perangkat Keras Beli Putus:** Bisnis utama adalah penjualan margin dari setiap unit stand akrilik pintar seharga eceran standar Rp89.000 / pcs tanpa langganan *software* (SaaS-free).
- **Keunggulan:** Bebas biaya komputasi bulanan dari pemilik bisnis memastikan daya tarik tinggi bagi *market* level bawah. Biaya *server cloud* operasional di-cover dari persentase margin keuntungan penjualan alat.

---

## 9. Future Roadmap & Scale Up
- **Phase 1 (Bulan 1-6):** Penyelesaian *development*, peluncuran *landing page* komersial, kampanye iklan digital lokal, dan akuisisi pelanggan mandiri perdana.
- **Phase 2 (Tahun 1):** Perekrutan dan pembukaan sistem agen penjualan (*Reseller System*) dengan portal manajemen perangkat per *reseller*.
- **Phase 3 (Tahun 2+):** Ekspansi fitur *Digital Menu* (pesan makan di meja) dan integrasi sistem Point of Sale (POS) ringan.

---
*Dokumen ini merupakan kerangka dasar pengembangan produk (Product Requirements Document) COBASCAN. Seluruh fitur akan dikembangkan secara iteratif.*
