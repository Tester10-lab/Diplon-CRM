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

const B2B_STORAGE_KEY = 'diplon_b2b_company_ledger_v6';

export const INITIAL_B2B_RECORDS: B2BRecord[] = [
  {
    id: 'b2b_halesi_01',
    companyName: 'Hike on Trek Travel',
    travelDate: '1st Aug 2026',
    packageName: 'Halesi Tour Package',
    tourDuration: '1N/2D',
    customerName: 'Chandra man Maharjan',
    contactNumber: '9802100125 / 9843500017',
    pax: 25,
    ratePerPax: 3500,
    vehicleType: '28-Seater Sofa Bus',
    pickupLocation: 'Shangri-la Hotel',
    buyingPrice: 87500,
    collectionAmount: 85000,
    profit: 2500,
    paymentStatus: '85,000/- Rs Collect on 28-seater sofa bus',
    tourStatus: 'Confirmed',
    notes: '25 Person 28 seater sofa bus | Bought at :3,500*25=87,500/- Rs | 85,000/- Rs Collect on bus'
  },
  {
    id: 'b2b_jiri_02',
    companyName: 'Hike on Trek Travel',
    travelDate: '1st Aug 2026',
    packageName: 'Jiri Tour',
    tourDuration: '1N/2D',
    customerName: 'Tarak Panja',
    contactNumber: '9841142416',
    pax: 6,
    ratePerPax: 5500,
    vehicleType: '4WD Scorpio Jeep',
    pickupLocation: 'New Road Angan sweets',
    buyingPrice: 33000,
    collectionAmount: 34000,
    profit: -1000,
    paymentStatus: '34,000 Rs collect on Scorpio',
    tourStatus: 'Confirmed',
    notes: '6 person private, 2 rooms normal sharing | BUYING: 5500*6=33000 RS ONLY | 34000 Rs collect on Scorpio'
  },
  {
    id: 'b2b_mustang_03',
    companyName: 'Hike on Trek Travel',
    travelDate: 'Oct 28 2026',
    packageName: 'Upper Mustang Package',
    tourDuration: '4N/5D',
    customerName: 'Bishnu Prasad Kafle',
    contactNumber: '9855045297',
    pax: 7,
    ratePerPax: 16500,
    vehicleType: '4WD Scorpio Jeep',
    pickupLocation: 'Bharatpur 10 dungana chok near CMS',
    buyingPrice: 115500,
    collectionAmount: 121000,
    profit: -5500,
    paymentStatus: '1,21,000/- Rs Collect on scorpio',
    tourStatus: 'Confirmed',
    notes: '7 Person private tour 2 room | Bought at :16,500*7=1,15,500/- Rs | 1,21,000/- Rs Collect on scorpio'
  },
  {
    id: 'b2b_muktinath_04',
    companyName: 'Hike on Trek Travel',
    travelDate: 'Oct 25 2026',
    packageName: 'Muktinath Tour',
    tourDuration: '2N/3D',
    customerName: 'Abhijit Ghosh',
    contactNumber: '+91 94334 68100',
    pax: 2,
    ratePerPax: 22000,
    vehicleType: '4WD Scorpio Jeep',
    pickupLocation: 'Hotel Himalayan Vacation, Lakeside 6th-7th St, Pokhara',
    buyingPrice: 44000,
    collectionAmount: 34400,
    profit: 9600,
    paymentStatus: '34,400 Rs collect on Scorpio (Advance 9,600 paid)',
    tourStatus: 'Confirmed',
    notes: '2 person private tour | Total: 44,000 Rs | Advance: 9,600 Rs paid | 34,400 Rs collect on Scorpio'
  }
];

export function getB2BRecords(): B2BRecord[] {
  try {
    localStorage.removeItem('diplon_b2b_company_ledger');
    localStorage.removeItem('diplon_b2b_company_ledger_v3');
    localStorage.removeItem('diplon_b2b_company_ledger_v4');
    localStorage.removeItem('diplon_b2b_company_ledger_v5');
    const saved = localStorage.getItem(B2B_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.error('Failed to parse B2B records:', e);
  }
  localStorage.setItem(B2B_STORAGE_KEY, JSON.stringify(INITIAL_B2B_RECORDS));
  return INITIAL_B2B_RECORDS;
}

export function saveB2BRecords(records: B2BRecord[]) {
  try {
    localStorage.setItem(B2B_STORAGE_KEY, JSON.stringify(records));
  } catch (e) {
    console.error('Failed to save B2B records:', e);
  }
}
