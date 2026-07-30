import { DepartureData, DriverData, VehicleData, GuideData } from '../../types/erp';

export interface SchedulingConflict {
  type: 'DRIVER_DOUBLE_BOOKED' | 'VEHICLE_DOUBLE_BOOKED' | 'GUIDE_DOUBLE_BOOKED' | 'CAPACITY_EXCEEDED';
  resourceId: string;
  resourceName: string;
  departureId: string;
  tourName: string;
  description: string;
}

export function detectResourceConflicts(
  departures: DepartureData[],
  vehicles: VehicleData[],
  drivers: DriverData[],
  guides: GuideData[]
): SchedulingConflict[] {
  const conflicts: SchedulingConflict[] = [];

  const vehicleUsage: Record<string, string[]> = {};
  const driverUsage: Record<string, string[]> = {};
  const guideUsage: Record<string, string[]> = {};

  departures.forEach(dep => {
    // Check vehicle double-booking
    if (dep.vehicleReg) {
      if (!vehicleUsage[dep.vehicleReg]) vehicleUsage[dep.vehicleReg] = [];
      vehicleUsage[dep.vehicleReg].push(dep.packageName);
      if (vehicleUsage[dep.vehicleReg].length > 1) {
        conflicts.push({
          type: 'VEHICLE_DOUBLE_BOOKED',
          resourceId: dep.vehicleReg,
          resourceName: dep.vehicleReg,
          departureId: dep._id,
          tourName: dep.packageName,
          description: `Vehicle ${dep.vehicleReg} assigned to multiple active tours (${vehicleUsage[dep.vehicleReg].join(', ')})`,
        });
      }
    }

    // Check driver double-booking
    if (dep.driverName) {
      if (!driverUsage[dep.driverName]) driverUsage[dep.driverName] = [];
      driverUsage[dep.driverName].push(dep.packageName);
      if (driverUsage[dep.driverName].length > 1) {
        conflicts.push({
          type: 'DRIVER_DOUBLE_BOOKED',
          resourceId: dep.driverName,
          resourceName: dep.driverName,
          departureId: dep._id,
          tourName: dep.packageName,
          description: `Driver ${dep.driverName} assigned to multiple overlapping departures`,
        });
      }
    }

    // Check guide double-booking
    if (dep.guideName) {
      if (!guideUsage[dep.guideName]) guideUsage[dep.guideName] = [];
      guideUsage[dep.guideName].push(dep.packageName);
      if (guideUsage[dep.guideName].length > 1) {
        conflicts.push({
          type: 'GUIDE_DOUBLE_BOOKED',
          resourceId: dep.guideName,
          resourceName: dep.guideName,
          departureId: dep._id,
          tourName: dep.packageName,
          description: `Guide ${dep.guideName} assigned to multiple overlapping departures`,
        });
      }
    }

    // Check seating capacity vs passengers
    if (dep.seatsReserved > dep.seatsTotal) {
      conflicts.push({
        type: 'CAPACITY_EXCEEDED',
        resourceId: dep._id,
        resourceName: dep.packageName,
        departureId: dep._id,
        tourName: dep.packageName,
        description: `Reserved seats (${dep.seatsReserved}) exceed vehicle capacity (${dep.seatsTotal})`,
      });
    }
  });

  return conflicts;
}
