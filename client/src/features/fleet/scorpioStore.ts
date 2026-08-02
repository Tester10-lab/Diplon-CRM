export interface ScorpioAssignment {
  id: string;
  tour: string;
  date?: string;
  sn: number;
  driver: string;
  pax: number;
  rooms: string;
  name: string;
  number: string;
  isPrivate?: boolean;
  vehicleType?: string;
  vehicleCapacity?: number;
}

const SCORPIO_STORAGE_KEY = 'diplon_scorpio_assignments_v4';

export const INITIAL_SCORPIO_DATA: ScorpioAssignment[] = [
  {
    id: 'veh_dep_halesi_01',
    tour: 'Halesi Tour Package (1N/2D)',
    date: '2026-08-01',
    sn: 1,
    driver: 'Unassigned Driver',
    pax: 25,
    rooms: '25 Seats Sofa Bus',
    name: 'N/A',
    number: '',
    isPrivate: false,
    vehicleType: '28-Seater Sofa Bus',
    vehicleCapacity: 28
  },
  {
    id: 'veh_dep_jiri_02',
    tour: 'Jiri Tour (1N/2D)',
    date: '2026-08-01',
    sn: 2,
    driver: 'Unassigned Driver',
    pax: 6,
    rooms: '2 rooms normal sharing',
    name: 'N/A',
    number: '',
    isPrivate: true,
    vehicleType: '4WD Scorpio Jeep',
    vehicleCapacity: 7
  },
  {
    id: 'veh_dep_mustang_03',
    tour: 'Upper Mustang Package (4N/5D)',
    date: '2026-10-28',
    sn: 3,
    driver: 'Unassigned Driver',
    pax: 7,
    rooms: '2 rooms private',
    name: 'N/A',
    number: '',
    isPrivate: true,
    vehicleType: '4WD Scorpio Jeep',
    vehicleCapacity: 7
  },
  {
    id: 'veh_dep_muktinath_04',
    tour: 'Muktinath Tour (2N/3D)',
    date: '2026-10-25',
    sn: 4,
    driver: 'Unassigned Driver',
    pax: 2,
    rooms: '1 room Deluxe (Lalitpur Holidays)',
    name: 'N/A',
    number: '',
    isPrivate: true,
    vehicleType: '4WD Scorpio Jeep',
    vehicleCapacity: 7
  }
];

export function getScorpioAssignments(): ScorpioAssignment[] {
  try {
    localStorage.removeItem('diplon_scorpio_assignments');
    localStorage.removeItem('diplon_scorpio_assignments_v3');
    const saved = localStorage.getItem(SCORPIO_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.error('Failed to parse scorpio assignments:', e);
  }
  localStorage.setItem(SCORPIO_STORAGE_KEY, JSON.stringify(INITIAL_SCORPIO_DATA));
  return INITIAL_SCORPIO_DATA;
}

export function saveScorpioAssignments(data: ScorpioAssignment[]) {
  try {
    localStorage.setItem(SCORPIO_STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('Failed to save scorpio assignments:', e);
  }
}
