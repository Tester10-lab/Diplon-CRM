import { Partner } from '../../types';
import { apiClient } from './apiClient';
import { mockPartners } from '../mocks/mockPartners';

export const partnerService = {
  async getPartners(): Promise<Partner[]> {
    return apiClient.get<Partner[]>('/partners', mockPartners);
  },
  async createPartner(partner: Partial<Partner>): Promise<Partner> {
    return apiClient.post<Partner>('/partners', partner);
  },
  async updatePartner(id: string, partner: Partial<Partner>): Promise<Partner> {
    return apiClient.put<Partner>(`/partners/${id}`, partner);
  },
  async deletePartner(id: string): Promise<void> {
    return apiClient.delete<void>(`/partners/${id}`);
  }
};
