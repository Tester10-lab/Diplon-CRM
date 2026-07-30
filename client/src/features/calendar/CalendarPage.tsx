import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCalendarData } from '../../shared/hooks/calendar/useCalendarData';
import { CalendarDisplayMode, adToBs, NEPALI_MONTHS } from '../../shared/utils/nepaliCalendar';
import { openAddTourModal } from '../../store/modalStore';
import { operationsService } from '../../shared/services/operationsService';
import { SchedulingConflict } from '../../shared/utils/conflictDetector';
import { MonthView } from './MonthView';
import { WeekView } from './WeekView';
import { DayView } from './DayView';
import { ResourceTimeline } from './ResourceTimeline';
import { CalendarEventDrawer } from './CalendarEventDrawer';
import { ResolveConflictModal } from '../../components/calendar/ResolveConflictModal';
import { AddNoteModal, CalendarNote } from '../../components/calendar/AddNoteModal';
import { CalendarEvent } from '../../types';
import { PageSkeleton } from '../../components/feedback/Skeleton';
import { ErrorState } from '../../components/feedback/ErrorState';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Calendar as CalendarIcon, AlertTriangle, ChevronLeft, ChevronRight, RotateCcw, Plus, StickyNote, CheckCircle2, Sparkles, UserCheck } from 'lucide-react';

import { useAuthStore } from '../../store/authStore';
import { AssignDispatchModal } from '../../components/operations/AssignDispatchModal';
import { DepartureData } from '../../types/erp';

export const CalendarPage: React.FC<{ onNavigate?: (path: string) => void }> = ({ onNavigate }) => {
  const { user } = useAuthStore();
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date(2026, 6, 1)); // Default July 2026
  const [displayMode, setDisplayMode] = useState<CalendarDisplayMode>('DUAL_BS_AD');
  const [viewType, setViewType] = useState<'MONTH' | 'WEEK' | 'DAY' | 'TIMELINE'>('MONTH');
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Modals state
  const [selectedConflict, setSelectedConflict] = useState<SchedulingConflict | null>(null);
  const [isConflictModalOpen, setIsConflictModalOpen] = useState(false);
  const [isAddNoteModalOpen, setIsAddNoteModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [targetDeparture, setTargetDeparture] = useState<DepartureData | null>(null);
  const [selectedCellDate, setSelectedCellDate] = useState<string>('');
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const { events, departures, vehicles, drivers, guides, notes, conflicts, isLoading, error, refetch, addCalendarNote } = useCalendarData(currentMonth);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 4000);
  };

  const handleOpenAssign = (dep: DepartureData) => {
    setTargetDeparture(dep);
    setIsAssignModalOpen(true);
  };

  const handleSaveAssignment = async (departureId: string, updates: any) => {
    await operationsService.updateDeparture(departureId, updates);
    showToast(`✅ Resource assignment updated for ${updates.driverName || 'Driver'}!`);
    refetch();
  };

  if (isLoading) return <PageSkeleton />;
  if (error) return <ErrorState message={error.message} onRetry={refetch} />;

  // Navigation handlers
  const handlePrevMonth = () => {
    const prev = new Date(currentMonth);
    prev.setMonth(currentMonth.getMonth() - 1);
    setCurrentMonth(prev);
  };

  const handleNextMonth = () => {
    const next = new Date(currentMonth);
    next.setMonth(currentMonth.getMonth() + 1);
    setCurrentMonth(next);
  };

  const handleToday = () => {
    setCurrentMonth(new Date());
  };

  const handleEventClick = (ev: CalendarEvent) => {
    setSelectedEvent(ev);
    setIsDrawerOpen(true);
  };

  // Calculate AD Month/Year string
  const adMonthName = currentMonth.toLocaleString('en-US', { month: 'long', year: 'numeric' });

  // Calculate BS Month/Year string
  const bs = adToBs(currentMonth);
  const nextMonthIdx = (bs.month) % 12;
  const bsMonthName = `${bs.monthName} – ${NEPALI_MONTHS[nextMonthIdx].bs} ${bs.year}`;

  const handleCellClick = (dateStr: string) => {
    setSelectedCellDate(dateStr);
    openAddTourModal();
  };

  const handleConflictClick = (conflict: SchedulingConflict) => {
    setSelectedConflict(conflict);
    setIsConflictModalOpen(true);
  };

  const handleResolveConflict = async (departureId: string, updates: any) => {
    try {
      await operationsService.updateDeparture(departureId, updates);
      refetch();
    } catch (err) {
      console.error('Failed to resolve conflict:', err);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="space-y-6 select-none"
    >
      {/* Header Controls Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-3xl bg-[#111621] border border-white/10 backdrop-blur-xl shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-black text-white flex items-center gap-2 tracking-tight">
              <CalendarIcon className="w-5 h-5 text-[#C8FF2D]" />
              Enterprise Calendar & Resource Dispatch Timeline
            </h1>
            <Badge variant="lime" dot>Live REST API</Badge>
          </div>
          <p className="text-xs text-slate-400 font-medium">
            Dual Bikram Sambat (BS) & Gregorian (AD) scheduling engine with driver conflict detection
          </p>
        </div>

        {/* Month Navigation Controls & Dual Headers */}
        <div className="flex items-center gap-3 bg-[#0B0E14] p-2 rounded-2xl border border-white/10 shadow-inner">
          <Button
            variant="secondary"
            size="sm"
            onClick={handlePrevMonth}
            icon={<ChevronLeft className="w-4 h-4 text-slate-300" />}
            title="Previous Month"
          >
            Prev
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleToday}
            icon={<RotateCcw className="w-3.5 h-3.5 text-[#C8FF2D]" />}
          >
            Today
          </Button>

          <div className="text-center px-3">
            <div className="text-sm font-black text-[#C8FF2D]">{bsMonthName}</div>
            <div className="text-xs font-bold text-slate-300 font-mono">{adMonthName}</div>
          </div>

          <Button
            variant="secondary"
            size="sm"
            onClick={handleNextMonth}
            icon={<ChevronRight className="w-4 h-4 text-slate-300" />}
            title="Next Month"
          >
            Next
          </Button>
        </div>

        {/* Dual Date Mode Selector & Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="p-1 rounded-2xl bg-[#0B0E14] border border-white/10 flex items-center text-xs">
            <button
              onClick={() => setDisplayMode('BS_ONLY')}
              className={`px-3 py-1.5 rounded-xl font-extrabold transition-all ${
                displayMode === 'BS_ONLY' ? 'bg-[#C8FF2D] text-[#0B0E14] shadow-md' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              🇳🇵 BS Only
            </button>
            <button
              onClick={() => setDisplayMode('DUAL_BS_AD')}
              className={`px-3 py-1.5 rounded-xl font-extrabold transition-all ${
                displayMode === 'DUAL_BS_AD' ? 'bg-[#6366F1] text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              🇳🇵 + 🌍 Dual BS/AD
            </button>
            <button
              onClick={() => setDisplayMode('AD_ONLY')}
              className={`px-3 py-1.5 rounded-xl font-extrabold transition-all ${
                displayMode === 'AD_ONLY' ? 'bg-white/10 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              🌍 AD Only
            </button>
          </div>

          {/* View Switcher Tabs */}
          <div className="p-1 rounded-2xl bg-[#0B0E14] border border-white/10 flex items-center text-xs">
            {(['MONTH', 'WEEK', 'DAY', 'TIMELINE'] as const).map(v => (
              <button
                key={v}
                onClick={() => setViewType(v)}
                className={`px-3 py-1.5 rounded-xl font-black uppercase text-[11px] transition-all ${
                  viewType === v ? 'bg-[#C8FF2D]/20 text-[#C8FF2D] border border-[#C8FF2D]/40' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {v}
              </button>
            ))}
          </div>

          {/* Add Calendar Note Button */}
          <Button
            variant="secondary"
            size="sm"
            className="bg-amber-500/15 border-amber-500/30 text-amber-300 hover:bg-amber-500/25 font-black"
            icon={<StickyNote className="w-4 h-4 text-amber-400" />}
            onClick={() => setIsAddNoteModalOpen(true)}
          >
            + Add Note
          </Button>

          {/* Schedule Departure Action */}
          <Button
            variant="primary"
            size="sm"
            icon={<Plus className="w-4 h-4 stroke-[3]" />}
            onClick={() => openAddTourModal()}
          >
            + Schedule Departure
          </Button>
        </div>
      </div>

      {/* Toast Alert */}
      <AnimatePresence>
        {toastMsg && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-[#C8FF2D] text-[#0B0E14] px-5 py-3 rounded-2xl shadow-xl flex items-center gap-3 font-black text-xs border border-[#C8FF2D]"
          >
            <Sparkles className="w-4 h-4 text-[#0B0E14] animate-spin" />
            <span>{toastMsg}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Conflict Detection Banner */}
      {conflicts.length > 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-4 rounded-3xl bg-[#EF4444]/15 border border-[#EF4444]/30 text-[#F87171] space-y-3 backdrop-blur-xl"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-black">
              <AlertTriangle className="w-5 h-5 text-[#EF4444] animate-bounce shrink-0" />
              <span>⚠️ Operational Conflict Detected: {conflicts.length} Overlapping Driver/Vehicle Schedules</span>
            </div>
            <Badge variant="danger">{conflicts.length} Action Needed</Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
            {conflicts.map(c => (
              <div
                key={c.id}
                onClick={() => handleConflictClick(c)}
                className="p-3 rounded-2xl bg-[#0B0E14] border border-[#EF4444]/40 hover:border-[#EF4444] transition-all cursor-pointer flex items-center justify-between text-xs"
              >
                <div>
                  <div className="font-extrabold text-white">{c.description}</div>
                  <div className="text-[11px] text-slate-400 mt-0.5 font-mono">{c.startDate} to {c.endDate}</div>
                </div>
                <Button size="sm" variant="danger">
                  Resolve
                </Button>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Main Calendar View Display */}
      <div className="rounded-3xl bg-[#111621] border border-white/10 p-5 shadow-2xl backdrop-blur-xl">
        {viewType === 'MONTH' && (
          <MonthView
            currentDate={currentMonth}
            mode={displayMode}
            events={events}
            onEventClick={handleEventClick}
            onCellClick={handleCellClick}
          />
        )}
        {viewType === 'WEEK' && (
          <WeekView
            currentDate={currentMonth}
            mode={displayMode}
            events={events}
            onEventClick={handleEventClick}
            onCellClick={handleCellClick}
          />
        )}
        {viewType === 'DAY' && (
          <DayView
            currentDate={currentMonth}
            mode={displayMode}
            events={events}
            onEventClick={handleEventClick}
          />
        )}
        {viewType === 'TIMELINE' && (
          <ResourceTimeline
            departures={departures}
            drivers={drivers}
            vehicles={vehicles}
            guides={guides}
            onOpenAssign={handleOpenAssign}
          />
        )}
      </div>

      {/* Event Details Side Drawer */}
      <CalendarEventDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        event={selectedEvent}
      />

      {/* Conflict Resolution Modal */}
      {selectedConflict && (
        <ResolveConflictModal
          isOpen={isConflictModalOpen}
          onClose={() => setIsConflictModalOpen(false)}
          conflict={selectedConflict}
          drivers={drivers}
          vehicles={vehicles}
          onResolve={handleResolveConflict}
        />
      )}

      {/* Add Calendar Note Modal */}
      <AddNoteModal
        isOpen={isAddNoteModalOpen}
        onClose={() => setIsAddNoteModalOpen(false)}
        onAddNote={(noteData) => {
          addCalendarNote(noteData);
          showToast('Sticky memo added to calendar date!');
        }}
        initialDate={selectedCellDate || new Date().toISOString().split('T')[0]}
      />

      {/* Resource Dispatch Modal */}
      {targetDeparture && (
        <AssignDispatchModal
          isOpen={isAssignModalOpen}
          onClose={() => setIsAssignModalOpen(false)}
          departure={targetDeparture}
          onSave={handleSaveAssignment}
        />
      )}
    </motion.div>
  );
};
