import { Departure, Vehicle, Driver, Guide } from '../../types';

export const mockDepartures: Departure[] = [
  { _id: 'dep_halesi_01', packageName: 'Halesi Tour Package (1N/2D)', startDate: '2026-08-01', endDate: '2026-08-02', seatsTotal: 28, seatsAvailable: 3, seatsReserved: 25, status: 'Active', travelerCount: 25, guideName: 'Unassigned Guide', driverName: 'Sofa Bus Driver (Chandra Maharjan)', vehicleReg: '28-Seater Sofa Bus' },
  { _id: 'dep_jiri_02', packageName: 'Jiri Tour (1N/2D)', startDate: '2026-08-01', endDate: '2026-08-02', seatsTotal: 7, seatsAvailable: 1, seatsReserved: 6, status: 'Active', travelerCount: 6, guideName: 'Unassigned Guide', driverName: 'Scorpio Driver (Tarak Panja)', vehicleReg: '4WD Scorpio Jeep' },
  { _id: 'dep_mustang_03', packageName: 'Upper Mustang Package (4N/5D)', startDate: '2026-10-28', endDate: '2026-11-01', seatsTotal: 7, seatsAvailable: 0, seatsReserved: 7, status: 'Active', travelerCount: 7, guideName: 'Unassigned Guide', driverName: 'Scorpio Driver (Bishnu Kafle)', vehicleReg: '4WD Scorpio Jeep' },
  { _id: 'dep_muktinath_04', packageName: 'Muktinath Tour (2N/3D)', startDate: '2026-10-25', endDate: '2026-10-27', seatsTotal: 7, seatsAvailable: 5, seatsReserved: 2, status: 'Active', travelerCount: 2, guideName: 'Unassigned Guide', driverName: 'Scorpio Driver (Abhijit Ghosh)', vehicleReg: '4WD Scorpio Jeep' },
];

export const mockVehicles: Vehicle[] = [
  { _id: 'veh_101', name: 'Luxury Tourist Bus A1', registrationNumber: 'BA-2-PA-1234', seatingCapacity: 35, status: 'Active', availability: true, bluebookExpiry: '2027-12-31', insuranceExpiry: '2027-11-30', taxExpiry: '2027-10-15' },
  { _id: 'veh_102', name: '4WD Scorpio Jeep B2', registrationNumber: 'BA-1-PA-5678', seatingCapacity: 7, status: 'Active', availability: true, bluebookExpiry: '2027-08-15', insuranceExpiry: '2027-08-01', taxExpiry: '2027-07-20' },
  { _id: 'veh_103', name: 'Toyota Coaster Van C3', registrationNumber: 'BA-3-PA-9900', seatingCapacity: 22, status: 'Active', availability: false, bluebookExpiry: '2026-12-01', insuranceExpiry: '2026-11-15', taxExpiry: '2026-11-01' },
  { _id: 'veh_104', name: '4WD Prado Jeep D4', registrationNumber: 'BA-4-PA-4422', seatingCapacity: 5, status: 'Active', availability: true, bluebookExpiry: '2028-01-20', insuranceExpiry: '2027-12-10', taxExpiry: '2027-12-01' },
];

export const mockDrivers: Driver[] = [
  { _id: 'drv_chandra_01', name: 'Sofa Bus Driver (Chandra Maharjan)', phone: '9802100125', licenseNumber: 'LIC-NP-88210', vehicleType: '28-Seater Sofa Bus', tripsCompleted: 14, remainingBalance: 85000, performanceRating: 4.9, leaveBalance: 10, status: 'Active', availability: true },
  { _id: 'drv_tarak_02', name: 'Scorpio Driver (Tarak Panja)', phone: '9841142416', licenseNumber: 'LIC-NP-44912', vehicleType: '4WD Scorpio Jeep', tripsCompleted: 19, remainingBalance: 34000, performanceRating: 4.8, leaveBalance: 8, status: 'Active', availability: true },
  { _id: 'drv_bishnu_03', name: 'Scorpio Driver (Bishnu Kafle)', phone: '9855045297', licenseNumber: 'LIC-NP-11029', vehicleType: '4WD Scorpio Jeep', tripsCompleted: 23, remainingBalance: 121000, performanceRating: 5.0, leaveBalance: 14, status: 'Active', availability: true },
  { _id: 'drv_abhijit_04', name: 'Scorpio Driver (Abhijit Ghosh)', phone: '9841002211', licenseNumber: 'LIC-NP-99301', vehicleType: '4WD Scorpio Jeep', tripsCompleted: 11, remainingBalance: 24000, performanceRating: 4.7, leaveBalance: 12, status: 'Active', availability: true }
];

export const mockGuides: Guide[] = [
  { _id: 'gde_301', name: 'Pasang Sherpa', rating: 4.9, languages: ['English', 'Nepali', 'Japanese'], certifications: ['High Altitude Rescue', 'Wilderness First Aid'], status: 'Active', availability: true },
  { _id: 'gde_302', name: 'Mingma Sherpa', rating: 4.8, languages: ['English', 'Nepali', 'German'], certifications: ['IFMGA Certified Mountain Guide'], status: 'Active', availability: false },
  { _id: 'gde_303', name: 'Tenzi Sherpa', rating: 4.7, languages: ['English', 'Nepali', 'French'], certifications: ['First Aid'], status: 'Active', availability: true },
  { _id: 'gde_304', name: 'Lhakpa Sherpa', rating: 4.9, languages: ['English', 'Nepali', 'Spanish'], certifications: ['Wilderness First Aid', 'NMA Certified Guide'], status: 'Active', availability: true },
];
