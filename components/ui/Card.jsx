import React from 'react';

export default function Card({ children, className = '', ...props }) {
  return (
    <div
      className={`bento-card p-4 sm:p-6 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ title, subtitle, action, className = '' }) {
  return (
    <div className={`flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-4 sm:mb-5 ${className}`}>
      <div className="min-w-0">
        <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight leading-snug">{title}</h3>
        {subtitle && <p className="text-xs sm:text-sm text-slate-500 mt-0.5 leading-normal">{subtitle}</p>}
      </div>
      {action && <div className="w-full sm:w-auto shrink-0">{action}</div>}
    </div>
  );
}
