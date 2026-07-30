import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Bell, Sparkles } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useNotificationStore } from '../../store/notificationStore';
import { RoleSwitcher } from './RoleSwitcher';
import { CommandPaletteModal } from './CommandPaletteModal';

export const Topbar: React.FC = () => {
  const { user } = useAuthStore();
  const { unreadCount, setIsOpen } = useNotificationStore();
  const [isCommandOpen, setIsCommandOpen] = useState(false);

  return (
    <motion.header
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="h-20 px-6 sm:px-8 border-b border-white/10 bg-[#0B0E14]/80 backdrop-blur-xl flex items-center justify-between sticky top-0 z-20 select-none"
    >
      {/* Greeting Banner */}
      <div>
        <h2 className="text-lg font-black text-white tracking-tight flex items-center gap-2">
          <span>Hello, {user.name.split(' ')[0]}</span>
          <span className="inline-block animate-bounce">👋</span>
        </h2>
        <p className="text-xs text-slate-400 font-medium hidden sm:block">
          Here's what's happening with your tours & operations today.
        </p>
      </div>

      {/* Action Controls */}
      <div className="flex items-center gap-3">
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
          className="relative p-2.5 rounded-2xl bg-[#111621] border border-white/10 text-slate-300 hover:text-white transition-all shadow-md cursor-pointer"
          title={`${unreadCount} Unread Notifications`}
        >
          <Bell className="w-4.5 h-4.5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#EF4444] text-white text-[9px] font-black flex items-center justify-center border-2 border-[#0B0E14] shadow-sm animate-pulse">
              {unreadCount}
            </span>
          )}
        </motion.button>

        {/* Command Palette Modal */}
        <CommandPaletteModal isOpen={isCommandOpen} onClose={() => setIsCommandOpen(false)} />

        {/* User Profile Thumbnail */}
        <div className="flex items-center gap-2.5 pl-2 border-l border-white/10">
          <img
            src={user.avatarUrl}
            alt={user.name}
            className="w-10 h-10 rounded-full object-cover border border-white/15 shadow-md"
          />
          <div className="hidden lg:block text-left">
            <div className="text-xs font-extrabold text-white leading-tight">{user.name}</div>
            <div className="text-[10px] text-slate-400 font-medium">{user.role.replace('_', ' ')}</div>
          </div>
        </div>
      </div>
    </motion.header>
  );
};
