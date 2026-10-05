import React from 'react';
import Navbar from '@/components/layout/Navbar';
import LandingPageClient from '@/components/landing/LandingPageClient';
import { getCurrentSession } from '@/lib/auth/session';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const session = await getCurrentSession();
  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '6285888159265';
  const whatsappBaseUrl = `https://wa.me/${whatsappNumber}`;

  return (
    <div className="min-h-screen flex flex-col bg-[#FAFAFA] text-slate-900 selection:bg-blue-600 selection:text-white overflow-x-hidden font-sans">
      <Navbar session={session} />
      <LandingPageClient whatsappBaseUrl={whatsappBaseUrl} />
    </div>
  );
}
