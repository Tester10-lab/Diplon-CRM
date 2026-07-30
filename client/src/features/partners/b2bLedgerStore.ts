export interface B2BRecord {
  id: string;
  companyName: string;
  travelDate: string;
  packageName: string;
  tourDuration: string;
  customerName: string;
  contactNumber: string;
  pax: number;
  ratePerPax?: number;
  vehicleType: string;
  pickupLocation: string;
  buyingPrice: number;
  collectionAmount: number;
  profit: number;
  paymentStatus: string;
  tourStatus: 'Confirmed' | 'Pending' | 'Completed' | 'Cancelled';
  notes: string;
}

const B2B_STORAGE_KEY = 'diplon_b2b_company_ledger_v3';

export const INITIAL_B2B_RECORDS: B2BRecord[] = [];

export function getB2BRecords(): B2BRecord[] {
  try {
    localStorage.removeItem('diplon_b2b_company_ledger');
    const saved = localStorage.getItem(B2B_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      const cleaned = parsed.filter((r: any) => !r.id?.startsWith('b2b_'));
      localStorage.setItem(B2B_STORAGE_KEY, JSON.stringify(cleaned));
      return cleaned;
    }
  } catch (e) {
    console.error('Failed to parse B2B records:', e);
  }
  localStorage.setItem(B2B_STORAGE_KEY, JSON.stringify([]));
  return [];
}

export function saveB2BRecords(records: B2BRecord[]) {
  try {
    localStorage.setItem(B2B_STORAGE_KEY, JSON.stringify(records));
  } catch (e) {
    console.error('Failed to save B2B records:', e);
  }
}
