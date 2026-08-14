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
      title: 'Halesi 28-seater Sofa Bus departure at Shangri-la Hotel',
      date: '2026-08-01',
      category: 'Operational',
      description: 'Chandra man Maharjan group (85,000/- Rs collect on bus)',
      createdAt: '2026-07-31'
    },
    {
      id: 'note_2',
      title: 'Collect 34,400 Rs for Muktinath Tour (Lalitpur Holidays)',
      date: '2026-10-25',
      category: 'Payment',
      description: 'Abhijit Ghosh group (2 Pax private tour, Lalitpur Holidays referral)',
      createdAt: '2026-07-31'
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

// Helper to compute end date for bookings based on package duration in title/packageName
function calculateBookingEndDate(startDateStr: string, packageNameStr?: string): string {
  if (!startDateStr) return startDateStr;
  let durationDays = 1;
  if (packageNameStr) {
    const match = packageNameStr.match(/(\d+)\s*D/i) || packageNameStr.match(/(\d+)\s*Days?/i);
    if (match && match[1]) {
      durationDays = parseInt(match[1], 10);
    }
  }
  if (durationDays <= 1) return startDateStr;
  try {
    const start = new Date(startDateStr);
    if (isNaN(start.getTime())) return startDateStr;
    start.setDate(start.getDate() + (durationDays - 1));
    return start.toISOString().split('T')[0];
  } catch {
    return startDateStr;
  }
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
        const start = normalizeDate(bk.departureDate);
        const end = calculateBookingEndDate(start, bk.packageName);
        return {
          id: `bk_evt_${bk._id}`,
          title: `✈ ${bk.customerName}: ${bk.packageName} (${bk.seatsReserved} pax)`,
          start,
          end,
          startDate: start,
          endDate: end,
          type: 'TOUR',
          color: bk.status === 'CONFIRMED' ? '#10b981' : bk.status === 'CANCELLED' ? '#ef4444' : '#f59e0b',
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

      const mergedEvents = [
        ...eventsRes,
        ...departureEvents,
        ...bookingEvents,
        ...invoiceEvents,
        ...noteEvents
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

    const handleUpdate = () => {
      fetchCalendarData();
    };

    window.addEventListener('storage', handleUpdate);
    window.addEventListener('diplon_data_changed', handleUpdate);

    return () => {
      window.removeEventListener('storage', handleUpdate);
      window.removeEventListener('diplon_data_changed', handleUpdate);
    };
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
