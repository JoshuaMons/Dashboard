'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { DatabaseInfo, FullAnalyticsResult } from '@/types';
import { analyseDatabase } from '@/lib/analytics';
import { saveToStorage, loadFromStorage, clearStorage } from '@/lib/storage';

interface DatabaseContextValue {
  database: DatabaseInfo | null;
  analytics: FullAnalyticsResult | null;
  isLoading: boolean;
  progress: number;
  progressMsg: string;
  error: string | null;
  isRestoredFromCache: boolean;
  loadFile: (file: File) => Promise<void>;
  clearDatabase: () => void;
  dismissCacheBanner: () => void;
}

const DatabaseContext = createContext<DatabaseContextValue>({
  database: null,
  analytics: null,
  isLoading: false,
  progress: 0,
  progressMsg: '',
  error: null,
  isRestoredFromCache: false,
  loadFile: async () => {},
  clearDatabase: () => {},
  dismissCacheBanner: () => {},
});

export function DatabaseProvider({ children }: { children: ReactNode }) {
  const [database, setDatabase] = useState<DatabaseInfo | null>(null);
  const [analytics, setAnalytics] = useState<FullAnalyticsResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressMsg, setProgressMsg] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isRestoredFromCache, setIsRestoredFromCache] = useState(false);

  // Restore from localStorage on first render (client only)
  useEffect(() => {
    const stored = loadFromStorage();
    if (stored) {
      try {
        const result = analyseDatabase(stored.tables);
        setDatabase(stored);
        setAnalytics(result);
        setIsRestoredFromCache(true);
      } catch {
        clearStorage();
      }
    }
  }, []);

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
      setIsRestoredFromCache(false);
      saveToStorage(info);
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
    setIsRestoredFromCache(false);
    clearStorage();
  }

  function dismissCacheBanner() {
    setIsRestoredFromCache(false);
  }

  return (
    <DatabaseContext.Provider value={{
      database, analytics, isLoading, progress, progressMsg, error,
      isRestoredFromCache, loadFile, clearDatabase, dismissCacheBanner,
    }}>
      {children}
    </DatabaseContext.Provider>
  );
}

export function useDatabase() {
  return useContext(DatabaseContext);
}
