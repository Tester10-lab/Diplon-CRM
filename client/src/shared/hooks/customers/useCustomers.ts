import { useState, useEffect } from 'react';
import { Customer, Inquiry, Quotation } from '../../../types';
import { customerService } from '../../services/customerService';

export function useCustomers() {
  const [data, setData] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const refetch = async () => {
    setIsLoading(true);
    try {
      const res = await customerService.getCustomers();
      setData(res);
      setError(null);
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refetch();
  }, []);

  return { data, isLoading, error, refetch };
}

export function useInquiries() {
  const [data, setData] = useState<Inquiry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    customerService.getInquiries()
      .then(res => { setData(res); setError(null); })
      .catch(err => setError(err))
      .finally(() => setIsLoading(false));
  }, []);

  return { data, isLoading, error };
}

export function useQuotations() {
  const [data, setData] = useState<Quotation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    customerService.getQuotations()
      .then(res => { setData(res); setError(null); })
      .catch(err => setError(err))
      .finally(() => setIsLoading(false));
  }, []);

  return { data, isLoading, error };
}
