'use client';

import { useState, useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, Sector, Label,
} from 'recharts';
import { ChartConfig } from '@/types';
import { useLanguage } from '@/contexts/LanguageContext';
import { Hash, Percent, Info, X, BarChart2, List } from 'lucide-react';
import { clsx } from 'clsx';

const COLORS = ['#6366f1', '#8b5cf6', '#60a5fa', '#34d399', '#f59e0b', '#f87171', '#a78bfa', '#2dd4bf'];

const ID_DESCS: Record<string, [string, string]> = {
  reason_:   ['Top reasons that triggered a handover. Click a bar to highlight it.', 'Topredenen voor een handover. Klik een balk om deze te markeren.'],
  channel_:  ['Origin channels of incoming records. Hover over slices for details.', 'Herkomstkanalen van inkomende records. Hover over segmenten voor details.'],
  agent_:    ['Agent workload distribution. High values may indicate over-assignment.', 'Werkverdeling per medewerker. Hoge waarden kunnen op overbezetting wijzen.'],
  status_:   ['Current status breakdown of all records.', 'Huidige statusverdeling van alle records.'],
  dur_dist_: ['How long each record takes to resolve. Longer durations may need process review.', 'Hoe lang elk record duurt om af te handelen. Lange duren kunnen procesverbetering vereisen.'],
  missing_:  ['Columns with incomplete data (%). High percentages may reduce analysis quality.', 'Kolommen met ontbrekende gegevens (%). Hoge percentages kunnen de analysekwaliteit verminderen.'],
  num_:      ['Value distribution for this numeric column, bucketed into ranges.', 'Waardenverdeling voor deze numerieke kolom, ingedeeld in bereiken.'],
  cat_:      ['Distribution of values in this column. Click a bar to highlight it and dim the rest.', 'Verdeling van waarden in deze kolom. Klik een balk om deze te markeren.'],
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
      <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 bg-slate-800 text-white text-xs rounded-xl px-3 py-2.5 opacity-0 group-hover:opacity-100 pointer-events-none z-50 shadow-xl leading-relaxed transition-opacity">
        {text}
        <span className="absolute top-full left-1/2 -translate-x-1/2 border-[5px] border-transparent border-t-slate-800" />
      </span>
    </span>
  );
}

function RichBarTooltip({ active, payload, total, showPct, lang }: any) {
  if (!active || !payload?.length) return null;
  const entry = payload[0].payload;
  const raw = entry._rawValue ?? payload[0].value;
  const pct = total > 0 ? ((raw / total) * 100).toFixed(1) : '0';
  const lbl = {
    count: lang === 'nl' ? 'Aantal' : 'Count',
    share: lang === 'nl' ? 'Aandeel' : 'Share',
    rank:  lang === 'nl' ? 'Rang' : 'Rank',
  };
  return (
    <div className="bg-white border border-surface-200 rounded-xl shadow-lg p-3 text-xs min-w-[150px]">
      <p className="font-semibold text-slate-700 mb-2 max-w-[200px] break-words">{entry.name}</p>
      <div className="space-y-1.5">
        <div className="flex justify-between gap-5">
          <span className="text-slate-400">{lbl.count}</span>
          <span className="font-bold text-slate-900 tabular-nums">{raw.toLocaleString()}</span>
        </div>
        <div className="flex justify-between gap-5">
          <span className="text-slate-400">{lbl.share}</span>
          <span className="font-medium text-slate-700 tabular-nums">{pct}%</span>
        </div>
        <div className="flex justify-between gap-5 pt-1.5 border-t border-surface-100">
          <span className="text-slate-400">{lbl.rank}</span>
          <span className="font-semibold text-primary-600">#{entry.rank}</span>
        </div>
      </div>
    </div>
  );
}

function ActivePieShape(props: any) {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill, percent, value } = props;
  return (
    <g>
      <Sector cx={cx} cy={cy} innerRadius={innerRadius} outerRadius={outerRadius + 8} startAngle={startAngle} endAngle={endAngle} fill={fill} />
      <Sector cx={cx} cy={cy} innerRadius={outerRadius + 12} outerRadius={outerRadius + 16} startAngle={startAngle} endAngle={endAngle} fill={fill} fillOpacity={0.35} />
      <text x={cx} y={cy - 9} textAnchor="middle" fill="#0f172a" fontSize={15} fontWeight={700}>
        {value.toLocaleString()}
      </text>
      <text x={cx} y={cy + 10} textAnchor="middle" fill="#64748b" fontSize={11}>
        {(percent * 100).toFixed(1)}%
      </text>
    </g>
  );
}

// ── Ranked list view ─────────────────────────────────────────────────────────

function ListView({ data, total, nameKey, valueKey, lang, t }: {
  data: Record<string, any>[];
  total: number;
  nameKey: string;
  valueKey: string;
  lang: 'en' | 'nl';
  t: (k: any) => string;
}) {
  const TOP = 10;
  const topItems = data.slice(0, TOP);
  const otherCount = data.slice(TOP).reduce((s, d) => s + (Number(d[valueKey]) || 0), 0);
  const otherCats  = data.length - TOP;
  const maxVal = Number(topItems[0]?.[valueKey]) || 1;

  return (
    <div className="space-y-1 mt-2">
      {topItems.map((d, i) => {
        const name = String(d[nameKey]);
        const val  = Number(d[valueKey]) || 0;
        const pct  = total > 0 ? ((val / total) * 100) : 0;
        const barW = (val / maxVal) * 100;
        const color = COLORS[i % COLORS.length];

        return (
          <div key={name} className="flex items-center gap-2 min-h-[28px]">
            {/* Rank — fixed 20px */}
            <span className="text-xs tabular-nums text-slate-300 dark:text-slate-600 w-5 text-right flex-shrink-0">
              {i + 1}
            </span>
            {/* Color dot — fixed 8px */}
            <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
            {/* Name — fixed 160px, truncate */}
            <span
              className="text-xs text-slate-700 dark:text-slate-200 flex-shrink-0 truncate w-40"
              title={name}
            >
              {name}
            </span>
            {/* Bar — fills remaining space */}
            <div className="flex-1 h-4 bg-surface-100 dark:bg-slate-700 rounded-full overflow-hidden min-w-[40px]">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${barW}%`, backgroundColor: color, opacity: 0.75 }}
              />
            </div>
            {/* Count — fixed 52px right-aligned */}
            <span className="text-xs font-semibold tabular-nums text-slate-700 dark:text-slate-200 w-13 text-right flex-shrink-0" style={{ minWidth: '3.25rem' }}>
              {val >= 1000 ? `${(val / 1000).toFixed(1)}k` : val.toLocaleString()}
            </span>
            {/* Pct — fixed 44px right-aligned */}
            <span className="text-xs tabular-nums text-slate-400 dark:text-slate-500 flex-shrink-0 text-right" style={{ minWidth: '2.75rem' }}>
              {pct.toFixed(1)}%
            </span>
          </div>
        );
      })}

      {otherCount > 0 && (
        <div className="flex items-center gap-2 pt-2 mt-1 border-t border-surface-100 dark:border-slate-700">
          <span className="w-5 flex-shrink-0" />
          <span className="w-2 h-2 rounded-full bg-slate-300 dark:bg-slate-600 flex-shrink-0" />
          <span className="text-xs text-slate-400 dark:text-slate-500 w-40 flex-shrink-0 truncate">
            {t('chartOther')} ({otherCats} {t('chartOtherCategories')})
          </span>
          <div className="flex-1" />
          <span className="text-xs tabular-nums text-slate-400 dark:text-slate-500 text-right flex-shrink-0" style={{ minWidth: '3.25rem' }}>
            {otherCount >= 1000 ? `${(otherCount / 1000).toFixed(1)}k` : otherCount.toLocaleString()}
          </span>
          <span className="text-xs tabular-nums text-slate-400 dark:text-slate-500 text-right flex-shrink-0" style={{ minWidth: '2.75rem' }}>
            {total > 0 ? ((otherCount / total) * 100).toFixed(1) : 0}%
          </span>
        </div>
      )}
    </div>
  );
}

// ── View toggle button ────────────────────────────────────────────────────────

function ViewToggle({ view, setView, t }: {
  view: 'chart' | 'list';
  setView: (v: 'chart' | 'list') => void;
  t: (k: any) => string;
}) {
  return (
    <div className="flex rounded-lg overflow-hidden border border-surface-200 dark:border-slate-600">
      <button
        onClick={() => setView('chart')}
        title={t('chartView')}
        className={clsx(
          'px-2 py-1.5 text-xs font-medium transition-colors',
          view === 'chart' ? 'bg-primary-600 text-white' : 'text-slate-500 dark:text-slate-400 hover:bg-surface-50 dark:hover:bg-slate-700'
        )}
      >
        <BarChart2 className="w-3 h-3" />
      </button>
      <button
        onClick={() => setView('list')}
        title={t('listView')}
        className={clsx(
          'px-2 py-1.5 text-xs font-medium transition-colors',
          view === 'list' ? 'bg-primary-600 text-white' : 'text-slate-500 dark:text-slate-400 hover:bg-surface-50 dark:hover:bg-slate-700'
        )}
      >
        <List className="w-3 h-3" />
      </button>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function CategoryChart({ config }: { config: ChartConfig }) {
  const { lang, t } = useLanguage();
  const [showPct, setShowPct]       = useState(false);
  const [selected, setSelected]     = useState<string | null>(null);
  const [activePieIdx, setActivePieIdx] = useState<number | undefined>(undefined);
  const [view, setView]             = useState<'chart' | 'list'>('chart');

  const title    = lang === 'nl' ? config.titleNl : config.titleEn;
  const desc     = getDesc(config.id, lang);
  const nameKey  = config.nameKey  ?? 'name';
  const valueKey = config.valueKey ?? 'value';

  const total = useMemo(
    () => config.data.reduce((s, d) => s + (Number(d[valueKey]) || 0), 0),
    [config.data, valueKey]
  );

  const enriched = useMemo(
    () => config.data.map((d, i) => ({
      ...d,
      name:      String(d[nameKey]),
      value:     showPct && total > 0
                   ? Math.round((Number(d[valueKey]) / total) * 1000) / 10
                   : Number(d[valueKey]),
      _rawValue: Number(d[valueKey]),
      rank:      i + 1,
    })),
    [config.data, nameKey, valueKey, showPct, total]
  );

  const topName = String(config.data[0]?.[nameKey] ?? '—');

  // ── PIE ────────────────────────────────────────────────────────────────────
  if (config.type === 'pie') {
    return (
      <div className="card p-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-1">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200 truncate">{title}</h3>
            {desc && <InfoTooltip text={desc} />}
          </div>
          <ViewToggle view={view} setView={setView} t={t} />
        </div>
        <p className="text-xs text-slate-400 dark:text-slate-500 mb-3">
          {t('chartTotal')}: <span className="font-medium text-slate-600 dark:text-slate-300">{total.toLocaleString()}</span>
          &ensp;·&ensp;{config.data.length} {t('chartCategories')}
          {view === 'chart' && <>&ensp;·&ensp;<span className="text-slate-400">{t('hoverToInspect')}</span></>}
        </p>

        {view === 'list' ? (
          <ListView data={config.data} total={total} nameKey={nameKey} valueKey={valueKey} lang={lang} t={t} />
        ) : (
          <ResponsiveContainer width="100%" height={290}>
            <PieChart>
              <Pie
                data={enriched}
                dataKey="_rawValue"
                nameKey="name"
                cx="50%"
                cy="46%"
                innerRadius={58}
                outerRadius={95}
                paddingAngle={2}
                activeIndex={activePieIdx}
                activeShape={ActivePieShape as any}
                onMouseEnter={(_, idx) => setActivePieIdx(idx)}
                onMouseLeave={() => setActivePieIdx(undefined)}
              >
                <Label
                  content={({ viewBox }: any) => {
                    if (activePieIdx !== undefined) return <g />;
                    const { cx, cy } = viewBox;
                    return (
                      <g>
                        <text x={cx} y={cy - 9} textAnchor="middle" fill="#0f172a" fontSize={18} fontWeight={700}>
                          {total.toLocaleString()}
                        </text>
                        <text x={cx} y={cy + 10} textAnchor="middle" fill="#94a3b8" fontSize={10}>
                          {t('chartTotalLabel')}
                        </text>
                      </g>
                    );
                  }}
                />
                {enriched.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                content={({ active, payload }: any) => {
                  if (!active || !payload?.length) return null;
                  const d = payload[0].payload;
                  const pct = total > 0 ? ((d._rawValue / total) * 100).toFixed(1) : '0';
                  const lbl = { count: lang === 'nl' ? 'Aantal' : 'Count', share: lang === 'nl' ? 'Aandeel' : 'Share', rank: lang === 'nl' ? 'Rang' : 'Rank' };
                  return (
                    <div className="bg-white border border-surface-200 rounded-xl shadow-lg p-3 text-xs min-w-[150px]">
                      <p className="font-semibold text-slate-700 mb-2 max-w-[200px] break-words">{d.name}</p>
                      <div className="space-y-1.5">
                        <div className="flex justify-between gap-5"><span className="text-slate-400">{lbl.count}</span><span className="font-bold text-slate-900 tabular-nums">{d._rawValue.toLocaleString()}</span></div>
                        <div className="flex justify-between gap-5"><span className="text-slate-400">{lbl.share}</span><span className="font-semibold text-primary-600 tabular-nums">{pct}%</span></div>
                        <div className="flex justify-between gap-5 pt-1.5 border-t border-surface-100"><span className="text-slate-400">{lbl.rank}</span><span className="font-medium text-slate-700">#{d.rank}</span></div>
                      </div>
                    </div>
                  );
                }}
              />
              <Legend
                formatter={(value: any, entry: any) => (
                  <span className="text-xs text-slate-600 dark:text-slate-300 break-words" style={{ maxWidth: 120, display: 'inline-block', verticalAlign: 'middle' }}>
                    {value}
                    <span className="text-slate-400 ml-1 tabular-nums">
                      ({entry.payload?._rawValue?.toLocaleString?.()})
                    </span>
                  </span>
                )}
                iconType="circle"
                iconSize={8}
              />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>
    );
  }

  // ── HORIZONTAL BAR ─────────────────────────────────────────────────────────
  const barH = Math.max(180, enriched.length * 38 + 16);

  return (
    <div className="card p-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 mb-1">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200 truncate">{title}</h3>
          {desc && <InfoTooltip text={desc} />}
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {selected && (
            <button
              onClick={() => setSelected(null)}
              className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-red-500 transition-colors"
            >
              <X className="w-3 h-3" /> {t('clearSelection')}
            </button>
          )}
          {view === 'chart' && (
            <div className="flex rounded-lg overflow-hidden border border-surface-200 dark:border-slate-600">
              <button
                onClick={() => setShowPct(false)}
                title={lang === 'nl' ? 'Aantallen tonen' : 'Show counts'}
                className={clsx('px-2 py-1.5 text-xs font-medium transition-colors', !showPct ? 'bg-primary-600 text-white' : 'text-slate-500 dark:text-slate-400 hover:bg-surface-50 dark:hover:bg-slate-700')}
              >
                <Hash className="w-3 h-3" />
              </button>
              <button
                onClick={() => setShowPct(true)}
                title={lang === 'nl' ? 'Percentages tonen' : 'Show percentages'}
                className={clsx('px-2 py-1.5 text-xs font-medium transition-colors', showPct ? 'bg-primary-600 text-white' : 'text-slate-500 dark:text-slate-400 hover:bg-surface-50 dark:hover:bg-slate-700')}
              >
                <Percent className="w-3 h-3" />
              </button>
            </div>
          )}
          <ViewToggle view={view} setView={setView} t={t} />
        </div>
      </div>

      {/* Subtitle */}
      <p className="text-xs text-slate-400 dark:text-slate-500 mb-4">
        {selected
          ? <span>{t('chartSelected')}: <span className="font-medium text-slate-600 dark:text-slate-300">"{selected}"</span> — {t('clickToClear')}</span>
          : <span>{t('chartNo1')}: <span className="font-medium text-slate-600 dark:text-slate-300">{topName}</span>&ensp;·&ensp;{t('chartTotal')}: <span className="font-medium text-slate-600 dark:text-slate-300">{total.toLocaleString()}</span></span>
        }
      </p>

      {view === 'list' ? (
        <ListView data={config.data} total={total} nameKey={nameKey} valueKey={valueKey} lang={lang} t={t} />
      ) : (
        <ResponsiveContainer width="100%" height={barH}>
          <BarChart data={enriched} layout="vertical" margin={{ left: 8, right: 60 }}>
            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
            <XAxis
              type="number"
              tick={{ fontSize: 11, fill: '#94a3b8' }}
              tickLine={false}
              axisLine={false}
              tickFormatter={showPct ? (v) => `${v}%` : undefined}
            />
            <YAxis
              type="category"
              dataKey="name"
              tick={{ fontSize: 11, fill: '#64748b' }}
              tickLine={false}
              axisLine={false}
              width={120}
              tickFormatter={(v) => v.length > 18 ? v.slice(0, 17) + '…' : v}
            />
            <Tooltip content={<RichBarTooltip total={total} showPct={showPct} lang={lang} />} />
            <Bar
              dataKey="value"
              radius={[0, 4, 4, 0]}
              cursor="pointer"
              onClick={(d: any) => setSelected(selected === d.name ? null : d.name)}
              label={{
                position: 'right',
                fontSize: 10,
                fill: '#94a3b8',
                formatter: (v: any) =>
                  showPct
                    ? `${v}%`
                    : Number(v) >= 1000
                    ? `${(Number(v) / 1000).toFixed(1)}k`
                    : String(v),
              } as any}
            >
              {enriched.map((entry, i) => (
                <Cell
                  key={i}
                  fill={COLORS[i % COLORS.length]}
                  fillOpacity={selected === null || selected === entry.name ? 1 : 0.18}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
