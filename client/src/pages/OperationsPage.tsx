import React, { useState } from 'react';
import { useDepartures, useFleet, useDrivers, useGuides } from '../shared/hooks/operations/useOperations';
import { useAuthStore } from '../store/authStore';
import { DataTable, Column } from '../components/tables/DataTable';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { AddTourModal } from '../components/operations/AddTourModal';
import { AssignDispatchModal } from '../components/operations/AssignDispatchModal';
import { BookingModal } from '../components/bookings/BookingModal';
import { useBookings } from '../shared/hooks/bookings/useBookings';
import { DepartureData } from '../types/erp';
import { PageSkeleton } from '../components/feedback/Skeleton';
import { ErrorState } from '../components/feedback/ErrorState';
import { Plus, Compass, Calendar, Users, Car, UserCheck, Sparkles, UserPlus, Lock, Unlock, ShieldCheck, CheckCircle2, UserSquare2 } from 'lucide-react';

export const OperationsPage: React.FC = () => {
  const { user } = useAuthStore();
  const { data: departures, isLoading, error, refetch, createDeparture, updateDeparture } = useDepartures();
  const { data: vehicles } = useFleet();
  const { data: drivers } = useDrivers();
  const { data: guides } = useGuides();
  const { createBooking } = useBookings();

  const isSuperAdmin = user.role === 'SUPER_ADMIN';
  const isAgency = user.role === 'AGENCY';

  const [isAddTourModalOpen, setIsAddTourModalOpen] = useState(false);
  const [isAddCustomerModalOpen, setIsAddCustomerModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [targetDeparture, setTargetDeparture] = useState<DepartureData | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [lockedTourIds, setLockedTourIds] = useState<Record<string, boolean>>({
    'dep_mustang_001': true // Dispatched Mustang tour is locked by default
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleSaveTour = async (tourData: Partial<DepartureData>) => {
    const isPublic = !isAgency; // Admin tours are public to all agencies, agency tours are private
    await createDeparture({
      ...tourData,
      companyId: user.companyId,
      isPublic
    } as any);

    showToast(`Scheduled new tour departure for ${tourData.packageName}!`);
    refetch();
  };

  const handleOpenAssignModal = (dep: DepartureData) => {
    setTargetDeparture(dep);
    setIsAssignModalOpen(true);
  };

  const handleSaveAssignment = async (departureId: string, updates: any) => {
    await updateDeparture(departureId, updates);

    if (updates.status === 'Dispatched') {
      setLockedTourIds(prev => ({ ...prev, [departureId]: true }));
      showToast(`🔒 Tour dispatched! Driver ${updates.driverName} & vehicle locked.`);
    } else {
      showToast(`✅ Resource assignment saved! Driver ${updates.driverName} assigned to tour.`);
    }

    refetch();
  };

  const handleOpenAddCustomer = (dep: DepartureData) => {
    const isLocked = dep.status === 'Dispatched' || lockedTourIds[dep._id];
    if (isLocked && !isSuperAdmin) {
      showToast(`🔒 Tour is Dispatched & Locked! Only Super Admin can unlock.`);
      return;
    }
    setTargetDeparture(dep);
    setIsAddCustomerModalOpen(true);
  };

  const handleToggleLockTour = (depId: string) => {
    if (!isSuperAdmin) return;
    const isNowLocked = !lockedTourIds[depId];
    setLockedTourIds(prev => ({ ...prev, [depId]: isNowLocked }));
    showToast(isNowLocked ? `🔒 Tour departure locked.` : `🔓 Dispatched tour UNLOCKED by Super Admin authorization.`);
  };

  const handleSaveCustomerBooking = async (bookingData: any) => {
    await createBooking(bookingData);
    
    if (targetDeparture) {
      const addedPax = Number(bookingData.seatsReserved) || 1;
      const newReserved = (targetDeparture.seatsReserved || 0) + addedPax;
      const newAvailable = Math.max(0, targetDeparture.seatsTotal - newReserved);

      await updateDeparture(targetDeparture._id, {
        seatsReserved: newReserved,
        seatsAvailable: newAvailable,
        travelerCount: newReserved
      });
    }

    setIsAddCustomerModalOpen(false);
    showToast(`Customer ${bookingData.customerName} added to tour!`);
    refetch();
  };

  if (isLoading) return <PageSkeleton />;
  if (error) return <ErrorState message={error.message} onRetry={refetch} />;

  // Multi-Tenant Data Filtering
  const visibleDepartures = departures.filter(d => {
    if (!isAgency) return true;
    return d.isPublic !== false || d.companyId === user.companyId;
  });

  const columns: Column<DepartureData>[] = [
    {
      key: 'packageName',
      header: 'Tour Package & Visibility',
      accessor: d => (
        <div className="space-y-1">
          <div className="font-bold text-white flex items-center gap-2">
            <Compass className="w-4 h-4 text-amber-400 shrink-0" />
            <span>{d.packageName}</span>
          </div>
          <div className="flex items-center gap-1 text-[10px] text-slate-400 font-mono">
            <span>Ref: {d._id}</span>
            <span>•</span>
            <span className={d.isPublic !== false ? 'text-indigo-400 font-bold' : 'text-emerald-400 font-bold'}>
              {d.isPublic !== false ? '🌐 Public Departure' : '🔒 Agency Private'}
            </span>
          </div>
        </div>
      )
    },
    {
      key: 'dates',
      header: 'Schedule Dates',
      accessor: d => (
        <div className="text-xs space-y-0.5">
          <div className="font-semibold text-white flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-amber-400" />
            <span>{d.startDate}</span>
          </div>
          <div className="text-[11px] text-slate-400">Return: {d.endDate || d.startDate}</div>
        </div>
      )
    },
    {
      key: 'status',
      header: 'Tour & Dispatch Status',
      accessor: d => {
        const isDispatched = d.status === 'Dispatched' || lockedTourIds[d._id];
        const isAssigned = Boolean(d.driverName && d.driverName !== 'Unassigned');

        return (
          <div className="space-y-1">
            <Badge variant={isDispatched ? 'danger' : isAssigned ? 'success' : 'neutral'} dot>
              {isDispatched ? 'Dispatched' : d.status}
            </Badge>

            {isDispatched ? (
              <div className="text-[10px] font-extrabold text-amber-300 flex items-center gap-1 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">
                <Lock className="w-3 h-3 text-amber-400" />
                <span>Assigned & Locked</span>
              </div>
            ) : isAssigned ? (
              <div className="text-[10px] font-bold text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                <span>Roster Assigned</span>
              </div>
            ) : (
              <div className="text-[10px] font-semibold text-slate-400 italic">
                Unassigned
              </div>
            )}
          </div>
        );
      }
    },
    {
      key: 'dispatch',
      header: 'Assigned Roster',
      accessor: d => {
        const isAssigned = Boolean(d.driverName && d.driverName !== 'Unassigned');
        return (
          <div className="text-xs space-y-1">
            <div className="flex items-center gap-1.5 text-slate-200">
              <UserSquare2 className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
              <span>
                <strong className="font-semibold">{d.driverName || 'Unassigned'}</strong>
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-400">
              <Car className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>Vehicle: {d.vehicleReg || 'Unassigned'}</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-400">
              <UserCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Guide: {d.guideName || 'Unassigned'}</span>
            </div>
          </div>
        );
      }
    },
    {
      key: 'actions',
      header: 'Enterprise Dispatch & Actions',
      accessor: d => {
        const isLocked = d.status === 'Dispatched' || lockedTourIds[d._id];
        const isAssigned = Boolean(d.driverName && d.driverName !== 'Unassigned');

        return (
          <div className="flex items-center gap-2">
            {/* Assign / View Assignment Button */}
            <Button
              size="sm"
              variant={isAssigned ? "secondary" : "primary"}
              className={`text-xs font-black flex items-center gap-1.5 ${
                isAssigned
                  ? 'bg-[#161D2B] text-slate-200 hover:bg-[#232D42] border-[#232D42]'
                  : 'bg-[#B9F000] hover:bg-[#a6d800] text-slate-950 shadow-lg shadow-[#B9F000]/25'
              }`}
              onClick={() => handleOpenAssignModal(d)}
            >
              {isLocked ? (
                <Lock className="w-3.5 h-3.5 text-amber-400" />
              ) : (
                <UserCheck className="w-3.5 h-3.5 text-[#B9F000]" />
              )}
              <span>{isAssigned ? 'View Assignment' : 'Assign'}</span>
            </Button>

            {!isLocked && (
              <Button
                size="sm"
                variant="secondary"
                className="bg-[#B9F000]/10 text-[#B9F000] hover:bg-[#B9F000] hover:text-slate-950 border-[#B9F000]/30 text-xs font-bold flex items-center gap-1"
                onClick={() => handleOpenAddCustomer(d)}
                title="Add Passengers to Departure"
              >
                <UserPlus className="w-3.5 h-3.5" />
              </Button>
            )}

            {isSuperAdmin && (
              <button
                onClick={() => handleToggleLockTour(d._id)}
                className={`p-1.5 rounded-xl border text-xs font-bold transition-all ${
                  isLocked
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 hover:bg-amber-500 hover:text-slate-950'
                    : 'bg-[#161D2B] text-slate-400 hover:text-white border-[#232D42]'
                }`}
                title={isLocked ? 'Super Admin: Unlock Dispatched Tour' : 'Lock Departure'}
              >
                {isLocked ? <Unlock className="w-3.5 h-3.5 text-amber-300" /> : <Lock className="w-3.5 h-3.5" />}
              </button>
            )}
          </div>
        );
      }
    }
  ];

  return (
    <div className="space-y-6 animate-fade-in select-none">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-[#161D2B] border border-[#232D42] shadow-xl">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            <Compass className="w-6 h-6 text-[#B9F000]" />
            Operations Tour Departures & Passenger Roster
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            {isAgency
              ? 'View public tour departures and manage private agency tour schedules'
              : 'Schedule tour departures, assign drivers & vehicles, and lock dispatched tours'}
          </p>
        </div>

        <Button
          variant="primary"
          onClick={() => setIsAddTourModalOpen(true)}
          className="bg-[#B9F000] hover:bg-[#a6d800] text-slate-950 font-black px-4 py-2.5 rounded-2xl shadow-lg shadow-[#B9F000]/25 flex items-center gap-2"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>+ Schedule Departure</span>
        </Button>
      </div>

      {toastMessage && (
        <div className="bg-[#B9F000] text-slate-950 px-5 py-3.5 rounded-2xl shadow-xl flex items-center gap-3 animate-fade-in font-extrabold text-xs">
          <Sparkles className="w-4 h-4 text-slate-950 animate-bounce" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Departures Data Table */}
      <DataTable
        title="Active Tour Roster & Customer Booking"
        description="Public departures are visible to all agencies; agency private departures are isolated to your company tenant"
        data={visibleDepartures as any}
        columns={columns}
        searchPlaceholder="Search departures by tour package name, guide, vehicle reg, or driver..."
      />

      {/* Assign Resource Dispatch Modal */}
      <AssignDispatchModal
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        departure={targetDeparture}
        drivers={drivers}
        vehicles={vehicles}
        guides={guides}
        existingDepartures={departures as any}
        userRole={user.role}
        onSaveAssignment={handleSaveAssignment}
      />

      {/* Add Tour Departure Modal */}
      <AddTourModal
        isOpen={isAddTourModalOpen}
        onClose={() => setIsAddTourModalOpen(false)}
        onSaveTour={handleSaveTour}
      />

      {/* Add Customer to Tour Modal */}
      <BookingModal
        isOpen={isAddCustomerModalOpen}
        onClose={() => setIsAddCustomerModalOpen(false)}
        onSaveBooking={handleSaveCustomerBooking}
        initialPackageName={targetDeparture?.packageName}
        initialDepartureDate={targetDeparture?.startDate}
      />
    </div>
  );
};
