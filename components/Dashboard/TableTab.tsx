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
  const [filters, setFilters] = useState<FilterRule[]>([]);

  const filteredData = useMemo(
    () => applyFilters(table.data, filters),
    [table.data, filters]
  );

  const { metrics, charts } = analytics;
  const timeSeries = charts.find((c) => c.type === 'area' || c.type === 'line');
  const catCharts = charts.filter((c) => c.type !== 'area' && c.type !== 'line');

  return (
    <div className="space-y-5">
      {/* Filter builder */}
      <FilterPanel columns={table.columns} filters={filters} onChange={setFilters} />

      {/* KPI cards */}
      <MetricCards metrics={metrics} />

      {/* Time series full width */}
      {timeSeries && <TimeSeriesChart config={timeSeries} />}

      {/* Category charts */}
      {catCharts.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {catCharts.map((c) => <CategoryChart key={c.id} config={c} />)}
        </div>
      )}

      {charts.length === 0 && (
        <div className="card p-10 flex flex-col items-center gap-3 text-slate-400">
          <BarChart2 className="w-8 h-8" />
          <p className="text-sm">{t('noCharts')}</p>
        </div>
      )}

      {/* Data table with filtered rows */}
      <DataTable table={table} data={filteredData} />
    </div>
  );
}
