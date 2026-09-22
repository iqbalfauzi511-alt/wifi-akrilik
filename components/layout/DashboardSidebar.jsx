'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Wifi,
  LayoutDashboard,
  QrCode,
  Settings,
  ShieldAlert,
  Users,
  ExternalLink,
} from 'lucide-react';

export default function DashboardSidebar({ role = 'customer', businessName }) {
  const pathname = usePathname();

  const customerNav = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, exact: true },
    { name: 'Cobascan Saya', href: '/dashboard/qr', icon: QrCode },
    { name: 'Pengaturan Bisnis', href: '/dashboard/settings', icon: Settings },
  ];

  const adminNav = [
    { name: 'Admin Center', href: '/admin', icon: LayoutDashboard, exact: true },
    { name: 'My Cobascan', href: '/admin/qr', icon: QrCode },
    { name: 'Pengguna & Bisnis', href: '/admin/users', icon: Users },
  ];

  const navItems = role === 'admin' ? adminNav : customerNav;

  return (
    <aside className="hidden lg:flex w-64 bg-white border-r border-slate-200/80 flex-col shrink-0 min-h-screen sticky top-0 h-screen justify-between">
      <div>
        {/* Brand Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-700 to-indigo-600 flex items-center justify-center text-white shadow-sm shadow-blue-500/20">
              <QrCode className="w-4 h-4" />
            </div>
            <div>
              <div className="font-bold text-slate-900 text-sm tracking-tight leading-none">
                Cobascan
              </div>
              <div className="text-[10px] uppercase font-mono font-bold tracking-wider text-google-blue mt-1">
                {role === 'admin' ? 'ADMIN CONSOLE' : 'PLATFORM QR'}
              </div>
            </div>
          </Link>
        </div>

        {/* Business Info snippet (Customer only) */}
        {role === 'customer' && businessName && (
          <div className="px-4 py-3 mx-3 my-3 bg-slate-50 border border-slate-100 rounded-xl">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              Bisnis Aktif
            </p>
            <p className="text-sm font-bold text-slate-800 truncate mt-0.5">
              {businessName}
            </p>
          </div>
        )}

        {/* Navigation items */}
        <nav className="px-3 py-4 space-y-1">
          {navItems.map((item) => {
            const isActive = item.exact
              ? pathname === item.href
              : pathname.startsWith(item.href);

            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 font-bold shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <item.icon
                  className={`w-4 h-4 ${
                    isActive ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-600'
                  }`}
                />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="p-4 space-y-3">
        {/* Footer Quick Link */}
        <Link
          href="/"
          className="flex items-center justify-between px-3 py-2 text-xs font-medium text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-50 transition-colors"
        >
          <span>Kembali ke Beranda</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </Link>
      </div>
    </aside>
  );
}
