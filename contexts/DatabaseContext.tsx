'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { DatabaseInfo, FullAnalyticsResult } from '@/types';
import { analyseDatabase } from '@/lib/analytics';

interface DatabaseContextValue {
  database: DatabaseInfo | null;
  analytics: FullAnalyticsResult | null;
  isLoading: boolean;
  progress: number;
  progressMsg: string;
  error: string | null;
  loadFile: (file: File) => Promise<void>;
  clearDatabase: () => void;
}

const DatabaseContext = createContext<DatabaseContextValue>({
  database: null,
  analytics: null,
  isLoading: false,
  progress: 0,
  progressMsg: '',
  error: null,
  loadFile: async () => {},
  clearDatabase: () => {},
});

export function DatabaseProvider({ children }: { children: ReactNode }) {
  const [database, setDatabase] = useState<DatabaseInfo | null>(null);
  const [analytics, setAnalytics] = useState<FullAnalyticsResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressMsg, setProgressMsg] = useState('');
  const [error, setError] = useState<string | null>(null);

  async function loadFile(file: File) {
    setIsLoading(true);
    setError(null);
    setProgress(0);
    setProgressMsg('');
    try {
      const { parseFile } = await import('@/lib/database');
      const info = await parseFile(file, (pct, msg) => {
        setProgress(pct);
        setProgressMsg(msg);
      });
      const result = analyseDatabase(info.tables);
      setDatabase(info);
      setAnalytics(result);
    } catch (e: any) {
      setError(e?.message ?? 'Unknown error');
    } finally {
      setIsLoading(false);
      setProgress(0);
      setProgressMsg('');
    }
  }

  function clearDatabase() {
    setDatabase(null);
    setAnalytics(null);
    setError(null);
    setProgress(0);
    setProgressMsg('');
  }

  return (
    <DatabaseContext.Provider value={{ database, analytics, isLoading, progress, progressMsg, error, loadFile, clearDatabase }}>
      {children}
    </DatabaseContext.Provider>
  );
}

export function useDatabase() {
  return useContext(DatabaseContext);
}
