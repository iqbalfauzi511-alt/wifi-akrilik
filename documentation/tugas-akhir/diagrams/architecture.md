# Arsitektur Sistem Cobascan (System Architecture)

Diagram ini mengilustrasikan integrasi antara komponen hardware fisik (*phygital*), antarmuka web Next.js, database Supabase, dan lapisan otentikasi.

```mermaid
graph TB
    subgraph Hardware_Phygital ["Lapisan Fisik (Hardware / Phygital Touchpoint)"]
        A1["Stand Akrilik Meja"]
        A2["NFC Chip (NTAG213)"]
        A3["Dynamic QR Code (CS-XXXXXX)"]
        A1 --- A2
        A1 --- A3
    end

    subgraph Client_Devices ["Lapisan Pengguna (Client Devices)"]
        B1["Smartphone Pengunjung<br/>(iOS / Android Browser)"]
        B2["Smartphone / Laptop Pemilik<br/>(Owner Dashboard)"]
        B3["Laptop Administrator<br/>(Cobascan Ops)"]
    end

    subgraph Vercel_Nextjs ["Platform Web & Server (Next.js 14 App Router on Vercel)"]
        C1["Halaman Pengunjung<br/>/q/[code]"]
        C2["Halaman Aktivasi Perangkat<br/>/activate/[code]"]
        C3["Owner Dashboard<br/>/dashboard (Bento View)"]
        C4["Admin Platform<br/>/admin (Batch & Devices)"]
        C5["Middleware Auth Guard<br/>(Session & Role Evaluator)"]
        C6["Server Actions & API Routes<br/>(Owner Auth, Maps, Feedback)"]
    end

    subgraph Data_Layer ["Lapisan Penyimpanan Data (Supabase / PostgreSQL)"]
        D1["Supabase PostgreSQL Cloud"]
        D2["Connection Pooler (PgBouncer)"]
        D3["Drizzle ORM Schema & Relations"]
        D4["Local Fallback (PGlite Offline)"]
    end

    subgraph External_Services ["Layanan Eksternal"]
        E1["Google Maps WriteReview API / URL"]
        E2["WhatsApp Intent (wa.me link)"]
    end

    %% Interactions
    A2 -- "Tap NFC" --> B1
    A3 -- "Scan QR" --> B1
    
    B1 -- "HTTP GET /q/[code]" --> C1
    B1 -- "Rating 4-5 Redirect" --> E1
    B1 -- "Rating 1-2 Private Feedback" --> C6
    
    B2 -- "Aktivasi Stand Pertama" --> C2
    B2 -- "Login WA + PIN" --> C3
    B2 -- "Follow-up Tamu via WA" --> E2
    
    B3 -- "Kelola Batch & QR" --> C4
    
    C1 & C2 & C3 & C4 --> C5
    C5 --> C6
    C6 --> D3
    D3 --> D2
    D2 --> D1
    D3 -. "Dev Fallback" .-> D4
```
