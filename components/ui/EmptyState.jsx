import React from 'react';
import { QrCode } from 'lucide-react';

export default function EmptyState({
  icon: Icon = QrCode,
  title,
  description,
  action,
}) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center bg-white rounded-2xl border border-dashed border-slate-200">
      <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 mb-4 border border-slate-100">
        <Icon className="w-7 h-7" />
      </div>
      <h3 className="text-base font-semibold text-slate-900">{title}</h3>
      {description && (
        <p className="text-sm text-slate-500 max-w-sm mt-1 mb-5">{description}</p>
      )}
      {action && <div>{action}</div>}
    </div>
  );
}
