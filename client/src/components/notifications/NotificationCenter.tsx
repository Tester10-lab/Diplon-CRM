import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X, CheckCheck, Archive, DollarSign, Compass, Truck, ShieldCheck, UserCheck, Sparkles } from 'lucide-react';
import { useNotificationStore } from '../../store/notificationStore';
import { Button } from '../ui/Button';

export const NotificationCenter: React.FC = () => {
  const { notifications, isOpen, setIsOpen, markAsRead, markAllAsRead, archiveNotification } = useNotificationStore();
  const [activeCategory, setActiveCategory] = useState<string>('ALL');

  if (!isOpen) return null;

  const categories = ['ALL', 'PAYMENTS', 'TOURS', 'DISPATCH', 'FINANCE', 'APPROVALS', 'VEHICLES'];

  const filteredNotifications = activeCategory === 'ALL'
    ? notifications
    : notifications.filter(n => n.category === activeCategory);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'PAYMENTS': return <DollarSign className="w-4 h-4 text-[#C8FF2D]" />;
      case 'TOURS': return <Compass className="w-4 h-4 text-[#6366F1]" />;
      case 'DISPATCH': return <Truck className="w-4 h-4 text-amber-400" />;
      case 'APPROVALS': return <ShieldCheck className="w-4 h-4 text-purple-400" />;
      case 'VEHICLES': return <UserCheck className="w-4 h-4 text-[#10B981]" />;
      default: return <Bell className="w-4 h-4 text-sky-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden select-none">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-[#0B0E14]/80 backdrop-blur-md cursor-pointer"
        onClick={() => setIsOpen(false)}
      />

      {/* Slide-over Drawer */}
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', stiffness: 350, damping: 30 }}
          className="w-screen max-w-md bg-[#111621] border-l border-white/10 shadow-2xl flex flex-col justify-between backdrop-blur-2xl"
        >
          {/* Header */}
          <div>
            <div className="p-5 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-2xl bg-[#C8FF2D]/15 text-[#C8FF2D] border border-[#C8FF2D]/30">
                  <Bell className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-sm font-black text-white tracking-tight">Notification Center</h2>
                  <p className="text-xs text-slate-400 font-medium">Real-time system events & alerts</p>
                </div>
              </div>
              <Button variant="icon" size="sm" onClick={() => setIsOpen(false)}>
                <X className="w-4.5 h-4.5" />
              </Button>
            </div>

            {/* Category Filter Pills */}
            <div className="px-5 py-3 border-b border-white/10 flex items-center gap-1.5 overflow-x-auto scrollbar-none">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-2.5 py-1 rounded-xl text-[10px] font-black uppercase transition-all whitespace-nowrap ${
                    activeCategory === cat
                      ? 'bg-[#C8FF2D] text-[#0B0E14] shadow-md'
                      : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Actions Bar */}
            <div className="px-5 py-2.5 bg-[#0B0E14]/60 border-b border-white/10 flex items-center justify-between text-xs">
              <span className="text-slate-400 font-medium">{filteredNotifications.length} notifications</span>
              <button
                onClick={markAllAsRead}
                className="flex items-center gap-1 text-[#C8FF2D] hover:underline font-bold text-xs"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                Mark all read
              </button>
            </div>

            {/* Notification Items List */}
            <div className="p-4 space-y-2.5 overflow-y-auto max-h-[calc(100vh-210px)]">
              {filteredNotifications.length === 0 ? (
                <div className="p-10 text-center text-slate-400 text-xs font-medium">
                  No notifications in this category.
                </div>
              ) : (
                filteredNotifications.map(n => (
                  <motion.div
                    key={n.id}
                    onClick={() => markAsRead(n.id)}
                    whileHover={{ scale: 1.01 }}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer relative group ${
                      n.read
                        ? 'bg-[#0B0E14]/40 border-white/5 opacity-70'
                        : 'bg-[#111621] border-[#C8FF2D]/35 shadow-lg'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-xl bg-white/5 border border-white/10 shrink-0">
                        {getCategoryIcon(n.category)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <h4 className="text-xs font-black text-white truncate">{n.title}</h4>
                          <span className="text-[10px] text-slate-400 shrink-0 font-mono">{n.timestamp}</span>
                        </div>
                        <p className="text-xs text-slate-300 mt-1 leading-snug font-medium">{n.message}</p>
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        archiveNotification(n.id);
                      }}
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-400 transition-opacity"
                      title="Archive Notification"
                    >
                      <Archive className="w-3.5 h-3.5" />
                    </button>
                  </motion.div>
                ))
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
