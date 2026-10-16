import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Shield } from 'lucide-react';

export default function LegalLayout({ title, subtitle, date, children }) {
  return (
    <div className="min-h-screen bg-slate-50/60 text-slate-800">
      <header className="border-b border-slate-200/80 bg-white/90 backdrop-blur sticky top-0 z-30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 text-sm font-semibold text-slate-700 hover:text-blue-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali ke Beranda</span>
          </Link>
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/cobascan-logo.png"
              alt="Cobascan"
              width={28}
              height={28}
              className="w-7 h-7 object-contain"
            />
            <span className="font-extrabold text-slate-900 tracking-tight text-base">
              COBASCAN
            </span>
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
        <div className="mb-8 pb-6 border-b border-slate-200">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold mb-3">
            <Shield className="w-3.5 h-3.5" />
            <span>{subtitle || 'Dokumen Resmi Cobascan'}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight leading-tight">
            {title}
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-slate-500">
            Terakhir diperbarui: {date || '16 Oktober 2026'} • cobascan.my.id
          </p>
        </div>

        <div className="space-y-8 text-sm sm:text-base leading-relaxed text-slate-700">
          {children}
        </div>
      </main>

      <footer className="border-t border-slate-200 bg-white py-8 text-center text-xs text-slate-500">
        <div className="max-w-4xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 COBASCAN. Seluruh hak cipta dilindungi.</p>
          <nav aria-label="Tautan Kebijakan Hukum" className="flex items-center gap-4">
            <Link href="/kebijakan-privasi" className="hover:text-blue-600 transition-colors">
              Kebijakan Privasi
            </Link>
            <Link href="/syarat-ketentuan" className="hover:text-blue-600 transition-colors">
              Syarat & Ketentuan
            </Link>
            <Link href="/kebijakan-garansi" className="hover:text-blue-600 transition-colors">
              Kebijakan Garansi
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
