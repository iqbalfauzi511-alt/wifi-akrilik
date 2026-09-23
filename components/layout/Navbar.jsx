'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Menu, X } from 'lucide-react';
import Button from '@/components/ui/Button';

export default function Navbar({ session }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full glass-nav">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 flex items-center justify-center group-hover:scale-105 transition-transform relative mix-blend-multiply">
            <Image src="/logo.png" alt="Cobascan" width={100} height={100} priority className="w-full h-full object-contain" />
          </div>
          <div>
            <span className="heading-premium text-lg">Cobascan</span>
            <span className="ml-1.5 text-[11px] font-bold px-1.5 py-0.5 rounded-md bg-[#F0FDF4] text-[#15803D] border border-[#BBF7D0] tracking-wide hidden sm:inline-block">
              QR • NFC
            </span>
          </div>
        </Link>

        {/* Desktop Links */}
        <nav className="hidden md:flex items-center gap-8">
          <Link href="/#cara-kerja" className="text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors">
            Cara Kerja
          </Link>
          <Link href="/#keunggulan" className="text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors">
            Keunggulan
          </Link>
          <Link href="/#harga" className="text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors">
            Harga
          </Link>
          <Link href="/#solusi" className="text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors">
            Solusi Bisnis
          </Link>
        </nav>

        {/* Navigation Actions */}
        <div className="flex items-center gap-3">
          {session?.user ? (
            <Link href="/dashboard" className="hidden sm:block">
              <Button variant="primary" size="sm" className="!rounded-full px-5 font-bold shadow-sm shadow-blue-500/20">
                Dashboard
              </Button>
            </Link>
          ) : (
            <Link href="/login" className="hidden sm:block">
              <Button variant="primary" size="sm" className="!rounded-full px-5 font-bold shadow-sm shadow-blue-500/20">
                Masuk Dashboard
              </Button>
            </Link>
          )}

          {/* Mobile Menu Toggle */}
          <button 
            type="button"
            aria-label={isMobileMenuOpen ? 'Tutup navigasi' : 'Buka navigasi'}
            className="md:hidden p-2 text-slate-600 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 rounded-lg transition-colors"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-16 left-0 w-full bg-white border-b border-slate-200 shadow-lg py-4 px-4 flex flex-col gap-4">
          <Link 
            href="/#cara-kerja" 
            className="text-sm font-bold text-slate-700 py-2 border-b border-slate-100"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Cara Kerja
          </Link>
          <Link 
            href="/#spesifikasi" 
            className="text-sm font-bold text-slate-700 py-2 border-b border-slate-100"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Keunggulan
          </Link>
          <Link 
            href="/#harga" 
            className="text-sm font-bold text-slate-700 py-2 border-b border-slate-100"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Harga
          </Link>
          
          <div className="pt-2">
            {session?.user ? (
              <Link href="/dashboard" onClick={() => setIsMobileMenuOpen(false)}>
                <Button variant="primary" className="w-full justify-center">
                  Dashboard
                </Button>
              </Link>
            ) : (
              <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}>
                <Button variant="primary" className="w-full justify-center">
                  Masuk Dashboard
                </Button>
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
