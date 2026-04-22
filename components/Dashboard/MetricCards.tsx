'use client';

import {
  Database, Calendar, Clock, CheckCircle, Timer, Tag, Globe, User, TrendingUp,
  Table2, Columns,
} from 'lucide-react';
import { MetricCard } from '@/types';
import { useLanguage } from '@/contexts/LanguageContext';
import { clsx } from 'clsx';

const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  database: Database,
  calendar: Calendar,
  clock: Clock,
  'check-circle': CheckCircle,
  timer: Timer,
  tag: Tag,
  globe: Globe,
  user: User,
  trending: TrendingUp,
  table: Table2,
  columns: Columns,
};

function MetricCardItem({ card }: { card: MetricCard }) {
  const { lang } = useLanguage();
  const Icon = ICONS[card.icon] ?? Database;
  const title = lang === 'nl' ? card.titleNl : card.titleEn;

  return (
    <div className="card p-5 hover:shadow-card-hover transition-shadow duration-200">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1.5">
            {title}
          </p>
          <p className="text-2xl font-bold text-slate-900 truncate">{card.value}</p>
          {card.changeLabel && (
            <p className="text-xs text-slate-400 mt-1">{card.changeLabel}</p>
          )}
        </div>
        <div className={clsx('w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0', card.bgColor)}>
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
