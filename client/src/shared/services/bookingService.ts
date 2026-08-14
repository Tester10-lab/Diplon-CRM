import { Booking } from '../../types';
import { apiClient } from './apiClient';
import { mockBookings } from '../mocks/mockBookings';
import { operationsService } from './operationsService';

const BOOKINGS_STORAGE_KEY = 'diplon_bookings_pipeline_v7';

function notifyDataChange() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('diplon_data_changed'));
    window.dispatchEvent(new Event('storage'));
  }
}

function getStoredBookings(): Booking[] {
  try {
    localStorage.removeItem('diplon_bookings_pipeline');
    localStorage.removeItem('diplon_bookings_pipeline_v3');
    localStorage.removeItem('diplon_bookings_pipeline_v4');
    localStorage.removeItem('diplon_bookings_pipeline_v5');
    localStorage.removeItem('diplon_bookings_pipeline_v6');
    const saved = localStorage.getItem(BOOKINGS_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      const cleaned = parsed.filter((b: any) => !b._id?.startsWith('bk_902'));
      if (cleaned.length > 0) {
        localStorage.setItem(BOOKINGS_STORAGE_KEY, JSON.stringify(cleaned));
        return cleaned;
      }
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
    notifyDataChange();
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
      roomDetails: booking.roomDetails,
      agencyName: booking.agencyName,
      companyId: booking.companyId,
      bookingStatus: booking.bookingStatus || 'GROUPED'
    };

    const updated = [newBooking, ...current];
    saveStoredBookings(updated);

    // Sync seats reserved on matching operation departure
    try {
      const deps = await operationsService.getDepartures();
      const matchPkg = (newBooking.packageName || '').toLowerCase();
      const matchDate = newBooking.departureDate;
      const depIndex = deps.findIndex(d => {
        const dPkg = d.packageName.toLowerCase();
        return (dPkg.includes(matchPkg) || matchPkg.includes(dPkg)) && d.startDate === matchDate;
      });
      if (depIndex !== -1) {
        const dep = deps[depIndex];
        const newReserved = (dep.seatsReserved || 0) + (newBooking.seatsReserved || 1);
        const newAvail = Math.max(0, dep.seatsTotal - newReserved);
        await operationsService.updateDeparture(dep._id, {
          seatsReserved: newReserved,
          seatsAvailable: newAvail,
          travelerCount: newReserved
        });
      }
    } catch (e) {
      console.warn('Failed to sync booking seats with departure:', e);
    }

    try {
      await apiClient.post<Booking>('/bookings', newBooking, newBooking);
    } catch (e) {
      console.warn('Backend offline or failed, using local store for booking creation', e);
    }

    notifyDataChange();
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
      const res = await apiClient.put<Booking>(`/bookings/${id}`, booking, updatedBooking);
      notifyDataChange();
      return res;
    } catch (e) {
      notifyDataChange();
      return updatedBooking;
    }
  },

  async cancelBooking(id: string): Promise<Booking> {
    const res = await this.updateBooking(id, { status: 'CANCELLED' });
    notifyDataChange();
    return res;
  }
};
