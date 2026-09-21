import React from 'react';
import { redirect } from 'next/navigation';
import { getCurrentSession } from '@/lib/auth/session';
import DashboardSidebar from '@/components/layout/DashboardSidebar';
import DashboardHeader from '@/components/layout/DashboardHeader';
import MobileBottomNav from '@/components/layout/MobileBottomNav';

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
      <DashboardSidebar role="admin" />
      <div className="flex-1 flex flex-col min-w-0">
        <DashboardHeader
          title="Cobascan Admin Portal"
          session={session}
        />
        <main className="flex-1 p-3.5 sm:p-6 lg:p-8 pb-24 lg:pb-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
      <MobileBottomNav role="admin" />
    </div>
  );
}
