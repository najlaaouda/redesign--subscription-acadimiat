/**
 * Single source of truth for brand identity + URLs.
 * Imported by layout.tsx (metadata), sitemap.ts, robots.ts, and
 * JSON-LD schema blocks throughout the app.
 */
export const SITE = {
  url: "https://acadimiat.com",
  name: "أكاديميات",
  nameEn: "Acadimiat",
  description:
    "منصّة سعودية متكاملة تساعد المدرّبين وصنّاع المحتوى والمستشارين على بناء أكاديمياتهم الرقمية، رفع دوراتهم، وبيع منتجاتهم. ابدأ بـ $1 لأول شهر.",
  locale: "ar_SA",
  social: {
    twitter: "https://twitter.com/acadimiat",
    linkedin: "https://www.linkedin.com/company/acadimiat",
    instagram: "https://www.instagram.com/acadimiat",
    whatsapp: "https://wa.me/966500000000",
  },
} as const;
