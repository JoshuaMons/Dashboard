'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useDatabase } from '@/contexts/DatabaseContext';
import { useLanguage } from '@/contexts/LanguageContext';
import Navbar from '@/components/Navbar';
import TableViewer from '@/components/TableViewer';

export default function TablesPage() {
  const { database } = useDatabase();
  const { t } = useLanguage();
  const router = useRouter();

  useEffect(() => {
    if (!database) router.replace('/');
  }, [database, router]);

  if (!database) return null;

  return (
    <div className="min-h-screen bg-surface-50 dark:bg-slate-900">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{t('tablesOverview')}</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">{t('tablesDescription')}</p>
        </div>
        <TableViewer />
      </main>
    </div>
  );
}
