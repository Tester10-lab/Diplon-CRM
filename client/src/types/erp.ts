export type UserRole = 'SUPER_ADMIN' | 'ADMIN' | 'AGENCY' | 'DRIVER';

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
  token?: string;
  driverSn?: number;
  assignedVehicleReg?: string;
}

export interface MetricCardData {
  title: string;
  value: string | number;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  subtitle?: string;
  iconName: string;
  badge?: string;
  deepLink?: string;
}

export interface CustomerData {
  _id: string;
  companyId?: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  status: 'ACTIVE' | 'LEAD' | 'INACTIVE';
  totalBookings: number;
  totalSpent: number;
  createdAt: string;
}

export interface BookingData {
  _id: string;
  companyId?: string;
  companyName?: string;
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

export interface DepartureData {
  _id: string;
  companyId?: string;
  isPublic?: boolean;
  isLocked?: boolean;
  packageName: string;
  startDate: string;
  endDate: string;
  seatsTotal: number;
  seatsAvailable: number;
  seatsReserved: number;
  status: 'Active' | 'Completed' | 'Cancelled' | 'Delayed' | 'Dispatched';
  travelerCount: number;
  guideName?: string;
  driverName?: string;
  vehicleReg?: string;
}

export interface VehicleData {
  _id: string;
  companyId?: string;
  name: string;
  registrationNumber: string;
  seatingCapacity: number;
  status: 'Active' | 'Inactive';
  availability: boolean;
  bluebookExpiry?: string;
  insuranceExpiry?: string;
  taxExpiry?: string;
}

export interface DriverData {
  _id: string;
  companyId?: string;
  name: string;
  licenseNumber: string;
  phone?: string;
  vehicleType?: string;
  tripsCompleted?: number;
  remainingBalance?: number;
  assignedTour?: string;
  scheduleDate?: string;
  performanceRating: number;
  leaveBalance: number;
  status: 'Active' | 'Inactive';
  availability: boolean;
  licenseExpiry?: string;
}

export interface GuideData {
  _id: string;
  companyId?: string;
  name: string;
  rating: number;
  languages: string[];
  certifications: string[];
  status: 'Active' | 'Inactive';
  availability: boolean;
}

export interface InvoiceData {
  _id: string;
  companyId?: string;
  invoiceNumber: string;
  customerName: string;
  totalAmount: number;
  paidAmount: number;
  balanceDue: number;
  status: 'ISSUED' | 'PARTIALLY_PAID' | 'PAID' | 'REFUNDED' | 'CANCELLED';
  issueDate: string;
  dueDate: string;
}

export interface CustomPriceRequest {
  id: string;
  agencyCompanyId: string;
  agencyName: string;
  packageName: string;
  pax: number;
  travelDate: string;
  requestedPrice: number;
  quotedPrice?: number;
  status: 'PENDING' | 'QUOTED' | 'APPROVED' | 'REJECTED';
  adminNotes?: string;
  createdAt: string;
}

export interface AgencySettlement {
  id: string;
  agencyCompanyId: string;
  agencyName: string;
  requestedAmount: number;
  totalCollections: number;
  totalExpenses: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'PAID';
  notes?: string;
  createdAt: string;
  settledAt?: string;
}

export interface DriverTripSettlement {
  id: string;
  driverId: string;
  driverName: string;
  tourName: string;
  travelDate: string;
  totalCollected: number; // On-tour cash collected from customers
  totalExpenses: number;  // Fuel, toll tax, driver allowance, hotel
  netBalance: number;     // Collected - Expenses
  requestType: 'REIMBURSEMENT_PAYMENT' | 'CASH_SUBMISSION';
  requestedAmount: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'PAID';
  notes?: string;
  createdAt: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  category: 'PAYMENTS' | 'TOURS' | 'DISPATCH' | 'FINANCE' | 'CRM' | 'APPROVALS' | 'DRIVERS' | 'VEHICLES';
  read: boolean;
  timestamp: string;
  link?: string;
  severity?: 'info' | 'success' | 'warning' | 'error';
}

export interface CommandItemData {
  id: string;
  title: string;
  subtitle?: string;
  category: 'Customer' | 'Booking' | 'Driver' | 'Vehicle' | 'Tour' | 'Package' | 'Invoice' | 'Action';
  icon: string;
  action: () => void;
}
