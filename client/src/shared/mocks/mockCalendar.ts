import { CalendarEvent } from '../../types';

export const mockCalendarEvents: CalendarEvent[] = [
  { id: 'evt_1', title: 'Everest Base Camp Trek (DEP-8841)', start: '2026-10-01', end: '2026-10-14', resourceId: 'veh_101', type: 'DEPARTURE', status: 'CONFIRMED' },
  { id: 'evt_2', title: 'Annapurna Circuit Trek (DEP-8842)', start: '2026-10-05', end: '2026-10-17', resourceId: 'veh_102', type: 'DEPARTURE', status: 'CONFIRMED' },
  { id: 'evt_3', title: 'Langtang Valley Trek (DEP-8843)', start: '2026-09-01', end: '2026-09-10', resourceId: 'veh_103', type: 'DEPARTURE', status: 'DELAYED' },
  { id: 'evt_4', title: 'Pasang Sherpa Assignment', start: '2026-10-01', end: '2026-10-14', resourceId: 'gde_301', type: 'GUIDE', status: 'CONFIRMED' },
  { id: 'evt_5', title: 'Babu Driver Roster Shift', start: '2026-10-01', end: '2026-10-14', resourceId: 'drv_201', type: 'DRIVER', status: 'CONFIRMED' },
];
