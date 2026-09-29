import React from 'react';
import { redirect } from 'next/navigation';
import { getCurrentSession } from '@/lib/auth/session';
import DashboardSidebar from '@/components/layout/DashboardSidebar';
import MobileBottomNav from '@/components/layout/MobileBottomNav';
import LogoutButton from '@/components/auth/LogoutButton';
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
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
        {/* Mobile Top Bar (Admin) */}
        <div className="lg:hidden bg-white border-b border-slate-200 sticky top-0 z-10 shrink-0">
          <div className="px-4 h-14 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 flex items-center justify-center relative">
                <Image src="/cobascan-logo.png" alt="Cobascan" width={32} height={32} className="w-full h-full object-contain" priority />
              </div>
              <div>
                <span className="font-extrabold text-slate-900 text-lg tracking-tight leading-none pt-0.5">Cobascan</span>
                <span className="text-xs text-slate-400 ml-2 font-medium">(Admin)</span>
              </div>
            </div>
            <LogoutButton className="!px-3 !py-1.5 !text-xs" />
          </div>
        </div>

        <main className="flex-1 pb-24 lg:pb-8 w-full">
          {children}
        </main>
      </div>
      <MobileBottomNav role="admin" />
    </div>
  );
}
export const dynamic = 'force-dynamic';
