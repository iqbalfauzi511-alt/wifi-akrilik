# 02 — Analisis Bisnis Digital Produk Cobascan

**Tanggal:** Oktober 2026  
**Konteks Akademis:** Program Studi S1 Bisnis Digital, Fakultas Ekonomi dan Bisnis  
**Fokus Kajian:** Kewirausahaan Digital (*Digital Entrepreneurship*), Integrasi Pemasaran Digital, dan Model Bisnis Produk *Phygital*  

---

## 1. Identifikasi dan Validasi Masalah (Problem Statement)

Dalam perancangan bisnis digital, pemisahan antara masalah berbasis data riil (*validated problems*) dengan hipotesis awal (*assumed problems*) merupakan fondasi penting.

| Masalah yang Diidentifikasi | Kategori Status | Bukti / Catatan Validasi |
| :--- | :---: | :--- |
| **Ketergantungan terhadap Rating Google Maps** | **Tervalidasi (Riset Pasar)** | Riset industri menunjukkan 88% konsumen memeriksa rating Google Maps sebelum mengunjungi bisnis lokal baru. Bisnis dengan ulasan di bawah 4.2 mengalami penurunan konversi kunjungan drastis. |
| **Keluhan Tamu Bintang 1–2 Langsung Merusak Reputasi** | **Tervalidasi (Riset Lapangan)** | Ulasan negatif di Google Maps bersifat permanen di ranah publik dan memerlukan puluhan ulasan bintang 5 baru untuk mengembalikan rata-rata skor. |
| **Keletihan Menanyakan Sandi Wi-Fi (*Wi-Fi Fatigue*)** | **Tervalidasi (Observasi Toko)** | Pelayan kafe/restoran menghabiskan waktu produktif hanya untuk menjawab pertanyaan sandi Wi-Fi berulang kali, sementara stiker kertas rentan robek atau kusam. |
| **Keengganan UMKM Membayar SaaS Bulanan (*Subscription Aversion*)** | **Tervalidasi (Perilaku Pasar)** | Mayoritas UMKM di Indonesia menolak model pembayaran perangkat lunak berulang (*monthly recurring fee*). Mereka lebih memilih model pembayaran sekali beli (*one-time purchase / hardware bundle*). |
| **Penolakan terhadap Proses Registrasi Rumit** | **Tervalidasi (Pengalaman Pengguna)** | UMKM sering gagal atau enggan onboarding pada aplikasi yang mensyaratkan verifikasi email korporat atau OTP SMS berbayar. Model **WhatsApp + PIN** terbukti menurunkan friksi pendaftaran secara drastis. |
| **Peningkatan Omzet Langsung Pasca Pemasangan Stand** | **[PERLU VERIFIKASI] (Asumsi)** | Belum ada data kuantitatif dari pilot project yang mengukur korelasi langsung antara pertambahan stand Cobascan dengan peningkatan omzet kasir bulanan. |

---

## 2. Segmentasi Pasar dan Target Pengguna

### 2.1. Segmentasi Berdasarkan Karakteristik Bisnis
1. **Segmen Primer (High Urgency & High Engagement — 70%)**:
   - **Kafe, Kedai Kopi, dan Restoran Cepat Saji Kasual**:
     - *Karakteristik*: Pelanggan duduk (*dine-in*) dengan durasi rata-rata 30–90 menit. Kebutuhan koneksi internet (Wi-Fi) sangat tinggi.
     - *Dampak*: Interaksi meja sangat tinggi, peluang scan QR/NFC maksimal.
2. **Segmen Sekunder (Service & Waiting Time Based — 30%)**:
   - **Barbershop & Salon Kecantikan**: Pelanggan memiliki waktu tunggu (*dwell time*) sebelum atau saat proses pelayanan, membuka kesempatan untuk mengisi ulasan.
   - **Klinik Mandiri (Gigi, Estetika, Hewan)**: Reputasi Google Maps menjadi faktor krusial dalam keputusan pasien baru memilih klinik.
   - **Hotel Butik & Penginapan**: Ulasan Google Maps menentukan peringkat keterlihatan pada Google Hotel Search.

---

## 3. Value Proposition Canvas (VPC)

```
┌──────────────────────────────────────────────┐       ┌──────────────────────────────────────────────┐
│             VALUE PROPOSITION                │       │              CUSTOMER PROFILE                │
│                                              │       │                                              │
│  [Products & Services]                       │       │  [Customer Jobs]                             │
│  • Stand Akrilik Meja NFC + QR Dinamis       │       │  • Meningkatkan kunjungan pelanggan          │
│  • Platform Web Manajemen Terintegrasi       │  ───> │  • Membangun reputasi Google Maps yang baik  │
│  • Dashboard Pemilik (WhatsApp + PIN)        │       │  • Menyediakan fasilitas Wi-Fi yang lancar   │
│                                              │       │                                              │
│  [Pain Relievers]                            │       │  [Pains]                                     │
│  • Filter keluhan bintang 1-2 secara privat  │       │  • Ulasan buruk merusak skor secara publik   │
│  • Menghilangkan keletihan tanya sandi Wi-Fi │  ───> │  • Pelanggan puas jarang memberi ulasan      │
│  • Nomor WA pribadi pemilik 100% terlindungi │       │  • Biaya langganan software yang membebani   │
│  • Bebas biaya langganan bulanan             │       │  • Karyawan repot melayani pertanyaan Wi-Fi  │
│                                              │       │                                              │
│  [Gain Creators]                             │       │  [Gains]                                     │
│  • Review-to-reveal: insentif barter Wi-Fi   │       │  • Pertambahan ulasan bintang 5 secara alami │
│  • Ubah sandi Wi-Fi tanpa cetak ulang meja   │  ───> │  • Tampilan meja kafe terlihat modern/elegan│
│  • Kelola banyak meja/cabang dalam satu akun │       │  • Kritik masuk langsung untuk evaluasi toko │
└──────────────────────────────────────────────┘       └──────────────────────────────────────────────┘
```

---

## 4. Business Model Canvas (BMC) Cobascan

Berikut adalah perancangan 9 blok Business Model Canvas untuk Cobascan:

```
┌─────────────────┬─────────────────┬─────────────────┬─────────────────┬─────────────────┐
│ KEY PARTNERS    │ KEY ACTIVITIES  │ VALUE           │ CUSTOMER        │ CUSTOMER        │
│                 │                 │ PROPOSITIONS    │ RELATIONSHIPS   │ SEGMENTS        │
│ 1. Percetakan & │ 1. R&D platform │                 │                 │                 │
│    Vendor Akrilik  Next.js & DB   │ 1. Stand phygital│ 1. Self-service │ 1. Pemilik Kafe │
│    Lokal        │ 2. Produksi &   │    akrilik meja  │    onboarding   │    & Kedai Kopi │
│ 2. Supplier Chip│    tanam NFC    │    elegan        │    (WA + PIN)   │ 2. Restoran     │
│    NFC NTAG213  │ 3. Pemasaran    │ 2. Filter pintar │ 2. Dukungan     │    Kasual       │
│ 3. Penyedia Cloud  digital &     │    ulasan 1-2    │    teknis via   │ 3. Barbershop & │
│    (Vercel &       distribusi     │    (reputation   │    WhatsApp     │    Salon        │
│    Supabase)    │ 4. Layanan      │    safeguard)    │ 3. Komunitas    │ 4. Klinik Medis │
│ 4. Platform POS    dukungan mitra │ 3. Barter Wi-Fi  │    Mitra UMKM   │    Mandiri      │
│    / Kasir Lokal│                 │    otomatis      │                 │ 5. Hotel Butik  │
│                 ├─────────────────┤ 4. Zero monthly ├─────────────────┤    & Villa      │
│                 │ KEY RESOURCES   │    recurring fee│ CHANNELS        │                 │
│                 │                 │ 5. Multi-device  │                 │                 │
│                 │ 1. Source code &│    dalam 1 akun  │ 1. Marketplace  │                 │
│                 │    arsitektur   │                 │    (Tokopedia/  │                 │
│                 │ 2. Desain stand │                 │    Shopee)      │                 │
│                 │    akrilik fisik│                 │ 2. Direct Sales │                 │
│                 │ 3. Brand & domain│                 │    ke Kafe Lokal│                 │
│                 │    cobascan.my.id│                │ 3. Website Resmi│                 │
│                 │ 4. Basis data   │                 │    cobascan.my.id│               │
├─────────────────┴─────────────────┼─────────────────┴─────────────────┴─────────────────┤
│ COST STRUCTURE                    │ REVENUE STREAMS                                     │
│                                   │                                                     │
│ 1. Biaya Produksi Hardware (COGS): Akrilik, cutting laser, stiker UV, chip NFC      │ 1. Penjualan Unit Hardware Stand Akrilik Standar (QR Only)          │
│ 2. Biaya Infrastruktur Cloud: Hosting Vercel & Supabase Database                    │ 2. Penjualan Unit Hardware Stand Akrilik Premium (NFC + QR)         │
│ 3. Biaya Akuisisi Pelanggan (CAC): Iklan Meta Ads (Instagram/FB) & Komisi Mitra     │ 3. Penjualan Paket Meja Kafe (Bundling 3 Meja, 10 Meja, 20 Meja)    │
│ 4. Biaya Pengemasan & Pengiriman Logistik                                           │ 4. [RENCANA MASA DEPAN] Biaya Custom UV Grafir Logo Brand Kafe      │
└─────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 5. Analisis Kompetisi (Competitive Landscape)

```
                            Tinggi (Teknologi Phygital Terpadu)
                                            ▲
                                            │
                                            │        ★ COBASCAN
                                            │        (Hardware Akrilik Meja + Smart Cloud
                                            │         Filter Ulasan + Wi-Fi Gatekeeper)
        SaaS Review Global                  │
        (Trustpilot / Birdeye)              │
        • Biaya bulanan tinggi ($50-$200)   │
        • Tidak memiliki hardware meja fisik│
    ◄───────────────────────────────────────┼───────────────────────────────────────►
    Murni Perangkat Lunak                  │                     Murni Perangkat Keras
    (Software Only)                         │                     (Hardware Only)
                                            │   Stand Akrilik Percetakan Konvensional
                                            │   • Link statis (tidak bisa diubah)
                                            │   • Tanpa filter ulasan bintang 1-2
                                            │   • Tanpa fasilitas manajemen Wi-Fi
                                            │   • Harus cetak ulang jika ganti sandi
                                            │
                                            ▼
                             Rendah (Statis & Tanpa Filter)
```

---

## 6. Strategi Pemasaran dan Peluncuran (Go-to-Market)

Dalam kerangka keilmuan Bisnis Digital, strategi akuisisi dipetakan ke dalam Funnel Konversi:

1. **Top of Funnel (Brand Awareness)**:
   - Konten video pendek (TikTok, Instagram Reels) yang menyoroti masalah universal: *"Berapa kali sehari pelayanmu ditanya password Wi-Fi?"* dan bahaya ulasan bintang 1 di Google Maps.
   - Pemanfaatan Meta Ads berbayar dengan penargetan demografis pemilik bisnis makanan/minuman (*interest*: Cafe Owner, Restaurant Management).
2. **Middle of Funnel (Consideration & Trust)**:
   - Landing page [cobascan.my.id](https://cobascan.my.id) yang menyajikan transparansi spesifikasi hardware akrilik, kalkulator potensi ulasan, dan jaminan tanpa biaya bulanan tersembunyi.
3. **Bottom of Funnel (Conversion & Purchase)**:
   - Etalase di Tokopedia dan Shopee dengan paket *starter* siap kirim (plug-and-play).
   - Skema garansi ganti unit jika chip NFC atau akrilik rusak saat pengiriman.
4. **Post-Purchase (Activation & Retention)**:
   - Alur aktivasi 2 menit melalui `/activate/[code]` yang langsung membawa pemilik ke dashboard interaktif.

---

## 7. Rincian dan Analisis Finansial

### 7.1. Estimasi Struktur Biaya per Unit (COGS / HPP)
*Catatan: Angka di bawah merupakan estimasi rujukan berdasarkan harga komponen pasar fisik di Indonesia*:

| Komponen Produksi | Spesifikasi | Estimasi Biaya (Rp) |
| :--- | :--- | :---: |
| Stand Akrilik Bening | Ketebalan 2mm - 3mm, Ukuran A6 / T-Stand | Rp 18.000 – Rp 25.000 |
| Chip Tag NFC | NTAG213 Adhesive Label (Frekuensi 13.56 MHz) | Rp 4.500 – Rp 7.000 |
| Stiker Cetak & Laminasi | Vinil Outdoor / UV Print Anti Gores | Rp 3.500 – Rp 5.000 |
| Kemasan & Petunjuk | Kardus boks, bubble wrap, booklet panduan cetak | Rp 4.000 – Rp 6.000 |
| **Total Estimasi HPP per Unit** | — | **Rp 30.000 – Rp 43.000** |

### 7.2. Skema Penetapan Harga Jual (*Pricing Strategy*)
- **Unit Standar (QR Code Dinamis, Tanpa NFC)**: Rp 79.000 (Margin kotor: ~62%)
- **Unit Premium (NFC Tap + QR Code Dinamis)**: Rp 129.000 (Margin kotor: ~67%)
- **Paket Bundling Kafe (5 Unit Meja Premium)**: Rp 549.000 (Margin kotor: ~61%)

### 7.3. Kebutuhan Data Finansial Riil Proyek
- [DATA DIPERLUKAN]: Biaya faktual pembuatan akrilik dari vendor langganan pemilik proyek.
- [DATA DIPERLUKAN]: Catatan riil total unit yang telah diproduksi, terjual, dan teraktivasi pada basis data operasional.
