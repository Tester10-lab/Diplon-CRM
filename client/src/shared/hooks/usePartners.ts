import { useState, useEffect, useCallback } from 'react';
import { partnerService } from '../services/partnerService';
import { Partner } from '../../types';

export const usePartners = () => {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchPartners = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await partnerService.getPartners();
      setPartners(data);
    } catch (err: any) {
      setError(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPartners();
  }, [fetchPartners]);

  return { partners, isLoading, error, refetch: fetchPartners };
};
