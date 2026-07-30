import React, { useState, useEffect } from 'react';
import { NotificationItem } from '../types/erp';

const initialNotifications: NotificationItem[] = [
  {
    id: 'notif_1',
    title: 'Customer Payment Received',
    message: 'NPR 100,000 received via eSewa for Booking #BK-9021',
    category: 'PAYMENTS',
    read: false,
    timestamp: '10 mins ago',
    severity: 'success'
  },
  {
    id: 'notif_2',
    title: 'Driver Assigned',
    message: 'Babu Driver assigned to Everest Base Camp Trek (Departure #DEP-8842)',
    category: 'DISPATCH',
    read: false,
    timestamp: '45 mins ago',
    severity: 'info'
  },
  {
    id: 'notif_3',
    title: 'Vehicle Insurance Expiring',
    message: 'Tourist Bus BA-2-PA-1234 insurance expires in 7 days',
    category: 'VEHICLES',
    read: false,
    timestamp: '2 hours ago',
    severity: 'warning'
  },
  {
    id: 'notif_4',
    title: 'Refund Request Approved',
    message: 'Credit Note CN-1092 approved for NPR 10,000 balance adjustment',
    category: 'APPROVALS',
    read: true,
    timestamp: '4 hours ago',
    severity: 'success'
  },
  {
    id: 'notif_5',
    title: 'Manifest Ready for Dispatch',
    message: 'Passenger Manifest ready for Annapurna Circuit (12 Travelers boarded)',
    category: 'TOURS',
    read: true,
    timestamp: 'Yesterday',
    severity: 'info'
  }
];

// Global Notification Store State
let globalNotifications: NotificationItem[] = [...initialNotifications];
let globalIsOpen: boolean = false;
const listeners = new Set<() => void>();

function notifyListeners() {
  listeners.forEach(l => l());
}

export function pushNotification(notif: Omit<NotificationItem, 'id' | 'timestamp' | 'read'>) {
  const newNotif: NotificationItem = {
    ...notif,
    id: `notif_${Date.now()}`,
    timestamp: 'Just now',
    read: false
  };
  globalNotifications = [newNotif, ...globalNotifications];
  notifyListeners();
}

export function toggleNotificationCenter(open?: boolean) {
  globalIsOpen = open !== undefined ? open : !globalIsOpen;
  notifyListeners();
}

export function useNotificationStore() {
  const [, tick] = useState(0);

  useEffect(() => {
    const listener = () => tick(t => t + 1);
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }, []);

  const unreadCount = globalNotifications.filter(n => !n.read).length;

  const markAsRead = (id: string) => {
    globalNotifications = globalNotifications.map(n => n.id === id ? { ...n, read: true } : n);
    notifyListeners();
  };

  const markAllAsRead = () => {
    globalNotifications = globalNotifications.map(n => ({ ...n, read: true }));
    notifyListeners();
  };

  const archiveNotification = (id: string) => {
    globalNotifications = globalNotifications.filter(n => n.id !== id);
    notifyListeners();
  };

  return {
    notifications: globalNotifications,
    unreadCount,
    isOpen: globalIsOpen,
    setIsOpen: toggleNotificationCenter,
    markAsRead,
    markAllAsRead,
    archiveNotification,
    pushNotification
  };
}
