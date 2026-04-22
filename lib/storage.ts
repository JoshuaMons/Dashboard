import { DatabaseInfo } from '@/types';

const KEY = 'chatbot_dashboard_v2';

export function saveToStorage(info: DatabaseInfo): void {
  if (typeof window === 'undefined') return;
  const tiers = [
    () => JSON.stringify(info),
    () => JSON.stringify({ ...info, tables: info.tables.map((t) => ({ ...t, data: t.data.slice(0, 2000) })) }),
    () => JSON.stringify({ ...info, tables: info.tables.map((t) => ({ ...t, data: t.data.slice(0, 500) })) }),
    () => JSON.stringify({ ...info, tables: info.tables.map((t) => ({ ...t, data: [] })) }),
  ];
  for (const serialize of tiers) {
    try {
      localStorage.setItem(KEY, serialize());
      return;
    } catch {
      // quota exceeded — try next tier
    }
  }
}

export function loadFromStorage(): DatabaseInfo | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    return JSON.parse(raw) as DatabaseInfo;
  } catch {
    return null;
  }
}

export function clearStorage(): void {
  if (typeof window === 'undefined') return;
  try { localStorage.removeItem(KEY); } catch { /* ignore */ }
}
