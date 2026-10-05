export const FINANCE_CATEGORIES = {
  income: [
    { id: 'penjualan_akrilik', label: 'Penjualan Stand Akrilik', defaultCreditAccount: '401' },
    { id: 'setup_instalasi', label: 'Biaya Setup & Desain', defaultCreditAccount: '402' },
    { id: 'langganan_saas', label: 'Langganan Platform SaaS', defaultCreditAccount: '403' },
    { id: 'lainnya_pemasukan', label: 'Pemasukan Lainnya', defaultCreditAccount: '404' },
  ],
  expense: [
    { id: 'modal_akrilik', label: 'Bahan & Cetak Akrilik', defaultDebitAccount: '501' },
    { id: 'chip_nfc', label: 'Chip & Stiker NFC', defaultDebitAccount: '501' },
    { id: 'server_domain', label: 'Hosting, Server & Domain', defaultDebitAccount: '502' },
    { id: 'operasional', label: 'Operasional & Transport', defaultDebitAccount: '503' },
    { id: 'lainnya_pengeluaran', label: 'Pengeluaran Lainnya', defaultDebitAccount: '506' },
  ],
};

export const CHART_OF_ACCOUNTS = [
  // 1. Aset (Harta) - Normal Balance: Debit
  { code: '101', name: 'Kas & Bank', category: 'aset', normalBalance: 'debit', subCategory: 'kas' },
  { code: '102', name: 'Piutang Usaha', category: 'aset', normalBalance: 'debit', subCategory: 'piutang' },
  { code: '103', name: 'Persediaan Stand Akrilik & Chip NFC', category: 'aset', normalBalance: 'debit', subCategory: 'persediaan' },
  { code: '104', name: 'Peralatan & Aset Tetap', category: 'aset', normalBalance: 'debit', subCategory: 'aset_tetap' },

  // 2. Kewajiban (Utang) - Normal Balance: Kredit
  { code: '201', name: 'Utang Usaha / Vendor', category: 'kewajiban', normalBalance: 'credit', subCategory: 'utang_lancar' },
  { code: '202', name: 'Pendapatan Diterima di Muka', category: 'kewajiban', normalBalance: 'credit', subCategory: 'utang_lancar' },

  // 3. Ekuitas (Modal) - Normal Balance: Kredit
  { code: '301', name: 'Modal Disetor Pemilik', category: 'ekuitas', normalBalance: 'credit', subCategory: 'modal' },
  { code: '302', name: 'Laba Ditahan', category: 'ekuitas', normalBalance: 'credit', subCategory: 'laba_ditahan' },
  { code: '303', name: 'Prive Pemilik', category: 'ekuitas', normalBalance: 'debit', subCategory: 'prive' },

  // 4. Pendapatan - Normal Balance: Kredit
  { code: '401', name: 'Pendapatan Penjualan Stand Akrilik', category: 'pendapatan', normalBalance: 'credit', subCategory: 'operasional' },
  { code: '402', name: 'Pendapatan Biaya Setup & Desain QR', category: 'pendapatan', normalBalance: 'credit', subCategory: 'operasional' },
  { code: '403', name: 'Pendapatan Langganan Platform SaaS', category: 'pendapatan', normalBalance: 'credit', subCategory: 'operasional' },
  { code: '404', name: 'Pendapatan Operasional Lainnya', category: 'pendapatan', normalBalance: 'credit', subCategory: 'lainnya' },

  // 5. Beban (Biaya) - Normal Balance: Debit
  { code: '501', name: 'Beban Pokok Penjualan (HPP Akrilik & NFC)', category: 'beban', normalBalance: 'debit', subCategory: 'hpp' },
  { code: '502', name: 'Beban Hosting, Domain & Server', category: 'beban', normalBalance: 'debit', subCategory: 'operasional' },
  { code: '503', name: 'Beban Operasional & Transportasi', category: 'beban', normalBalance: 'debit', subCategory: 'operasional' },
  { code: '504', name: 'Beban Pemasaran & Iklan', category: 'beban', normalBalance: 'debit', subCategory: 'pemasaran' },
  { code: '505', name: 'Beban Administrasi & Umum', category: 'beban', normalBalance: 'debit', subCategory: 'umum' },
  { code: '506', name: 'Beban Lain-lain', category: 'beban', normalBalance: 'debit', subCategory: 'lainnya' },
];

export function getAccountByCode(code) {
  return CHART_OF_ACCOUNTS.find((a) => a.code === code) || {
    code,
    name: `Akun ${code}`,
    category: 'lainnya',
    normalBalance: 'debit',
  };
}

export function getCategoryLabel(categoryKey) {
  const all = [...FINANCE_CATEGORIES.income, ...FINANCE_CATEGORIES.expense];
  const found = all.find((c) => c.id === categoryKey);
  return found ? found.label : categoryKey;
}

export const PERIOD_OPTIONS = [
  { id: 'all', label: 'Semua Waktu' },
  { id: 'today', label: 'Hari Ini' },
  { id: 'this_week', label: 'Minggu Ini' },
  { id: 'this_month', label: 'Bulan Ini' },
  { id: 'this_year', label: 'Tahun Ini' },
  { id: 'custom', label: 'Pilih Periode' },
];

export function getDateRangeForPeriod(periodId, customStart = null, customEnd = null) {
  const now = new Date();
  const formatYMD = (d) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  if (periodId === 'today') {
    const todayStr = formatYMD(now);
    return {
      startDate: `${todayStr}T00:00:00`,
      endDate: `${todayStr}T23:59:59.999`,
      label: 'Hari Ini',
    };
  }

  if (periodId === 'this_week') {
    const curr = new Date(now);
    const day = curr.getDay(); // 0 is Sunday, 1 is Monday...
    const diffToMonday = day === 0 ? -6 : 1 - day;
    const monday = new Date(curr);
    monday.setDate(curr.getDate() + diffToMonday);
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    return {
      startDate: `${formatYMD(monday)}T00:00:00`,
      endDate: `${formatYMD(sunday)}T23:59:59.999`,
      label: 'Minggu Ini',
    };
  }

  if (periodId === 'this_month') {
    const year = now.getFullYear();
    const month = now.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    return {
      startDate: `${formatYMD(firstDay)}T00:00:00`,
      endDate: `${formatYMD(lastDay)}T23:59:59.999`,
      label: 'Bulan Ini',
    };
  }

  if (periodId === 'this_year') {
    const year = now.getFullYear();
    return {
      startDate: `${year}-01-01T00:00:00`,
      endDate: `${year}-12-31T23:59:59.999`,
      label: `Tahun ${year}`,
    };
  }

  if (periodId === 'custom' && customStart && customEnd) {
    const cleanStart = customStart.includes('T') ? customStart.split('T')[0] : customStart;
    const cleanEnd = customEnd.includes('T') ? customEnd.split('T')[0] : customEnd;
    return {
      startDate: `${cleanStart}T00:00:00`,
      endDate: `${cleanEnd}T23:59:59.999`,
      label: `${cleanStart} s/d ${cleanEnd}`,
    };
  }

  return { startDate: null, endDate: null, label: 'Semua Waktu' };
}
