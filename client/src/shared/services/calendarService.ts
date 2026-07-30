import { CalendarEvent } from '../../types';
import { apiClient } from './apiClient';
import { mockCalendarEvents } from '../mocks/mockCalendar';

export const calendarService = {
  async getCalendarEvents(): Promise<CalendarEvent[]> {
    return apiClient.get<CalendarEvent[]>('/operations/departures', mockCalendarEvents);
  }
};
