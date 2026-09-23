'use client';

import Link from 'next/link';
import Image from 'next/image';
import { LogOut, User as UserIcon, QrCode } from 'lucide-react';
import { logoutAction } from '@/lib/actions/auth-actions';
import Badge from '@/components/ui/Badge';

export default function DashboardHeader({ title, subtitle, session }) {
  return (
    <header className="h-16 border-b border-slate-200/80 bg-white/95 backdrop-blur-md px-3.5 sm:px-6 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center gap-2.5">
        <Link href="/" className="lg:hidden flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-tr from-brand-700 to-indigo-600 text-white shadow-xs shrink-0">
          <QrCode className="w-4 h-4" />
        </Link>
        <div className="min-w-0">
          <h1 className="text-sm sm:text-lg font-bold text-slate-900 leading-tight truncate max-w-[160px] sm:max-w-none">{title}</h1>
          {subtitle && <p className="text-[11px] sm:text-xs text-slate-500 hidden sm:block">{subtitle}</p>}
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* User Info */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 font-semibold text-xs overflow-hidden">
            {session?.user?.avatarUrl ? (
              <Image
                src={session.user.avatarUrl}
                alt={session.user.name || 'User'}
                width={32}
                height={32}
                className="w-full h-full object-cover"
              />
            ) : (
              <UserIcon className="w-4 h-4 text-slate-500" />
            )}
          </div>
          <div className="hidden sm:block text-left">
            <div className="text-xs font-semibold text-slate-900 leading-none">
              {session?.user?.name || session?.user?.email || 'User'}
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5 truncate max-w-[140px]">
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
            aria-label="Keluar"
            className="p-2 text-slate-500 hover:text-rose-600 rounded-xl hover:bg-rose-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </form>
      </div>
    </header>
  );
}
