import React from 'react';

const statusConfig = {
  blank: {
    label: 'BLANK',
    bg: 'bg-slate-100',
    text: 'text-slate-700',
    dot: 'bg-slate-400',
  },
  sold: {
    label: 'SOLD',
    bg: 'bg-amber-50 border border-amber-200/60',
    text: 'text-amber-700',
    dot: 'bg-amber-500',
  },
  active: {
    label: 'ACTIVE',
    bg: 'bg-emerald-50 border border-emerald-200/60',
    text: 'text-emerald-700',
    dot: 'bg-emerald-500',
  },
  disabled: {
    label: 'DISABLED',
    bg: 'bg-rose-50 border border-rose-200/60',
    text: 'text-rose-700',
    dot: 'bg-rose-500',
  },
};

export default function Badge({ status, label, variant, size = 'sm', className = '' }) {
  const normalized = (status || variant || '').toLowerCase();
  const config = statusConfig[normalized] || {
    label: label || status || 'Default',
    bg: 'bg-slate-100',
    text: 'text-slate-700',
    dot: 'bg-slate-400',
  };

  const displayText = label || config.label;

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-semibold rounded-full uppercase tracking-wider ${
        size === 'sm' ? 'px-2.5 py-0.5 text-[11px]' : 'px-3 py-1 text-xs'
      } ${config.bg} ${config.text} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      {displayText}
    </span>
  );
}
