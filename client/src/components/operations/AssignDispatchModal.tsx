import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { useFleet, useDrivers, useGuides, useDepartures } from '../../shared/hooks/operations/useOperations';
import { pushNotification } from '../../store/notificationStore';
import { DepartureData } from '../../types/erp';
import { Driver, Vehicle, Guide } from '../../types';
import {
  UserSquare2,
  Car,
  UserCheck,
  Calendar,
  Clock,
  AlertTriangle,
  Lock,
  Unlock,
  CheckCircle2,
  ShieldCheck,
  Compass,
  Info
} from 'lucide-react';

interface AssignDispatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  departure: DepartureData | null;
  drivers: Driver[];
  vehicles: Vehicle[];
  guides: Guide[];
  existingDepartures?: DepartureData[];
  userRole?: string;
  onSaveAssignment: (departureId: string, updates: {
    driverName?: string;
    driverId?: string;
    vehicleReg?: string;
    guideName?: string;
    status?: string;
    driverLocked?: boolean;
  }) => Promise<void>;
}

export const AssignDispatchModal: React.FC<AssignDispatchModalProps> = ({
  isOpen,
  onClose,
  departure,
  drivers = [],
  vehicles = [],
  guides = [],
  existingDepartures = [],
  userRole = 'ADMIN',
  onSaveAssignment
}) => {
  const isAdminOrSuper = userRole === 'ADMIN' || userRole === 'SUPER_ADMIN' || userRole === 'SUPER ADMIN';

  // Modal Form State
  const [selectedDriverName, setSelectedDriverName] = useState<string>('');
  const [selectedVehicleReg, setSelectedVehicleReg] = useState<string>('');
  const [selectedGuideName, setSelectedGuideName] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('Active');
  
  // Locking states
  const [isDriverUnlocked, setIsDriverUnlocked] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    if (departure) {
      setSelectedDriverName(departure.driverName && departure.driverName !== 'Unassigned' ? departure.driverName : '');
      setSelectedVehicleReg(departure.vehicleReg && departure.vehicleReg !== 'Unassigned' ? departure.vehicleReg : '');
      setSelectedGuideName(departure.guideName && departure.guideName !== 'Unassigned' ? departure.guideName : '');
      setSelectedStatus(departure.status || 'Active');
      setIsDriverUnlocked(false);
    }
  }, [departure]);

  if (!departure) return null;

  const isDispatched = selectedStatus === 'Dispatched' || departure.status === 'Dispatched';
  const isDriverAlreadyAssigned = Boolean(departure.driverName && departure.driverName !== 'Unassigned');
  const isDriverLocked = isDispatched || (isDriverAlreadyAssigned && !isDriverUnlocked);

  // 1. Calculate Tour Duration (Start Date → End Date)
  const startD = new Date(departure.startDate || new Date());
  let endD = new Date(departure.endDate || departure.startDate || new Date());
  
  // If endD <= startD, calculate duration based on default 7 days
  if (endD <= startD) {
    endD = new Date(startD);
    endD.setDate(startD.getDate() + 6);
  }

  const diffTime = Math.abs(endD.getTime() - startD.getTime());
  const totalDays = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1);
  const totalNights = Math.max(0, totalDays - 1);
  const returnDateStr = endD.toISOString().split('T')[0];

  // 2. Check Driver Double-Booking / Overlap Conflicts
  let overlappingDeparture: DepartureData | null = null;

  if (selectedDriverName) {
    const conflicts = existingDepartures.filter(d => {
      if (d._id === departure._id) return false;
      const isSameDriver = d.driverName === selectedDriverName;
      if (!isSameDriver) return false;

      const depStart = new Date(d.startDate);
      const depEnd = new Date(d.endDate || d.startDate);

      // Overlap condition: depStart <= endD && depEnd >= startD
      return depStart <= endD && depEnd >= startD;
    });

    if (conflicts.length > 0) {
      overlappingDeparture = conflicts[0];
    }
  }

  // 3. Find Schedule History for Selected Driver
  const driverScheduleHistory = existingDepartures.filter(
    d => d.driverName === selectedDriverName && d._id !== departure._id
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      await onSaveAssignment(departure._id, {
        driverName: selectedDriverName || 'Unassigned',
        vehicleReg: selectedVehicleReg || 'Unassigned',
        guideName: selectedGuideName || 'Unassigned',
        status: selectedStatus,
        driverLocked: true,
      });

      // Push real-time notification to Notification Center
      pushNotification({
        title: 'Resource Dispatch Assigned',
        message: `${selectedDriverName || 'Driver'} assigned to ${departure.packageName} (${selectedVehicleReg})`,
        category: 'DISPATCH',
        severity: 'info'
      });

      onClose();
    } catch (err) {
      console.error('Failed to save assignment:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Resource Dispatch & Assignment: ${departure.packageName}`}
      description={`Ref: ${departure._id} • ${departure.startDate} to ${returnDateStr}`}
      maxWidth="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-5 select-none">
        
        {/* Status Lock Warning Banner */}
        {isDispatched && (
          <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 flex items-center gap-3 text-xs">
            <Lock className="w-5 h-5 text-rose-400 shrink-0 animate-pulse" />
            <div>
              <div className="font-extrabold text-rose-200">🔒 Assigned & Locked (Dispatched)</div>
              <div className="text-[11px] text-rose-300/80">
                Tour status is DISPATCHED. All resource assignments (Driver, Vehicle, Guide) are strictly frozen.
              </div>
            </div>
          </div>
        )}

        {/* 🗓️ Tour Duration & Itinerary Calculation Card */}
        <div className="p-4 rounded-2xl bg-[#0B0F17] border border-[#232D42] space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400 font-bold uppercase tracking-wider">
            <span className="flex items-center gap-1.5 text-[#B9F000]">
              <Compass className="w-4 h-4 text-[#B9F000]" /> Tour Itinerary Duration
            </span>
            <Badge variant="primary">Calculated Schedule</Badge>
          </div>

          <div className="grid grid-cols-3 gap-3 pt-2 text-center">
            <div className="p-2.5 rounded-xl bg-[#161D2B] border border-[#232D42]">
              <div className="text-[10px] text-slate-400 font-bold uppercase">Start Date</div>
              <div className="text-sm font-extrabold text-white mt-0.5">{departure.startDate}</div>
            </div>

            <div className="p-2.5 rounded-xl bg-[#B9F000]/10 border border-[#B9F000]/30">
              <div className="text-[10px] text-[#B9F000] font-bold uppercase">Duration</div>
              <div className="text-sm font-black text-[#B9F000] mt-0.5">
                {totalDays} Days / {totalNights} Nights
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-[#161D2B] border border-[#232D42]">
              <div className="text-[10px] text-slate-400 font-bold uppercase">Calculated Return Date</div>
              <div className="text-sm font-extrabold text-emerald-400 mt-0.5">{returnDateStr}</div>
            </div>
          </div>
        </div>

        {/* ⚠️ Double-Booking Overlap Warning */}
        {overlappingDeparture && (
          <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/40 text-amber-300 flex items-start gap-3 text-xs animate-shake">
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <div className="font-extrabold text-amber-200">⚠️ SCHEDULE OVERLAP WARNING</div>
              <div className="text-[11px] text-amber-300/90 mt-0.5">
                Driver <strong className="text-white underline">{selectedDriverName}</strong> is already assigned to tour{' '}
                <strong className="text-amber-200">"{overlappingDeparture.packageName}"</strong> ({overlappingDeparture.startDate} to {overlappingDeparture.endDate})!
              </div>
            </div>
          </div>
        )}

        {/* Resource Selectors Form */}
        <div className="space-y-4">
          
          {/* Driver Selection Field */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                <UserSquare2 className="w-4 h-4 text-indigo-400" />
                <span>Assign Driver</span>
                {isDriverLocked && (
                  <span className="text-[10px] bg-slate-800 text-amber-400 border border-slate-700 px-1.5 py-0.5 rounded font-mono flex items-center gap-1 ml-1">
                    <Lock className="w-3 h-3" /> Locked
                  </span>
                )}
              </label>

              {isDriverAlreadyAssigned && !isDispatched && isAdminOrSuper && (
                <button
                  type="button"
                  onClick={() => setIsDriverUnlocked(!isDriverUnlocked)}
                  className="text-[11px] font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1 bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded-lg transition-all"
                >
                  {isDriverUnlocked ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
                  <span>{isDriverUnlocked ? 'Lock Driver Field' : 'Unlock & Reassign (Admin)'}</span>
                </button>
              )}
            </div>

            <div className="relative">
              <input
                type="text"
                value={selectedDriverName}
                onChange={e => setSelectedDriverName(e.target.value)}
                disabled={isDriverLocked}
                placeholder="Type or search driver name..."
                className={`w-full bg-slate-900 border rounded-xl p-3 text-xs font-extrabold text-amber-300 focus:outline-none transition-all ${
                  isDriverLocked ? 'opacity-60 cursor-not-allowed border-slate-800 bg-slate-950' : 'border-slate-700 focus:border-amber-400'
                }`}
              />
              {!isDriverLocked && (
                <div className="mt-1 flex flex-wrap gap-1 max-h-32 overflow-y-auto p-1.5 bg-slate-950 border border-slate-800 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setSelectedDriverName('')}
                    className={`text-[10px] font-bold px-2 py-1 rounded-lg transition-all ${
                      !selectedDriverName ? 'bg-amber-500 text-slate-950' : 'bg-slate-900 text-slate-400 hover:text-white'
                    }`}
                  >
                    🚫 Unassigned
                  </button>
                  {drivers.map(d => (
                    <button
                      key={d._id}
                      type="button"
                      onClick={() => setSelectedDriverName(d.name)}
                      className={`text-[10px] font-bold px-2 py-1 rounded-lg transition-all ${
                        selectedDriverName === d.name ? 'bg-amber-500 text-slate-950 font-black' : 'bg-slate-900 text-slate-200 hover:bg-slate-800'
                      }`}
                    >
                      {d.name} {d.phone ? `(${d.phone})` : ''}
                    </button>
                  ))}
                  {drivers.every(d => d.name !== 'Srijan Maharjan') && (
                    <button
                      type="button"
                      onClick={() => setSelectedDriverName('Srijan Maharjan')}
                      className={`text-[10px] font-bold px-2 py-1 rounded-lg transition-all ${
                        selectedDriverName === 'Srijan Maharjan' ? 'bg-amber-500 text-slate-950 font-black' : 'bg-slate-900 text-indigo-300 hover:bg-slate-800'
                      }`}
                    >
                      Srijan Maharjan (9801234567)
                    </button>
                  )}
                  {drivers.every(d => d.name !== 'Suman Dai') && (
                    <button
                      type="button"
                      onClick={() => setSelectedDriverName('Suman Dai')}
                      className={`text-[10px] font-bold px-2 py-1 rounded-lg transition-all ${
                        selectedDriverName === 'Suman Dai' ? 'bg-amber-500 text-slate-950 font-black' : 'bg-slate-900 text-indigo-300 hover:bg-slate-800'
                      }`}
                    >
                      Suman Dai (9851090895)
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Selected Driver Schedule Card */}
            {selectedDriverName && driverScheduleHistory.length > 0 && (
              <div className="mt-2 p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-[11px] space-y-1">
                <div className="text-slate-400 font-bold flex items-center gap-1">
                  <Info className="w-3 h-3 text-indigo-400" />
                  <span>Existing Driver Schedule ({driverScheduleHistory.length} tours assigned):</span>
                </div>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {driverScheduleHistory.map(sh => (
                    <span key={sh._id} className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300 font-mono">
                      {sh.packageName} ({sh.startDate})
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Vehicle Selection Field */}
          <div>
            <label className="text-xs font-bold text-slate-200 uppercase tracking-wider block mb-1.5 flex items-center gap-1.5">
              <Car className="w-4 h-4 text-amber-400" />
              <span>Vehicle & Tour Type</span>
            </label>
            <select
              value={selectedVehicleReg}
              onChange={e => setSelectedVehicleReg(e.target.value)}
              disabled={isDispatched}
              className={`w-full bg-slate-900 border rounded-xl p-3 text-xs font-semibold text-white focus:outline-none transition-all ${
                isDispatched ? 'opacity-60 cursor-not-allowed border-slate-800 bg-slate-950' : 'border-slate-700 focus:border-indigo-500'
              }`}
            >
              <option value="Scorpio">Scorpio (4WD)</option>
              <option value="EV Van">EV Van (Electric Van)</option>
              <option value="Bus">Bus (Tourist Deluxe)</option>
              <option value="28-Seater Sofa Bus">28-Seater Sofa Bus</option>
              <option value="4WD Scorpio Jeep">4WD Scorpio Jeep</option>
              <option value="Van">Van (Passenger / HiAce)</option>
              <option value="Jeep">Jeep (4WD Scorpio)</option>
              <option value="Trek">Overland Trek</option>
              <option value="Hike">Mountain Hike</option>
              {vehicles.map(v => (
                <option key={v._id} value={`${v.registrationNumber}`}>
                  {v.name} ({v.registrationNumber}) - {v.type}
                </option>
              ))}
            </select>
          </div>

          {/* Guide Selection Field (Optional) */}
          <div>
            <label className="text-xs font-bold text-slate-200 uppercase tracking-wider block mb-1.5 flex items-center gap-1.5">
              <UserCheck className="w-4 h-4 text-emerald-400" />
              <span>Assign Tour Guide (Optional)</span>
            </label>
            <select
              value={selectedGuideName}
              onChange={e => setSelectedGuideName(e.target.value)}
              disabled={isDispatched}
              className={`w-full bg-slate-900 border rounded-xl p-3 text-xs font-semibold text-white focus:outline-none transition-all ${
                isDispatched ? 'opacity-60 cursor-not-allowed border-slate-800 bg-slate-950' : 'border-slate-700 focus:border-indigo-500'
              }`}
            >
              <option value="">-- None / Unassigned (No Guide Required) --</option>
              {guides.map(g => (
                <option key={g._id} value={g.name}>
                  {g.name} ({g.languages?.join(', ') || 'English, Nepali'})
                </option>
              ))}
              {!guides.some(g => g.name === selectedGuideName) && selectedGuideName && (
                <option value={selectedGuideName}>{selectedGuideName}</option>
              )}
            </select>
          </div>

          {/* Tour Status Field */}
          <div>
            <label className="text-xs font-bold text-slate-200 uppercase tracking-wider block mb-1.5 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-indigo-400" />
              <span>Tour Departure Status</span>
            </label>
            <select
              value={selectedStatus}
              onChange={e => setSelectedStatus(e.target.value)}
              disabled={isDispatched && !isAdminOrSuper}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs font-semibold text-white focus:outline-none focus:border-indigo-500"
            >
              <option value="Active">Active / Scheduled</option>
              <option value="Dispatched">Dispatched (Freeze Resource Lock)</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>

        </div>

        {/* Modal Footer Actions */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
          <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={isSubmitting || (isDispatched && !isAdminOrSuper)}
            className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-5 py-2.5 rounded-xl shadow-lg shadow-indigo-600/30 flex items-center gap-2"
          >
            {isSubmitting ? (
              <span>Saving Assignment...</span>
            ) : isDriverAlreadyAssigned ? (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Update Resource Assignment</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Confirm & Save Assignment</span>
              </>
            )}
          </Button>
        </div>

      </form>
    </Modal>
  );
};
