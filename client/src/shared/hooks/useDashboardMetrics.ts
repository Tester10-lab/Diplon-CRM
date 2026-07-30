import { useState, useEffect, useCallback } from 'react';
import { dashboardService, DashboardMetrics } from '../services/dashboardService';

export const useDashboardMetrics = () => {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchMetrics = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await dashboardService.getSuperAdminMetrics();
      setMetrics(data);
    } catch (err: any) {
      setError(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMetrics();
  }, [fetchMetrics]);

  return { metrics, isLoading, error, refetch: fetchMetrics };
};
