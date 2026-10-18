'use client';

import React, { useState, useTransition } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  PlusCircle,
  MinusCircle,
  Calendar,
  Filter,
  Trash2,
  Download,
  Receipt,
  BookOpen,
  Library,
  Scale,
  LineChart,
  Waves,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  Plus,
  ArrowRight,
  HelpCircle,
  Sparkles,
  FileText,
} from 'lucide-react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import {
  createFinanceTransactionAction,
  deleteFinanceTransactionAction,
  createJournalEntryAction,
} from '@/lib/actions/finance-actions';
import {
  FINANCE_CATEGORIES,
  CHART_OF_ACCOUNTS,
  PERIOD_OPTIONS,
  getAccountByCode,
  getCategoryLabel,
} from '@/lib/utils/finance-constants';

function formatRupiah(amount) {
  const num = Number(amount) || 0;
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(num);
}

function formatDate(dateInput) {
  if (!dateInput) return '-';
  const d = new Date(dateInput);
  return d.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export default function FinanceManager({
  initialTransactions = [],
  initialSummary = {},
  initialJournals = [],
  initialLedger = [],
  initialTrialBalance = {},
  initialIncomeStatement = {},
  initialCashFlow = {},
  activePeriod = 'all',
  periodLabel = 'Semua Waktu',
  customStart = null,
  customEnd = null,
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  // Active Main Tab
  const [activeTab, setActiveTab] = useState('cashflow'); // 'cashflow' | 'journal' | 'ledger' | 'trial_balance' | 'income_statement' | 'cashflow_statement'

  // Filter State
  const [period, setPeriod] = useState(activePeriod);
  const [startDateInput, setStartDateInput] = useState(customStart || '');
  const [endDateInput, setEndDateInput] = useState(customEnd || '');
  const [showCustomDateInputs, setShowCustomDateInputs] = useState(activePeriod === 'custom');

  // Ledger account filter
  const [selectedLedgerAccount, setSelectedLedgerAccount] = useState('all');

  // Cashflow sub-filter
  const [cashflowTypeFilter, setCashflowTypeFilter] = useState('all'); // 'all' | 'income' | 'expense'

  // Modals
  const [isQuickModalOpen, setIsQuickModalOpen] = useState(false);
  const [quickModalType, setQuickModalType] = useState('income');
  const [amountInput, setAmountInput] = useState('');
  const [category, setCategory] = useState('penjualan_akrilik');
  const [transactionDate, setTransactionDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState('');
  const [referenceNumber, setReferenceNumber] = useState('');
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Manual Journal Modal
  const [isJournalModalOpen, setIsJournalModalOpen] = useState(false);
  const [journalDate, setJournalDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [journalDesc, setJournalDesc] = useState('');
  const [journalRef, setJournalRef] = useState('');
  const [journalLines, setJournalLines] = useState([
    { accountCode: '101', debit: '', credit: '' },
    { accountCode: '401', debit: '', credit: '' },
  ]);
  const [journalError, setJournalError] = useState('');

  // Delete Confirm
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  // Handle Period Change
  const handlePeriodChange = (newPeriod) => {
    setPeriod(newPeriod);
    if (newPeriod === 'custom') {
      setShowCustomDateInputs(true);
      return;
    }
    setShowCustomDateInputs(false);

    const params = new URLSearchParams(searchParams);
    params.set('period', newPeriod);
    params.delete('startDate');
    params.delete('endDate');
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  };

  const handleApplyCustomDate = (e) => {
    e.preventDefault();
    if (!startDateInput || !endDateInput) {
      alert('Pilih tanggal awal dan akhir.');
      return;
    }
    const params = new URLSearchParams(searchParams);
    params.set('period', 'custom');
    params.set('startDate', startDateInput);
    params.set('endDate', endDateInput);
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  };

  // Open Quick Modal
  const openQuickModal = (type = 'income') => {
    setQuickModalType(type);
    setAmountInput('');
    setCategory(type === 'income' ? 'penjualan_akrilik' : 'modal_akrilik');
    setTransactionDate(new Date().toISOString().split('T')[0]);
    setDescription('');
    setReferenceNumber('');
    setFormError('');
    setIsQuickModalOpen(true);
  };

  // Submit Quick Cash
  const handleQuickSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    const numericAmount = Number(amountInput);
    if (!numericAmount || numericAmount <= 0) {
      setFormError('Masukkan nominal uang yang valid.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await createFinanceTransactionAction({
        type: quickModalType,
        category,
        amount: numericAmount,
        transactionDate: transactionDate ? new Date(transactionDate).toISOString() : new Date().toISOString(),
        description: description.trim() || null,
        referenceNumber: referenceNumber.trim() || null,
      });

      if (!res.success) {
        setFormError(res.error || 'Gagal menyimpan transaksi');
        setIsSubmitting(false);
        return;
      }

      setIsQuickModalOpen(false);
      startTransition(() => {
        router.refresh();
      });
    } catch (err) {
      setFormError(err?.message || 'Gagal menyimpan transaksi');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Submit Manual Journal
  const handleJournalSubmit = async (e) => {
    e.preventDefault();
    setJournalError('');

    let totalD = 0;
    let totalC = 0;
    const formattedItems = [];

    for (const line of journalLines) {
      const d = Math.round(Number(line.debit) || 0);
      const c = Math.round(Number(line.credit) || 0);
      if (d === 0 && c === 0) continue;
      totalD += d;
      totalC += c;
      const acc = getAccountByCode(line.accountCode);
      formattedItems.push({
        accountCode: line.accountCode,
        accountName: acc.name,
        debit: d,
        credit: c,
      });
    }

    if (formattedItems.length < 2) {
      setJournalError('Jurnal harus memiliki minimal 2 baris akun.');
      return;
    }

    if (totalD !== totalC || totalD <= 0) {
      setJournalError(`Total Debit (${formatRupiah(totalD)}) tidak sama dengan Total Kredit (${formatRupiah(totalC)}).`);
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await createJournalEntryAction({
        entryDate: journalDate ? new Date(journalDate).toISOString() : new Date().toISOString(),
        description: journalDesc.trim() || 'Jurnal Penyesuaian Manual',
        referenceNumber: journalRef.trim() || null,
        items: formattedItems,
      });

      if (!res.success) {
        setJournalError(res.error || 'Gagal menyimpan jurnal umum');
        setIsSubmitting(false);
        return;
      }

      setIsJournalModalOpen(false);
      startTransition(() => {
        router.refresh();
      });
    } catch (err) {
      setJournalError(err?.message || 'Gagal menyimpan jurnal umum');
    } finally {
      setIsSubmitting(false);
    }
  };

  const addJournalLine = () => {
    setJournalLines([...journalLines, { accountCode: '101', debit: '', credit: '' }]);
  };

  const updateJournalLine = (index, field, value) => {
    const next = [...journalLines];
    next[index][field] = value;
    setJournalLines(next);
  };

  const removeJournalLine = (index) => {
    if (journalLines.length <= 2) return;
    setJournalLines(journalLines.filter((_, i) => i !== index));
  };

  // Delete Cash Transaction
  const handleDelete = async (id) => {
    if (!id) return;
    setDeletingId(id);
    try {
      const res = await deleteFinanceTransactionAction(id);
      if (res.success) {
        setDeleteConfirmId(null);
        startTransition(() => {
          router.refresh();
        });
      } else {
        alert(res.error || 'Gagal menghapus transaksi');
      }
    } catch (err) {
      alert(err?.message || 'Gagal menghapus transaksi');
    } finally {
      setDeletingId(null);
    }
  };

  // Export Active Tab to CSV
  const handleExportCSV = () => {
    let headers = [];
    let rows = [];
    let filename = `laporan-keuangan-${activeTab}-${new Date().toISOString().split('T')[0]}.csv`;

    if (activeTab === 'cashflow') {
      headers = ['Tanggal', 'Tipe', 'Kategori', 'Keterangan', 'No. Referensi', 'Nominal (Rp)'];
      rows = initialTransactions.map((t) => [
        t.transactionDate ? new Date(t.transactionDate).toISOString().split('T')[0] : '',
        t.type === 'income' ? 'Pemasukan' : 'Pengeluaran',
        t.category,
        `"${(t.description || '').replace(/"/g, '""')}"`,
        `"${(t.referenceNumber || '').replace(/"/g, '""')}"`,
        t.amount,
      ]);
    } else if (activeTab === 'journal') {
      headers = ['Tanggal', 'No. Bukti', 'Keterangan', 'Kode Akun', 'Nama Akun', 'Debit (Rp)', 'Kredit (Rp)'];
      for (const j of initialJournals) {
        for (const item of j.items || []) {
          rows.push([
            j.entryDate ? new Date(j.entryDate).toISOString().split('T')[0] : '',
            j.entryNumber,
            `"${(j.description || '').replace(/"/g, '""')}"`,
            item.accountCode,
            `"${item.accountName}"`,
            item.debit,
            item.credit,
          ]);
        }
      }
    } else if (activeTab === 'trial_balance') {
      headers = ['Kode Akun', 'Nama Akun', 'Kategori', 'Saldo Debit (Rp)', 'Saldo Kredit (Rp)'];
      rows = (initialTrialBalance.rows || []).map((r) => [r.code, `"${r.name}"`, r.category, r.debit, r.credit]);
    } else {
      headers = ['Laporan', 'Jumlah (Rp)'];
      rows = [
        ['Total Pemasukan', initialSummary.totalIncome || 0],
        ['Total Pengeluaran', initialSummary.totalExpense || 0],
        ['Laba Bersih', initialSummary.netProfit || 0],
      ];
    }

    if (rows.length === 0) {
      alert('Tidak ada data untuk diekspor pada tab ini.');
      return;
    }

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const activeCategories = quickModalType === 'income' ? FINANCE_CATEGORIES.income : FINANCE_CATEGORIES.expense;

  // Filtered Cashflow list
  const filteredCashflow = initialTransactions.filter((tx) => {
    if (cashflowTypeFilter === 'all') return true;
    return tx.type === cashflowTypeFilter;
  });

  return (
    <div className="space-y-6">
      {/* 1. Header & Primary Action Buttons */}
      <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Sistem Pembukuan &amp; Akuntansi
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-blue-100 text-blue-800">
              Admin Suite
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-emerald-100 text-emerald-800">
              <Sparkles className="w-3 h-3 text-emerald-600" />
              Jurnal Otomatis Aktif
            </span>
            {isPending && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200 animate-pulse">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" />
                Memperbarui data...
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Cukup catat pemasukan / pengeluaran di Pembukuan Kas. Jurnal Umum, Buku Besar, Neraca Saldo, Laba Rugi &amp; Arus Kas terisi secara otomatis.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-2 w-full lg:w-auto">
          <Button
            type="button"
            onClick={() => openQuickModal('income')}
            className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2.5 h-auto shadow-xs justify-center"
          >
            <PlusCircle className="w-4 h-4 mr-1.5 shrink-0" />
            + Pemasukan
          </Button>

          <Button
            type="button"
            onClick={() => openQuickModal('expense')}
            variant="outline"
            className="w-full sm:w-auto border-rose-300 text-rose-700 hover:bg-rose-50 font-bold text-xs py-2.5 h-auto shadow-xs justify-center"
          >
            <MinusCircle className="w-4 h-4 mr-1.5 text-rose-600 shrink-0" />
            - Pengeluaran
          </Button>

          <Button
            type="button"
            onClick={() => setIsJournalModalOpen(true)}
            variant="ghost"
            className="w-full sm:w-auto text-slate-600 hover:text-slate-900 hover:bg-slate-100 font-bold text-xs py-2.5 h-auto justify-center"
            title="Hanya jika butuh penyesuaian akuntansi non-kas (opsional)"
          >
            <FileText className="w-4 h-4 mr-1.5 text-slate-400 shrink-0" />
            + Penyesuaian
          </Button>

          <button
            type="button"
            onClick={handleExportCSV}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 shadow-xs transition-colors cursor-pointer"
            title="Unduh laporan saat ini dalam format CSV"
          >
            <Download className="w-4 h-4 text-slate-500 shrink-0" />
            <span>Ekspor CSV</span>
          </button>
        </div>
      </div>

      {/* 2. Global Period Filter Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Period Selector Pills */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs font-bold text-slate-500 mr-1 flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            Periode:
          </span>
          {PERIOD_OPTIONS.map((opt) => {
            const isActive = period === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => handlePeriodChange(opt.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-[#1A73E8] text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                }`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>

        {/* Active Period Label */}
        <div className="text-xs text-slate-500 flex items-center gap-1.5 font-medium">
          <span>Menampilkan:</span>
          <span className="font-bold text-slate-800 bg-slate-100 px-2.5 py-1 rounded-lg">
            {periodLabel}
          </span>
        </div>
      </div>

      {/* Custom Date Range Picker Drawer (When "Pilih Periode" is chosen) */}
      {showCustomDateInputs && (
        <form
          onSubmit={handleApplyCustomDate}
          className="bg-blue-50/70 border border-blue-200 rounded-2xl p-3.5 sm:p-4 flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-2.5 sm:gap-3 animate-in fade-in slide-in-from-top-2 duration-150"
        >
          <span className="text-xs font-bold text-blue-900">Rentang Tanggal Khusus:</span>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 w-12 sm:w-auto shrink-0">Dari:</span>
            <input
              type="date"
              value={startDateInput}
              onChange={(e) => setStartDateInput(e.target.value)}
              className="w-full sm:w-auto px-3 py-1.5 rounded-xl border border-slate-300 text-xs font-semibold bg-white"
              required
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 w-12 sm:w-auto shrink-0">Sampai:</span>
            <input
              type="date"
              value={endDateInput}
              onChange={(e) => setEndDateInput(e.target.value)}
              className="w-full sm:w-auto px-3 py-1.5 rounded-xl border border-slate-300 text-xs font-semibold bg-white"
              required
            />
          </div>
          <Button type="submit" size="sm" className="bg-[#1A73E8] hover:bg-blue-700 text-white font-bold py-2 sm:py-1.5 h-auto justify-center">
            Terapkan Filter
          </Button>
        </form>
      )}

      {/* 3. Executive KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
        {/* Pemasukan */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-3.5 sm:p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Total Pemasukan
            </span>
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center shrink-0">
              <TrendingUp className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
          </div>
          <div className="mt-2 sm:mt-2.5">
            <div className="text-base sm:text-2xl font-black text-emerald-600 tracking-tight truncate">
              {formatRupiah(initialSummary.totalIncome || 0)}
            </div>
            <p className="text-[10px] sm:text-[11px] text-slate-400 mt-0.5 truncate hidden sm:block">Penjualan akrilik, setup &amp; SaaS</p>
          </div>
        </div>

        {/* Pengeluaran */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-3.5 sm:p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Total Pengeluaran
            </span>
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-rose-50 text-rose-600 border border-rose-100 flex items-center justify-center shrink-0">
              <TrendingDown className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
          </div>
          <div className="mt-2 sm:mt-2.5">
            <div className="text-base sm:text-2xl font-black text-rose-600 tracking-tight truncate">
              {formatRupiah(initialSummary.totalExpense || 0)}
            </div>
            <p className="text-[10px] sm:text-[11px] text-slate-400 mt-0.5 truncate hidden sm:block">HPP akrilik, NFC &amp; operasional</p>
          </div>
        </div>

        {/* Laba Bersih */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-3.5 sm:p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Laba Bersih
            </span>
            <div
              className={`w-7 h-7 sm:w-8 sm:h-8 rounded-xl flex items-center justify-center border shrink-0 ${
                (initialSummary.netProfit || 0) >= 0
                  ? 'bg-blue-50 text-[#1A73E8] border-blue-100'
                  : 'bg-amber-50 text-amber-600 border-amber-100'
              }`}
            >
              <DollarSign className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
          </div>
          <div className="mt-2 sm:mt-2.5">
            <div
              className={`text-base sm:text-2xl font-black tracking-tight truncate ${
                (initialSummary.netProfit || 0) >= 0 ? 'text-[#1A73E8]' : 'text-amber-600'
              }`}
            >
              {formatRupiah(initialSummary.netProfit || 0)}
            </div>
            <p className="text-[10px] sm:text-[11px] text-slate-400 mt-0.5 truncate">
              {(initialSummary.netProfit || 0) >= 0 ? 'Surplus usaha' : 'Defisit usaha'}
            </p>
          </div>
        </div>

        {/* Saldo Kas & Status Neraca */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-3.5 sm:p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-500 truncate mr-1">
              Saldo Kas
            </span>
            <div
              className={`w-7 h-7 sm:w-8 sm:h-8 rounded-xl flex items-center justify-center border shrink-0 ${
                initialTrialBalance.isBalanced
                  ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                  : 'bg-rose-50 text-rose-600 border-rose-100'
              }`}
            >
              <Scale className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
          </div>
          <div className="mt-2 sm:mt-2.5">
            <div className="text-base sm:text-xl font-black text-slate-900 tracking-tight truncate">
              {formatRupiah(initialCashFlow.endingCashBalance || 0)}
            </div>
            <div className="flex items-center gap-1 mt-0.5 sm:mt-1 truncate">
              {initialTrialBalance.isBalanced ? (
                <span className="inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-bold text-emerald-600 truncate">
                  <CheckCircle2 className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
                  Neraca Seimbang
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-bold text-rose-600 truncate">
                  <AlertCircle className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
                  Selisih: {formatRupiah(initialTrialBalance.difference || 0)}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 4. Tab Navigation Switcher */}
      <div className="border-b border-slate-200 -mx-4 sm:mx-0 px-4 sm:px-0">
        <nav className="flex space-x-1 sm:space-x-2 overflow-x-auto pb-px scroll-smooth" aria-label="Tabs">
          {[
            { id: 'cashflow', name: 'Pembukuan Kas', shortName: 'Kas', icon: Receipt, count: filteredCashflow.length },
            { id: 'journal', name: 'Jurnal Umum (Otomatis)', shortName: 'Jurnal', icon: BookOpen, count: initialJournals.length },
            { id: 'ledger', name: 'Buku Besar', shortName: 'Buku Besar', icon: Library },
            { id: 'trial_balance', name: 'Neraca Saldo', shortName: 'Neraca', icon: Scale },
            { id: 'income_statement', name: 'Laba Rugi', shortName: 'Laba Rugi', icon: LineChart },
            { id: 'cashflow_statement', name: 'Laporan Arus Kas', shortName: 'Arus Kas', icon: Waves },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 sm:gap-2 py-2.5 sm:py-3 px-2.5 sm:px-4 border-b-2 font-bold text-xs sm:text-sm whitespace-nowrap transition-all shrink-0 min-h-[44px] ${
                  isActive
                    ? 'border-[#1A73E8] text-[#1A73E8] bg-blue-50/40 rounded-t-xl'
                    : 'border-transparent text-slate-500 hover:text-slate-900 hover:border-slate-300'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0 ${isActive ? 'text-[#1A73E8]' : 'text-slate-400'}`} />
                <span className="sm:hidden">{tab.shortName}</span>
                <span className="hidden sm:inline">{tab.name}</span>
                {typeof tab.count === 'number' && (
                  <span
                    className={`ml-0.5 sm:ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                      isActive ? 'bg-blue-100 text-[#1A73E8]' : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* 5. TAB CONTENTS */}

      {/* TAB 1: PEMBUKUAN KAS (Cash Flow Table) */}
      {activeTab === 'cashflow' && (
        <div className="space-y-4">
          {/* Driver Info Banner */}
          <div className="bg-emerald-50/80 border border-emerald-200/80 rounded-2xl p-4 flex items-start gap-3 shadow-xs">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="flex-1 text-xs">
              <div className="font-bold text-emerald-900 flex items-center gap-1.5">
                <span>Pencatatan Kas Utama (Driver Otomatis)</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-200 text-emerald-900 font-extrabold">
                  ⚡ Auto-Journal Active
                </span>
              </div>
              <p className="text-emerald-800/90 mt-0.5 leading-relaxed">
                Anda hanya perlu mencatat kas masuk dan keluar di sini. Sistem secara otomatis membuat ayat <strong>Jurnal Umum</strong> (Debit &amp; Kredit), mem-posting ke <strong>Buku Besar</strong>, dan menyusun <strong>Laba Rugi</strong> serta <strong>Arus Kas</strong> secara otomatis.
              </p>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50">
              <div className="inline-flex rounded-xl bg-slate-200/60 p-1 text-xs font-semibold text-slate-600">
                <button
                  type="button"
                  onClick={() => setCashflowTypeFilter('all')}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    cashflowTypeFilter === 'all' ? 'bg-white text-slate-900 shadow-xs font-bold' : 'hover:text-slate-900'
                  }`}
                >
                  Semua ({initialTransactions.length})
                </button>
                <button
                  type="button"
                  onClick={() => setCashflowTypeFilter('income')}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    cashflowTypeFilter === 'income' ? 'bg-white text-emerald-700 shadow-xs font-bold' : 'hover:text-slate-900'
                  }`}
                >
                  Pemasukan
                </button>
                <button
                  type="button"
                  onClick={() => setCashflowTypeFilter('expense')}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    cashflowTypeFilter === 'expense' ? 'bg-white text-rose-700 shadow-xs font-bold' : 'hover:text-slate-900'
                  }`}
                >
                  Pengeluaran
                </button>
              </div>

              <span className="text-xs text-slate-400 font-medium">
                {filteredCashflow.length} transaksi kas
              </span>
            </div>

            {filteredCashflow.length === 0 ? (
              <div className="py-16 text-center">
                <Receipt className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h3 className="text-sm font-bold text-slate-800">Tidak ada transaksi kas</h3>
                <p className="text-xs text-slate-500 mt-1">Coba sesuaikan filter periode atau catat transaksi baru.</p>
              </div>
            ) : (
              <>
                {/* Mobile Card List (< md) */}
                <div className="md:hidden divide-y divide-slate-100">
                  {filteredCashflow.map((tx) => {
                    const isIncome = tx.type === 'income';
                    return (
                      <div key={tx.id} className="p-4 space-y-2.5 hover:bg-slate-50/70 transition-colors">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                isIncome ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                              }`}
                            >
                              {isIncome ? 'Masuk' : 'Keluar'}
                            </span>
                            <span className="font-semibold text-slate-800 text-xs capitalize">
                              {tx.category.replace(/_/g, ' ')}
                            </span>
                            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-blue-700 bg-blue-50 border border-blue-200/60 px-1.5 py-0.5 rounded">
                              <Sparkles className="w-2.5 h-2.5 text-blue-600" />
                              Terjurnal
                            </span>
                          </div>
                          <span className={`font-bold font-mono text-sm shrink-0 ${isIncome ? 'text-emerald-600' : 'text-rose-600'}`}>
                            {isIncome ? '+' : '-'} {formatRupiah(tx.amount)}
                          </span>
                        </div>

                        <div className="text-xs text-slate-700 font-medium">
                          {tx.description || '-'}
                        </div>

                        <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                          <div className="flex items-center gap-2">
                            <span>{formatDate(tx.transactionDate)}</span>
                            {tx.referenceNumber && (
                              <span className="font-mono">Ref: {tx.referenceNumber}</span>
                            )}
                          </div>
                          <div>
                            {deleteConfirmId === tx.id ? (
                              <div className="flex items-center gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => handleDelete(tx.id)}
                                  disabled={deletingId === tx.id || isPending}
                                  className="px-2.5 py-1 rounded-lg bg-rose-600 text-white text-[11px] font-bold disabled:opacity-50 min-h-[32px]"
                                >
                                  {deletingId === tx.id ? 'Hapus...' : 'Hapus'}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setDeleteConfirmId(null)}
                                  className="px-2.5 py-1 rounded-lg bg-slate-200 text-slate-700 text-[11px] font-semibold min-h-[32px]"
                                >
                                  Batal
                                </button>
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={() => setDeleteConfirmId(tx.id)}
                                className="p-2 -mr-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 min-w-[36px] min-h-[36px] flex items-center justify-center transition-colors"
                                title="Hapus Transaksi"
                                aria-label="Hapus Transaksi"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Desktop Table (>= md) */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/70 text-slate-500 font-bold uppercase tracking-wider">
                      <th className="py-3 px-4">Tanggal</th>
                      <th className="py-3 px-4">Tipe &amp; Kategori</th>
                      <th className="py-3 px-4">Keterangan</th>
                      <th className="py-3 px-4 text-right">Nominal</th>
                      <th className="py-3 px-4 text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredCashflow.map((tx) => {
                      const isIncome = tx.type === 'income';
                      return (
                        <tr key={tx.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3 px-4 whitespace-nowrap text-slate-600 font-medium">
                            {formatDate(tx.transactionDate)}
                          </td>
                          <td className="py-3 px-4 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <span
                                className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                  isIncome ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                                }`}
                              >
                                {isIncome ? 'Masuk' : 'Keluar'}
                              </span>
                              <span className="font-semibold text-slate-800 capitalize">
                                {tx.category.replace(/_/g, ' ')}
                              </span>
                              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-blue-700 bg-blue-50 border border-blue-200/60 px-1.5 py-0.5 rounded">
                                <Sparkles className="w-2.5 h-2.5 text-blue-600" />
                                Terjurnal
                              </span>
                            </div>
                          </td>
                          <td className="py-3 px-4 max-w-xs">
                            <div className="font-medium text-slate-900 truncate">{tx.description || '-'}</div>
                            {tx.referenceNumber && (
                              <div className="text-[11px] text-slate-400 font-mono mt-0.5">Ref: {tx.referenceNumber}</div>
                            )}
                          </td>
                          <td className="py-3 px-4 text-right whitespace-nowrap">
                            <span className={`font-bold font-mono text-sm ${isIncome ? 'text-emerald-600' : 'text-rose-600'}`}>
                              {isIncome ? '+' : '-'} {formatRupiah(tx.amount)}
                            </span>
                          </td>
                        <td className="py-3 px-4 text-center whitespace-nowrap">
                          {deleteConfirmId === tx.id ? (
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => handleDelete(tx.id)}
                                disabled={deletingId === tx.id || isPending}
                                className="px-2 py-1 rounded bg-rose-600 text-white text-[11px] font-bold disabled:opacity-50"
                              >
                                {deletingId === tx.id ? 'Menghapus...' : 'Hapus'}
                              </button>
                              <button
                                type="button"
                                onClick={() => setDeleteConfirmId(null)}
                                className="px-2 py-1 rounded bg-slate-200 text-slate-700 text-[11px]"
                              >
                                Batal
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setDeleteConfirmId(tx.id)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                              title="Hapus"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
        </div>
      </div>
      )}

      {/* TAB 2: JURNAL UMUM (General Journal) */}
      {activeTab === 'journal' && (
        <div className="space-y-4">
          {/* Realtime Auto-Sync Info Banner */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/80 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs mt-0.5">
                <Sparkles className="w-5 h-5" />
              </div>
              <div className="text-xs">
                <div className="font-bold text-blue-900 flex items-center gap-1.5">
                  <span>Jurnal Umum Otomatis Terhubung ke Pembukuan Kas</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] bg-blue-200/80 text-blue-900 font-extrabold">
                    ⚡ Auto-Synced
                  </span>
                </div>
                <p className="text-blue-800/90 mt-0.5 leading-relaxed">
                  Setiap transaksi kas yang dicatat di Pembukuan langsung otomatis dijurnal berpasangan (Double-Entry Debit &amp; Kredit) di bawah ini. Anda tidak perlu membuat jurnal manual untuk transaksi kas harian.
                </p>
              </div>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsJournalModalOpen(true)}
              className="text-xs font-bold text-slate-700 bg-white border-slate-300 hover:bg-slate-50 shrink-0 self-end sm:self-auto"
            >
              + Penyesuaian Manual (Non-Kas)
            </Button>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div>
                <h2 className="text-sm font-bold text-slate-900">Ayat Jurnal Umum (General Journal)</h2>
                <p className="text-xs text-slate-500">Pencatatan berpasangan debit dan kredit setiap transaksi.</p>
              </div>
              <span className="text-xs text-slate-400 font-mono font-semibold">
                {initialJournals.length} Jurnal
              </span>
            </div>

            <div>
              {initialJournals.length === 0 ? (
                <div className="py-12 sm:py-16 text-center px-4">
                  <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <h3 className="text-sm font-bold text-slate-800">Belum Ada Catatan Jurnal</h3>
                  <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">Setiap kali Anda mencatat pemasukan atau pengeluaran kas, sistem otomatis membuat jurnal berpasangan di sini.</p>
                </div>
              ) : (
                <>
                  {/* Mobile Cards View (< md) */}
                  <div className="md:hidden divide-y divide-slate-100">
                    {initialJournals.map((j) => (
                      <div key={j.id} className="p-3.5 space-y-2.5 hover:bg-slate-50/60 transition-colors">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md">
                              {j.entryNumber}
                            </span>
                            {j.transactionType === 'pemasukan' && (
                              <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-emerald-100 text-emerald-800 uppercase">
                                Otomatis (Masuk)
                              </span>
                            )}
                            {j.transactionType === 'pengeluaran' && (
                              <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-rose-100 text-rose-800 uppercase">
                                Otomatis (Keluar)
                              </span>
                            )}
                            {j.transactionType === 'jurnal_manual' && (
                              <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-amber-100 text-amber-800 uppercase">
                                Manual
                              </span>
                            )}
                          </div>
                          <span className="font-mono text-[11px] text-slate-400 shrink-0">
                            {formatDate(j.entryDate)}
                          </span>
                        </div>

                        <div className="text-xs font-semibold text-slate-800">
                          {j.description}
                          {j.referenceNumber && (
                            <span className="text-slate-400 font-mono text-[10px] ml-1.5 font-normal">
                              Ref: {j.referenceNumber}
                            </span>
                          )}
                        </div>

                        {/* Items breakdown */}
                        <div className="space-y-1.5 bg-slate-50/80 rounded-xl p-2.5 text-xs font-mono">
                          {(j.items || []).map((it, idx) => {
                            const isCredit = it.credit > 0;
                            return (
                              <div
                                key={idx}
                                className={`flex items-center justify-between gap-2 ${
                                  isCredit ? 'pl-3 text-slate-600' : 'text-slate-900 font-medium'
                                }`}
                              >
                                <div className="truncate">
                                  <span className="text-slate-400 mr-1.5 text-[11px]">{it.accountCode}</span>
                                  <span className="text-[11px] font-sans">{it.accountName}</span>
                                </div>
                                <span className={`shrink-0 font-bold ${isCredit ? 'text-rose-600' : 'text-emerald-700'}`}>
                                  {isCredit ? `(Kr) ${formatRupiah(it.credit)}` : `(Db) ${formatRupiah(it.debit)}`}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Desktop Table View (>= md) */}
                  <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-100 text-slate-600 font-bold uppercase tracking-wider">
                      <th className="py-3 px-4 w-28">Tanggal</th>
                      <th className="py-3 px-4 w-44">No. Bukti / Ref</th>
                      <th className="py-3 px-4">Akun &amp; Keterangan Transaksi</th>
                      <th className="py-3 px-4 text-right w-36">Debit (Rp)</th>
                      <th className="py-3 px-4 text-right w-36">Kredit (Rp)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {initialJournals.map((j) => (
                      <React.Fragment key={j.id}>
                        {/* Journal Header Bar */}
                        <tr className="bg-slate-50/70 font-semibold text-slate-700 border-b border-slate-200/80">
                          <td className="py-2.5 px-4 font-mono">{formatDate(j.entryDate)}</td>
                          <td className="py-2.5 px-4 font-mono">
                            <div className="flex flex-wrap items-center gap-1.5">
                              <span className="text-blue-700 font-bold">{j.entryNumber}</span>
                              {j.transactionType === 'pemasukan' && (
                                <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-emerald-100 text-emerald-800 uppercase tracking-tight">
                                  Otomatis (Masuk)
                                </span>
                              )}
                              {j.transactionType === 'pengeluaran' && (
                                <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-rose-100 text-rose-800 uppercase tracking-tight">
                                  Otomatis (Keluar)
                                </span>
                              )}
                              {j.transactionType === 'jurnal_manual' && (
                                <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-amber-100 text-amber-800 uppercase tracking-tight">
                                  Manual
                                </span>
                              )}
                            </div>
                          </td>
                          <td colSpan={3} className="py-2.5 px-4 text-slate-800 font-bold">
                            <div className="flex items-center justify-between">
                              <span>{j.description}</span>
                              {j.referenceNumber && (
                                <span className="text-slate-400 font-mono text-[11px] font-normal">
                                  Ref: {j.referenceNumber}
                                </span>
                              )}
                            </div>
                          </td>
                        </tr>
                        {/* Journal Debit & Credit Rows */}
                        {(j.items || []).map((it, idx) => {
                          const isCredit = it.credit > 0;
                          return (
                            <tr key={idx} className="hover:bg-slate-50/50">
                              <td className="py-1.5 px-4"></td>
                              <td className="py-1.5 px-4"></td>
                              <td className={`py-1.5 px-4 ${isCredit ? 'pl-10 text-slate-600' : 'font-medium text-slate-900'}`}>
                                <span className="font-mono text-slate-400 mr-2">{it.accountCode}</span>
                                {it.accountName}
                              </td>
                              <td className="py-1.5 px-4 text-right font-mono font-bold text-slate-900">
                                {it.debit > 0 ? formatRupiah(it.debit) : '-'}
                              </td>
                              <td className="py-1.5 px-4 text-right font-mono font-bold text-slate-900">
                                {it.credit > 0 ? formatRupiah(it.credit) : '-'}
                              </td>
                            </tr>
                          );
                        })}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
          </div>
        </div>
      )}

      {/* TAB 3: BUKU BESAR (General Ledger) */}
      {activeTab === 'ledger' && (
        <div className="space-y-4">
          {/* Account Filter */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 w-full sm:w-auto">
              <label className="text-xs font-bold text-slate-700 shrink-0">Pilih Akun Buku Besar:</label>
              <select
                value={selectedLedgerAccount}
                onChange={(e) => setSelectedLedgerAccount(e.target.value)}
                className="w-full sm:w-auto px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#1A73E8] bg-white min-h-[42px]"
              >
                <option value="all">Semua Akun ({CHART_OF_ACCOUNTS.length})</option>
                {CHART_OF_ACCOUNTS.map((acc) => (
                  <option key={acc.code} value={acc.code}>
                    {acc.code} - {acc.name} ({acc.category.toUpperCase()})
                  </option>
                ))}
              </select>
            </div>
            <span className="text-xs text-slate-400">
              Menampilkan mutasi debit, kredit, dan saldo berjalan
            </span>
          </div>

          {/* Ledger Accounts Cards */}
          <div className="space-y-6">
            {initialLedger
              .filter((l) => selectedLedgerAccount === 'all' || l.account.code === selectedLedgerAccount)
              .map((l) => (
                <div key={l.account.code} className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
                  {/* Account Header */}
                  <div className="p-3.5 sm:p-5 border-b border-slate-200 bg-slate-50/70 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                    <div className="flex items-center gap-2.5 sm:gap-3">
                      <span className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-blue-100 text-[#1A73E8] font-mono font-black text-xs sm:text-sm flex items-center justify-center shrink-0">
                        {l.account.code}
                      </span>
                      <div className="min-w-0">
                        <h3 className="text-sm sm:text-base font-extrabold text-slate-900 truncate">{l.account.name}</h3>
                        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-200 text-slate-700">
                            {l.account.category}
                          </span>
                          <span className="text-[11px] sm:text-xs text-slate-400">
                            Saldo Normal: <strong className="uppercase">{l.account.normalBalance}</strong>
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex sm:flex-col items-center sm:items-end justify-between border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-200">
                      <div className="text-[11px] sm:text-xs text-slate-400 font-medium">Saldo Akhir:</div>
                      <div className="text-base sm:text-lg font-black text-[#1A73E8] font-mono">
                        {formatRupiah(l.endingBalance)}
                      </div>
                    </div>
                  </div>

                  {/* Transactions Table for this Account */}
                  <div>
                    {l.transactions.length === 0 ? (
                      <div className="py-6 sm:py-8 text-center text-xs text-slate-400">
                        Belum ada mutasi transaksi pada akun ini pada periode ini.
                      </div>
                    ) : (
                      <>
                        {/* Mobile Ledger Transactions List (< md) */}
                        <div className="md:hidden divide-y divide-slate-100">
                          {l.transactions.map((tx, idx) => (
                            <div key={idx} className="p-3.5 space-y-2 text-xs">
                              <div className="flex items-center justify-between text-slate-500 font-mono text-[11px]">
                                <span>{formatDate(tx.entryDate)}</span>
                                <span className="font-semibold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded">
                                  {tx.entryNumber}
                                </span>
                              </div>
                              <div className="font-medium text-slate-800 text-xs">
                                {tx.description}
                              </div>
                              <div className="grid grid-cols-3 gap-1.5 bg-slate-50/80 p-2.5 rounded-xl font-mono text-[11px]">
                                <div>
                                  <span className="text-[9px] uppercase font-bold text-slate-400 block">Debit</span>
                                  <span className="font-bold text-emerald-700">{tx.debit > 0 ? formatRupiah(tx.debit) : '-'}</span>
                                </div>
                                <div>
                                  <span className="text-[9px] uppercase font-bold text-slate-400 block">Kredit</span>
                                  <span className="font-bold text-rose-700">{tx.credit > 0 ? formatRupiah(tx.credit) : '-'}</span>
                                </div>
                                <div className="text-right">
                                  <span className="text-[9px] uppercase font-bold text-slate-400 block">Saldo</span>
                                  <span className="font-black text-blue-800">{formatRupiah(tx.runningBalance)}</span>
                                </div>
                              </div>
                            </div>
                          ))}
                          <div className="p-3.5 bg-slate-50 flex items-center justify-between text-xs font-bold border-t border-slate-200">
                            <span className="text-slate-600">Total Saldo Akhir:</span>
                            <span className="font-mono text-blue-800 font-black">{formatRupiah(l.endingBalance)}</span>
                          </div>
                        </div>

                        {/* Desktop Ledger Table (>= md) */}
                        <div className="hidden md:block overflow-x-auto">
                          <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="border-b border-slate-100 bg-slate-50/40 text-slate-500 font-bold uppercase tracking-wider">
                            <th className="py-2.5 px-4 w-28">Tanggal</th>
                            <th className="py-2.5 px-4 w-32">No. Bukti</th>
                            <th className="py-2.5 px-4">Keterangan</th>
                            <th className="py-2.5 px-4 text-right w-32">Debit</th>
                            <th className="py-2.5 px-4 text-right w-32">Kredit</th>
                            <th className="py-2.5 px-4 text-right w-36">Saldo Berjalan</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {l.transactions.map((tx, idx) => (
                            <tr key={idx} className="hover:bg-slate-50/50">
                              <td className="py-2 px-4 whitespace-nowrap text-slate-600 font-mono">
                                {formatDate(tx.entryDate)}
                              </td>
                              <td className="py-2 px-4 whitespace-nowrap font-mono text-slate-500">
                                {tx.entryNumber}
                              </td>
                              <td className="py-2 px-4 text-slate-800 font-medium">
                                {tx.description}
                              </td>
                              <td className="py-2 px-4 text-right font-mono font-bold text-slate-900">
                                {tx.debit > 0 ? formatRupiah(tx.debit) : '-'}
                              </td>
                              <td className="py-2 px-4 text-right font-mono font-bold text-slate-900">
                                {tx.credit > 0 ? formatRupiah(tx.credit) : '-'}
                              </td>
                              <td className="py-2 px-4 text-right font-mono font-black text-blue-700">
                                {formatRupiah(tx.runningBalance)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot>
                          <tr className="bg-slate-50 font-bold border-t border-slate-200">
                            <td colSpan={3} className="py-2.5 px-4 text-right uppercase text-slate-600">
                              Total Mutasi Akun:
                            </td>
                            <td className="py-2.5 px-4 text-right font-mono text-emerald-700">
                              {formatRupiah(l.totalDebit)}
                            </td>
                            <td className="py-2.5 px-4 text-right font-mono text-rose-700">
                              {formatRupiah(l.totalCredit)}
                            </td>
                            <td className="py-2.5 px-4 text-right font-mono text-blue-800">
                              {formatRupiah(l.endingBalance)}
                            </td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </>
                )}
              </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* TAB 4: NERACA SALDO (Trial Balance) */}
      {activeTab === 'trial_balance' && (
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Neraca Saldo (Trial Balance)</h2>
              <p className="text-xs text-slate-500">Ringkasan saldo akhir debit dan kredit untuk menguji keseimbangan buku besar.</p>
            </div>
            <div>
              {initialTrialBalance.isBalanced ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-100 text-emerald-800 text-xs font-bold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Neraca Saldo Seimbang (Balanced)
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-100 text-rose-800 text-xs font-bold">
                  <AlertCircle className="w-4 h-4 text-rose-600" />
                  Selisih: {formatRupiah(initialTrialBalance.difference || 0)}
                </span>
              )}
            </div>
          </div>

          <div>
            {(!initialTrialBalance.rows || initialTrialBalance.rows.length === 0) ? (
              <div className="py-12 sm:py-16 text-center text-xs text-slate-400">
                Belum ada saldo akun untuk neraca saldo pada periode ini.
              </div>
            ) : (
              <>
                {/* Mobile Cards View (< md) */}
                <div className="md:hidden divide-y divide-slate-100">
                  {initialTrialBalance.rows.map((r) => (
                    <div key={r.code} className="p-3.5 space-y-1.5 hover:bg-slate-50/60 transition-colors">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span className="font-mono text-xs font-bold text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded shrink-0">
                            {r.code}
                          </span>
                          <span className="font-bold text-xs text-slate-900 truncate">
                            {r.name}
                          </span>
                        </div>
                        <span className="uppercase text-[9px] font-bold text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded shrink-0">
                          {r.category}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs font-mono pt-1">
                        <div>
                          <span className="text-[10px] text-slate-400 mr-1">Debit:</span>
                          <span className="font-bold text-slate-800">{r.debit > 0 ? formatRupiah(r.debit) : '-'}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 mr-1">Kredit:</span>
                          <span className="font-bold text-slate-800">{r.credit > 0 ? formatRupiah(r.credit) : '-'}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                  <div className="p-3.5 bg-slate-100 border-t-2 border-slate-200 space-y-1 text-xs font-mono">
                    <div className="flex items-center justify-between font-bold text-slate-700">
                      <span>Total Debit:</span>
                      <span className="text-emerald-700">{formatRupiah(initialTrialBalance.totalDebit || 0)}</span>
                    </div>
                    <div className="flex items-center justify-between font-bold text-slate-700">
                      <span>Total Kredit:</span>
                      <span className="text-rose-700">{formatRupiah(initialTrialBalance.totalCredit || 0)}</span>
                    </div>
                  </div>
                </div>

                {/* Desktop Table View (>= md) */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-100 text-slate-600 font-bold uppercase tracking-wider">
                    <th className="py-3 px-4 w-28">Kode Akun</th>
                    <th className="py-3 px-4">Nama Akun</th>
                    <th className="py-3 px-4 w-32">Kategori</th>
                    <th className="py-3 px-4 text-right w-44">Saldo Debit (Rp)</th>
                    <th className="py-3 px-4 text-right w-44">Saldo Kredit (Rp)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {initialTrialBalance.rows.map((r) => (
                    <tr key={r.code} className="hover:bg-slate-50/60">
                      <td className="py-2.5 px-4 font-mono font-bold text-slate-700">{r.code}</td>
                      <td className="py-2.5 px-4 font-semibold text-slate-900">{r.name}</td>
                      <td className="py-2.5 px-4 uppercase text-[10px] font-bold text-slate-400">
                        {r.category}
                      </td>
                      <td className="py-2.5 px-4 text-right font-mono font-bold text-slate-900">
                        {r.debit > 0 ? formatRupiah(r.debit) : '-'}
                      </td>
                      <td className="py-2.5 px-4 text-right font-mono font-bold text-slate-900">
                        {r.credit > 0 ? formatRupiah(r.credit) : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-slate-100 font-black border-t-2 border-slate-300 text-sm">
                    <td colSpan={3} className="py-3.5 px-4 text-right uppercase text-slate-700">
                      Total Saldo Neraca:
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono text-slate-900">
                      {formatRupiah(initialTrialBalance.totalDebit || 0)}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono text-slate-900">
                      {formatRupiah(initialTrialBalance.totalCredit || 0)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
      )}

      {/* TAB 5: LAPORAN LABA RUGI (Income Statement) */}
      {activeTab === 'income_statement' && (
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-4 sm:p-6 max-w-4xl mx-auto space-y-5 sm:space-y-6">
          <div className="text-center pb-4 border-b border-slate-200">
            <h2 className="text-base sm:text-lg font-black text-slate-900">LAPORAN LABA RUGI (INCOME STATEMENT)</h2>
            <p className="text-xs text-slate-500 mt-0.5">Cobascan • Periode: {periodLabel}</p>
          </div>

          {/* A. PENDAPATAN OPERASIONAL */}
          <div className="space-y-2">
            <div className="flex items-center justify-between pb-1 border-b border-slate-100 font-bold text-[11px] sm:text-xs uppercase tracking-wider text-slate-700">
              <span className="truncate pr-2">A. Pendapatan Operasional</span>
              <span className="shrink-0">Jumlah</span>
            </div>
            {(initialIncomeStatement.revenues || []).length === 0 ? (
              <div className="text-xs text-slate-400 py-1 pl-2 sm:pl-4">Belum ada pendapatan tercatat</div>
            ) : (
              (initialIncomeStatement.revenues || []).map((r) => (
                <div key={r.code} className="flex items-center justify-between text-xs py-1 pl-2 sm:pl-4 gap-2">
                  <span className="text-slate-600 truncate">{r.name}</span>
                  <span className="font-mono font-medium text-slate-900 shrink-0">{formatRupiah(r.amount)}</span>
                </div>
              ))
            )}
            <div className="flex items-center justify-between pt-2 border-t border-slate-200 font-bold text-xs text-slate-900 gap-2">
              <span className="truncate pr-2">Total Pendapatan Operasional:</span>
              <span className="font-mono text-emerald-600 shrink-0">{formatRupiah(initialIncomeStatement.totalRevenue || 0)}</span>
            </div>
          </div>

          {/* B. BEBAN POKOK PENJUALAN (HPP) */}
          <div className="space-y-2 pt-2">
            <div className="flex items-center justify-between pb-1 border-b border-slate-100 font-bold text-[11px] sm:text-xs uppercase tracking-wider text-slate-700">
              <span className="truncate pr-2">B. Beban Pokok Penjualan (HPP)</span>
              <span className="shrink-0">Jumlah</span>
            </div>
            {(initialIncomeStatement.costOfGoodsSold || []).length === 0 ? (
              <div className="text-xs text-slate-400 py-1 pl-2 sm:pl-4">Belum ada HPP tercatat</div>
            ) : (
              (initialIncomeStatement.costOfGoodsSold || []).map((c) => (
                <div key={c.code} className="flex items-center justify-between text-xs py-1 pl-2 sm:pl-4 gap-2">
                  <span className="text-slate-600 truncate">{c.name}</span>
                  <span className="font-mono font-medium text-slate-900 shrink-0">{formatRupiah(c.amount)}</span>
                </div>
              ))
            )}
            <div className="flex items-center justify-between pt-2 border-t border-slate-200 font-bold text-xs text-slate-900 gap-2">
              <span className="truncate pr-2">Total Beban Pokok Penjualan:</span>
              <span className="font-mono text-rose-600 shrink-0">({formatRupiah(initialIncomeStatement.totalCOGS || 0)})</span>
            </div>
          </div>

          {/* LABA KOTOR */}
          <div className="p-3.5 sm:p-4 rounded-xl bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 font-black text-xs sm:text-sm text-slate-900 border border-slate-200">
            <span>LABA KOTOR (GROSS PROFIT):</span>
            <span className="font-mono text-[#1A73E8] text-sm sm:text-base">{formatRupiah(initialIncomeStatement.grossProfit || 0)}</span>
          </div>

          {/* C. BEBAN OPERASIONAL */}
          <div className="space-y-2 pt-2">
            <div className="flex items-center justify-between pb-1 border-b border-slate-100 font-bold text-[11px] sm:text-xs uppercase tracking-wider text-slate-700">
              <span className="truncate pr-2">C. Beban Operasional &amp; Administrasi</span>
              <span className="shrink-0">Jumlah</span>
            </div>
            {(initialIncomeStatement.operatingExpenses || []).length === 0 ? (
              <div className="text-xs text-slate-400 py-1 pl-2 sm:pl-4">Belum ada beban operasional tercatat</div>
            ) : (
              (initialIncomeStatement.operatingExpenses || []).map((o) => (
                <div key={o.code} className="flex items-center justify-between text-xs py-1 pl-2 sm:pl-4 gap-2">
                  <span className="text-slate-600 truncate">{o.name}</span>
                  <span className="font-mono font-medium text-slate-900 shrink-0">{formatRupiah(o.amount)}</span>
                </div>
              ))
            )}
            <div className="flex items-center justify-between pt-2 border-t border-slate-200 font-bold text-xs text-slate-900 gap-2">
              <span className="truncate pr-2">Total Beban Operasional:</span>
              <span className="font-mono text-rose-600 shrink-0">({formatRupiah(initialIncomeStatement.totalOperatingExpense || 0)})</span>
            </div>
          </div>

          {/* LABA BERSIH */}
          <div className="p-3.5 sm:p-4 rounded-2xl bg-blue-50 border border-blue-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 font-black text-xs sm:text-base text-slate-900">
            <div className="flex items-center gap-2 flex-wrap">
              <span>LABA BERSIH USAHA (NET INCOME):</span>
              {initialIncomeStatement.totalRevenue > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white text-[#1A73E8] border border-blue-200">
                  {initialIncomeStatement.netMargin}% Margin
                </span>
              )}
            </div>
            <span className="font-mono text-lg sm:text-xl font-black text-[#1A73E8] self-end sm:self-auto">
              {formatRupiah(initialIncomeStatement.netIncome || 0)}
            </span>
          </div>
        </div>
      )}

      {/* TAB 6: LAPORAN ARUS KAS (Cash Flow Statement) */}
      {activeTab === 'cashflow_statement' && (
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-4 sm:p-6 max-w-4xl mx-auto space-y-5 sm:space-y-6">
          <div className="text-center pb-4 border-b border-slate-200">
            <h2 className="text-base sm:text-lg font-black text-slate-900">LAPORAN ARUS KAS (STATEMENT OF CASH FLOWS)</h2>
            <p className="text-xs text-slate-500 mt-0.5">Cobascan • Periode: {periodLabel}</p>
          </div>

          {/* 1. ARUS KAS AKTIVITAS OPERASI */}
          <div className="space-y-3">
            <h3 className="font-bold text-[11px] sm:text-xs uppercase tracking-wider text-slate-700 pb-1 border-b border-slate-100">
              1. Arus Kas dari Aktivitas Operasi
            </h3>

            <div className="space-y-1 pl-2 sm:pl-4">
              <div className="flex items-center justify-between text-xs py-1 gap-2">
                <span className="text-slate-700 font-medium truncate">Penerimaan Kas dari Pelanggan:</span>
                <span className="font-mono font-bold text-emerald-600 shrink-0">
                  +{formatRupiah(initialCashFlow.totalOperatingReceipts || 0)}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs py-1 gap-2">
                <span className="text-slate-700 font-medium truncate">Pengeluaran Kas HPP &amp; Beban:</span>
                <span className="font-mono font-bold text-rose-600 shrink-0">
                  -{formatRupiah(initialCashFlow.totalOperatingPayments || 0)}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-200 font-bold text-xs text-slate-900 gap-2">
              <span className="truncate pr-2">Arus Kas Bersih Aktivitas Operasi:</span>
              <span className="font-mono text-xs sm:text-sm text-[#1A73E8] shrink-0">
                {formatRupiah(initialCashFlow.netOperatingCashFlow || 0)}
              </span>
            </div>
          </div>

          {/* 2. ARUS KAS AKTIVITAS PENDANAAN */}
          <div className="space-y-3 pt-2">
            <h3 className="font-bold text-[11px] sm:text-xs uppercase tracking-wider text-slate-700 pb-1 border-b border-slate-100">
              2. Arus Kas dari Aktivitas Pendanaan &amp; Modal
            </h3>
            <div className="space-y-1 pl-2 sm:pl-4">
              <div className="flex items-center justify-between text-xs py-1 gap-2">
                <span className="text-slate-700 font-medium truncate">Penerimaan Modal Pemilik / Prive Bersih:</span>
                <span className="font-mono text-slate-600 shrink-0">{formatRupiah(initialCashFlow.totalFinancing || 0)}</span>
              </div>
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-slate-200 font-bold text-xs text-slate-900 gap-2">
              <span className="truncate pr-2">Arus Kas Bersih Aktivitas Pendanaan:</span>
              <span className="font-mono text-slate-900 shrink-0">{formatRupiah(initialCashFlow.totalFinancing || 0)}</span>
            </div>
          </div>

          {/* 3. SALDO KAS AKHIR */}
          <div className="p-3.5 sm:p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 font-black text-xs sm:text-base text-slate-900">
            <span>SALDO KAS &amp; BANK AKHIR:</span>
            <span className="font-mono text-lg sm:text-xl font-black text-emerald-700 self-end sm:self-auto">
              {formatRupiah(initialCashFlow.endingCashBalance || 0)}
            </span>
          </div>
        </div>
      )}

      {/* MODAL 1: Quick Cash In / Cash Out */}
      <Modal
        isOpen={isQuickModalOpen}
        onClose={() => setIsQuickModalOpen(false)}
        title={quickModalType === 'income' ? 'Catat Pemasukan Kas' : 'Catat Pengeluaran Kas'}
        description="Sistem akan otomatis mencatat kas dan membuat jurnal berpasangan di Buku Besar."
      >
        <form onSubmit={handleQuickSubmit} className="space-y-4">
          {formError && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          {/* Auto Journal Callout */}
          <div className="bg-blue-50/70 border border-blue-200/60 rounded-xl p-3 flex items-start gap-2.5 text-xs text-blue-900">
            <Sparkles className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Otomatis Terjurnal ke Akuntansi:</span>{' '}
              <span className="text-blue-800/90">
                Data yang Anda simpan di sini langsung membuat ayat Jurnal Umum (Debit/Kredit Kas vs Akun Terkait) dan mem-posting ke Buku Besar &amp; Laba Rugi tanpa perlu input manual.
              </span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Jenis Transaksi</label>
            <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-slate-100">
              <button
                type="button"
                onClick={() => {
                  setQuickModalType('income');
                  setCategory('penjualan_akrilik');
                }}
                className={`py-2 px-3 rounded-lg text-xs font-bold transition-all ${
                  quickModalType === 'income' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600'
                }`}
              >
                + Pemasukan (Kas Masuk)
              </button>
              <button
                type="button"
                onClick={() => {
                  setQuickModalType('expense');
                  setCategory('modal_akrilik');
                }}
                className={`py-2 px-3 rounded-lg text-xs font-bold transition-all ${
                  quickModalType === 'expense' ? 'bg-rose-600 text-white shadow-xs' : 'text-slate-600'
                }`}
              >
                - Pengeluaran (Kas Keluar)
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Nominal Uang (Rp) *</label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">Rp</span>
              <input
                type="text"
                value={amountInput ? Number(amountInput).toLocaleString('id-ID') : ''}
                onChange={(e) => setAmountInput(e.target.value.replace(/[^0-9]/g, ''))}
                placeholder="Contoh: 250.000"
                required
                className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm font-bold font-mono focus:outline-none focus:ring-2 focus:ring-[#1A73E8]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Kategori Transaksi *</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#1A73E8]"
            >
              {activeCategories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Tanggal</label>
            <input
              type="date"
              value={transactionDate}
              onChange={(e) => setTransactionDate(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#1A73E8]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Keterangan / Deskripsi</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Contoh: Penjualan 2 pcs ke Cafe Senja"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#1A73E8]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">No. Nota / Invoice (Opsional)</label>
            <input
              type="text"
              value={referenceNumber}
              onChange={(e) => setReferenceNumber(e.target.value)}
              placeholder="Contoh: INV-2026-001"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-[#1A73E8]"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <Button type="button" variant="outline" size="sm" onClick={() => setIsQuickModalOpen(false)}>
              Batal
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isSubmitting || isPending}
              className={quickModalType === 'income' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-rose-600 hover:bg-rose-700'}
            >
              {isSubmitting ? 'Menyimpan...' : 'Simpan Transaksi'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* MODAL 2: Manual Double-Entry Journal */}
      <Modal
        isOpen={isJournalModalOpen}
        onClose={() => setIsJournalModalOpen(false)}
        title="Input Jurnal Penyesuaian Manual (Non-Kas)"
        description="Gunakan formulir ini HANYA jika Anda ingin mencatat penyesuaian akuntansi non-kas (seperti depresiasi aset, koreksi saldo, atau modal awal). Seluruh transaksi kas masuk/keluar harian sudah otomatis terjurnal melalui tombol Catat Pemasukan / Pengeluaran."
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleJournalSubmit} className="space-y-4">
          {journalError && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{journalError}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Tanggal Transaksi</label>
              <input
                type="date"
                value={journalDate}
                onChange={(e) => setJournalDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#1A73E8]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">No. Bukti / Referensi</label>
              <input
                type="text"
                value={journalRef}
                onChange={(e) => setJournalRef(e.target.value)}
                placeholder="Contoh: MEMO-001"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-[#1A73E8]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Keterangan Jurnal</label>
            <input
              type="text"
              value={journalDesc}
              onChange={(e) => setJournalDesc(e.target.value)}
              placeholder="Contoh: Penyesuaian persediaan akrilik akhir bulan"
              required
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#1A73E8]"
            />
          </div>

          {/* Journal Lines Table */}
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-600 font-bold uppercase tracking-wider border-b border-slate-200">
                  <th className="py-2 px-3">Akun</th>
                  <th className="py-2 px-3 w-36 text-right">Debit (Rp)</th>
                  <th className="py-2 px-3 w-36 text-right">Kredit (Rp)</th>
                  <th className="py-2 px-2 w-10 text-center"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {journalLines.map((line, idx) => (
                  <tr key={idx}>
                    <td className="p-2">
                      <select
                        value={line.accountCode}
                        onChange={(e) => updateJournalLine(idx, 'accountCode', e.target.value)}
                        className="w-full px-2 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[#1A73E8]"
                      >
                        {CHART_OF_ACCOUNTS.map((acc) => (
                          <option key={acc.code} value={acc.code}>
                            {acc.code} - {acc.name} ({acc.category})
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="p-2">
                      <input
                        type="text"
                        value={line.debit ? Number(line.debit).toLocaleString('id-ID') : ''}
                        onChange={(e) => updateJournalLine(idx, 'debit', e.target.value.replace(/[^0-9]/g, ''))}
                        placeholder="0"
                        className="w-full px-2 py-1.5 rounded-lg border border-slate-200 text-right font-mono text-xs font-bold focus:outline-none focus:ring-1 focus:ring-[#1A73E8]"
                      />
                    </td>
                    <td className="p-2">
                      <input
                        type="text"
                        value={line.credit ? Number(line.credit).toLocaleString('id-ID') : ''}
                        onChange={(e) => updateJournalLine(idx, 'credit', e.target.value.replace(/[^0-9]/g, ''))}
                        placeholder="0"
                        className="w-full px-2 py-1.5 rounded-lg border border-slate-200 text-right font-mono text-xs font-bold focus:outline-none focus:ring-1 focus:ring-[#1A73E8]"
                      />
                    </td>
                    <td className="p-2 text-center">
                      {journalLines.length > 2 && (
                        <button
                          type="button"
                          onClick={() => removeJournalLine(idx)}
                          className="text-slate-400 hover:text-rose-600"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={addJournalLine}
              className="text-xs font-bold text-[#1A73E8] hover:underline inline-flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              Tambah Baris Akun
            </button>

            {/* Sum comparison */}
            <div className="text-right text-xs">
              <span className="text-slate-500 mr-2">Total Debit vs Kredit:</span>
              <span className="font-mono font-bold text-slate-900">
                {formatRupiah(journalLines.reduce((acc, l) => acc + (Number(l.debit) || 0), 0))}
              </span>
              <span className="mx-1 text-slate-400">/</span>
              <span className="font-mono font-bold text-slate-900">
                {formatRupiah(journalLines.reduce((acc, l) => acc + (Number(l.credit) || 0), 0))}
              </span>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <Button type="button" variant="outline" size="sm" onClick={() => setIsJournalModalOpen(false)}>
              Batal
            </Button>
            <Button type="submit" size="sm" disabled={isSubmitting || isPending} className="bg-[#1A73E8] hover:bg-blue-700 text-white">
              {isSubmitting ? 'Menyimpan...' : 'Simpan Jurnal'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
