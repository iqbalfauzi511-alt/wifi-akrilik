'use client';

import React from 'react';
import { LogOut, User as UserIcon } from 'lucide-react';
import { logoutAction } from '@/lib/actions/auth-actions';
import Badge from '@/components/ui/Badge';

export default function DashboardHeader({ title, subtitle, session }) {
  return (
    <header className="h-16 border-b border-slate-200/80 bg-white px-6 flex items-center justify-between sticky top-0 z-30">
      <div>
        <h1 className="text-lg font-bold text-slate-900 leading-tight">{title}</h1>
        {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-4">
        {/* User Info */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 font-semibold text-xs overflow-hidden">
            {session?.user?.avatarUrl ? (
              <img
                src={session.user.avatarUrl}
                alt={session.user.name || 'User'}
                className="w-full h-full object-cover"
              />
            ) : (
              <UserIcon className="w-4 h-4 text-slate-400" />
            )}
          </div>
          <div className="hidden sm:block text-left">
            <div className="text-xs font-semibold text-slate-900 leading-none">
              {session?.user?.name || session?.user?.email || 'User'}
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5 truncate max-w-[140px]">
              {session?.user?.email}
            </div>
          </div>
          <Badge
            label={session?.role === 'admin' ? 'ADMIN' : 'CUSTOMER'}
            variant={session?.role === 'admin' ? 'sold' : 'active'}
            size="sm"
          />
        </div>

        {/* Logout button */}
        <form action={logoutAction}>
          <button
            type="submit"
            title="Keluar"
            className="p-2 text-slate-400 hover:text-rose-600 rounded-xl hover:bg-rose-50 transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </form>
      </div>
    </header>
  );
}
