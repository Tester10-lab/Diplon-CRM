import { useState, useEffect } from 'react';
import { CalendarEvent } from '../../../types';
import { calendarService } from '../../services/calendarService';
import { operationsService } from '../../services/operationsService';
import { bookingService } from '../../services/bookingService';
import { financeService } from '../../services/financeService';
import { detectResourceConflicts, SchedulingConflict } from '../../utils/conflictDetector';
import { DepartureData, VehicleData, DriverData, GuideData } from '../../../types/erp';

export interface CalendarNote {
  id: string;
  title: string;
  date: string;
  category: 'General' | 'Operational' | 'Fleet' | 'Payment';
  description?: string;
  createdAt: string;
}

const NOTES_STORAGE_KEY = 'diplon_calendar_notes';

function getStoredNotes(): CalendarNote[] {
  try {
    const saved = localStorage.getItem(NOTES_STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch (e) {
    console.error('Failed to parse calendar notes:', e);
  }
  const defaultNotes: CalendarNote[] = [
    {
      id: 'note_1',
      title: 'Check Kalinchowk jeep road & weather report',
      date: '2026-08-02',
      category: 'Operational',
      description: 'Confirm 4WD Scorpio jeep driver Babu Driver departs by 6:00 AM from Ratna Rajya School',
      createdAt: '2026-07-28'
    },
    {
      id: 'note_2',
      title: 'Collect advance 5,000 Rs from Nirvik Sapkota',
      date: '2026-07-28',
      category: 'Payment',
      description: 'Remaining 33,500/- Rs to collect on Scorpio jeep during tour',
      createdAt: '2026-07-28'
    }
  ];
  localStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify(defaultNotes));
  return defaultNotes;
}

function saveStoredNotes(notes: CalendarNote[]) {
  try {
    localStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify(notes));
  } catch (e) {
    console.error('Failed to save notes:', e);
  }
}

// Date normalization helper for calendar matching
function normalizeDate(dateStr?: string): string {
  if (!dateStr) return new Date().toISOString().split('T')[0];
  const trimmed = dateStr.trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return trimmed;

  try {
    const cleaned = trimmed.replace(/(\d+)(st|nd|rd|th)/i, '$1');
    const parsed = new Date(cleaned);
    if (!isNaN(parsed.getTime())) {
      let y = parsed.getFullYear();
      if (y < 2020) y = 2026;
      const m = String(parsed.getMonth() + 1).padStart(2, '0');
      const d = String(parsed.getDate()).padStart(2, '0');
      return `${y}-${m}-${d}`;
    }
  } catch (e) {
    // fallback
  }

  return new Date().toISOString().split('T')[0];
}

export function useCalendarData(currentDate: Date) {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [departures, setDepartures] = useState<DepartureData[]>([]);
  const [vehicles, setVehicles] = useState<VehicleData[]>([]);
  const [drivers, setDrivers] = useState<DriverData[]>([]);
  const [guides, setGuides] = useState<GuideData[]>([]);
  const [notes, setNotes] = useState<CalendarNote[]>([]);
  const [conflicts, setConflicts] = useState<SchedulingConflict[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const monthStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;

  const fetchCalendarData = async () => {
    setIsLoading(true);
    try {
      const [eventsRes, depsRes, bookingsRes, vehRes, drvRes, guiRes, invRes] = await Promise.all([
        calendarService.getCalendarEvents(),
        operationsService.getDepartures(),
        bookingService.getBookings(),
        operationsService.getVehicles(),
        operationsService.getDrivers(),
        operationsService.getGuides(),
        financeService.getInvoices(),
      ]);

      const storedNotes = getStoredNotes();
      setNotes(storedNotes);

      // 1. Map Operations Tour Departures to Calendar Events
      const departureEvents: CalendarEvent[] = depsRes.map(dep => {
        const start = normalizeDate(dep.startDate);
        const end = normalizeDate(dep.endDate || dep.startDate);
        return {
          id: `dep_evt_${dep._id}`,
          title: `📌 ${dep.packageName} (${dep.seatsReserved || dep.travelerCount || 0}/${dep.seatsTotal} pax)`,
          start,
          end,
          startDate: start,
          endDate: end,
          type: 'DEPARTURE',
          color: dep.status === 'Active' ? '#6366f1' : dep.status === 'Delayed' ? '#f43f5e' : '#10b981',
          status: dep.status === 'Active' ? 'CONFIRMED' : 'PENDING'
        };
      });

      // 2. Map Tour Customer Bookings to Calendar Events
      const bookingEvents: CalendarEvent[] = bookingsRes.map(bk => {
        const date = normalizeDate(bk.departureDate);
        return {
          id: `bk_evt_${bk._id}`,
          title: `✈ ${bk.customerName}: ${bk.packageName} (${bk.seatsReserved} pax)`,
          start: date,
          end: date,
          startDate: date,
          endDate: date,
          type: 'TOUR',
          color: '#10b981',
          status: bk.status === 'CONFIRMED' ? 'CONFIRMED' : 'PENDING'
        };
      });

      // 3. Map Invoices
      const invoiceEvents: CalendarEvent[] = invRes.map(inv => {
        const date = normalizeDate(inv.issueDate);
        return {
          id: `inv-${inv.invoiceNumber}`,
          title: `💰 Payment Due: ${inv.customerName} (${inv.invoiceNumber})`,
          start: date,
          end: date,
          startDate: date,
          endDate: date,
          type: 'PAYMENT',
          color: '#f59e0b',
          resourceId: inv.invoiceNumber,
          status: inv.status,
        };
      });

      // 4. Map Calendar Notes
      const noteEvents: CalendarEvent[] = storedNotes.map(n => ({
        id: n.id,
        title: `📝 ${n.title}`,
        start: n.date,
        end: n.date,
        startDate: n.date,
        endDate: n.date,
        type: 'TOUR',
        color: '#f59e0b',
        status: 'CONFIRMED'
      }));

      // 5. Default Tour Events for July / August 2026
      const defaultJulyEvents: CalendarEvent[] = [
        {
          id: 'def_sailung_july',
          title: '📌 Sailung–Kalinchowk Tour (Nirvik Sapkota - 7 Pax)',
          start: '2026-08-02',
          end: '2026-08-03',
          startDate: '2026-08-02',
          endDate: '2026-08-03',
          type: 'DEPARTURE',
          color: '#6366f1',
          status: 'CONFIRMED'
        },
        {
          id: 'def_pokhara_july',
          title: '📍 Pokhara & Ghandruk Deluxe Tour (5 Pax)',
          start: '2026-07-29',
          end: '2026-08-01',
          startDate: '2026-07-29',
          endDate: '2026-08-01',
          type: 'TOUR',
          color: '#10b981',
          status: 'CONFIRMED'
        }
      ];

      const mergedEvents = [
        ...eventsRes,
        ...departureEvents,
        ...bookingEvents,
        ...invoiceEvents,
        ...noteEvents,
        ...defaultJulyEvents
      ];

      const uniqueMap = new Map<string, CalendarEvent>();
      mergedEvents.forEach(ev => uniqueMap.set(ev.id, ev));
      const uniqueEvents = Array.from(uniqueMap.values());

      setEvents(uniqueEvents);
      setDepartures(depsRes);
      setVehicles(vehRes);
      setDrivers(drvRes);
      setGuides(guiRes);

      const detected = detectResourceConflicts(depsRes, vehRes, drvRes, guiRes);
      setConflicts(detected);
      setError(null);
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCalendarData();
  }, [monthStr]);

  const addCalendarNote = (note: CalendarNote) => {
    const current = getStoredNotes();
    const updated = [note, ...current];
    saveStoredNotes(updated);
    setNotes(updated);
    fetchCalendarData();
  };

  return {
    events,
    departures,
    vehicles,
    drivers,
    guides,
    notes,
    conflicts,
    isLoading,
    error,
    refetch: fetchCalendarData,
    addCalendarNote
  };
}
