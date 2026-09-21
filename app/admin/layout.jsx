import React from 'react';
import { redirect } from 'next/navigation';
import { getCurrentSession } from '@/lib/auth/session';
import DashboardSidebar from '@/components/layout/DashboardSidebar';
import DashboardHeader from '@/components/layout/DashboardHeader';

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
          title="Smart Wi-Fi Admin Portal"
          session={session}
        />
        <main className="flex-1 p-6 sm:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
