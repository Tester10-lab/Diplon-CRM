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
    driver: 'Sofa Bus Driver (Chandra Maharjan)',
    pax: 25,
    rooms: '25 Seats Sofa Bus',
    name: 'Chandra man Maharjan',
    number: '9802100125 / 9843500017',
    isPrivate: false,
    vehicleType: '28-Seater Sofa Bus',
    vehicleCapacity: 28
  },
  {
    id: 'veh_dep_jiri_02',
    tour: 'Jiri Tour (1N/2D)',
    date: '2026-08-01',
    sn: 2,
    driver: 'Scorpio Driver (Tarak Panja)',
    pax: 6,
    rooms: '2 rooms normal sharing',
    name: 'Tarak Panja',
    number: '9841142416',
    isPrivate: true,
    vehicleType: '4WD Scorpio Jeep',
    vehicleCapacity: 7
  },
  {
    id: 'veh_dep_mustang_03',
    tour: 'Upper Mustang Package (4N/5D)',
    date: '2026-10-28',
    sn: 3,
    driver: 'Scorpio Driver (Bishnu Kafle)',
    pax: 7,
    rooms: '2 rooms private',
    name: 'Bishnu Prasad Kafle',
    number: '9855045297',
    isPrivate: true,
    vehicleType: '4WD Scorpio Jeep',
    vehicleCapacity: 7
  },
  {
    id: 'veh_dep_muktinath_04',
    tour: 'Muktinath Tour (2N/3D)',
    date: '2026-10-25',
    sn: 4,
    driver: 'Scorpio Driver (Abhijit Ghosh)',
    pax: 2,
    rooms: '1 room Deluxe (Lalitpur Holidays)',
    name: 'Abhijit Ghosh',
    number: '+91 94334 68100',
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
