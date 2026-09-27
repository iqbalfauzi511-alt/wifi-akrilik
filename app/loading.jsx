import React from 'react';
import Image from 'next/image';

export default function Loading() {
  return (
    <div className="min-h-[70vh] w-full flex flex-col items-center justify-center space-y-5">
      <div className="relative w-24 h-24">
        {/* Pulsing effect behind */}
        <div className="absolute inset-0 bg-brand-500 rounded-3xl animate-ping opacity-20" />
        
        {/* Logo Container */}
        <div className="relative w-full h-full bg-white rounded-3xl shadow-xl border border-slate-100/50 flex items-center justify-center p-4 animate-pulse">
          <div className="relative w-full h-full">
            <Image 
              src="/cobascan-logo.png" 
              alt="Cobascan Loading" 
              fill 
              sizes="(max-width: 768px) 100vw, 96px"
              className="object-contain drop-shadow-sm"
              priority
            />
          </div>
        </div>
      </div>
      <p className="text-sm font-bold text-slate-500 animate-pulse tracking-wide">
        Memuat...
      </p>
    </div>
  );
}
