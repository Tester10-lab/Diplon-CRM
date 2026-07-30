import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { openBookingModal, openAddTourModal } from '../../store/modalStore';
import { useDashboardMetrics } from '../../shared/hooks/useDashboardMetrics';
import { PageSkeleton } from '../feedback/Skeleton';
import { ErrorState } from '../feedback/ErrorState';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';

const NOTES_KEY = 'diplon_dashboard_notes';
const REMINDERS_KEY = 'diplon_dashboard_reminders';
import {
  Calendar as CalendarIcon,
  Compass,
  DollarSign,
  Users,
  Plus,
  ArrowUpRight,
  User,
  Clock,
  CheckCircle2,
  FileText,
  Ticket,
  Send,
  Building2,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Car,
  UserSquare2,
  StickyNote,
  Bell,
  Trash2,
  Pin,
  CheckSquare,
  Square,
  AlertCircle
} from 'lucide-react';

import { useAuthStore } from '../../store/authStore';
import { useBookings } from '../../shared/hooks/bookings/useBookings';
import { useCustomers } from '../../shared/hooks/customers/useCustomers';
import { useDepartures } from '../../shared/hooks/operations/useOperations';

export const SuperAdminDashboard: React.FC<{ onNavigate: (path: string) => void }> = ({ onNavigate }) => {
  const { user } = useAuthStore();
  const { metrics, isLoading, error, refetch } = useDashboardMetrics();
  const { data: bookingsData } = useBookings();
  const { data: customersData } = useCustomers();
  const { data: departuresData } = useDepartures();

  const totalBookingsCount = bookingsData ? bookingsData.length : 0;
  const activeToursCount = departuresData ? departuresData.filter(d => d.status === 'Active').length : 0;
  const totalRevenueAmount = bookingsData ? bookingsData.reduce((acc, b) => acc + (b.paidAmount || b.totalAmount || 0), 0) : 0;
  const totalCustomersCount = customersData ? customersData.length : 0;

  // Desktop Calendar State
  const [selectedDate, setSelectedDate] = useState<number>(28);
  const [activeModal, setActiveModal] = useState<'INQUIRY' | 'PAYMENT' | 'INVOICE' | 'TICKET' | 'DRIVER' | 'VEHICLE' | 'NOTE' | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Interactive Sticky Notes State
  const [notes, setNotes] = useState<{ id: string; text: string; color: string; time: string; pinned?: boolean }[]>(() => {
    try {
      const saved = localStorage.getItem(NOTES_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [
      { id: 'n1', text: 'Confirm Pokhara Scorpio fuel advance NPR 5,000', color: 'bg-amber-500/15 text-amber-300 border-amber-500/30', time: '10 mins ago', pinned: true },
      { id: 'n2', text: 'Muktinath 8 Pax hotel booking confirmation at Grand Hotel', color: 'bg-[#C8FF2D]/15 text-[#C8FF2D] border-[#C8FF2D]/35', time: '1 hour ago' },
      { id: 'n3', text: 'Collect driver license renewal copy from Babu Driver', color: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30', time: '2 hours ago' },
    ];
  });
  const [newNoteInput, setNewNoteInput] = useState('');

  // Operations Reminders State
  const [reminders, setReminders] = useState<{ id: string; text: string; due: string; completed: boolean }[]>(() => {
    try {
      const saved = localStorage.getItem(REMINDERS_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [
      { id: 'r1', text: 'Dispatch Halesi 28-seater Sofa Bus (25 Pax) at Shangri-la Hotel', due: '06:00 AM Aug 1', completed: false },
      { id: 'r2', text: 'Dispatch Jiri 6 Pax private vehicle at New Road Angan Sweets', due: '06:30 AM Aug 1', completed: false },
      { id: 'r3', text: 'Collect 34,400 Rs for Muktinath Tour (Lalitpur Holidays referral)', due: 'Oct 25', completed: false },
      { id: 'r4', text: 'Confirm Upper Mustang 7 Pax Jeep booking for Bishnu Prasad Kafle', due: 'Oct 28', completed: false }
    ];
  });

  useEffect(() => {
    try {
      localStorage.setItem(NOTES_KEY, JSON.stringify(notes));
    } catch (e) {}
  }, [notes]);

  useEffect(() => {
    try {
      localStorage.setItem(REMINDERS_KEY, JSON.stringify(reminders));
    } catch (e) {}
  }, [reminders]);

  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const handleAddNoteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteInput.trim()) return;
    const colors = [
      'bg-[#C8FF2D]/15 text-[#C8FF2D] border-[#C8FF2D]/35',
      'bg-amber-500/15 text-amber-300 border-amber-500/30',
      'bg-sky-500/15 text-sky-300 border-sky-500/30',
      'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
    ];
    const newNote = {
      id: `n_${Date.now()}`,
      text: newNoteInput.trim(),
      color: colors[Math.floor(Math.random() * colors.length)],
      time: 'Just now'
    };
    setNotes(prev => [newNote, ...prev]);
    setNewNoteInput('');
    setActiveModal(null);
    triggerToast('Sticky note added!');
  };

  const handleDeleteNote = (id: string) => {
    setNotes(prev => prev.filter(n => n.id !== id));
    triggerToast('Note deleted');
  };

  const toggleReminder = (id: string) => {
    setReminders(prev => prev.map(r => r.id === id ? { ...r, completed: !r.completed } : r));
  };

  if (isLoading) return <PageSkeleton />;
  if (error || !metrics) return <ErrorState message={error?.message || 'Failed to load metrics'} onRetry={refetch} />;

  // Days of month July 2026 (Starting Wednesday Jul 1, Today = Friday Jul 31, 2026)
  const calendarDays = [
    { day: 28, isPrev: true }, { day: 29, isPrev: true }, { day: 30, isPrev: true },
    { day: 1, isCurrent: true }, { day: 2, isCurrent: true }, { day: 3, isCurrent: true }, { day: 4, isCurrent: true },
    { day: 5, isCurrent: true }, { day: 6, isCurrent: true }, { day: 7, isCurrent: true }, { day: 8, isCurrent: true }, { day: 9, isCurrent: true }, { day: 10, isCurrent: true }, { day: 11, isCurrent: true },
    { day: 12, isCurrent: true }, { day: 13, isCurrent: true }, { day: 14, isCurrent: true }, { day: 15, isCurrent: true }, { day: 16, isCurrent: true }, { day: 17, isCurrent: true }, { day: 18, isCurrent: true },
    { day: 19, isCurrent: true }, { day: 20, isCurrent: true }, { day: 21, isCurrent: true }, { day: 22, isCurrent: true }, { day: 23, isCurrent: true }, { day: 24, isCurrent: true }, { day: 25, isCurrent: true },
    { day: 26, isCurrent: true }, { day: 27, isCurrent: true }, { day: 28, isCurrent: true }, { day: 29, isCurrent: true }, { day: 30, isCurrent: true }, { day: 31, isCurrent: true, isSelected: true },
    { day: 1, isNext: true }, { day: 2, isNext: true }, { day: 3, isNext: true }, { day: 4, isNext: true }, { day: 5, isNext: true }, { day: 6, isNext: true }, { day: 7, isNext: true }, { day: 8, isNext: true }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.08 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 350, damping: 25 } }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-6 select-none text-slate-100"
    >
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMsg && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            className="fixed top-24 right-8 z-50 bg-[#C8FF2D] text-[#0B0E14] px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 font-black text-xs border border-[#C8FF2D]"
          >
            <Sparkles className="w-4 h-4 text-[#0B0E14] animate-spin" />
            <span>{toastMsg}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 1. TOP ANIMATED KPI METRICS ROW (4 Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Bookings */}
        <motion.div
          variants={itemVariants}
          whileHover={{ y: -4, scale: 1.01 }}
          onClick={() => onNavigate('/bookings')}
          className="p-5 rounded-3xl bg-[#111621] border border-white/10 hover:border-[#C8FF2D]/50 transition-all duration-300 cursor-pointer shadow-xl group relative overflow-hidden backdrop-blur-xl"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400">Total Bookings</span>
            <div className="w-10 h-10 rounded-2xl bg-[#C8FF2D] text-[#0B0E14] flex items-center justify-center shadow-lg shadow-[#C8FF2D]/20 group-hover:scale-110 transition-transform">
              <CalendarIcon className="w-5 h-5 stroke-[2.5]" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-black text-white tracking-tight">{totalBookingsCount.toLocaleString()}</div>
            <div className="flex items-center gap-1 text-xs font-black text-[#C8FF2D] mt-1">
              <ArrowUpRight className="w-4 h-4" />
              <span>{totalBookingsCount > 0 ? '12.5%' : '0%'}</span>
              <span className="text-slate-400 font-normal">vs last month</span>
            </div>
          </div>
        </motion.div>

        {/* Active Tours */}
        <motion.div
          variants={itemVariants}
          whileHover={{ y: -4, scale: 1.01 }}
          onClick={() => onNavigate('/operations')}
          className="p-5 rounded-3xl bg-[#111621] border border-white/10 hover:border-[#C8FF2D]/50 transition-all duration-300 cursor-pointer shadow-xl group relative overflow-hidden backdrop-blur-xl"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400">Active Tours</span>
            <div className="w-10 h-10 rounded-2xl bg-[#C8FF2D] text-[#0B0E14] flex items-center justify-center shadow-lg shadow-[#C8FF2D]/20 group-hover:scale-110 transition-transform">
              <Compass className="w-5 h-5 stroke-[2.5]" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-black text-white tracking-tight">{activeToursCount}</div>
            <div className="flex items-center gap-1 text-xs font-black text-[#C8FF2D] mt-1">
              <ArrowUpRight className="w-4 h-4" />
              <span>{activeToursCount > 0 ? '8.2%' : '0%'}</span>
              <span className="text-slate-400 font-normal">vs last month</span>
            </div>
          </div>
        </motion.div>

        {/* Revenue */}
        <motion.div
          variants={itemVariants}
          whileHover={{ y: -4, scale: 1.01 }}
          onClick={() => onNavigate('/finance')}
          className="p-5 rounded-3xl bg-[#111621] border border-white/10 hover:border-[#C8FF2D]/50 transition-all duration-300 cursor-pointer shadow-xl group relative overflow-hidden backdrop-blur-xl"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400">Revenue</span>
            <div className="w-10 h-10 rounded-2xl bg-[#C8FF2D] text-[#0B0E14] flex items-center justify-center shadow-lg shadow-[#C8FF2D]/20 group-hover:scale-110 transition-transform">
              <DollarSign className="w-5 h-5 stroke-[2.5]" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-black text-white tracking-tight font-mono font-tabular-nums">
              {totalRevenueAmount > 0
                ? totalRevenueAmount >= 1000000
                  ? `NPR ${(totalRevenueAmount / 1000000).toFixed(2)}M`
                  : `NPR ${totalRevenueAmount.toLocaleString()}`
                : 'NPR 0'}
            </div>
            <div className="flex items-center gap-1 text-xs font-black text-[#C8FF2D] mt-1">
              <ArrowUpRight className="w-4 h-4" />
              <span>{totalRevenueAmount > 0 ? '15.3%' : '0%'}</span>
              <span className="text-slate-400 font-normal">vs last month</span>
            </div>
          </div>
        </motion.div>

        {/* Customers */}
        <motion.div
          variants={itemVariants}
          whileHover={{ y: -4, scale: 1.01 }}
          onClick={() => onNavigate('/customers')}
          className="p-5 rounded-3xl bg-[#111621] border border-white/10 hover:border-[#C8FF2D]/50 transition-all duration-300 cursor-pointer shadow-xl group relative overflow-hidden backdrop-blur-xl"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400">Customers</span>
            <div className="w-10 h-10 rounded-2xl bg-[#C8FF2D] text-[#0B0E14] flex items-center justify-center shadow-lg shadow-[#C8FF2D]/20 group-hover:scale-110 transition-transform">
              <Users className="w-5 h-5 stroke-[2.5]" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-black text-white tracking-tight">{totalCustomersCount.toLocaleString()}</div>
            <div className="flex items-center gap-1 text-xs font-black text-[#C8FF2D] mt-1">
              <ArrowUpRight className="w-4 h-4" />
              <span>{totalCustomersCount > 0 ? '10.1%' : '0%'}</span>
              <span className="text-slate-400 font-normal">vs last month</span>
            </div>
          </div>
        </motion.div>

      </div>

      {/* 2. MIDDLE CONTENT GRID (3 COLUMNS: STICKY NOTES, REMINDERS, DESKTOP CALENDAR) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Card: STICKY NOTES BOARD */}
        <motion.div variants={itemVariants} className="lg:col-span-4 rounded-3xl bg-[#111621] border border-white/10 p-6 flex flex-col justify-between space-y-4 shadow-xl hover:border-[#C8FF2D]/40 transition-all duration-300 backdrop-blur-xl">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center gap-2 text-xs font-black text-white">
              <StickyNote className="w-4 h-4 text-[#C8FF2D]" />
              <span>Sticky Notes</span>
            </div>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setActiveModal('NOTE')}
              icon={<Plus className="w-3.5 h-3.5 stroke-[3]" />}
            >
              Add Note
            </Button>
          </div>

          {/* Sticky Notes Grid */}
          <div className="space-y-3 overflow-y-auto max-h-[280px] pr-1">
            {notes.map(n => (
              <motion.div
                key={n.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                whileHover={{ scale: 1.01 }}
                className={`p-3.5 rounded-2xl border ${n.color} relative group transition-all duration-200`}
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="text-xs font-semibold leading-relaxed">{n.text}</p>
                  <div className="flex items-center gap-1 shrink-0 opacity-80 group-hover:opacity-100">
                    {n.pinned && <Pin className="w-3.5 h-3.5 text-[#C8FF2D] fill-[#C8FF2D]" />}
                    <button
                      onClick={() => handleDeleteNote(n.id)}
                      className="p-1 hover:text-rose-400 transition-colors"
                      title="Delete Note"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                <div className="mt-2 text-[10px] font-mono opacity-70 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>{n.time}</span>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="text-[11px] text-slate-400 text-center font-medium pt-1">
            💡 Click '+ Add Note' to pin operational memos to your dashboard
          </div>
        </motion.div>

        {/* Center Card: OPERATIONS REMINDERS */}
        <motion.div variants={itemVariants} className="lg:col-span-4 rounded-3xl bg-[#111621] border border-white/10 p-6 flex flex-col justify-between space-y-4 shadow-xl hover:border-[#C8FF2D]/40 transition-all duration-300 backdrop-blur-xl">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center gap-2 text-xs font-black text-white">
              <Bell className="w-4 h-4 text-amber-400" />
              <span>Operations Reminders</span>
            </div>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
              {reminders.filter(r => !r.completed).length} Pending
            </span>
          </div>

          {/* Reminders List */}
          <div className="space-y-2.5 overflow-y-auto max-h-[280px] pr-1">
            {reminders.map(r => (
              <motion.div
                key={r.id}
                onClick={() => toggleReminder(r.id)}
                whileHover={{ scale: 1.01 }}
                className={`p-3 rounded-2xl border transition-all duration-200 cursor-pointer flex items-center justify-between text-xs ${
                  r.completed
                    ? 'bg-[#0B0E14]/50 border-white/10 text-slate-500 line-through'
                    : 'bg-[#0B0E14] border-white/10 hover:border-amber-400/50 text-slate-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  {r.completed ? (
                    <CheckSquare className="w-4 h-4 text-emerald-400 shrink-0" />
                  ) : (
                    <Square className="w-4 h-4 text-slate-400 shrink-0" />
                  )}
                  <span className="font-semibold">{r.text}</span>
                </div>
                <span className="text-[10px] font-mono text-slate-400 shrink-0 ml-2">{r.due}</span>
              </motion.div>
            ))}
          </div>

          <div className="text-[11px] text-slate-400 text-center font-medium pt-1">
            ⚡ Click any reminder to mark as completed
          </div>
        </motion.div>

        {/* Right Card: DESKTOP MINI CALENDAR WIDGET */}
        <motion.div variants={itemVariants} className="lg:col-span-4 rounded-3xl bg-[#111621] border border-white/10 p-6 flex flex-col justify-between space-y-4 shadow-xl hover:border-[#C8FF2D]/40 transition-all duration-300 backdrop-blur-xl">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center gap-2">
              <CalendarIcon className="w-4 h-4 text-[#C8FF2D]" />
              <span className="text-xs font-black text-white">July 2026</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#C8FF2D]/15 text-[#C8FF2D] border border-[#C8FF2D]/35">
                Shrawan 2083 BS
              </span>
            </div>
            <div className="flex items-center gap-1">
              <button className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-white/10">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-white/10">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1 text-center text-xs">
            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
              <div key={d} className="text-[10px] font-bold text-slate-400 py-1">{d}</div>
            ))}
            {calendarDays.map((cd, idx) => (
              <button
                key={idx}
                onClick={() => cd.isCurrent && setSelectedDate(cd.day)}
                className={`py-1.5 rounded-xl text-xs font-bold transition-all relative ${
                  cd.isSelected
                    ? 'bg-[#C8FF2D] text-[#0B0E14] font-black shadow-lg shadow-[#C8FF2D]/30 scale-105'
                    : cd.isCurrent
                    ? selectedDate === cd.day
                      ? 'bg-white/15 text-white font-extrabold'
                      : 'text-slate-200 hover:bg-white/10'
                    : 'text-slate-600 cursor-not-allowed'
                }`}
              >
                {cd.day}
              </button>
            ))}
          </div>

          {/* Today's Selected Tour Departure Note */}
          <div className="p-3 rounded-2xl bg-[#0B0E14] border border-white/10 space-y-1">
            <div className="flex items-center justify-between text-[11px]">
              <span className="font-extrabold text-[#C8FF2D]">Departing Tomorrow (Aug 1)</span>
              <span className="text-[10px] text-emerald-400 font-bold font-mono">2 Tours Ready</span>
            </div>
            <div className="text-xs font-bold text-white truncate">Halesi 25 Pax Sofa Bus • Jiri 6 Pax Private</div>
          </div>

          <Button
            variant="primary"
            onClick={() => openAddTourModal()}
            className="w-full justify-center"
            icon={<Plus className="w-4 h-4 stroke-[3]" />}
          >
            + New Tour Departure
          </Button>
        </motion.div>

      </div>

      {/* 3. SMALL BOXES ROW (4 TOUR & CUSTOMER METRICS) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Today's Tour Box */}
        <motion.div
          variants={itemVariants}
          whileHover={{ y: -3 }}
          onClick={() => onNavigate('/operations')}
          className="p-4 rounded-3xl bg-[#111621] border border-white/10 hover:border-[#C8FF2D]/40 transition-all cursor-pointer shadow-lg flex items-center justify-between backdrop-blur-xl"
        >
          <div>
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Upcoming Departures</div>
            <div className="text-xl font-black text-white mt-1">2 Active Tours</div>
            <div className="text-[10px] text-[#C8FF2D] font-extrabold mt-0.5">Halesi (25 Pax) • Jiri (6 Pax)</div>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-[#C8FF2D]/15 text-[#C8FF2D] border border-[#C8FF2D]/30 flex items-center justify-center font-bold">
            <Compass className="w-5 h-5" />
          </div>
        </motion.div>

        {/* Tomorrow's Tour Box */}
        <motion.div
          variants={itemVariants}
          whileHover={{ y: -3 }}
          onClick={() => onNavigate('/calendar')}
          className="p-4 rounded-3xl bg-[#111621] border border-white/10 hover:border-amber-400/40 transition-all cursor-pointer shadow-lg flex items-center justify-between backdrop-blur-xl"
        >
          <div>
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Next Cycle (October)</div>
            <div className="text-xl font-black text-white mt-1">2 Scheduled</div>
            <div className="text-[10px] text-amber-300 font-extrabold mt-0.5">Muktinath (Oct 25) • Upper Mustang (Oct 28)</div>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-amber-500/15 text-amber-300 border border-amber-500/30 flex items-center justify-center font-bold">
            <CalendarIcon className="w-5 h-5" />
          </div>
        </motion.div>

        {/* This Week Customer Count Box */}
        <motion.div
          variants={itemVariants}
          whileHover={{ y: -3 }}
          onClick={() => onNavigate('/customers')}
          className="p-4 rounded-3xl bg-[#111621] border border-white/10 hover:border-[#6366F1]/40 transition-all cursor-pointer shadow-lg flex items-center justify-between backdrop-blur-xl"
        >
          <div>
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Active Guest Pax</div>
            <div className="text-xl font-black text-white mt-1">40 Passengers</div>
            <div className="text-[10px] text-[#818CF8] font-extrabold mt-0.5">4 Confirmed Active Bookings</div>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-[#6366F1]/15 text-[#818CF8] border border-[#6366F1]/30 flex items-center justify-center font-bold">
            <Users className="w-5 h-5" />
          </div>
        </motion.div>

        {/* Action Reminders Box */}
        <motion.div
          variants={itemVariants}
          whileHover={{ y: -3 }}
          onClick={() => triggerToast('Viewing pending active tour action reminders')}
          className="p-4 rounded-3xl bg-[#111621] border border-white/10 hover:border-emerald-400/40 transition-all cursor-pointer shadow-lg flex items-center justify-between backdrop-blur-xl"
        >
          <div>
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Action Reminders</div>
            <div className="text-xl font-black text-white mt-1">4 Reminders</div>
            <div className="text-[10px] text-emerald-300 font-extrabold mt-0.5">Halesi & Muktinath Collections</div>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 flex items-center justify-center font-bold">
            <Bell className="w-5 h-5" />
          </div>
        </motion.div>

      </div>

      {/* 4. UPCOMING TOUR DEPARTURES TABLE */}
      <motion.div variants={itemVariants} className="rounded-3xl bg-[#111621] border border-white/10 p-6 shadow-xl space-y-4 backdrop-blur-xl">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div>
            <h3 className="text-base font-black text-white tracking-tight flex items-center gap-2">
              <Compass className="w-5 h-5 text-[#C8FF2D]" />
              Upcoming Tour Departures & Live Status
            </h3>
            <p className="text-xs text-slate-400 font-medium mt-0.5">Real-time status of active departures, assigned drivers, and seating capacity</p>
          </div>
          <Button variant="secondary" size="sm" onClick={() => onNavigate('/operations')}>
            View All Departures →
          </Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-white/10 text-[10px] font-extrabold uppercase text-slate-400">
                <th className="p-3">Tour Package</th>
                <th className="p-3">Travel Date</th>
                <th className="p-3">Assigned Driver</th>
                <th className="p-3">Vehicle Spec</th>
                <th className="p-3">Pax Capacity</th>
                <th className="p-3">Dispatch Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-semibold text-slate-200">
              <tr className="hover:bg-white/5 transition-colors">
                <td className="p-3 font-extrabold text-white">Halesi Tour Package (1N/2D)</td>
                <td className="p-3 font-mono text-slate-300">2026-08-01</td>
                <td className="p-3 text-[#C8FF2D]">Srijan (Bus Driver)</td>
                <td className="p-3">28-Seater Sofa Bus</td>
                <td className="p-3 font-bold text-emerald-400">25 / 25 Pax (100%)</td>
                <td className="p-3">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-[#C8FF2D]/15 text-[#C8FF2D] border border-[#C8FF2D]/35">
                    READY FOR DISPATCH
                  </span>
                </td>
              </tr>
              <tr className="hover:bg-white/5 transition-colors">
                <td className="p-3 font-extrabold text-white">Jiri Tour (1N/2D)</td>
                <td className="p-3 font-mono text-slate-300">2026-08-01</td>
                <td className="p-3 text-[#C8FF2D]">Tarak Driver</td>
                <td className="p-3">Scorpio 4WD Jeep</td>
                <td className="p-3 font-bold text-emerald-400">6 / 6 Pax (100%)</td>
                <td className="p-3">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-[#C8FF2D]/15 text-[#C8FF2D] border border-[#C8FF2D]/35">
                    READY FOR DISPATCH
                  </span>
                </td>
              </tr>
              <tr className="hover:bg-white/5 transition-colors">
                <td className="p-3 font-extrabold text-white">Muktinath Tour (2N/3D)</td>
                <td className="p-3 font-mono text-slate-300">2026-10-25</td>
                <td className="p-3 text-amber-300">Lalitpur Holidays</td>
                <td className="p-3">Scorpio 4WD Jeep</td>
                <td className="p-3 font-bold text-amber-300">2 / 2 Pax (100%)</td>
                <td className="p-3">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-500/15 text-amber-300 border border-amber-500/30">
                    ASSIGNED & LOCKED
                  </span>
                </td>
              </tr>
              <tr className="hover:bg-white/5 transition-colors">
                <td className="p-3 font-extrabold text-white">Upper Mustang Package (4N/5D)</td>
                <td className="p-3 font-mono text-slate-300">2026-10-28</td>
                <td className="p-3 text-[#818CF8]">Bishnu Driver</td>
                <td className="p-3">Scorpio 4WD Jeep</td>
                <td className="p-3 font-bold text-[#818CF8]">7 / 7 Pax (100%)</td>
                <td className="p-3">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-[#6366F1]/15 text-[#818CF8] border border-[#6366F1]/30">
                    SCHEDULED
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* 5. INTERACTIVE QUICK ACTIONS TILES */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <motion.button
          whileHover={{ scale: 1.03, y: -2 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => openBookingModal()}
          className="p-3.5 rounded-2xl bg-[#111621] border border-white/10 hover:border-[#C8FF2D]/50 text-left transition-all shadow-md group backdrop-blur-xl cursor-pointer"
        >
          <Plus className="w-5 h-5 text-[#C8FF2D] mb-1 group-hover:scale-110 transition-transform" />
          <div className="text-xs font-black text-white">New Booking</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Confirm reservation</div>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.03, y: -2 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => onNavigate('/operations')}
          className="p-3.5 rounded-2xl bg-[#111621] border border-white/10 hover:border-[#C8FF2D]/50 text-left transition-all shadow-md group backdrop-blur-xl cursor-pointer"
        >
          <Compass className="w-5 h-5 text-[#C8FF2D] mb-1 group-hover:scale-110 transition-transform" />
          <div className="text-xs font-black text-white">Add Departure</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Schedule tour</div>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.03, y: -2 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => onNavigate('/drivers')}
          className="p-3.5 rounded-2xl bg-[#111621] border border-white/10 hover:border-[#C8FF2D]/50 text-left transition-all shadow-md group backdrop-blur-xl cursor-pointer"
        >
          <UserSquare2 className="w-5 h-5 text-sky-400 mb-1 group-hover:scale-110 transition-transform" />
          <div className="text-xs font-black text-white">Add Driver</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Driver directory</div>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.03, y: -2 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => onNavigate('/fleet')}
          className="p-3.5 rounded-2xl bg-[#111621] border border-white/10 hover:border-[#C8FF2D]/50 text-left transition-all shadow-md group backdrop-blur-xl cursor-pointer"
        >
          <Car className="w-5 h-5 text-emerald-400 mb-1 group-hover:scale-110 transition-transform" />
          <div className="text-xs font-black text-white">Fleet Master</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Vehicle directory</div>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.03, y: -2 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => onNavigate('/finance')}
          className="p-3.5 rounded-2xl bg-[#111621] border border-white/10 hover:border-[#C8FF2D]/50 text-left transition-all shadow-md group backdrop-blur-xl cursor-pointer"
        >
          <DollarSign className="w-5 h-5 text-amber-400 mb-1 group-hover:scale-110 transition-transform" />
          <div className="text-xs font-black text-white">Record Expense</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Fuel & allowance</div>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.03, y: -2 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => onNavigate('/reports')}
          className="p-3.5 rounded-2xl bg-[#111621] border border-white/10 hover:border-[#C8FF2D]/50 text-left transition-all shadow-md group backdrop-blur-xl cursor-pointer"
        >
          <FileText className="w-5 h-5 text-purple-400 mb-1 group-hover:scale-110 transition-transform" />
          <div className="text-xs font-black text-white">ERP Analytics</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Executive reports</div>
        </motion.button>
      </motion.div>

      {/* MODAL FOR ADDING STICKY NOTE */}
      <Modal
        isOpen={activeModal === 'NOTE'}
        onClose={() => setActiveModal(null)}
        title="Add Sticky Note to Dashboard"
        description="Pin a quick memo or operational instruction to your control center dashboard."
      >
        <form onSubmit={handleAddNoteSubmit} className="space-y-4">
          <Input
            label="Sticky Note Content"
            placeholder="e.g. Settle Pokhara Scorpio fuel receipt NPR 5,000..."
            value={newNoteInput}
            onChange={e => setNewNoteInput(e.target.value)}
            required
            autoFocus
          />
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={() => setActiveModal(null)}>Cancel</Button>
            <Button variant="primary" type="submit">+ Pin Note</Button>
          </div>
        </form>
      </Modal>

    </motion.div>
  );
};
