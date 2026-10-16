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
  title: {
    default: 'Cobascan - Stand Akrilik Pintar QR & NFC Google Review',
    template: '%s | Cobascan',
  },
  description:
    'Cobascan adalah plat & stand akrilik pintar QR Code + NFC untuk bisnis kuliner dan UMKM. Raih ulasan Google Maps bintang 5 dan sediakan akses Wi-Fi otomatis dalam 1x tap di meja.',
  keywords: [
    'cobascan',
    'cobascan indonesia',
    'stand akrilik nfc',
    'qr nfc google review',
    'qr wifi akrilik',
    'akrilik review google maps',
    'smart stand akrilik',
    'plat meja akrilik qr',
    'google review stand',
  ],
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Cobascan - Stand Akrilik Pintar QR & NFC Google Review',
    description:
      'Cobascan adalah plat & stand akrilik pintar QR Code + NFC untuk bisnis kuliner dan UMKM. Raih ulasan Google Maps bintang 5 dan sediakan akses Wi-Fi otomatis dalam 1x tap di meja.',
    url: siteUrl,
    siteName: 'Cobascan',
    locale: 'id_ID',
    type: 'website',
    images: [
      {
        url: '/cobascan-logo.png',
        width: 512,
        height: 512,
        alt: 'Cobascan Logo',
      },
    ],
  },
  twitter: {
    card: 'summary',
    title: 'Cobascan - Stand Akrilik Pintar QR & NFC Google Review',
    description:
      'Tingkatkan ulasan Google Maps dan sediakan Wi-Fi otomatis dengan stand akrilik pintar Cobascan.',
    images: ['/cobascan-logo.png'],
  },
  icons: {
    icon: '/favicon.ico',
    apple: '/icons/apple-touch-icon.png',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Cobascan',
  },
  other: {
    'mobile-web-app-capable': 'yes',
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
  themeColor: '#4f46e5',
  width: 'device-width',
  initialScale: 1,
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'Cobascan',
  alternateName: ['Cobascan Indonesia', 'Cobascan Smart Wi-Fi & QR NFC'],
  url: siteUrl,
  description:
    'Platform stand akrilik pintar berbasis chip NFC & QR Code dinamis untuk menukar ulasan Google Review bintang 5 dan akses Wi-Fi instan bagi bisnis kuliner & UMKM.',
  publisher: {
    '@type': 'Organization',
    name: 'Cobascan',
    url: siteUrl,
    logo: {
      '@type': 'ImageObject',
      url: `${siteUrl}/cobascan-logo.png`,
    },
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="id" className={inter.variable}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-screen font-sans bg-slate-50/60 text-slate-900 antialiased flex flex-col overflow-x-clip">
        {children}
      </body>
    </html>
  );
}
