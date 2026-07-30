import { Customer, Inquiry, Quotation } from '../../types';
import { apiClient } from './apiClient';
import { mockCustomers, mockInquiries, mockQuotations } from '../mocks/mockCustomers';

export const customerService = {
  async getCustomers(): Promise<Customer[]> {
    return apiClient.get<Customer[]>('/customers', mockCustomers);
  },
  async getCustomerById(id: string): Promise<Customer | undefined> {
    const customers = await this.getCustomers();
    return customers.find(c => c._id === id);
  },
  async getInquiries(): Promise<Inquiry[]> {
    return apiClient.get<Inquiry[]>('/inquiries', mockInquiries);
  },
  async getQuotations(): Promise<Quotation[]> {
    return apiClient.get<Quotation[]>('/quotations', mockQuotations);
  },
  async createCustomer(customer: Partial<Customer>): Promise<Customer> {
    return apiClient.post<Customer>('/customers', customer);
  },
  async updateCustomer(id: string, customer: Partial<Customer>): Promise<Customer> {
    return apiClient.put<Customer>(`/customers/${id}`, customer);
  },
  async deleteCustomer(id: string): Promise<void> {
    return apiClient.delete<void>(`/customers/${id}`);
  }
};
