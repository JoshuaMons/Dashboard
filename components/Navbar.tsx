'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Table2, Upload, Globe, History, X } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useDatabase } from '@/contexts/DatabaseContext';
import { clsx } from 'clsx';

export default function Navbar() {
  const { lang, setLang, t } = useLanguage();
  const { database, clearDatabase, isRestoredFromCache, dismissCacheBanner } = useDatabase();
  const pathname = usePathname();

  const navItems = [
    { href: '/dashboard', label: t('dashboard'), icon: LayoutDashboard },
    { href: '/tables', label: t('tables'), icon: Table2 },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-surface-200">
      {/* Cache restored banner */}
      {isRestoredFromCache && (
        <div className="bg-primary-50 border-b border-primary-100 px-4 py-2 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-primary-700">
            <History className="w-3.5 h-3.5 flex-shrink-0" />
            <span>{t('restoredFromCache')}</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={clearDatabase}
              className="font-semibold text-red-500 hover:text-red-700 transition-colors"
            >
              {t('clearCache')}
            </button>
            <button onClick={dismissCacheBanner} className="text-primary-400 hover:text-primary-700 transition-colors">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center">
            <LayoutDashboard className="w-4 h-4 text-white" />
          </div>
          <span className="font-semibold text-slate-900 hidden sm:block truncate max-w-[160px]">
            {database?.fileName ?? 'Dashboard'}
          </span>
        </div>

        {/* Nav links */}
        <nav className="flex items-center gap-1">
          {navItems.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={clsx(
                'flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                pathname === href ? 'bg-primary-50 text-primary-700' : 'text-slate-600 hover:bg-surface-100'
              )}
            >
              <Icon className="w-4 h-4" />
              <span className="hidden sm:inline">{label}</span>
            </Link>
          ))}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-2">
          {/* Language toggle */}
          <div className="flex items-center gap-1 bg-surface-100 rounded-lg p-1">
            <Globe className="w-3.5 h-3.5 text-slate-400 ml-1.5" />
            {(['en', 'nl'] as const).map((l) => (
              <button
                key={l}
                onClick={() => setLang(l)}
                className={clsx(
                  'px-2.5 py-1 rounded-md text-xs font-semibold uppercase transition-colors',
                  lang === l ? 'bg-white text-primary-700 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                )}
              >
                {l}
              </button>
            ))}
          </div>

          {/* New file */}
          <button onClick={clearDatabase} className="btn-ghost text-xs">
            <Upload className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{t('newFile')}</span>
          </button>
        </div>
      </div>
    </header>
  );
}
