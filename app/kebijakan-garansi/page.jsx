import Link from 'next/link';
import LegalLayout from '@/components/legal/LegalLayout';
import { ShieldCheck, PackageCheck, AlertCircle } from 'lucide-react';

export const metadata = {
  title: 'Kebijakan Garansi & Pengembalian',
  description:
    'Kebijakan garansi 100% ganti baru stand akrilik dan chip NFC Cobascan jika rusak saat pengiriman atau tidak terbaca.',
  alternates: {
    canonical: '/kebijakan-garansi',
  },
};

export default function KebijakanGaransiPage() {
  return (
    <LegalLayout
      title="Kebijakan Garansi & Pengembalian"
      subtitle="Jaminan Kualitas Produk"
      date="16 Oktober 2026"
    >
      <section className="space-y-3">
        <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
          1. Jaminan Kualitas Produk
        </h2>
        <p>
          Setiap unit stand akrilik Cobascan melewati pemeriksaan fungsi chip NFC dan pemindaian QR Code sebelum dikemas menggunakan bubble wrap berlapis dan kardus pelindung tebal.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
          2. Cakupan Garansi Ganti Baru
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 pt-1">
          <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-1.5">
            <div className="flex items-center gap-2 text-blue-600 font-bold text-sm">
              <PackageCheck className="w-4 h-4 shrink-0" />
              <span>Kerusakan Pengiriman</span>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Jika akrilik pecah, patah, atau retak saat pengiriman kurir, kami ganti unit baru tanpa biaya produk tambahan.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-1.5">
            <div className="flex items-center gap-2 text-emerald-600 font-bold text-sm">
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span>Chip NFC Tidak Terbaca</span>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Jika chip NFC tidak merespons smartphone berkemampuan NFC saat pertama kali diterima, kami kirimkan unit pengganti.
            </p>
          </div>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
          3. Tata Cara Klaim Garansi
        </h2>
        <ul className="space-y-2 list-disc pl-5">
          <li>
            <strong>Video Unboxing:</strong> Sertakan rekaman video saat membuka paket tanpa jeda (maksimal 2x24 jam sejak paket berstatus diterima di kurir).
          </li>
          <li>
            <strong>Kirim ke WhatsApp:</strong> Kirim video dan nomor pesanan ke WhatsApp resmi di <code>+62 858-8815-9265</code>.
          </li>
          <li>
            <strong>Pengiriman Baru:</strong> Setelah tim memverifikasi bukti, unit baru diproses dan dikirimkan dalam 1-2 hari kerja.
          </li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
          4. Ketentuan Pengembalian Dana (Refund)
        </h2>
        <p>
          Jika unit pengganti tidak tersedia atau terjadi kendala fatal yang tidak dapat diselesaikan oleh tim kami, pemesan berhak menerima pengembalian dana 100%. Dana ditransfer dalam 1-3 hari kerja perbankan.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
          5. Pengecualian Garansi
        </h2>
        <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs sm:text-sm space-y-1">
          <div className="flex items-center gap-1.5 font-bold text-amber-800">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>Pengecualian:</span>
          </div>
          <p className="leading-relaxed">
            Garansi tidak mencakup kerusakan fisik akibat kelalaian operasional harian gerai setelah paket diterima dalam keadaan utuh (terjatuh dari meja, terinjak, tergores benda tajam, atau terkena cairan kimia pembersih keras).
          </p>
        </div>
      </section>

      <section className="p-5 rounded-2xl bg-white border border-slate-200 space-y-2">
        <h2 className="text-base font-bold text-slate-900 tracking-tight">
          6. Hubungi Layanan Garansi
        </h2>
        <div className="text-xs sm:text-sm text-slate-700 space-y-1">
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
            <strong>Situs:</strong> https://cobascan.my.id
          </p>
        </div>
      </section>
    </LegalLayout>
  );
}
