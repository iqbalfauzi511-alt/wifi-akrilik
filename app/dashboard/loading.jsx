import React from 'react';

function Block({ className = '' }) {
  return <div aria-hidden="true" className={`rounded-lg bg-slate-200/80 motion-safe:animate-pulse ${className}`} />;
}

export default function DashboardLoading() {
  return (
    <main aria-busy="true" aria-label="Memuat dashboard owner" className="min-h-screen bg-slate-50 px-4 py-6 sm:px-8">
      <div className="mx-auto w-full max-w-6xl space-y-6">
        <div className="flex items-center justify-between gap-4">
          <div className="space-y-2"><Block className="h-7 w-48" /><Block className="h-4 w-64 max-w-full" /></div>
          <Block className="h-10 w-10 rounded-full" />
        </div>
        <Block className="h-32 rounded-2xl" />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
          {Array.from({ length: 4 }, (_, index) => <Block key={index} className="h-28 rounded-2xl" />)}
        </div>
        <Block className="h-52 rounded-2xl" />
        <Block className="h-40 rounded-2xl" />
      </div>
      <span className="sr-only">Memuat dashboard owner</span>
    </main>
  );
}
