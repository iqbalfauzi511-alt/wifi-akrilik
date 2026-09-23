'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  QrCode,
  Settings,
  Users,
} from 'lucide-react';

export default function MobileBottomNav({ role = 'customer' }) {
  const pathname = usePathname();

  const customerNav = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, exact: true },
    { name: 'Cobascan', href: '/dashboard/qr', icon: QrCode },
    { name: 'Pengaturan', href: '/dashboard/settings', icon: Settings },
  ];

  const adminNav = [
    { name: 'Ringkasan', href: '/admin', icon: LayoutDashboard, exact: true },
    { name: 'Cobascan', href: '/admin/qr', icon: QrCode },
    { name: 'Users', href: '/admin/users', icon: Users },
  ];

  const isAdminView = role === 'admin' && pathname.startsWith('/admin');
  const navItems = isAdminView ? adminNav : customerNav;

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/90 shadow-lg px-2 py-1 flex items-center justify-around">
      {navItems.map((item) => {
        const isActive = item.exact
          ? pathname === item.href
          : pathname.startsWith(item.href);

        const Icon = item.icon;

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-xl transition-all duration-150 select-none ${
              isActive
                ? 'text-brand-600 font-bold scale-105'
                : 'text-slate-500 hover:text-slate-900 font-medium'
            }`}
          >
            <Icon className={`w-5 h-5 ${isActive ? 'text-brand-600 stroke-[2.5]' : 'text-slate-500'}`} />
            <span className="text-[10px] mt-0.5 tracking-tight">{item.name}</span>
          </Link>
        );
      })}
    </div>
  );
}
