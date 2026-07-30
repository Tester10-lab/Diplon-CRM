import React, { useState, useEffect } from 'react';
import { Search, Command, X, User, FileText, Truck, Compass, DollarSign, Calendar, PlusCircle } from 'lucide-react';
import { useCommandStore } from '../../store/commandStore';
import { openBookingModal, openAddPackageModal, openAddTourModal, openCreateUserModal, openCreateBranchModal } from '../../store/modalStore';

interface SearchResult {
  id: string;
  category: 'Customer' | 'Booking' | 'Vehicle' | 'Driver' | 'Tour' | 'Invoice' | 'Action';
  title: string;
  subtitle: string;
  action: () => void;
}

export const CommandPalette: React.FC<{ onNavigate: (path: string) => void }> = ({ onNavigate }) => {
  const { isOpen, close } = useCommandStore();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [query, setQuery] = useState('');

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const mockItems: SearchResult[] = [
    // Entities
    { id: '1', category: 'Customer', title: 'Ram Shrestha', subtitle: 'ram.m5@example.com • 3 Bookings', action: () => { onNavigate('/customers'); close(); } },
    { id: '2', category: 'Booking', title: 'BK-9021 (Everest Base Camp Trek)', subtitle: 'Customer: Sita Karki • Status: CONFIRMED', action: () => { onNavigate('/bookings'); close(); } },
    { id: '3', category: 'Vehicle', title: 'Tourist Bus BA-2-PA-1234', subtitle: 'Capacity: 35 seats • Status: Active', action: () => { onNavigate('/fleet'); close(); } },
    { id: '4', category: 'Driver', title: 'Babu Driver', subtitle: 'License: LIC-998877 • Rating: 4.8★', action: () => { onNavigate('/drivers'); close(); } },
    { id: '5', category: 'Tour', title: 'DEP-8842 (Annapurna Circuit)', subtitle: 'Start: Oct 1, 2026 • 12 Travelers Boarded', action: () => { onNavigate('/operations'); close(); } },
    { id: '6', category: 'Invoice', title: 'INV-10924 (NPR 300,000)', subtitle: 'Customer: Ram Shrestha • Status: PAID', action: () => { onNavigate('/finance'); close(); } },


    // Quick Actions
    { id: 'act_1', category: 'Action', title: '+ Create Tour / Booking', subtitle: 'Open booking confirmation pop-up & autoselect package', action: () => { openBookingModal(); close(); } },
    { id: 'act_2', category: 'Action', title: '+ Add Tour Package', subtitle: 'Create new tour package in catalog', action: () => { openAddPackageModal(); close(); } },
    { id: 'act_3', category: 'Action', title: '+ Schedule Tour Departure', subtitle: 'Dispatch vehicle, driver & guide roster', action: () => { openAddTourModal(); close(); } },
    { id: 'act_4', category: 'Action', title: '+ Create User Account', subtitle: 'Add new staff member with permissions', action: () => { openCreateUserModal(); close(); } },
    { id: 'act_5', category: 'Action', title: '+ Create Branch / Partner', subtitle: 'Register B2B partner account or new location', action: () => { openCreateBranchModal(); close(); } },
  ];

  const filteredItems = mockItems.filter(item =>
    item.title.toLowerCase().includes(query.toLowerCase()) ||
    item.subtitle.toLowerCase().includes(query.toLowerCase()) ||
    item.category.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => Math.min(prev + 1, filteredItems.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter' && filteredItems.length > 0) {
      e.preventDefault();
      filteredItems[selectedIndex].action();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      close();
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Customer': return <User className="w-4 h-4 text-blue-500" />;
      case 'Booking': return <FileText className="w-4 h-4 text-indigo-500" />;
      case 'Vehicle': return <Truck className="w-4 h-4 text-amber-500" />;
      case 'Driver': return <User className="w-4 h-4 text-emerald-500" />;
      case 'Tour': return <Compass className="w-4 h-4 text-purple-500" />;
      case 'Invoice': return <DollarSign className="w-4 h-4 text-emerald-500" />;
      default: return <PlusCircle className="w-4 h-4 text-indigo-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm animate-fade-in"
        onClick={close}
      />

      {/* Palette Container */}
      <div className="relative w-full max-w-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden z-10 animate-fade-in">
        {/* Search Header */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center gap-3">
          <Search className="w-5 h-5 text-indigo-500 shrink-0" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a command or search customers, bookings, vehicles, tours..."
            className="w-full bg-transparent text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 text-sm focus:outline-none"
          />
          <button onClick={close} className="text-slate-400 hover:text-slate-200 p-1">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-96 overflow-y-auto p-2 space-y-1">
          {filteredItems.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs font-medium">
              No matching records or actions found for "{query}".
            </div>
          ) : (
            filteredItems.map((item, index) => (
              <button
                key={item.id}
                onClick={item.action}
                onMouseEnter={() => setSelectedIndex(index)}
                className={`w-full flex items-center justify-between p-3 rounded-xl transition-all text-left group ${
                  index === selectedIndex
                    ? 'bg-slate-100 dark:bg-slate-800/70'
                    : 'hover:bg-slate-100 dark:hover:bg-slate-800/70'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg transition-transform ${
                    index === selectedIndex ? 'bg-white dark:bg-slate-700 scale-105' : 'bg-slate-100 dark:bg-slate-800/80 group-hover:scale-105'
                  }`}>
                    {getCategoryIcon(item.category)}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                      <span>{item.title}</span>
                      <span className="px-1.5 py-0.5 text-[9px] font-semibold rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                        {item.category}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">{item.subtitle}</div>
                  </div>
                </div>
              </button>
            ))
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="px-4 py-2 bg-slate-50 dark:bg-slate-950/60 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
          <div className="flex items-center gap-2">
            <span>Navigation:</span>
            <kbd className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 font-mono text-[10px]">↑↓ Navigate</kbd>
            <kbd className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 font-mono text-[10px]">↵ Select</kbd>
          </div>
          <div className="flex items-center gap-1">
            <Command className="w-3 h-3" />
            <span>Diplon Search</span>
          </div>
        </div>
      </div>
    </div>
  );
};
