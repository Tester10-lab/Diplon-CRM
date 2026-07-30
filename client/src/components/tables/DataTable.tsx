import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ArrowUpDown, ChevronLeft, ChevronRight, Download, SlidersHorizontal } from 'lucide-react';
import { Button } from '../ui/Button';

export interface Column<T> {
  key: string;
  header: string;
  accessor: (item: T) => React.ReactNode;
  sortable?: boolean;
  searchValue?: (item: T) => string;
}

export interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  searchPlaceholder?: string;
  title?: string;
  description?: string;
  onRowClick?: (item: T) => void;
  actions?: React.ReactNode;
}

export function DataTable<T extends { _id?: string; id?: string }>({
  data,
  columns,
  searchPlaceholder = 'Search records...',
  title,
  description,
  onRowClick,
  actions
}: DataTableProps<T>) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [visibleColumns, setVisibleColumns] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    columns.forEach(c => { initial[c.key] = true; });
    return initial;
  });
  const [showColMenu, setShowColMenu] = useState(false);

  // Filter Data
  const filteredData = useMemo(() => {
    if (!searchTerm.trim()) return data;
    const term = searchTerm.toLowerCase();
    return data.filter(item => {
      return columns.some(col => {
        if (col.searchValue) {
          return col.searchValue(item).toLowerCase().includes(term);
        }
        const val = (item as any)[col.key];
        return val ? String(val).toLowerCase().includes(term) : false;
      });
    });
  }, [data, columns, searchTerm]);

  // Sort Data
  const sortedData = useMemo(() => {
    if (!sortKey) return filteredData;
    const col = columns.find(c => c.key === sortKey);
    if (!col) return filteredData;

    return [...filteredData].sort((a, b) => {
      const valA = col.searchValue ? col.searchValue(a) : (a as any)[sortKey];
      const valB = col.searchValue ? col.searchValue(b) : (b as any)[sortKey];

      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredData, sortKey, sortOrder, columns]);

  // Paginate Data
  const totalPages = Math.ceil(sortedData.length / pageSize) || 1;
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedData.slice(start, start + pageSize);
  }, [sortedData, currentPage, pageSize]);

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortOrder('asc');
    }
  };

  const exportCSV = () => {
    if (data.length === 0) return;
    const headers = columns.filter(c => visibleColumns[c.key]).map(c => c.header).join(',');
    const rows = sortedData.map(item =>
      columns
        .filter(c => visibleColumns[c.key])
        .map(c => {
          const val = c.searchValue ? c.searchValue(item) : (item as any)[c.key];
          return `"${String(val || '').replace(/"/g, '""')}"`;
        })
        .join(',')
    );

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${title || 'export'}_data.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="w-full space-y-4">
      {/* Header Controls Card */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-3xl bg-[#111621] border border-white/10 shadow-xl backdrop-blur-xl">
        <div>
          {title && <h3 className="text-base font-black text-white tracking-tight">{title}</h3>}
          {description && <p className="text-xs text-slate-400 font-medium mt-0.5">{description}</p>}
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
          {/* Search Box */}
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 absolute left-3.5 top-2.5 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              placeholder={searchPlaceholder}
              className="w-full bg-[#0B0E14] text-white placeholder-slate-400 text-xs rounded-2xl pl-10 pr-3.5 py-2.5 border border-white/10 focus:outline-none focus:border-[#C8FF2D] transition-all shadow-inner"
            />
          </div>

          {/* Column Menu Button */}
          <div className="relative">
            <Button variant="secondary" size="sm" onClick={() => setShowColMenu(!showColMenu)} icon={<SlidersHorizontal className="w-3.5 h-3.5 text-[#C8FF2D]" />}>
              Columns
            </Button>
            <AnimatePresence>
              {showColMenu && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 6 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 6 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 mt-2 w-48 rounded-2xl bg-[#111621] border border-white/10 shadow-2xl p-2.5 z-30 backdrop-blur-xl"
                >
                  <div className="text-[10px] font-extrabold uppercase text-[#C8FF2D] px-2 py-1">Toggle Columns</div>
                  {columns.map(c => (
                    <label key={c.key} className="flex items-center gap-2 px-2 py-1.5 rounded-xl hover:bg-white/5 text-xs font-semibold text-slate-200 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={visibleColumns[c.key]}
                        onChange={e => setVisibleColumns(prev => ({ ...prev, [c.key]: e.target.checked }))}
                        className="rounded text-[#C8FF2D] focus:ring-[#C8FF2D]"
                      />
                      <span>{c.header}</span>
                    </label>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Export CSV */}
          <Button variant="outline" size="sm" onClick={exportCSV} icon={<Download className="w-3.5 h-3.5 text-[#C8FF2D]" />}>
            Export
          </Button>

          {actions}
        </div>
      </div>

      {/* Table Container */}
      <div className="w-full overflow-x-auto rounded-3xl bg-[#111621] border border-white/10 shadow-2xl backdrop-blur-xl">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/10 bg-[#0B0E14]/80 text-[10px] font-extrabold uppercase tracking-wider text-slate-400 select-none">
              {columns.filter(c => visibleColumns[c.key]).map(c => (
                <th
                  key={c.key}
                  onClick={() => c.sortable !== false && handleSort(c.key)}
                  className={`p-4 ${c.sortable !== false ? 'cursor-pointer hover:text-white transition-colors' : ''}`}
                >
                  <div className="flex items-center gap-1.5">
                    <span>{c.header}</span>
                    {c.sortable !== false && <ArrowUpDown className="w-3 h-3 opacity-60 text-[#C8FF2D]" />}
                  </div>
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-white/5 text-xs">
            {paginatedData.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="p-8 text-center text-slate-400 font-medium">
                  No records match your criteria.
                </td>
              </tr>
            ) : (
              paginatedData.map((item, idx) => (
                <motion.tr
                  key={item._id || item.id || idx}
                  onClick={() => onRowClick && onRowClick(item)}
                  whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.03)' }}
                  transition={{ duration: 0.15 }}
                  className={`transition-colors ${onRowClick ? 'cursor-pointer' : ''}`}
                >
                  {columns.filter(c => visibleColumns[c.key]).map(c => (
                    <td key={c.key} className="p-4 text-slate-200 font-semibold">
                      {c.accessor(item)}
                    </td>
                  ))}
                </motion.tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="flex items-center justify-between px-2 text-xs text-slate-400 font-medium">
        <div>
          Showing {sortedData.length > 0 ? (currentPage - 1) * pageSize + 1 : 0} to{' '}
          {Math.min(currentPage * pageSize, sortedData.length)} of {sortedData.length} records
        </div>

        <div className="flex items-center gap-2">
          <select
            value={pageSize}
            onChange={e => { setPageSize(Number(e.target.value)); setCurrentPage(1); }}
            className="bg-[#0B0E14] border border-white/10 rounded-xl px-2.5 py-1 text-xs text-slate-300 focus:outline-none focus:border-[#C8FF2D]"
          >
            <option value={5}>5 per page</option>
            <option value={10}>10 per page</option>
            <option value={20}>20 per page</option>
            <option value={50}>50 per page</option>
          </select>

          <Button
            variant="icon"
            size="sm"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>

          <span className="font-extrabold text-slate-200">
            Page {currentPage} of {totalPages}
          </span>

          <Button
            variant="icon"
            size="sm"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
