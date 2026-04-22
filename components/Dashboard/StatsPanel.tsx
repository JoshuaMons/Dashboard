'use client';

import { useMemo } from 'react';
import { Info } from 'lucide-react';
import { ParsedTable } from '@/types';
import { useLanguage } from '@/contexts/LanguageContext';
import { clsx } from 'clsx';

interface Props {
  table: ParsedTable;
  data: Record<string, any>[];
}

function fmt(n: number): string {
  if (Math.abs(n) >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
  if (Math.abs(n) >= 1_000) return (n / 1_000).toFixed(1) + 'k';
  return Number.isInteger(n) ? n.toString() : n.toFixed(2);
}

// Tooltip shown on stat column headers
const STAT_TIPS: Record<string, [string, string]> = {
  min:    ['The smallest value found in this column.', 'De kleinste waarde in deze kolom.'],
  max:    ['The largest value found in this column.', 'De grootste waarde in deze kolom.'],
  mean:   ['The arithmetic average: sum ÷ count. Sensitive to outliers.', 'Het rekenkundig gemiddelde: som ÷ aantal. Gevoelig voor uitschieters.'],
  median: ['The middle value when sorted. More robust than the mean when outliers exist.', 'De middelste waarde gesorteerd. Robuuster dan het gemiddelde bij uitschieters.'],
  nulls:  ['Number and percentage of empty or missing values in this column.', 'Aantal en percentage lege of ontbrekende waarden in deze kolom.'],
};

function InfoTooltip({ text, pos = 'center' }: { text: string; pos?: 'left' | 'center' }) {
  return (
    <span className="relative group inline-flex flex-shrink-0 ml-1">
      <Info className="w-3 h-3 text-slate-300 hover:text-slate-500 cursor-help transition-colors" />
      <span className={clsx(
        'absolute bottom-full mb-2 w-52 bg-slate-800 text-white text-xs rounded-xl px-3 py-2 opacity-0 group-hover:opacity-100 pointer-events-none z-50 shadow-xl leading-relaxed transition-opacity',
        pos === 'center' ? 'left-1/2 -translate-x-1/2' : 'right-0'
      )}>
        {text}
        <span className={clsx(
          'absolute top-full border-[5px] border-transparent border-t-slate-800',
          pos === 'center' ? 'left-1/2 -translate-x-1/2' : 'right-3'
        )} />
      </span>
    </span>
  );
}

function RangeBar({ minN, maxN, meanN, medianN }: {
  minN: number; maxN: number; meanN: number; medianN: number;
}) {
  const range = maxN - minN;
  if (range === 0) return <span className="text-xs text-slate-300 tabular-nums">{fmt(minN)}</span>;

  const meanPct  = ((meanN  - minN) / range) * 100;
  const medPct   = ((medianN - minN) / range) * 100;

  return (
    <div
      className="flex items-center gap-1.5 w-full min-w-[100px]"
      title={`Mean: ${fmt(meanN)} · Median: ${fmt(medianN)}`}
    >
      <span className="text-xs tabular-nums text-slate-400 flex-shrink-0 text-right w-8">{fmt(minN)}</span>
      <div className="relative flex-1 h-2 bg-surface-200 rounded-full">
        {/* Mean dot — indigo */}
        <div
          className="absolute w-2.5 h-2.5 bg-primary-500 rounded-full border-2 border-white shadow-sm"
          style={{ left: `${meanPct}%`, top: '50%', transform: 'translate(-50%, -50%)' }}
        />
        {/* Median dot — emerald */}
        <div
          className="absolute w-2 h-2 bg-emerald-500 rounded-full border-2 border-white shadow-sm"
          style={{ left: `${medPct}%`, top: '50%', transform: 'translate(-50%, -50%)' }}
        />
      </div>
      <span className="text-xs tabular-nums text-slate-400 flex-shrink-0 w-8">{fmt(maxN)}</span>
    </div>
  );
}

export default function StatsPanel({ table, data }: Props) {
  const { t, lang } = useLanguage();

  const numericCols = table.columns.filter((c) => c.inferredType === 'number');

  const stats = useMemo(() => {
    return numericCols.map((col) => {
      const vals = data
        .map((row) => row[col.originalName])
        .filter((v) => v != null && v !== '' && !isNaN(Number(v)));

      const nullCount = data.length - vals.length;
      const nullPct = data.length > 0 ? Math.round((nullCount / data.length) * 100) : 0;

      if (vals.length === 0) {
        return {
          col: col.originalName,
          min: '—', max: '—', mean: '—', median: '—',
          minN: 0, maxN: 0, meanN: 0, medianN: 0,
          nullCount, nullPct, hasData: false,
        };
      }

      const nums = vals.map(Number).sort((a, b) => a - b);
      const sum = nums.reduce((a, b) => a + b, 0);
      const mean = sum / nums.length;
      const mid = Math.floor(nums.length / 2);
      const median = nums.length % 2 === 0 ? (nums[mid - 1] + nums[mid]) / 2 : nums[mid];

      return {
        col: col.originalName,
        min: fmt(nums[0]),
        max: fmt(nums[nums.length - 1]),
        mean: fmt(mean),
        median: fmt(median),
        minN: nums[0],
        maxN: nums[nums.length - 1],
        meanN: mean,
        medianN: median,
        nullCount,
        nullPct,
        hasData: true,
      };
    });
  }, [numericCols, data]);

  if (numericCols.length === 0) return null;

  const tip = (key: string) => {
    const [en, nl] = STAT_TIPS[key];
    return lang === 'nl' ? nl : en;
  };

  return (
    <div className="card overflow-hidden">
      <div className="px-5 py-4 border-b border-surface-200 flex items-center justify-between gap-3">
        <h3 className="text-sm font-semibold text-slate-700">{t('statsTitle')}</h3>
        {/* Legend */}
        <div className="flex items-center gap-3 text-xs text-slate-400">
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-primary-500 inline-block" />
            {lang === 'nl' ? 'Gemiddelde' : 'Mean'}
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
            {lang === 'nl' ? 'Mediaan' : 'Median'}
          </span>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-surface-50 border-b border-surface-200">
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                {t('columnLabel')}
              </th>
              {(['min','max','mean','median','nulls'] as const).map((k) => (
                <th key={k} className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">
                  <span className="inline-flex items-center justify-end">
                    {t(k === 'nulls' ? 'statNulls' : k === 'min' ? 'statMin' : k === 'max' ? 'statMax' : k === 'mean' ? 'statMean' : 'statMedian')}
                    <InfoTooltip text={tip(k)} pos={k === 'nulls' ? 'left' : 'center'} />
                  </span>
                </th>
              ))}
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">
                {lang === 'nl' ? 'Spreiding' : 'Range'}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-100">
            {stats.map((s) => (
              <tr key={s.col} className="hover:bg-surface-50">
                <td className="px-4 py-3 text-xs font-mono text-slate-600 whitespace-nowrap">{s.col}</td>
                <td className="px-4 py-3 text-xs text-right tabular-nums text-slate-700">{s.min}</td>
                <td className="px-4 py-3 text-xs text-right tabular-nums text-slate-700">{s.max}</td>
                <td className="px-4 py-3 text-xs text-right tabular-nums text-slate-700">{s.mean}</td>
                <td className="px-4 py-3 text-xs text-right tabular-nums text-slate-700">{s.median}</td>
                <td className="px-4 py-3 text-xs text-right tabular-nums">
                  <span className={clsx(s.nullPct > 20 ? 'text-amber-600 font-semibold' : 'text-slate-400')}>
                    {s.nullCount.toLocaleString()} ({s.nullPct}%)
                  </span>
                </td>
                <td className="px-4 py-3 w-48">
                  {s.hasData
                    ? <RangeBar minN={s.minN} maxN={s.maxN} meanN={s.meanN} medianN={s.medianN} />
                    : <span className="text-xs text-slate-300">—</span>
                  }
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
