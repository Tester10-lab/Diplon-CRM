import { useState, useEffect, useCallback } from 'react';
import { Departure, Vehicle, Driver, Guide } from '../../../types';
import { operationsService } from '../../services/operationsService';

export function useDepartures() {
  const [data, setData] = useState<Departure[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const refetch = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await operationsService.getDepartures();
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

  const createDeparture = async (departure: Partial<Departure>): Promise<Departure> => {
    const created = await operationsService.createDeparture(departure);
    setData(prev => [created, ...prev.filter(d => d._id !== created._id)]);
    return created;
  };

  const updateDeparture = async (id: string, departure: Partial<Departure>): Promise<Departure> => {
    // Optimistic cache update
    setData(prev => prev.map(d => (d._id === id ? { ...d, ...departure } : d)));
    const updated = await operationsService.updateDeparture(id, departure);
    // Sync with returned server response
    setData(prev => prev.map(d => (d._id === id ? { ...d, ...updated } : d)));
    return updated;
  };

  return { data, isLoading, error, refetch, createDeparture, updateDeparture };
}

export function useFleet() {
  const [data, setData] = useState<Vehicle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const refetch = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await operationsService.getVehicles();
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

  return { data, isLoading, error, refetch };
}

export function useDrivers() {
  const [data, setData] = useState<Driver[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const refetch = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await operationsService.getDrivers();
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

  return { data, isLoading, error, refetch };
}

export function useGuides() {
  const [data, setData] = useState<Guide[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const refetch = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await operationsService.getGuides();
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

  return { data, isLoading, error, refetch };
}
