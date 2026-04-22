'use client';

import { useMemo } from 'react';
import { X, Hash, Type, Calendar, ToggleLeft, AlignLeft } from 'lucide-react';
import { ParsedColumn, ParsedTable, ColumnType, Language } from '@/types';
import { useLanguage } from '@/contexts/LanguageContext';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { clsx } from 'clsx';

const COLORS = ['#6366f1', '#8b5cf6', '#60a5fa', '#34d399', '#f59e0b', '#f87171', '#a78bfa', '#2dd4bf', '#fb923c', '#e879f9'];

const TYPE_META: Record<ColumnType, { color: string; Icon: any }> = {
  date:     { color: 'bg-blue-50 text-blue-700 ring-blue-200',     Icon: Calendar },
  number:   { color: 'bg-emerald-50 text-emerald-700 ring-emerald-200', Icon: Hash },
  category: { color: 'bg-violet-50 text-violet-700 ring-violet-200',  Icon: Type },
  boolean:  { color: 'bg-amber-50 text-amber-700 ring-amber-200',   Icon: ToggleLeft },
  text:     { color: 'bg-slate-100 text-slate-600 ring-slate-200',   Icon: AlignLeft },
};

// keyword → description key mapping (same keyword banks as analytics.ts)
const NAME_DESC_KEYS: Array<[string[], string]> = [
  [['date','datum','created','timestamp','tijdstip','created_at','aangemaakt','started','time','datetime','modified','updated'], 'descDate'],
  [['status','staat','state','resolved','opgelost','result','resultaat','outcome','uitkomst'], 'descStatus'],
  [['reason','reden','cause','oorzaak','category','categorie','subject','onderwerp','topic','intent','intentie'], 'descReason'],
  [['agent','medewerker','operator','employee','werknemer','assignee','toegewezen','handler','behandelaar'], 'descAgent'],
  [['channel','kanaal','source','bron','medium','platform','origin','herkomst'], 'descChannel'],
  [['duration','duur','time_spent','bestede_tijd','handle_time','afhandeltijd','waiting','wachttijd','seconds','minutes','minuten'], 'descDuration'],
  [['customer','klant','client','visitor','bezoeker','contact','user_id','customer_id','klant_id'], 'descCustomer'],
  [['handover','overdracht','escalation','escalatie','transfer','overdragen'], 'descHandover'],
];

const TYPE_DESC_KEYS: Record<ColumnType, string> = {
  date: 'descDate', number: 'descNumber', category: 'descCategory',
  boolean: 'descBoolean', text: 'descText',
};

function getDescKey(col: ParsedColumn): string {
  const lower = col.originalName.toLowerCase();
  for (const [kws, key] of NAME_DESC_KEYS) {
    if (kws.some((kw) => lower.includes(kw))) return key;
  }
  return TYPE_DESC_KEYS[col.inferredType];
}

interface DistEntry { name: string; count: number; pct: number; }

function computeDistribution(col: ParsedColumn, data: Record<string, any>[]): {
  entries: DistEntry[];
  nullCount: number;
  hasMore: boolean;
} {
  const freq: Record<string, number> = {};
  let nullCount = 0;

  if (col.inferredType === 'number') {
    const nums = data
      .map((r) => Number(r[col.originalName]))
      .filter((n) => !isNaN(n));
    nullCount = data.length - nums.length;
    if (nums.length === 0) return { entries: [], nullCount, hasMore: false };

    const min = Math.min(...nums);
    const max = Math.max(...nums);
    const BINS = 10;
    const size = (max - min) / BINS || 1;
    const bins = new Array(BINS).fill(0);
    nums.forEach((n) => {
      const idx = Math.min(Math.floor((n - min) / size), BINS - 1);
      bins[idx]++;
    });
    const entries = bins.map((count, i) => {
      const lo = min + i * size;
      const hi = lo + size;
      const label = `${lo % 1 === 0 ? lo : lo.toFixed(1)}–${hi % 1 === 0 ? hi : hi.toFixed(1)}`;
      return { name: label, count, pct: Math.round((count / nums.length) * 100) };
    }).filter((e) => e.count > 0);
    return { entries, nullCount, hasMore: false };
  }

  data.forEach((r) => {
    const v = r[col.originalName];
    if (v == null || v === '') { nullCount++; return; }
    const s = String(v).trim();
    freq[s] = (freq[s] ?? 0) + 1;
  });

  const sorted = Object.entries(freq).sort((a, b) => b[1] - a[1]);
  const TOP = 12;
  const topEntries = sorted.slice(0, TOP);
  const otherCount = sorted.slice(TOP).reduce((s, [, c]) => s + c, 0);
  const total = data.length - nullCount;
  const entries: DistEntry[] = topEntries.map(([name, count]) => ({
    name, count, pct: total > 0 ? Math.round((count / total) * 100) : 0,
  }));
  return { entries, nullCount, hasMore: otherCount > 0 };
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-surface-200 rounded-xl shadow-lg p-3 text-xs">
      <p className="font-medium text-slate-700 mb-1 max-w-[160px] truncate">{label}</p>
      <p className="text-primary-600 font-semibold">{payload[0].value.toLocaleString()} ({payload[0].payload.pct}%)</p>
    </div>
  );
}

interface Props {
  col: ParsedColumn;
  table: ParsedTable;
  onClose: () => void;
}

export default function ColumnModal({ col, table, onClose }: Props) {
  const { t, lang } = useLanguage();
  const { color, Icon } = TYPE_META[col.inferredType];
  const descKey = getDescKey(col);

  const { entries, nullCount, hasMore } = useMemo(
    () => computeDistribution(col, table.data),
    [col, table.data]
  );

  const nonNull = table.data.length - nullCount;
  const nullPct = table.data.length > 0 ? Math.round((nullCount / table.data.length) * 100) : 0;
  const isVertical = col.inferredType === 'number';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />

      {/* Panel */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white/95 backdrop-blur-sm border-b border-surface-200 px-6 py-4 flex items-start gap-3 z-10 rounded-t-2xl">
          <div className={clsx('w-9 h-9 rounded-xl flex items-center justify-center ring-1 flex-shrink-0', color)}>
            <Icon className="w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="font-bold text-slate-900 text-base leading-tight truncate">{col.originalName}</h2>
            <p className="text-xs text-slate-400 mt-0.5">{table.name}</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 transition-colors flex-shrink-0 mt-0.5">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-5">
          {/* Type badges */}
          <div className="flex flex-wrap gap-2">
            <span className={clsx('inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ring-1', color)}>
              <Icon className="w-3 h-3" />
              {t(`type${col.inferredType.charAt(0).toUpperCase() + col.inferredType.slice(1)}` as any)}
            </span>
            {col.sqlType && (
              <span className="inline-flex items-center text-xs font-mono text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
                {col.sqlType}
              </span>
            )}
            {col.nullable && (
              <span className="inline-flex items-center text-xs text-slate-400 bg-surface-100 px-2.5 py-1 rounded-full">
                {t('nullableBadge')}
              </span>
            )}
          </div>

          {/* Description */}
          <div className="bg-surface-50 rounded-xl px-4 py-3 border border-surface-200">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">{t('colModalDescription')}</p>
            <p className="text-sm text-slate-700 leading-relaxed">{t(descKey as any)}</p>
          </div>

          {/* Quick stats */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: t('colModalTotalRows'), value: table.rowCount.toLocaleString() },
              { label: t('colModalUniqueValues'), value: col.uniqueCount.toLocaleString() },
              { label: t('colModalNullValues'), value: `${nullCount.toLocaleString()} (${nullPct}%)`, highlight: nullPct > 20 },
            ].map(({ label, value, highlight }) => (
              <div key={label} className="bg-surface-50 rounded-xl px-3 py-3 border border-surface-200 text-center">
                <p className="text-xs text-slate-400 mb-1">{label}</p>
                <p className={clsx('text-sm font-bold tabular-nums', highlight ? 'text-amber-600' : 'text-slate-800')}>{value}</p>
              </div>
            ))}
          </div>

          {/* Distribution chart */}
          {entries.length > 0 ? (
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">{t('colModalDistribution')}</p>
              {isVertical ? (
                <ResponsiveContainer width="100%" height={160}>
                  <BarChart data={entries} margin={{ top: 0, right: 4, left: 0, bottom: 0 }}>
                    <XAxis dataKey="name" tick={{ fontSize: 9, fill: '#94a3b8' }} tickLine={false} axisLine={false} interval={0} angle={-35} textAnchor="end" height={40} />
                    <YAxis tick={{ fontSize: 9, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="count" radius={[3, 3, 0, 0]}>
                      {entries.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} fillOpacity={0.85} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="space-y-1.5">
                  {entries.map((e, i) => (
                    <div key={e.name} className="flex items-center gap-2">
                      <span
                        className="text-xs text-slate-600 w-32 truncate flex-shrink-0 text-right font-medium"
                        title={e.name}
                      >
                        {e.name}
                      </span>
                      <div className="flex-1 h-5 bg-surface-100 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${e.pct}%`,
                            backgroundColor: COLORS[i % COLORS.length],
                            opacity: 0.85,
                          }}
                        />
                      </div>
                      <span className="text-xs tabular-nums text-slate-500 w-20 text-right flex-shrink-0">
                        {e.count.toLocaleString()} · {e.pct}%
                      </span>
                    </div>
                  ))}
                  {hasMore && (
                    <p className="text-xs text-slate-400 text-right pt-1">{t('colModalOther')}</p>
                  )}
                </div>
              )}
            </div>
          ) : (
            <p className="text-sm text-slate-400 text-center py-4">{t('colModalNoData')}</p>
          )}

          {/* Sample values */}
          {col.sampleValues.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">{t('sampleValues')}</p>
              <div className="flex flex-wrap gap-1.5">
                {col.sampleValues.map((v, i) => (
                  <span
                    key={i}
                    className="text-xs bg-surface-100 border border-surface-200 px-2.5 py-1 rounded-lg text-slate-600 font-mono"
                  >
                    {v}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
