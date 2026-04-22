'use client';

import { useState, useEffect } from 'react';
import { Plus, X, Filter, ChevronDown, ChevronUp, Play, AlertCircle } from 'lucide-react';
import { FilterRule, FilterOperator, ParsedColumn } from '@/types';
import { useLanguage } from '@/contexts/LanguageContext';
import { operatorsForType, defaultOperator, newFilter } from '@/lib/filters';
import { clsx } from 'clsx';

interface Props {
  columns: ParsedColumn[];
  appliedFilters: FilterRule[];        // what's actually filtering the table
  onApply: (filters: FilterRule[]) => void;
}

const OP_KEY_MAP: Record<FilterOperator, string> = {
  equals: 'opEquals', not_equals: 'opNotEquals',
  contains: 'opContains', not_contains: 'opNotContains',
  starts_with: 'opStartsWith', ends_with: 'opEndsWith',
  greater_than: 'opGreaterThan', less_than: 'opLessThan',
  between: 'opBetween',
  is_empty: 'opIsEmpty', is_not_empty: 'opIsNotEmpty',
};

const inputCls = 'h-8 px-2.5 text-sm border border-surface-200 rounded-lg bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent';
const selCls   = `${inputCls} pr-6 cursor-pointer`;

function ValueInput({ filter, col, onChange }: {
  filter: FilterRule;
  col: ParsedColumn | undefined;
  onChange: (p: Partial<FilterRule>) => void;
}) {
  const { t } = useLanguage();
  const noVal: FilterOperator[] = ['is_empty', 'is_not_empty'];
  if (noVal.includes(filter.operator)) return null;

  const type = col?.inferredType ?? 'text';
  const inputType = type === 'number' ? 'number' : type === 'date' ? 'date' : 'text';

  if (filter.operator === 'between') {
    return (
      <div className="flex items-center gap-1.5 flex-wrap">
        <input type={inputType} value={filter.value} onChange={(e) => onChange({ value: e.target.value })} placeholder={t('enterValue')} className={clsx(inputCls, 'w-28')} />
        <span className="text-xs text-slate-400">{t('value2Label')}</span>
        <input type={inputType} value={filter.value2 ?? ''} onChange={(e) => onChange({ value2: e.target.value })} placeholder={t('enterValue')} className={clsx(inputCls, 'w-28')} />
      </div>
    );
  }

  if (type === 'category' && col && col.sampleValues.length > 0) {
    return (
      <select value={filter.value} onChange={(e) => onChange({ value: e.target.value })} className={clsx(selCls, 'min-w-[120px]')}>
        <option value="">—</option>
        {col.sampleValues.map((v) => <option key={v} value={v}>{v}</option>)}
      </select>
    );
  }

  if (type === 'boolean') {
    return (
      <select value={filter.value} onChange={(e) => onChange({ value: e.target.value })} className={clsx(selCls, 'w-28')}>
        <option value="">—</option>
        {['true', 'false', 'ja', 'nee', '1', '0', 'yes', 'no'].map((v) => <option key={v} value={v}>{v}</option>)}
      </select>
    );
  }

  return (
    <input type={inputType} value={filter.value} onChange={(e) => onChange({ value: e.target.value })} placeholder={t('enterValue')} className={clsx(inputCls, 'min-w-[140px]')} />
  );
}

export default function FilterPanel({ columns, appliedFilters, onApply }: Props) {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  // Local "pending" state — only committed to parent on Apply
  const [local, setLocal] = useState<FilterRule[]>(appliedFilters);

  // If parent resets applied filters externally, sync local state
  useEffect(() => {
    setLocal(appliedFilters);
  }, [appliedFilters]);

  const isDirty = JSON.stringify(local) !== JSON.stringify(appliedFilters);

  function add() { setLocal((f) => [...f, newFilter(columns)]); setOpen(true); }
  function remove(id: string) { setLocal((f) => f.filter((x) => x.id !== id)); }
  function clearLocal() { setLocal([]); }

  function patch(id: string, update: Partial<FilterRule>) {
    setLocal((prev) => prev.map((f) => {
      if (f.id !== id) return f;
      const next = { ...f, ...update };
      if (update.column && update.column !== f.column) {
        const col = columns.find((c) => c.originalName === update.column);
        next.operator = defaultOperator(col?.inferredType ?? 'text');
        next.value = ''; next.value2 = undefined;
      }
      const noVal: FilterOperator[] = ['is_empty', 'is_not_empty'];
      if (update.operator && noVal.includes(update.operator as FilterOperator)) {
        next.value = ''; next.value2 = undefined;
      }
      return next;
    }));
  }

  function handleApply() {
    onApply(local);
    // keep open so user sees what's applied
  }

  const appliedCount = appliedFilters.length;

  return (
    <div className={clsx('card overflow-hidden transition-all', isDirty && 'ring-2 ring-amber-400/60')}>
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3">
        <button onClick={() => setOpen((v) => !v)} className="flex-1 flex items-center gap-2 text-left">
          <Filter className="w-4 h-4 text-slate-500 flex-shrink-0" />
          <span className="font-medium text-slate-700 text-sm">{t('filterTitle')}</span>
          {appliedCount > 0 && (
            <span className="bg-primary-100 text-primary-700 text-xs font-bold px-2 py-0.5 rounded-full">
              {appliedCount} {t('filtersApplied')}
            </span>
          )}
          {isDirty && (
            <span className="flex items-center gap-1 text-xs text-amber-600 font-medium">
              <AlertCircle className="w-3.5 h-3.5" />
              {t('pendingChanges')}
            </span>
          )}
        </button>

        <div className="flex items-center gap-2 flex-shrink-0">
          {local.length > 0 && (
            <button onClick={(e) => { e.stopPropagation(); clearLocal(); }} className="text-xs text-slate-400 hover:text-red-500 transition-colors">
              {t('clearAllFilters')}
            </button>
          )}
          <button onClick={(e) => { e.stopPropagation(); add(); }} className="inline-flex items-center gap-1 text-xs font-medium text-primary-600 hover:text-primary-800 transition-colors">
            <Plus className="w-3.5 h-3.5" />
            {t('addFilter')}
          </button>
          <button onClick={() => setOpen((v) => !v)} className="text-slate-400">
            {open ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Filter rows */}
      {open && (
        <div className="border-t border-surface-200 bg-surface-50/40 px-4 py-3 space-y-2">
          {local.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-2">{t('addFilter')} →</p>
          ) : (
            local.map((filter, idx) => {
              const col = columns.find((c) => c.originalName === filter.column);
              const ops = operatorsForType(col?.inferredType ?? 'text');
              return (
                <div key={filter.id} className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-mono font-bold text-primary-500 w-16 text-right select-none flex-shrink-0">
                    {idx === 0 ? t('whereLabel') : t('andLabel')}
                  </span>
                  <select value={filter.column} onChange={(e) => patch(filter.id, { column: e.target.value })} className={clsx(selCls, 'min-w-[130px]')}>
                    {columns.map((c) => <option key={c.originalName} value={c.originalName}>{c.originalName}</option>)}
                  </select>
                  <select value={filter.operator} onChange={(e) => patch(filter.id, { operator: e.target.value as FilterOperator })} className={clsx(selCls, 'min-w-[140px]')}>
                    {ops.map((op) => <option key={op} value={op}>{t(OP_KEY_MAP[op] as any)}</option>)}
                  </select>
                  <ValueInput filter={filter} col={col} onChange={(p) => patch(filter.id, p)} />
                  <button onClick={() => remove(filter.id)} className="text-slate-300 hover:text-red-400 transition-colors ml-auto">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              );
            })
          )}

          {/* Apply button — always visible when panel is open */}
          <div className="pt-2 flex items-center justify-between border-t border-surface-200 mt-3">
            <span className="text-xs text-slate-400">
              {isDirty ? t('pendingChanges') : appliedCount > 0 ? `${appliedCount} ${t('filtersApplied')}` : ''}
            </span>
            <button
              onClick={handleApply}
              className={clsx(
                'inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-all',
                isDirty
                  ? 'bg-primary-600 text-white hover:bg-primary-700 shadow-sm shadow-primary-200'
                  : 'bg-surface-100 text-slate-500 hover:bg-surface-200'
              )}
            >
              <Play className="w-3.5 h-3.5" />
              {t('applyFilters')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
