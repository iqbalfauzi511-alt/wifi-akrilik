'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Star,
  Phone,
  Wifi,
  KeyRound,
  Check,
  LogOut,
  AlertCircle,
  WifiOff,
  Layers,
  QrCode,
  Users,
  Lock,
  Eye,
  EyeOff,
  Plus,
  ShieldCheck,
  MapPin,
} from 'lucide-react';
import Image from 'next/image';
import { ownerChangePinAction, ownerAddDeviceAction, ownerChangeWaAction } from '@/lib/actions/owner-auth-actions';
import { logoutAction } from '@/lib/actions/auth-actions';
import DeviceList from './DeviceList';
import LogoUploader from '@/components/ui/LogoUploader';
import ScanActivityChart from '@/components/charts/ScanActivityChart';

function Field({ label, helperText, error, children }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider">{label}</label>
      {children}
      {helperText && !error && (
        <p className="text-[11px] text-slate-400 leading-relaxed">{helperText}</p>
      )}
      {error && <p className="text-[11px] text-rose-500 font-medium">{error}</p>}
    </div>
  );
}

function TextInput({ name, type = 'text', defaultValue, placeholder, required, icon: Icon }) {
  return (
    <div className="relative flex items-center">
      {Icon && (
        <div className="absolute left-3.5 flex items-center text-slate-400 pointer-events-none">
          <Icon className="w-4 h-4" />
        </div>
      )}
      <input
        type={type}
        name={name}
        defaultValue={defaultValue || ''}
        placeholder={placeholder}
        required={required}
        className={`w-full py-2.5 pr-4 ${Icon ? 'pl-10' : 'pl-4'} rounded-xl border border-slate-200 bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 transition-colors`}
      />
    </div>
  );
}

export default function OwnerSettingsPage({ business, businesses = [], userEmail, userName, userWa, qrList = [], scanLogs = [], stats = {} }) {
  const router = useRouter();

  const initialStores = businesses.length > 0 ? businesses : (business ? [business] : []);
  const [stores, setStores] = useState(initialStores);
  const [selectedId, setSelectedId] = useState(business?.id || initialStores[0]?.id || '');
  const activeStore = stores.find((s) => s.id === selectedId) || stores[0] || null;

  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Inline branch settings state
  const [showBranchSettings, setShowBranchSettings] = useState(false);
  const [branchSubmitting, setBranchSubmitting] = useState(false);
  const [branchMsg, setBranchMsg] = useState(null);
  const [branchWifiEnabled, setBranchWifiEnabled] = useState(Boolean(activeStore?.wifiEnabled));

  // PIN change state
  const [showPinSection, setShowPinSection] = useState(false);
  const [oldPin, setOldPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmNewPin, setConfirmNewPin] = useState('');
  const [showPins, setShowPins] = useState(false);
  const [pinSubmitting, setPinSubmitting] = useState(false);
  const [pinMsg, setPinMsg] = useState(null);

  // Add device state
  const [showAddDevice, setShowAddDevice] = useState(false);
  const [newDeviceCode, setNewDeviceCode] = useState('');
  const [addDeviceTargetBizId, setAddDeviceTargetBizId] = useState('');
  const [addDeviceMode, setAddDeviceMode] = useState('existing'); // 'existing' | 'new'
  const [newBranchNameVal, setNewBranchNameVal] = useState('');
  const [addDeviceName, setAddDeviceName] = useState('');
  const [addDeviceMapsUrl, setAddDeviceMapsUrl] = useState('');
  const [addDeviceWifiEnabled, setAddDeviceWifiEnabled] = useState(false);
  const [addDeviceWifiName, setAddDeviceWifiName] = useState('');
  const [addDeviceWifiPassword, setAddDeviceWifiPassword] = useState('');
  const [addDeviceSubmitting, setAddDeviceSubmitting] = useState(false);
  const [addDeviceMsg, setAddDeviceMsg] = useState(null);

  const [isGeneratingLink, setIsGeneratingLink] = useState(false);
  const [generateError, setGenerateError] = useState('');
  const [generateSuccess, setGenerateSuccess] = useState(false);

  // WA change state
  const [showWaSection, setShowWaSection] = useState(false);
  const [newWa, setNewWa] = useState('');
  const [waPin, setWaPin] = useState('');
  const [waSubmitting, setWaSubmitting] = useState(false);
  const [waMsg, setWaMsg] = useState(null);

  const handleStoreChange = (id) => {
    setSelectedId(id);
  };

  const openAddDevice = () => {
    setAddDeviceTargetBizId(activeStore?.id || stores[0]?.id || '');
    setAddDeviceMode('existing');
    setNewBranchNameVal('');
    setNewDeviceCode('');
    setAddDeviceName('');
    setAddDeviceMapsUrl(activeStore?.googleMapsReviewUrl || activeStore?.googleMapsUrl || '');
    setAddDeviceWifiEnabled(Boolean(activeStore?.wifiEnabled));
    setAddDeviceWifiName(activeStore?.wifiName || '');
    setAddDeviceWifiPassword(activeStore?.wifiPassword || '');
    setAddDeviceMsg(null);
    setGenerateError('');
    setGenerateSuccess(false);
    setShowAddDevice(true);
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch {}
    try {
      await logoutAction();
    } catch {}
    window.location.href = '/login';
  };

  const handleChangePin = async (e) => {
    e.preventDefault();
    setPinMsg(null);
    if (newPin !== confirmNewPin) {
      setPinMsg({ type: 'error', text: 'Konfirmasi PIN baru tidak cocok.' });
      return;
    }
    setPinSubmitting(true);
    const result = await ownerChangePinAction({ userId: null, oldPin, newPin });
    setPinSubmitting(false);
    if (result?.success) {
      setPinMsg({ type: 'success', text: 'PIN berhasil diubah.' });
      setOldPin(''); setNewPin(''); setConfirmNewPin('');
      setTimeout(() => setShowPinSection(false), 2000);
    } else {
      setPinMsg({ type: 'error', text: result?.error || 'Gagal ganti PIN.' });
    }
  };

  const handleAddDevice = async (e) => {
    e.preventDefault();
    setAddDeviceMsg(null);
    if (addDeviceMode === 'new' && !newBranchNameVal.trim()) {
      setAddDeviceMsg({ type: 'error', text: 'Nama cabang baru tidak boleh kosong.' });
      return;
    }
    setAddDeviceSubmitting(true);
    const result = await ownerAddDeviceAction({
      userId: null,
      qrCode: newDeviceCode,
      deviceName: addDeviceName,
      googleMapsReviewUrl: addDeviceMapsUrl,
      wifiEnabled: addDeviceWifiEnabled,
      wifiName: addDeviceWifiName,
      wifiPassword: addDeviceWifiPassword,
    });
    setAddDeviceSubmitting(false);
    if (result?.success) {
      setAddDeviceMsg({ type: 'success', text: result.message });
      setNewDeviceCode('');
      setNewBranchNameVal('');
      setTimeout(() => { setShowAddDevice(false); router.refresh(); }, 2000);
    } else {
      setAddDeviceMsg({ type: 'error', text: result?.error || 'Gagal menambahkan perangkat.' });
    }
  };

  const handleChangeWa = async (e) => {
    e.preventDefault();
    setWaMsg(null);
    setWaSubmitting(true);
    const result = await ownerChangeWaAction({ userId: null, newWa, pin: waPin });
    setWaSubmitting(false);
    if (result?.success) {
      setWaMsg({ type: 'success', text: result.message });
      setNewWa(''); setWaPin('');
      setTimeout(() => { setShowWaSection(false); router.refresh(); }, 2000);
    } else {
      setWaMsg({ type: 'error', text: result?.error || 'Gagal ganti nomor WhatsApp.' });
    }
  };

  const filteredQrList = activeStore ? qrList.filter(q => q.businessId === activeStore.id) : [];

  // Stats computed from real data - must be before any early return
  const totalDevices = stats.totalQrCount || 0;
  const totalScans = stats.totalScans || 0;
  const totalReview = stats.actionReview || 0;
  const totalActionScans = (stats.actionReview || 0) + (stats.actionWifi || 0) + (stats.actionOther || 0);

  if (!activeStore) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <p className="text-sm text-slate-500">Bisnis belum terdaftar. Scan QR perangkat Cobascan Anda untuk memulai.</p>
      </div>
    );
  }

  const handleGenerateReviewLink = async () => {
    if (!addDeviceMapsUrl) {
      setGenerateError('Masukkan link Google Maps terlebih dahulu.');
      return;
    }
    setGenerateError('');
    setGenerateSuccess(false);
    setIsGeneratingLink(true);
    try {
      const { generateReviewLinkAction } = await import('@/lib/actions/maps-actions');
      const res = await generateReviewLinkAction(addDeviceMapsUrl);
      if (res.success) {
        setAddDeviceMapsUrl(res.result);
        setGenerateSuccess(res.note === 'fallback' ? 'fallback' : true);
      } else {
        setGenerateError(res.error);
      }
    } catch {
      setGenerateError('Gagal memproses link. Coba lagi.');
    } finally {
      setIsGeneratingLink(false);
    }
  };

  const reviewCount = stats.actionReview || 0;
  const wifiCount = stats.actionWifi || 0;
  const totalDoughnut = reviewCount + wifiCount;
  const reviewPercent = totalDoughnut > 0 ? Math.round((reviewCount / totalDoughnut) * 100) : 0;

  return (
    <div className="min-h-screen bg-[#F7F8FA]">
      {/* Top Bar */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center relative shrink-0">
              <Image src="/cobascan-logo.png" alt="Cobascan" width={36} height={36} className="w-full h-full object-contain" priority />
            </div>
            <div className="flex items-center gap-2 min-w-0">
              <span className="font-extrabold text-slate-900 text-base sm:text-lg tracking-tight leading-none block truncate">COBASCAN</span>
              <span className="hidden sm:inline-block px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-xs font-medium truncate max-w-[200px]">
                {userName || 'Pemilik'}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <button
              type="button"
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="flex items-center justify-center h-8 sm:h-9 gap-1 px-2.5 sm:px-3.5 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors disabled:opacity-50 cursor-pointer"
              title="Keluar"
            >
              <LogOut className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden xs:inline sm:inline">{isLoggingOut ? '...' : 'Logout'}</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">

        {/* Profil Section */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-lg border border-slate-200 shadow-sm shrink-0">
              {(userName || 'P').charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base font-bold text-slate-900">{userName || 'Pemilik Bisnis'}</h2>
                <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[10px] font-bold border border-blue-100">
                  Owner
                </span>
              </div>
              <div className="flex items-center gap-1.5 mt-1 text-xs text-slate-500 font-medium font-mono">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                <span>{userWa || userEmail?.replace('@owner.cobascan.local', '') || '-'}</span>
              </div>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500 bg-slate-50 px-3.5 py-2 rounded-xl border border-slate-200">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-medium">Akun Terverifikasi</span>
          </div>
        </div>

        {/* 3 Bento Overview Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 lg:gap-5">

          <div className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-sm flex flex-col justify-between">
            <div className="flex items-center gap-2 mb-2 sm:mb-3">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <QrCode className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
              </div>
              <div className="text-[10px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wide">Perangkat</div>
            </div>
            <div className="text-xl sm:text-3xl font-black text-slate-900 leading-none">{stats.totalQrCount || 0}</div>
            <div className="text-[10px] sm:text-xs text-emerald-600 font-bold mt-1.5">{stats.activeQrCount || 0} Aktif</div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-sm flex flex-col justify-between">
            <div className="flex items-center gap-2 mb-2 sm:mb-3">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                <Users className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
              </div>
              <div className="text-[10px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wide">Total Scan</div>
            </div>
            <div className="text-xl sm:text-3xl font-black text-slate-900 leading-none">{totalScans.toLocaleString('id-ID')}</div>
            <div className="text-[10px] sm:text-xs text-emerald-600 font-bold mt-1.5">Pengunjung Riil</div>
          </div>

          <div 
            className="col-span-2 sm:col-span-1 bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-sm flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-2 sm:mb-3 gap-1">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center shrink-0">
                  <Star className="w-4 h-4 sm:w-4.5 sm:h-4.5 fill-amber-500" />
                </div>
                <div className="min-w-0">
                  <div className="text-[10px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">Klik Halaman Review</div>
                  <div className="sm:hidden text-base font-black text-slate-900 leading-tight mt-0.5">
                    {totalReview} <span className="text-[10px] font-bold text-amber-600">Klik</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="hidden sm:block text-xl sm:text-3xl font-black text-slate-900 leading-none">{totalReview}</div>
            <div className="text-[10px] sm:text-xs text-amber-600 font-semibold mt-1.5 flex items-center justify-between sm:justify-start gap-1">
              <span>Klik Menuju Google Maps</span>
            </div>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5">
          <div className="lg:col-span-2">
            <ScanActivityChart />
          </div>
          <div className="lg:col-span-1 bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex flex-col items-center">
            <h3 className="text-sm font-bold text-slate-900 w-full mb-6">Sumber Aksi Pengunjung</h3>
            
            {totalDoughnut > 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center w-full">
                {/* CSS Conic Gradient Doughnut */}
                <div 
                  className="w-36 h-36 rounded-full relative flex items-center justify-center shadow-inner mb-6"
                  style={{
                    background: `conic-gradient(#f59e0b ${reviewPercent}%, #3b82f6 ${reviewPercent}% 100%)`
                  }}
                >
                  <div className="w-24 h-24 bg-white rounded-full flex flex-col items-center justify-center absolute">
                    <span className="text-xs text-slate-400 font-medium">Total</span>
                    <span className="text-xl font-black text-slate-900">{totalDoughnut}</span>
                  </div>
                </div>

                <div className="w-full space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-amber-500" />
                      <span className="text-slate-600 font-medium">Klik Halaman Review</span>
                    </div>
                    <span className="font-bold text-slate-900">{reviewCount} <span className="text-xs text-slate-400 font-normal ml-1">({reviewPercent}%)</span></span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-blue-500" />
                      <span className="text-slate-600 font-medium">Akses Wi-Fi</span>
                    </div>
                    <span className="font-bold text-slate-900">{wifiCount} <span className="text-xs text-slate-400 font-normal ml-1">({100 - reviewPercent}%)</span></span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center">
                <div className="w-24 h-24 rounded-full border-[12px] border-slate-100 flex items-center justify-center mb-4">
                  <span className="text-slate-300">0</span>
                </div>
                <p className="text-xs text-slate-500">Belum ada aktivitas lanjutan tercatat</p>
              </div>
            )}
          </div>
        </div>



        {/* Devices Section */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="px-5 pt-5 pb-4 border-b border-slate-100 flex items-start sm:items-center justify-between gap-3">
            <div className="flex-1">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Layers className="w-4 h-4 text-slate-400 shrink-0" />
                <span>Perangkat ({filteredQrList.length})</span>
              </h2>
              <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">Klik <strong>Atur</strong> untuk setting nama lokasi, Wi-Fi, dan link Maps per perangkat.</p>
            </div>
            <button
              type="button"
              onClick={openAddDevice}
              className="flex items-center justify-center gap-1.5 px-3 py-2 sm:py-1.5 rounded-lg bg-slate-900 text-white text-[11px] sm:text-xs font-semibold hover:bg-slate-700 transition-colors shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tambah QR</span>
            </button>
          </div>

          <DeviceList
            qrList={filteredQrList}
            business={activeStore}
            businessName={activeStore.businessName}
            defaultWifiEnabled={activeStore.wifiEnabled}
          />
        </div>

        {/* Add Device Modal */}
        {showAddDevice && (
          <div className="fixed inset-0 z-[100] bg-white sm:bg-slate-900/80 sm:backdrop-blur-sm flex flex-col sm:items-center sm:justify-center p-0 sm:p-6 animate-in fade-in slide-in-from-bottom-4 sm:slide-in-from-bottom-0 duration-200">
            <div className="bg-white sm:rounded-2xl sm:border border-slate-200 sm:shadow-2xl w-full sm:max-w-sm h-full sm:h-auto sm:max-h-[90vh] overflow-y-auto flex flex-col">
              <div className="px-5 pt-5 sm:pt-4 pb-4 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10 shrink-0 shadow-sm sm:shadow-none">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center">
                    <QrCode className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">Tambah QR Baru</p>
                    <p className="text-[11px] text-slate-400">Kode dari stiker akrilik Cobascan</p>
                  </div>
                </div>
                <button type="button" onClick={() => setShowAddDevice(false)} className="text-slate-400 hover:text-slate-600 p-1">✕</button>
              </div>

              <form onSubmit={handleAddDevice} className="px-5 py-4 flex flex-col flex-1 space-y-4">
                {addDeviceMsg && (
                  <div className={`p-3 rounded-xl text-xs flex items-start gap-2 ${
                    addDeviceMsg.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'
                  }`}>
                    {addDeviceMsg.type === 'success' ? <Check className="w-4 h-4 shrink-0 mt-0.5" /> : <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />}
                    <span>{addDeviceMsg.text}</span>
                  </div>
                )}

                {/* QR Code input */}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">Kode Cobascan</label>
                  <div className="relative flex items-center">
                    <div className="absolute left-3.5 text-slate-400 pointer-events-none"><QrCode className="w-4 h-4" /></div>
                    <input
                      type="text"
                      value={newDeviceCode}
                      onChange={(e) => setNewDeviceCode(e.target.value.toUpperCase())}
                      placeholder="CS-XXXXXXX"
                      required
                      autoFocus
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm font-mono tracking-wider placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 transition-colors"
                    />
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">Tercetak di bawah stand akrilik. Contoh: CS-ABCD123</p>
                </div>

                <div className="border-t border-slate-100 pt-4 space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">Nama Usaha Tampilan (Opsional)</label>
                    <div className="relative flex items-center">
                      <div className="absolute left-3.5 text-slate-400 pointer-events-none"><MapPin className="w-4 h-4" /></div>
                      <input
                        type="text"
                        value={addDeviceName}
                        onChange={(e) => setAddDeviceName(e.target.value)}
                        placeholder="Misal: Kopi Senja Cabang B"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 transition-colors"
                      />
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1">Kosongkan jika ingin pakai nama profil utama ({activeStore?.businessName}).</p>
                  </div>
                  
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">Link Google Maps (Opsional)</label>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <div className="relative flex-1">
                        <div className="absolute top-3 left-3.5 text-slate-400 pointer-events-none"><Star className="w-4 h-4" /></div>
                        <input
                          type="url"
                          value={addDeviceMapsUrl}
                          onChange={(e) => {
                            setAddDeviceMapsUrl(e.target.value);
                            setGenerateSuccess(false);
                          }}
                          placeholder="https://g.page/r/..."
                          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 transition-colors"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={handleGenerateReviewLink}
                        disabled={isGeneratingLink || !addDeviceMapsUrl}
                        className="w-full sm:w-auto px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-1.5 shrink-0"
                      >
                        {isGeneratingLink ? 'Memproses...' : '🔍 Generate Review Link'}
                      </button>
                    </div>
                    {generateError && <p className="mt-1.5 text-xs text-rose-500 font-medium">{generateError}</p>}
                    {generateSuccess && !generateError && (
                      <p className={`mt-1.5 text-[11px] font-medium flex items-center gap-1 ${generateSuccess === 'fallback' ? 'text-amber-600' : 'text-emerald-600'}`}>
                        <Check className="w-3 h-3" />
                        {generateSuccess === 'fallback'
                          ? 'Link disimpan. Pengunjung akan diarahkan ke halaman Maps bisnis Anda.'
                          : 'Berhasil diproses jadi link Review Google langsung!'}
                      </p>
                    )}
                  </div>

                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => setAddDeviceWifiEnabled(!addDeviceWifiEnabled)}
                      className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all ${
                        addDeviceWifiEnabled ? 'bg-slate-900 border-slate-900' : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${addDeviceWifiEnabled ? 'bg-white/20' : 'bg-slate-200'}`}>
                          {addDeviceWifiEnabled ? <Wifi className="w-3.5 h-3.5 text-white" /> : <WifiOff className="w-3.5 h-3.5 text-slate-500" />}
                        </div>
                        <div className="text-left">
                          <div className={`text-xs font-bold ${addDeviceWifiEnabled ? 'text-white' : 'text-slate-800'}`}>Fitur Wi-Fi</div>
                          <div className={`text-[10px] ${addDeviceWifiEnabled ? 'text-white/70' : 'text-slate-400'}`}>
                            {addDeviceWifiEnabled ? 'Aktif' : 'Nonaktif'}
                          </div>
                        </div>
                      </div>
                      <div className={`relative rounded-full transition-colors shrink-0 ${addDeviceWifiEnabled ? 'bg-white/30' : 'bg-slate-300'}`} style={{ width: '32px', height: '18px' }}>
                        <div className={`absolute top-0.5 bg-white rounded-full shadow-sm transition-transform ${addDeviceWifiEnabled ? 'translate-x-4' : 'translate-x-0.5'}`} style={{ width: '14px', height: '14px' }} />
                      </div>
                    </button>
                    {addDeviceWifiEnabled && (
                      <div className="mt-2 p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                        <div>
                          <label className="block text-[10px] font-semibold text-slate-600 uppercase tracking-wider mb-1">Nama Wi-Fi (SSID)</label>
                          <div className="relative flex items-center">
                            <div className="absolute left-3 text-slate-400 pointer-events-none"><Wifi className="w-3.5 h-3.5" /></div>
                            <input
                              type="text"
                              value={addDeviceWifiName}
                              onChange={(e) => setAddDeviceWifiName(e.target.value)}
                              className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-200 bg-white text-xs placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 transition-colors"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-[10px] font-semibold text-slate-600 uppercase tracking-wider mb-1">Password Wi-Fi</label>
                          <div className="relative flex items-center">
                            <div className="absolute left-3 text-slate-400 pointer-events-none"><KeyRound className="w-3.5 h-3.5" /></div>
                            <input
                              type="text"
                              value={addDeviceWifiPassword}
                              onChange={(e) => setAddDeviceWifiPassword(e.target.value)}
                              className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-200 bg-white text-xs placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 transition-colors"
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex gap-2 pt-4 mt-auto border-t sm:border-0 border-slate-100 pb-4 sm:pb-0">
                  <button type="button" onClick={() => setShowAddDevice(false)}
                    className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold text-sm hover:bg-slate-50 transition-colors">
                    Batal
                  </button>
                  <button type="submit"
                    disabled={addDeviceSubmitting || !newDeviceCode.trim()}
                    className="flex-1 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-60 transition-colors"
                  >
                    {addDeviceSubmitting
                      ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Menambahkan...</>
                      : <><Plus className="w-4 h-4" />Tambahkan</>
                    }
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}


        {/* Settings: PIN & WA side-by-side on desktop */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 items-start">
          {/* PIN Change Section */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
            <button
              type="button"
              onClick={() => { setShowPinSection((v) => !v); setPinMsg(null); }}
              className="w-full px-5 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div className="text-left min-w-0">
                  <p className="text-sm font-bold text-slate-900 truncate">Keamanan: Ganti PIN</p>
                  <p className="text-[11px] text-slate-400">Ubah PIN login dashboard Anda</p>
                </div>
              </div>
              <span className="text-xs text-slate-400 ml-2">{showPinSection ? '▲' : '▼'}</span>
            </button>

            {showPinSection && (
              <div className="px-5 pb-5 border-t border-slate-100">
                {pinMsg && (
                  <div className={`mt-4 p-3 rounded-xl text-xs flex items-center gap-2 ${
                    pinMsg.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'
                  }`}>
                    {pinMsg.type === 'success' ? <Check className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
                    <span>{pinMsg.text}</span>
                  </div>
                )}
                <form onSubmit={handleChangePin} className="mt-4 space-y-3">
                  {[{ label: 'PIN Lama', val: oldPin, setVal: setOldPin }, { label: 'PIN Baru', val: newPin, setVal: setNewPin }, { label: 'Konfirmasi PIN Baru', val: confirmNewPin, setVal: setConfirmNewPin }].map(({ label, val, setVal }) => (
                    <div key={label}>
                      <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">{label}</label>
                      <div className="relative flex items-center">
                        <div className="absolute left-3.5 text-slate-400 pointer-events-none"><Lock className="w-4 h-4" /></div>
                        <input
                          type={showPins ? 'text' : 'password'}
                          value={val}
                          onChange={(e) => setVal(e.target.value.replace(/\D/g, '').slice(0, 6))}
                          placeholder="••••••"
                          inputMode="numeric"
                          maxLength={6}
                          required
                          className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm font-mono tracking-widest placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1A73E8]"
                        />
                      </div>
                    </div>
                  ))}
                  <div className="flex items-center gap-2 pt-1">
                    <button type="button" onClick={() => setShowPins(s => !s)} className="text-xs text-slate-400 hover:text-slate-600 flex items-center gap-1">
                      {showPins ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      {showPins ? 'Sembunyikan' : 'Tampilkan'} PIN
                    </button>
                  </div>
                  <button type="submit" disabled={pinSubmitting}
                    className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-60">
                    {pinSubmitting ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Menyimpan...</> : 'Simpan PIN Baru'}
                  </button>
                </form>
              </div>
            )}
          </div>

          {/* Ganti WA Section */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
            <button
              type="button"
              onClick={() => { setShowWaSection((v) => !v); setWaMsg(null); }}
              className="w-full px-5 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
                  <Phone className="w-4 h-4" />
                </div>
                <div className="text-left min-w-0">
                  <p className="text-sm font-bold text-slate-900 truncate">Ganti Nomor WhatsApp</p>
                  <p className="text-[11px] text-slate-400">Ubah nomor WA yang terdaftar</p>
                </div>
              </div>
              <span className="text-xs text-slate-400 ml-2">{showWaSection ? '▲' : '▼'}</span>
            </button>

            {showWaSection && (
              <div className="px-5 pb-5 border-t border-slate-100">
                {waMsg && (
                  <div className={`mt-4 p-3 rounded-xl text-xs flex items-center gap-2 ${
                    waMsg.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'
                  }`}>
                    {waMsg.type === 'success' ? <Check className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
                    <span>{waMsg.text}</span>
                  </div>
                )}
                <form onSubmit={handleChangeWa} className="mt-4 space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">Nomor WA Baru</label>
                    <div className="relative flex items-center">
                      <div className="absolute left-3.5 text-slate-400 pointer-events-none"><Phone className="w-4 h-4" /></div>
                      <input
                        type="tel"
                        value={newWa}
                        onChange={(e) => setNewWa(e.target.value)}
                        placeholder="08123456789"
                        required
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1A73E8]"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">Masukkan PIN Saat Ini</label>
                    <div className="relative flex items-center">
                      <div className="absolute left-3.5 text-slate-400 pointer-events-none"><Lock className="w-4 h-4" /></div>
                      <input
                        type={showPins ? 'text' : 'password'}
                        value={waPin}
                        onChange={(e) => setWaPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        placeholder="••••••"
                        inputMode="numeric"
                        maxLength={6}
                        required
                        className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm font-mono tracking-widest placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1A73E8]"
                      />
                    </div>
                  </div>
                  <button type="submit" disabled={waSubmitting}
                    className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-60 mt-2">
                    {waSubmitting ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Memproses...</> : 'Simpan Nomor WA'}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
