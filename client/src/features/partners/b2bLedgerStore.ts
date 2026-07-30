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

const B2B_STORAGE_KEY = 'diplon_b2b_company_ledger';

export const INITIAL_B2B_RECORDS: B2BRecord[] = [
  {
    id: 'b2b_1',
    companyName: 'Himalayan Treks & Travels',
    travelDate: '29th Sep 2025',
    packageName: 'Upper Mustang',
    tourDuration: '4N/5D',
    customerName: 'Sworatmika Lacoul',
    contactNumber: '9861815700, 9841127188',
    pax: 3,
    ratePerPax: 15500,
    vehicleType: 'Scorpio',
    pickupLocation: 'Gongabu',
    buyingPrice: 46500,
    collectionAmount: 44500,
    profit: 2000,
    paymentStatus: 'Balance on Pickup',
    tourStatus: 'Confirmed',
    notes: 'Buying calc: 15500*3=46500 | Collection line: 44500/- Rs collect on. Scorpio'
  },
  {
    id: 'b2b_2',
    companyName: 'Himalayan Treks & Travels',
    travelDate: '24th Sep 2025',
    packageName: 'Muktinath',
    tourDuration: '3N/4D',
    customerName: 'ishan shrestha',
    contactNumber: '9812153067',
    pax: 4,
    ratePerPax: 11000,
    vehicleType: 'Scorpio',
    pickupLocation: 'drop extra',
    buyingPrice: 44000,
    collectionAmount: 45000,
    profit: -1000,
    paymentStatus: 'Balance on Pickup',
    tourStatus: 'Confirmed',
    notes: 'Buying calc: 11000*4=44000 | Collection line: 45000/-Rs collect on. Scorpio'
  },
  {
    id: 'b2b_3',
    companyName: 'Kathmandu B2B Agency',
    travelDate: 'September 24th',
    packageName: 'Palungtar',
    tourDuration: '1N/2D',
    customerName: 'Binod Dhungel',
    contactNumber: 'WhatsApp +13128021839',
    pax: 2,
    ratePerPax: 7500,
    vehicleType: 'Scorpio',
    pickupLocation: 'Ramada Hotel Dhumbarahi',
    buyingPrice: 15000,
    collectionAmount: 4000,
    profit: 11000,
    paymentStatus: 'Balance on Pickup',
    tourStatus: 'Confirmed',
    notes: 'Buying calc: 7500*2=15000 RS ONLY | Collection line: 4000 RS COLLECT ON SCORPIO.'
  },
  {
    id: 'b2b_4',
    companyName: 'Kathmandu B2B Agency',
    travelDate: '26 Sep 2025',
    packageName: 'Pathivara',
    tourDuration: '4N/5D',
    customerName: 'Ghanshyam Kunwar',
    contactNumber: '9840884190',
    pax: 3,
    ratePerPax: 15000,
    vehicleType: 'Scorpio',
    pickupLocation: 'Suryadarshan Height Micro Station, Tokha',
    buyingPrice: 45000,
    collectionAmount: 43000,
    profit: 2000,
    paymentStatus: 'Balance on Pickup',
    tourStatus: 'Confirmed',
    notes: 'Buying calc: 15000*3= 45000/ | Collection line: 43000/- RS COLLECT ON SCORPIO'
  },
  {
    id: 'b2b_5',
    companyName: 'Everest Global B2B',
    travelDate: '25 Sep',
    packageName: 'Ghandruk',
    tourDuration: '2N/3D',
    customerName: 'Prakash Sapkota',
    contactNumber: '+977 984-4834511',
    pax: 6,
    ratePerPax: 9700,
    vehicleType: 'Scorpio',
    pickupLocation: 'Kirtipur Dhalpa chowk and Gwarko chowk',
    buyingPrice: 58200,
    collectionAmount: 57400,
    profit: 800,
    paymentStatus: 'Balance on Pickup',
    tourStatus: 'Confirmed',
    notes: 'Buying calc: 9700*6= 58200 RS ONLY | Collection line: 57400 RS COLLECT ON SCORPIO.'
  },
  {
    id: 'b2b_6',
    companyName: 'Everest Global B2B',
    travelDate: '23rd Nov 2025',
    packageName: 'Muktinath',
    tourDuration: '6N/7D',
    customerName: 'Debottam Das / Tanmay Bhattacharya',
    contactNumber: '9038883198 / 9007013242',
    pax: 7,
    ratePerPax: 0,
    vehicleType: 'Scorpio',
    pickupLocation: 'Bus park pickup Pokhara',
    buyingPrice: 0,
    collectionAmount: 119000,
    profit: -119000,
    paymentStatus: 'Balance on Pickup',
    tourStatus: 'Confirmed',
    notes: 'Buying calc: tacharya | Collection line: 1,19,000 Rs collect on Scorpio. | BUYING PARTIES'
  },
  {
    id: 'b2b_7',
    companyName: 'Himalayan Treks & Travels',
    travelDate: '28th Sep 2025',
    packageName: 'Upper Mustang',
    tourDuration: '4N/5D',
    customerName: 'Pema Yangzen Lama',
    contactNumber: '9862404632',
    pax: 2,
    ratePerPax: 17000,
    vehicleType: 'Scorpio',
    pickupLocation: 'kailash bodhi secondary school ramhiti boudha',
    buyingPrice: 34000,
    collectionAmount: 31000,
    profit: 3000,
    paymentStatus: 'Balance on Pickup',
    tourStatus: 'Confirmed',
    notes: 'Buying calc: 17000*2= 34000/ | Collection line: 31000/- Rs collect on Scorpio.'
  },
  {
    id: 'b2b_8',
    companyName: 'Kathmandu B2B Agency',
    travelDate: '24th Ashwin',
    packageName: 'Muktinath',
    tourDuration: '4N/5D',
    customerName: 'Roshan Manandhar',
    contactNumber: '9841727212',
    pax: 9,
    ratePerPax: 0,
    vehicleType: 'EV Jeep',
    pickupLocation: 'Satdobato-15, Lalitpur',
    buyingPrice: 15,
    collectionAmount: 93500,
    profit: -93485,
    paymentStatus: 'Balance on Pickup',
    tourStatus: 'Confirmed',
    notes: 'Buying calc: o-15, Lalitpur | Collection line: 93500/- Rs Collect on Ev jeep'
  },
  {
    id: 'b2b_9',
    companyName: 'Himalayan Treks & Travels',
    travelDate: '5th Oct 2025',
    packageName: 'Pathivara',
    tourDuration: '4N/5D',
    customerName: 'Manish Ghimire',
    contactNumber: '9841680297',
    pax: 8,
    ratePerPax: 15000,
    vehicleType: 'Scorpio',
    pickupLocation: 'ramkot jayantigau',
    buyingPrice: 120000,
    collectionAmount: 116400,
    profit: 3600,
    paymentStatus: 'Balance on Pickup',
    tourStatus: 'Confirmed',
    notes: 'Buying calc: 15000*8=120,000/ | Collection line: 116400/- Rs Collect on Scorpio.'
  },
  {
    id: 'b2b_10',
    companyName: 'Kathmandu B2B Agency',
    travelDate: '4 Oct',
    packageName: 'Kalinchowk',
    tourDuration: '1N/2D',
    customerName: 'Urmila thapa',
    contactNumber: '9816622299',
    pax: 3,
    ratePerPax: 4500,
    vehicleType: 'Scorpio',
    pickupLocation: 'Kalanki not fixed',
    buyingPrice: 13500,
    collectionAmount: 12000,
    profit: 1500,
    paymentStatus: 'Balance on Pickup',
    tourStatus: 'Confirmed',
    notes: 'Buying calc: 4500*3=13500 RS ONLY | Collection line: 12000 RS collect on Scorpio.'
  },
  {
    id: 'b2b_11',
    companyName: 'Everest Global B2B',
    travelDate: '3rd Oct 2025',
    packageName: 'Muktinath',
    tourDuration: '3N/4D',
    customerName: 'Manju kumari thapa and bimala magar',
    contactNumber: '9851144467',
    pax: 4,
    ratePerPax: 11000,
    vehicleType: 'Scorpio',
    pickupLocation: 'Swoyambhu',
    buyingPrice: 44000,
    collectionAmount: 43000,
    profit: 1000,
    paymentStatus: 'Balance on Pickup',
    tourStatus: 'Confirmed',
    notes: 'Buying calc: 11000*4=44000/ | Collection line: 43000/- Rs collect on Scorpio.'
  },
  {
    id: 'b2b_12',
    companyName: 'Himalayan Treks & Travels',
    travelDate: '10th October',
    packageName: 'Muktinath',
    tourDuration: '3N/4D',
    customerName: 'Muna K C Karki',
    contactNumber: '9841131146',
    pax: 2,
    ratePerPax: 12500,
    vehicleType: 'Scorpio',
    pickupLocation: 'Duwakot 2, changunarayan bhaktapur',
    buyingPrice: 25000,
    collectionAmount: 22000,
    profit: 3000,
    paymentStatus: 'Balance on Pickup',
    tourStatus: 'Confirmed',
    notes: 'Buying calc: 12500*2=25000/ | Collection line: 22000/- Rs collect on Scorpio.'
  },
  {
    id: 'b2b_13',
    companyName: 'Himalayan Treks & Travels',
    travelDate: '3rd Oct 2025',
    packageName: 'Upper Mustang',
    tourDuration: '4N/5D',
    customerName: 'Birat Raj Joshi',
    contactNumber: '9704775883',
    pax: 4,
    ratePerPax: 15500,
    vehicleType: 'Scorpio',
    pickupLocation: 'Chhetrapati',
    buyingPrice: 62000,
    collectionAmount: 61000,
    profit: 1000,
    paymentStatus: 'Balance on Pickup',
    tourStatus: 'Confirmed',
    notes: 'Buying calc: 15500*4=62000/ | Collection line: 61000/- Rs collect on Scorpio.'
  },
  {
    id: 'b2b_14',
    companyName: 'Himalayan Treks & Travels',
    travelDate: '7th Oct 2025',
    packageName: 'Upper Mustang',
    tourDuration: '4N/5D',
    customerName: 'Krishna Bahadur',
    contactNumber: '+977 985-1139659',
    pax: 3,
    ratePerPax: 15500,
    vehicleType: 'Scorpio',
    pickupLocation: 'Baneshwor',
    buyingPrice: 46500,
    collectionAmount: 39500,
    profit: 7000,
    paymentStatus: 'Balance on Pickup',
    tourStatus: 'Confirmed',
    notes: 'Buying calc: 15500*3= 46500 RS ONLY | Collection line: 39500/- Rs collect on Scorpio.'
  }
];

export function getB2BRecords(): B2BRecord[] {
  try {
    const saved = localStorage.getItem(B2B_STORAGE_KEY);
    if (saved) return JSON.parse(saved);
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
