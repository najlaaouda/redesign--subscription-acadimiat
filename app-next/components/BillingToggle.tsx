"use client";

import { usePricing } from "@/components/PricingProvider";

/**
 * Billing toggle bar — "شهري" / "سنوي" pill with a hand-drawn arrow
 * annotation ("وفّر 23%") pointing at the "سنوي" option.
 *
 * The arrow's `left` offset is calibrated so its tip lands on the
 * horizontal centre of the "سنوي" option inside the RTL flex row.
 */
export function BillingToggle() {
  const { billing, setBilling } = usePricing();
  return (
    <section
      className="relative z-20 pt-4 pb-3 sm:pt-6 sm:pb-4"
      aria-label="نوع الاشتراك"
    >
      <div className="max-w-container mx-auto px-4 sm:px-6 lg:px-8 flex justify-start">
        <div className="relative inline-block">
          {/* Hand-drawn arrow + "وفّر 23%" badge */}
          <div className="absolute bottom-full left-10 mb-1 flex items-start gap-1 pointer-events-none">
            <span className="text-heading text-h5 font-bold whitespace-nowrap">
              وفّر 23%
            </span>
            <svg
              width="56"
              height="56"
              viewBox="0 0 64 64"
              className="overflow-visible"
              aria-hidden="true"
            >
              <path
                d="M 58 8 C 54 22, 46 34, 34 42 C 24 48, 16 52, 8 56"
                stroke="var(--color-heading)"
                strokeWidth="1.6"
                strokeLinecap="round"
                fill="none"
              />
              <path
                d="M 8 56 L 14 50 M 8 56 L 14 60"
                stroke="var(--color-heading)"
                strokeWidth="1.6"
                strokeLinecap="round"
                fill="none"
              />
            </svg>
          </div>

          {/* Toggle pill */}
          <div
            className="inline-flex bg-[#F9F7FB] rounded-full p-1"
            role="tablist"
            aria-label="دورة الفوترة"
          >
            <button
              type="button"
              role="tab"
              aria-selected={billing === "monthly"}
              onClick={() => setBilling("monthly")}
              className={`px-6 py-2 rounded-full text-h5 font-medium cursor-pointer transition ${
                billing === "monthly"
                  ? "bg-white text-heading shadow-sm"
                  : "text-text-muted hover:text-heading"
              }`}
            >
              شهري
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={billing === "yearly"}
              onClick={() => setBilling("yearly")}
              className={`px-6 py-2 rounded-full text-h5 font-medium cursor-pointer transition ${
                billing === "yearly"
                  ? "bg-white text-heading shadow-sm"
                  : "text-text-muted hover:text-heading"
              }`}
            >
              سنوي
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
