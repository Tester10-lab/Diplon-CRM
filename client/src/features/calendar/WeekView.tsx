import React from 'react';
import { CalendarEvent } from '../../types';
import { CalendarDisplayMode, adToBs, toDevanagari, NEPALI_WEEKDAYS } from '../../shared/utils/nepaliCalendar';
import { Plus } from 'lucide-react';

interface WeekViewProps {
  currentDate: Date;
  events: CalendarEvent[];
  mode: CalendarDisplayMode;
  onEventClick: (event: CalendarEvent) => void;
  onCellClick?: (dateStr: string) => void;
}

export const WeekView: React.FC<WeekViewProps> = ({ currentDate, events, mode, onEventClick, onCellClick }) => {
  const hours = Array.from({ length: 16 }, (_, i) => i + 6); // 06:00 to 21:00

  // Calculate start of current week (Sunday)
  const startOfWeek = new Date(currentDate);
  startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());

  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const dateObj = new Date(startOfWeek);
    dateObj.setDate(startOfWeek.getDate() + i);
    const y = dateObj.getFullYear();
    const m = String(dateObj.getMonth() + 1).padStart(2, '0');
    const d = String(dateObj.getDate()).padStart(2, '0');
    const dateStr = `${y}-${m}-${d}`;
    const bs = adToBs(dateObj);

    return {
      dateObj,
      dateStr,
      dayNum: dateObj.getDate(),
      monthShort: dateObj.toLocaleString('en-US', { month: 'short' }),
      bs,
      weekday: NEPALI_WEEKDAYS[i],
    };
  });

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/60 overflow-x-auto shadow-xl animate-fade-in select-none">
      <div className="min-w-[800px]">
        {/* Weekday Header Row */}
        <div className="grid grid-cols-8 border-b border-slate-800 bg-slate-950/80 text-xs font-bold text-slate-400 py-3">
          <div className="text-center text-slate-500 font-mono">Time</div>
          {weekDays.map((w, idx) => (
            <div
              key={idx}
              onClick={() => onCellClick?.(w.dateStr)}
              className="text-center flex flex-col items-center cursor-pointer hover:text-white transition-colors group"
            >
              {mode !== 'AD_ONLY' && (
                <span className="text-amber-400 font-extrabold group-hover:underline">{w.weekday.bs} ({toDevanagari(w.bs.day)})</span>
              )}
              {mode !== 'BS_ONLY' && (
                <span className="text-slate-400 text-[10px]">{w.weekday.short} {w.dayNum} {w.monthShort}</span>
              )}
            </div>
          ))}
        </div>

        {/* Time Grid Rows */}
        <div className="divide-y divide-slate-800/60">
          {hours.map(hour => (
            <div key={hour} className="grid grid-cols-8 min-h-[48px] divide-x divide-slate-800/40">
              <div className="p-2 text-center text-xs font-mono text-slate-500 border-r border-slate-800/80">
                {String(hour).padStart(2, '0')}:00
              </div>
              {weekDays.map((w, dayIdx) => {
                const hourEvents = events.filter(e => {
                  const start = e.startDate || e.start;
                  const end = e.endDate || e.end || start;
                  if (!start) return false;
                  return w.dateStr >= start && w.dateStr <= end;
                });
                return (
                  <div
                    key={dayIdx}
                    onClick={() => onCellClick?.(w.dateStr)}
                    className="p-1 relative cursor-pointer hover:bg-indigo-950/30 transition-colors group"
                  >
                    {hourEvents.map(ev => {
                      const color = ev.color || '#6366f1';
                      return (
                        <button
                          key={ev.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            onEventClick(ev);
                          }}
                          className="w-full text-left p-1.5 rounded text-[10px] font-bold truncate shadow-sm transition-all hover:brightness-125 mb-1"
                          style={{ backgroundColor: `${color}35`, color: color, borderLeft: `3px solid ${color}` }}
                        >
                          {ev.title}
                        </button>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
