'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Store,
  QrCode,
  Wallet,
  Users,
  Settings,
} from 'lucide-react';

export default function MobileBottomNav({ role = 'customer' }) {
  const pathname = usePathname();

  const navItems = [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard, exact: true },
    { name: 'Bisnis', href: '/admin/businesses', icon: Store },
    { name: 'Perangkat', href: '/admin/devices', icon: QrCode },
    { name: 'Keuangan', href: '/admin/finance', icon: Wallet },
    { name: 'Pengguna', href: '/admin/users', icon: Users },
    { name: 'Pengaturan', href: '/admin/settings', icon: Settings },
  ];

  return (
    <nav
      aria-label="Navigasi admin mobile"
      className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/90 shadow-lg pt-1 pb-[calc(0.35rem+env(safe-area-inset-bottom,0px))]"
    >
      <div className="grid grid-cols-6 w-full max-w-lg mx-auto px-1">
        {navItems.map((item) => {
          const isActive = item.exact
            ? pathname === item.href
            : pathname.startsWith(item.href);

          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`min-w-0 w-full flex flex-col items-center justify-center py-1 px-0.5 rounded-xl transition-colors select-none text-center ${
                isActive
                  ? 'text-brand-600 font-bold'
                  : 'text-slate-500 hover:text-slate-900 font-medium'
              }`}
            >
              <div className="relative flex items-center justify-center">
                <Icon
                  className={`w-5 h-5 shrink-0 ${
                    isActive ? 'text-brand-600 stroke-[2.3]' : 'text-slate-500'
                  }`}
                />
              </div>
              <span className="w-full truncate text-[9px] min-[360px]:text-[10px] min-[400px]:text-[10.5px] mt-0.5 tracking-tighter leading-tight">
                {item.name}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
