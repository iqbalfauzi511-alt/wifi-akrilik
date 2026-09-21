import React from 'react';
import Link from 'next/link';
import { Wifi, ArrowRight, ShieldCheck } from 'lucide-react';
import Button from '@/components/ui/Button';

export default function Navbar({ session }) {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-xl bg-brand-600 flex items-center justify-center text-white shadow-md shadow-brand-500/20 group-hover:scale-105 transition-transform">
            <Wifi className="w-5 h-5" />
          </div>
          <div>
            <span className="font-bold text-slate-900 text-lg tracking-tight">Smart Wi-Fi</span>
            <span className="ml-1 text-xs font-semibold px-1.5 py-0.5 rounded bg-brand-50 text-brand-700 border border-brand-200/60">
              QR
            </span>
          </div>
        </Link>

        {/* Navigation Actions */}
        <div className="flex items-center gap-3">
          {session?.user ? (
            session.role === 'admin' ? (
              <Link href="/admin">
                <Button variant="primary" size="sm" className="gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-white" />
                  Admin Panel
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            ) : (
              <Link href="/dashboard">
                <Button variant="primary" size="sm" className="gap-1.5">
                  Dashboard
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            )
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost" size="sm">
                  Masuk
                </Button>
              </Link>
              <Link href="/login">
                <Button variant="primary" size="sm">
                  Mulai Sekarang
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
