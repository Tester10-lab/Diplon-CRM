export type UserRole = 'SUPER_ADMIN' | 'SALES' | 'OPERATIONS' | 'FINANCE';

export interface UserContext {
  userId: string;
  name: string;
  email: string;
  role: UserRole;
  companyId: string;
  companyName: string;
  branchId: string;
  branchName: string;
  avatarUrl?: string;
}

export interface Customer {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  status: 'ACTIVE' | 'LEAD' | 'INACTIVE';
  totalBookings: number;
  totalSpent: number;
  createdAt: string;
  address?: string;
  notes?: string;
}

export interface Inquiry {
  _id: string;
  customerName: string;
  email: string;
  phone: string;
  packageName: string;
  paxCount: number;
  travelDate: string;
  status: 'NEW' | 'QUOTED' | 'FOLLOW_UP' | 'CONVERTED' | 'LOST';
  createdAt: string;
}

export interface Quotation {
  _id: string;
  quotationNumber: string;
  customerName: string;
  packageName: string;
  totalAmount: number;
  discount: number;
  netAmount: number;
  validUntil: string;
  status: 'DRAFT' | 'SENT' | 'ACCEPTED' | 'REJECTED';
  createdAt: string;
}

export interface TourPackage {
  _id: string;
  name: string;
  category?: string;
  durationDays?: number;
  basePricing: number;
  description?: string;
  itinerary?: string;
  createdAt?: string;
}

export interface Booking {
  _id: string;
  bookingNumber: string;
  customerName: string;
  packageName: string;
  departureDate: string;
  seatsReserved: number;
  totalAmount: number;
  paidAmount: number;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED' | 'WAITLISTED';
  createdAt: string;
  contactPhone?: string;
  pickupPoint?: string;
  ratePerPerson?: number;
  advanceAmount?: number;
  remainingAmount?: number;
  paymentCollectionNote?: string;
  groupType?: 'private' | 'sharing';
  roomDetails?: string;
}

export interface Departure {
  _id: string;
  packageName: string;
  startDate: string;
  endDate: string;
  seatsTotal: number;
  seatsAvailable: number;
  seatsReserved: number;
  status: 'Active' | 'Completed' | 'Cancelled' | 'Delayed';
  travelerCount: number;
  guideName?: string;
  driverName?: string;
  vehicleReg?: string;
}

export interface Vehicle {
  _id: string;
  name: string;
  registrationNumber: string;
  seatingCapacity: number;
  status: 'Active' | 'Inactive';
  availability: boolean;
  bluebookExpiry?: string;
  insuranceExpiry?: string;
  taxExpiry?: string;
}

export interface Driver {
  _id: string;
  name: string;
  licenseNumber: string;
  phone?: string;
  vehicleType?: string;
  tripsCompleted?: number;
  remainingBalance?: number;
  performanceRating: number;
  leaveBalance: number;
  status: 'Active' | 'Inactive';
  availability: boolean;
  licenseExpiry?: string;
}

export interface Guide {
  _id: string;
  name: string;
  rating: number;
  languages: string[];
  certifications: string[];
  status: 'Active' | 'Inactive';
  availability: boolean;
}

export interface Invoice {
  _id: string;
  invoiceNumber: string;
  customerName: string;
  totalAmount: number;
  paidAmount: number;
  balanceDue: number;
  status: 'ISSUED' | 'PARTIALLY_PAID' | 'PAID' | 'REFUNDED' | 'CANCELLED';
  issueDate: string;
  dueDate: string;
}

export interface Expense {
  _id: string;
  category: string;
  description: string;
  amount: number;
  paymentMode: string;
  status: 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED';
  date: string;
}

export interface Partner {
  _id: string;
  companyName: string;
  contactPerson: string;
  email: string;
  phone: string;
  commissionRate: number;
  totalBookings: number;
  totalEarnings: number;
  status: 'ACTIVE' | 'INACTIVE';
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  category: 'PAYMENTS' | 'TOURS' | 'DISPATCH' | 'FINANCE' | 'CRM' | 'APPROVALS' | 'DRIVERS' | 'VEHICLES';
  read: boolean;
  timestamp: string;
  severity?: 'info' | 'success' | 'warning' | 'error';
}

export interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  startDate?: string;
  endDate?: string;
  color?: string;
  resourceId?: string;
  type: 'DEPARTURE' | 'DRIVER' | 'VEHICLE' | 'GUIDE' | 'TOUR' | 'PAYMENT' | 'MAINTENANCE' | 'LEAVE';
  status: 'CONFIRMED' | 'PENDING' | 'DELAYED' | 'PAID' | 'CANCELLED' | 'ISSUED' | 'PARTIALLY_PAID' | 'REFUNDED';
}
