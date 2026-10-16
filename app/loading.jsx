import React from 'react';

function Block({ className = '' }) {
  return <div aria-hidden="true" className={`rounded-lg bg-slate-200/80 motion-safe:animate-pulse ${className}`} />;
}

export default function Loading() {
  return (
    <main aria-busy="true" aria-label="Memuat halaman" className="min-h-screen bg-slate-50/60 px-4 py-8 sm:px-8">
      <div className="mx-auto w-full max-w-7xl space-y-6">
        <Block className="h-8 w-56" />
        <Block className="h-4 w-72 max-w-full" />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
          {Array.from({ length: 4 }, (_, index) => <Block key={index} className="h-28 rounded-2xl" />)}
        </div>
        <Block className="h-64 rounded-2xl" />
      </div>
      <span className="sr-only">Memuat konten halaman</span>
    </main>
  );
}
