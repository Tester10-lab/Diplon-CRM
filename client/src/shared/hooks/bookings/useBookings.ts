import { useState, useEffect, useCallback } from 'react';
import { Booking } from '../../../types';
import { bookingService } from '../../services/bookingService';

export function useBookings() {
  const [data, setData] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const refetch = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await bookingService.getBookings();
      setData(res);
      setError(null);
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  const createBooking = async (booking: Partial<Booking>): Promise<Booking> => {
    const created = await bookingService.createBooking(booking);
    setData(prev => [created, ...prev.filter(b => b._id !== created._id)]);
    return created;
  };

  return { data, isLoading, error, refetch, createBooking };
}
