import { Departure, Vehicle, Driver, Guide } from '../../types';
import { apiClient } from './apiClient';
import { mockDepartures, mockVehicles, mockDrivers, mockGuides } from '../mocks/mockOperations';

const DEPARTURES_STORAGE_KEY = 'diplon_operations_departures_v5';

function getStoredDepartures(): Departure[] {
  try {
    localStorage.removeItem('diplon_operations_departures');
    localStorage.removeItem('diplon_operations_departures_v3');
    localStorage.removeItem('diplon_operations_departures_v4');
    const saved = localStorage.getItem(DEPARTURES_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      const cleaned = parsed.filter((d: any) => 
        d.packageName?.includes('Halesi') ||
        d.packageName?.includes('Jiri') ||
        d.packageName?.includes('Mustang') ||
        d.packageName?.includes('Muktinath')
      );
      if (cleaned.length > 0) {
        localStorage.setItem(DEPARTURES_STORAGE_KEY, JSON.stringify(cleaned));
        return cleaned;
      }
    }
  } catch (e) {
    console.error('Failed to parse stored departures:', e);
  }
  localStorage.setItem(DEPARTURES_STORAGE_KEY, JSON.stringify(mockDepartures));
  return mockDepartures;
}

function notifyDataChange() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('diplon_data_changed'));
    window.dispatchEvent(new Event('storage'));
  }
}

function saveStoredDepartures(departures: Departure[]) {
  try {
    localStorage.setItem(DEPARTURES_STORAGE_KEY, JSON.stringify(departures));
    notifyDataChange();
  } catch (e) {
    console.error('Failed to save departures to localStorage:', e);
  }
}

export const operationsService = {
  async getDepartures(): Promise<Departure[]> {
    const fallback = getStoredDepartures();
    return apiClient.get<Departure[]>('/operations/departures', fallback);
  },
  async getVehicles(): Promise<Vehicle[]> {
    return apiClient.get<Vehicle[]>('/operations/fleet', mockVehicles);
  },
  async getDrivers(): Promise<Driver[]> {
    return apiClient.get<Driver[]>('/operations/drivers', mockDrivers);
  },
  async getGuides(): Promise<Guide[]> {
    return apiClient.get<Guide[]>('/operations/guides', mockGuides);
  },
  async getDashboardData(): Promise<any> {
    return apiClient.get<any>('/operations/dashboard', null);
  },
  async getTimeline(): Promise<any[]> {
    return apiClient.get<any[]>('/operations/timeline', []);
  },
  async createDeparture(departure: Partial<Departure>): Promise<Departure> {
    const current = getStoredDepartures();
    const newDeparture: Departure = {
      _id: `dep_${Date.now()}`,
      packageName: departure.packageName || 'Custom Tour Departure',
      startDate: departure.startDate || new Date().toISOString().split('T')[0],
      endDate: departure.endDate || new Date().toISOString().split('T')[0],
      seatsTotal: departure.seatsTotal || 10,
      seatsAvailable: departure.seatsAvailable ?? (departure.seatsTotal || 10),
      seatsReserved: departure.seatsReserved || 0,
      status: departure.status || 'Active',
      travelerCount: departure.travelerCount || 0,
      guideName: departure.guideName || 'Unassigned',
      driverName: departure.driverName || 'Unassigned',
      vehicleReg: departure.vehicleReg || 'Unassigned'
    };

    const updated = [newDeparture, ...current];
    saveStoredDepartures(updated);

    try {
      await apiClient.post<Departure>('/operations/departures', newDeparture, newDeparture);
    } catch (e) {
      console.warn('Backend offline, saved tour departure locally', e);
    }

    return newDeparture;
  },
  async updateDeparture(id: string, departure: Partial<Departure>): Promise<Departure> {
    const current = getStoredDepartures();
    const index = current.findIndex(d => d._id === id);
    let updatedDeparture: Departure;
    if (index !== -1) {
      current[index] = { ...current[index], ...departure };
      updatedDeparture = current[index];
    } else {
      updatedDeparture = { ...departure, _id: id } as Departure;
      current.unshift(updatedDeparture);
    }
    saveStoredDepartures(current);

    try {
      return await apiClient.put<Departure>(`/operations/departures/${id}`, departure, updatedDeparture);
    } catch (e) {
      return updatedDeparture;
    }
  },
  async createVehicle(vehicle: Partial<Vehicle>): Promise<Vehicle> {
    return apiClient.post<Vehicle>('/operations/fleet', vehicle);
  },
  async updateVehicle(id: string, vehicle: Partial<Vehicle>): Promise<Vehicle> {
    return apiClient.put<Vehicle>(`/operations/fleet/${id}`, vehicle);
  },
  async createDriver(driver: Partial<Driver>): Promise<Driver> {
    return apiClient.post<Driver>('/operations/drivers', driver);
  },
  async updateDriver(id: string, driver: Partial<Driver>): Promise<Driver> {
    return apiClient.put<Driver>(`/operations/drivers/${id}`, driver);
  },
  async createGuide(guide: Partial<Guide>): Promise<Guide> {
    return apiClient.post<Guide>('/operations/guides', guide);
  },
  async updateGuide(id: string, guide: Partial<Guide>): Promise<Guide> {
    return apiClient.put<Guide>(`/operations/guides/${id}`, guide);
  }
};
