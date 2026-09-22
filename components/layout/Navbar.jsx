import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { QrCode, ArrowRight, ShieldCheck } from 'lucide-react';
import Button from '@/components/ui/Button';

export default function Navbar({ session }) {
  return (
    <header className="sticky top-0 z-40 w-full glass-nav">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 flex items-center justify-center group-hover:scale-105 transition-transform relative">
            <Image src="/logo.png" alt="Cobascan" width={100} height={100} priority className="w-full h-full object-contain drop-shadow-sm" />
          </div>
          <div>
            <span className="heading-premium text-lg">Cobascan</span>
            <span className="ml-1.5 text-[11px] font-bold px-1.5 py-0.5 rounded-md bg-[#F0FDF4] text-[#15803D] border border-[#BBF7D0] tracking-wide">
              QR • NFC
            </span>
          </div>
        </Link>

        {/* Navigation Actions */}
        <div className="flex items-center gap-3">
          {session?.user ? (
            <Link href="/dashboard">
              <Button variant="primary" size="sm" className="gap-1.5">
                Dashboard
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          ) : (
            <>
              <Link href="/login">
                <Button variant="primary" size="sm">
                  Masuk Dashboard
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
