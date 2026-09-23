import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata = {
  title: 'Cobascan: Scan, Tap, Connect, Review',
  description:
    'Platform QR + NFC untuk bisnis. Hubungkan pelanggan langsung ke Google Review bisnis Anda dan sediakan akses Wi-Fi dalam satu scan atau tap.',
  keywords: 'cobascan, qr nfc bisnis, google review qr, nfc review, qr wifi, tap nfc, smart qr',
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
