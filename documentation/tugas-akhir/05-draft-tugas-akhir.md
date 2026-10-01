# PROPOSAL TUGAS AKHIR
### (BERBASIS PROJECT / PROJECT-BASED)

---

# PENGEMBANGAN DAN VALIDASI PRODUK PHYGITAL "COBASCAN" SEBAGAI SOLUSI OPTIMASI REPUTASI GOOGLE REVIEW DAN MANAJEMEN WI-FI PADA UMKM KULINER DI INDONESIA

**Diajukan sebagai Proposal Tugas Akhir Berbasis Project**  
**Program Studi S1 Bisnis Digital**  

<br/><br/>

**Disusun oleh:**  
**[NAMA MAHASISWA / PEMILIK PROYEK]**  
**NPM: [NPM MAHASISWA]**  

<br/><br/>

### PROGRAM STUDI BISNIS DIGITAL
### FAKULTAS EKONOMI DAN BISNIS
### UNIVERSITAS IBN KHALDUN (UIKA) BOGOR
### 2026

---

## LEMBAR PENGESAHAN

**Proposal Tugas Akhir berbasis project dengan judul:**  
*“Pengembangan dan Validasi Produk Phygital ‘Cobascan’ sebagai Solusi Optimasi Reputasi Google Review dan Manajemen Wi-Fi pada UMKM Kuliner di Indonesia”*  

yang disusun oleh:

| Keterangan | Data |
| :--- | :--- |
| **Nama** | [NAMA MAHASISWA] |
| **NPM** | [NPM MAHASISWA] |
| **Program Studi** | S1 Bisnis Digital |
| **Fokus Tugas Akhir** | Kewirausahaan Digital (*Startup*) — dengan integrasi *Digital Marketing* dan *Data Analysis* |
| **Jenis Tugas Akhir** | Berbasis Project (Pengembangan dan Validasi Produk *Phygital* Riil) |

telah diperiksa dan disetujui untuk diajukan dalam pelaksanaan Tugas Akhir pada Program Studi S1 Bisnis Digital, Universitas Ibn Khaldun (UIKA) Bogor.

<br/>

Bogor, ......................... 2026

| Menyetujui, Dosen Pembimbing | Mengetahui, Ketua Program Studi Bisnis Digital |
| :---: | :---: |
| <br/><br/><br/>(......................................................) NIDN. ......................... | <br/><br/><br/>(......................................................) NIDN. ......................... |

---

## DAFTAR ISI

- LEMBAR PENGESAHAN
- DAFTAR ISI
- DAFTAR TABEL
- DAFTAR GAMBAR
- **BAB I PENDAHULUAN**
  - 1.1 Latar Belakang
  - 1.2 Rumusan Masalah
  - 1.3 Tujuan Penelitian
  - 1.4 Manfaat Penelitian
  - 1.5 Ruang Lingkup dan Batasan
- **BAB II TINJAUAN PUSTAKA**
  - 2.1 Produk Phygital dalam Bisnis Digital
  - 2.2 Kewirausahaan Digital dan Metodologi Lean Startup
  - 2.3 Model Bisnis dan Business Model Canvas (BMC)
  - 2.4 Digital Marketing dan Funnel Konversi
  - 2.5 Metrik Produk dan Analisis Data (AARRR)
  - 2.6 Peran Google Maps Review dalam Local SEO UMKM
  - 2.7 Kajian Produk Sejenis
- **BAB III METODOLOGI DAN RANCANGAN PELAKSANAAN**
  - 3.1 Jenis dan Pendekatan Penelitian
  - 3.2 Kerangka Berpikir
  - 3.3 Metode Pengembangan Produk
  - 3.4 Arsitektur dan Teknologi Sistem
  - 3.5 Gambaran Produk dan Fitur Terkini
  - 3.6 Integrasi Tiga Pilar Bisnis Digital
  - 3.7 Teknik Pengumpulan dan Analisis Data
  - 3.8 Indikator Keberhasilan
  - 3.9 Jadwal Pelaksanaan
- DAFTAR PUSTAKA

---

# BAB I
# PENDAHULUAN

### 1.1 Latar Belakang

Transformasi digital telah secara fundamental mengubah pola pengambilan keputusan konsumen dalam memilih tempat makan, kafe, dan restoran. Berdasarkan berbagai laporan industri lokal, sektor Usaha Mikro, Kecil, dan Menengah (UMKM), khususnya di bidang kuliner (*Food and Beverage* / F&B), menjadi salah satu kontributor terbesar dalam penyerapan tenaga kerja dan Produk Domestik Bruto (PDB) nasional di Indonesia. Namun demikian, keberlanjutan bisnis kuliner fisik sangat bergantung pada visibilitas lokal dan reputasi daring, di mana ulasan konsumen pada platform Google Maps (*Google Business Profile*) memainkan peranan yang sangat menentukan.

Riset perilaku konsumen modern menunjukkan bahwa lebih dari 80% calon pelanggan memeriksa rating bintang dan ulasan Google Maps sebelum memutuskan untuk mendatangi sebuah tempat makan baru. Tempat usaha yang memiliki rating di bawah 4.2 bintang kerap mengalami penurunan minat kunjungan secara signifikan. Ironisnya, dalam operasional harian, pelaku usaha menghadapi paradoks ulasan (*review paradox*): pelanggan yang merasa puas cenderung tidak meninggalkan ulasan dan langsung meninggalkan lokasi, sementara pelanggan yang mengalami kekecewaan kecil (seperti pesanan lambat atau suhu ruangan kurang dingin) sangat terdorong untuk mengekspresikan emosi sesaat dengan memberikan rating bintang 1 atau 2 secara permanen di ruang publik Google Maps. Kondisi ini membuat reputasi bisnis lokal sangat rentan tercoreng.

Di sisi lain, kebutuhan operasional mendasar pengunjung kafe di Indonesia adalah ketersediaan koneksi internet nirkabel (Wi-Fi). Pelayan atau kasir kerap kali menghabiskan waktu produktif hanya untuk menjawab pertanyaan yang sama secara berulang-ulang: *"Mas/Mbak, password Wi-Fi nya apa ya?"*. Penggunaan kertas tempelan konvensional di dinding atau meja terbukti tidak efektif karena mudah rusak, kusam, dan menuntut pencetakan ulang setiap kali pemilik usaha mengganti sandi jaringan demi keamanan.

Melihat irisan masalah tersebut, penulis mengembangkan **Cobascan** ([https://cobascan.my.id](https://cobascan.my.id)), yaitu inovasi produk *phygital* (penggabungan fisik dan digital) berupa stand akrilik pintar yang diletakkan di meja kafe/restoran. Stand akrilik ini dilengkapi dengan kode respons cepat (*dynamic QR Code*) dan chip *Near Field Communication* (NFC) NTAG213. Melalui Cobascan, pengunjung cukup menempelkan (*tap*) ponsel pintar atau memindai kode di meja untuk menilai kepuasan mereka. Sistem menerapkan mekanisme *Smart Rating Gatekeeper*: pengunjung yang memberikan rating bintang 4 atau 5 secara otomatis dialihkan ke formulir Google Maps Review dengan imbalan terbukanya kata sandi Wi-Fi meja, sedangkan pengunjung yang memberikan rating bintang 1 atau 2 dialihkan ke formulir masukan internal privat sehingga kritik dapat langsung ditindaklanjuti oleh pemilik usaha tanpa merusak reputasi toko di ranah publik.

Dari perspektif kewirausahaan, Cobascan mengusung model bisnis pembelian perangkat keras sekali bayar (*one-time purchase / zero monthly recurring fee*) dan autentikasi pemilik berbasis **Nomor WhatsApp + PIN 6-digit**. Pendekatan ini secara sadar dirancang untuk menghilangkan friksi resistensi UMKM Indonesia yang umumnya enggan membayar biaya langganan bulanan (*subscription aversion*) dan malas melalui proses registrasi email korporat atau OTP SMS berbayar.

Hingga proposal ini diajukan, produk Cobascan telah berstatus beroperasi penuh (*running in production*), memiliki arsitektur web modern berbasis Next.js 14 dan Supabase PostgreSQL, serta telah diuji coba pada unit prototipe fisik. Keadaan ini menjadikan Cobascan sangat relevan dan matang untuk diangkat sebagai objek Tugas Akhir berbasis proyek (*project-based thesis*).

Penelitian ini memposisikan **Kewirausahaan Digital (*Digital Entrepreneurship*)** sebagai pilar inti, yang didukung secara sinergis oleh pilar **Pemasaran Digital (*Digital Marketing*)** untuk strategi akuisisi mitra pemilik kafe, serta pilar **Analisis Data (*Data Analysis*)** untuk mengukur metrik pindaian meja dan konversi ulasan. Dengan demikian, karya ini diharapkan dapat menjadi rujukan ilmiah dan praktis mengenai bagaimana mahasiswa Bisnis Digital mampu merancang, membangun, dan memvalidasi produk teknologi riil yang bernilai ekonomi bagi UMKM di Indonesia.

---

### 1.2 Rumusan Masalah

Berdasarkan latar belakang di atas, rumusan masalah dalam Tugas Akhir ini dirumuskan sebagai berikut:
1. Bagaimana merancang dan mengembangkan produk *phygital* stand akrilik pintar "Cobascan" yang mengintegrasikan perangkat keras NFC/QR dengan platform web interaktif Next.js?
2. Bagaimana model bisnis *one-time purchase* tanpa biaya langganan bulanan dapat dirumuskan dan diuji penerimaannya pada target pasar UMKM kuliner di Indonesia?
3. Bagaimana merumuskan dan mengeksekusi strategi pemasaran digital (*go-to-market*) guna mengakuisisi mitra pemilik usaha fisik dan memvalidasi kemauan membayar (*willingness to pay*)?
4. Bagaimana data aktivitas pindaian (*scan metrics*) dan interaksi pengunjung dianalisis untuk mengevaluasi efektivitas produk serta menjadi dasar iterasi pengembangan sistem selanjutnya?

---

### 1.3 Tujuan Penelitian

Tujuan yang ingin dicapai melalui pelaksanaan Tugas Akhir ini adalah:
1. Menghasilkan produk *phygital* Cobascan yang fungsional, andal, dan siap pakai, meliputi unit fisik akrilik, modul pindaian tamu, serta dashboard analitik pemilik toko.
2. Memetakan, menerapkan, dan mengevaluasi model bisnis Cobascan melalui kerangka *Business Model Canvas* (BMC) bagi segmen UMKM.
3. Merumuskan dan menjalankan strategi pemasaran digital multi-saluran untuk memvalidasi minat pasar dan tingkat adopsi pemilik usaha.
4. Menganalisis metrik produk (aktivitas pindaian, rasio konversi ulasan bintang 4–5, dan efektivitas filter keluhan bintang 1–2) sebagai dasar pengambilan keputusan iterasi produk berbasis data.

---

### 1.4 Manfaat Penelitian

#### 1.4.1 Manfaat Teoritis
Penelitian ini diharapkan dapat memperkaya literatur akademis di bidang Bisnis Digital, khususnya mengenai penerapan metodologi *Lean Startup* dalam pengembangan produk *phygital*, strategi mitigasi reputasi digital UMKM, dan perancangan model bisnis berbasis perangkat keras terhubung (*connected hardware*) tanpa beban biaya berulang.

#### 1.4.2 Manfaat Praktis
- **Bagi Penulis**: Menjadi sarana implementasi komprehensif keilmuan Bisnis Digital dari tahap perancangan konsep, pengkodean sistem, perakitan fisik, hingga pengujian komersial nyata.
- **Bagi Pelaku UMKM**: Memperoleh solusi terjangkau untuk meningkatkan reputasi ulasan positif di Google Maps, menyaring kritik secara privat, menghemat waktu staf dalam pembagian sandi Wi-Fi, serta menjaga kerahasiaan nomor kontak pribadi pemilik.
- **Bagi Program Studi S1 Bisnis Digital UIKA Bogor**: Menjadi bukti nyata kapabilitas lulusan dalam menghasilkan proyek akhir berbasis produk nyata (*capstone project*) yang solutif bagi permasalahan dunia usaha.

---

### 1.5 Ruang Lingkup dan Batasan Penelitian

Untuk menjaga fokus dan kedalaman pembahasan, batasan penelitian ditetapkan sebagai berikut:
1. Fokus utama penelitian berada pada domain **Bisnis Digital** (pengembangan produk, validasi model bisnis, pemasaran digital, dan analisis metrik data), bukan pada kedalaman rekayasa mikrokontroler atau protokol transmisi nirkabel tingkat rendah.
2. Perangkat keras dibatasi pada stand akrilik meja ukuran A6 / T-stand yang memuat stiker cetak QR Code dinamis dan chip NFC pasif tipe NTAG213.
3. Sistem aplikasi yang dikaji adalah platform berbasis web (*Progressive Web App* / responsif peramban) yang diakses pengunjung dan pemilik tanpa memerlukan instalasi aplikasi *native* dari Play Store atau App Store.
4. Validasi komersial difokuskan pada pelaku usaha kuliner (kafe, kedai kopi, dan restoran kasual) di wilayah perkotaan di Indonesia.

---

# BAB II
# TINJAUAN PUSTAKA

### 2.1 Produk Phygital dalam Bisnis Digital

Konsep *phygital* (akronim dari *physical* dan *digital*) mengacu pada integrasi mulus antara pengalaman di dunia fisik dengan kapabilitas platform digital untuk menciptakan pengalaman pelanggan yang lebih kaya dan tanpa hambatan. Dalam konteks pemasaran modern, objek fisik di meja kafe berfungsi sebagai titik temu awal (*physical touchpoint*) yang memicu keterlibatan digital konsumen (*digital engagement*) melalui perantara teknologi nirkabel seperti QR Code dan NFC (*Near Field Communication*). 

Cobascan mengadopsi paradigma ini dengan mentransformasikan stand akrilik meja yang semula pasif menjadi saluran interaksi aktif dua arah antara pengunjung dan manajemen toko.

---

### 2.2 Kewirausahaan Digital dan Metodologi Lean Startup

Kewirausahaan digital (*digital entrepreneurship*) menekankan penciptaan nilai ekonomi baru melalui pemanfaatan teknologi informasi dan internet. Dalam konteks pembangunan produk teknologi tahap awal (*early-stage startup*), metodologi *Lean Startup* yang diperkenalkan oleh Eric Ries (2011) menjadi pedoman utama. 

Inti dari metodologi ini adalah siklus umpan balik **Build–Measure–Learn** (bangun–ukur–pelajari):
1. **Build**: Membangun *Minimum Viable Product* (MVP), yaitu versi produk paling sederhana yang memungkinkan tim memvalidasi hipotesis bisnis fundamental dengan sumber daya minimal.
2. **Measure**: Mengumpulkan data kuantitatif dan kualitatif dari interaksi pengguna riil terhadap MVP tersebut.
3. **Learn**: Menarik kesimpulan berbasis bukti empiris (*validated learning*) untuk memutuskan apakah bisnis harus bertahan pada rencana awal (*persevere*) atau melakukan perubahan haluan strategis (*pivot*).

Cobascan telah melewati tahap pembentukan MVP fungsional dan saat ini berada dalam fase pengukuran (*measure*) untuk memvalidasi kesesuaian produk dengan pasar (*product-market fit*).

---

### 2.3 Model Bisnis dan Business Model Canvas (BMC)

Model bisnis mendeskripsikan logika bagaimana suatu organisasi menciptakan, menyalurkan, dan menangkap nilai (Osterwalder & Pigneur, 2010). Kerangka *Business Model Canvas* (BMC) membagi analisis bisnis ke dalam 9 blok bangunan utama: *Customer Segments, Value Propositions, Channels, Customer Relationships, Revenue Streams, Key Resources, Key Activities, Key Partnerships,* dan *Cost Structure*.

Untuk produk perangkat keras berbasis peranti lunak, terdapat dua model monetisasi umum:
1. *Software as a Service (SaaS) Subscription*: Pengguna membayar biaya bulanan/tahunan berulang.
2. *One-Time Purchase / Hardware-Enabled Software*: Pengguna membeli unit fisik satu kali, dan akses perangkat lunak disediakan tanpa biaya tambahan.

Berdasarkan analisis perilaku pasar UMKM di Indonesia yang memiliki tingkat keengganan tinggi terhadap biaya langganan software kecil, Cobascan memilih model *one-time purchase* sebagai pembeda kompetitif utama.

---

### 2.4 Digital Marketing dan Funnel Konversi

Pemasaran digital mencakup aktivitas menjangkau dan mengonversi prospek melalui kanal daring. Model funnel AIDA (*Attention, Interest, Desire, Action*) digunakan untuk memetakan jalur calon pembeli:
- **Top of Funnel (Awareness)**: Dibangun melalui konten media sosial video pendek (TikTok, Instagram) yang menyoroti masalah ulasan buruk Google Maps.
- **Middle of Funnel (Consideration)**: Halaman penawaran (*landing page*) yang memberikan bukti spesifikasi akrilik dan kalkulasi manfaat reputasi.
- **Bottom of Funnel (Conversion)**: Transaksi pembelian paket stand meja melalui toko resmi di lokapasar (*marketplace*) terpercaya.

---

### 2.5 Metrik Produk dan Analisis Data (AARRR Pirate Metrics)

Kerangka metrik produk AARRR yang dipopulerkan oleh Dave McClure mengukur keberhasilan produk digital melalui lima tahapan:
1. **Acquisition**: Jumlah pengunjung yang mengakses halaman scan meja.
2. **Activation**: Persentase pengunjung yang memberikan rating bintang pada stand meja.
3. **Retention**: Frekuensi pindaian harian yang berkelanjutan pada stand meja yang sama.
4. **Referral**: Pengunjung yang membagikan tautan ulasan atau mitra yang merekomendasikan Cobascan ke kafe lain.
5. **Revenue**: Pendapatan yang dihasilkan dari penjualan unit stand akrilik dan paket ekspansi cabang.

---

### 2.6 Peran Google Maps Review dalam Local SEO UMKM

Dalam algoritma pencarian lokal Google (*Google Local Pack*), ulasan konsumen merupakan salah satu sinyal peringkat terpenting. Faktor kuantitas ulasan, nilai rata-rata bintang, dan keteraturan ulasan baru (*recency*) secara langsung meningkatkan peringkat keterlihatan bisnis di Google Search dan Google Maps. Oleh karena itu, otomasi dorongan ulasan positif bintang 4–5 yang dilakukan oleh Cobascan bertindak sebagai instrumen pertumbuhan pemasaran organik bagi mitra UMKM.

---

### 2.7 Kajian Produk Sejenis

| Dimensi Perbandingan | Stand Akrilik Percetakan Biasa | SaaS Review Internasional (Trustpilot) | Solusi Phygital Cobascan |
| :--- | :--- | :--- | :--- |
| **Bentuk Fisik** | Akrilik / Stiker statis | Tanpa hardware fisik meja | Stand akrilik transparan + NFC NTAG213 + QR |
| **Filter Rating Kritis** | Tidak ada (semua masuk Google Maps) | Ada (di platform web sendiri) | **Smart Filter (Bintang 1-2 masuk privat ke owner)** |
| **Insentif Akses Wi-Fi** | Tidak ada | Tidak ada | **Otomatis (Review-to-reveal Wi-Fi)** |
| **Biaya Penggunaan** | Sekali cetak (namun harus cetak ulang jika ganti sandi) | Berlangganan bulanan mahal ($50–$200/bln) | **Sekali beli, bebas biaya langganan bulanan** |
| **Kemudahan Login** | Tidak ada sistem login | Email korporat & sandi rumit | **Nomor WhatsApp + PIN 6 Angka** |

---

# BAB III
# METODOLOGI DAN RANCANGAN PELAKSANAAN

### 3.1 Jenis dan Pendekatan Penelitian

Penelitian ini merupakan **Tugas Akhir Berbasis Proyek (*Project-Based Capstone*)** yang memadukan rekayasa pengembangan produk (*engineering & prototyping*) dengan studi kasus validasi bisnis (*business validation case study*). Pendekatan iteratif Lean Startup digunakan untuk menghubungkan proses teknis pembangunan sistem dengan respon pasar nyata.

---

### 3.2 Kerangka Berpikir Penelitian

Alur pemikiran penelitian ini berawal dari identifikasi masalah reputasi dan operasional Wi-Fi pada kafe fisik, dilanjutkan dengan perancangan produk terpadu, penetapan model bisnis tanpa beban langganan, pelaksanaan strategi pemasaran multi-kanal, dan diakhiri dengan analisis data metrik pindaian sebagai landasan evaluasi kelayakan usaha.

---

### 3.3 Metode Pengembangan Produk

Pengembangan produk Cobascan mengikuti 5 tahap terstruktur:
1. **Analisis Kebutuhan**: Penyusunan dokumen kebutuhan pasar (*MRD*) dan spesifikasi teknis produk (*PRD*).
2. **Perancangan Sistem**: Desain tata letak stand akrilik fisik, skema basis data PostgreSQL, dan antarmuka web.
3. **Implementasi Teknis**: Pembangunan frontend dan backend Next.js 14, integrasi database Supabase via Drizzle ORM, serta pemrograman chip NFC.
4. **Pengujian Fungsional**: Pengujian *End-to-End* (E2E) antarmuka dan pengujian performa build produksi.
5. **Penerapan dan Validasi**: Penempatan prototipe di lokasi usaha mitra untuk pengumpulan data interaksi nyata.

---

### 3.4 Arsitektur dan Teknologi Sistem

Sistem Cobascan dibangun dengan kakas teknologi modern yang mengedepankan performa, efisiensi biaya operasional, dan keandalan tinggi:

| Komponen Arsitektur | Teknologi Terpilih | Peran dan Fungsi |
| :--- | :--- | :--- |
| **Hardware Meja** | Akrilik Bening + NFC NTAG213 | Titik sentuh fisik pelanggan di atas meja makan/minum |
| **Aplikasi Web** | Next.js 14 (App Router) | Antarmuka pengguna dan server-side rendering terpadu |
| **Bahasa Pemrograman** | JavaScript / React 18 | Logika komponen interaktif dan pemrosesan data |
| **Styling & Tata Letak**| Tailwind CSS | Desain responsif ramah ponsel (*mobile-first*) dan desktop |
| **Basis Data** | PostgreSQL (Supabase Cloud) | Penyimpanan transaksional data perangkat, owner, dan feedback |
| **ORM** | Drizzle ORM | Pemetaan objek ke basis data dengan efisiensi memori tinggi |
| **Infrastruktur Cloud**| Vercel Serverless | Hosting performa tinggi dengan jaringan edge global |

---

### 3.5 Gambaran Produk dan Fitur Terkini

Hingga saat proposal ini disusun, fitur-fitur yang telah berstatus aktif dan teruji pada repositori meliputi:

1. **Autentikasi Pemilik Usaha (WhatsApp + PIN)**: Login cepat tanpa email dan tanpa ketergantungan OTP SMS berbayar. Dilengkapi fitur keamanan penguncian akun otomatis jika salah memasukkan PIN berulang kali.
2. **Smart Rating Gatekeeper Meja**: Formulir interaktif di `/q/[code]` yang menyaring ulasan secara real-time. Rating 4–5 dialihkan ke Google Maps; rating 1–2 dialihkan ke pesan privat pemilik.
3. **Pertukaran Akses Wi-Fi (*Review-to-Reveal*)**: Membuka kunci nama dan sandi Wi-Fi meja dengan tombol satu sentuhan salin (*one-tap copy*) setelah ulasan diproses.
4. **Generator Tautan Ulasan Otomatis**: Utilitas cerdas untuk mengonversi URL Google Maps toko biasa menjadi tautan form ulasan instan.
5. **Unified Bento Dashboard Pemilik (`/dashboard`)**: Dashboard terpadu yang menampilkan statistik pindaian, grafik tren harian, daftar multi-perangkat, modal tambah QR baru, kotak masuk keluhan tamu dengan tombol respon WhatsApp, serta pengaturan PIN.
6. **Panel Administrator (`/admin`)**: Modul pengelolaan pembuatan batch stand akrilik baru, ekspor kode percetakan, dan audit status perangkat.

---

### 3.6 Integrasi Tiga Pilar Bisnis Digital

Tugas Akhir ini secara harmonis mengintegrasikan tiga pilar kurikulum Bisnis Digital:
1. **Pilar Inti — Kewirausahaan Digital (*Startup*)**: Proses validasi ide, rancang bangun MVP *phygital*, pemetaan model bisnis (BMC), dan pengujian penerimaan harga di pasar UMKM.
2. **Pilar Pendukung — Pemasaran Digital (*Digital Marketing*)**: Perancangan alur akuisisi calon mitra melalui edukasi bahaya jasa review palsu, video demonstrasi media sosial, dan penempatan etalase di lokapasar digital.
3. **Pilar Pendukung — Analisis Data (*Data Analysis*)**: Pengolahan data pindaian dari basis data PostgreSQL untuk menghitung tingkat konversi ulasan, frekuensi pindaian harian, dan rasio ulasan kritis yang berhasil dicegah dari ruang publik.

---

### 3.7 Teknik Pengumpulan dan Analisis Data

Data dalam penelitian ini dihimpun melalui beberapa saluran:
1. **Data Kuantitatif Internal Aplikasi**: Diambil langsung dari tabel `scan_logs`, `qr_codes`, dan `customer_feedback` pada Supabase PostgreSQL untuk mengukur metrik aktivasi dan retensi.
2. **Data Kuantitatif Pemasaran**: Metrik performa saluran akuisisi (impresi, rasio klik tayang/CTR, dan rasio konversi pembelian di lokapasar).
3. **Data Kualitatif**: Wawancara terstruktur dan umpan balik langsung dari pemilik usaha mitra uji coba mengenai kemudahan penggunaan dashboard dan efektivitas pencegahan keluhan.
4. **Metode Analisis**: Analisis deskriptif kuantitatif menggunakan kerangka AARRR yang disandingkan dengan target performa bisnis yang telah ditetapkan.

---

### 3.8 Indikator Keberhasilan Tugas Akhir

Tugas Akhir ini dinyatakan berhasil apabila memenuhi kriteria berikut:
1. Produk *phygital* Cobascan terpasang dan berfungsi tanpa kendala operasional teknis pada lingkungan toko mitra.
2. Model bisnis *one-time purchase* terdokumentasi secara ilmiah melalui Business Model Canvas dan tervalidasi dengan adanya transaksi pemesanan unit riil.
3. Strategi pemasaran digital menghasilkan data metrik konversi akuisisi yang terukur.
4. Analisis data pindaian berhasil memetakan efektivitas penyaringan keluhan bintang 1–2 serta memberikan rekomendasi perbaikan berbasis bukti empiris.

---

### 3.9 Jadwal Pelaksanaan

Rencana pelaksanaan Tugas Akhir berbasis proyek ini dirancang selama kurun waktu 6 (enam) bulan sebagai berikut:

| No | Tahapan Kegiatan | Bulan 1 | Bulan 2 | Bulan 3 | Bulan 4 | Bulan 5 | Bulan 6 |
| :-: | :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| 1 | Penyusunan dan Seminar Proposal Tugas Akhir | ████ | | | | | |
| 2 | Produksi Stand Akrilik Pilot & Uji Lab | | ████ | | | | |
| 3 | Uji Coba Implementasi di Kafe/Resto Mitra | | | ████ | | | |
| 4 | Eksekusi Kampanye Pemasaran Digital Multi-Kanal | | | | ████ | | |
| 5 | Pengumpulan & Analisis Data Metrik Pindaian | | | | | ████ | |
| 6 | Penyusunan Laporan Akhir & Sidang Skripsi | | | | | | ████ |

---

# DAFTAR PUSTAKA

Blank, S., & Dorf, B. (2012). *The Startup Owner’s Manual: The Step-by-Step Guide for Building a Great Company*. K&S Ranch Publishing.

Kementerian Koperasi dan Usaha Kecil Menengah Republik Indonesia. (2024). *Perkembangan Data Usaha Mikro, Kecil, Menengah (UMKM) dan Usaha Besar*. Kemenkop UKM RI.

Kotler, P., Kartajaya, H., & Setiawan, I. (2021). *Marketing 5.0: Technology for Humanity*. John Wiley & Sons.

McClure, D. (2007). *Startup Metrics for Pirates: AARRR!*. 500 Startups.

Osterwalder, A., & Pigneur, Y. (2010). *Business Model Generation: A Handbook for Visionaries, Game Changers, and Challengers*. John Wiley & Sons.

Osterwalder, A., Pigneur, Y., Bernarda, G., & Smith, A. (2014). *Value Proposition Design: How to Create Products and Services Customers Want*. John Wiley & Sons.

Ries, E. (2011). *The Lean Startup: How Today’s Entrepreneurs Use Continuous Innovation to Create Radically Successful Businesses*. Crown Business.

Next.js Documentation. (2026). *Next.js App Router and Server Actions*. Vercel Inc. Diakses dari: https://nextjs.org/docs

Supabase Documentation. (2026). *Supabase Database and Authentication*. Supabase Pte. Ltd. Diakses dari: https://supabase.com/docs
