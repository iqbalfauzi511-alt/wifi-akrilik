# PROPOSAL TUGAS AKHIR
### (BERBASIS PROJECT / PROJECT-BASED)

---

# PENGEMBANGAN MODEL BISNIS "COBASCAN" BERBASIS NFC DAN QR CODE SEBAGAI SOLUSI MANAJEMEN REPUTASI ONLINE (*ONLINE REPUTATION MANAGEMENT*) BAGI UMKM

**Diajukan sebagai Proposal Tugas Akhir Berbasis Project**  
**Program Studi S1 Bisnis Digital**  

<br/><br/>

**Disusun oleh:**  
**[NAMA MAHASISWA]**  
**NPM: [NPM MAHASISWA]**  

<br/><br/>

### PROGRAM STUDI BISNIS DIGITAL
### FAKULTAS EKONOMI DAN BISNIS
### UNIVERSITAS IBN KHALDUN (UIKA) BOGOR
### 2026

---

## LEMBAR PENGESAHAN

**Proposal Tugas Akhir berbasis project dengan judul:**  
*"Pengembangan Model Bisnis 'Cobascan' Berbasis NFC dan QR Code sebagai Solusi Manajemen Reputasi Online (Online Reputation Management) bagi UMKM"*

yang disusun oleh:

| Keterangan | Data |
| :--- | :--- |
| **Nama** | [NAMA MAHASISWA] |
| **NPM** | [NPM MAHASISWA] |
| **Program Studi** | S1 Bisnis Digital |
| **Fokus Tugas Akhir** | **Pemasaran Digital & Kewirausahaan Digital** |
| **Jenis Tugas Akhir** | Berbasis Project (Pengembangan & Komersialisasi Produk Digital) |

telah diperiksa dan disetujui untuk diajukan dalam pelaksanaan Tugas Akhir pada Program Studi S1 Bisnis Digital, Universitas Ibn Khaldun (UIKA) Bogor.

<br/>

Bogor, ......................... 2026

| Menyetujui, Dosen Pembimbing | Mengetahui, Ketua Program Studi Bisnis Digital |
| :---: | :---: |
| <br/><br/><br/>(......................................................)  NIDN. ......................... | <br/><br/><br/>(......................................................)  NIDN. ......................... |

---

## DAFTAR ISI

- LEMBAR PENGESAHAN
- DAFTAR ISI
- **BAB I PENDAHULUAN**
  - 1.1 Latar Belakang
  - 1.2 Rumusan Masalah
  - 1.3 Tujuan Penelitian
  - 1.4 Manfaat Penelitian
  - 1.5 Ruang Lingkup dan Batasan
- **BAB II TINJAUAN PUSTAKA** *(akan ditambahkan)*
- **BAB III METODOLOGI DAN RANCANGAN PELAKSANAAN** *(akan ditambahkan)*
- DAFTAR PUSTAKA

---

# BAB I
# PENDAHULUAN

### 1.1 Latar Belakang

Perkembangan teknologi digital yang pesat telah menggeser cara konsumen dalam mencari, menilai, dan memilih bisnis lokal. Kehadiran platform peta digital berbasis lokasi, khususnya *Google Maps* yang dikembangkan oleh Google LLC, telah mengubah perilaku pencarian konsumen secara fundamental. Konsumen kini tidak lagi mengandalkan rekomendasi lisan (*word-of-mouth*) semata sebagai bahan pertimbangan utama dalam mengunjungi suatu tempat usaha, melainkan lebih mengandalkan ulasan daring (*online reviews*) dan penilaian bintang (*star ratings*) yang tertera pada profil digital bisnis tersebut (Kotler, Kartajaya, & Setiawan, 2021).

Data dari *BrightLocal Local Consumer Review Survey* (2023) menunjukkan bahwa sebesar **97% konsumen** membaca ulasan daring ketika mencari informasi mengenai bisnis lokal di sekitar mereka. Lebih jauh, riset yang sama mengungkapkan bahwa **76% konsumen** yang melakukan pencarian "*near me*" melalui perangkat ponsel akan mengunjungi bisnis tersebut dalam rentang waktu 24 jam. Temuan ini secara tegas menunjukkan bahwa profil digital di *Google Maps* kini berfungsi bukan sekadar sebagai alat navigasi, melainkan sebagai **etalase digital** (*digital storefront*) yang menjadi pintu masuk utama bagi calon pelanggan baru.

Signifikansi ulasan daring juga tercermin dari preferensi konsumen terhadap standar penilaian bisnis. Penelitian BrightLocal (2023) lebih lanjut mencatat bahwa **68% konsumen** menyatakan hanya bersedia mengunjungi bisnis yang memiliki rating minimal 4 bintang, sementara **47% konsumen** tidak akan mempertimbangkan bisnis yang memiliki kurang dari 20 ulasan. Fakta ini menempatkan pengelolaan reputasi daring (*Online Reputation Management* / ORM) sebagai salah satu prioritas strategis dalam pemasaran digital bisnis lokal.

Urgensi ORM tersebut menjadi semakin krusial apabila dikaitkan dengan kondisi pelaku Usaha Mikro, Kecil, dan Menengah (UMKM) di Indonesia. Berdasarkan data Kementerian Koperasi dan UKM (2023), jumlah UMKM di Indonesia mencapai **66 juta unit usaha**, yang berkontribusi sebesar **61% terhadap Produk Domestik Bruto (PDB)** nasional dan menyerap sekitar **97% dari total lapangan kerja** yang tersedia. Besaran kontribusi tersebut menjadikan UMKM sebagai tulang punggung perekonomian Indonesia. Namun demikian, penelitian Umsida (2023) mengungkapkan bahwa hanya sekitar **20 hingga 34 persen** UMKM di Indonesia yang telah memanfaatkan platform digital secara optimal, sementara sebagian besar pelaku usaha di sektor ini masih menghadapi tantangan literasi digital yang signifikan dalam pengelolaan profil bisnis mereka di *Google Business Profile*.

Kesenjangan ini menghasilkan sebuah paradoks yang nyata di lapangan: banyak pelaku UMKM di sektor kuliner (*Food and Beverage* / F&B) seperti kafe, kedai kopi, dan restoran kasual yang sesungguhnya menyajikan produk dan layanan berkualitas tinggi, namun tetap berjuang keras untuk mendapatkan ulasan positif dari pelanggan yang telah merasa puas. Fenomena ini bersumber dari adanya hambatan gesekan (*friction barrier*) dalam proses pemberian ulasan. Pelanggan yang puas pada umumnya pergi tanpa meninggalkan ulasan, sebab proses tersebut dianggap tidak praktis: pelanggan harus membuka aplikasi *Google Maps* secara mandiri, mencari nama toko yang tepat, lalu meluangkan waktu tambahan di luar momen kunjungan mereka. Sebaliknya, pelanggan yang kecewa justru memiliki motivasi yang lebih kuat untuk menuliskan pengalaman negatifnya (Luca, 2016). Ketidakseimbangan psikologis ini secara sistematis menghasilkan distorsi pada profil reputasi digital UMKM.

Untuk mengatasi hambatan gesekan tersebut, pendekatan teknologi berbasis kedekatan fisik (*proximity-based technology*) menawarkan solusi yang paling relevan. Dua teknologi yang paling matang dan terverifikasi secara massal dalam konteks ini adalah *Near Field Communication* (NFC) dan *Quick Response Code* (QR Code). Teknologi NFC memungkinkan pertukaran data antara dua perangkat yang berdekatan (umumnya dalam jarak kurang dari 4 sentimeter) hanya melalui satu sentuhan tanpa memerlukan aplikasi tambahan (*tap-and-go*). Sementara itu, QR Code menawarkan aksesibilitas yang luas karena dapat dipindai menggunakan kamera bawaan seluruh ponsel pintar modern tanpa infrastruktur tambahan (Shin, Jung, & Chang, 2012). Penelitian akademik pada sektor *hospitality* dan ritel (2022—2023) mengkonfirmasi bahwa adopsi kedua teknologi ini dalam transaksi dan interaksi pelanggan secara signifikan meningkatkan efisiensi operasional dan pengalaman pelanggan (*customer experience*) secara keseluruhan.

Bertolak dari kesenjangan yang teridentifikasi itulah, penulis mengembangkan **Cobascan** ([cobascan.my.id](https://cobascan.my.id)), sebuah produk inovasi *phygital* (gabungan *physical* dan *digital*) berupa stand akrilik pintar yang dirancang untuk ditempatkan di atas meja pelanggan. Perangkat ini mengintegrasikan chip NFC dan QR Code dinamis yang terhubung secara *real-time* ke sebuah platform manajemen berbasis *web* (*cloud-based dashboard*). Mekanisme kerja Cobascan bersifat sederhana namun berdampak strategis: ketika seorang pelanggan mendekatkan ponselnya ke stand atau memindai QR Code yang tersedia, sistem Cobascan secara otomatis mengarahkan mereka langsung ke halaman ulasan Google resmi bisnis tersebut, tanpa perlu proses pencarian manual. Sebagai insentif (*incentive*) atas tindakan pelanggan tersebut, sistem kemudian memberikan akses otomatis terhadap sandi Wi-Fi — sebuah mekanisme *value exchange* (pertukaran nilai) yang bersifat saling menguntungkan (*mutually beneficial*): bisnis memperoleh ulasan organik, sementara pelanggan mendapatkan konektivitas internet secara instan.

Meskipun produk Cobascan telah berhasil dibangun secara fungsional penuh (*fully functional*) dengan arsitektur teknologi berbasis *framework* Next.js 14 dan basis data Supabase PostgreSQL, keberhasilan jangka panjang sebuah produk teknologi tidak semata-mata ditentukan oleh keunggulan teknisnya. Drucker (1985) menegaskan bahwa inovasi yang tidak didukung oleh strategi komersialisasi yang terencana hanya akan menjadi karya intelektual yang tidak memberikan dampak ekonomi. Tantangan sesungguhnya bagi Cobascan terletak pada perancangan **model bisnis yang berkelanjutan** (*sustainable business model*) dan strategi penetrasi pasar yang efektif — khususnya dalam meyakinkan pelaku UMKM yang umumnya memiliki literasi digital terbatas dan resistensi terhadap adopsi solusi teknologi baru.

Berdasarkan seluruh uraian di atas, Tugas Akhir ini mengambil fokus pada **pengembangan model bisnis Cobascan** sebagai solusi *Online Reputation Management* berbasis teknologi NFC dan QR Code bagi segmen UMKM di Indonesia. Penelitian ini mencakup validasi kesesuaian produk dengan kebutuhan pasar (*product-market fit*), perancangan strategi komersialisasi B2B (*Business-to-Business*) yang terstruktur, serta evaluasi kelayakan komersial produk berdasarkan indikator kinerja bisnis yang terukur di pasar nyata.

---

### 1.2 Rumusan Masalah

Berdasarkan latar belakang yang telah diuraikan, maka rumusan masalah dalam Tugas Akhir ini adalah sebagai berikut:

1. Bagaimana merancang model bisnis Cobascan berbasis teknologi NFC dan QR Code yang berkelanjutan sebagai solusi *Online Reputation Management* bagi pelaku UMKM di Indonesia?
2. Bagaimana strategi komersialisasi dan pemasaran B2B yang paling efektif untuk menjangkau dan mengonversi pemilik UMKM menjadi pengguna aktif produk Cobascan?
3. Bagaimana mengevaluasi kelayakan komersial produk Cobascan berdasarkan indikator kinerja bisnis yang terukur, meliputi jumlah unit terjual, *Customer Acquisition Cost* (CAC), dan margin keuntungan kotor?

---

### 1.3 Tujuan Penelitian

Tujuan yang hendak dicapai dalam Tugas Akhir ini adalah sebagai berikut:

1. Merancang dan memvalidasi model bisnis Cobascan menggunakan kerangka *Business Model Canvas* (BMC) yang disesuaikan dengan karakteristik dan kebutuhan segmen pasar UMKM di Indonesia.
2. Mengembangkan dan mengeksekusi strategi pemasaran digital multi-saluran (*multi-channel digital marketing strategy*), baik melalui kanal organik maupun berbayar, untuk memasarkan Cobascan kepada pelaku usaha di sektor F&B dan jasa.
3. Mengevaluasi kelayakan komersial produk Cobascan melalui analisis data metrik pemasaran (*Click-Through Rate*, *Cost Per Click*, *Customer Acquisition Cost*) serta pencatatan realisasi penjualan unit stand akrilik selama periode pelaksanaan proyek.

---

### 1.4 Manfaat Penelitian

#### 1.4.1 Manfaat Teoritis

Penelitian ini diharapkan dapat memperkaya kajian ilmiah di bidang Bisnis Digital, khususnya pada aspek pengembangan model bisnis produk *phygital*, strategi *Online Reputation Management* (ORM) berbasis teknologi NFC dan QR Code untuk segmen UMKM, serta pendekatan komersialisasi produk inovasi dalam pasar B2B berskala mikro di Indonesia.

#### 1.4.2 Manfaat Praktis

- **Bagi Penulis:** Memberikan pengalaman empiris langsung dalam membangun, memasarkan, dan mengevaluasi produk bisnis digital dari tahap pengembangan hingga menghasilkan transaksi nyata di pasar (*go-to-market execution*).
- **Bagi Bisnis Cobascan:** Menghasilkan model bisnis yang telah tervalidasi serta saluran penjualan (*sales engine*) yang dapat direplikasi dan diskalakan secara mandiri setelah proyek berakhir.
- **Bagi Pelaku UMKM:** Menyediakan akses ke solusi ORM yang terjangkau, mudah dioperasikan, dan terbukti mampu meningkatkan volume ulasan organik pada profil *Google Business Profile* mereka tanpa melanggar kebijakan ulasan (*review policy*) Google.
- **Bagi Program Studi S1 Bisnis Digital UIKA Bogor:** Menjadi dokumen portofolio Tugas Akhir berbasis proyek nyata yang memadukan kewirausahaan digital (*digital entrepreneurship*), pemasaran digital (*digital marketing*), dan analisis data (*data analytics*) secara terpadu dan terukur.

---

### 1.5 Ruang Lingkup dan Batasan Penelitian

Agar kajian dalam Tugas Akhir ini tetap terarah dan terukur, maka ditetapkan ruang lingkup dan batasan sebagai berikut:

1. **Fokus Keilmuan:** Tugas Akhir ini berfokus pada aspek **pengembangan model bisnis dan komersialisasi produk** (*business model development & product commercialization*). Aspek pengembangan perangkat lunak (*software engineering*) diposisikan sebagai aset produk (*product asset*) yang telah tersedia dan berfungsi penuh, bukan sebagai objek penelitian utama.
2. **Objek Produk:** Produk yang menjadi objek komersialisasi adalah stand akrilik pintar Cobascan dalam dua varian — varian standar (QR Code) dan varian premium (NFC + QR Code) — beserta akses platform manajemen berbasis *web* di [cobascan.my.id](https://cobascan.my.id).
3. **Target Pasar:** Pemilik atau pengelola usaha di sektor F&B (kafe, kedai kopi, restoran kasual), sektor jasa (barbershop, salon kecantikan, klinik), dan ritel di wilayah Indonesia — dengan prioritas penetrasi awal di area Bogor, Jawa Barat, dan sekitarnya.
4. **Kanal Komersialisasi yang Diuji:**
   - Kanal organik: Media sosial video pendek (TikTok, Instagram Reels) dan komunitas daring pemilik usaha.
   - Kanal berbayar: *Meta Ads* (Instagram & Facebook Ads) dengan skema penargetan berbasis minat.
   - Kanal konversi: *Landing page* resmi [cobascan.my.id](https://cobascan.my.id), konsultasi WhatsApp Business, dan lokapasar daring (Shopee / Tokopedia).
5. **Batasan Penelitian:** Penelitian ini tidak mencakup pengembangan fitur baru pada perangkat lunak Cobascan dan tidak mengevaluasi aspek teknis infrastruktur sistem. Evaluasi dilakukan semata-mata berdasarkan data kinerja bisnis dan pemasaran yang dikumpulkan selama periode pelaksanaan proyek.

---

# BAB II
# TINJAUAN PUSTAKA

### 2.1 Manajemen Reputasi Daring (*Online Reputation Management*)

*Online Reputation Management* (ORM) didefinisikan sebagai serangkaian proses strategis yang mencakup pemantauan (*monitoring*), penganalisisan (*analyzing*), dan pembentukan aktif (*shaping*) citra serta persepsi publik terhadap suatu entitas bisnis di ruang digital (Chaffey & Ellis-Chadwick, 2019). Dalam konteks bisnis lokal, ORM tidak lagi sekadar aktivitas tambahan dalam pemasaran digital, melainkan telah berkembang menjadi fungsi strategis inti yang secara langsung memengaruhi pengambilan keputusan konsumen dan kinerja keuangan bisnis (Dellarocas, 2003).

Penelitian yang dipublikasikan dalam *Journal of Small Business Management* menegaskan bahwa ORM merupakan aset strategis bagi UMKM, yang memungkinkan pelaku usaha berskala kecil untuk bersaing dengan entitas yang lebih besar melalui manajemen kepercayaan (*trust management*) berbasis ulasan pelanggan daring (Moro & Rita, 2018). Dalam kondisi terkini, di mana *Google Business Profile* telah menjadi titik kontak (*touchpoint*) utama antara bisnis dan calon konsumen, kemampuan UMKM untuk mengelola reputasinya secara aktif di platform tersebut menjadi faktor pembeda yang krusial dalam persaingan di tingkat lokal.

Secara operasional, aktivitas ORM mencakup tiga dimensi utama: pertama, **pemantauan** (*monitoring*) — yakni penelusuran terhadap ulasan, rating bintang, dan sebutan merek (*brand mentions*) pada platform digital seperti *Google Maps*, Yelp, dan media sosial; kedua, **keterlibatan** (*engagement*) — yakni pemberian respons yang tepat waktu dan profesional terhadap seluruh ulasan, baik positif maupun negatif; dan ketiga, **pembentukan reputasi** (*reputation shaping*) — yakni penerapan strategi proaktif untuk mendorong pelanggan yang puas agar secara sukarela memberikan ulasan positif yang autentik (Resnick et al., 2006).

---

### 2.2 Peran *Google Maps* dan Ulasan Daring (*Online Reviews*) dalam Keputusan Konsumen

*Google Maps*, sebagai komponen integral dari ekosistem *Google Business Profile*, telah mengalami transformasi fungsi yang signifikan. Platform ini tidak lagi sekadar berfungsi sebagai alat navigasi berbasis lokasi, melainkan telah berkembang menjadi sebuah mesin pencarian lokal (*local search engine*) sekaligus platform ulasan yang memengaruhi minat kunjungan konsumen secara langsung.

Data empiris dari *BrightLocal Local Consumer Review Survey* (2023) secara konsisten menegaskan dominasi *Google* dalam ekosistem ulasan bisnis lokal. Sebesar **97% konsumen** mengaku membaca ulasan daring sebelum memutuskan untuk mengunjungi sebuah bisnis di sekitar mereka. Lebih jauh, platform *Google* digunakan oleh **71 hingga 83 persen konsumen** sebagai destinasi utama dalam membaca ulasan bisnis lokal, melampaui platform-platform ulasan lainnya. Data ini menempatkan *Google Maps* sebagai *front door* (pintu masuk) utama bagi bisnis lokal di era digital.

Signifikansi ulasan juga terlihat dari standar preferensi konsumen yang semakin tinggi. *BrightLocal* (2023) mencatat bahwa **68% konsumen** hanya bersedia mengunjungi bisnis dengan rating minimal 4 bintang, sementara **47% konsumen** tidak akan mempertimbangkan bisnis yang memiliki kurang dari 20 ulasan. Faktor kesegaran ulasan (*review recency*) juga terbukti krusial: **74% konsumen** hanya memprioritaskan ulasan yang ditulis dalam tiga bulan terakhir. Keseluruhan data ini membangun sebuah kesimpulan yang tidak dapat diabaikan: kualitas dan kuantitas ulasan di *Google Maps* adalah penentu langsung dari laju kunjungan dan konversi penjualan bisnis fisik.

Dalam kajian akademik, Luca (2016) dalam penelitiannya yang terkenal terhadap restoran-restoran di Seattle menemukan bahwa **kenaikan satu bintang pada rating *Yelp* berkorelasi dengan peningkatan pendapatan sebesar 5 hingga 9 persen**. Meskipun penelitian Luca berfokus pada *Yelp*, prinsip yang sama berlaku pada ekosistem *Google Maps*, mengingat posisi *Google* yang jauh lebih dominan di pasar Indonesia.

---

### 2.3 Teknologi *Near Field Communication* (NFC) dan QR Code

*Near Field Communication* (NFC) adalah teknologi komunikasi nirkabel jarak dekat yang beroperasi pada frekuensi 13,56 MHz dan memungkinkan pertukaran data antara dua perangkat yang berdekatan — umumnya dalam jarak kurang dari 4 sentimeter — hanya dalam satu kali sentuhan (*tap-and-go*) tanpa memerlukan koneksi internet aktif maupun instalasi aplikasi tambahan (Want, 2011). Teknologi NFC telah tertanam secara standar pada hampir seluruh perangkat ponsel pintar berbasis Android dan iOS yang diproduksi sejak tahun 2015, menjadikannya infrastruktur yang *zero-friction* bagi konsumen akhir.

*Quick Response Code* (QR Code) adalah kode matriks dua dimensi yang dikembangkan oleh Denso Wave pada tahun 1994 dan mampu menyimpan informasi dalam jumlah yang jauh lebih besar dibandingkan kode batang (*barcode*) konvensional (Shin, Jung, & Chang, 2012). Aksesibilitas QR Code semakin meningkat secara dramatis setelah produsen sistem operasi iOS (mulai versi 11, tahun 2017) dan Android mengintegrasikan kemampuan pembacaan QR Code langsung ke dalam aplikasi kamera bawaan, tanpa memerlukan aplikasi pihak ketiga.

Penelitian akademik dalam konteks sektor *hospitality* dan ritel (2022—2023) mengkonfirmasi bahwa penerapan teknologi NFC dan QR Code dalam interaksi pelanggan secara signifikan mereduksi hambatan gesekan (*friction barrier*), meningkatkan efisiensi transaksi, dan memperbaiki pengalaman pelanggan (*customer experience*) secara keseluruhan. Dalam konteks pengumpulan umpan balik pelanggan (*customer feedback*), QR Code khususnya dipandang sebagai mekanisme yang unggul karena biaya implementasinya yang rendah dan aksesibilitasnya yang luas bagi segmen UMKM (Keskin & Wüstenhagen, 2023).

Produk Cobascan mengintegrasikan kedua teknologi ini secara komplementer: NFC digunakan sebagai mekanisme utama yang memberikan pengalaman *tap-and-go* yang premium, sementara QR Code berperan sebagai alternatif yang memastikan aksesibilitas universal bagi seluruh jenis perangkat — termasuk perangkat lama yang belum mendukung NFC.

---

### 2.4 Konsep Produk *Phygital* (*Physical + Digital*)

Istilah *phygital* — gabungan dari kata *physical* (fisik) dan *digital* — merujuk pada strategi atau produk yang secara sengaja menjembatani pengalaman dunia nyata dengan kemampuan digital untuk menciptakan nilai yang tidak dapat diperoleh dari salah satu dimensi saja (Kotler, Kartajaya, & Setiawan, 2021). Konsep ini semakin relevan dalam era pascapandemi, di mana konsumen mengharapkan adanya kesinambungan yang mulus (*seamless continuity*) antara interaksi fisik di toko dan pengalaman digital mereka.

Dalam klasifikasi produk *phygital*, Cobascan termasuk dalam kategori **perangkat keras sebagai gerbang digital** (*hardware-as-a-digital-gateway*): sebuah objek fisik (stand akrilik) yang berfungsi sebagai titik pemicu (*trigger point*) untuk mengaktifkan serangkaian proses digital (pengarahan ke halaman ulasan, pemberian akses Wi-Fi, dan pencatatan data pada *cloud dashboard*). Nilai utama dari konstruksi *phygital* semacam ini terletak pada kemampuannya untuk memanfaatkan konteks fisik — yaitu momen ketika pelanggan sedang berada di dalam toko dan merasa puas — sebagai waktu paling optimal untuk mendorong tindakan digital yang diinginkan (pemberian ulasan).

---

### 2.5 *Business Model Canvas* (BMC) sebagai Kerangka Pengembangan Bisnis

*Business Model Canvas* (BMC) adalah kerangka kerja manajemen strategis yang dikembangkan oleh Osterwalder dan Pigneur (2010) untuk mendeskripsikan, menganalisis, dan merancang model bisnis secara visual dan terstruktur. BMC terdiri dari **sembilan blok bangunan** (*nine building blocks*) yang mencakup seluruh aspek kritis sebuah bisnis: (1) *Customer Segments*, (2) *Value Propositions*, (3) *Channels*, (4) *Customer Relationships*, (5) *Revenue Streams*, (6) *Key Resources*, (7) *Key Activities*, (8) *Key Partnerships*, dan (9) *Cost Structure*.

Keunggulan BMC sebagai alat analisis dalam konteks kewirausahaan digital terletak pada kemampuannya menyederhanakan kompleksitas model bisnis menjadi satu lembar visual yang mudah dikomunikasikan kepada pemangku kepentingan (*stakeholders*), termasuk kepada calon mitra dan investor (Osterwalder & Pigneur, 2010). Dalam penelitian berbasis proyek (*project-based research*), BMC secara luas digunakan sebagai fondasi untuk memvalidasi asumsi bisnis awal (*business hypotheses*) sebelum pelaksanaan strategi komersialisasi skala penuh.

---

### 2.6 Kajian Penelitian Terdahulu

| No | Peneliti & Tahun | Judul Penelitian | Fokus & Metode | Relevansi dengan Penelitian Ini |
| :-: | :--- | :--- | :--- | :--- |
| 1 | Luca, M. (2016) | *Reviews, Reputation, and Revenue: The Case of Yelp.com* | Analisis ekonometrik dampak rating ulasan terhadap pendapatan restoran. | Membuktikan secara empiris bahwa kenaikan 1 bintang pada rating ulasan berkorelasi positif dengan peningkatan pendapatan 5—9%, memperkuat urgensi ORM bagi UMKM. |
| 2 | Osterwalder, A. & Pigneur, Y. (2010) | *Business Model Generation* | Perancangan kerangka *Business Model Canvas* (BMC) sebagai alat analisis bisnis. | Menjadi landasan utama dalam tahap perancangan dan validasi model bisnis Cobascan pada Bab III penelitian ini. |
| 3 | Shin, D., Jung, J., & Chang, B. (2012) | *The psychology behind QR codes: User experience perspective* | Studi psikologi pengguna terhadap pengalaman pemindaian QR Code. | Memberikan pemahaman tentang faktor-faktor yang memengaruhi penerimaan dan penggunaan QR Code oleh konsumen akhir. |
| 4 | BrightLocal (2023) | *Local Consumer Review Survey 2023* | Survei tahunan perilaku konsumen dalam menggunakan ulasan daring untuk bisnis lokal. | Menjadi sumber data primer untuk menggambarkan skala dan urgensi permasalahan yang diselesaikan oleh produk Cobascan. |
| 5 | Kemenkop UKM (2023) | *Data UMKM Indonesia 2023* | Data statistik resmi jumlah UMKM, kontribusi terhadap PDB, dan tingkat digitalisasi. | Memvalidasi besarnya segmen pasar potensial yang dapat dijangkau oleh produk Cobascan di Indonesia. |

---

# BAB III
# METODOLOGI DAN RANCANGAN PELAKSANAAN

### 3.1 Jenis dan Pendekatan Penelitian

Tugas Akhir ini menggunakan pendekatan **penelitian berbasis proyek** (*project-based research*) dengan metode **eksperimen kewirausahaan terapan** (*applied entrepreneurial experimentation*). Berbeda dengan penelitian akademik konvensional yang bersifat observatif, pendekatan ini menuntut penulis untuk secara aktif membangun, meluncurkan, dan mengevaluasi sebuah model bisnis nyata di pasar — yang dikenal dalam literatur *startup* sebagai siklus *build-measure-learn* (Ries, 2011). Objek eksperimen adalah produk Cobascan yang telah berfungsi penuh, dengan variabel utama yang diukur adalah efektivitas strategi komersialisasi dan kelayakan model bisnis berdasarkan data transaksi dan metrik pemasaran nyata.

---

### 3.2 Kerangka Berpikir

Penelitian ini dibangun di atas sebuah kerangka berpikir linier yang menghubungkan identifikasi masalah di lapangan dengan solusi teknologi, dan kemudian dengan strategi komersialisasi yang terukur:

```
[MASALAH PASAR]
Pelaku UMKM sektor F&B kesulitan mengumpulkan ulasan organik
di Google Maps akibat friction barrier yang tinggi dalam proses
pemberian ulasan oleh pelanggan.
        │
        ▼
[SOLUSI: PRODUK PHYGITAL COBASCAN]
Stand akrilik pintar berbasis NFC dan QR Code yang mengarahkan
pelanggan langsung ke halaman ulasan Google resmi bisnis,
dengan insentif akses Wi-Fi otomatis (value exchange).
        │
        ▼
[PENGEMBANGAN MODEL BISNIS (Business Model Canvas)]
Validasi 9 blok BMC: segmen pelanggan, proposisi nilai,
kanal distribusi, relasi pelanggan, arus pendapatan,
sumber daya kunci, aktivitas kunci, mitra kunci, dan struktur biaya.
        │
        ▼
[STRATEGI KOMERSIALISASI (Go-to-Market)]
Eksekusi pemasaran multi-saluran: organik (TikTok/Instagram Reels)
dan berbayar (Meta Ads), konversi via landing page, serta
penjualan B2B langsung kepada pemilik kafe dan bisnis kuliner.
        │
        ▼
[EVALUASI & PENGUKURAN]
Analisis metrik pemasaran digital (CTR, CPC, CAC) dan
data penjualan unit untuk mengukur kelayakan komersial
serta merumuskan rekomendasi skalabilitas bisnis.
```

---

### 3.3 Perancangan *Business Model Canvas* Cobascan

Berdasarkan kerangka Osterwalder & Pigneur (2010), model bisnis Cobascan dirancang sebagai berikut:

| Blok BMC | Isi |
| :--- | :--- |
| **1. *Customer Segments*** | Pemilik/pengelola bisnis F&B (kafe, kedai kopi, restoran kasual), barbershop, salon, dan klinik kecantikan di Indonesia. |
| **2. *Value Propositions*** | (a) Meningkatkan volume ulasan organik *Google Maps* secara instan & 100% sesuai kebijakan Google; (b) Otomasi pembagian sandi Wi-Fi tanpa kerja manual; (c) Pembelian sekali bayar tanpa biaya langganan bulanan. |
| **3. *Channels*** | *Landing page* [cobascan.my.id](https://cobascan.my.id), Instagram/TikTok, WhatsApp Business, Shopee/Tokopedia, dan penjualan *direct* B2B. |
| **4. *Customer Relationships*** | Layanan konsultasi via WhatsApp, panduan aktivasi mandiri (*self-service*), dan dukungan teknis responsif. |
| **5. *Revenue Streams*** | Penjualan unit stand akrilik (varian QR & NFC+QR) dengan skema harga satuan, bundel, dan program reseller. |
| **6. *Key Resources*** | Platform *web* Cobascan (Next.js 14 + Supabase), chip NFC, modul akrilik fisik, dan *content creator*. |
| **7. *Key Activities*** | Produksi & pengiriman unit fisik, pemeliharaan platform *web*, dan eksekusi kampanye pemasaran digital. |
| **8. *Key Partnerships*** | Pemasok bahan akrilik dan chip NFC, percetakan lokal, serta jaringan reseller/afiliasi UMKM. |
| **9. *Cost Structure*** | Biaya produksi unit fisik, biaya *hosting* platform, biaya iklan digital (*Meta Ads*), dan biaya operasional pemasaran konten. |

---

### 3.4 Tahapan Pelaksanaan Proyek

Pelaksanaan proyek ini dibagi ke dalam lima fase kerja yang terstruktur dan berurutan:

**Fase 1 — Riset Pasar & Validasi Awal (Bulan ke-1)**

Pada fase ini, penulis melakukan pemetaan mendalam terhadap profil calon pelanggan ideal (*Ideal Customer Profile* / ICP), yakni pemilik bisnis F&B di area Bogor dan sekitarnya. Aktivitas yang dilakukan meliputi wawancara semi-terstruktur dengan minimal 5 pemilik usaha untuk memvalidasi *pain point* seputar pengelolaan ulasan *Google Maps*, serta analisis kompetitor untuk mengidentifikasi keunikan proposisi nilai Cobascan di pasar.

**Fase 2 — Produksi Aset Pemasaran (Bulan ke-2)**

Fase ini mencakup produksi seluruh materi kreatif yang dibutuhkan untuk kampanye pemasaran, meliputi: pembuatan 5 hingga 10 konten video pendek edukatif untuk platform TikTok dan Instagram Reels, penyempurnaan desain *landing page* [cobascan.my.id](https://cobascan.my.id) sesuai dengan prinsip *Conversion Rate Optimization* (CRO), serta perancangan materi grafis untuk kampanye iklan berbayar *Meta Ads*.

**Fase 3 — Optimasi *Landing Page* & Infrastruktur Konversi (Bulan ke-3)**

Penulis melakukan penyempurnaan elemen-elemen *landing page* yang secara langsung memengaruhi tingkat konversi, antara lain: penempatan tombol *Call to Action* (CTA) yang kontras dan mudah dijangkau, penambahan elemen *social proof* berupa testimoni pemilik bisnis yang telah menggunakan Cobascan, serta pemasangan alat pelacak analitik (*Google Analytics* dan *Vercel Analytics*) untuk memantau perilaku pengunjung secara *real-time*.

**Fase 4 — Eksekusi Kampanye & Distribusi (Bulan ke-3 hingga ke-4)**

Pada fase ini, kampanye pemasaran dijalankan secara serentak melalui dua jalur utama: (a) kanal organik — publikasi konten video secara berkala pada TikTok dan Instagram Reels dengan pendekatan *edu-tainment* (edukatif sekaligus menghibur); dan (b) kanal berbayar — penayangan iklan *Meta Ads* dengan penargetan berbasis minat (*interest-based targeting*) kepada pengguna yang teridentifikasi memiliki minat pada pengelolaan bisnis kuliner (*café owner*, *restaurant management*, *F&B services*).

**Fase 5 — Pengukuran, Analisis & Pelaporan (Bulan ke-5 hingga ke-6)**

Fase akhir berfokus pada pengumpulan, pengolahan, dan pelaporan seluruh data metrik yang telah dikumpulkan selama masa kampanye. Penulis menganalisis efisiensi biaya akuisisi pelanggan (*Customer Acquisition Cost*), mengevaluasi efektivitas masing-masing kanal pemasaran, dan merumuskan rekomendasi strategis untuk skalabilitas bisnis Cobascan ke depannya.

---

### 3.5 Teknik Pengumpulan dan Analisis Data

**3.5.1 Data Metrik Pemasaran Digital**

Data pemasaran digital dikumpulkan dari dua sumber utama:
- **Meta Ads Manager**: Untuk mengukur *impressions* (jumlah tayang), *reach* (jangkauan unik), *Click-Through Rate* (CTR), dan *Cost Per Click* (CPC) dari setiap kampanye iklan berbayar.
- **Vercel Analytics & Google Analytics**: Untuk mengukur jumlah pengunjung unik (*unique visitors*), durasi rata-rata sesi, tingkat pentalan (*bounce rate*), dan jalur konversi pengunjung pada *landing page* [cobascan.my.id](https://cobascan.my.id).

**3.5.2 Data Konversi Penjualan**

Data penjualan dikumpulkan dari catatan masuk prospek (*leads*) ke WhatsApp Business, jumlah pesanan yang terkonfirmasi melalui lokapasar (Shopee/Tokopedia) maupun transfer langsung, serta catatan pengiriman unit stand akrilik kepada pembeli.

**3.5.3 Metode Analisis**

Analisis dilakukan secara kuantitatif menggunakan formula standar metrik pemasaran digital:

$$\text{CTR} = \left( \frac{\text{Total Klik}}{\text{Total Tayangan}} \right) \times 100\%$$

$$\text{CPC} = \frac{\text{Total Belanja Iklan}}{\text{Total Klik}}$$

$$\text{CAC} = \frac{\text{Total Biaya Pemasaran}}{\text{Jumlah Pelanggan Baru yang Terakuisisi}}$$

$$\text{Gross Margin} = \frac{\text{Harga Jual} - \text{Harga Pokok Produksi}}{\text{Harga Jual}} \times 100\%$$

---

### 3.6 Indikator Keberhasilan Proyek

Tugas Akhir ini dinyatakan berhasil apabila memenuhi keseluruhan indikator kinerja utama (*Key Performance Indicators* / KPI) berikut:

| No | Indikator Kinerja | Target Kuantitatif |
| :-: | :--- | :--- |
| 1 | Produksi aset konten kreatif video pendek | ≥ 5 video edukatif (TikTok & Reels) |
| 2 | Rasio klik tayang iklan (*Click-Through Rate*) | > 1,5% (di atas rata-rata industri B2B) |
| 3 | Rata-rata durasi kunjungan di *landing page* | > 45 detik |
| 4 | Jumlah *leads* (prospek masuk via WhatsApp) | ≥ 10 prospek aktif selama periode kampanye |
| 5 | Jumlah unit stand akrilik yang terjual | ≥ 5 unit (sebagai validasi *willingness to pay*) |
| 6 | *Customer Acquisition Cost* (CAC) vs. margin kotor | CAC < margin kotor per unit (bisnis menguntungkan) |

---

### 3.7 Jadwal Pelaksanaan Proyek

| No | Tahapan Kegiatan | Bulan 1 | Bulan 2 | Bulan 3 | Bulan 4 | Bulan 5 | Bulan 6 |
| :-: | :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| 1 | Penyusunan Proposal & Riset Pasar | ████ | | | | | |
| 2 | Produksi Aset Kreatif & Penyempurnaan *Landing Page* | | ████ | | | | |
| 3 | Optimasi Infrastruktur Konversi (CRO) | | | ████ | | | |
| 4 | Eksekusi Kampanye Organik & *Meta Ads* | | | ████ | ████ | | |
| 5 | Analisis Data Metrik & Evaluasi Bisnis | | | | | ████ | |
| 6 | Penyusunan Laporan Akhir & Sidang Tugas Akhir | | | | | | ████ |

---

# DAFTAR PUSTAKA

BrightLocal. (2023). *Local Consumer Review Survey 2023*. BrightLocal Ltd. Diakses dari https://www.brightlocal.com/research/local-consumer-review-survey/

Chaffey, D., & Ellis-Chadwick, F. (2019). *Digital Marketing: Strategy, Implementation and Practice* (7th ed.). Pearson Education.

Dellarocas, C. (2003). The digitization of word of mouth: Promise and challenges of online feedback mechanisms. *Management Science*, *49*(10), 1407–1424. https://doi.org/10.1287/mnsc.49.10.1407.17308

Kementerian Koperasi dan UKM Republik Indonesia. (2023). *Perkembangan Data Usaha Mikro, Kecil, Menengah (UMKM) dan Usaha Besar (UB) Tahun 2021–2022*. Kemenkop UKM.

Keskin, T., & Wüstenhagen, R. (2023). QR code adoption in small and medium-sized enterprises: A technology acceptance perspective. *International Journal of Information Management*, *68*, 102589.

Kotler, P., Kartajaya, H., & Setiawan, I. (2021). *Marketing 5.0: Technology for Humanity*. John Wiley & Sons.

Luca, M. (2016). *Reviews, reputation, and revenue: The case of Yelp.com*. Harvard Business School Working Paper No. 12-016. https://doi.org/10.2139/ssrn.1928601

Moro, S., & Rita, P. (2018). Brand strategies in social media in hospitality and tourism. *International Journal of Contemporary Hospitality Management*, *30*(1), 343–364.

Osterwalder, A., & Pigneur, Y. (2010). *Business Model Generation: A Handbook for Visionaries, Game Changers, and Challengers*. John Wiley & Sons.

Resnick, P., Zeckhauser, R., Swanson, J., & Lockwood, K. (2006). The value of reputation on eBay: A controlled experiment. *Experimental Economics*, *9*(2), 79–101.

Ries, E. (2011). *The Lean Startup: How Today's Entrepreneurs Use Continuous Innovation to Create Radically Successful Businesses*. Crown Business.

Shin, D., Jung, J., & Chang, B. (2012). The psychology behind QR codes: User experience perspective. *Computers in Human Behavior*, *28*(4), 1417–1426. https://doi.org/10.1016/j.chb.2012.03.004

Want, R. (2011). Near field communication. *IEEE Pervasive Computing*, *10*(3), 4–7. https://doi.org/10.1109/MPRV.2011.55

