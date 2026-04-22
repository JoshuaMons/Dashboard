import { FilterRule, FilterOperator, ColumnType } from '@/types';

export function applyFilters(
  data: Record<string, any>[],
  filters: FilterRule[]
): Record<string, any>[] {
  if (!filters.length) return data;
  return data.filter((row) => filters.every((f) => matchesFilter(row[f.column], f)));
}

function matchesFilter(val: any, f: FilterRule): boolean {
  const str = String(val ?? '').toLowerCase().trim();
  const fv = f.value.toLowerCase().trim();

  switch (f.operator) {
    case 'equals':      return str === fv;
    case 'not_equals':  return str !== fv;
    case 'contains':    return str.includes(fv);
    case 'not_contains':return !str.includes(fv);
    case 'starts_with': return str.startsWith(fv);
    case 'ends_with':   return str.endsWith(fv);
    case 'greater_than': {
      const n = Number(val); const fn = Number(f.value);
      return !isNaN(n) && !isNaN(fn) ? n > fn : str > fv;
    }
    case 'less_than': {
      const n = Number(val); const fn = Number(f.value);
      return !isNaN(n) && !isNaN(fn) ? n < fn : str < fv;
    }
    case 'between': {
      const n = Number(val);
      const lo = Number(f.value);
      const hi = Number(f.value2 ?? '');
      return n >= lo && n <= hi;
    }
    case 'is_empty':    return val === null || val === undefined || val === '';
    case 'is_not_empty':return val !== null && val !== undefined && val !== '';
    default: return true;
  }
}

export function operatorsForType(type: ColumnType): FilterOperator[] {
  switch (type) {
    case 'number':
      return ['equals', 'not_equals', 'greater_than', 'less_than', 'between', 'is_empty', 'is_not_empty'];
    case 'date':
      return ['equals', 'greater_than', 'less_than', 'between', 'is_empty', 'is_not_empty'];
    case 'boolean':
      return ['equals', 'not_equals', 'is_empty', 'is_not_empty'];
    case 'category':
      return ['equals', 'not_equals', 'contains', 'not_contains', 'is_empty', 'is_not_empty'];
    default:
      return ['contains', 'not_contains', 'equals', 'not_equals', 'starts_with', 'ends_with', 'is_empty', 'is_not_empty'];
  }
}

export function defaultOperator(type: ColumnType): FilterOperator {
  return operatorsForType(type)[0];
}

export function newFilter(columns: { originalName: string; inferredType: ColumnType }[]): FilterRule {
  const col = columns[0];
  return {
    id: Math.random().toString(36).slice(2),
    column: col?.originalName ?? '',
    operator: defaultOperator(col?.inferredType ?? 'text'),
    value: '',
  };
}
