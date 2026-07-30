import { useState, useEffect, useCallback } from 'react';
import { TourPackage } from '../../../types';
import { packageService } from '../../services/packageService';

export function usePackages() {
  const [data, setData] = useState<TourPackage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const refetch = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await packageService.getPackages();
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

  const createPackage = async (pkg: Partial<TourPackage>): Promise<TourPackage> => {
    const created = await packageService.createPackage(pkg);
    setData(prev => [created, ...prev.filter(p => p._id !== created._id)]);
    return created;
  };

  return { data, isLoading, error, refetch, createPackage };
}
