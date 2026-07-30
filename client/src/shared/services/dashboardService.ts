import { apiClient } from './apiClient';

export interface DashboardMetrics {
  totalRevenue: number;
  netProfit: number;
  activeBookings: number;
  activeFleet: number;
  chartData: Array<{ month: string; revenue: number; profit: number }>;
}

const mockMetrics: DashboardMetrics = {
  totalRevenue: 3800000,
  netProfit: 1250000,
  activeBookings: 42,
  activeFleet: 18,
  chartData: [
    { month: 'Jan', revenue: 1800000, profit: 420000 },
    { month: 'Feb', revenue: 2200000, profit: 580000 },
    { month: 'Mar', revenue: 2900000, profit: 850000 },
    { month: 'Apr', revenue: 3100000, profit: 920000 },
    { month: 'May', revenue: 2700000, profit: 710000 },
    { month: 'Jun', revenue: 3800000, profit: 1250000 },
  ],
};

export const dashboardService = {
  getSuperAdminMetrics: () => {
    return apiClient.get<DashboardMetrics>('/dashboard/super-admin', mockMetrics);
  },
};
