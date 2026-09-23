'use client';

import React, { useState, useRef, useEffect } from 'react';
import { UploadCloud, Image as ImageIcon, Link as LinkIcon, X, Check, RefreshCw } from 'lucide-react';
import Button from './Button';

/**
 * Modern Logo Uploader with client-side image compression & URL support
 */
export default function LogoUploader({
  initialLogo = '',
  name = 'logoUrl',
  label = 'Logo Bisnis',
  helperText = 'Tampilkan identitas brand Anda di halaman scan pengunjung.',
}) {
  const [logo, setLogo] = useState(initialLogo || '');
  const [activeTab, setActiveTab] = useState('upload'); // 'upload' | 'url'
  const [urlInput, setUrlInput] = useState('');
  const [isCompressing, setIsCompressing] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (initialLogo) {
      setLogo(initialLogo);
      if (/^https?:\/\//i.test(initialLogo)) {
        setUrlInput(initialLogo);
      }
    }
  }, [initialLogo]);

  // Client-side image compressor using HTML5 Canvas (max 300x300, ~25-40KB)
  const compressImage = (file) => {
    return new Promise((resolve, reject) => {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        reject(new Error('File harus berupa format gambar (PNG, JPG, WebP, SVG).'));
        return;
      }

      // If SVG, read text/data directly
      if (file.type === 'image/svg+xml') {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.onerror = (err) => reject(err);
        reader.readAsDataURL(file);
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const maxDim = 320;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > maxDim) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            }
          } else {
            if (height > maxDim) {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);

          // Try WebP first, fallback to JPEG
          try {
            const webpData = canvas.toDataURL('image/webp', 0.85);
            if (webpData && webpData.startsWith('data:image/webp')) {
              resolve(webpData);
              return;
            }
          } catch (e) {
            // fallback
          }

          const jpegData = canvas.toDataURL('image/jpeg', 0.85);
          resolve(jpegData);
        };
        img.onerror = () => reject(new Error('Gagal membaca data gambar'));
        img.src = e.target.result;
      };
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(file);
    });
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await processFile(file);
  };

  const processFile = async (file) => {
    setUploadError('');
    setIsCompressing(true);
    try {
      const compressedDataUrl = await compressImage(file);
      setLogo(compressedDataUrl);
    } catch (err) {
      setUploadError(err.message || 'Gagal memproses gambar');
    } finally {
      setIsCompressing(false);
    }
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      await processFile(file);
    }
  };

  const handleApplyUrl = () => {
    const trimmed = urlInput.trim();
    if (!trimmed) {
      setUploadError('URL gambar tidak boleh kosong');
      return;
    }
    if (!/^https?:\/\//i.test(trimmed)) {
      setUploadError('URL gambar harus diawali dengan http:// atau https://');
      return;
    }
    setUploadError('');
    setLogo(trimmed);
  };

  const handleRemove = () => {
    setLogo('');
    setUrlInput('');
    setUploadError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-2">
      {/* Hidden input to transmit value to Server Actions */}
      <input type="hidden" name={name} value={logo} />

      {/* Label and Header */}
      <div className="flex items-center justify-between">
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
          {label}
        </label>
        <div className="flex items-center gap-1 text-[11px]">
          <button
            type="button"
            onClick={() => setActiveTab('upload')}
            className={`px-2 py-0.5 rounded-md font-semibold transition-colors ${
              activeTab === 'upload'
                ? 'bg-slate-200/80 text-slate-900'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            File
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('url')}
            className={`px-2 py-0.5 rounded-md font-semibold transition-colors ${
              activeTab === 'url'
                ? 'bg-slate-200/80 text-slate-900'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Link URL
          </button>
        </div>
      </div>

      {/* If Logo already set: Sleek preview card */}
      {logo ? (
        <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-2xs flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-200/80 p-1 flex items-center justify-center shrink-0 overflow-hidden shadow-inner">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={logo}
                alt="Logo Bisnis"
                className="w-full h-full object-contain rounded-xl"
              />
            </div>
            <div className="text-xs">
              <span className="inline-flex items-center gap-1 font-bold text-slate-900">
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span>Logo Aktif</span>
              </span>
              <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1 max-w-[200px] sm:max-w-xs">
                {logo.startsWith('data:') ? 'File terkompresi (~25KB)' : logo}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => {
                if (fileInputRef.current) fileInputRef.current.click();
              }}
              className="px-2.5 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Ganti
            </button>
            <button
              type="button"
              onClick={handleRemove}
              className="p-1.5 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 transition-colors"
              title="Hapus Logo"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : activeTab === 'upload' ? (
        /* File Upload Dropzone */
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragOver(true);
          }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`p-5 rounded-2xl border-2 border-dashed transition-all cursor-pointer text-center select-none ${
            isDragOver
              ? 'border-brand-500 bg-brand-50/50'
              : 'border-slate-200/90 bg-slate-50/60 hover:bg-slate-50 hover:border-slate-300'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
          <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 text-slate-600 shadow-2xs flex items-center justify-center mx-auto mb-2">
            {isCompressing ? (
              <RefreshCw className="w-5 h-5 animate-spin text-brand-600" />
            ) : (
              <UploadCloud className="w-5 h-5 text-brand-600" />
            )}
          </div>
          <p className="text-xs font-bold text-slate-800">
            {isCompressing ? 'Mengoptimasi gambar...' : 'Klik atau seret logo ke sini'}
          </p>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Format PNG, JPG, WebP, SVG (Otomatis disesuaikan untuk smartphone)
          </p>
        </div>
      ) : (
        /* URL Input Field */
        <div className="flex gap-2">
          <input
            type="url"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            placeholder="https://domain.com/logo.png"
            className="flex-1 rounded-xl border border-slate-200 px-3 py-2 text-xs font-medium focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
          />
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={handleApplyUrl}
            className="text-xs shrink-0"
          >
            Terapkan
          </Button>
        </div>
      )}

      {uploadError && (
        <p className="text-xs text-rose-600 font-medium">{uploadError}</p>
      )}

      {helperText && !uploadError && (
        <p className="text-[11px] text-slate-500 leading-relaxed">{helperText}</p>
      )}
    </div>
  );
}
