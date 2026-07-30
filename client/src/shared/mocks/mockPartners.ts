import { Partner } from '../../types';

export const mockPartners: Partner[] = [
  { _id: 'prt_501', companyName: 'Himalayan Treks Germany GmbH', contactPerson: 'Hans Weber', email: 'hans@himalayan-de.com', phone: '+49-30-123456', commissionRate: 15, totalBookings: 18, totalEarnings: 1250000, status: 'ACTIVE' },
  { _id: 'prt_502', companyName: 'Alpine Adventures UK Ltd', contactPerson: 'Sarah Jenkins', email: 'sarah@alpine-uk.co.uk', phone: '+44-20-7946-0912', commissionRate: 12, totalBookings: 12, totalEarnings: 840000, status: 'ACTIVE' },
  { _id: 'prt_503', companyName: 'Tokyo Nepal Travel Agency', contactPerson: 'Kenji Sato', email: 'sato@tokyo-nepal.jp', phone: '+81-3-5555-0143', commissionRate: 10, totalBookings: 8, totalEarnings: 450000, status: 'ACTIVE' },
];
