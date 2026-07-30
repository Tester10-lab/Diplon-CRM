import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Bell, Sparkles, LogOut, Menu, X } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useNotificationStore } from '../../store/notificationStore';
import { RoleSwitcher } from './RoleSwitcher';
import { CommandPaletteModal } from './CommandPaletteModal';

export interface TopbarProps {
  onLogout?: () => void;
  onToggleMobileMenu?: () => void;
  isMobileOpen?: boolean;
}

export const Topbar: React.FC<TopbarProps> = ({ onLogout, onToggleMobileMenu, isMobileOpen }) => {
  const { user, logout } = useAuthStore();
  const { unreadCount, setIsOpen } = useNotificationStore();
  const [isCommandOpen, setIsCommandOpen] = useState(false);

  if (!user) return null;

  const handleLogout = () => {
    logout();
    if (onLogout) onLogout();
  };

  return (
    <motion.header
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="h-16 sm:h-20 px-3 sm:px-8 border-b border-white/10 bg-[#0B0E14]/80 backdrop-blur-xl flex items-center justify-between sticky top-0 z-20 select-none"
    >
      {/* Left Greeting & Mobile Toggle */}
      <div className="flex items-center gap-2.5">
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={onToggleMobileMenu}
          className="md:hidden p-2 rounded-xl bg-[#111621] border border-white/10 text-slate-200 hover:text-white shrink-0"
          title="Toggle Navigation Menu"
        >
          {isMobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5 text-[#C8FF2D]" />}
        </motion.button>

        <div>
          <h2 className="text-sm sm:text-lg font-black text-white tracking-tight flex items-center gap-1.5">
            <span>Hello, {user.name.split(' ')[0]}</span>
            <span className="inline-block animate-bounce text-xs sm:text-base">👋</span>
          </h2>
          <p className="text-xs text-slate-400 font-medium hidden sm:block">
            Here's what's happening with your tours & operations today.
          </p>
        </div>
      </div>

      {/* Action Controls */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Command Search Bar Trigger */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          onClick={() => setIsCommandOpen(true)}
          className="relative hidden md:flex items-center cursor-pointer"
        >
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5" />
          <input
            type="text"
            placeholder="Search anything..."
            readOnly
            className="w-64 pl-10 pr-12 py-2 rounded-2xl bg-[#111621] border border-white/10 text-xs text-slate-200 placeholder-slate-400 cursor-pointer focus:border-[#C8FF2D] transition-all shadow-inner"
          />
          <kbd className="absolute right-3 px-1.5 py-0.5 text-[10px] font-mono text-slate-400 bg-white/5 border border-white/10 rounded-md">
            ⌘K
          </kbd>
        </motion.div>

        {/* Role Switcher Pill */}
        <RoleSwitcher />

        {/* Notifications Bell */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsOpen(true)}
          className="relative p-2 sm:p-2.5 rounded-xl sm:rounded-2xl bg-[#111621] border border-white/10 text-slate-300 hover:text-white transition-all shadow-md cursor-pointer"
          title={`${unreadCount} Unread Notifications`}
        >
          <Bell className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-[#EF4444] text-white text-[8px] sm:text-[9px] font-black flex items-center justify-center border-2 border-[#0B0E14] shadow-sm animate-pulse">
              {unreadCount}
            </span>
          )}
        </motion.button>

        {/* Command Palette Modal */}
        <CommandPaletteModal isOpen={isCommandOpen} onClose={() => setIsCommandOpen(false)} />

        {/* User Profile Thumbnail & Logout */}
        <div className="flex items-center gap-2 pl-1.5 sm:pl-2 border-l border-white/10">
          <img
            src={user.avatarUrl}
            alt={user.name}
            className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover border border-white/15 shadow-md"
          />
          <div className="hidden lg:block text-left">
            <div className="text-xs font-extrabold text-white leading-tight">{user.name}</div>
            <div className="text-[10px] text-slate-400 font-medium">{user.role.replace('_', ' ')}</div>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleLogout}
            className="p-1.5 sm:p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-400 hover:text-rose-300 transition-all text-xs font-bold flex items-center gap-1.5 cursor-pointer"
            title="Log Out of Account"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Log Out</span>
          </motion.button>
        </div>
      </div>
    </motion.header>
  );
};
