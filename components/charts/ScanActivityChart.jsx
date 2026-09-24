'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Calendar, ChevronDown, TrendingUp } from 'lucide-react';

const PERIOD_OPTIONS = [
  { id: '7d', label: '7 Hari Terakhir' },
  { id: '30d', label: '30 Hari Terakhir' },
  { id: 'this_month', label: 'Bulan Ini' },
  { id: 'last_month', label: 'Bulan Lalu' },
];

function ScanSplineChart({ data, loading }) {
  if (loading) {
    return (
      <div className="w-full h-56 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-slate-400">
          <div className="w-8 h-8 border-2 border-blue-200 border-t-[#1A73E8] rounded-full animate-spin" />
          <span className="text-xs font-semibold">Memuat data...</span>
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="w-full h-56 flex items-center justify-center">
        <p className="text-slate-400 text-sm text-center">Belum ada data scan untuk periode ini.</p>
      </div>
    );
  }

  const maxCount = Math.max(...data.map((d) => d.count), 1);
  const svgW = 600;
  const svgH = 160;
  const padL = 30;
  const padR = 10;
  const padT = 10;
  const padB = 10;
  const chartW = svgW - padL - padR;
  const chartH = svgH - padT - padB;

  const points = data.map((d, i) => ({
    x: padL + (i / (data.length - 1 || 1)) * chartW,
    y: padT + chartH - (d.count / maxCount) * chartH,
    count: d.count,
    label: d.label,
  }));

  // Build smooth bezier path
  let pathD = `M ${points[0].x} ${points[0].y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i];
    const p1 = points[i + 1];
    const cpx = (p0.x + p1.x) / 2;
    pathD += ` C ${cpx} ${p0.y}, ${cpx} ${p1.y}, ${p1.x} ${p1.y}`;
  }

  const lastP = points[points.length - 1];
  const firstP = points[0];
  const areaD = `${pathD} L ${lastP.x} ${svgH} L ${firstP.x} ${svgH} Z`;

  // Show only a subset of x-axis labels depending on count
  const step = data.length <= 7 ? 1 : data.length <= 14 ? 2 : Math.ceil(data.length / 7);
  const visibleLabels = data.filter((_, i) => i % step === 0 || i === data.length - 1);

  return (
    <div className="w-full">
      <svg
        className="w-full overflow-visible"
        viewBox={`0 0 ${svgW} ${svgH}`}
        preserveAspectRatio="none"
        style={{ height: '14rem' }}
      >
        <defs>
          <linearGradient id="scanGradDyn" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#1A73E8" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#1A73E8" stopOpacity="0.0" />
          </linearGradient>
        </defs>

        {/* Grid lines */}
        {[0.25, 0.5, 0.75, 1].map((frac) => (
          <line
            key={frac}
            x1={padL}
            y1={padT + chartH * (1 - frac)}
            x2={svgW - padR}
            y2={padT + chartH * (1 - frac)}
            stroke="#F1F5F9"
            strokeWidth="1"
          />
        ))}

        {/* Y-axis labels */}
        {[0.25, 0.5, 0.75, 1].map((frac) => (
          <text
            key={frac}
            x={padL - 4}
            y={padT + chartH * (1 - frac) + 4}
            fill="#94A3B8"
            fontSize="9"
            textAnchor="end"
            fontFamily="sans-serif"
          >
            {Math.round(maxCount * frac)}
          </text>
        ))}

        {/* Area fill */}
        <path d={areaD} fill="url(#scanGradDyn)" />

        {/* Stroke */}
        <path d={pathD} fill="none" stroke="#1A73E8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

        {/* Data point dots */}
        {points.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r={data.length <= 14 ? 3.5 : 2.5} fill="#1A73E8" stroke="#fff" strokeWidth="1.5">
            <title>{`${p.label}: ${p.count} scan`}</title>
          </circle>
        ))}
      </svg>

      {/* X-axis labels */}
      <div className="flex justify-between text-[10px] text-slate-400 px-1 mt-1">
        {visibleLabels.map((d, i) => (
          <span key={i}>{d.label}</span>
        ))}
      </div>
    </div>
  );
}

export default function ScanActivityChart({ initialPeriod = '7d' }) {
  const [period, setPeriod] = useState(initialPeriod);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState([]);
  const [totalForPeriod, setTotalForPeriod] = useState(0);

  const fetchData = useCallback(async (p) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/dashboard/scan-chart?period=${p}`, { cache: 'no-store' });
      if (!res.ok) throw new Error('Fetch failed');
      const json = await res.json();
      setChartData(json.chartData || []);
      setTotalForPeriod(json.total || 0);
    } catch (e) {
      console.error('ScanActivityChart fetch error:', e);
      setChartData([]);
      setTotalForPeriod(0);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData(period);
  }, [period, fetchData]);

  const currentLabel = PERIOD_OPTIONS.find((o) => o.id === period)?.label || '7 Hari Terakhir';

  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-xs flex flex-col justify-between">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="font-extrabold text-slate-900 text-base">Aktivitas Scan</h2>
          {!loading && (
            <p className="text-xs text-slate-400 mt-0.5">
              <span className="font-bold text-slate-700">{totalForPeriod.toLocaleString('id-ID')}</span> scan pada periode ini
            </p>
          )}
        </div>
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsDropdownOpen((o) => !o)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
          >
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span>{currentLabel}</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl border border-slate-200 shadow-xl py-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
              {PERIOD_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => {
                    setPeriod(opt.id);
                    setIsDropdownOpen(false);
                  }}
                  className={`w-full text-left px-4 py-2 text-xs font-semibold flex items-center justify-between ${
                    period === opt.id ? 'bg-blue-50 text-[#1A73E8]' : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span>{opt.label}</span>
                  {period === opt.id && <span className="w-1.5 h-1.5 rounded-full bg-[#1A73E8]" />}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <ScanSplineChart data={chartData} loading={loading} />
    </div>
  );
}
