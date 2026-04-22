'use client';

import { useState, useMemo } from 'react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine, Brush,
} from 'recharts';
import { ChartConfig } from '@/types';
import { useLanguage } from '@/contexts/LanguageContext';
import { TrendingUp, TrendingDown, Minus, ZoomIn, ZoomOut, Info } from 'lucide-react';
import { clsx } from 'clsx';

const COLORS = ['#6366f1', '#8b5cf6', '#60a5fa', '#34d399', '#f59e0b', '#f87171'];

// Derive a description from the chart id prefix
const ID_DESCS: Record<string, [string, string]> = {
  ts_:       ['Daily volume over time. Dashed line = period average. Toggle zoom to pan a date range.', 'Dagelijks volume over tijd. Stippellijn = periodegemiddelde. Schakel zoom in om een datumbereik te verkennen.'],
  weekly_:   ['Weekly aggregation showing volume patterns and long-term trends.', 'Wekelijkse aggregatie met volumepatronen en langetermijntrends.'],
  time_series: ['Daily volume over time. Dashed line = period average.', 'Dagelijks volume over tijd. Stippellijn = periodegemiddelde.'],
  hourly_:   ['Events by hour of day. Peaks show the busiest periods — useful for scheduling and staffing.', 'Events per uur van de dag. Pieken tonen drukste perioden — handig voor planning en bezetting.'],
  weekday_:  ['Event distribution across weekdays. Helps identify quiet and high-workload days.', 'Verdeling van events over weekdagen. Helpt rustige dagen en piekdagen te identificeren.'],
};

function getDesc(id: string, lang: 'en' | 'nl'): string | undefined {
  for (const [prefix, [en, nl]] of Object.entries(ID_DESCS)) {
    if (id === prefix || id.startsWith(prefix)) return lang === 'nl' ? nl : en;
  }
  return undefined;
}

function InfoTooltip({ text }: { text: string }) {
  return (
    <span className="relative group inline-flex flex-shrink-0">
      <Info className="w-3.5 h-3.5 text-slate-300 hover:text-slate-500 cursor-help transition-colors" />
      <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 bg-slate-800 text-white text-xs rounded-xl px-3 py-2.5 opacity-0 group-hover:opacity-100 pointer-events-none z-50 shadow-xl leading-relaxed transition-opacity text-left">
        {text}
        <span className="absolute top-full left-1/2 -translate-x-1/2 border-[5px] border-transparent border-t-slate-800" />
      </span>
    </span>
  );
}

function RichTooltip({
  active, payload, label, total, avg, lang,
}: {
  active?: boolean; payload?: any[]; label?: string; total: number; avg: number; lang: 'en' | 'nl';
}) {
  if (!active || !payload?.length) return null;
  const val = Number(payload[0].value) || 0;
  const pct = total > 0 ? ((val / total) * 100).toFixed(1) : '0';
  const diff = avg > 0 ? ((val - avg) / avg * 100) : null;
  const above = diff !== null && diff >= 0;

  const lbl = { count: lang === 'nl' ? 'Aantal' : 'Count', pctTotal: lang === 'nl' ? '% van totaal' : '% of total', vsAvg: lang === 'nl' ? 'vs gem' : 'vs avg' };

  return (
    <div className="bg-white border border-surface-200 rounded-xl shadow-lg p-3 text-xs min-w-[160px]">
      <p className="font-semibold text-slate-700 mb-2">{label}</p>
      <div className="space-y-1.5">
        <div className="flex justify-between gap-6">
          <span className="text-slate-400">{lbl.count}</span>
          <span className="font-bold text-slate-900 tabular-nums">{val.toLocaleString()}</span>
        </div>
        <div className="flex justify-between gap-6">
          <span className="text-slate-400">{lbl.pctTotal}</span>
          <span className="font-medium text-slate-600 tabular-nums">{pct}%</span>
        </div>
        {diff !== null && (
          <div className="flex justify-between gap-6 pt-1.5 border-t border-surface-100">
            <span className="text-slate-400">{lbl.vsAvg}</span>
            <span className={clsx('font-semibold tabular-nums', above ? 'text-emerald-600' : 'text-red-500')}>
              {above ? '+' : ''}{diff.toFixed(1)}%
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

export default function TimeSeriesChart({ config }: { config: ChartConfig }) {
  const { lang, t } = useLanguage();
  const [brushOn, setBrushOn] = useState(false);

  const title = lang === 'nl' ? config.titleNl : config.titleEn;
  const desc = getDesc(config.id, lang);
  const xKey = config.xKey ?? 'date';
  const yKey = config.yKey ?? 'count';
  const color = (config.colors ?? COLORS)[0];

  const { total, avg, trend } = useMemo(() => {
    const vals = config.data.map((d) => Number(d[yKey]) || 0);
    const total = vals.reduce((s, v) => s + v, 0);
    const avg = vals.length > 0 ? Math.round(total / vals.length) : 0;
    const q = Math.max(1, Math.floor(vals.length / 4));
    const recent = vals.slice(-q).reduce((s, v) => s + v, 0) / q;
    const early  = vals.slice(0, q).reduce((s, v) => s + v, 0) / q;
    const trend = early > 0 ? Math.round(((recent - early) / early) * 100) : 0;
    return { total, avg, trend };
  }, [config.data, yKey]);

  const trendStyle = trend > 5
    ? 'text-emerald-700 bg-emerald-50 ring-1 ring-emerald-200'
    : trend < -5
    ? 'text-red-600 bg-red-50 ring-1 ring-red-200'
    : 'text-slate-500 bg-slate-100';
  const TrendIcon = trend > 5 ? TrendingUp : trend < -5 ? TrendingDown : Minus;

  const chartHeight = brushOn ? 260 : 220;

  return (
    <div className="card p-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-1">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200 truncate">{title}</h3>
          {desc && <InfoTooltip text={desc} />}
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <span
            className={clsx('inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full', trendStyle)}
            title="Recent trend vs. earlier periods"
          >
            <TrendIcon className="w-3 h-3" />
            {trend > 0 ? '+' : ''}{trend}%
          </span>
          <button
            onClick={() => setBrushOn((v) => !v)}
            className={clsx(
              'p-1.5 rounded-lg transition-colors',
              brushOn
                ? 'bg-primary-100 text-primary-700 ring-1 ring-primary-300'
                : 'text-slate-400 hover:bg-surface-100'
            )}
            title={brushOn ? t('zoomDisable') : t('zoomEnable')}
          >
            {brushOn ? <ZoomOut className="w-3.5 h-3.5" /> : <ZoomIn className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Subtitle */}
      <p className="text-xs text-slate-400 dark:text-slate-500 mb-4 flex flex-wrap gap-x-2 gap-y-0.5">
        <span>{t('chartTotal')}: <span className="font-medium text-slate-600 dark:text-slate-300">{total.toLocaleString()}</span></span>
        <span className="text-slate-300 dark:text-slate-600">·</span>
        <span>{t('chartAvgPeriod')}: <span className="font-medium text-slate-600 dark:text-slate-300">{avg.toLocaleString()}</span></span>
        <span className="text-slate-300 dark:text-slate-600">·</span>
        <span>{config.data.length} {t('chartPeriods')}</span>
      </p>

      <ResponsiveContainer width="100%" height={chartHeight}>
        {config.type === 'area' ? (
          <AreaChart data={config.data} margin={{ top: 4, right: 12, left: 4, bottom: 0 }}>
            <defs>
              <linearGradient id={`grad-${config.id}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor={color} stopOpacity={0.18} />
                <stop offset="95%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey={xKey} tick={{ fontSize: 10, fill: '#94a3b8' }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
            <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} tickLine={false} axisLine={false} width={40} />
            <Tooltip content={(p) => <RichTooltip {...p} total={total} avg={avg} lang={lang} />} />
            <ReferenceLine
              y={avg}
              stroke="#cbd5e1"
              strokeDasharray="4 4"
              strokeWidth={1.5}
              label={{ value: `ø ${avg.toLocaleString()}`, position: 'insideTopRight', fontSize: 10, fill: '#94a3b8' }}
            />
            <Area
              type="monotone"
              dataKey={yKey}
              stroke={color}
              strokeWidth={2}
              fill={`url(#grad-${config.id})`}
              dot={false}
              activeDot={{ r: 5, fill: color, stroke: 'white', strokeWidth: 2 }}
            />
            {brushOn && (
              <Brush dataKey={xKey} height={24} stroke="#e2e8f0" travellerWidth={8} fill="#f8fafc" />
            )}
          </AreaChart>
        ) : (
          <BarChart data={config.data} margin={{ top: 4, right: 12, left: 4, bottom: config.data.length > 12 ? 24 : 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis
              dataKey={xKey}
              tick={{ fontSize: 10, fill: '#94a3b8' }}
              tickLine={false}
              axisLine={false}
              interval={config.data.length > 12 ? 'preserveStartEnd' : 0}
              angle={config.data.length > 12 ? -35 : 0}
              textAnchor={config.data.length > 12 ? 'end' : 'middle'}
              height={config.data.length > 12 ? 40 : 30}
            />
            <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} tickLine={false} axisLine={false} width={40} />
            <Tooltip content={(p) => <RichTooltip {...p} total={total} avg={avg} lang={lang} />} />
            <ReferenceLine
              y={avg}
              stroke="#cbd5e1"
              strokeDasharray="4 4"
              strokeWidth={1.5}
              label={{ value: `ø ${avg.toLocaleString()}`, position: 'insideTopRight', fontSize: 10, fill: '#94a3b8' }}
            />
            <Bar dataKey={yKey} fill={color} radius={[4, 4, 0, 0]} maxBarSize={48} />
            {brushOn && (
              <Brush dataKey={xKey} height={24} stroke="#e2e8f0" travellerWidth={8} fill="#f8fafc" />
            )}
          </BarChart>
        )}
      </ResponsiveContainer>

      {brushOn && (
        <p className="text-xs text-slate-400 text-center mt-2">
          {t('zoomHint')}
        </p>
      )}
    </div>
  );
}
