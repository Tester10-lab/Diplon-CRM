import React from 'react';
import { Search, SlidersHorizontal } from 'lucide-react';
import { Button } from '../ui/Button';

export interface PageHeaderProps {
  title: string;
  subtitle?: string;
  badge?: string;
  searchValue?: string;
  onSearchChange?: (val: string) => void;
  searchPlaceholder?: string;
  actions?: React.ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  badge,
  searchValue,
  onSearchChange,
  searchPlaceholder = 'Search records...',
  actions
}) => {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
      <div>
        <div className="flex items-center gap-2">
          <h2 className="text-base font-extrabold text-slate-900 dark:text-slate-100">{title}</h2>
          {badge && (
            <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-indigo-500/10 text-indigo-500 border border-indigo-500/20">
              {badge}
            </span>
          )}
        </div>
        {subtitle && <p className="text-xs text-slate-400 mt-1">{subtitle}</p>}
      </div>

      <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
        {onSearchChange && (
          <div className="relative flex-1 sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={searchValue || ''}
              onChange={e => onSearchChange(e.target.value)}
              placeholder={searchPlaceholder}
              className="w-full bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-slate-100 placeholder-slate-400 text-xs rounded-xl pl-9 pr-3 py-2 border border-slate-200 dark:border-slate-700/60 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
            />
          </div>
        )}
        {actions}
      </div>
    </div>
  );
};
