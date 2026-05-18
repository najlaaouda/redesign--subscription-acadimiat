/**
 * The 3 pricing tiers — mirror of script.js PLANS object.
 * Used by Pricing Cards, Compare Table sticky header, and signup modal.
 */
export type PlanId = "starter" | "pro" | "advanced";
export type Billing = "monthly" | "yearly";
export type Currency = "USD" | "SAR";

export interface Plan {
  id: PlanId;
  name: string;
  monthlyUsd: number;
  yearlyUsd: number;       // displayed price per-month when on yearly billing
  yearlyTotalUsd: number;  // annual total invoice
  monthlySar: number;
  yearlySar: number;
  yearlyTotalSar: number;
  popular: boolean;
  features: string[];
}

export const PLANS: Plan[] = [
  {
    id: "starter",
    name: "الانطلاقة",
    monthlyUsd: 29,
    yearlyUsd: 23,
    yearlyTotalUsd: 276,
    monthlySar: 109,
    yearlySar: 86,
    yearlyTotalSar: 1032,
    popular: false,
    features: [
      "1 دورة منشورة",
      "1 جلسة استشارية",
      "1 منتج رقمي منشور",
      "500 مشترك بالنشرة البريدية",
      "500 رسالة بريدية شهرياً",
      "رفع 20 فيديو",
      "5 جيجابايت مساحة تخزين",
    ],
  },
  {
    id: "pro",
    name: "الاحترافية",
    monthlyUsd: 39,
    yearlyUsd: 29,
    yearlyTotalUsd: 348,
    monthlySar: 146,
    yearlySar: 109,
    yearlyTotalSar: 1308,
    popular: false,
    features: [
      // Mirror the Starter order one-to-one so users can compare across cards.
      "5 دورات منشورة",
      "10 جلسات استشارية",
      "منتجات رقمية غير محدودة",
      "2,000 مشترك بالنشرة البريدية",
      "1,000 رسالة بريدية شهرياً",
      "رفع فيديوهات غير محدود",
      "100 جيجابايت مساحة تخزين",
      // Pro-only additions beyond the Starter baseline.
      "3 باقات منشورة",
      "1 حساب مشرف",
      "دومين مخصّص",
      "دورات مباشرة غير محدودة",
    ],
  },
  {
    id: "advanced",
    name: "المتقدمة",
    monthlyUsd: 129,
    yearlyUsd: 99,
    yearlyTotalUsd: 1188,
    monthlySar: 484,
    yearlySar: 371,
    yearlyTotalSar: 4452,
    popular: true,
    features: [
      // ─── Parallel block — mirrors Pro / Starter row order ───
      "دورات منشورة غير محدودة",      // ↔ Starter 1, Pro 1
      "جلسات استشارية غير محدودة",    // ↔ Starter 2, Pro 2
      "منتجات رقمية غير محدودة",      // ↔ Starter 3, Pro 3
      "مشتركو النشرة غير محدودين",    // ↔ Starter 4, Pro 4
      "15,000 رسالة بريدية شهرياً",   // ↔ Starter 5, Pro 5
      "رفع فيديوهات غير محدود",       // ↔ Starter 6, Pro 6
      "مساحة تخزين غير محدودة",       // ↔ Starter 7, Pro 7
      "باقات منشورة غير محدودة",      // ↔ Pro 8 — placed after storage per spec
      // ─── Account tier — admin sits ABOVE supervisor per spec ───
      "2 حساب مدير",
      "5 حسابات مشرف",                // ↔ Pro 9
      "دومين مخصّص",                  // ↔ Pro 10
      "دورات مباشرة غير محدودة",      // ↔ Pro 11
      // ─── Advanced-only integrations ───
      "الربط مع Zapier",
      "الربط مع بوابات الدفع (Tab، Tamara، Stripe، PayPal، Paymob)",
    ],
  },
];

export function getPlan(id: PlanId): Plan {
  const p = PLANS.find((plan) => plan.id === id);
  if (!p) throw new Error(`Unknown plan id: ${id}`);
  return p;
}
