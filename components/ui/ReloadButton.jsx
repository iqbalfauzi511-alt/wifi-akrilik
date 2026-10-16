'use client';

import React, { useState } from 'react';
import { RotateCw } from 'lucide-react';

export default function ReloadButton({ className = '' }) {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleReload = () => {
    setIsRefreshing(true);
    // Slight timeout before reload so user sees the immediate spin animation feedback
    setTimeout(() => {
      window.location.reload();
    }, 150);
  };

  return (
    <button
      type="button"
      onClick={handleReload}
      disabled={isRefreshing}
      aria-label="Muat ulang halaman"
      title="Muat ulang halaman"
      className={`inline-flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-lg border border-slate-200/90 bg-white/90 text-slate-500 hover:text-slate-900 hover:border-slate-300 hover:bg-slate-50 active:scale-95 transition-all disabled:opacity-60 cursor-pointer shadow-xs ${className}`}
    >
      <RotateCw
        className={`w-3.5 h-3.5 sm:w-3.5 sm:h-3.5 transition-transform ${
          isRefreshing ? 'animate-spin text-brand-600' : ''
        }`}
      />
    </button>
  );
}
