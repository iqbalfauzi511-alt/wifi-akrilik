'use client';

import React, { useState } from 'react';
import { Calendar, ChevronDown } from 'lucide-react';

const PERIOD_OPTIONS = [
  { id: 'this_month', label: 'Bulan Ini' },
  { id: 'last_month', label: 'Bulan Lalu' },
  { id: '7d', label: '7 Hari Terakhir' },
  { id: '30d', label: '30 Hari Terakhir' },
];

function getPeriodLabel(period) {
  const now = new Date();
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

  if (period === 'this_month') {
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    return `${start.getDate()} ${monthNames[start.getMonth()]} – ${end.getDate()} ${monthNames[end.getMonth()]} ${end.getFullYear()}`;
  }
  if (period === 'last_month') {
    const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const end = new Date(now.getFullYear(), now.getMonth(), 0);
    return `${start.getDate()} ${monthNames[start.getMonth()]} – ${end.getDate()} ${monthNames[end.getMonth()]} ${end.getFullYear()}`;
  }
  if (period === '7d') {
    const start = new Date(now);
    start.setDate(now.getDate() - 6);
    return `${start.getDate()} ${monthNames[start.getMonth()]} – ${now.getDate()} ${monthNames[now.getMonth()]} ${now.getFullYear()}`;
  }
  if (period === '30d') {
    const start = new Date(now);
    start.setDate(now.getDate() - 29);
    return `${start.getDate()} ${monthNames[start.getMonth()]} – ${now.getDate()} ${monthNames[now.getMonth()]} ${now.getFullYear()}`;
  }
  return '';
}

export default function DashboardHeader({
  title = 'Dashboard',
  subtitle = 'Ringkasan aktivitas dan performa Cobascan.',
  onPeriodChange,
}) {
  const [period, setPeriod] = useState('this_month');
  const [isOpen, setIsOpen] = useState(false);

  const handleSelect = (p) => {
    setPeriod(p);
    setIsOpen(false);
    if (onPeriodChange) onPeriodChange(p);
  };

  return (
    <header className="py-6 px-4 sm:px-8 bg-transparent flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 max-w-7xl mx-auto w-full">
      {/* Title & Subtitle */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-none">
          {title}
        </h1>
        {subtitle && (
          <p className="text-xs sm:text-sm text-slate-500 mt-2">{subtitle}</p>
        )}
      </div>

      {/* Date Range Dropdown */}
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen((o) => !o)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200/90 rounded-2xl shadow-xs text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
        >
          <Calendar className="w-4 h-4 text-slate-400" />
          <span>{getPeriodLabel(period)}</span>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
        </button>

        {isOpen && (
          <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl border border-slate-200 shadow-xl py-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
            {PERIOD_OPTIONS.map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => handleSelect(opt.id)}
                className={`w-full text-left px-4 py-2.5 text-xs font-semibold flex items-center justify-between ${
                  period === opt.id ? 'bg-blue-50 text-[#1A73E8]' : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <span>{opt.label}</span>
                {period === opt.id && <span className="w-1.5 h-1.5 rounded-full bg-[#1A73E8]" />}
              </button>
            ))}
          </div>
        )}
      </div>
    </header>
  );
}
