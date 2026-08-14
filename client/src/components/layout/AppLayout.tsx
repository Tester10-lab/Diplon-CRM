import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { NotificationCenter } from '../notifications/NotificationCenter';
import { useAuthStore } from '../../store/authStore';
import { useGlobalModals } from '../../store/modalStore';
import { BookingModal } from '../bookings/BookingModal';
import { bookingService } from '../../shared/services/bookingService';

export interface AppLayoutProps {
  children: React.ReactNode;
  currentPath: string;
  onNavigate: (path: string) => void;
  onLogout?: () => void;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children, currentPath, onNavigate, onLogout }) => {
  const { logout } = useAuthStore();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const modals = useGlobalModals();

  const handleLogout = () => {
    logout();
    if (onLogout) onLogout();
  };

  const handleSaveGlobalBooking = async (bookingData: any) => {
    try {
      await bookingService.createBooking({
        customerName: bookingData.customerName || 'New Guest',
        contactPhone: bookingData.contactPhone || '',
        packageName: bookingData.packageName || 'Halesi Tour Package (1N/2D)',
        departureDate: bookingData.departureDate || '2026-08-01',
        pickupPoint: bookingData.pickupPoint || '',
        seatsReserved: bookingData.seatsReserved || 1,
        totalAmount: bookingData.totalAmount || 0,
        paidAmount: bookingData.advanceAmount || 0,
        status: 'CONFIRMED'
      });
      modals.closeBookingModal();
      window.dispatchEvent(new Event('storage'));
    } catch (e) {
      console.error('Failed to create booking:', e);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex antialiased selection:bg-white selection:text-black">
      {/* Sidebar Navigation */}
      <Sidebar
        currentPath={currentPath}
        onNavigate={(path) => {
          onNavigate(path);
          setIsMobileOpen(false);
        }}
        onLogout={handleLogout}
        isMobileOpen={isMobileOpen}
        onCloseMobile={() => setIsMobileOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-black pb-20 md:pb-0">
        {/* Header Topbar */}
        <Topbar
          onLogout={handleLogout}
          onToggleMobileMenu={() => setIsMobileOpen(!isMobileOpen)}
          isMobileOpen={isMobileOpen}
        />

        {/* Viewport Content */}
        <main className="flex-1 p-3 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-4 sm:space-y-6 overflow-x-hidden">
          {children}
        </main>
      </div>

      {/* Notification Center */}
      <NotificationCenter />

      {/* Global Booking Modal */}
      <BookingModal
        isOpen={modals.isBookingModalOpen}
        onClose={modals.closeBookingModal}
        onSaveBooking={handleSaveGlobalBooking}
      />
    </div>
  );
};
