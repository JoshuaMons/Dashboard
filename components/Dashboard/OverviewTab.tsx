'use client';

import Link from 'next/link';
import { Table2, Rows, Columns } from 'lucide-react';
import { DatabaseInfo, FullAnalyticsResult } from '@/types';
import { useLanguage } from '@/contexts/LanguageContext';
import MetricCards from './MetricCards';
import TimeSeriesChart from './TimeSeriesChart';
import CategoryChart from './CategoryChart';
import { BarChart2 } from 'lucide-react';
import { clsx } from 'clsx';

const ACCENT = ['bg-primary-50 border-primary-200', 'bg-blue-50 border-blue-200', 'bg-violet-50 border-violet-200', 'bg-emerald-50 border-emerald-200', 'bg-amber-50 border-amber-200'];
const ACCENT_TEXT = ['text-primary-700', 'text-blue-700', 'text-violet-700', 'text-emerald-700', 'text-amber-700'];

interface Props {
  database: DatabaseInfo;
  analytics: FullAnalyticsResult;
  onTableClick: (name: string) => void;
}

export default function OverviewTab({ database, analytics, onTableClick }: Props) {
  const { t } = useLanguage();
  const { overview, tableAnalytics } = analytics;

  const timeSeries = overview.charts.find((c) => c.type === 'area' || c.type === 'line');
  const catCharts = overview.charts.filter((c) => c.type !== 'area' && c.type !== 'line');

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <MetricCards metrics={overview.metrics} />

      {/* Main charts */}
      {timeSeries && <TimeSeriesChart config={timeSeries} />}

      {catCharts.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {catCharts.map((c) => <CategoryChart key={c.id} config={c} />)}
        </div>
      )}

      {overview.charts.length === 0 && (
        <div className="card p-12 flex flex-col items-center gap-3 text-slate-400">
          <BarChart2 className="w-10 h-10" />
          <p className="text-sm">{t('noCharts')}</p>
        </div>
      )}

      {/* Table summary grid */}
      <div>
        <h2 className="text-sm font-semibold text-slate-600 uppercase tracking-wide mb-3">{t('allTablesTitle')}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {database.tables.map((table, i) => {
            const ta = tableAnalytics.find((x) => x.tableName === table.name);
            return (
              <button
                key={table.name}
                onClick={() => onTableClick(table.name)}
                className={clsx(
                  'card p-4 text-left hover:shadow-card-hover transition-all duration-150 border',
                  ACCENT[i % ACCENT.length]
                )}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className={clsx('w-8 h-8 rounded-lg flex items-center justify-center', ACCENT[i % ACCENT.length])}>
                    <Table2 className={clsx('w-4 h-4', ACCENT_TEXT[i % ACCENT_TEXT.length])} />
                  </div>
                  {ta?.isChatbotData && (
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-primary-100 text-primary-700">
                      Chatbot
                    </span>
                  )}
                </div>
                <p className={clsx('font-semibold text-sm mb-2 truncate', ACCENT_TEXT[i % ACCENT_TEXT.length])}>
                  {table.name}
                </p>
                <div className="flex items-center gap-3 text-xs text-slate-500">
                  <span className="flex items-center gap-1">
                    <Rows className="w-3 h-3" />
                    {table.rowCount.toLocaleString()} {t('tableSummaryRows')}
                  </span>
                  <span className="flex items-center gap-1">
                    <Columns className="w-3 h-3" />
                    {table.columns.length} {t('tableSummaryColumns')}
                  </span>
                </div>
                {table.columns.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {table.columns.slice(0, 4).map((c) => (
                      <span key={c.originalName} className="text-xs bg-white/70 border border-white px-1.5 py-0.5 rounded text-slate-500 truncate max-w-[80px]">
                        {c.originalName}
                      </span>
                    ))}
                    {table.columns.length > 4 && (
                      <span className="text-xs text-slate-400">+{table.columns.length - 4}</span>
                    )}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
