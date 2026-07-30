import { Customer, Inquiry, Quotation } from '../../types';

export const mockCustomers: Customer[] = [
  { _id: 'cust_101', firstName: 'Ram', lastName: 'Shrestha', email: 'ram.shrestha@example.com', phone: '+977-9841000000', status: 'ACTIVE', totalBookings: 4, totalSpent: 650000, createdAt: '2026-01-10', address: 'Kathmandu, Nepal', notes: 'VIP frequent trekking client' },
  { _id: 'cust_102', firstName: 'Sita', lastName: 'Karki', email: 'sita.karki@example.com', phone: '+977-9851000000', status: 'ACTIVE', totalBookings: 2, totalSpent: 300000, createdAt: '2026-02-15', address: 'Pokhara, Nepal', notes: 'Prefers 4-star hotel accommodations' },
  { _id: 'cust_103', firstName: 'Hari', lastName: 'Gurung', email: 'hari.gurung@example.com', phone: '+977-9861000000', status: 'LEAD', totalBookings: 0, totalSpent: 0, createdAt: '2026-03-01', address: 'Lalitpur, Nepal', notes: 'Inquired for Langtang Valley Trek' },
  { _id: 'cust_104', firstName: 'Anita', lastName: 'Thapa', email: 'anita.thapa@example.com', phone: '+977-9811000000', status: 'ACTIVE', totalBookings: 1, totalSpent: 180000, createdAt: '2026-03-20', address: 'Bhaktapur, Nepal' },
  { _id: 'cust_105', firstName: 'John', lastName: 'Smith', email: 'john.smith@example.org', phone: '+1-555-0192', status: 'ACTIVE', totalBookings: 3, totalSpent: 850000, createdAt: '2026-04-05', address: 'London, UK', notes: 'International expedition booking' },
];

export const mockInquiries: Inquiry[] = [
  { _id: 'inq_201', customerName: 'Hari Gurung', email: 'hari.gurung@example.com', phone: '+977-9861000000', packageName: 'Langtang Valley Trek 9 Days', paxCount: 4, travelDate: '2026-10-15', status: 'NEW', createdAt: '2026-07-20' },
  { _id: 'inq_202', customerName: 'David Miller', email: 'david.m@example.com', phone: '+44-7700-900', packageName: 'Everest Base Camp Helicopter Return', paxCount: 2, travelDate: '2026-11-01', status: 'QUOTED', createdAt: '2026-07-22' },
  { _id: 'inq_203', customerName: 'Sophia Chen', email: 'sophia.c@example.com', phone: '+65-9123-4567', packageName: 'Annapurna Circuit Full Trek', paxCount: 6, travelDate: '2026-10-10', status: 'FOLLOW_UP', createdAt: '2026-07-24' },
];

export const mockQuotations: Quotation[] = [
  { _id: 'qte_301', quotationNumber: 'QTE-2026-001', customerName: 'David Miller', packageName: 'Everest Base Camp Helicopter Return', totalAmount: 500000, discount: 25000, netAmount: 475000, validUntil: '2026-08-15', status: 'SENT', createdAt: '2026-07-23' },
  { _id: 'qte_302', quotationNumber: 'QTE-2026-002', customerName: 'Sophia Chen', packageName: 'Annapurna Circuit Full Trek', totalAmount: 720000, discount: 50000, netAmount: 670000, validUntil: '2026-08-20', status: 'DRAFT', createdAt: '2026-07-25' },
];
