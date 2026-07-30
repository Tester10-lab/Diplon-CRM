export type CalendarDisplayMode = 'BS_ONLY' | 'AD_ONLY' | 'DUAL_BS_AD';

export interface NepaliDate {
  year: number;
  month: number;
  day: number;
  monthName: string;
  monthNameEn: string;
  weekday: number;
  weekdayName: string;
  weekdayNameEn: string;
}

export const NEPALI_MONTHS = [
  { bs: 'वैशाख', en: 'Baisakh' },
  { bs: 'जेठ', en: 'Jestha' },
  { bs: 'असार', en: 'Ashadh' },
  { bs: 'साउन', en: 'Shrawan' },
  { bs: 'भदौ', en: 'Bhadra' },
  { bs: 'असोज', en: 'Ashwin' },
  { bs: 'कात्तिक', en: 'Kartik' },
  { bs: 'मंसिर', en: 'Mangsir' },
  { bs: 'पुस', en: 'Poush' },
  { bs: 'माघ', en: 'Magh' },
  { bs: 'फागुन', en: 'Falgun' },
  { bs: 'चैत', en: 'Chaitra' },
];

export const NEPALI_WEEKDAYS = [
  { bs: 'आइतबार', en: 'Sunday', short: 'आइत' },
  { bs: 'सोमबार', en: 'Monday', short: 'सोम' },
  { bs: 'मंगलबार', en: 'Tuesday', short: 'मंगल' },
  { bs: 'बुधबार', en: 'Wednesday', short: 'बुध' },
  { bs: 'बिहीबार', en: 'Thursday', short: 'बिही' },
  { bs: 'शुक्रबार', en: 'Friday', short: 'शुक्र' },
  { bs: 'शनिबार', en: 'Saturday', short: 'शनि' },
];

export const DEVANAGARI_DIGITS = ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९'];

export function toDevanagari(num: number | string): string {
  return num
    .toString()
    .split('')
    .map(ch => (ch >= '0' && ch <= '9' ? DEVANAGARI_DIGITS[parseInt(ch, 10)] : ch))
    .join('');
}

// Fixed offset estimation between AD & BS (Approx +56 Years, 8 Months, 15 Days)
export function adToBs(adDate: Date): NepaliDate {
  const adYear = adDate.getFullYear();
  const adMonth = adDate.getMonth();
  const adDay = adDate.getDate();
  const weekday = adDate.getDay();

  // Reference mapping: 2026 AD ~ 2083 BS
  let bsYear = adYear + 56;
  let bsMonth = (adMonth + 8) % 12;
  if (adMonth >= 4) {
    bsYear += 1;
  }
  let bsDay = (adDay + 14) % 30 || 30;

  const monthObj = NEPALI_MONTHS[bsMonth];
  const dayObj = NEPALI_WEEKDAYS[weekday];

  return {
    year: bsYear,
    month: bsMonth + 1,
    day: bsDay,
    monthName: monthObj.bs,
    monthNameEn: monthObj.en,
    weekday,
    weekdayName: dayObj.bs,
    weekdayNameEn: dayObj.en,
  };
}

export const NEPAL_HOLIDAYS_FESTIVALS: Record<string, string> = {
  '2026-07-28': 'Nag Panchami (नाग पञ्चमी)',
  '2026-08-08': 'Janai Purnima (जनै पूर्णिमा)',
  '2026-08-09': 'Gai Jatra (गाई जात्रा)',
  '2026-08-25': 'Krishna Janmashtami (कृष्ण जन्माष्टमी)',
  '2026-09-14': 'Teej (तीज)',
  '2026-10-18': 'Dashain Saptami (दशैं फूलपाती)',
  '2026-10-19': 'Maha Astami (महा अष्टमी)',
  '2026-10-20': 'Maha Navami (महा नवमी)',
  '2026-10-21': 'Vijaya Dashami (विजया दशमी)',
  '2026-11-09': 'Laxmi Puja / Tihar (लक्ष्मी पूजा)',
  '2026-11-10': 'Gobardhan Puja (गोवर्धन पूजा)',
  '2026-11-11': 'Bhai Tika (भाइटीका)',
};
