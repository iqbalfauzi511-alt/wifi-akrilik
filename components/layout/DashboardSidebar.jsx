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
} from 'lucide-react';
import { logoutAction } from '@/lib/actions/auth-actions';

export default function DashboardSidebar({ role = 'customer', session }) {
  const pathname = usePathname();
  const isAdmin = role === 'admin' || pathname.startsWith('/admin');

  // Navigation items matching Image 3 design
  const navItems = isAdmin
    ? [
        { name: 'Dashboard', href: '/admin', icon: LayoutDashboard, exact: true },
        { name: 'Perangkat', href: '/admin/qr', icon: TabletSmartphone },
        { name: 'Bisnis', href: '/admin/users', icon: Store },
        { name: 'Statistik', href: '/admin#statistik', icon: BarChart3 },
        { name: 'Pengguna', href: '/admin/users', icon: Users },
        { name: 'QR Code', href: '/admin/qr', icon: QrCode },
        { name: 'Pengaturan', href: '/admin/users', icon: Settings },
      ]
    : [
        { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, exact: true },
        { name: 'Perangkat', href: '/dashboard/qr', icon: TabletSmartphone },
        { name: 'Bisnis', href: '/dashboard/settings', icon: Store },
        { name: 'Statistik', href: '/dashboard#statistik', icon: BarChart3 },
        { name: 'Aktivasi Baru', href: '/dashboard/setup', icon: QrCode },
        { name: 'Pengaturan', href: '/dashboard/settings', icon: Settings },
      ];

  const userName = isAdmin
    ? 'Admin'
    : session?.user?.name || session?.user?.email?.split('@')[0] || 'Pemilik Usaha';
  const userSub = isAdmin ? 'Administrator' : session?.user?.email || 'Partner Cobascan';

  return (
    <aside className="hidden lg:flex w-64 bg-white border-r border-slate-200 flex-col shrink-0 min-h-screen sticky top-0 h-screen justify-between z-30">
      <div>
        {/* Brand Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 flex items-center justify-center relative mix-blend-multiply group-hover:scale-105 transition-transform">
              <Image src="/logo.png" alt="Cobascan" width={100} height={100} priority className="w-full h-full object-contain" />
            </div>
            <div>
              <span className="font-extrabold text-slate-900 text-lg tracking-tight block leading-none">
                cobascan
              </span>
              <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">
                QR • NFC
              </span>
            </div>
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
