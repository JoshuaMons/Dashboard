'use client';

import { useState, useMemo } from 'react';
import {
  ChevronLeft, ChevronRight, ChevronsUpDown, ChevronUp, ChevronDown,
  Search, Download, Info,
} from 'lucide-react';
import { ParsedTable, ParsedColumn } from '@/types';
import { useLanguage } from '@/contexts/LanguageContext';
import ColumnModal from '@/components/TableViewer/ColumnModal';
import RecordModal from './RecordModal';
import { clsx } from 'clsx';

const PAGE_SIZE = 15;

type SortDir = 'asc' | 'desc';

const TYPE_DOTS: Record<string, string> = {
  date:     'bg-blue-400',
  number:   'bg-emerald-400',
  category: 'bg-violet-400',
  boolean:  'bg-amber-400',
  text:     'bg-slate-300',
};

// Number and date columns get right-aligned; others left-aligned
function cellAlign(type: string): string {
  return type === 'number' ? 'text-right' : 'text-left';
}

interface Props {
  table: ParsedTable;
  data?: Record<string, any>[];
}

export default function DataTable({ table, data }: Props) {
  const { t } = useLanguage();
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState('');
  const [sortCol, setSortCol] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>('asc');
  const [modalCol, setModalCol] = useState<ParsedColumn | null>(null);
  const [recordIdx, setRecordIdx] = useState<number | null>(null);

  const baseRows = data ?? table.data;
  const cols = table.columns.slice(0, 10);

  const searchedRows = useMemo(() => {
    if (!search.trim()) return baseRows;
    const q = search.toLowerCase();
    return baseRows.filter((row) =>
      cols.some((col) => {
        const val = row[col.originalName];
        return val != null && String(val).toLowerCase().includes(q);
      })
    );
  }, [baseRows, search, cols]);

  const sortedRows = useMemo(() => {
    if (!sortCol) return searchedRows;
    return [...searchedRows].sort((a, b) => {
      const av = a[sortCol];
      const bv = b[sortCol];
      if (av == null && bv == null) return 0;
      if (av == null) return 1;
      if (bv == null) return -1;
      const an = Number(av), bn = Number(bv);
      const cmp = !isNaN(an) && !isNaN(bn) ? an - bn : String(av).localeCompare(String(bv));
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }, [searchedRows, sortCol, sortDir]);

  function handleSort(colName: string) {
    if (sortCol === colName) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else { setSortCol(colName); setSortDir('asc'); }
    setPage(0);
  }

  function handleSearch(val: string) { setSearch(val); setPage(0); }

  function exportCSV() {
    const header = cols.map((c) => c.originalName).join(',');
    const csvRows = sortedRows.map((row) =>
      cols.map((c) => {
        const val = row[c.originalName];
        if (val == null) return '';
        const s = String(val);
        return s.includes(',') || s.includes('"') || s.includes('\n')
          ? `"${s.replace(/"/g, '""')}"` : s;
      }).join(',')
    );
    const blob = new Blob([[header, ...csvRows].join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `${table.name}.csv`; a.click();
    URL.revokeObjectURL(url);
  }

  if (!cols.length) return null;

  const totalPages = Math.ceil(sortedRows.length / PAGE_SIZE);
  const pageRows = sortedRows.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
  const isFiltered = data !== undefined;
  const from = sortedRows.length > 0 ? page * PAGE_SIZE + 1 : 0;
  const to = Math.min((page + 1) * PAGE_SIZE, sortedRows.length);

  return (
    <>
      <div className="card overflow-hidden">
        {/* Toolbar */}
        <div className="px-5 py-4 border-b border-surface-200 dark:border-slate-700 flex items-center justify-between gap-3 flex-wrap">
          <div className="flex-shrink-0">
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200">{t('recentData')}</h3>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{t('recordClickHint')}</p>
          </div>
          <div className="flex items-center gap-2 flex-1 justify-end flex-wrap">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <input
                type="text"
                value={search}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder={t('searchTable')}
                className="h-8 pl-7 pr-3 text-xs border border-surface-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent w-44"
              />
            </div>
            <button onClick={exportCSV} className="btn-ghost text-xs py-1.5">
              <Download className="w-3.5 h-3.5" />
              <span>{t('exportCSV')}</span>
            </button>
            <span className="text-xs text-slate-400 dark:text-slate-500 whitespace-nowrap">
              {t('showingRows')} {from}–{to} {t('of')} {sortedRows.length.toLocaleString()}
              {isFiltered && sortedRows.length !== table.rowCount && (
                <span className="text-primary-500 font-medium ml-1">
                  ({t('filtered')}: {table.rowCount.toLocaleString()} {t('rows')})
                </span>
              )}
            </span>
          </div>
        </div>

        {sortedRows.length === 0 ? (
          <p className="text-sm text-slate-400 dark:text-slate-500 text-center py-10">{t('noFilterResults')}</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-surface-50 dark:bg-slate-700/50 border-b border-surface-200 dark:border-slate-700">
                  {cols.map((col) => (
                    <th
                      key={col.originalName}
                      className={clsx(
                        'px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide whitespace-nowrap group',
                        cellAlign(col.inferredType)
                      )}
                    >
                      <div className={clsx('flex items-center gap-1.5', col.inferredType === 'number' ? 'flex-row-reverse' : '')}>
                        <button
                          onClick={() => handleSort(col.originalName)}
                          className="flex items-center gap-1.5 hover:text-slate-700 dark:hover:text-slate-200 select-none min-w-0"
                        >
                          <span
                            className={clsx('w-1.5 h-1.5 rounded-full flex-shrink-0', TYPE_DOTS[col.inferredType] ?? 'bg-slate-300')}
                            title={col.inferredType}
                          />
                          <span className="truncate max-w-[140px]">{col.originalName}</span>
                          {sortCol === col.originalName
                            ? (sortDir === 'asc'
                              ? <ChevronUp className="w-3 h-3 text-primary-500 flex-shrink-0" />
                              : <ChevronDown className="w-3 h-3 text-primary-500 flex-shrink-0" />)
                            : <ChevronsUpDown className="w-3 h-3 text-slate-300 dark:text-slate-600 group-hover:text-slate-400 flex-shrink-0" />
                          }
                        </button>
                        <button
                          onClick={() => setModalCol(col)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-300 dark:text-slate-600 hover:text-primary-500 flex-shrink-0 p-0.5 rounded"
                          title={`Analyse "${col.originalName}"`}
                        >
                          <Info className="w-3 h-3" />
                        </button>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-100 dark:divide-slate-700">
                {pageRows.map((row, i) => {
                  const absoluteIdx = page * PAGE_SIZE + i;
                  return (
                    <tr
                      key={i}
                      onClick={() => setRecordIdx(absoluteIdx)}
                      className="hover:bg-primary-50/40 dark:hover:bg-primary-900/10 transition-colors cursor-pointer group"
                    >
                      {cols.map((col) => {
                        const val = row[col.originalName];
                        const isEmpty = val === null || val === undefined || val === '';
                        const raw = isEmpty ? null : String(val);

                        // Format numbers with locale separators
                        let display = raw;
                        if (!isEmpty && col.inferredType === 'number') {
                          const n = Number(val);
                          if (!isNaN(n)) display = n.toLocaleString();
                        }

                        return (
                          <td
                            key={col.originalName}
                            className={clsx(
                              'px-4 py-2.5 whitespace-nowrap max-w-[220px] overflow-hidden text-ellipsis',
                              cellAlign(col.inferredType),
                              col.inferredType === 'number' ? 'tabular-nums font-medium text-slate-800 dark:text-slate-100' : 'text-slate-700 dark:text-slate-300'
                            )}
                            title={raw ?? undefined}
                          >
                            {isEmpty
                              ? <span className="text-slate-300 dark:text-slate-600">—</span>
                              : display
                            }
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {totalPages > 1 && (
          <div className="px-5 py-3 border-t border-surface-200 dark:border-slate-700 flex items-center justify-between">
            <button
              className="btn-ghost text-xs py-1.5"
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
            >
              <ChevronLeft className="w-4 h-4" /> {t('prev')}
            </button>
            <span className="text-xs text-slate-500 dark:text-slate-400">{page + 1} / {totalPages}</span>
            <button
              className="btn-ghost text-xs py-1.5"
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page === totalPages - 1}
            >
              {t('next')} <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {modalCol && (
        <ColumnModal col={modalCol} table={table} onClose={() => setModalCol(null)} />
      )}

      {recordIdx !== null && (
        <RecordModal
          table={table}
          rows={sortedRows}
          initialIndex={recordIdx}
          onClose={() => setRecordIdx(null)}
        />
      )}
    </>
  );
}
