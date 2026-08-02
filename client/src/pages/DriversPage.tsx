import React, { useState, useEffect } from 'react';
import { useDrivers } from '../shared/hooks/operations/useOperations';
import { useAuthStore } from '../store/authStore';
import { DataTable, Column } from '../components/tables/DataTable';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { Input } from '../components/ui/Input';
import { DriverData } from '../types/erp';
import { PageSkeleton } from '../components/feedback/Skeleton';
import { ErrorState } from '../components/feedback/ErrorState';
import {
  UserSquare2,
  Phone,
  Car,
  Compass,
  Lock,
  Plus,
  Sparkles,
  DollarSign,
  CheckCircle2,
  AlertCircle,
  Truck,
  ShieldCheck
} from 'lucide-react';

export const DriversPage: React.FC = () => {
  const { user } = useAuthStore();
  const { data: initialDrivers, isLoading, error, refetch } = useDrivers();
  const isAgency = user.role === 'AGENCY';

  // Driver list local state to support dynamic directory additions
  const [driverList, setDriverList] = useState<DriverData[]>([]);

  useEffect(() => {
    if (initialDrivers && initialDrivers.length > 0) {
      setDriverList(initialDrivers);
    }
  }, [initialDrivers]);

  // Modal & Toast States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Form Fields for Adding New Driver Directory Entry
  const [newName, setNewName] = useState('');
  const [newLicense, setNewLicense] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newVehicleType, setNewVehicleType] = useState('Scorpio 4WD Jeep (7 Seats)');
  const [newTripsDone, setNewTripsDone] = useState<number>(0);
  const [newRemainingBalance, setNewRemainingBalance] = useState<number>(0);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleAddDriver = (e: React.FormEvent) => {
    e.preventDefault();

    const newDriver: DriverData = {
      _id: `drv_${Date.now()}`,
      name: newName,
      licenseNumber: newLicense || `LIC-${Math.floor(100000 + Math.random() * 900000)}`,
      phone: newPhone || '9851090895',
      vehicleType: newVehicleType,
      tripsCompleted: Number(newTripsDone) || 0,
      remainingBalance: Number(newRemainingBalance) || 0,
      performanceRating: 5.0,
      leaveBalance: 12,
      status: 'Active',
      availability: true,
    };

    setDriverList(prev => [newDriver, ...prev]);
    setIsAddModalOpen(false);
    showToast(`✨ Driver "${newName}" added to directory successfully!`);

    // Reset Form
    setNewName('');
    setNewLicense('');
    setNewPhone('');
    setNewTripsDone(0);
    setNewRemainingBalance(0);
  };

  if (isLoading) return <PageSkeleton />;
  if (error) return <ErrorState message={error.message} onRetry={refetch} />;

  // Rearranged Table Columns matching exact user requirements:
  // 1. Name
  // 2. Vehicle Type
  // 3. Number of Trips Done
  // 4. Remaining Balance
  // 5. Contact Number & Availability
  const columns: Column<DriverData>[] = [
    {
      key: 'name',
      header: 'Name',
      accessor: d => (
        <div>
          <div className="font-extrabold text-white text-sm flex items-center gap-2">
            <UserSquare2 className="w-4 h-4 text-indigo-400 shrink-0" />
            <span>{d.name}</span>
          </div>
          <div className="text-[11px] text-slate-400 font-mono">License: {d.licenseNumber}</div>
        </div>
      )
    },
    {
      key: 'vehicleType',
      header: 'Vehicle Type',
      accessor: d => (
        <div>
          <div className="font-bold text-amber-300 text-xs flex items-center gap-1.5">
            <Car className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>{d.vehicleType || 'Scorpio 4WD Jeep (Ba 21 Ch 4501)'}</span>
          </div>
          <div className="text-[11px] text-slate-400 font-mono">Nepal Tourist Fleet</div>
        </div>
      )
    },
    {
      key: 'tripsCompleted',
      header: 'Number of Trips Done',
      accessor: d => (
        <div>
          <span className="px-2.5 py-1 rounded-xl bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-extrabold font-mono text-xs inline-flex items-center gap-1">
            <Compass className="w-3 h-3 text-indigo-400" />
            <span>{d.tripsCompleted !== undefined ? d.tripsCompleted : 24} Trips Completed</span>
          </span>
        </div>
      )
    },
    {
      key: 'remainingBalance',
      header: 'Remaining Balance',
      accessor: d => {
        const bal = d.remainingBalance !== undefined ? d.remainingBalance : 20500;
        return (
          <div>
            <div className={`font-black font-mono text-xs ${bal > 0 ? 'text-amber-300' : 'text-emerald-400'}`}>
              NPR {bal.toLocaleString()}
            </div>
            <div className="text-[10px] font-semibold text-slate-400">
              {bal > 0 ? 'Cash Deposit Due' : 'Account Settled'}
            </div>
          </div>
        );
      }
    },
    {
      key: 'contactAndAvailability',
      header: 'Contact Number & Availability',
      accessor: d => (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="font-mono text-xs font-bold text-emerald-400 flex items-center gap-1.5">
            <Phone className="w-3.5 h-3.5 text-emerald-400" />
            <span>{d.phone || '9851090895'}</span>
          </div>

          <div className="flex items-center gap-1.5">
            <Badge variant={d.availability ? 'info' : d.status === 'Active' ? 'warning' : 'neutral'}>
              {d.availability ? 'Available' : 'Assigned to Tour'}
            </Badge>
          </div>
        </div>
      )
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in select-none">
      
      {/* Top Header Controls with Add Directory Button */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 rounded-3xl bg-[#161D2B] border border-[#232D42] shadow-xl">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            <UserSquare2 className="w-6 h-6 text-[#B9F000]" />
            {isAgency ? 'Assigned Drivers Roster (Read-Only)' : 'Driver Roster & Master Directory'}
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            {isAgency
              ? 'View drivers assigned to your agency departures, contact phone numbers & tour schedules'
              : 'Manage driver profiles, vehicle types, completed trips, cash balances & directory entries'}
          </p>
        </div>

        {!isAgency && (
          <Button
            variant="primary"
            onClick={() => setIsAddModalOpen(true)}
            className="bg-[#B9F000] hover:bg-[#a6d800] text-slate-950 font-black text-xs px-4 py-2.5 rounded-2xl shadow-lg shadow-[#B9F000]/25 flex items-center gap-2 shrink-0"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>+ Add Driver to Directory</span>
          </Button>
        )}

        {isAgency && (
          <div className="px-3.5 py-1.5 rounded-2xl bg-[#B9F000]/10 text-[#B9F000] border border-[#B9F000]/30 text-xs font-extrabold flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-amber-400" />
            <span>Agency Read-Only Access</span>
          </div>
        )}
      </div>

      {/* Success Toast */}
      {toastMessage && (
        <div className="bg-[#B9F000] text-slate-950 px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-fade-in text-xs font-extrabold">
          <Sparkles className="w-4 h-4 text-slate-950 animate-bounce" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Directory Table */}
      <DataTable
        title={isAgency ? 'Assigned Drivers Roster' : 'Driver Master Directory'}
        description={isAgency ? 'Agencies can view assigned driver contact details and vehicle types' : 'Driver directory listing name, vehicle type, trips completed, remaining balance, and contact availability'}
        data={driverList as any}
        columns={columns}
        searchPlaceholder="Search drivers by name, vehicle type, phone..."
      />

      {/* ⚡ ADD DRIVER TO DIRECTORY POPUP MODAL */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New Driver to Master Directory"
        description="Create a new driver entry with vehicle type, trips history, and remaining balance."
        maxWidth="lg"
      >
        <form onSubmit={handleAddDriver} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Driver Full Name"
              placeholder="e.g. Ramesh Karki"
              value={newName}
              onChange={e => setNewName(e.target.value)}
              required
            />
            <Input
              label="Driving License Number"
              placeholder="e.g. LIC-998877"
              value={newLicense}
              onChange={e => setNewLicense(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Contact Phone Number"
              placeholder="e.g. 9851090895"
              value={newPhone}
              onChange={e => setNewPhone(e.target.value)}
              required
            />

            <div>
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-1.5">
                Assigned Vehicle Type
              </label>
              <select
                value={newVehicleType}
                onChange={e => setNewVehicleType(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="Scorpio 4WD Jeep (7 Seats)">Scorpio 4WD Jeep (7 Seats)</option>
                <option value="28-Seater Sofa Bus (28 Seats)">28-Seater Sofa Bus (28 Seats)</option>
                <option value="Toyota Coaster Bus (22 Seats)">Toyota Coaster Bus (22 Seats)</option>
                <option value="Toyota HiAce Super GL (14 Seats)">Toyota HiAce Super GL (14 Seats)</option>
                <option value="Prado 4WD Jeep (5 Seats)">Prado 4WD Jeep (5 Seats)</option>
                <option value="EV Tourist Bus (30 Seats)">EV Tourist Bus (30 Seats)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Number of Trips Completed"
              type="number"
              min={0}
              value={newTripsDone}
              onChange={e => setNewTripsDone(Number(e.target.value))}
              required
            />

            <Input
              label="Initial Remaining Cash Balance (NPR)"
              type="number"
              min={0}
              value={newRemainingBalance}
              onChange={e => setNewRemainingBalance(Number(e.target.value))}
              required
            />
          </div>

          <div className="flex justify-end gap-2 pt-3">
            <Button variant="secondary" onClick={() => setIsAddModalOpen(false)}>Cancel</Button>
            <Button type="submit" variant="primary" className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-4">
              Add Driver to Directory
            </Button>
          </div>
        </form>
      </Modal>

    </div>
  );
};
