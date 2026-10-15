'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Menu, X } from 'lucide-react';
import Button from '@/components/ui/Button';

export default function Navbar({ session }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <>
      <header 
        className="fixed top-0 left-0 right-0 z-50 w-full glass-nav shadow-sm transition-all duration-200"
        style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 flex items-center justify-center group-hover:scale-105 transition-transform relative">
              <Image src="/cobascan-logo.png" alt="COBASCAN" width={32} height={32} priority className="w-full h-full object-contain" />
            </div>
            <span className="heading-premium text-xl">COBASCAN</span>
          </Link>

          {/* Desktop Links */}
          <nav className="hidden md:flex items-center gap-8">
            <Link href="/#cara-kerja" className="text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors">
              Cara Kerja
            </Link>
            <Link href="/#keunggulan" className="text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors">
              Keunggulan
            </Link>
            <Link href="/#solusi" className="text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors">
              Solusi Bisnis
            </Link>
            <Link href="/#harga" className="text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors">
              Harga
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

            {/* Mobile Menu Toggle (Garis 3) */}
            <button 
              type="button"
              aria-label={isMobileMenuOpen ? 'Tutup navigasi' : 'Buka navigasi'}
              className="md:hidden flex items-center justify-center min-w-[44px] min-h-[44px] text-slate-700 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 rounded-lg transition-colors"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {isMobileMenuOpen && (
          <div className="md:hidden w-full bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xl px-5 py-4 flex flex-col gap-1 transition-all">
            <Link 
              href="/#cara-kerja" 
              className="text-sm font-semibold text-slate-800 hover:text-blue-600 py-2.5 px-3 rounded-lg hover:bg-slate-50 transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Cara Kerja
            </Link>
            <Link 
              href="/#keunggulan" 
              className="text-sm font-semibold text-slate-800 hover:text-blue-600 py-2.5 px-3 rounded-lg hover:bg-slate-50 transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Keunggulan
            </Link>
            <Link 
              href="/#solusi" 
              className="text-sm font-semibold text-slate-800 hover:text-blue-600 py-2.5 px-3 rounded-lg hover:bg-slate-50 transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Solusi Bisnis
            </Link>
            <Link 
              href="/#harga" 
              className="text-sm font-semibold text-slate-800 hover:text-blue-600 py-2.5 px-3 rounded-lg hover:bg-slate-50 transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Harga
            </Link>
            
            <div className="pt-3 mt-1 border-t border-slate-100">
              {session?.user ? (
                <Link href="/dashboard" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button variant="primary" className="w-full justify-center !rounded-xl font-bold py-2.5 shadow-sm shadow-blue-500/20">
                    Dashboard
                  </Button>
                </Link>
              ) : (
                <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button variant="primary" className="w-full justify-center !rounded-xl font-bold py-2.5 shadow-sm shadow-blue-500/20">
                    Masuk Dashboard
                  </Button>
                </Link>
              )}
            </div>
          </div>
        )}
      </header>
      {/* Spacer agar konten tidak tertutup fixed header */}
      <div className="h-16 w-full shrink-0" />
    </>
  );
}
