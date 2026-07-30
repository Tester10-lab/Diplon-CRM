import { Departure, Vehicle, Driver, Guide } from '../../types';

export const mockDepartures: Departure[] = [
  { _id: 'dep_8841', packageName: 'Everest Base Camp Trek 14 Days', startDate: '2026-10-01', endDate: '2026-10-14', seatsTotal: 10, seatsAvailable: 7, seatsReserved: 3, status: 'Active', travelerCount: 3, guideName: 'Pasang Sherpa', driverName: 'Babu Driver', vehicleReg: 'BA-2-PA-1234' },
  { _id: 'dep_8842', packageName: 'Annapurna Circuit Trek 12 Days', startDate: '2026-10-05', endDate: '2026-10-17', seatsTotal: 12, seatsAvailable: 8, seatsReserved: 4, status: 'Active', travelerCount: 4, guideName: 'Mingma Sherpa', driverName: 'Kaji Driver', vehicleReg: 'BA-1-PA-5678' },
  { _id: 'dep_8843', packageName: 'Langtang Valley Trek 9 Days', startDate: '2026-09-01', endDate: '2026-09-10', seatsTotal: 8, seatsAvailable: 0, seatsReserved: 8, status: 'Delayed', travelerCount: 8, guideName: 'Tenzi Sherpa', driverName: 'Babu Driver', vehicleReg: 'BA-3-PA-9900' },
  { _id: 'dep_8844', packageName: 'Manaslu Circuit Trek 16 Days', startDate: '2026-10-15', endDate: '2026-10-31', seatsTotal: 10, seatsAvailable: 6, seatsReserved: 4, status: 'Active', travelerCount: 4, guideName: 'Lhakpa Sherpa', driverName: 'Suman Driver', vehicleReg: 'BA-4-PA-4422' },
];

export const mockVehicles: Vehicle[] = [
  { _id: 'veh_101', name: 'Luxury Tourist Bus A1', registrationNumber: 'BA-2-PA-1234', seatingCapacity: 35, status: 'Active', availability: true, bluebookExpiry: '2027-12-31', insuranceExpiry: '2027-11-30', taxExpiry: '2027-10-15' },
  { _id: 'veh_102', name: '4WD Scorpio Jeep B2', registrationNumber: 'BA-1-PA-5678', seatingCapacity: 7, status: 'Active', availability: true, bluebookExpiry: '2027-08-15', insuranceExpiry: '2027-08-01', taxExpiry: '2027-07-20' },
  { _id: 'veh_103', name: 'Toyota Coaster Van C3', registrationNumber: 'BA-3-PA-9900', seatingCapacity: 22, status: 'Active', availability: false, bluebookExpiry: '2026-12-01', insuranceExpiry: '2026-11-15', taxExpiry: '2026-11-01' },
  { _id: 'veh_104', name: '4WD Prado Jeep D4', registrationNumber: 'BA-4-PA-4422', seatingCapacity: 5, status: 'Active', availability: true, bluebookExpiry: '2028-01-20', insuranceExpiry: '2027-12-10', taxExpiry: '2027-12-01' },
];

export const mockDrivers: Driver[] = [];

export const mockGuides: Guide[] = [
  { _id: 'gde_301', name: 'Pasang Sherpa', rating: 4.9, languages: ['English', 'Nepali', 'Japanese'], certifications: ['High Altitude Rescue', 'Wilderness First Aid'], status: 'Active', availability: true },
  { _id: 'gde_302', name: 'Mingma Sherpa', rating: 4.8, languages: ['English', 'Nepali', 'German'], certifications: ['IFMGA Certified Mountain Guide'], status: 'Active', availability: false },
  { _id: 'gde_303', name: 'Tenzi Sherpa', rating: 4.7, languages: ['English', 'Nepali', 'French'], certifications: ['First Aid'], status: 'Active', availability: true },
  { _id: 'gde_304', name: 'Lhakpa Sherpa', rating: 4.9, languages: ['English', 'Nepali', 'Spanish'], certifications: ['Wilderness First Aid', 'NMA Certified Guide'], status: 'Active', availability: true },
];
