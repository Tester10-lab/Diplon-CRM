import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserRole } from '../../types/erp';
import { useAuthStore } from '../../store/authStore';
import { ShieldCheck, ChevronDown, Check } from 'lucide-react';

const roles: { key: UserRole; label: string; description: string }[] = [
  { key: 'SUPER_ADMIN', label: 'Super Admin', description: 'Full system executive access' },
  { key: 'ADMIN', label: 'Branch Admin', description: 'Leads, Inquiries, Bookings & Sales' },
  { key: 'AGENCY', label: 'B2B Agency', description: 'B2B Tariff & Commission Ledger' },
  { key: 'DRIVER', label: 'Scorpio Driver', description: 'Trips, Dispatches & Fuel Settlements' },
];

export const RoleSwitcher: React.FC = () => {
  const { user, switchRole } = useAuthStore();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentRoleObj = roles.find(r => r.key === user.role) || roles[0];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3.5 py-2.5 rounded-2xl text-xs font-black bg-neutral-900 hover:bg-neutral-800 border border-white/15 transition-all text-white shadow-md cursor-pointer backdrop-blur-md"
        title="Switch Role Context"
      >
        <ShieldCheck className="w-4 h-4 text-white" />
        <span>{currentRoleObj.label}</span>
        <ChevronDown className="w-3.5 h-3.5 text-neutral-400 opacity-80" />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 8 }}
            transition={{ type: 'spring', stiffness: 400, damping: 28 }}
            className="absolute right-0 mt-2 w-64 rounded-3xl bg-neutral-950 border border-white/15 shadow-2xl p-2.5 z-50 backdrop-blur-2xl"
          >
            <div className="px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-wider text-neutral-400">
              Switch Dashboard Role
            </div>
            <div className="flex flex-col gap-1 mt-1">
              {roles.map(r => (
                <button
                  key={r.key}
                  onClick={() => {
                    switchRole(r.key);
                    setIsOpen(false);
                  }}
                  className={`flex items-start justify-between p-2.5 rounded-2xl text-left transition-all ${
                    user.role === r.key
                      ? 'bg-white text-black font-extrabold shadow-sm'
                      : 'hover:bg-white/10 text-neutral-300 font-medium'
                  }`}
                >
                  <div>
                    <div className="text-xs font-bold">{r.label}</div>
                    <div className={`text-[11px] font-normal ${user.role === r.key ? 'text-neutral-700' : 'text-neutral-400'}`}>{r.description}</div>
                  </div>
                  {user.role === r.key && <Check className="w-4 h-4 text-black mt-0.5" />}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
