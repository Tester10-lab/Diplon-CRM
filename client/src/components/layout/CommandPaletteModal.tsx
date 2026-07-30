import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Calendar, Compass, FileText, Users, CreditCard, Package, Car, UserSquare2, ArrowRight, X } from 'lucide-react';

export interface CommandPaletteModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CommandPaletteModal: React.FC<CommandPaletteModalProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else setQuery('');
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const quickLinks = [
    { title: 'Dashboard Control Center', path: '/', category: 'Navigation', icon: <Compass className="w-4 h-4 text-[#C8FF2D]" /> },
    { title: 'Calendar & Resource Scheduler', path: '/calendar', category: 'Navigation', icon: <Calendar className="w-4 h-4 text-amber-400" /> },
    { title: 'Bookings & Reservations', path: '/bookings', category: 'Navigation', icon: <FileText className="w-4 h-4 text-sky-400" /> },
    { title: 'Customer Directory', path: '/customers', category: 'Navigation', icon: <Users className="w-4 h-4 text-emerald-400" /> },
    { title: 'Operations Tour Departures', path: '/operations', category: 'Navigation', icon: <Compass className="w-4 h-4 text-[#6366F1]" /> },
    { title: 'Fleet & Vehicles', path: '/fleet', category: 'Navigation', icon: <Car className="w-4 h-4 text-rose-400" /> },
    { title: 'Driver Master Directory', path: '/drivers', category: 'Navigation', icon: <UserSquare2 className="w-4 h-4 text-[#C8FF2D]" /> },
    { title: 'Trip Finance & Collections', path: '/finance', category: 'Navigation', icon: <CreditCard className="w-4 h-4 text-purple-400" /> },
  ];

  const filteredLinks = query.trim() === ''
    ? quickLinks
    : quickLinks.filter(l => l.title.toLowerCase().includes(query.toLowerCase()));

  const handleNavigate = (path: string) => {
    onClose();
    window.location.hash = path;
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 select-none">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-[#0B0E14]/85 backdrop-blur-xl cursor-pointer"
          onClick={onClose}
        />

        {/* Command Box */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: -10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -10 }}
          transition={{ type: 'spring', stiffness: 400, damping: 28 }}
          className="relative w-full max-w-xl bg-[#111621] border border-white/10 rounded-3xl shadow-2xl overflow-hidden z-10 backdrop-blur-2xl"
        >
          {/* Search Input Bar */}
          <div className="p-4 border-b border-white/10 flex items-center gap-3">
            <Search className="w-5 h-5 text-[#C8FF2D] shrink-0" />
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search ERP modules, departures, customers, bookings..."
              autoFocus
              className="w-full bg-transparent text-white placeholder-slate-400 text-sm font-semibold focus:outline-none"
            />
            <kbd className="px-2 py-0.5 text-[10px] font-mono text-slate-400 bg-white/5 border border-white/10 rounded-md shrink-0">
              ESC
            </kbd>
          </div>

          {/* Search Results */}
          <div className="p-3 space-y-1.5 max-h-80 overflow-y-auto">
            <div className="px-3 py-1 text-[10px] font-extrabold uppercase text-[#C8FF2D] tracking-wider">
              Quick ERP Navigation
            </div>
            {filteredLinks.length === 0 ? (
              <div className="p-6 text-center text-slate-400 text-xs">
                No matching pages found for "{query}".
              </div>
            ) : (
              filteredLinks.map((link, idx) => (
                <motion.div
                  key={idx}
                  whileHover={{ scale: 1.01, backgroundColor: 'rgba(255, 255, 255, 0.05)' }}
                  onClick={() => handleNavigate(link.path)}
                  className="p-3 rounded-2xl border border-white/5 hover:border-white/10 flex items-center justify-between cursor-pointer transition-all text-xs"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-white/5 border border-white/10 shrink-0">
                      {link.icon}
                    </div>
                    <span className="font-bold text-white">{link.title}</span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-white" />
                </motion.div>
              ))
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
