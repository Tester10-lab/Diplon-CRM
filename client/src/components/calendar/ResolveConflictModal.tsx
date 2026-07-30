import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { SchedulingConflict } from '../../shared/utils/conflictDetector';
import { DepartureData, DriverData, VehicleData, GuideData } from '../../types/erp';
import { AlertTriangle, CheckCircle2, UserCheck, Car, UserSquare2, RefreshCw } from 'lucide-react';

export interface ResolveConflictModalProps {
  isOpen: boolean;
  onClose: () => void;
  conflict: SchedulingConflict | null;
  departures: DepartureData[];
  drivers: DriverData[];
  vehicles: VehicleData[];
  guides: GuideData[];
  onResolve: (departureId: string, updates: Partial<DepartureData>) => Promise<void> | void;
}

export const ResolveConflictModal: React.FC<ResolveConflictModalProps> = ({
  isOpen,
  onClose,
  conflict,
  departures = [],
  drivers = [],
  vehicles = [],
  guides = [],
  onResolve
}) => {
  const [selectedDepartureId, setSelectedDepartureId] = useState<string>('');
  const [newDriver, setNewDriver] = useState<string>('');
  const [newVehicle, setNewVehicle] = useState<string>('');
  const [newGuide, setNewGuide] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (conflict) {
      setSelectedDepartureId(conflict.departureId || (departures?.[0]?._id || ''));
    }
  }, [conflict, departures]);

  const targetDeparture = (departures || []).find(d => d._id === selectedDepartureId) || (departures || [])[0];

  useEffect(() => {
    if (targetDeparture) {
      setNewDriver(targetDeparture.driverName || '');
      setNewVehicle(targetDeparture.vehicleReg || '');
      setNewGuide(targetDeparture.guideName || '');
    }
  }, [targetDeparture]);

  if (!conflict) return null;

  const handleResolveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetDeparture) return;
    setIsSubmitting(true);

    try {
      await onResolve(targetDeparture._id, {
        driverName: newDriver,
        vehicleReg: newVehicle,
        guideName: newGuide
      });
      onClose();
    } catch (err) {
      console.error('Failed to resolve conflict:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Resolve Resource Double-Booking Conflict"
      description="Reassign driver, vehicle, or tour guide to resolve double-booking."
      maxWidth="lg"
    >
      <form onSubmit={handleResolveSubmit} className="space-y-4">

        {/* Conflict Warning Summary Box */}
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-200 space-y-2">
          <div className="flex items-center gap-2 font-bold text-sm text-rose-400">
            <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
            <span>Resource Conflict: {conflict.resourceName}</span>
          </div>
          <p className="text-xs text-rose-300/90 leading-relaxed font-medium">
            {conflict.description}
          </p>
        </div>

        {/* Affected Tour Selection */}
        <div>
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-1.5">
            Select Conflicting Tour to Re-assign
          </label>
          <select
            value={selectedDepartureId}
            onChange={(e) => setSelectedDepartureId(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-rose-500/40"
          >
            {departures.map(d => (
              <option key={d._id} value={d._id}>
                {d.packageName} ({d.startDate} - {d.endDate}) — Driver: {d.driverName || 'None'}, Vehicle: {d.vehicleReg || 'None'}, Guide: {d.guideName || 'None'}
              </option>
            ))}
          </select>
        </div>

        {/* Re-assignment Controls */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
          
          {/* Driver Selection */}
          <div>
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
              <UserSquare2 className="w-3.5 h-3.5 text-indigo-400" />
              Reassign Driver
            </label>
            <select
              value={newDriver}
              onChange={(e) => setNewDriver(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-medium text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
            >
              {drivers.map(drv => (
                <option key={drv._id} value={drv.name}>
                  {drv.name} ({drv.availability ? 'Available' : 'Busy'})
                </option>
              ))}
            </select>
          </div>

          {/* Vehicle Selection */}
          <div>
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
              <Car className="w-3.5 h-3.5 text-amber-400" />
              Reassign Vehicle
            </label>
            <select
              value={newVehicle}
              onChange={(e) => setNewVehicle(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-medium text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
            >
              {vehicles.map(veh => (
                <option key={veh._id} value={veh.registrationNumber}>
                  {veh.name} ({veh.registrationNumber})
                </option>
              ))}
            </select>
          </div>

          {/* Guide Selection */}
          <div>
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
              <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
              Reassign Guide
            </label>
            <select
              value={newGuide}
              onChange={(e) => setNewGuide(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-medium text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
            >
              {guides.map(g => (
                <option key={g._id} value={g.name}>
                  {g.name} (★ {g.rating})
                </option>
              ))}
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
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 shadow-lg shadow-emerald-500/20 flex items-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4" />
            {isSubmitting ? 'Resolving...' : 'Resolve & Update Roster'}
          </Button>
        </div>

      </form>
    </Modal>
  );
};
