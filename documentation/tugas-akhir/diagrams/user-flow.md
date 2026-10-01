# Alur Pengguna dan Siklus Operasional Cobascan (User Journey & Lifecycle)

Diagram ini mengilustrasikan alur interaksi dari tiga aktor utama: Administrator, Pemilik Bisnis (Owner), dan Pengunjung (Visitor).

```mermaid
sequenceDiagram
    autonumber
    actor Admin as Admin Cobascan
    actor Owner as Pemilik Usaha (Owner)
    actor Visitor as Pengunjung (Tamu)
    participant HW as Stand Akrilik (NFC/QR)
    participant Web as Sistem Web Cobascan
    participant DB as Supabase DB
    participant GMaps as Google Maps

    %% Fase 1: Batch & Cetak
    rect rgb(240, 249, 255)
    Note over Admin, HW: Fase 1 — Produksi Batch & Distribusi Fisik
    Admin->>Web: Akses /admin/qr -> Generate Batch (misal 50 unit)
    Web->>DB: INSERT qr_codes (status: 'blank', batch_code)
    Admin->>Web: Export SVG / PNG / QR Codes
    Admin->>HW: Cetak stiker QR & tanam chip NFC pada akrilik
    Admin->>Owner: Stand fisik dijual/didistribusikan ke Owner (status: 'sold')
    end

    %% Fase 2: Aktivasi oleh Owner
    rect rgb(245, 243, 255)
    Note over Owner, DB: Fase 2 — Aktivasi Perangkat Pertama Kali di Meja
    Owner->>HW: Scan QR pertama kali di toko
    HW->>Web: Buka /activate/[code]
    Owner->>Web: Input No WA, Buat PIN 6 Angka, Nama Bisnis, Link Maps, Sandi Wi-Fi
    Web->>DB: INSERT users (role: 'customer', wa, pin_hash), businesses, UPDATE qr_codes (status: 'active')
    Web-->>Owner: Redirect otomatis ke Dashboard Utama (/dashboard)
    end

    %% Fase 3: Pengunjung Scan di Meja
    rect rgb(254, 252, 232)
    Note over Visitor, GMaps: Fase 3 — Interaksi Pengunjung di Meja
    Visitor->>HW: Tap NFC atau Scan QR di meja kafe/resto
    HW->>Web: Buka halaman /q/[code]
    Web->>DB: Log scan event (scan_logs)
    Web-->>Visitor: Tampilkan formulir rating bintang 1–5
    
    alt Pengunjung Pilih Bintang 4 atau 5 (Promoter)
        Visitor->>Web: Klik Bintang 4 / 5
        Web->>GMaps: Auto-redirect ke link ulasan langsung Google Maps
        Visitor->>GMaps: Kirim ulasan positif
        Visitor->>Web: Kembali ke browser (tab Cobascan)
        Web-->>Visitor: Verifikasi 5 detik -> Buka Sandi Wi-Fi meja (One-tap Copy)
    else Pengunjung Pilih Bintang 1 atau 2 (Detractor)
        Visitor->>Web: Klik Bintang 1 / 2
        Web-->>Visitor: Buka formulir keluhan & masukan privat
        Visitor->>Web: Kirim kritik (makanan lama, AC mati, dll)
        Web->>DB: INSERT customer_feedback (Nomor WA Owner TIDAK pernah dibocorkan)
        Web-->>Visitor: Tampilkan ucapan terima kasih atas masukan
    end
    end

    %% Fase 4: Monitoring Owner
    rect rgb(240, 253, 244)
    Note over Owner, DB: Fase 4 — Pemilik Memantau & Menindaklanjuti
    Owner->>Web: Buka /login -> Masukkan No WA & PIN
    Web->>DB: Verifikasi nomor WA & validasi hash PIN
    Web-->>Owner: Tampilkan Dashboard (/dashboard)
    Note over Owner, Web: Owner melihat statistik scan, mengatur Wi-Fi, dan membaca inbox keluhan tamu
    Owner->>Visitor: Klik tombol 'Hubungi via WA' untuk menindaklanjuti keluhan tamu
    end
```
