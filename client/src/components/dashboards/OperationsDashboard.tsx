import React, { useState } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Modal } from '../ui/Modal';
import {
  Compass,
  Calendar,
  AlertTriangle,
  Truck,
  UserCheck,
  Plus,
  Clock,
  Play,
  FileCheck,
  UserSquare2,
  Wrench,
  CheckCircle2,
  SlidersHorizontal,
  Zap,
  Sparkles
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { openAddTourModal, openBookingModal } from '../../store/modalStore';

export const OperationsDashboard: React.FC<{ onNavigate: (path: string) => void }> = ({ onNavigate }) => {
  const { user } = useAuthStore();
  const displayName = user?.name ? user.name.split(' (')[0] : 'Operations Officer';

  const [activeTimelineNode, setActiveTimelineNode] = useState<'06:00' | '09:30' | '11:00' | '14:15'>('09:30');
  const [alertAcknowledged, setAlertAcknowledged] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [selectedTourDetail, setSelectedTourDetail] = useState<any | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const handleAcknowledgeAlert = () => {
    setAlertAcknowledged(true);
    showToast('Maintenance alert for Scorpio (BA-2-PA-1234) acknowledged!');
  };

  return (
    <div className="space-y-6 animate-fade-in select-none">
      
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed top-20 right-8 z-50 bg-amber-500 text-slate-950 px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-fade-in text-xs font-bold border border-amber-300">
          <Sparkles className="w-4 h-4 text-slate-950 animate-bounce" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* 1. Header Bar (Screenshot 1 Top Section) */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-md">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-3">
            Welcome back, {displayName}
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Live status of fleets, guides, and departures across Nepal.
          </p>
        </div>

        {/* Top Action Buttons (Screenshot 1 Top Right) */}
        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            variant="secondary"
            size="sm"
            icon={<SlidersHorizontal className="w-4 h-4 text-slate-400" />}
            onClick={() => showToast('Operations filter applied: All 5 Regions')}
          >
            Filter
          </Button>

          <Button
            variant="primary"
            size="sm"
            className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold shadow-lg shadow-indigo-600/30 flex items-center gap-2"
            icon={<Zap className="w-4 h-4" />}
            onClick={openAddTourModal}
          >
            + Quick Actions
          </Button>
        </div>
      </div>

      {/* 2. KPI Stat Grid (Screenshot 1 Two Rows of 4 Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Row 1, Card 1: Today's Tours */}
        <div
          onClick={() => onNavigate('/operations')}
          className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-indigo-500/50 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">TODAY'S TOURS</span>
            <Calendar className="w-4 h-4 text-indigo-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <span className="text-3xl font-black text-white">12</span>
            <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
              ↗+2
            </span>
          </div>
        </div>

        {/* Row 1, Card 2: Tomorrow's */}
        <div
          onClick={() => onNavigate('/operations')}
          className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-sky-500/50 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">TOMORROW'S</span>
            <Clock className="w-4 h-4 text-sky-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="mt-4">
            <span className="text-3xl font-black text-white">8</span>
          </div>
        </div>

        {/* Row 1, Card 3: In Progress */}
        <div
          onClick={() => onNavigate('/operations')}
          className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-emerald-500/50 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">IN PROGRESS</span>
            <Play className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <span className="text-3xl font-black text-white">5</span>
            {/* Sparkline simulation */}
            <div className="w-16 h-4 border-b-2 border-emerald-400 rounded-full opacity-60" />
          </div>
        </div>

        {/* Row 1, Card 4: Delayed (Highlighted Red Card from Screenshot 1) */}
        <div
          onClick={() => setSelectedTourDetail({ name: 'Everest Base Camp Trek', issue: 'Lukla Weather Flight Delay', ETA: '14:30 PM' })}
          className="p-5 rounded-2xl bg-rose-950/40 border border-rose-500/40 hover:border-rose-500 transition-all cursor-pointer group relative"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-rose-300">DELAYED</span>
            <AlertTriangle className="w-4 h-4 text-rose-400 group-hover:scale-110 transition-transform animate-pulse" />
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <span className="text-3xl font-black text-rose-400">1</span>
            <span className="text-[11px] font-bold text-rose-300 truncate">Everest Base Camp</span>
          </div>
        </div>

        {/* Row 2, Card 1: Vehicles Assigned */}
        <div
          onClick={() => onNavigate('/fleet')}
          className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-indigo-500/50 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">VEHICLES ASSIGNED</span>
            <Truck className="w-4 h-4 text-indigo-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="mt-4 space-y-2">
            <div className="text-3xl font-black text-white">
              24 <span className="text-sm font-semibold text-slate-500">/ 28</span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
              <div className="h-full bg-indigo-500 rounded-full w-[85%]" />
            </div>
          </div>
        </div>

        {/* Row 2, Card 2: Drivers Avail. */}
        <div
          onClick={() => onNavigate('/drivers')}
          className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-amber-500/50 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">DRIVERS AVAIL.</span>
            <UserSquare2 className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="mt-4">
            <span className="text-3xl font-black text-white">14</span>
          </div>
        </div>

        {/* Row 2, Card 3: Guides Avail. */}
        <div
          onClick={() => onNavigate('/guides')}
          className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-emerald-500/50 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">GUIDES AVAIL.</span>
            <UserCheck className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="mt-4">
            <span className="text-3xl font-black text-white">9</span>
          </div>
        </div>

        {/* Row 2, Card 4: Manifests Ready */}
        <div
          onClick={() => onNavigate('/operations')}
          className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-orange-500/50 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">MANIFESTS READY</span>
            <FileCheck className="w-4 h-4 text-orange-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="mt-4 space-y-2">
            <div className="text-3xl font-black text-white">
              11 <span className="text-sm font-semibold text-slate-500">/ 12</span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
              <div className="h-full bg-orange-500 rounded-full w-[91%]" />
            </div>
          </div>
        </div>

      </div>

      {/* 3. Main Bottom Section (24h Departure Timeline + Operational Alerts Sidebar) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* 24h Departure Timeline Panel (Screenshot 1 Bottom Left) */}
        <div className="lg:col-span-2 rounded-2xl bg-slate-900/80 border border-slate-800 p-6 space-y-6 shadow-xl">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-indigo-400" />
              24h Departure Timeline
            </h2>
            <button
              onClick={() => onNavigate('/timeline')}
              className="text-xs font-bold text-indigo-400 hover:text-indigo-300 transition-colors"
            >
              View Full Schedule →
            </button>
          </div>

          {/* Interactive Timeline Bar (Screenshot 1 Timeline Visual) */}
          <div className="bg-slate-950/80 p-6 rounded-2xl border border-slate-800/80 relative">
            <div className="absolute top-1/2 left-8 right-8 h-0.5 bg-slate-800 -translate-y-1/2" />
            
            <div className="relative z-10 flex items-center justify-between max-w-md mx-auto">
              
              {/* Node 1: 06:00 */}
              <div
                onClick={() => { setActiveTimelineNode('06:00'); setSelectedTourDetail({ name: 'Everest Expedition Dispatch', time: '06:00 AM', vehicle: 'Ba 2 Kha 1234', status: 'Departed' }); }}
                className="flex flex-col items-center cursor-pointer group"
              >
                <div className="w-4 h-4 rounded-full bg-emerald-500 border-4 border-slate-950 shadow-md group-hover:scale-125 transition-transform" />
                <span className="text-xs font-mono font-semibold text-slate-400 mt-2">06:00</span>
              </div>

              {/* Node 2: 09:30 (Now - Active Node from Screenshot 1) */}
              <div
                onClick={() => { setActiveTimelineNode('09:30'); setSelectedTourDetail({ name: 'Pokhara Express Jeep Tour', time: '09:30 AM (Now)', vehicle: 'Ba 1 Jha 9876', status: 'En Route' }); }}
                className="flex flex-col items-center cursor-pointer group relative"
              >
                <div className="w-6 h-6 rounded-full bg-indigo-500 border-4 border-slate-950 shadow-lg shadow-indigo-500/50 flex items-center justify-center animate-pulse">
                  <div className="w-2 h-2 rounded-full bg-white" />
                </div>
                <span className="text-xs font-mono font-extrabold text-indigo-400 mt-2">09:30 (Now)</span>
                
                {/* Active Tooltip Pill (Screenshot 1 Pokhara Express) */}
                <div className="absolute -top-10 bg-slate-800 text-indigo-300 text-[10px] font-bold px-2.5 py-1 rounded-lg border border-indigo-500/30 whitespace-nowrap shadow-xl">
                  Pokhara Express
                </div>
              </div>

              {/* Node 3: 11:00 */}
              <div
                onClick={() => { setActiveTimelineNode('11:00'); setSelectedTourDetail({ name: 'Sailung–Kalinchowk 4WD Scorpio', time: '11:00 AM', vehicle: 'BA-2-PA-1234', status: 'Boarding' }); }}
                className="flex flex-col items-center cursor-pointer group"
              >
                <div className="w-4 h-4 rounded-full bg-slate-700 border-4 border-slate-950 shadow-md group-hover:scale-125 group-hover:bg-amber-400 transition-all" />
                <span className="text-xs font-mono font-semibold text-slate-400 mt-2">11:00</span>
              </div>

              {/* Node 4: 14:15 */}
              <div
                onClick={() => { setActiveTimelineNode('14:15'); setSelectedTourDetail({ name: 'Muktinath Yatra Express', time: '14:15 PM', vehicle: 'Tourist Bus B2', status: 'Scheduled' }); }}
                className="flex flex-col items-center cursor-pointer group"
              >
                <div className="w-4 h-4 rounded-full bg-slate-700 border-4 border-slate-950 shadow-md group-hover:scale-125 group-hover:bg-indigo-400 transition-all" />
                <span className="text-xs font-mono font-semibold text-slate-400 mt-2">14:15</span>
              </div>

            </div>
          </div>
        </div>

        {/* Operational Alerts Box (Screenshot 1 Right Sidebar) */}
        <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-6 space-y-4 shadow-xl">
          <div className="flex items-center gap-2 text-amber-400 font-extrabold text-sm">
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
            <span>Operational Alerts</span>
          </div>

          {!alertAcknowledged ? (
            <div className="p-4 rounded-2xl bg-slate-950/90 border border-slate-800 space-y-3 shadow-lg">
              <div className="flex items-start gap-2.5">
                <Wrench className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-white">Vehicle Maintenance Due</h4>
                  <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                    Scorpio (BA-2-PA-1234) scheduled for 10K service tomorrow.
                  </p>
                </div>
              </div>
              <button
                onClick={handleAcknowledgeAlert}
                className="text-xs font-extrabold text-indigo-400 hover:text-indigo-300 transition-colors underline pt-1 block"
              >
                Acknowledge
              </button>
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>All operational alerts acknowledged!</span>
            </div>
          )}
        </div>

      </div>

      {/* Detail Modal when timeline nodes or delayed card clicked */}
      <Modal
        isOpen={!!selectedTourDetail}
        onClose={() => setSelectedTourDetail(null)}
        title={selectedTourDetail?.name || 'Tour Operations Detail'}
        description="Live operational dispatch details & crew assignments."
      >
        <div className="space-y-4 text-xs font-medium">
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
            <div className="flex justify-between">
              <span className="text-slate-400">Scheduled Time:</span>
              <span className="font-bold text-amber-400 font-mono">{selectedTourDetail?.time || 'Today'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Status / Issue:</span>
              <span className="font-bold text-emerald-400">{selectedTourDetail?.status || selectedTourDetail?.issue || 'Active'}</span>
            </div>
            {selectedTourDetail?.vehicle && (
              <div className="flex justify-between">
                <span className="text-slate-400">Assigned Vehicle:</span>
                <span className="font-bold text-white">{selectedTourDetail.vehicle}</span>
              </div>
            )}
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setSelectedTourDetail(null)}>Close</Button>
            <Button variant="primary" onClick={() => { setSelectedTourDetail(null); onNavigate('/operations'); }}>Go to Operations</Button>
          </div>
        </div>
      </Modal>

    </div>
  );
};
