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
}

const SCORPIO_STORAGE_KEY = 'diplon_scorpio_assignments';

export const INITIAL_SCORPIO_DATA: ScorpioAssignment[] = [
  {
    id: 'scp_1',
    tour: 'Upper Mustang',
    date: '2026-08-02',
    sn: 1,
    driver: 'Pradip Bhai',
    pax: 16,
    rooms: '4-5',
    name: 'Narayan Shrestha',
    number: '9841273144',
    isPrivate: true
  },
  {
    id: 'scp_2',
    tour: 'Upper Mustang',
    date: '2026-08-02',
    sn: 2,
    driver: 'Surendra Bhai',
    pax: 16,
    rooms: '4-5',
    name: 'Narayan Shrestha',
    number: '9841273144',
    isPrivate: true
  },
  {
    id: 'scp_3',
    tour: 'Upper Mustang',
    date: '2026-08-02',
    sn: 3,
    driver: 'Aakash Bhujel',
    pax: 7,
    rooms: '2',
    name: 'rojina shakya',
    number: '9860099335'
  },
  {
    id: 'scp_4',
    tour: 'Upper Mustang',
    date: '2026-08-02',
    sn: 4,
    driver: 'Suman Dai (9851090895)',
    pax: 7,
    rooms: '2',
    name: 'Nepal dharsan',
    number: '9851090895'
  },
  {
    id: 'scp_5a',
    tour: 'Upper Mustang',
    date: '2026-08-02',
    sn: 5,
    driver: 'Shankar Bhai',
    pax: 5,
    rooms: '1',
    name: 'mahesh pande',
    number: '9841707253 / 98041307253 / 9841755800'
  },
  {
    id: 'scp_5b',
    tour: 'Upper Mustang',
    date: '2026-08-02',
    sn: 5,
    driver: 'Shankar Bhai',
    pax: 2,
    rooms: '1',
    name: 'Rachna pandey',
    number: '9842752662'
  },
  {
    id: 'scp_6',
    tour: 'Upper Mustang',
    date: '2026-08-02',
    sn: 6,
    driver: 's10 srijan',
    pax: 0,
    rooms: '-',
    name: 'Standby Vehicle',
    number: '-'
  },
  {
    id: 'scp_7a',
    tour: 'Upper Mustang',
    date: '2026-08-02',
    sn: 7,
    driver: 'Manish Bhai',
    pax: 4,
    rooms: '1',
    name: 'Birat Raj Joshi',
    number: '9704775893'
  },
  {
    id: 'scp_7b',
    tour: 'Upper Mustang',
    date: '2026-08-02',
    sn: 7,
    driver: 'Manish Bhai',
    pax: 4,
    rooms: '1',
    name: 'batuwa',
    number: '9851163426'
  },
  {
    id: 'scp_8a',
    tour: 'Upper Mustang',
    date: '2026-08-02',
    sn: 8,
    driver: 'Ramesh Dai (Dekohali)',
    pax: 4,
    rooms: '1',
    name: 'from beni',
    number: '9805169219'
  },
  {
    id: 'scp_8b',
    tour: 'Upper Mustang',
    date: '2026-08-02',
    sn: 8,
    driver: 'Ramesh Dai (Dekohali)',
    pax: 4,
    rooms: '1',
    name: 'Aarya Shrestha',
    number: '9801794360'
  },
  {
    id: 'scp_9',
    tour: 'Upper Mustang',
    date: '2026-08-02',
    sn: 9,
    driver: 'Rojit Dai',
    pax: 7,
    rooms: '2',
    name: 'Bijay Manandhar 5/6',
    number: '9803190650 / 9861652660'
  },
  {
    id: 'scp_10',
    tour: 'Upper Mustang',
    date: '2026-08-02',
    sn: 10,
    driver: 'muktinath tour',
    pax: 4,
    rooms: '1',
    name: 'Manju kumari thapa and',
    number: '9851144467'
  },
  {
    id: 'scp_11a',
    tour: 'Upper Mustang',
    date: '2026-08-02',
    sn: 11,
    driver: 'Rajan Saju /',
    pax: 5,
    rooms: '1',
    name: 'bimala chetri',
    number: '9767648385 - 970956235'
  },
  {
    id: 'scp_11b',
    tour: 'Upper Mustang',
    date: '2026-08-02',
    sn: 11,
    driver: 'Rajan Saju /',
    pax: 3,
    rooms: '1',
    name: 'vimshikh',
    number: '9813635818'
  },
  {
    id: 'scp_12a',
    tour: 'Upper Mustang',
    date: '2026-08-02',
    sn: 12,
    driver: 'Sabin Dai',
    pax: 5,
    rooms: '2',
    name: 'saurav',
    number: '9851356271'
  },
  {
    id: 'scp_12b',
    tour: 'Upper Mustang',
    date: '2026-08-02',
    sn: 12,
    driver: 'Sabin Dai',
    pax: 3,
    rooms: '1',
    name: 'Nima chumu Sherpa and',
    number: '9761433197'
  },
  {
    id: 'scp_13',
    tour: 'Upper Mustang',
    date: '2026-08-02',
    sn: 13,
    driver: '—',
    pax: 7,
    rooms: '2',
    name: 'Unassigned Group',
    number: '-'
  }
];

export function getScorpioAssignments(): ScorpioAssignment[] {
  try {
    const saved = localStorage.getItem(SCORPIO_STORAGE_KEY);
    if (saved) return JSON.parse(saved);
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
