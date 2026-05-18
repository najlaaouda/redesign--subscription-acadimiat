/**
 * Country list for the phone-entry step. Each entry carries:
 *   • `flag`     — emoji used in the chip + dropdown row
 *   • `dial`     — international dial code (e.g. "+966")
 *   • `phoneLen` — expected length of the national subscriber number
 *                  (digits AFTER the dial code, without leading 0).
 *                  Used to drive `maxLength` and the "send OTP" button's
 *                  enabled state.
 *   • `placeholder` — hint pattern shown when the field is empty.
 *
 * Ordered by user expectation: SA first, then the GCC, then Egypt and
 * the wider Arab world.
 */
export interface Country {
  code: string;
  name: string;
  flag: string;
  dial: string;
  phoneLen: number;
  placeholder: string;
}

export const COUNTRIES: Country[] = [
  { code: "SA", name: "السعودية",      flag: "🇸🇦", dial: "+966", phoneLen: 9,  placeholder: "5x xxx xxxx"  },
  { code: "AE", name: "الإمارات",       flag: "🇦🇪", dial: "+971", phoneLen: 9,  placeholder: "5x xxx xxxx"  },
  { code: "KW", name: "الكويت",         flag: "🇰🇼", dial: "+965", phoneLen: 8,  placeholder: "xxxx xxxx"    },
  { code: "BH", name: "البحرين",        flag: "🇧🇭", dial: "+973", phoneLen: 8,  placeholder: "xxxx xxxx"    },
  { code: "QA", name: "قطر",            flag: "🇶🇦", dial: "+974", phoneLen: 8,  placeholder: "xxxx xxxx"    },
  { code: "OM", name: "عُمان",          flag: "🇴🇲", dial: "+968", phoneLen: 8,  placeholder: "xxxx xxxx"    },
  { code: "EG", name: "مصر",            flag: "🇪🇬", dial: "+20",  phoneLen: 10, placeholder: "10x xxx xxxx" },
  { code: "JO", name: "الأردن",         flag: "🇯🇴", dial: "+962", phoneLen: 9,  placeholder: "7x xxx xxxx"  },
  { code: "LB", name: "لبنان",          flag: "🇱🇧", dial: "+961", phoneLen: 8,  placeholder: "xx xxx xxx"   },
  { code: "IQ", name: "العراق",         flag: "🇮🇶", dial: "+964", phoneLen: 10, placeholder: "7xx xxx xxxx" },
  { code: "MA", name: "المغرب",         flag: "🇲🇦", dial: "+212", phoneLen: 9,  placeholder: "6xx xxx xxx"  },
  { code: "TN", name: "تونس",           flag: "🇹🇳", dial: "+216", phoneLen: 8,  placeholder: "xx xxx xxx"   },
  { code: "DZ", name: "الجزائر",        flag: "🇩🇿", dial: "+213", phoneLen: 9,  placeholder: "6xx xxx xxx"  },
  { code: "SD", name: "السودان",        flag: "🇸🇩", dial: "+249", phoneLen: 9,  placeholder: "9x xxx xxxx"  },
  { code: "PS", name: "فلسطين",         flag: "🇵🇸", dial: "+970", phoneLen: 9,  placeholder: "5xx xxx xxx"  },
  { code: "YE", name: "اليمن",          flag: "🇾🇪", dial: "+967", phoneLen: 9,  placeholder: "7xx xxx xxx"  },
  { code: "LY", name: "ليبيا",          flag: "🇱🇾", dial: "+218", phoneLen: 9,  placeholder: "9x xxx xxxx"  },
  { code: "SY", name: "سوريا",          flag: "🇸🇾", dial: "+963", phoneLen: 9,  placeholder: "9xx xxx xxx"  },
];

export const DEFAULT_COUNTRY = COUNTRIES[0]; // Saudi Arabia
