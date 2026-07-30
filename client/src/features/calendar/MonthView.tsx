import React from 'react';
import { CalendarEvent } from '../../types';
import { CalendarDisplayMode, adToBs, toDevanagari, NEPAL_HOLIDAYS_FESTIVALS, NEPALI_WEEKDAYS } from '../../shared/utils/nepaliCalendar';
import { Plus } from 'lucide-react';

interface MonthViewProps {
  currentDate: Date;
  events: CalendarEvent[];
  mode: CalendarDisplayMode;
  onEventClick: (event: CalendarEvent) => void;
  onCellClick?: (dateStr: string) => void;
}

export const MonthView: React.FC<MonthViewProps> = ({ currentDate, events, mode, onEventClick, onCellClick }) => {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth(); // 0-indexed

  // Get first day of month and total days in month
  const firstDayOfMonth = new Date(year, month, 1);
  const startingDayOfWeek = firstDayOfMonth.getDay(); // 0 = Sunday
  const totalDaysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  // Generate 35 or 42 grid cells (5-6 weeks)
  const totalGridCells = startingDayOfWeek + totalDaysInMonth > 35 ? 42 : 35;

  const calendarDays = Array.from({ length: totalGridCells }, (_, i) => {
    let dateObj: Date;
    let isCurrentMonth = true;

    if (i < startingDayOfWeek) {
      // Leading days from previous month
      const prevDay = daysInPrevMonth - (startingDayOfWeek - 1 - i);
      dateObj = new Date(year, month - 1, prevDay);
      isCurrentMonth = false;
    } else if (i >= startingDayOfWeek + totalDaysInMonth) {
      // Trailing days from next month
      const nextDay = i - (startingDayOfWeek + totalDaysInMonth) + 1;
      dateObj = new Date(year, month + 1, nextDay);
      isCurrentMonth = false;
    } else {
      // Days in current month
      const dayNum = i - startingDayOfWeek + 1;
      dateObj = new Date(year, month, dayNum);
    }

    const y = dateObj.getFullYear();
    const m = String(dateObj.getMonth() + 1).padStart(2, '0');
    const d = String(dateObj.getDate()).padStart(2, '0');
    const dateStr = `${y}-${m}-${d}`;
    const bs = adToBs(dateObj);
    const holiday = NEPAL_HOLIDAYS_FESTIVALS[dateStr];
    const dayEvents = events.filter(e => {
      const start = e.startDate || e.start;
      const end = e.endDate || e.end || start;
      if (!start) return false;
      return dateStr >= start && dateStr <= end;
    });

    return {
      adDay: dateObj.getDate(),
      adMonth: dateObj.toLocaleString('en-US', { month: 'short' }),
      bsDay: bs.day,
      dateStr,
      holiday,
      dayEvents,
      isCurrentMonth,
    };
  });

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/60 overflow-hidden shadow-xl animate-fade-in">
      {/* Weekday Header Grid */}
      <div className="grid grid-cols-7 border-b border-slate-800 bg-slate-950/80 text-center py-2.5 text-xs font-bold text-slate-400">
        {NEPALI_WEEKDAYS.map((w, idx) => (
          <div key={idx} className="flex flex-col items-center">
            {mode !== 'AD_ONLY' && <span className="text-amber-400 font-medium">{w.bs}</span>}
            {mode !== 'BS_ONLY' && <span className="text-slate-400 text-[10px]">{w.en}</span>}
          </div>
        ))}
      </div>

      {/* Calendar Grid Cells */}
      <div className="grid grid-cols-7 auto-rows-fr divide-x divide-y divide-slate-800/60 select-none">
        {calendarDays.map((cell, idx) => (
          <div
            key={idx}
            onClick={() => onCellClick?.(cell.dateStr)}
            className={`min-h-[110px] p-2 transition-colors relative cursor-pointer group hover:bg-indigo-950/20 ${
              !cell.isCurrentMonth ? 'opacity-30 bg-slate-950/40' : ''
            }`}
          >
            {/* Hover + Quick Add Icon */}
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-md bg-indigo-600 text-white shadow-md">
              <Plus className="w-3 h-3" />
            </div>

            {/* Dual Date Display (BS & AD) */}
            <div className="flex items-start justify-between pr-5">
              {mode !== 'AD_ONLY' && (
                <span className="text-lg font-extrabold text-amber-400 leading-none">
                  {toDevanagari(cell.bsDay)}
                </span>
              )}
              {mode !== 'BS_ONLY' && (
                <span className="text-xs font-semibold text-slate-400 leading-none">
                  {cell.adDay} {cell.adMonth}
                </span>
              )}
            </div>

            {/* Festival & Holiday Tag */}
            {cell.holiday && (
              <div className="mt-1 text-[9px] font-bold text-rose-400 bg-rose-500/10 border border-rose-500/20 px-1 py-0.5 rounded truncate">
                🎉 {cell.holiday}
              </div>
            )}

            {/* Event Pills */}
            <div className="mt-2 space-y-1">
              {cell.dayEvents.slice(0, 3).map(ev => {
                const color = ev.color || '#6366f1';
                return (
                  <button
                    key={ev.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      onEventClick(ev);
                    }}
                    className="w-full text-left text-[10px] font-semibold px-1.5 py-1 rounded truncate transition-all flex items-center gap-1 hover:brightness-125 shadow-sm"
                    style={{ backgroundColor: `${color}30`, color: color, border: `1px solid ${color}50` }}
                  >
                    <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: color }} />
                    <span className="truncate">{ev.title}</span>
                  </button>
                );
              })}
              {cell.dayEvents.length > 3 && (
                <div className="text-[9px] text-indigo-400 font-bold px-1">+ {cell.dayEvents.length - 3} more tours</div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
