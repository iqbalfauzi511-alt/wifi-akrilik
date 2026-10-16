'use client';

import React from 'react';
import { usePathname } from 'next/navigation';

function Block({ className = '' }) {
  return <div aria-hidden="true" className={`rounded-lg bg-slate-200/80 motion-safe:animate-pulse ${className}`} />;
}

function AdminDashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-2"><Block className="h-8 w-48" /><Block className="h-4 w-72 max-w-full" /></div>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 sm:gap-4">
        {Array.from({ length: 4 }, (_, index) => <Block key={index} className="h-28 rounded-2xl" />)}
      </div>
      <Block className="h-64 rounded-2xl" />
      <Block className="h-52 rounded-2xl" />
    </div>
  );
}

function AdminContentSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-2"><Block className="h-8 w-56" /><Block className="h-4 w-80 max-w-full" /></div>
      <div className="flex flex-wrap gap-3"><Block className="h-10 w-40" /><Block className="h-10 w-32" /></div>
      <Block className="h-24 rounded-2xl" />
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 sm:p-6 space-y-4">
        {Array.from({ length: 6 }, (_, index) => <Block key={index} className="h-11 w-full" />)}
      </div>
    </div>
  );
}

export default function AdminLoading() {
  const pathname = usePathname();
  const isOverview = pathname === '/admin';

  return (
    <div aria-busy="true" aria-label="Memuat halaman admin" className="w-full px-4 py-6 pb-24 sm:px-8 lg:pb-8">
      <div className="mx-auto w-full max-w-7xl">
        {isOverview ? <AdminDashboardSkeleton /> : <AdminContentSkeleton />}
      </div>
      <span className="sr-only">Memuat halaman admin</span>
    </div>
  );
}
