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

const SCORPIO_STORAGE_KEY = 'diplon_scorpio_assignments_v3';

export const INITIAL_SCORPIO_DATA: ScorpioAssignment[] = [];

export function getScorpioAssignments(): ScorpioAssignment[] {
  try {
    localStorage.removeItem('diplon_scorpio_assignments');
    const saved = localStorage.getItem(SCORPIO_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      const cleaned = parsed.filter((s: any) => !s.id?.startsWith('scp_'));
      localStorage.setItem(SCORPIO_STORAGE_KEY, JSON.stringify(cleaned));
      return cleaned;
    }
  } catch (e) {
    console.error('Failed to parse scorpio assignments:', e);
  }
  localStorage.setItem(SCORPIO_STORAGE_KEY, JSON.stringify([]));
  return [];
}

export function saveScorpioAssignments(data: ScorpioAssignment[]) {
  try {
    localStorage.setItem(SCORPIO_STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('Failed to save scorpio assignments:', e);
  }
}
