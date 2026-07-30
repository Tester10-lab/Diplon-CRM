import React, { useState } from 'react';
import { useBookings } from '../shared/hooks/bookings/useBookings';
import { DataTable, Column } from '../components/tables/DataTable';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { BookingModal } from '../components/bookings/BookingModal';
import { BookingData } from '../types/erp';
import { PageSkeleton } from '../components/feedback/Skeleton';
import { ErrorState } from '../components/feedback/ErrorState';
import { Plus, Phone, MapPin, Calendar, CreditCard, Sparkles, CheckCircle2 } from 'lucide-react';

export const BookingsPage: React.FC = () => {
  const { data: bookings, isLoading, error, refetch, createBooking } = useBookings();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleSaveBooking = async (bookingData: Partial<BookingData>) => {
    await createBooking(bookingData as any);
    setToastMessage(`Booking created successfully for ${bookingData.customerName}!`);
    setTimeout(() => setToastMessage(null), 4000);
  };

  if (isLoading) return <PageSkeleton />;
  if (error) return <ErrorState message={error.message} onRetry={refetch} />;

  const columns: Column<BookingData>[] = [
    {
      key: 'bookingNumber',
      header: 'Booking Ref',
      accessor: b => (
        <div>
          <div className="font-mono text-[#B9F000] font-black flex items-center gap-1.5">
            <span>{b.bookingNumber}</span>
          </div>
          <div className="text-[11px] text-slate-400">{b.createdAt}</div>
        </div>
      )
    },
    {
      key: 'customerName',
      header: 'Customer Details',
      accessor: b => (
        <div>
          <div className="font-bold text-white">{b.customerName}</div>
          {b.contactPhone && (
            <div className="text-[11px] text-slate-400 flex items-center gap-1">
              <Phone className="w-3 h-3 text-[#B9F000]" />
              <span>{b.contactPhone}</span>
            </div>
          )}
        </div>
      )
    },
    {
      key: 'packageName',
      header: 'Package & Travel Details',
      accessor: b => (
        <div>
          <div className="font-semibold text-slate-900 dark:text-slate-100">{b.packageName}</div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-2 mt-0.5">
            <span className="flex items-center gap-1"><Calendar className="w-3 h-3 text-amber-500" /> {b.departureDate}</span>
            <span>•</span>
            <span className="font-bold text-indigo-600 dark:text-indigo-400">{b.seatsReserved} Pax</span>
            {b.groupType && (
              <span className="uppercase text-[9px] px-1.5 py-0.5 rounded font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                {b.groupType}
              </span>
            )}
          </div>
          {b.pickupPoint && (
            <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
              <MapPin className="w-3 h-3 text-rose-500 shrink-0" />
              <span className="truncate">{b.pickupPoint}</span>
            </div>
          )}
        </div>
      )
    },
    {
      key: 'status',
      header: 'Status',
      accessor: b => (
        <Badge variant={b.status === 'CONFIRMED' ? 'success' : b.status === 'PENDING' ? 'warning' : 'info'} dot>
          {b.status}
        </Badge>
      )
    },
    {
      key: 'totalAmount',
      header: 'Financial Summary',
      accessor: b => {
        const remaining = (b.remainingAmount !== undefined) 
          ? b.remainingAmount 
          : Math.max(0, b.totalAmount - b.paidAmount);

        return (
          <div className="space-y-0.5">
            <div className="font-extrabold font-mono text-slate-900 dark:text-slate-100">
              NPR {b.totalAmount.toLocaleString()}
            </div>
            <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
              Adv Paid: NPR {b.paidAmount.toLocaleString()}
            </div>
            {remaining > 0 ? (
              <div className="text-[11px] text-amber-600 dark:text-amber-400 font-bold flex items-center gap-1">
                <CreditCard className="w-3 h-3" />
                <span>Collect: NPR {remaining.toLocaleString()}</span>
              </div>
            ) : (
              <div className="text-[10px] text-emerald-500 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Fully Settled
              </div>
            )}
            {b.paymentCollectionNote && (
              <div className="text-[10px] text-slate-400 italic truncate max-w-xs" title={b.paymentCollectionNote}>
                {b.paymentCollectionNote}
              </div>
            )}
          </div>
        );
      }
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in select-none">
      {/* Page Header with Action Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-[#161D2B] border border-[#232D42] shadow-xl">
        <div>
          <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
            <span>Bookings & Reservations Pipeline</span>
            <span className="text-xs bg-[#B9F000]/20 text-[#B9F000] font-black px-3 py-0.5 rounded-full border border-[#B9F000]/40">
              {bookings.length} Total
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Track active tour reservations, autoselect or create packages, and manage remaining driver collections
          </p>
        </div>

        <Button
          variant="primary"
          onClick={() => setIsModalOpen(true)}
          className="bg-[#B9F000] hover:bg-[#a6d800] text-slate-950 font-black px-4 py-2.5 rounded-2xl shadow-lg shadow-[#B9F000]/25 flex items-center gap-2 shrink-0"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>New Booking Confirmation</span>
        </Button>
      </div>

      {/* Success Toast */}
      {toastMessage && (
        <div className="bg-emerald-600 text-white px-4 py-3 rounded-xl shadow-lg flex items-center gap-3 animate-fade-in font-medium text-xs">
          <Sparkles className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Bookings Data Table */}
      <DataTable
        title="Active Tour Reservations"
        description="All confirmed and pending customer bookings with seat count, vehicle collect note, and payment status"
        data={bookings as any}
        columns={columns}
        searchPlaceholder="Search bookings by customer name, package, contact number, or ref..."
      />

      {/* Booking Modal */}
      <BookingModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSaveBooking={handleSaveBooking}
      />
    </div>
  );
};
