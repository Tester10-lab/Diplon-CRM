import { DepartureData, DriverData, VehicleData, GuideData } from '../../types/erp';

export interface SchedulingConflict {
  id?: string;
  type: 'DRIVER_DOUBLE_BOOKED' | 'VEHICLE_DOUBLE_BOOKED' | 'GUIDE_DOUBLE_BOOKED' | 'CAPACITY_EXCEEDED';
  resourceId: string;
  resourceName: string;
  departureId: string;
  tourName: string;
  description: string;
  startDate?: string;
  endDate?: string;
}

export function isDateOverlapping(startA: string, endA: string, startB: string, endB: string): boolean {
  if (!startA || !endA || !startB || !endB) return false;
  return startA <= endB && endA >= startB;
}

const isGenericResource = (name?: string): boolean => {
  if (!name) return true;
  const lower = name.toLowerCase().trim();
  return (
    lower.includes('unassigned') ||
    lower.includes('tbd') ||
    lower === '4wd scorpio jeep' ||
    lower === '28-seater sofa bus' ||
    lower === 'scorpio' ||
    lower === 'bus' ||
    lower === 'unassigned guide' ||
    lower === 'unassigned driver'
  );
};

export function detectResourceConflicts(
  departures: DepartureData[] = [],
  vehicles: VehicleData[] = [],
  drivers: DriverData[] = [],
  guides: GuideData[] = []
): SchedulingConflict[] {
  if (!departures || !Array.isArray(departures)) return [];
  const conflicts: SchedulingConflict[] = [];

  for (let i = 0; i < departures.length; i++) {
    const depA = departures[i];

    // Check seating capacity vs passengers
    if (depA.seatsReserved > depA.seatsTotal) {
      conflicts.push({
        id: `conflict_cap_${depA._id}`,
        type: 'CAPACITY_EXCEEDED',
        resourceId: depA._id,
        resourceName: depA.packageName,
        departureId: depA._id,
        tourName: depA.packageName,
        description: `Reserved seats (${depA.seatsReserved}) exceed vehicle capacity (${depA.seatsTotal})`,
        startDate: depA.startDate,
        endDate: depA.endDate || depA.startDate
      });
    }

    for (let j = i + 1; j < departures.length; j++) {
      const depB = departures[j];

      // ONLY report double-booking if tour dates actually overlap!
      const startDateA = depA.startDate;
      const endDateA = depA.endDate || depA.startDate;
      const startDateB = depB.startDate;
      const endDateB = depB.endDate || depB.startDate;

      if (!isDateOverlapping(startDateA, endDateA, startDateB, endDateB)) {
        continue;
      }

      // Check vehicle double-booking on overlapping dates
      if (depA.vehicleReg && depB.vehicleReg && depA.vehicleReg === depB.vehicleReg && !isGenericResource(depA.vehicleReg)) {
        conflicts.push({
          id: `conflict_veh_${depA._id}_${depB._id}`,
          type: 'VEHICLE_DOUBLE_BOOKED',
          resourceId: depA.vehicleReg,
          resourceName: depA.vehicleReg,
          departureId: depA._id,
          tourName: depA.packageName,
          description: `Vehicle ${depA.vehicleReg} assigned to multiple overlapping active tours (${depA.packageName}, ${depB.packageName})`,
          startDate: startDateA,
          endDate: endDateA
        });
      }

      // Check driver double-booking on overlapping dates
      if (depA.driverName && depB.driverName && depA.driverName === depB.driverName && !isGenericResource(depA.driverName)) {
        conflicts.push({
          id: `conflict_drv_${depA._id}_${depB._id}`,
          type: 'DRIVER_DOUBLE_BOOKED',
          resourceId: depA.driverName,
          resourceName: depA.driverName,
          departureId: depA._id,
          tourName: depA.packageName,
          description: `Driver ${depA.driverName} assigned to multiple overlapping departures (${depA.packageName}, ${depB.packageName})`,
          startDate: startDateA,
          endDate: endDateA
        });
      }

      // Check guide double-booking on overlapping dates
      if (depA.guideName && depB.guideName && depA.guideName === depB.guideName && !isGenericResource(depA.guideName)) {
        conflicts.push({
          id: `conflict_gui_${depA._id}_${depB._id}`,
          type: 'GUIDE_DOUBLE_BOOKED',
          resourceId: depA.guideName,
          resourceName: depA.guideName,
          departureId: depA._id,
          tourName: depA.packageName,
          description: `Guide ${depA.guideName} assigned to multiple overlapping departures (${depA.packageName}, ${depB.packageName})`,
          startDate: startDateA,
          endDate: endDateA
        });
      }
    }
  }

  return conflicts;
}
