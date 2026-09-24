'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  TabletSmartphone,
  Store,
  BarChart3,
  Users,
  QrCode,
  Settings,
  ChevronRight,
  User as UserIcon,
  LogOut,
  Star,
  Wifi,
} from 'lucide-react';
import { logoutAction } from '@/lib/actions/auth-actions';

export default function DashboardSidebar({ role = 'customer', session }) {
  const pathname = usePathname();
  const isAdmin = role === 'admin' || pathname.startsWith('/admin');

  // Navigation items matching user requirements
  const navItems = isAdmin
    ? [
        { name: 'Dashboard', href: '/admin', icon: LayoutDashboard, exact: true },
        { name: 'Bisnis', href: '/admin/businesses', icon: Store },
        { name: 'Perangkat', href: '/admin/devices', icon: TabletSmartphone },
        { name: 'Pengguna', href: '/admin/users', icon: Users },
        { name: 'Statistik', href: '/admin/stats', icon: BarChart3 },
        { name: 'Pengaturan', href: '/admin/settings', icon: Settings },
      ]
    : [
        { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, exact: true },
        { name: 'Perangkat', href: '/dashboard/devices', icon: TabletSmartphone },
        { name: 'Statistik', href: '/dashboard/stats', icon: BarChart3 },
        { name: 'Ulasan', href: '/dashboard/reviews', icon: Star },
        { name: 'Wi-Fi', href: '/dashboard/wifi', icon: Wifi },
        { name: 'Pengaturan', href: '/dashboard/settings', icon: Settings },
      ];

  const userName = isAdmin
    ? 'Admin Cobascan'
    : session?.user?.name || session?.user?.email?.split('@')[0] || 'Pemilik Bisnis';
  const userSub = isAdmin ? 'Administrator' : session?.business?.businessName || session?.user?.email || 'Pemilik Bisnis';

  return (
    <aside className="hidden lg:flex w-64 bg-white border-r border-slate-200 flex-col shrink-0 min-h-screen sticky top-0 h-screen justify-between z-30">
      <div>
        {/* Brand Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 flex items-center justify-center relative group-hover:scale-105 transition-transform">
              <Image src="/cobascan-logo.png" alt="Cobascan" width={32} height={32} priority className="w-full h-full object-contain" />
            </div>
            <span className="font-extrabold text-slate-900 text-xl tracking-tight block leading-none pt-0.5">
              Cobascan
            </span>
          </Link>
        </div>

        {/* Navigation Links */}
        <nav className="p-4 space-y-1">
          {navItems.map((item) => {
            const isActive = item.exact
              ? pathname === item.href
              : pathname.startsWith(item.href);

            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-blue-50/90 text-[#1A73E8]'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <item.icon
                  className={`w-4 h-4 ${
                    isActive ? 'text-[#1A73E8]' : 'text-slate-500'
                  }`}
                />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom Profile Pill Card matching Image 3 */}
      <div className="p-4 border-t border-slate-100">
        <div className="flex items-center justify-between p-2 rounded-2xl bg-slate-50 border border-slate-100">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-full bg-[#1A73E8] text-white flex items-center justify-center shrink-0">
              <UserIcon className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="text-xs font-bold text-slate-900 truncate">
                {userName}
              </div>
              <div className="text-[10px] text-slate-500 truncate">
                {userSub}
              </div>
            </div>
          </div>
          <form action={logoutAction}>
            <button
              type="submit"
              title="Keluar"
              className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </aside>
  );
}
