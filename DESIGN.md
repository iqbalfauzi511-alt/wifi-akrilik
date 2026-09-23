# Cobascan Design Direction (DESIGN.md)

## Brand Identity & Vision
Cobascan adalah produk terintegrasi fisik dan digital (*phygital*) berupa stand akrilik pintar berbasis chip NFC dan QR Code dinamis yang menghubungkan pengunjung fisik (offline) ke Google Review dan akses Wi-Fi bisnis secara instan.

## Personality & Tone
- **Karakter:** Jujur, fungsional, andal, modern, dan berorientasi pada kepraktisan pemilik UMKM & pengunjung.
- **Bukan:** SaaS AI generik penuh jargon, template gradien ungu-biru, atau kartu bento monoton.
- **Nada Bicara (Tone of Voice):** Bahasa Indonesia lugas, profesional, mengedepankan spesifikasi teknis dan manfaat nyata.

## Color Palette
- **Primary / Canvas:** `#FAFAFA` (Page Canvas), `#FFFFFF` (Surface / Card), `#0F172A` (Slate-900 / High Contrast Text)
- **Secondary Text:** `#475569` (Slate-600) / `#64748B` (Slate-500) — Memenuhi standar WCAG AA (rasio kontras > 4.5:1)
- **Borders & Dividers:** `#E2E8F0` (Slate-200), `#CBD5E1` (Slate-300)
- **Action Accent (Google Blue):** `#1A73E8` (Google Review Primary Blue, hover: `#1557B0`)
- **Status Accents:**
  - Success / Wi-Fi Active: `#15803D` (Green-700 on Green-50 surface `#F0FDF4`)
  - Google Star Rating: `#F59E0B` (Amber-500 on `#FFFBEB`)
  - Danger / Delete: `#E11D48` (Rose-600)

## Typography
- **Font:** Inter / Outfit / System Sans-serif modern
- **Headings:** Bobot 700 / 800, line-height proporsional (1.15 - 1.25), tracking ketat (`-0.025em`) tanpa kapitalisasi berlebih.
- **Body:** Bobot 400 / 500, line-height 1.6 untuk kenyamanan membaca.

## UI Principles & Dials
- **ENERGY Dial: 2 (Moderate / Intentional)** — Visual bersih berfokus pada fotografi hardware nyata (stand akrilik).
- **RHYTHM Dial: 2 (Structured Variety)** — Tata letak bervariasi antara grid, daftar spesifikasi, dan tabel alur, tidak melulu bento box.
- **MOTION Dial: 1 (Subtle / Purposeful)** — Transisi interaksi mikro hanya pada hover tombol dan state loading; tidak ada elemen mengapung atau berkedip tanpa tujuan.
- **Accessibility:** Semua kontrol interaktif memiliki tap target minimal 44px, fokus keyboard terlihat jelas (`focus-visible:ring-2`), dan bebas tombol mati (*dead controls*).
