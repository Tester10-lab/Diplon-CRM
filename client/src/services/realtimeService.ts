import { NotificationItem } from '../types/erp';

export type RealtimeEventType =
  | 'NEW_BOOKING'
  | 'PAYMENT_RECEIVED'
  | 'DRIVER_ASSIGNED'
  | 'TOUR_STATUS_CHANGED'
  | 'APPROVAL_COMPLETED'
  | 'INVENTORY_ALERT';

export interface RealtimeEventPayload {
  type: RealtimeEventType;
  title: string;
  message: string;
  category: 'PAYMENTS' | 'TOURS' | 'DISPATCH' | 'FINANCE' | 'CRM' | 'APPROVALS' | 'DRIVERS' | 'VEHICLES';
  timestamp: string;
}

type EventCallback = (event: RealtimeEventPayload) => void;

class RealtimeService {
  private listeners: Map<string, EventCallback[]> = new Map();

  public subscribe(eventType: string, callback: EventCallback) {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, []);
    }
    this.listeners.get(eventType)!.push(callback);

    return () => {
      const callbacks = this.listeners.get(eventType);
      if (callbacks) {
        this.listeners.set(eventType, callbacks.filter(cb => cb !== callback));
      }
    };
  }

  public emit(eventType: RealtimeEventType, payload: Omit<RealtimeEventPayload, 'type'>) {
    const fullPayload: RealtimeEventPayload = {
      type: eventType,
      ...payload
    };

    const callbacks = this.listeners.get(eventType) || [];
    callbacks.forEach(cb => cb(fullPayload));

    const wildcardCallbacks = this.listeners.get('*') || [];
    wildcardCallbacks.forEach(cb => cb(fullPayload));
  }
}

export const realtimeService = new RealtimeService();
