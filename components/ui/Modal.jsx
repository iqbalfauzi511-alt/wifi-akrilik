'use client';

import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export default function Modal({ isOpen, onClose, title, description, children, maxWidth = 'max-w-md' }) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity animate-in fade-in"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative z-10 flex min-h-full items-center justify-center p-3 sm:p-4 text-center pointer-events-none">
        <div
          className={`relative pointer-events-auto transform flex flex-col max-h-[calc(100dvh-2rem)] sm:max-h-[calc(100dvh-4rem)] rounded-2xl bg-white text-left shadow-2xl transition-all w-full ${maxWidth} border border-slate-200/80 p-4 sm:p-6 my-auto`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-start justify-between pb-3 sm:pb-4 border-b border-slate-100 shrink-0">
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900">{title}</h3>
              {description && (
                <p className="text-xs text-slate-500 mt-0.5">{description}</p>
              )}
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Tutup modal"
              className="text-slate-400 hover:text-slate-600 rounded-lg p-2 hover:bg-slate-100 transition-colors cursor-pointer shrink-0 min-w-[36px] min-h-[36px] flex items-center justify-center"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="mt-4 overflow-y-auto overscroll-contain flex-1 pr-1">{children}</div>
        </div>
      </div>
    </div>
  );
}
