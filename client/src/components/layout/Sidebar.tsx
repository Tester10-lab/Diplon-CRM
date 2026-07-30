import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Users,
  UserCheck,
  HelpCircle,
  FileText,
  Calendar,
  Compass,
  CreditCard,
  Package,
  BarChart3,
  Building2,
  UserCog,
  Settings,
  BookOpen,
  LogOut,
  ChevronRight,
  ChevronLeft,
  Truck,
  UserSquare2,
  ShieldAlert,
  MessageSquare,
  Car,
  Sparkles
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

export interface SidebarProps {
  currentPath: string;
  onNavigate: (path: string) => void;
  onLogout?: () => void;
}

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  path: string;
  badge?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentPath, onNavigate, onLogout }) => {
  const { user, logout } = useAuthStore();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const isDriver = user.role === 'DRIVER';
  const isAgency = user.role === 'AGENCY';

  let navItems: NavItem[] = [];

  if (isDriver) {
    navItems = [
      { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4.5 h-4.5" />, path: '/' },
      { id: 'customers', label: 'Assigned Passengers', icon: <Users className="w-4.5 h-4.5" />, path: '/customers' },
      { id: 'operations', label: 'Assigned Tours', icon: <Compass className="w-4.5 h-4.5" />, path: '/operations' },
      { id: 'finance', label: 'Trip Finance', icon: <CreditCard className="w-4.5 h-4.5" />, path: '/finance' },
    ];
  } else if (isAgency) {
    navItems = [
      { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4.5 h-4.5" />, path: '/' },
      { id: 'calendar', label: 'Calendar', icon: <Calendar className="w-4.5 h-4.5" />, path: '/calendar' },
      { id: 'bookings', label: 'Bookings', icon: <FileText className="w-4.5 h-4.5" />, path: '/bookings' },
      { id: 'customers', label: 'Customers', icon: <Users className="w-4.5 h-4.5" />, path: '/customers' },
      { id: 'packages', label: 'Packages', icon: <Package className="w-4.5 h-4.5" />, path: '/packages' },
      { id: 'fleet', label: 'Vehicles', icon: <Car className="w-4.5 h-4.5" />, path: '/fleet' },
      { id: 'drivers', label: 'Drivers', icon: <UserSquare2 className="w-4.5 h-4.5" />, path: '/drivers' },
      { id: 'finance', label: 'Finance', icon: <CreditCard className="w-4.5 h-4.5" />, path: '/finance' },
      { id: 'reports', label: 'Reports', icon: <BarChart3 className="w-4.5 h-4.5" />, path: '/reports' },
    ];
  } else {
    navItems = [
      { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4.5 h-4.5" />, path: '/' },
      { id: 'calendar', label: 'Calendar', icon: <Calendar className="w-4.5 h-4.5" />, path: '/calendar' },
      { id: 'bookings', label: 'Bookings', icon: <FileText className="w-4.5 h-4.5" />, path: '/bookings' },
      { id: 'customers', label: 'Customers', icon: <Users className="w-4.5 h-4.5" />, path: '/customers' },
      { id: 'packages', label: 'Packages', icon: <Package className="w-4.5 h-4.5" />, path: '/packages' },
      { id: 'fleet', label: 'Vehicles', icon: <Car className="w-4.5 h-4.5" />, path: '/fleet' },
      { id: 'drivers', label: 'Drivers', icon: <UserSquare2 className="w-4.5 h-4.5" />, path: '/drivers' },
      { id: 'operations', label: 'Operations', icon: <Compass className="w-4.5 h-4.5" />, path: '/operations' },
      { id: 'finance', label: 'Finance', icon: <CreditCard className="w-4.5 h-4.5" />, path: '/finance' },
      { id: 'reports', label: 'Reports', icon: <BarChart3 className="w-4.5 h-4.5" />, path: '/reports' },
      { id: 'settings', label: 'Settings', icon: <Settings className="w-4.5 h-4.5" />, path: '/settings' },
    ];
  }

  return (
    <motion.aside
      initial={false}
      animate={{ width: isCollapsed ? 80 : 256 }}
      transition={{ type: 'spring', stiffness: 350, damping: 30 }}
      className="shrink-0 bg-[#0B0E14] border-r border-white/10 flex flex-col justify-between h-screen sticky top-0 z-30 select-none text-slate-300 backdrop-blur-xl"
    >
      <div>
        {/* Logo & Expand/Collapse Controls */}
        <div className="h-20 px-5 flex items-center justify-between border-b border-white/10">
          <div className="flex items-center gap-3 cursor-pointer overflow-hidden" onClick={() => onNavigate('/')}>
            <motion.div
              whileHover={{ rotate: 5, scale: 1.05 }}
              className="w-10 h-10 rounded-2xl bg-[#C8FF2D] text-[#0B0E14] flex items-center justify-center font-black text-xl shadow-lg shadow-[#C8FF2D]/20 shrink-0"
            >
              P
            </motion.div>
            {!isCollapsed && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <div className="font-extrabold text-base text-white tracking-tight leading-none">Diplon</div>
                <div className="text-[11px] text-slate-400 font-medium mt-1">Travel ERP</div>
              </motion.div>
            )}
          </div>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="w-8 h-8 rounded-full bg-[#111621] border border-white/10 text-slate-400 hover:text-white flex items-center justify-center transition-all shadow-md shrink-0"
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </motion.button>
        </div>

        {/* Animated Navigation Items */}
        <div className="p-3 space-y-1.5 overflow-y-auto max-h-[calc(100vh-210px)]">
          {navItems.map(item => {
            const isActive = currentPath === item.path;
            return (
              <motion.button
                key={item.id}
                onClick={() => onNavigate(item.path)}
                whileHover={{ x: 2 }}
                whileTap={{ scale: 0.98 }}
                className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl text-xs font-bold transition-all duration-200 relative group ${
                  isActive
                    ? 'bg-[#C8FF2D] text-[#0B0E14] shadow-lg shadow-[#C8FF2D]/20 font-black'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-white/5'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={isActive ? 'text-[#0B0E14]' : 'text-slate-400 group-hover:text-slate-200'}>
                    {item.icon}
                  </span>
                  {!isCollapsed && <span className="truncate">{item.label}</span>}
                </div>

                {!isCollapsed && isActive && (
                  <motion.div layoutId="activeIndicator">
                    <ChevronRight className="w-4 h-4 text-[#0B0E14]" />
                  </motion.div>
                )}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* User Profile Card */}
      <div className="p-3 border-t border-white/10 bg-[#0B0E14]">
        <div className="p-2.5 rounded-2xl bg-[#111621] border border-white/10 flex items-center justify-between overflow-hidden">
          <div className="flex items-center gap-3 overflow-hidden">
            <img src={user.avatarUrl} alt={user.name} className="w-9 h-9 rounded-full object-cover border border-white/10 shrink-0 shadow-md" />
            {!isCollapsed && (
              <div className="overflow-hidden">
                <div className="text-xs font-extrabold text-white truncate">{user.name.split(' (')[0]}</div>
                <div className="text-[10px] text-slate-400 font-medium truncate">All Branches</div>
              </div>
            )}
          </div>

          <button
            onClick={() => { logout(); if (onLogout) onLogout(); }}
            className="text-slate-400 hover:text-rose-400 p-1.5 rounded-xl hover:bg-white/10 transition-all shrink-0"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.aside>
  );
};
