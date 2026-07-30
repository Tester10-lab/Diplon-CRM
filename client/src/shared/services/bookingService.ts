import { Booking } from '../../types';
import { apiClient } from './apiClient';
import { mockBookings } from '../mocks/mockBookings';

const BOOKINGS_STORAGE_KEY = 'diplon_bookings_pipeline';

function getStoredBookings(): Booking[] {
  try {
    const saved = localStorage.getItem(BOOKINGS_STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error('Failed to parse stored bookings:', e);
  }
  localStorage.setItem(BOOKINGS_STORAGE_KEY, JSON.stringify(mockBookings));
  return mockBookings;
}

function saveStoredBookings(bookings: Booking[]) {
  try {
    localStorage.setItem(BOOKINGS_STORAGE_KEY, JSON.stringify(bookings));
  } catch (e) {
    console.error('Failed to save bookings to localStorage:', e);
  }
}

export const bookingService = {
  async getBookings(): Promise<Booking[]> {
    const fallback = getStoredBookings();
    return apiClient.get<Booking[]>('/bookings', fallback);
  },

  async getBookingById(id: string): Promise<Booking | undefined> {
    const bookings = await this.getBookings();
    return bookings.find(b => b._id === id);
  },

  async createBooking(booking: Partial<Booking>): Promise<Booking> {
    const current = getStoredBookings();
    const newBooking: Booking = {
      _id: `bk_${Date.now()}`,
      bookingNumber: `BK-${Math.floor(1000 + Math.random() * 9000)}`,
      customerName: booking.customerName || 'Anonymous Traveler',
      packageName: booking.packageName || 'Custom Package',
      departureDate: booking.departureDate || new Date().toISOString().split('T')[0],
      seatsReserved: booking.seatsReserved || 1,
      totalAmount: booking.totalAmount || 0,
      paidAmount: booking.paidAmount || 0,
      status: booking.status || 'CONFIRMED',
      createdAt: new Date().toISOString().split('T')[0],
      contactPhone: booking.contactPhone,
      pickupPoint: booking.pickupPoint,
      ratePerPerson: booking.ratePerPerson,
      advanceAmount: booking.advanceAmount,
      remainingAmount: booking.remainingAmount,
      paymentCollectionNote: booking.paymentCollectionNote,
      groupType: booking.groupType,
      roomDetails: booking.roomDetails
    };

    const updated = [newBooking, ...current];
    saveStoredBookings(updated);

    try {
      await apiClient.post<Booking>('/bookings', newBooking, newBooking);
    } catch (e) {
      console.warn('Backend offline or failed, using local store for booking creation', e);
    }

    return newBooking;
  },

  async updateBooking(id: string, booking: Partial<Booking>): Promise<Booking> {
    const current = getStoredBookings();
    const index = current.findIndex(b => b._id === id);
    let updatedBooking: Booking;
    if (index !== -1) {
      current[index] = { ...current[index], ...booking };
      updatedBooking = current[index];
    } else {
      updatedBooking = { ...booking, _id: id } as Booking;
      current.unshift(updatedBooking);
    }
    saveStoredBookings(current);

    try {
      return await apiClient.put<Booking>(`/bookings/${id}`, booking, updatedBooking);
    } catch (e) {
      return updatedBooking;
    }
  },

  async cancelBooking(id: string): Promise<Booking> {
    return this.updateBooking(id, { status: 'CANCELLED' });
  }
};
