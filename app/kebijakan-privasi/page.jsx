import Link from 'next/link';
import LegalLayout from '@/components/legal/LegalLayout';
import { CheckCircle2 } from 'lucide-react';

export const metadata = {
  title: 'Kebijakan Privasi',
  description:
    'Kebijakan privasi Cobascan mengenai pengolahan data pengunjung dan pemilik usaha pada platform stand akrilik pintar Cobascan.',
  alternates: {
    canonical: '/kebijakan-privasi',
  },
};

export default function KebijakanPrivasiPage() {
  return (
    <LegalLayout
      title="Kebijakan Privasi"
      subtitle="Perlindungan Data & Keamanan"
      date="16 Oktober 2026"
    >
      <section className="space-y-3">
        <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
          1. Prinsip Privasi Cobascan
        </h2>
        <p>
          Cobascan (diakses melalui <code>cobascan.my.id</code>) menghargai hak privasi setiap orang. Sistem kami dirancang secara ringkas dan transparan: mempermudah koneksi Wi-Fi pengunjung dan penyampaian ulasan Google Maps tanpa mengorbankan privasi pengguna.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
          2. Data Pengunjung Meja (Tamu Gerai)
        </h2>
        <p>
          Saat tamu menempelkan smartphone pada chip NFC atau memindai QR Code di meja:
        </p>
        <ul className="space-y-2.5 list-none pl-0">
          <li className="flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-1 shrink-0" />
            <span>
              <strong>Tanpa Akun & Identitas Pribadi:</strong> Tamu tidak perlu registrasi, tidak diminta nomor HP, alamat email, atau izin akses kontak.
            </span>
          </li>
          <li className="flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-1 shrink-0" />
            <span>
              <strong>Kredensial Wi-Fi:</strong> Nama jaringan (SSID) dan kata sandi ditampilkan secara aman untuk memudahkan tamu terhubung ke Wi-Fi tempat usaha.
            </span>
          </li>
          <li className="flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-1 shrink-0" />
            <span>
              <strong>Analitik Agregat Anonim:</strong> Kami hanya mencatat jumlah hitungan pemindaian tanpa menyimpan data identitas personal perangkat.
            </span>
          </li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
          3. Data Pemilik Usaha (Mitra Merchant)
        </h2>
        <p>
          Untuk keperluan pengelolaan stand akrilik dan akses dashboard:
        </p>
        <ul className="space-y-2 list-disc pl-5">
          <li>
            <strong>Nomor WhatsApp:</strong> Digunakan untuk masuk ke dashboard dan pengiriman kode PIN autentikasi.
          </li>
          <li>
            <strong>Informasi Lokasi Bisnis:</strong> Nama tempat usaha, logo bisnis, tautan profil Google Business Profile resmi, dan info Wi-Fi yang dikonfigurasi.
          </li>
          <li>
            <strong>Data Pembayaran:</strong> Pembelian stand bersifat sekali beli tanpa langganan kartu kredit berulang di sistem kami.
          </li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
          4. Kepatuhan Kebijakan Ulasan Google Maps
        </h2>
        <p>
          Cobascan beroperasi sesuai pedoman resmi Google Review:
        </p>
        <ul className="space-y-2 list-disc pl-5">
          <li>
            Setiap rating bintang yang dipilih pengunjung langsung diarahkan ke form ulasan Google Maps resmi tanpa penyaringan atau manipulasi (100% bebas praktik <em>review-gating</em>).
          </li>
          <li>
            Cobascan tidak menjual, membuat, atau memfasilitasi ulasan palsu (<em>fake reviews</em>).
          </li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
          5. Keamanan & Hak Pengguna
        </h2>
        <p>
          Seluruh komunikasi data dienkripsi dengan HTTPS (TLS). Pemilik usaha berhak mengubah atau menghapus data tempat usaha kapan saja melalui dashboard atau permohonan ke saluran bantuan.
        </p>
      </section>

      <section className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200/90 space-y-2.5">
        <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
          6. Saluran Bantuan Privasi
        </h2>
        <p className="text-xs sm:text-sm text-slate-600">
          Untuk pertanyaan terkait kebijakan privasi dan pengelolaan data, silakan hubungi tim Cobascan:
        </p>
        <div className="pt-1 text-xs sm:text-sm text-slate-700 space-y-1">
          <p>
            <strong>WhatsApp:</strong>{' '}
            <a
              href="https://wa.me/6285888159265"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline font-medium"
            >
              +62 858-8815-9265
            </a>
          </p>
          <p>
            <strong>Instagram:</strong>{' '}
            <a
              href="https://www.instagram.com/cobascan/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-pink-600 hover:underline font-medium"
            >
              @cobascan
            </a>
          </p>
          <p>
            <strong>Website:</strong>{' '}
            <Link href="/" className="text-blue-600 hover:underline font-medium">
              https://cobascan.my.id
            </Link>
          </p>
        </div>
      </section>
    </LegalLayout>
  );
}
