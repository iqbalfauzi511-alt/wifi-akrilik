import Link from 'next/link';
import Image from 'next/image';
import { Home, LogIn, MessageCircle } from 'lucide-react';
import Button from '@/components/ui/Button';

export const metadata = {
  title: 'Halaman Tidak Ditemukan (404) | Cobascan',
  description: 'Halaman yang Anda tuju tidak ditemukan pada sistem Cobascan.',
};

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-50/70 flex flex-col items-center justify-between p-4 sm:p-6">
      <header className="w-full max-w-4xl py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/cobascan-logo.png"
            alt="Cobascan"
            width={32}
            height={32}
            className="w-8 h-8 object-contain"
          />
          <span className="font-extrabold text-slate-900 tracking-tight text-lg">
            COBASCAN
          </span>
        </Link>
        <Link
          href="/login"
          className="text-xs sm:text-sm font-semibold text-slate-600 hover:text-blue-600 transition-colors"
        >
          Masuk Dashboard
        </Link>
      </header>

      <main className="w-full max-w-md my-auto py-8">
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xl p-6 sm:p-8 text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center mx-auto">
            <span className="text-2xl font-black tracking-tight">404</span>
          </div>

          <div className="space-y-2">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Halaman Tidak Ditemukan
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
              Tautan yang Anda tuju mungkin salah ketik, sudah dipindahkan, atau meja stand akrilik belum diaktifkan oleh pemilik tempat.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-1">
            <Link href="/" className="w-full sm:w-auto">
              <Button className="w-full inline-flex items-center justify-center gap-2">
                <Home className="w-4 h-4" />
                <span>Beranda</span>
              </Button>
            </Link>

            <Link href="/login" className="w-full sm:w-auto">
              <Button
                variant="outline"
                className="w-full inline-flex items-center justify-center gap-2"
              >
                <LogIn className="w-4 h-4" />
                <span>Dashboard</span>
              </Button>
            </Link>
          </div>

          <div className="pt-2 border-t border-slate-100">
            <p className="text-xs text-slate-500">
              Butuh bantuan dengan stand akrilik Anda?{' '}
              <a
                href="https://wa.me/6285888159265"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 font-semibold hover:underline inline-flex items-center gap-1"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>Chat WhatsApp</span>
              </a>
            </p>
          </div>
        </div>
      </main>

      <footer className="w-full max-w-4xl py-4 text-center text-xs text-slate-400">
        <p>© 2026 COBASCAN. Platform Stand Akrilik Pintar QR &amp; NFC.</p>
      </footer>
    </div>
  );
}
