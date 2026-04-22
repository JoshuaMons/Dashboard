'use client';

import { useState } from 'react';
import { LayoutDashboard, Table2 } from 'lucide-react';
import { useDatabase } from '@/contexts/DatabaseContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { clsx } from 'clsx';
import OverviewTab from './OverviewTab';
import TableTab from './TableTab';

type TabId = 'overview' | string; // string = table name

export default function Dashboard() {
  const { database, analytics } = useDatabase();
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<TabId>('overview');

  if (!database || !analytics) return null;

  const { tables } = database;
  const { tableAnalytics } = analytics;

  const tabs = [
    { id: 'overview' as TabId, label: t('overview'), icon: LayoutDashboard },
    ...tables.map((table) => ({
      id: table.name as TabId,
      label: table.name,
      icon: Table2,
      rowCount: table.rowCount,
      isChatbot: tableAnalytics.find((ta) => ta.tableName === table.name)?.isChatbotData ?? false,
    })),
  ];

  const activeTable = tables.find((t) => t.name === activeTab);
  const activeAnalytics = tableAnalytics.find((ta) => ta.tableName === activeTab);

  return (
    <div className="space-y-5">
      {/* Tab bar */}
      <div className="bg-white border border-surface-200 rounded-2xl shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <div className="flex min-w-max">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={clsx(
                    'flex items-center gap-2 px-5 py-3.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors',
                    isActive
                      ? 'border-primary-600 text-primary-700 bg-primary-50/50'
                      : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-surface-50'
                  )}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span>{tab.label}</span>
                  {'rowCount' in tab && (
                    <span className={clsx(
                      'text-xs px-1.5 py-0.5 rounded-full font-semibold ml-0.5',
                      isActive ? 'bg-primary-100 text-primary-700' : 'bg-surface-100 text-slate-400'
                    )}>
                      {(tab.rowCount as number).toLocaleString()}
                    </span>
                  )}
                  {'isChatbot' in tab && tab.isChatbot && (
                    <span className="text-xs bg-violet-100 text-violet-700 px-1.5 py-0.5 rounded-full font-semibold">
                      bot
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Tab content */}
      {activeTab === 'overview' ? (
        <OverviewTab
          database={database}
          analytics={analytics}
          onTableClick={(name) => setActiveTab(name)}
        />
      ) : activeTable && activeAnalytics ? (
        <TableTab table={activeTable} analytics={activeAnalytics} />
      ) : null}
    </div>
  );
}
