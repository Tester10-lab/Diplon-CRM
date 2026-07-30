import { Customer, Inquiry, Quotation } from '../../types';
import { apiClient } from './apiClient';
import { mockCustomers, mockInquiries, mockQuotations } from '../mocks/mockCustomers';
import { bookingService } from './bookingService';

export const customerService = {
  async getCustomers(): Promise<Customer[]> {
    let baseCustomers = mockCustomers;
    try {
      baseCustomers = await apiClient.get<Customer[]>('/customers', mockCustomers);
    } catch (e) {}

    let bookings: any[] = [];
    try {
      bookings = await bookingService.getBookings();
    } catch (e) {}

    const customerMap = new Map<string, Customer>();

    // 1. Load base customers
    baseCustomers.forEach(c => {
      const nameKey = `${c.firstName} ${c.lastName}`.toLowerCase().trim();
      customerMap.set(nameKey, { ...c });
    });

    // 2. Sync all bookings into customer directory
    bookings.forEach(b => {
      if (!b.customerName) return;
      const nameKey = b.customerName.toLowerCase().trim();
      const existing = customerMap.get(nameKey);

      if (!existing) {
        const parts = b.customerName.split(' ');
        const firstName = parts[0] || 'Customer';
        const lastName = parts.slice(1).join(' ') || '';

        customerMap.set(nameKey, {
          _id: `cust_${b._id.replace('bk_', '')}`,
          firstName,
          lastName,
          email: `${firstName.toLowerCase()}.${lastName.toLowerCase() || 'client'}@example.com`,
          phone: b.contactPhone || '+977 9800000000',
          status: b.status === 'CANCELLED' ? 'INACTIVE' : 'ACTIVE',
          totalBookings: 1,
          totalSpent: b.totalAmount || 0,
          createdAt: b.createdAt || new Date().toISOString().split('T')[0],
          address: b.pickupPoint || 'Kathmandu, Nepal',
          notes: `Booking ref: ${b.bookingNumber} (${b.packageName})`
        });
      }
    });

    return Array.from(customerMap.values());
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
