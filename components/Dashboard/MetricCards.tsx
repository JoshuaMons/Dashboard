'use client';

import {
  Database, Calendar, Clock, CheckCircle, Timer, Tag, Globe, User, TrendingUp,
  Table2, Columns, Info,
} from 'lucide-react';
import { MetricCard } from '@/types';
import { useLanguage } from '@/contexts/LanguageContext';
import { clsx } from 'clsx';

const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  database: Database, calendar: Calendar, clock: Clock,
  'check-circle': CheckCircle, timer: Timer, tag: Tag,
  globe: Globe, user: User, trending: TrendingUp, table: Table2, columns: Columns,
};

const METRIC_TIPS: Record<string, [string, string]> = {
  total:        ['Total number of records in this dataset.', 'Totaal aantal records in deze dataset.'],
  this_week:    ['Records created in the last 7 days based on the date column.', 'Records van de afgelopen 7 dagen op basis van de datumkolom.'],
  date_range:   ['Time span from the earliest to the most recent record.', 'Tijdsbereik van het vroegste tot het recentste record.'],
  resolved:     ['Percentage of records marked resolved, closed, or done.', 'Percentage records gemarkeerd als opgelost, gesloten of klaar.'],
  avg_duration: ['Average handling or duration time per record.', 'Gemiddelde afhandel- of duurtijd per record.'],
  top_reason:   ['Most frequently occurring reason or category in the dataset.', 'Meest voorkomende reden of categorie in de dataset.'],
  top_channel:  ['Channel or platform from which most records originate.', 'Kanaal of platform van waaruit de meeste records afkomstig zijn.'],
  top_agent:    ['Agent or employee with the highest number of assigned records.', 'Medewerker of agent met het hoogste aantal toegewezen records.'],
};

// Dark-mode compatible background colours for metric icons
const BG_DARK: Record<string, string> = {
  'bg-primary-50':  'dark:bg-primary-900/30',
  'bg-blue-50':     'dark:bg-blue-900/30',
  'bg-violet-50':   'dark:bg-violet-900/30',
  'bg-emerald-50':  'dark:bg-emerald-900/30',
  'bg-amber-50':    'dark:bg-amber-900/30',
  'bg-rose-50':     'dark:bg-rose-900/30',
};

function InfoTooltip({ text }: { text: string }) {
  return (
    <span className="relative group inline-flex flex-shrink-0 mt-0.5">
      <Info className="w-3 h-3 text-slate-300 hover:text-slate-500 cursor-help transition-colors" />
      <span className="absolute bottom-full left-0 mb-2 w-52 bg-slate-800 text-white text-xs rounded-xl px-3 py-2 opacity-0 group-hover:opacity-100 pointer-events-none z-50 shadow-xl leading-relaxed transition-opacity">
        {text}
        <span className="absolute top-full left-3 border-[5px] border-transparent border-t-slate-800" />
      </span>
    </span>
  );
}

function MetricCardItem({ card }: { card: MetricCard }) {
  const { lang } = useLanguage();
  const Icon = ICONS[card.icon] ?? Database;
  const title = lang === 'nl' ? card.titleNl : card.titleEn;
  const tipEntry = METRIC_TIPS[card.key];
  const tip = tipEntry ? (lang === 'nl' ? tipEntry[1] : tipEntry[0]) : undefined;
  const darkBg = BG_DARK[card.bgColor] ?? 'dark:bg-slate-700';

  const valueStr = String(card.value);
  // Long values (e.g. date ranges) use smaller font
  const valueSizeCls = valueStr.length > 12 ? 'text-base font-bold' : 'text-2xl font-bold';

  return (
    <div className="card p-5 hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-200 cursor-default">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-2">
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide leading-none">{title}</p>
            {tip && <InfoTooltip text={tip} />}
          </div>
          <p className={clsx(valueSizeCls, 'text-slate-900 dark:text-slate-100 break-words leading-tight')}>
            {card.value}
          </p>
          {card.changeLabel && (
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1.5">{card.changeLabel}</p>
          )}
        </div>
        <div className={clsx('w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5', card.bgColor, darkBg)}>
          <Icon className={clsx('w-5 h-5', card.color)} />
        </div>
      </div>
    </div>
  );
}

export default function MetricCards({ metrics }: { metrics: MetricCard[] }) {
  if (!metrics.length) return null;
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      {metrics.map((m) => (
        <MetricCardItem key={m.key} card={m} />
      ))}
    </div>
  );
}
