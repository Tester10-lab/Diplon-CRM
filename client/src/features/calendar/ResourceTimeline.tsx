import React from 'react';
import { DepartureData, VehicleData, DriverData, GuideData } from '../../types/erp';

interface ResourceTimelineProps {
  currentDate: Date;
  departures: DepartureData[];
  vehicles: VehicleData[];
  drivers: DriverData[];
  guides: GuideData[];
}

export const ResourceTimeline: React.FC<ResourceTimelineProps> = ({
  currentDate,
  departures,
  vehicles,
  drivers,
  guides,
}) => {
  const startOfWeek = new Date(currentDate);
  startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());

  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(startOfWeek);
    d.setDate(startOfWeek.getDate() + i);
    return {
      day: String(d.getDate()).padStart(2, '0'),
      month: d.toLocaleString('en-US', { month: 'short' }),
    };
  });

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/60 overflow-x-auto shadow-xl">
      <div className="min-w-[900px]">
        {/* Timeline Day Header */}
        <div className="grid grid-cols-8 border-b border-slate-800 bg-slate-950/80 text-xs font-bold text-slate-400 py-3">
          <div className="px-4 text-slate-300">Resource Name</div>
          {days.map((d, i) => (
            <div key={i} className="text-center font-mono">{d.day} {d.month}</div>
          ))}
        </div>

        {/* Vehicle Gantt Rows */}
        <div className="divide-y divide-slate-800/40">
          <div className="px-4 py-2 bg-slate-950/40 text-[11px] font-bold text-indigo-400 uppercase tracking-wider">
            Vehicle Fleet Gantt Timeline
          </div>
          {vehicles.map(v => {
            const assigned = departures.find(d => d.vehicleReg === v.registrationNumber);
            return (
              <div key={v._id} className="grid grid-cols-8 py-2.5 items-center hover:bg-slate-800/20">
                <div className="px-4 text-xs font-bold text-slate-200 truncate">
                  {v.name} <span className="text-[10px] text-slate-500 font-mono">({v.registrationNumber})</span>
                </div>
                <div className="col-span-7 px-2">
                  {assigned ? (
                    <div className="h-7 rounded-md bg-indigo-500/20 border border-indigo-500/40 px-3 flex items-center justify-between text-xs font-bold text-indigo-300">
                      <span className="truncate">{assigned.packageName}</span>
                      <span className="text-[10px] text-indigo-400 font-mono">Active</span>
                    </div>
                  ) : (
                    <div className="h-7 rounded-md border border-dashed border-slate-800/80 flex items-center justify-center text-[10px] text-slate-600 font-medium">
                      Available
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {/* Driver Gantt Rows */}
          <div className="px-4 py-2 bg-slate-950/40 text-[11px] font-bold text-emerald-400 uppercase tracking-wider">
            Driver Roster Timeline
          </div>
          {drivers.map(d => {
            const assigned = departures.find(dep => dep.driverName === d.name);
            return (
              <div key={d._id} className="grid grid-cols-8 py-2.5 items-center hover:bg-slate-800/20">
                <div className="px-4 text-xs font-bold text-slate-200 truncate">{d.name}</div>
                <div className="col-span-7 px-2">
                  {assigned ? (
                    <div className="h-7 rounded-md bg-emerald-500/20 border border-emerald-500/40 px-3 flex items-center justify-between text-xs font-bold text-emerald-300">
                      <span className="truncate">{assigned.packageName}</span>
                      <span className="text-[10px] text-emerald-400 font-mono">On Tour</span>
                    </div>
                  ) : (
                    <div className="h-7 rounded-md border border-dashed border-slate-800/80 flex items-center justify-center text-[10px] text-slate-600 font-medium">
                      Available
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {/* Guide Gantt Rows */}
          <div className="px-4 py-2 bg-slate-950/40 text-[11px] font-bold text-amber-400 uppercase tracking-wider">
            Tour Guides Timeline
          </div>
          {guides.map(g => {
            const assigned = departures.find(dep => dep.guideName === g.name);
            return (
              <div key={g._id} className="grid grid-cols-8 py-2.5 items-center hover:bg-slate-800/20">
                <div className="px-4 text-xs font-bold text-slate-200 truncate">{g.name}</div>
                <div className="col-span-7 px-2">
                  {assigned ? (
                    <div className="h-7 rounded-md bg-amber-500/20 border border-amber-500/40 px-3 flex items-center justify-between text-xs font-bold text-amber-300">
                      <span className="truncate">{assigned.packageName}</span>
                      <span className="text-[10px] text-amber-400 font-mono">Assigned</span>
                    </div>
                  ) : (
                    <div className="h-7 rounded-md border border-dashed border-slate-800/80 flex items-center justify-center text-[10px] text-slate-600 font-medium">
                      Available
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
