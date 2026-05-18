/**
 * 27 academies featured in the testimonials marquee.
 * `image` is a filename inside /public/assets/ — Arabic names + spaces
 * are URL-encoded at render time so they survive the network round-trip.
 */
export interface Academy {
  name: string;
  url: string;
  image: string;
}

export const ACADEMIES: Academy[] = [
  { name: "د. ثابت حجازي",            url: "https://thabithejazi.acadimiat.com/",                          image: "ثابت حجازي.png" },
  { name: "سهل مهدي",                  url: "https://sahelmahdi.acadimiat.com/",                            image: "sahel.png" },
  { name: "حذيفة حجازي",              url: "https://huthifahejazi.acadimiat.com/",                         image: "حذيفة حجازي.png" },
  { name: "Owais",                     url: "https://moxowais.acadimiat.com/",                              image: "Owais.png" },
  { name: "Samara's Keto Life",        url: "https://samarasketolife.acadimiat.com/",                       image: "samara.png" },
  { name: "FBA Courses",               url: "https://fbaacademies.acadimiat.com/",                          image: "FBA Courses.png" },
  { name: "أكاديمية خالد إسماعيل",     url: "https://khalidismailacademy.acadimiat.com/",                   image: "أكاديمية خالد إسماعيل.png" },
  { name: "أكاديمية كوتش كريم عصام",   url: "https://kareemessam.online/",                                  image: "أكاديمية كوتش كريم عصام.png" },
  { name: "أكاديمية مباشر",            url: "https://mubasher-academy.acadimiat.com/",                      image: "أكاديمية مباشر.png" },
  { name: "7md Store",                 url: "https://7mdstore.acadimiat.com/",                              image: "7md Store.png" },
  { name: "Fabusse",                   url: "https://fabusse.acadimiat.com/",                               image: "Fabusse.png" },
  { name: "Ghazi Al-Mahayni",          url: "https://ghazi-almahayni.acadimiat.com/",                       image: "Ghazi Al-Mahayni.png" },
  { name: "أكاديمية كوتش رائد الجهني", url: "https://raedaljahane.acadimiat.com/",                          image: "أكاديمية كوتش رائد الجهني.png" },
  { name: "دال أكاديمي",                url: "https://dal.acadimiat.com/",                                   image: "دال أكاديمي.png" },
  { name: "الشيف أمجد",                url: "https://chefamjed.acadimiat.com/",                             image: "الشيف أمجد.png" },
  { name: "Youtube Skool",             url: "https://youtubeskool.acadimiat.com/",                          image: "Youtube Skool.png" },
  { name: "Reem Academy",              url: "https://reemacademy.acadimiat.com/",                           image: "Reem Academy.png" },
  { name: "عمر عبدالرحيم",             url: "https://omar-abdelrahim.acadimiat.com/",                       image: "عمر عبدالرحيم.png" },
  { name: "Yana Healing",              url: "https://afraabitar.acadimiat.com/",                            image: "Yana Healing.png" },
  { name: "Pro Designer",              url: "https://prodesigner.acadimiat.com/",                           image: "Pro Designer.png" },
  { name: "نمو",                        url: "https://nomo.acadimiat.com/",                                  image: "نمو.png" },
  { name: "Mayan Arts",                url: "https://mayanart.acadimiat.com/",                              image: "Mayan Arts.png" },
  { name: "وعي آخر",                   url: "https://anotherawareness.acadimiat.com/",                      image: "وعي آخر.png" },
  { name: "عفاف بنت ظافر",            url: "https://afaf1.acadimiat.com/",                                 image: "عفاف بنت ظافر.png" },
  { name: "الأتراك أكاديمي",           url: "https://rihlat-alnajah-mae-eabdallah-alturkii.acadimiat.com/", image: "الأتراك أكاديمي.png" },
  { name: "رونق",                       url: "https://rawnaq.acadimiat.com/",                                image: "رونق.png" },
  { name: "الشامي أكاديمي",            url: "https://al-shami-academic.acadimiat.com/",                     image: "الشامي أكاديمي.png" },
];
