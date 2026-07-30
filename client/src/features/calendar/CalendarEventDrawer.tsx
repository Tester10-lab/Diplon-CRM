import React, { useState } from 'react';
import { CalendarEvent } from '../../types';
import { Drawer } from '../../components/ui/Drawer';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { adToBs } from '../../shared/utils/nepaliCalendar';
import { openBookingModal } from '../../store/modalStore';
import { Calendar, User, Bus, MapPin, DollarSign, FileText, Clock, AlertTriangle, CheckCircle2, Edit3, RefreshCw, X, UserPlus } from 'lucide-react';

interface CalendarEventDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  event: CalendarEvent | null;
}

export const CalendarEventDrawer: React.FC<CalendarEventDrawerProps> = ({
  isOpen,
  onClose,
  event,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [editStatus, setEditStatus] = useState('');

  if (!event) return null;

  const dateString = event.startDate || event.start;
  const eventDate = new Date(dateString);
  const bs = adToBs(eventDate);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleReassign = () => {
    showToast('✅ Reassign request submitted. Resource will be updated in the next schedule cycle.');
  };

  const handleEdit = () => {
    setIsEditing(!isEditing);
    if (isEditing) {
      showToast('✅ Event details saved successfully.');
    }
  };

  const handleStatusChange = (newStatus: string) => {
    setEditStatus(newStatus);
    showToast(`✅ Status updated to ${newStatus}`);
  };

  const handleAddCustomerToTour = () => {
    onClose();
    openBookingModal();
  };

  return (
    <Drawer isOpen={isOpen} onClose={onClose} title={event.title} width="w-full max-w-lg">
      <div className="space-y-6">
        {/* Inline Toast */}
        {toastMsg && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold animate-fade-in">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            {toastMsg}
          </div>
        )}

        {/* Date Headers (BS & AD) */}
        <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4 text-indigo-400" /> Dual Date Spec</span>
            <Badge variant={event.type === 'TOUR' || event.type === 'DEPARTURE' ? 'primary' : 'warning'}>{event.type}</Badge>
          </div>
          <div className="grid grid-cols-2 gap-4 pt-1 border-t border-slate-800/60">
            <div>
              <div className="text-[11px] text-slate-400 font-semibold">🇳🇵 Bikram Sambat (BS)</div>
              <div className="text-base font-extrabold text-amber-400">{bs.day} {bs.monthName} {bs.year} ({bs.weekdayName})</div>
            </div>
            <div>
              <div className="text-[11px] text-slate-400 font-semibold">🌍 Gregorian (AD)</div>
              <div className="text-sm font-bold text-slate-200">{dateString}</div>
            </div>
          </div>
        </div>

        {/* Add Customer / Passenger CTA Banner */}
        <div className="p-4 rounded-xl bg-indigo-950/60 border border-indigo-500/30 flex items-center justify-between">
          <div>
            <h5 className="text-xs font-bold text-white flex items-center gap-1.5">
              <UserPlus className="w-4 h-4 text-emerald-400" />
              Add Customer / Passengers
            </h5>
            <p className="text-[11px] text-slate-300 mt-0.5">Assign customer group to this tour departure</p>
          </div>
          <Button
            size="sm"
            variant="primary"
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-500/20"
            onClick={handleAddCustomerToTour}
          >
            + Add Customer
          </Button>
        </div>

        {/* Assigned Roster Details */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Assigned Operations Roster</h4>
          <div className="grid grid-cols-1 gap-2 text-xs">
            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-900/30 border border-slate-800">
              <span className="flex items-center gap-2 text-slate-400"><Bus className="w-4 h-4 text-indigo-400" /> Resource ID</span>
              <span className="font-bold text-slate-200">{event.resourceId || 'Not Assigned'}</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-900/30 border border-slate-800">
              <span className="flex items-center gap-2 text-slate-400"><User className="w-4 h-4 text-emerald-400" /> Title</span>
              <span className="font-bold text-slate-200">{event.title}</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-900/30 border border-slate-800">
              <span className="flex items-center gap-2 text-slate-400"><Clock className="w-4 h-4 text-rose-400" /> Duration</span>
              <span className="font-bold text-slate-200">{event.start} to {event.end}</span>
            </div>
          </div>
        </div>

        {/* Event Status */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Event Status</h4>
          <div className={`p-4 rounded-xl border flex items-center justify-between ${event.status === 'CONFIRMED' || event.status === 'PAID' ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-amber-500/10 border-amber-500/20'}`}>
            <div className="flex items-center gap-2.5">
              <AlertTriangle className={`w-5 h-5 ${event.status === 'CONFIRMED' || event.status === 'PAID' ? 'text-emerald-400' : 'text-amber-400'}`} />
              <div>
                <div className={`text-xs font-semibold ${event.status === 'CONFIRMED' || event.status === 'PAID' ? 'text-emerald-300' : 'text-amber-300'}`}>Current Status</div>
                <div className={`text-sm font-extrabold ${event.status === 'CONFIRMED' || event.status === 'PAID' ? 'text-emerald-400' : 'text-amber-400'}`}>{editStatus || event.status}</div>
              </div>
            </div>
            <Badge variant={event.status === 'CONFIRMED' || event.status === 'PAID' ? 'success' : 'warning'}>{editStatus || event.status}</Badge>
          </div>

          {/* Status Change Buttons */}
          {isEditing && (
            <div className="flex flex-wrap gap-1.5">
              {['CONFIRMED', 'PENDING', 'DELAYED', 'CANCELLED'].map(s => (
                <button
                  key={s}
                  onClick={() => handleStatusChange(s)}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase transition-all ${
                    (editStatus || event.status) === s
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Quick Action Buttons */}
        <div className="pt-4 border-t border-slate-800 flex flex-wrap gap-2">
          <Button variant="primary" size="sm" className="flex-1" icon={<RefreshCw className="w-3.5 h-3.5" />} onClick={handleReassign}>
            Reassign Resource
          </Button>
          <Button variant="secondary" size="sm" className="flex-1" icon={<Edit3 className="w-3.5 h-3.5" />} onClick={handleEdit}>
            {isEditing ? 'Save Changes' : 'Edit Event'}
          </Button>
          <Button variant="ghost" size="sm" icon={<X className="w-3.5 h-3.5" />} onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </Drawer>
  );
};
