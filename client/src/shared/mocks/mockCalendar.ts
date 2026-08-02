import { CalendarEvent } from '../../types';

export const mockCalendarEvents: CalendarEvent[] = [
  {
    id: 'evt_halesi_01',
    title: '🚌 Halesi Tour Package (25 Pax Sofa Bus)',
    start: '2026-08-01',
    end: '2026-08-02',
    startDate: '2026-08-01',
    endDate: '2026-08-02',
    resourceId: 'veh_halesi',
    type: 'DEPARTURE',
    status: 'CONFIRMED'
  },
  {
    id: 'evt_jiri_02',
    title: '🚙 Jiri Tour (6 Pax Private)',
    start: '2026-08-01',
    end: '2026-08-02',
    startDate: '2026-08-01',
    endDate: '2026-08-02',
    resourceId: 'veh_jiri',
    type: 'DEPARTURE',
    status: 'CONFIRMED'
  },
  {
    id: 'evt_muktinath_03',
    title: '🚙 Muktinath Tour (Lalitpur Holidays - 2 Pax)',
    start: '2026-10-25',
    end: '2026-10-27',
    startDate: '2026-10-25',
    endDate: '2026-10-27',
    resourceId: 'veh_muktinath',
    type: 'DEPARTURE',
    status: 'CONFIRMED'
  },
  {
    id: 'evt_mustang_04',
    title: '🏔️ Upper Mustang Package (7 Pax Private)',
    start: '2026-10-28',
    end: '2026-11-01',
    startDate: '2026-10-28',
    endDate: '2026-11-01',
    resourceId: 'veh_mustang',
    type: 'DEPARTURE',
    status: 'CONFIRMED'
  }
];
