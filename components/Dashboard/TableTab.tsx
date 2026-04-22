'use client';

import { useState, useMemo } from 'react';
import { ParsedTable, TableAnalytics, FilterRule } from '@/types';
import { useLanguage } from '@/contexts/LanguageContext';
import { applyFilters } from '@/lib/filters';
import MetricCards from './MetricCards';
import TimeSeriesChart from './TimeSeriesChart';
import CategoryChart from './CategoryChart';
import DataTable from './DataTable';
import FilterPanel from './FilterPanel';
import { BarChart2 } from 'lucide-react';

interface Props {
  table: ParsedTable;
  analytics: TableAnalytics;
}

export default function TableTab({ table, analytics }: Props) {
  const { t } = useLanguage();
  // pending = what's in the filter panel editor
  // applied = what's actually filtering the table (only updates on Apply click)
  const [appliedFilters, setAppliedFilters] = useState<FilterRule[]>([]);

  const filteredData = useMemo(
    () => applyFilters(table.data, appliedFilters),
    [table.data, appliedFilters]
  );

  const { metrics, charts } = analytics;
  const timeSeries = charts.find((c) => c.type === 'area' || c.type === 'line');
  const otherCharts = charts.filter((c) => c.type !== 'area' && c.type !== 'line');

  return (
    <div className="space-y-5">
      {/* Filter builder — passes appliedFilters so panel can show what's active */}
      <FilterPanel
        columns={table.columns}
        appliedFilters={appliedFilters}
        onApply={setAppliedFilters}
      />

      {/* KPI cards */}
      <MetricCards metrics={metrics} />

      {/* Time series full width */}
      {timeSeries && <TimeSeriesChart config={timeSeries} />}

      {/* All other charts in a responsive grid */}
      {otherCharts.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {otherCharts.map((c) => <CategoryChart key={c.id} config={c} />)}
        </div>
      )}

      {charts.length === 0 && (
        <div className="card p-10 flex flex-col items-center gap-3 text-slate-400">
          <BarChart2 className="w-8 h-8" />
          <p className="text-sm">{t('noCharts')}</p>
        </div>
      )}

      {/* Data table — shows filtered rows, total row count always visible */}
      <DataTable table={table} data={filteredData} />
    </div>
  );
}
