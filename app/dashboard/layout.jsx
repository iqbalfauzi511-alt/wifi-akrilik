import React from 'react';
import { redirect } from 'next/navigation';
import { getCurrentSession } from '@/lib/auth/session';

export default async function DashboardLayout({ children }) {
  const session = await getCurrentSession();

  if (!session?.user) {
    redirect('/login?next=/dashboard');
  }

  // Admin has their own layout at /admin
  // Customer gets a clean, standalone layout (no sidebar)
  return (
    <div className="min-h-screen bg-slate-50">
      {children}
    </div>
  );
}
