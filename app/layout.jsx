import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata = {
  title: 'Smart Wi-Fi QR — Scan QR, Follow Instagram, Dapatkan Wi-Fi',
  description:
    'Solusi akrilik QR Code modern untuk kafe dan bisnis. Pengunjung scan QR, follow Instagram Anda, dan dapatkan password Wi-Fi secara instan.',
  keywords: 'smart wifi, qr wifi, instagram marketing, wifi cafe, qr code akrilik',
};

export default function RootLayout({ children }) {
  return (
    <html lang="id" className={inter.variable}>
      <body className="min-h-screen font-sans bg-slate-50/60 text-slate-900 antialiased flex flex-col">
        {children}
      </body>
    </html>
  );
}
