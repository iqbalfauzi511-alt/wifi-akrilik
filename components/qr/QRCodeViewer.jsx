'use client';

import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { Download, Copy, Check, ExternalLink } from 'lucide-react';
import Button from '@/components/ui/Button';

export default function QRCodeViewer({
  code,
  size = 260,
  showActions = true,
  subtitle,
  path = '',
  customUrl,
}) {
  const [dataUrl, setDataUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const [isGenerating, setIsGenerating] = useState(true);

  // Compute full target URL
  const origin =
    typeof window !== 'undefined' && window.location.origin
      ? window.location.origin
      : (process.env.NEXT_PUBLIC_APP_URL && !process.env.NEXT_PUBLIC_APP_URL.includes('supabase.co')
          ? process.env.NEXT_PUBLIC_APP_URL
          : 'https://wifi-akrilik.vercel.app');
  const targetUrl = customUrl || `${origin}/q/${code}${path}`;

  useEffect(() => {
    let isMounted = true;
    async function generate() {
      try {
        setIsGenerating(true);
        const url = await QRCode.toDataURL(targetUrl, {
          width: size * 2,
          margin: 2,
          errorCorrectionLevel: 'H',
          color: {
            dark: '#0f172a', // slate-900
            light: '#ffffff',
          },
        });
        if (isMounted) {
          setDataUrl(url);
          setIsGenerating(false);
        }
      } catch (err) {
        console.error('QR generation error:', err);
        setIsGenerating(false);
      }
    }
    generate();
    return () => {
      isMounted = false;
    };
  }, [code, targetUrl, size]);

  const handleCopy = () => {
    navigator.clipboard.writeText(targetUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const cleanSuffix = path ? `-${path.replace(/[^a-zA-Z0-9_-]/g, '')}` : '';

  const handleDownloadPng = () => {
    if (!dataUrl) return;
    const link = document.createElement('a');
    link.download = `${code}${cleanSuffix}.png`;
    link.href = dataUrl;
    link.click();
  };

  const handleDownloadSvg = async () => {
    try {
      const svgString = await QRCode.toString(targetUrl, {
        type: 'svg',
        margin: 2,
        errorCorrectionLevel: 'H',
        color: {
          dark: '#0f172a',
          light: '#ffffff',
        },
      });
      const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.download = `${code}${cleanSuffix}.svg`;
      link.href = url;
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to generate SVG:', err);
    }
  };

  return (
    <div className="flex flex-col items-center">
      {/* Physical Acrylic-Style Frame Preview */}
      <div className="relative p-5 bg-white rounded-3xl border-2 border-slate-200/90 shadow-xl transition-transform hover:scale-[1.01]">
        <div className="text-center mb-3">
          <p className="text-[10px] uppercase font-bold tracking-widest text-slate-400">
            COBASCAN QR &bull; NFC
          </p>
          <p className="text-xs font-mono font-bold text-slate-700 mt-0.5">{code}</p>
        </div>

        <div
          className="bg-white rounded-2xl flex items-center justify-center p-2 overflow-hidden"
          style={{ width: size, height: size }}
        >
          {isGenerating ? (
            <div className="w-10 h-10 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin" />
          ) : dataUrl ? (
            <img
              src={dataUrl}
              alt={`QR Code ${code}`}
              className="w-full h-full object-contain select-none"
            />
          ) : (
            <p className="text-xs text-slate-400">Gagal memuat QR</p>
          )}
        </div>

        <div className="text-center mt-3 pt-2.5 border-t border-slate-100">
          <p className="text-[11px] font-medium text-slate-500">
            {subtitle || 'Scan QR atau Tap NFC'}
          </p>
        </div>
      </div>

      {showActions && (
        <div className="w-full mt-5 space-y-2.5">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1 text-xs"
              onClick={handleDownloadPng}
            >
              <Download className="w-3.5 h-3.5" />
              Download PNG
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="flex-1 text-xs"
              onClick={handleDownloadSvg}
            >
              <Download className="w-3.5 h-3.5" />
              Download SVG
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="flex-1 text-xs border border-slate-200"
              onClick={handleCopy}
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-600">URL Tersalin!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  Salin URL Cobascan
                </>
              )}
            </Button>
            <a
              href={`/q/${code}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors"
              title="Buka halaman scan"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
