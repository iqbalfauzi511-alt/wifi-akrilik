'use client';

import React, { useState } from 'react';
import { LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

import { logoutAction } from '@/lib/actions/auth-actions';

export default function LogoutButton({ variant = 'default', className = '' }) {
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      const supabase = createClient();
      if (supabase) {
        await supabase.auth.signOut();
      }
    } catch {}

    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch {}

    try {
      await logoutAction();
    } catch {}

    window.location.href = '/login';
  };

  if (variant === 'danger-block') {
    return (
      <button
        type="button"
        onClick={handleLogout}
        disabled={isLoggingOut}
        className={`w-full flex items-center justify-center gap-2 py-4 px-4 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200 font-bold text-sm transition-colors disabled:opacity-50 ${className}`}
      >
        <LogOut className="w-5 h-5" />
        {isLoggingOut ? 'Sedang Keluar...' : 'Keluar dari Akun (Logout)'}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={isLoggingOut}
      className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-50 ${className}`}
    >
      <LogOut className="w-4 h-4" />
      {isLoggingOut ? 'Keluar...' : 'Logout'}
    </button>
  );
}
