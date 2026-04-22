export type Language = 'en' | 'nl';
export type ColumnType = 'date' | 'number' | 'category' | 'boolean' | 'text';

export type FilterOperator =
  | 'equals' | 'not_equals'
  | 'contains' | 'not_contains'
  | 'starts_with' | 'ends_with'
  | 'greater_than' | 'less_than' | 'between'
  | 'is_empty' | 'is_not_empty';

export interface FilterRule {
  id: string;
  column: string;
  operator: FilterOperator;
  value: string;
  value2?: string;
}

export interface ParsedColumn {
  name: string;
  originalName: string;
  sqlType: string;
  inferredType: ColumnType;
  nullable: boolean;
  uniqueCount: number;
  sampleValues: string[];
}

export interface ParsedTable {
  name: string;
  rowCount: number;
  columns: ParsedColumn[];
  data: Record<string, any>[];
}

export interface DatabaseInfo {
  fileName: string;
  fileType: 'sqlite' | 'csv' | 'sql';
  fileSize: number;
  tables: ParsedTable[];
  uploadedAt: string;
}

export interface MetricCard {
  key: string;
  titleEn: string;
  titleNl: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon: string;
  color: string;
  bgColor: string;
}

export interface ChartConfig {
  id: string;
  type: 'line' | 'bar' | 'pie' | 'area';
  titleEn: string;
  titleNl: string;
  data: Record<string, any>[];
  xKey?: string;
  yKey?: string;
  nameKey?: string;
  valueKey?: string;
  colors?: string[];
}

export interface ChatbotColumns {
  date?: string;
  status?: string;
  reason?: string;
  agent?: string;
  channel?: string;
  duration?: string;
  customer?: string;
  handover?: string;
  resolved?: string;
}

export interface TableAnalytics {
  tableName: string;
  metrics: MetricCard[];
  charts: ChartConfig[];
  isChatbotData: boolean;
  chatbotColumns: ChatbotColumns;
}

export interface FullAnalyticsResult {
  overview: {
    metrics: MetricCard[];
    charts: ChartConfig[];
  };
  tableAnalytics: TableAnalytics[];
  isChatbotData: boolean;
}
