import { apiClient } from './apiClient';

export interface SystemSettings {
  companyName: string;
  companyId: string;
  branchName: string;
  branchId: string;
  currency: string;
  adminEmail: string;
}

const defaultSettings: SystemSettings = {
  companyName: 'Diplon Travels Kathmandu',
  companyId: 'cmp_diplon_01',
  branchName: 'Thamel HQ Branch',
  branchId: 'br_thamel_01',
  currency: 'NPR (Nepalese Rupee)',
  adminEmail: 'architect@diplon.com',
};

export const settingsService = {
  async getSettings(): Promise<SystemSettings> {
    return apiClient.get<SystemSettings>('/settings', defaultSettings);
  }
};
