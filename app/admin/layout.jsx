import React from 'react';
import { redirect } from 'next/navigation';
import { getCurrentSession } from '@/lib/auth/session';
import DashboardSidebar from '@/components/layout/DashboardSidebar';
import MobileBottomNav from '@/components/layout/MobileBottomNav';
import LogoutButton from '@/components/auth/LogoutButton';
import ReloadButton from '@/components/ui/ReloadButton';
import Image from 'next/image';

export default async function AdminLayout({ children }) {
  const session = await getCurrentSession();

  if (!session?.user) {
    redirect('/login?next=/admin');
  }

  if (session.role !== 'admin') {
    redirect('/dashboard');
  }

  return (
    <div className="min-h-screen flex bg-slate-50/60">
      <DashboardSidebar role="admin" session={session} />
      <div className="flex-1 flex flex-col min-w-0 h-screen h-[100dvh] overflow-y-auto overflow-x-hidden">
        {/* Mobile Top Bar (Admin) */}
        <div className="lg:hidden bg-white border-b border-slate-200/90 sticky top-0 z-10 shrink-0">
          <div className="px-3.5 sm:px-4 h-12 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 flex items-center justify-center relative">
                <Image src="/cobascan-logo.png" alt="Cobascan" width={28} height={28} className="w-full h-full object-contain" priority />
              </div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-slate-900 text-base tracking-tight leading-none">COBASCAN</span>
                <span className="text-[11px] text-slate-400 font-medium">(Admin)</span>
              </div>
              <ReloadButton className="!w-7 !h-7" />
            </div>
            <LogoutButton className="!px-2.5 !py-1 !text-xs !h-7 !rounded-lg !font-medium" />
          </div>
        </div>

        <main className="flex-1 pb-24 lg:pb-8 w-full min-w-0 overflow-x-hidden">
          {children}
        </main>
      </div>
      <MobileBottomNav role="admin" />
    </div>
  );
}
export const dynamic = 'force-dynamic';
