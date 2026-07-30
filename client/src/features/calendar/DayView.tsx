import React from 'react';
import { DepartureData, VehicleData, DriverData, GuideData } from '../../types/erp';
import { Bus, User, Compass } from 'lucide-react';

interface DayViewProps {
  departures: DepartureData[];
  vehicles: VehicleData[];
  drivers: DriverData[];
  guides: GuideData[];
}

export const DayView: React.FC<DayViewProps> = ({
  departures = [],
  vehicles = [],
  drivers = [],
  guides = []
}) => {
  const safeDepartures = departures || [];
  const safeVehicles = vehicles || [];
  const safeDrivers = drivers || [];
  const safeGuides = guides || [];

  return (
    <div className="space-y-6">
      {/* 3-Column Resource Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Vehicles Column */}
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <span className="flex items-center gap-2 font-bold text-sm text-slate-200"><Bus className="w-4 h-4 text-indigo-400" /> Vehicle Fleet Schedule</span>
            <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-indigo-500/20 text-indigo-400">{safeVehicles.length} Units</span>
          </div>
          <div className="space-y-2.5">
            {safeVehicles.map(v => {
              const assignedDep = safeDepartures.find(d => d.vehicleReg === v.registrationNumber);
              return (
                <div key={v._id} className="p-3 rounded-lg bg-slate-950/60 border border-slate-800/80 space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-extrabold text-slate-100">{v.name}</span>
                    <span className="font-mono text-indigo-400 font-bold">{v.registrationNumber}</span>
                  </div>
                  {assignedDep ? (
                    <div className="p-2 rounded bg-indigo-500/10 border border-indigo-500/20 text-[11px]">
                      <div className="font-bold text-indigo-300">Tour: {assignedDep.packageName}</div>
                      <div className="text-[10px] text-slate-400">Seats Reserved: {assignedDep.seatsReserved}/{assignedDep.seatsTotal}</div>
                    </div>
                  ) : (
                    <div className="text-[10px] font-semibold text-emerald-400">Status: Available</div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Drivers Column */}
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <span className="flex items-center gap-2 font-bold text-sm text-slate-200"><User className="w-4 h-4 text-emerald-400" /> Driver Assignments</span>
            <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-emerald-500/20 text-emerald-400">{safeDrivers.length} Drivers</span>
          </div>
          <div className="space-y-2.5">
            {safeDrivers.map(d => {
              const assignedDep = safeDepartures.find(dep => dep.driverName === d.name);
              return (
                <div key={d._id} className="p-3 rounded-lg bg-slate-950/60 border border-slate-800/80 space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-extrabold text-slate-100">{d.name}</span>
                    <span className="text-amber-400 font-bold">{d.performanceRating} ★</span>
                  </div>
                  {assignedDep ? (
                    <div className="p-2 rounded bg-emerald-500/10 border border-emerald-500/20 text-[11px]">
                      <div className="font-bold text-emerald-300">Assigned: {assignedDep.packageName}</div>
                      <div className="text-[10px] text-slate-400">License: {d.licenseNumber}</div>
                    </div>
                  ) : (
                    <div className="text-[10px] font-semibold text-emerald-400">Status: Available</div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Guides Column */}
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <span className="flex items-center gap-2 font-bold text-sm text-slate-200"><Compass className="w-4 h-4 text-amber-400" /> Tour Guides</span>
            <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-amber-500/20 text-amber-400">{safeGuides.length} Guides</span>
          </div>
          <div className="space-y-2.5">
            {safeGuides.map(g => {
              const assignedDep = safeDepartures.find(dep => dep.guideName === g.name);
              return (
                <div key={g._id} className="p-3 rounded-lg bg-slate-950/60 border border-slate-800/80 space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-extrabold text-slate-100">{g.name}</span>
                    <span className="text-amber-400 font-bold">{g.rating} ★</span>
                  </div>
                  {assignedDep ? (
                    <div className="p-2 rounded bg-amber-500/10 border border-amber-500/20 text-[11px]">
                      <div className="font-bold text-amber-300">Guiding: {assignedDep.packageName}</div>
                      <div className="text-[10px] text-slate-400">Langs: {g.languages.join(', ')}</div>
                    </div>
                  ) : (
                    <div className="text-[10px] font-semibold text-emerald-400">Status: Available</div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
