import { ParsedTable, MetricCard, ChartConfig, ChatbotColumns, FullAnalyticsResult, TableAnalytics } from '@/types';

// ─── Keyword banks (EN + NL) ──────────────────────────────────────────────────

const KEYWORDS: Record<keyof ChatbotColumns, string[]> = {
  date:     ['date', 'datum', 'created', 'aangemaakt', 'timestamp', 'tijdstip', 'created_at', 'aangemaakt_op', 'started', 'gestart', 'time', 'tijd', 'datetime', 'modified', 'updated'],
  handover: ['handover', 'overdracht', 'escalation', 'escalatie', 'transfer', 'overdragen'],
  status:   ['status', 'staat', 'state', 'resolved', 'opgelost', 'result', 'resultaat', 'outcome', 'uitkomst'],
  reason:   ['reason', 'reden', 'cause', 'oorzaak', 'category', 'categorie', 'type', 'soort', 'subject', 'onderwerp', 'topic', 'intent', 'intentie'],
  agent:    ['agent', 'medewerker', 'operator', 'employee', 'werknemer', 'assignee', 'toegewezen', 'handler', 'behandelaar'],
  channel:  ['channel', 'kanaal', 'source', 'bron', 'medium', 'platform', 'origin', 'herkomst'],
  duration: ['duration', 'duur', 'time_spent', 'bestede_tijd', 'handle_time', 'afhandeltijd', 'waiting', 'wachttijd', 'seconds', 'minutes', 'minuten'],
  customer: ['customer', 'klant', 'client', 'visitor', 'bezoeker', 'contact', 'user_id', 'customer_id', 'klant_id'],
  resolved: ['resolved', 'opgelost', 'closed', 'gesloten', 'done', 'klaar', 'finished', 'afgerond', 'completed', 'voltooid'],
};

function detectChatbotColumns(table: ParsedTable): ChatbotColumns {
  const result: ChatbotColumns = {};
  for (const [role, kws] of Object.entries(KEYWORDS) as [keyof ChatbotColumns, string[]][]) {
    const match = table.columns.find((c) => kws.some((kw) => c.originalName.toLowerCase().includes(kw)));
    if (match) result[role] = match.originalName;
  }
  const dateTyped = table.columns.find((c) => c.inferredType === 'date');
  if (dateTyped && !result.date) result.date = dateTyped.originalName;
  return result;
}

function chatbotScore(cb: ChatbotColumns): number {
  return Object.keys(cb).length;
}

// ─── Date helpers ─────────────────────────────────────────────────────────────

function parseDate(v: any): Date | null {
  if (!v) return null;
  const d = new Date(String(v));
  return isNaN(d.getTime()) ? null : d;
}

function toYYYYMMDD(d: Date): string {
  return d.toISOString().slice(0, 10);
}

// ─── Chart colours ────────────────────────────────────────────────────────────

export const CHART_COLORS = ['#6366f1', '#8b5cf6', '#60a5fa', '#34d399', '#f59e0b', '#f87171', '#a78bfa', '#2dd4bf'];

// ─── Metric builders ──────────────────────────────────────────────────────────

function buildMetrics(table: ParsedTable, cb: ChatbotColumns, isChatbot: boolean): MetricCard[] {
  const out: MetricCard[] = [];

  out.push({ key: 'total', titleEn: isChatbot ? 'Total Handovers' : 'Total Records', titleNl: isChatbot ? 'Totaal Handovers' : 'Totaal Records', value: table.rowCount.toLocaleString(), icon: 'database', color: 'text-primary-600', bgColor: 'bg-primary-50' });

  if (cb.date) {
    const dates = (table.data.map((r) => parseDate(r[cb.date!])).filter(Boolean) as Date[]).sort((a, b) => a.getTime() - b.getTime());
    if (dates.length) {
      const cutoff = new Date(); cutoff.setDate(cutoff.getDate() - 7);
      out.push({ key: 'this_week', titleEn: 'Last 7 Days', titleNl: 'Laatste 7 Dagen', value: dates.filter((d) => d >= cutoff).length.toLocaleString(), icon: 'calendar', color: 'text-blue-600', bgColor: 'bg-blue-50' });
      out.push({ key: 'date_range', titleEn: 'Date Range', titleNl: 'Datumbereik', value: `${toYYYYMMDD(dates[0])} – ${toYYYYMMDD(dates[dates.length - 1])}`, icon: 'clock', color: 'text-violet-600', bgColor: 'bg-violet-50' });
    }
  }

  if (cb.resolved || cb.status) {
    const col = cb.resolved ?? cb.status!;
    const resolvedKw = ['resolved', 'opgelost', 'closed', 'gesloten', 'done', 'klaar', 'true', '1', 'yes', 'ja', 'completed', 'voltooid', 'finished', 'afgerond'];
    const vals = table.data.map((r) => String(r[col] ?? '').toLowerCase());
    const rate = vals.length ? Math.round((vals.filter((v) => resolvedKw.some((kw) => v.includes(kw))).length / vals.length) * 100) : 0;
    out.push({ key: 'resolved', titleEn: 'Resolution Rate', titleNl: 'Oplossingspercentage', value: `${rate}%`, icon: 'check-circle', color: 'text-emerald-600', bgColor: 'bg-emerald-50' });
  }

  if (cb.duration) {
    const vals = table.data.map((r) => Number(r[cb.duration!])).filter((n) => !isNaN(n) && n > 0);
    if (vals.length) {
      const avg = Math.round(vals.reduce((a, b) => a + b, 0) / vals.length);
      out.push({ key: 'avg_duration', titleEn: 'Avg. Duration', titleNl: 'Gem. Duur', value: avg >= 60 ? `${Math.round(avg / 60)} min` : `${avg}s`, icon: 'timer', color: 'text-amber-600', bgColor: 'bg-amber-50' });
    }
  }

  for (const [rk, icon, en, nl] of [['reason','tag','Top Reason','Toprede'],['channel','globe','Top Channel','Topkanaal'],['agent','user','Top Agent','Topmedewerker']] as [keyof ChatbotColumns, string, string, string][]) {
    const col = cb[rk]; if (!col) continue;
    const freq: Record<string, number> = {};
    table.data.forEach((r) => { const v = String(r[col] ?? '').trim(); if (v) freq[v] = (freq[v] ?? 0) + 1; });
    const top = Object.entries(freq).sort((a, b) => b[1] - a[1])[0];
    if (top) out.push({ key: `top_${rk}`, titleEn: en, titleNl: nl, value: top[0], icon, color: 'text-rose-600', bgColor: 'bg-rose-50' });
  }

  return out;
}

// ─── Chart builders ───────────────────────────────────────────────────────────

function buildTimeSeries(table: ParsedTable, dateCol: string, id = 'time_series'): ChartConfig | null {
  const freq: Record<string, number> = {};
  table.data.forEach((r) => { const d = parseDate(r[dateCol]); if (d) { const k = toYYYYMMDD(d); freq[k] = (freq[k] ?? 0) + 1; } });
  const data = Object.entries(freq).sort((a, b) => a[0].localeCompare(b[0])).map(([date, count]) => ({ date, count }));
  if (data.length < 2) return null;
  return { id, type: 'area', titleEn: 'Volume Over Time', titleNl: 'Volume in de Tijd', data, xKey: 'date', yKey: 'count', colors: ['#6366f1'] };
}

function buildWeeklyChart(table: ParsedTable, dateCol: string, id: string): ChartConfig | null {
  const freq: Record<string, number> = {};
  table.data.forEach((r) => {
    const d = parseDate(r[dateCol]);
    if (!d) return;
    const w = new Date(d);
    const day = w.getDay();
    w.setDate(w.getDate() - (day === 0 ? 6 : day - 1)); // Monday
    const k = toYYYYMMDD(w);
    freq[k] = (freq[k] ?? 0) + 1;
  });
  const data = Object.entries(freq).sort((a, b) => a[0].localeCompare(b[0])).map(([week, count]) => ({ week, count }));
  if (data.length < 4) return null;
  return { id, type: 'area', titleEn: 'Weekly Trend', titleNl: 'Wekelijkse Trend', data, xKey: 'week', yKey: 'count', colors: ['#34d399'] };
}

function buildHourlyChart(table: ParsedTable, dateCol: string, id: string): ChartConfig | null {
  const freq = new Array(24).fill(0);
  table.data.forEach((r) => { const d = parseDate(r[dateCol]); if (d) freq[d.getHours()]++; });
  if (freq.every((n) => n === 0)) return null;
  const data = freq.map((count, h) => ({ hour: String(h).padStart(2, '0') + ':00', count }));
  return { id, type: 'bar', titleEn: 'By Hour of Day', titleNl: 'Per Uur van de Dag', data, xKey: 'hour', yKey: 'count', colors: ['#8b5cf6'] };
}

function buildWeekdayChart(table: ParsedTable, dateCol: string, id: string): ChartConfig | null {
  const EN = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const freq = new Array(7).fill(0);
  table.data.forEach((r) => { const d = parseDate(r[dateCol]); if (d) freq[d.getDay()]++; });
  if (freq.every((n) => n === 0)) return null;
  const data = EN.map((day, i) => ({ day, count: freq[i] }));
  return { id, type: 'bar', titleEn: 'By Day of Week', titleNl: 'Per Dag van de Week', data, xKey: 'day', yKey: 'count', colors: ['#60a5fa'] };
}

function buildCategoryChart(table: ParsedTable, colName: string, titleEn: string, titleNl: string, chartType: 'bar' | 'pie' = 'bar', id?: string): ChartConfig | null {
  const freq: Record<string, number> = {};
  table.data.forEach((r) => { const v = String(r[colName] ?? '').trim(); if (v) freq[v] = (freq[v] ?? 0) + 1; });
  const data = Object.entries(freq).sort((a, b) => b[1] - a[1]).slice(0, 15).map(([name, value], i) => ({ name, value, fill: CHART_COLORS[i % CHART_COLORS.length] }));
  if (data.length < 2) return null;
  return { id: id ?? `cat_${colName}`, type: chartType, titleEn, titleNl, data, nameKey: 'name', valueKey: 'value', colors: CHART_COLORS };
}

function buildNumericChart(table: ParsedTable, colName: string): ChartConfig | null {
  const vals = table.data.map((r) => Number(r[colName])).filter((n) => !isNaN(n));
  if (vals.length < 5) return null;
  vals.sort((a, b) => a - b);
  const step = (vals[vals.length - 1] - vals[0]) / 10 || 1;
  const hist: Record<string, number> = {};
  vals.forEach((v) => { const b = Math.round((Math.floor((v - vals[0]) / step) * step + vals[0])); const l = `${b}`; hist[l] = (hist[l] ?? 0) + 1; });
  const data = Object.entries(hist).sort((a, b) => Number(a[0]) - Number(b[0])).map(([name, value]) => ({ name, value }));
  return { id: `num_${colName}`, type: 'bar', titleEn: `Distribution: ${colName}`, titleNl: `Verdeling: ${colName}`, data, xKey: 'name', yKey: 'value', colors: ['#6366f1'] };
}

function buildMissingValuesChart(table: ParsedTable): ChartConfig | null {
  const data = table.columns
    .map((col) => {
      const nulls = table.data.filter((r) => r[col.originalName] === null || r[col.originalName] === undefined || r[col.originalName] === '').length;
      return { name: col.originalName, value: table.data.length > 0 ? Math.round((nulls / table.data.length) * 100) : 0 };
    })
    .filter((d) => d.value > 0)
    .sort((a, b) => b.value - a.value)
    .slice(0, 15);
  if (!data.length) return null;
  return { id: `missing_${table.name}`, type: 'bar', titleEn: 'Missing Values (%)', titleNl: 'Ontbrekende Waarden (%)', data, nameKey: 'name', valueKey: 'value', colors: ['#f59e0b'] };
}

function buildDurationDistChart(table: ParsedTable, durationCol: string): ChartConfig | null {
  const vals = table.data.map((r) => Number(r[durationCol])).filter((n) => !isNaN(n) && n >= 0);
  if (vals.length < 10) return null;
  // Bucket into ranges
  const buckets = [
    { max: 60, label: '< 1 min' },
    { max: 300, label: '1–5 min' },
    { max: 600, label: '5–10 min' },
    { max: 1800, label: '10–30 min' },
    { max: 3600, label: '30–60 min' },
    { max: Infinity, label: '> 60 min' },
  ];
  const freq: Record<string, number> = {};
  buckets.forEach((b) => (freq[b.label] = 0));
  vals.forEach((v) => {
    const bucket = buckets.find((b) => v < b.max);
    if (bucket) freq[bucket.label]++;
  });
  const data = buckets.map((b) => ({ name: b.label, value: freq[b.label] })).filter((d) => d.value > 0);
  if (data.length < 2) return null;
  return { id: `dur_dist_${table.name}`, type: 'bar', titleEn: 'Duration Distribution', titleNl: 'Duurdistributie', data, nameKey: 'name', valueKey: 'value', colors: ['#a78bfa'] };
}

// ─── Per-table chart assembly ─────────────────────────────────────────────────

function buildChartsForTable(table: ParsedTable, cb: ChatbotColumns, isChatbot: boolean): ChartConfig[] {
  const charts: ChartConfig[] = [];
  const tn = table.name;

  // Daily time series
  if (cb.date) {
    const ts = buildTimeSeries(table, cb.date, `ts_${tn}`);
    if (ts) charts.push(ts);
  }

  // Chatbot-specific charts
  if (isChatbot) {
    const defs: [keyof ChatbotColumns, string, string, 'bar' | 'pie'][] = [
      ['reason',  'Handovers by Reason',  'Handovers per Reden',      'bar'],
      ['channel', 'Handovers by Channel', 'Handovers per Kanaal',     'pie'],
      ['agent',   'Handovers by Agent',   'Handovers per Medewerker', 'bar'],
      ['status',  'Handovers by Status',  'Handovers per Status',     'pie'],
    ];
    for (const [rk, en, nl, t] of defs) {
      const col = cb[rk]; if (!col) continue;
      const c = buildCategoryChart(table, col, en, nl, t, `${rk}_${tn}`);
      if (c) charts.push(c);
    }
  }

  // Temporal analysis (hour + weekday + weekly trend)
  if (cb.date) {
    const hourly = buildHourlyChart(table, cb.date, `hourly_${tn}`);
    if (hourly) charts.push(hourly);

    const weekday = buildWeekdayChart(table, cb.date, `weekday_${tn}`);
    if (weekday) charts.push(weekday);

    const weekly = buildWeeklyChart(table, cb.date, `weekly_${tn}`);
    if (weekly) charts.push(weekly);
  }

  // Duration distribution
  if (cb.duration) {
    const dd = buildDurationDistChart(table, cb.duration);
    if (dd) charts.push(dd);
  }

  // Generic charts for remaining columns
  const covered = new Set(Object.values(cb).filter(Boolean));
  for (const col of table.columns) {
    if (charts.length >= 12) break;
    if (covered.has(col.originalName)) continue;
    if (col.inferredType === 'category' && col.uniqueCount >= 2) {
      const c = buildCategoryChart(table, col.originalName, `Count by ${col.originalName}`, `Aantal per ${col.originalName}`, col.uniqueCount <= 6 ? 'pie' : 'bar');
      if (c) charts.push(c);
    } else if (col.inferredType === 'number') {
      const c = buildNumericChart(table, col.originalName);
      if (c) charts.push(c);
    }
  }

  // Missing values analysis (always last)
  const missing = buildMissingValuesChart(table);
  if (missing) charts.push(missing);

  return charts;
}

// ─── Per-table analysis ───────────────────────────────────────────────────────

export function analyseTable(table: ParsedTable): TableAnalytics {
  const cb = detectChatbotColumns(table);
  const isChatbot = chatbotScore(cb) >= 2 && (cb.agent != null || cb.channel != null || cb.handover != null);
  return {
    tableName: table.name,
    metrics: buildMetrics(table, cb, isChatbot),
    charts: buildChartsForTable(table, cb, isChatbot),
    isChatbotData: isChatbot,
    chatbotColumns: cb,
  };
}

// ─── Main entry point ─────────────────────────────────────────────────────────

export function analyseDatabase(tables: ParsedTable[]): FullAnalyticsResult {
  if (!tables.length) {
    return { overview: { metrics: [], charts: [] }, tableAnalytics: [], isChatbotData: false };
  }

  const tableAnalytics = tables.map(analyseTable);
  const isChatbotData = tableAnalytics.some((t) => t.isChatbotData);

  const primaryAnalytics = [...tableAnalytics].sort((a, b) => {
    if (a.isChatbotData && !b.isChatbotData) return -1;
    if (!a.isChatbotData && b.isChatbotData) return 1;
    const ra = tables.find((t) => t.name === a.tableName)?.rowCount ?? 0;
    const rb = tables.find((t) => t.name === b.tableName)?.rowCount ?? 0;
    return rb - ra;
  })[0];

  const overviewMetrics: MetricCard[] = [
    { key: 'all_records', titleEn: 'Total Records', titleNl: 'Totaal Records', value: tables.reduce((s, t) => s + t.rowCount, 0).toLocaleString(), icon: 'database', color: 'text-primary-600', bgColor: 'bg-primary-50' },
    { key: 'all_tables',  titleEn: 'Tables',        titleNl: 'Tabellen',       value: tables.length, icon: 'table', color: 'text-blue-600', bgColor: 'bg-blue-50' },
    { key: 'all_columns', titleEn: 'Total Columns', titleNl: 'Totaal Kolommen', value: tables.reduce((s, t) => s + t.columns.length, 0), icon: 'columns', color: 'text-violet-600', bgColor: 'bg-violet-50' },
    ...primaryAnalytics.metrics.filter((m) => m.key !== 'total').slice(0, 4),
  ];

  return {
    overview: { metrics: overviewMetrics, charts: primaryAnalytics.charts.slice(0, 6) },
    tableAnalytics,
    isChatbotData,
  };
}
