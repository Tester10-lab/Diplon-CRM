import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { PackageSelect } from '../bookings/PackageSelect';
import { usePackages } from '../../shared/hooks/packages/usePackages';
import { useFleet, useDrivers, useGuides } from '../../shared/hooks/operations/useOperations';
import { Departure, TourPackage } from '../../types';
import { Compass, Calendar, Users, Car, UserCheck, ShieldCheck, Sparkles, Clock } from 'lucide-react';

export interface AddTourModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveTour: (departure: Partial<Departure>) => Promise<void> | void;
}

export const VEHICLE_TYPES = [
  { value: 'Bus', label: 'Bus (Tourist Deluxe)' },
  { value: 'EV', label: 'EV (Electric Vehicle)' },
  { value: 'Van', label: 'Van (Passenger / HiAce)' },
  { value: 'Jeep', label: 'Jeep (4WD Scorpio)' },
  { value: 'Trek', label: 'Overland Trek' },
  { value: 'Hike', label: 'Mountain Hike' }
];

export function extractDurationDays(packageName: string, pkg?: TourPackage): number {
  if (pkg?.durationDays && pkg.durationDays > 0) {
    return pkg.durationDays;
  }
  if (pkg?.description) {
    const descMatch = pkg.description.match(/(\d+)\s*N\s*\/\s*(\d+)\s*D/i) || pkg.description.match(/(\d+)\s*days?/i);
    if (descMatch) {
      return parseInt(descMatch[2] || descMatch[1], 10);
    }
  }
  const nameMatch = packageName.match(/(\d+)\s*N(?:ights?)?\s*(?:[\/&]|\s+)\s*(\d+)\s*D(?:ays?)?/i) ||
                    packageName.match(/(\d+)\s*days?/i) ||
                    packageName.match(/(\d+)\s*D\b/i);
  if (nameMatch) {
    return parseInt(nameMatch[2] || nameMatch[1], 10);
  }
  return 2; // Default 2 days (1N/2D)
}

export function calculateEndDateFromDuration(startDateStr: string, days: number): string {
  if (!startDateStr || isNaN(Date.parse(startDateStr))) return startDateStr;
  const daysToAdd = Math.max(1, days) - 1; // e.g. 2 Days tour starting July 30 -> return July 31
  const start = new Date(startDateStr);
  const end = new Date(start);
  end.setDate(start.getDate() + daysToAdd);
  return end.toISOString().split('T')[0];
}

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
  const [endDate, setEndDate] = useState('');
  const [seatsTotal, setSeatsTotal] = useState<number>(10);
  const [seatsReserved, setSeatsReserved] = useState<number>(0);
  const [vehicleType, setVehicleType] = useState<string>('Jeep');
  const [driverName, setDriverName] = useState<string>('');
  const [guideName, setGuideName] = useState<string>('');
  const [status, setStatus] = useState<'Active' | 'Delayed' | 'Completed'>('Active');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [durationDays, setDurationDays] = useState<number>(2);

  // Auto-calculate Return End Date whenever package or start date changes
  useEffect(() => {
    const selectedPkg = packages.find(p => p.name.toLowerCase() === packageName.toLowerCase());
    const days = extractDurationDays(packageName, selectedPkg);
    setDurationDays(days);
    if (startDate) {
      const calculatedEnd = calculateEndDateFromDuration(startDate, days);
      setEndDate(calculatedEnd);
    }
  }, [packageName, startDate, packages]);

  const handlePackageChange = (selectedName: string, pkg?: TourPackage) => {
    setPackageName(selectedName);
    const days = extractDurationDays(selectedName, pkg);
    setDurationDays(days);
    if (startDate) {
      setEndDate(calculateEndDateFromDuration(startDate, days));
    }
  };

  const handleCreatePackage = async (name: string) => {
    const days = extractDurationDays(name);
    const created = await createPackage({
      name,
      basePricing: 5500,
      category: 'Custom Tour',
      durationDays: days
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
      description="Select package from Packages roster to automatically calculate return date based on duration."
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Package Autoselect */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
            Tour Package (Autoselect from Packages Roster)
          </label>
          <PackageSelect
            packages={packages}
            value={packageName}
            onChange={handlePackageChange}
            onCreatePackage={handleCreatePackage}
            placeholder="Search or select package from roster..."
          />
        </div>

        {/* Start & End Dates with Auto-Calculate Badge */}
        <div className="space-y-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Departure Start Date"
              type="date"
              icon={<Calendar className="w-4 h-4 text-indigo-400" />}
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              required
            />
            <div>
              <Input
                label="Return End Date (Auto-Calculated)"
                type="date"
                icon={<Calendar className="w-4 h-4 text-emerald-400" />}
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-emerald-400" />
              <span>Itinerary Duration: <strong>{durationDays - 1} Night(s) / {durationDays} Day(s)</strong></span>
            </span>
            <span className="text-[10px] font-mono font-bold bg-emerald-500/20 px-2 py-0.5 rounded text-emerald-200">
              Auto Return: {endDate}
            </span>
          </div>
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
