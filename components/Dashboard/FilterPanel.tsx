'use client';

import { useState } from 'react';
import { Plus, X, Filter, ChevronDown, ChevronUp } from 'lucide-react';
import { FilterRule, FilterOperator, ParsedColumn, ColumnType } from '@/types';
import { useLanguage } from '@/contexts/LanguageContext';
import { operatorsForType, defaultOperator, newFilter } from '@/lib/filters';
import { clsx } from 'clsx';

interface Props {
  columns: ParsedColumn[];
  filters: FilterRule[];
  onChange: (filters: FilterRule[]) => void;
}

const OP_KEY_MAP: Record<FilterOperator, string> = {
  equals: 'opEquals', not_equals: 'opNotEquals',
  contains: 'opContains', not_contains: 'opNotContains',
  starts_with: 'opStartsWith', ends_with: 'opEndsWith',
  greater_than: 'opGreaterThan', less_than: 'opLessThan',
  between: 'opBetween',
  is_empty: 'opIsEmpty', is_not_empty: 'opIsNotEmpty',
};

const inputClass = 'h-8 px-2.5 text-sm border border-surface-200 rounded-lg bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent';
const selectClass = `${inputClass} pr-6 cursor-pointer`;

function ValueInput({ filter, col, onChange }: {
  filter: FilterRule;
  col: ParsedColumn | undefined;
  onChange: (patch: Partial<FilterRule>) => void;
}) {
  const { t } = useLanguage();
  const noValueOps: FilterOperator[] = ['is_empty', 'is_not_empty'];
  if (noValueOps.includes(filter.operator)) return null;

  const type = col?.inferredType ?? 'text';
  const inputType = type === 'number' ? 'number' : type === 'date' ? 'date' : 'text';

  if (filter.operator === 'between') {
    return (
      <div className="flex items-center gap-1.5">
        <input type={inputType} value={filter.value} onChange={(e) => onChange({ value: e.target.value })}
          placeholder={t('enterValue')} className={clsx(inputClass, 'w-28')} />
        <span className="text-xs text-slate-400">{t('value2Label')}</span>
        <input type={inputType} value={filter.value2 ?? ''} onChange={(e) => onChange({ value2: e.target.value })}
          placeholder={t('enterValue')} className={clsx(inputClass, 'w-28')} />
      </div>
    );
  }

  if (type === 'category' && col && col.sampleValues.length > 0) {
    return (
      <select value={filter.value} onChange={(e) => onChange({ value: e.target.value })} className={clsx(selectClass, 'min-w-[120px]')}>
        <option value="">{t('enterValue')}</option>
        {col.sampleValues.map((v) => <option key={v} value={v}>{v}</option>)}
      </select>
    );
  }

  if (type === 'boolean') {
    return (
      <select value={filter.value} onChange={(e) => onChange({ value: e.target.value })} className={clsx(selectClass, 'w-28')}>
        <option value="">—</option>
        {['true', 'false', 'ja', 'nee', '1', '0', 'yes', 'no'].map((v) => <option key={v} value={v}>{v}</option>)}
      </select>
    );
  }

  return (
    <input type={inputType} value={filter.value} onChange={(e) => onChange({ value: e.target.value })}
      placeholder={t('enterValue')} className={clsx(inputClass, 'min-w-[140px]')} />
  );
}

export default function FilterPanel({ columns, filters, onChange }: Props) {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);

  function add() {
    onChange([...filters, newFilter(columns)]);
    setOpen(true);
  }

  function remove(id: string) { onChange(filters.filter((f) => f.id !== id)); }
  function clear() { onChange([]); }

  function patch(id: string, update: Partial<FilterRule>) {
    onChange(filters.map((f) => {
      if (f.id !== id) return f;
      const next = { ...f, ...update };
      // When column changes, reset operator to a valid one for new column type
      if (update.column && update.column !== f.column) {
        const col = columns.find((c) => c.originalName === update.column);
        next.operator = defaultOperator(col?.inferredType ?? 'text');
        next.value = '';
        next.value2 = undefined;
      }
      // When operator changes to non-value op, clear value
      if (update.operator && (['is_empty', 'is_not_empty'] as FilterOperator[]).includes(update.operator as FilterOperator)) {
        next.value = '';
        next.value2 = undefined;
      }
      return next;
    }));
  }

  const hasFilters = filters.length > 0;

  return (
    <div className="card overflow-hidden">
      {/* Header bar */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-surface-50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-500" />
          <span className="font-medium text-slate-700 text-sm">{t('filterTitle')}</span>
          {hasFilters && (
            <span className="bg-primary-100 text-primary-700 text-xs font-bold px-2 py-0.5 rounded-full">
              {filters.length}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {hasFilters && (
            <span
              onClick={(e) => { e.stopPropagation(); clear(); }}
              className="text-xs text-slate-400 hover:text-red-500 transition-colors cursor-pointer select-none"
            >
              {t('clearAllFilters')}
            </span>
          )}
          <span
            onClick={(e) => { e.stopPropagation(); add(); }}
            className="inline-flex items-center gap-1 text-xs font-medium text-primary-600 hover:text-primary-800 transition-colors cursor-pointer select-none"
          >
            <Plus className="w-3.5 h-3.5" />
            {t('addFilter')}
          </span>
          {open ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
        </div>
      </button>

      {/* Filter rows */}
      {open && (
        <div className="border-t border-surface-200 px-4 py-3 space-y-2 bg-surface-50/40">
          {!hasFilters ? (
            <p className="text-sm text-slate-400 py-2 text-center">
              {t('addFilter')} →
            </p>
          ) : (
            filters.map((filter, idx) => {
              const col = columns.find((c) => c.originalName === filter.column);
              const ops = operatorsForType(col?.inferredType ?? 'text');
              return (
                <div key={filter.id} className="flex items-center gap-2 flex-wrap">
                  {/* WHERE / AND label */}
                  <span className="text-xs font-mono font-semibold text-primary-500 w-14 text-right select-none">
                    {idx === 0 ? t('whereLabel') : t('andLabel')}
                  </span>

                  {/* Column selector */}
                  <select
                    value={filter.column}
                    onChange={(e) => patch(filter.id, { column: e.target.value })}
                    className={clsx(selectClass, 'min-w-[130px]')}
                  >
                    {columns.map((c) => (
                      <option key={c.originalName} value={c.originalName}>{c.originalName}</option>
                    ))}
                  </select>

                  {/* Operator selector */}
                  <select
                    value={filter.operator}
                    onChange={(e) => patch(filter.id, { operator: e.target.value as FilterOperator })}
                    className={clsx(selectClass, 'min-w-[140px]')}
                  >
                    {ops.map((op) => (
                      <option key={op} value={op}>{t(OP_KEY_MAP[op] as any)}</option>
                    ))}
                  </select>

                  {/* Value input */}
                  <ValueInput filter={filter} col={col} onChange={(p) => patch(filter.id, p)} />

                  {/* Remove */}
                  <button onClick={() => remove(filter.id)} className="text-slate-300 hover:text-red-400 transition-colors ml-auto">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
