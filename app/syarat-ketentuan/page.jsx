import Link from 'next/link';
import LegalLayout from '@/components/legal/LegalLayout';
import { CheckCircle2 } from 'lucide-react';

export const metadata = {
  title: 'Syarat dan Ketentuan',
  description:
    'Syarat dan ketentuan penggunaan stand akrilik pintar dan layanan dashboard Cobascan.',
  alternates: {
    canonical: '/syarat-ketentuan',
  },
};

export default function SyaratKetentuanPage() {
  return (
    <LegalLayout
      title="Syarat dan Ketentuan"
      subtitle="Ketentuan Penggunaan Layanan"
      date="16 Oktober 2026"
    >
      <section className="space-y-3">
        <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
          1. Penerimaan Ketentuan
        </h2>
        <p>
          Dengan memesan stand akrilik pintar atau mengakses dashboard di <code>cobascan.my.id</code>, Anda menyetujui seluruh ketentuan layanan berikut ini.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
          2. Deskripsi Layanan & Lisensi Produk
        </h2>
        <p>
          Cobascan menyediakan produk fisik stand akrilik meja dengan chip NFC dan QR Code dinamis terhubung ke sistem dashboard digital:
        </p>
        <ul className="space-y-2 list-none pl-0">
          <li className="flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-1 shrink-0" />
            <span>
              <strong>Pembelian Sekali Bayar:</strong> Tidak ada tagihan bulanan atau biaya perpanjangan software tersembunyi.
            </span>
          </li>
          <li className="flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-1 shrink-0" />
            <span>
              <strong>Akses Dashboard:</strong> Pemilik berhak memperbarui nama tempat, kredensial Wi-Fi, dan tautan Google Review kapan saja.
            </span>
          </li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
          3. Penggunaan yang Diperbolehkan
        </h2>
        <ul className="space-y-2 list-disc pl-5">
          <li>
            Mengisi data Wi-Fi sah milik tempat usaha Anda sendiri.
          </li>
          <li>
            Menautkan URL resmi Google Business Profile bisnis yang Anda kelola.
          </li>
          <li>
            Dilarang menggunakan sistem untuk konten berbahaya, phishing, atau aktivitas melanggar hukum.
          </li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
          4. Ketentuan Ulasan Google Maps
        </h2>
        <p>
          Cobascan tidak menjamin perolehan rating atau jumlah ulasan tertentu karena ulasan sepenuhnya merupakan penilaian mandiri konsumen di Google Maps. Cobascan tidak melayani manipulasi ulasan atau pembuatan ulasan fiktif.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
          5. Batasan Tanggung Jawab
        </h2>
        <p>
          Cobascan menjaga keandalan server secara optimal. Namun, kami tidak bertanggung jawab atas kendala yang disebabkan oleh penyedia internet lokal gerai atau perubahan regulasi pihak ketiga secara mendadak.
        </p>
      </section>

      <section className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200/90 space-y-2.5">
        <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
          6. Kontak & Bantuan
        </h2>
        <p className="text-xs sm:text-sm text-slate-600">
          Pertanyaan mengenai syarat penggunaan dapat disampaikan melalui kontak resmi kami:
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
            <strong>Instagram:</strong> @cobascan
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
