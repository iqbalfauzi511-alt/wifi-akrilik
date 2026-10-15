import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const siteUrl = (
  process.env.NEXT_PUBLIC_APP_URL && !process.env.NEXT_PUBLIC_APP_URL.includes('localhost')
    ? process.env.NEXT_PUBLIC_APP_URL
    : 'https://cobascan.my.id'
).replace(/\/$/, '');

export const metadata = {
  metadataBase: new URL(siteUrl),
  title: 'Cobascan: Scan, Tap, Connect, Review',
  description:
    'Platform QR + NFC untuk bisnis. Hubungkan pelanggan langsung ke Google Review bisnis Anda dan sediakan akses Wi-Fi dalam satu scan atau tap.',
  keywords: 'cobascan, qr nfc bisnis, google review qr, nfc review, qr wifi, tap nfc, smart qr',
  alternates: {
    canonical: '/',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({ children }) {
  return (
    <html lang="id" className={inter.variable}>
      <body className="min-h-screen font-sans bg-slate-50/60 text-slate-900 antialiased flex flex-col overflow-x-clip">
        {children}
      </body>
    </html>
  );
}
