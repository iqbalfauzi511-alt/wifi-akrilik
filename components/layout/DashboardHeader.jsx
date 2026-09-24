'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Calendar, ChevronDown, QrCode } from 'lucide-react';

export default function DashboardHeader({
  title = 'Dashboard',
  subtitle = 'Ringkasan aktivitas dan performa Cobascan.',
  session,
}) {
  const currentDate = new Date();
  const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
  
  const formatDate = (date) => {
    return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
  };
  
  const dateRangeString = `${formatDate(startOfMonth)} – ${formatDate(endOfMonth)}`;

  return (
    <header className="py-6 px-4 sm:px-8 bg-transparent flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 max-w-7xl mx-auto w-full">
      {/* Title & Subtitle */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-none">
          {title}
        </h1>
        {subtitle && (
          <p className="text-xs sm:text-sm text-slate-500 mt-2">
            {subtitle}
          </p>
        )}
      </div>

      {/* Date Range Picker Pill Button matching Image 3 */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200/90 rounded-2xl shadow-xs text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
        >
          <Calendar className="w-4 h-4 text-slate-400" />
          <span>{dateRangeString}</span>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
        </button>
      </div>
    </header>
  );
}
