import React, { useState, useRef, useEffect } from 'react';
import { Search, Plus, Check, ChevronDown, Compass, Sparkles } from 'lucide-react';
import { TourPackage } from '../../types';

export interface PackageSelectProps {
  packages: TourPackage[];
  value: string;
  onChange: (packageName: string, pkg?: TourPackage) => void;
  onCreatePackage?: (name: string) => Promise<TourPackage | void> | void;
  placeholder?: string;
  disabled?: boolean;
}

export const PackageSelect: React.FC<PackageSelectProps> = ({
  packages,
  value,
  onChange,
  onCreatePackage,
  placeholder = 'Search or type new package name...',
  disabled = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState(value || '');
  const [isCreating, setIsCreating] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setQuery(value || '');
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredPackages = packages.filter(pkg =>
    pkg.name.toLowerCase().includes(query.toLowerCase())
  );

  const exactMatch = packages.find(
    pkg => pkg.name.toLowerCase() === query.trim().toLowerCase()
  );

  const handleSelectPackage = (pkg: TourPackage) => {
    setQuery(pkg.name);
    onChange(pkg.name, pkg);
    setIsOpen(false);
  };

  const handleCreateNew = async () => {
    if (!query.trim()) return;
    setIsCreating(true);
    try {
      if (onCreatePackage) {
        const created = await onCreatePackage(query.trim());
        if (created) {
          onChange(created.name, created);
        } else {
          onChange(query.trim());
        }
      } else {
        onChange(query.trim());
      }
      setIsOpen(false);
    } catch (e) {
      console.error('Error creating package:', e);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div ref={containerRef} className="relative w-full">
      <div className="relative flex items-center">
        <Compass className="absolute left-3 w-4 h-4 text-indigo-500 pointer-events-none" />
        <input
          type="text"
          disabled={disabled}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            onChange(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          className="w-full pl-9 pr-9 py-2.5 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500/60 transition-all font-medium"
        />
        <ChevronDown className={`absolute right-3 w-4 h-4 text-slate-400 pointer-events-none transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </div>

      {/* Dropdown Options */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-1.5 z-50 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl overflow-hidden max-h-64 overflow-y-auto animate-fade-in divide-y divide-slate-100 dark:divide-slate-800/60">
          
          {/* Create New Package Action Option */}
          {query.trim() && !exactMatch && (
            <button
              type="button"
              disabled={isCreating}
              onClick={handleCreateNew}
              className="w-full text-left px-3.5 py-2.5 bg-indigo-50/70 dark:bg-indigo-950/40 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 text-xs font-semibold flex items-center gap-2 transition-colors border-b border-indigo-100 dark:border-indigo-900/40 group"
            >
              <div className="p-1 rounded-md bg-indigo-600 text-white shrink-0 group-hover:scale-105 transition-transform">
                <Plus className="w-3.5 h-3.5" />
              </div>
              <div className="flex-1 truncate">
                <span>Create new package: </span>
                <span className="font-bold underline">{query.trim()}</span>
              </div>
              <span className="text-[10px] bg-indigo-200/80 dark:bg-indigo-800/80 px-2 py-0.5 rounded-full font-bold">Auto-Create</span>
            </button>
          )}

          {/* List of matching existing packages */}
          {filteredPackages.length > 0 ? (
            filteredPackages.map((pkg) => {
              const isSelected = value === pkg.name;
              return (
                <button
                  key={pkg._id}
                  type="button"
                  onClick={() => handleSelectPackage(pkg)}
                  className={`w-full text-left px-3.5 py-2.5 flex items-center justify-between text-xs transition-colors ${
                    isSelected
                      ? 'bg-indigo-50 dark:bg-indigo-950/30 text-indigo-900 dark:text-indigo-200 font-bold'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-200'
                  }`}
                >
                  <div className="flex flex-col gap-0.5 truncate pr-2">
                    <span className="font-semibold text-slate-900 dark:text-slate-100 truncate">
                      {pkg.name}
                    </span>
                    {pkg.category && (
                      <span className="text-[10px] text-slate-400">
                        {pkg.category} {pkg.durationDays ? `• ${pkg.durationDays} Days` : ''}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {pkg.basePricing > 0 && (
                      <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 font-mono bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-900/50">
                        NPR {pkg.basePricing.toLocaleString()}
                      </span>
                    )}
                    {isSelected && <Check className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />}
                  </div>
                </button>
              );
            })
          ) : !query.trim() ? (
            <div className="px-4 py-3 text-xs text-slate-400 text-center">
              Type to search or add a custom tour package
            </div>
          ) : exactMatch ? null : (
            <div className="px-4 py-2 text-[11px] text-slate-400 text-center italic">
              No other matching packages found
            </div>
          )}
        </div>
      )}
    </div>
  );
};
