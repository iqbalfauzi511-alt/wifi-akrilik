# 04 — Kerangka Lengkap Tugas Akhir (BAB I – BAB V)

**Program Studi:** S1 Bisnis Digital  
**Fakultas:** Fakultas Ekonomi dan Bisnis, Universitas Ibn Khaldun (UIKA) Bogor  
**Judul Rujukan:** *"PENGEMBANGAN DAN VALIDASI PRODUK PHYGITAL 'COBASCAN' SEBAGAI SOLUSI OPTIMASI REPUTASI GOOGLE REVIEW DAN MANAJEMEN WI-FI PADA UMKM KULINER DI INDONESIA"*  

---

## Struktur Rinci Naskah Tugas Akhir

### HALAMAN AWAL
- Halaman Judul Tugas Akhir
- Halaman Pengesahan (Dosen Pembimbing & Ketua Program Studi)
- Halaman Pernyataan Keaslian Karya
- Kata Pengantar
- Abstrak (Bahasa Indonesia & Bahasa Inggris)
- Daftar Isi
- Daftar Tabel
- Daftar Gambar
- Daftar Lampiran

---

### BAB I: PENDAHULUAN
*Fokus: Menguraikan latar belakang masalah riil, urgensi produk phygital bagi UMKM, rumusan masalah, dan batasan implementasi.*

- **1.1 Latar Belakang Masalah**
  - Transformasi digital UMKM di Indonesia dan dominasi sektor F&B (kuliner).
  - Ketergantungan bisnis lokal terhadap *Local Search Engine Optimization* (Local SEO) dan ulasan Google Maps.
  - Fenomena paradoks ulasan: pelanggan puas cenderung pasif, sedangkan pelanggan kecewa sangat vokal menulis ulasan bintang 1 di ruang publik.
  - Hambatan operasional harian: inefisiensi pelayan kafe menjawab pertanyaan sandi Wi-Fi berulang kali.
  - Peluang teknologi *phygital* (penggabungan stand akrilik fisik di meja dengan platform cloud dinamis).
  - Alasan perancangan model autentikasi WhatsApp + PIN dan model harga tanpa biaya langganan bulanan (*zero monthly recurring fee*).
- **1.2 Rumusan Masalah**
  - Bagaimana merancang dan membangun produk *phygital* Cobascan (akrilik, NFC, QR Code, web platform)?
  - Bagaimana merumuskan dan menguji model bisnis (*Business Model Canvas*) tanpa biaya langganan?
  - Bagaimana strategi *go-to-market* digital marketing untuk mengakuisisi mitra pemilik usaha?
  - Bagaimana menganalisis metrik data pindaian untuk mengukur efektivitas produk dan mengarahkan iterasi?
- **1.3 Tujuan Penelitian**
  - Menghasilkan produk *phygital* yang fungsional dan teruji di lingkungan operasional nyata.
  - Memetakan dan memvalidasi model bisnis Cobascan bagi target UMKM kuliner.
  - Mengeksekusi strategi pemasaran digital berbasis funnel konversi.
  - Menganalisis metrik performa produk berbasis kerangka *Pirate Metrics* (AARRR).
- **1.4 Manfaat Penelitian**
  - *Manfaat Teoritis*: Menambah khazanah keilmuan Bisnis Digital terkait pengembangan produk *phygital* dan metodologi Lean Startup pada usaha rintisan tahap awal.
  - *Manfaat Praktis*:
    - Bagi Penulis: Penerapan nyata kompetensi sarjana Bisnis Digital ke dalam startup komersial riil.
    - Bagi UMKM Kuliner: Solusi perlindungan reputasi toko dan kemudahan fasilitas Wi-Fi yang terjangkau.
    - Bagi Program Studi: Menjadi percontohan karya tugas akhir berbasis proyek nyata (*project-based capstone*).
- **1.5 Ruang Lingkup dan Batasan Masalah**
  - Pembahasan difokuskan pada aspek Kewirausahaan Digital, Pemasaran Digital, dan Analisis Metrik Data (bukan rekayasa jaringan mikrotik tingkat dalam).
  - Perangkat keras dibatasi pada stand akrilik meja dengan chip NFC NTAG213 dan QR Code dinamis.
  - Wilayah uji coba dan validasi difokuskan pada pelaku usaha kuliner (kafe dan resto) di Indonesia.
- **1.6 Sistematika Penulisan**

---

### BAB II: TINJAUAN PUSTAKA
*Fokus: Mengkaji teori-teori relevan yang menjadi landasan akademis perancangan dan validasi.*

- **2.1 Konsep Bisnis Digital dan Produk Phygital**
  - Definisi dan karakteristik bisnis digital.
  - Konvergensi fisik dan digital (*phygital interaction*): memanfaatkan objek fisik sebagai pemicu (*trigger*) interaksi digital pengguna.
- **2.2 Kewirausahaan Digital dan Metodologi Lean Startup**
  - Pengertian kewirausahaan digital (*digital entrepreneurship*).
  - Konsep *Lean Startup* (Eric Ries): siklus *Build–Measure–Learn*.
  - Definisi dan fungsi *Minimum Viable Product* (MVP) dalam pengujian asumsi bisnis.
- **2.3 Model Bisnis dan Business Model Canvas (BMC)**
  - Teori model bisnis (Alexander Osterwalder & Yves Pigneur).
  - Sembilan blok bangunan model bisnis (Customer Segments, Value Propositions, Channels, Customer Relationships, Revenue Streams, Key Resources, Key Activities, Key Partnerships, Cost Structure).
  - *Value Proposition Canvas* (VPC): keselarasan antara profil pelanggan dan proposisi nilai produk (*Problem-Solution Fit*).
  - Model penetapan harga sekali beli (*One-Time Purchase / Lifetime Deal*) vs Langganan (*Subscription*).
- **2.4 Pemasaran Digital dan Funnel Konversi**
  - Definisi pemasaran digital dalam konteks UMKM.
  - Kerangka AIDA (*Attention, Interest, Desire, Action*) dan *Inbound Marketing*.
  - Strategi pemasaran berbayar (*Paid Ads*) dan pemasaran konten berbasis video pendek (*Short-form Video Marketing*).
- **2.5 Metrik Produk dan Analisis Data (Pirate Metrics AARRR)**
  - Pengenalan kerangka Dave McClure: *Acquisition, Activation, Retention, Referral, Revenue*.
  - Penerapan metrik pindaian meja, rasio konversi klik ulasan, dan masukan tersaring.
- **2.6 Peran Google Maps Review dalam Ekosistem Bisnis Lokal**
  - Mekanisme *Local Search Ranking Factors*.
  - Dampak sentimen ulasan terhadap keputusan beli konsumen (*social proof*).
- **2.7 Kajian Produk dan Riset Terdahulu**
  - Komparasi produk sejenis (stand akrilik statis percetakan konvensional vs SaaS review internasional vs Cobascan).
  - Matriks perbandingan keunggulan bersaing.

---

### BAB III: METODOLOGI DAN RANCANGAN PELAKSANAAN
*Fokus: Menjelaskan tahapan ilmiah, kerangka kerja, arsitektur sistem, dan instrumen pengumpulan data.*

- **3.1 Jenis dan Pendekatan Penelitian**
  - Penelitian berbasis proyek (*Project-Based Research*) dengan pendekatan campuran (*Mixed Method*).
- **3.2 Kerangka Berpikir Penelitian**
  - Diagram alir integrasi masalah, rancangan solusi, pengujian pasar, dan evaluasi hasil.
- **3.3 Metode Pengembangan Produk (Lean Startup Cycle)**
  - Tahap 1: *Ideation & Requirements Definition* (MRD & PRD).
  - Tahap 2: *Design & Prototyping* (Desain akrilik dan antarmuka web).
  - Tahap 3: *Implementation & Integration* (Pengkodean Next.js 14, Supabase, Drizzle ORM).
  - Tahap 4: *Testing & Deployment* (Uji coba lokal, Playwright E2E, deployment Vercel).
  - Tahap 5: *Measure & Iteration* (Analisis log pindaian dan perbaikan UX).
- **3.4 Arsitektur dan Teknologi Sistem**
  - Diagram arsitektur sistem (Mermaid).
  - Deskripsi tumpukan teknologi (Next.js 14, React 18, Tailwind CSS, Supabase PostgreSQL, Drizzle ORM, Vercel).
  - Diagram Entity Relationship (ERD) basis data aktual.
- **3.5 Gambaran Produk dan Fitur Terkini**
  - Modul Aktivasi Meja (`/activate/[code]`).
  - Modul Pengunjung dengan Smart Rating Gatekeeper (`/q/[code]`).
  - Modul Bento Dashboard Pemilik Usaha (`/dashboard`).
  - Modul Admin Platform (`/admin`).
- **3.6 Integrasi Tiga Pilar Bisnis Digital**
  - Integrasi Startup (Inti), Digital Marketing (Kanal), dan Data Analysis (Validasi).
- **3.7 Teknik Pengumpulan dan Analisis Data**
  - Data Kuantitatif Internal: Log pindaian dari tabel `scan_logs`, pendaftaran di tabel `users` dan `businesses`.
  - Data Kuantitatif Eksternal: Metrik iklan digital (Meta Ads) dan lalu lintas web.
  - Data Kualitatif: Wawancara langsung dan umpan balik mitra pemilik kafe.
- **3.8 Indikator Keberhasilan Tugas Akhir**
- **3.9 Jadwal Pelaksanaan Proyek**

---

### BAB IV: HASIL DAN PEMBAHASAN
*Fokus: Memaparkan hasil implementasi teknis nyata, pengujian bisnis, metrik yang terkumpul, dan pembahasan komprehensif.*

- **4.1 Gambaran Umum Produk Cobascan yang Dihasilkan**
  - Dokumentasi wujud fisik stand akrilik meja (spesifikasi bahan, chip NFC, cetakan QR).
  - Dokumentasi antarmuka digital yang telah berjalan di [cobascan.my.id](https://cobascan.my.id).
- **4.2 Analisis Kebutuhan Bisnis dan Validasi Pengguna**
  - Hasil konfirmasi kebutuhan pemilik kafe terhadap privasi nomor WhatsApp dan filter rating 1-2.
- **4.3 Implementasi Sistem Perangkat Lunak**
  - Implementasi alur autentikasi tanpa email (Nomor WhatsApp + PIN 6-digit).
  - Implementasi *Smart Rating Filter* dan *Review-to-reveal Wi-Fi*.
  - Implementasi *Unified Bento Dashboard* (optimasi tampilan mobile dan desktop `max-w-5xl`).
  - Implementasi generator batch kode QR untuk keperluan percetakan massal.
- **4.4 Analisis dan Validasi Model Bisnis (BMC)**
  - Pembahasan kesembilan blok Business Model Canvas berdasarkan data pengujian pasar.
  - Validasi *Value Proposition* terhadap kemauan membayar (*willingness to pay*) pemilik usaha.
  - Perbandingan struktur biaya (HPP per unit) terhadap harga jual paket bundling.
- **4.5 Pelaksanaan dan Evaluasi Strategi Pemasaran Digital**
  - Hasil penayangan konten media sosial edukasi ulasan Google Maps.
  - Hasil uji coba kampanye iklan digital (CTR, biaya per klik, rasio konversi pendaftaran).
- **4.6 Analisis Data Metrik Pindaian Meja (Product Analytics)**
  - Analisis data kuantitatif dari tabel `scan_logs` (tren pindaian harian, sebaran jam ramai).
  - Analisis efektivitas penyaringan keluhan: persentase masukan bintang 1–2 yang tersaring ke dashboard vs bintang 4–5 yang diteruskan ke Google Maps.
- **4.7 Pembahasan Kritis dan Iterasi Produk**
  - Pembahasan masalah teknis yang dihadapi selama implementasi (misal: penyesuaian tata letak desktop, pemisahan rute legacy).
  - Pembahasan temuan lapangan yang mengubah asumsi awal pengembang.

---

### BAB V: KESIMPULAN DAN SARAN
*Fokus: Menjawab rumusan masalah secara lugas berbasis data terverifikasi dan memberikan rekomendasi realistis.*

- **5.1 Kesimpulan**
  - Kesimpulan keberhasilan rancang bangun produk *phygital* Cobascan.
  - Kesimpulan validitas model bisnis sekali bayar (*one-time purchase*) bagi UMKM.
  - Kesimpulan efektivitas strategi pemasaran digital dan saluran akuisisi mitra.
  - Kesimpulan peran analisis data dalam siklus iterasi produk digital.
- **5.2 Keterbatasan Proyek dan Penelitian**
  - Keterbatasan integrasi otomatisasi pembayaran langsung di web.
  - Keterbatasan jangka waktu pengukuran korelasi terhadap omzet kasir kafe.
- **5.3 Saran Pengembangan Produk (Technical Recommendations)**
  - Integrasi payment gateway lokal (Midtrans / Xendit) untuk otomatisasi checkout hardware di web.
  - Pengembangan fitur broadcast pengingat atau promo berkala ke pengunjung yang pernah mengisi nomor kontak.
- **5.4 Rekomendasi Bisnis Selanjutnya (Business Recommendations)**
  - Penetrasi kemitraan strategis dengan perusahaan Point of Sale (POS) lokal.
  - Penyediaan layanan kustomisasi akrilik grafir logo kafe (*custom UV printing*).

---

### DAFTAR PUSTAKA
### LAMPIRAN-LAMPIRAN
- Lampiran 1: Diagram Arsitektur & ERD Sistem Cobascan
- Lampiran 2: Cuplikan Kode Sumber Kunci (Autentikasi, Gatekeeper, Skema DB)
- Lampiran 3: Foto Fisik Produk Stand Akrilik Meja Cobascan
- Lampiran 4: Dokumentasi Panduan Pengguna (*User Manual*)
- Lampiran 5: Log Data Pindaian / Hasil Pengujian Lapangan
