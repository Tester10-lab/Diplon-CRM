import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { PackageSelect } from '../bookings/PackageSelect';
import { usePackages } from '../../shared/hooks/packages/usePackages';
import { useFleet, useDrivers, useGuides } from '../../shared/hooks/operations/useOperations';
import { Departure, TourPackage } from '../../types';
import { Compass, Calendar, Users, Car, UserCheck, ShieldCheck } from 'lucide-react';

export interface AddTourModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveTour: (departure: Partial<Departure>) => Promise<void> | void;
}

export const VEHICLE_TYPES = [
  { value: 'Bus', label: '🚌 Bus' },
  { value: 'EV', label: '⚡ EV' },
  { value: 'Van', label: '🚐 Van' },
  { value: 'Jeep', label: '🚘 Jeep' },
  { value: 'Trek', label: '🥾 Trek' },
  { value: 'Hike', label: '🏔️ Hike' }
];

export const AddTourModal: React.FC<AddTourModalProps> = ({
  isOpen,
  onClose,
  onSaveTour
}) => {
  const { data: packages, createPackage } = usePackages();
  const { data: fleet } = useFleet();
  const { data: drivers } = useDrivers();
  const { data: guides } = useGuides();

  const [packageName, setPackageName] = useState('Sailung–Kalinchowk Tour Package');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0]);
  const [seatsTotal, setSeatsTotal] = useState<number>(10);
  const [seatsReserved, setSeatsReserved] = useState<number>(0);
  const [vehicleType, setVehicleType] = useState<string>('Jeep');
  const [driverName, setDriverName] = useState<string>('');
  const [guideName, setGuideName] = useState<string>('');
  const [status, setStatus] = useState<'Active' | 'Delayed' | 'Completed'>('Active');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handlePackageChange = (selectedName: string, pkg?: TourPackage) => {
    setPackageName(selectedName);
  };

  const handleCreatePackage = async (name: string) => {
    const created = await createPackage({
      name,
      basePricing: 5500,
      category: 'Custom Tour',
      durationDays: 2
    });
    return created;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const available = Math.max(0, seatsTotal - seatsReserved);
      await onSaveTour({
        packageName,
        startDate,
        endDate,
        seatsTotal,
        seatsReserved,
        seatsAvailable: available,
        travelerCount: seatsReserved,
        driverName: driverName || 'Unassigned',
        vehicleReg: vehicleType,
        guideName: guideName || 'Unassigned',
        status
      });
      onClose();
    } catch (err) {
      console.error('Failed to create tour departure:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Schedule New Tour Departure"
      description="Select or type a new tour package, assign dates, seating capacity, vehicle type, driver & guide."
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Package Autoselect */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
            Tour Package (Autoselect / Type-to-Create)
          </label>
          <PackageSelect
            packages={packages}
            value={packageName}
            onChange={handlePackageChange}
            onCreatePackage={handleCreatePackage}
            placeholder="Select or type package (e.g. Sailung–Kalinchowk Tour Package)..."
          />
        </div>

        {/* Start & End Dates */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Departure Start Date"
            type="date"
            icon={<Calendar className="w-4 h-4" />}
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            required
          />
          <Input
            label="Return End Date"
            type="date"
            icon={<Calendar className="w-4 h-4" />}
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            required
          />
        </div>

        {/* Seating Capacity & Initial Reserved */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Total Seat Capacity"
            type="number"
            min={1}
            icon={<Users className="w-4 h-4" />}
            value={seatsTotal}
            onChange={(e) => setSeatsTotal(parseInt(e.target.value, 10) || 1)}
            required
          />
          <Input
            label="Initial Reserved / Booked Seats"
            type="number"
            min={0}
            value={seatsReserved}
            onChange={(e) => setSeatsReserved(parseInt(e.target.value, 10) || 0)}
          />
        </div>

        {/* Vehicle & Driver Assignment */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-1.5">
              Vehicle & Tour Type
            </label>
            <select
              value={vehicleType}
              onChange={(e) => setVehicleType(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
            >
              {VEHICLE_TYPES.map(vt => (
                <option key={vt.value} value={vt.value}>
                  {vt.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-1.5">
              Assigned Driver (Optional)
            </label>
            <select
              value={driverName}
              onChange={(e) => setDriverName(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
            >
              <option value="">-- None / Unassigned (No Driver Required) --</option>
              {drivers.map(d => (
                <option key={d._id} value={d.name}>
                  {d.name} (★ {d.performanceRating})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Tour Guide & Status */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-1.5">
              Assigned Tour Guide (Optional)
            </label>
            <select
              value={guideName}
              onChange={(e) => setGuideName(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
            >
              <option value="">-- None / Unassigned (No Guide Required) --</option>
              {guides.map(g => (
                <option key={g._id} value={g.name}>
                  {g.name} (★ {g.rating})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-1.5">
              Tour Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as any)}
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
            >
              <option value="Active">Active / Scheduled</option>
              <option value="Delayed">Delayed</option>
              <option value="Completed">Completed</option>
            </select>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-3">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={isSubmitting}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 shadow-lg shadow-indigo-500/20"
          >
            {isSubmitting ? 'Saving...' : 'Schedule Tour Departure'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
