import { Customer, Inquiry, Quotation } from '../../types';

export const mockCustomers: Customer[] = [
  {
    _id: 'cust_chandra_01',
    firstName: 'Chandra man',
    lastName: 'Maharjan',
    email: 'chandra.maharjan@example.com',
    phone: '9802100125 / 9843500017',
    status: 'ACTIVE',
    totalBookings: 1,
    totalSpent: 87500,
    createdAt: '2026-07-31',
    address: 'Shangri-la Hotel Pickup, Kathmandu',
    notes: 'Halesi 1N/2D (25 Pax sofa bus, 85,000 Rs collect on bus)'
  },
  {
    _id: 'cust_tarak_02',
    firstName: 'Tarak',
    lastName: 'Panja',
    email: 'tarak.panja@example.com',
    phone: '9841142416',
    status: 'ACTIVE',
    totalBookings: 1,
    totalSpent: 33000,
    createdAt: '2026-07-31',
    address: 'New Road Angan Sweets Pickup, Kathmandu',
    notes: 'Jiri Tour 1N/2D (6 Pax private, 34,000 Rs collect on Scorpio)'
  },
  {
    _id: 'cust_bishnu_03',
    firstName: 'Bishnu Prasad',
    lastName: 'Kafle',
    email: 'bishnu.kafle@example.com',
    phone: '9855045297',
    status: 'ACTIVE',
    totalBookings: 1,
    totalSpent: 115500,
    createdAt: '2026-07-31',
    address: 'Bharatpur 10 Dhungana Chok near CMS',
    notes: 'Upper Mustang 4N/5D (7 Pax private, 1,21,000 Rs collect on Scorpio)'
  },
  {
    _id: 'cust_abhijit_04',
    firstName: 'Abhijit',
    lastName: 'Ghosh',
    email: 'abhijit.ghosh@example.com',
    phone: '+91 94334 68100',
    status: 'ACTIVE',
    totalBookings: 1,
    totalSpent: 44000,
    createdAt: '2026-07-31',
    address: 'Hotel Himalayan Vacation, Lakeside, Pokhara',
    notes: 'Muktinath 2N/3D (Lalitpur Holidays, 2 Pax private, 34,400 Rs collect on Scorpio)'
  }
];

export const mockInquiries: Inquiry[] = [];
export const mockQuotations: Quotation[] = [];
