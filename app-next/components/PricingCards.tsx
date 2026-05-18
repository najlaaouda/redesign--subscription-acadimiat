"use client";

import { PLANS, type Plan, type PlanId } from "@/lib/plans";
import { SITE } from "@/lib/site";
import { openSignup } from "@/lib/auth-events";
import { usePricing } from "@/components/PricingProvider";

const CheckIcon = () => (
  <svg
    className="w-[18px] h-[18px] text-heading/80 mt-0.5 flex-shrink-0"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    aria-hidden="true"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2.2}
      d="M5 13l4 4L19 7"
    />
  </svg>
);

/** Per-plan price display — pulls billing from PricingContext. */
function PlanPrice({ plan }: { plan: Plan }) {
  const { billing } = usePricing();
  const price = billing === "yearly" ? plan.yearlyUsd : plan.monthlyUsd;
  return (
    <div className="mb-4">
      <div className="flex items-baseline gap-2 mb-2.5">
        <span className="text-[44px] font-bold text-heading leading-none">
          ${price}
        </span>
        <span className="text-h4 text-heading">شهريًا</span>
      </div>
      <PriceNote plan={plan} />
    </div>
  );
}

function PriceNote({ plan }: { plan: Plan }) {
  const { billing } = usePricing();
  // Show the yearly-total pill only on yearly billing.
  // Monthly billing → no pill (user requested removal).
  if (billing !== "yearly") return null;
  return (
    <span className="inline-block bg-[#F9F7FB] text-heading text-h5 font-medium px-3.5 py-1.5 rounded-full">
      ${plan.yearlyTotalUsd} تدفع سنويًا
    </span>
  );
}

function plansJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: `${SITE.name} — منصة الدورات`,
    description: SITE.description,
    brand: { "@type": "Brand", name: SITE.name },
    offers: PLANS.map((p) => ({
      "@type": "Offer",
      name: p.name,
      price: p.yearlyUsd,
      priceCurrency: "USD",
      url: `${SITE.url}/?plan=${p.id}`,
      availability: "https://schema.org/InStock",
    })),
  };
}

export function PricingCards() {
  const [starter, pro, advanced] = PLANS;

  /** Dispatch an `auth:open-signup` event — AuthModal listens for it
   *  globally, so we never need to wire prop-drilled state for the modal. */
  const openAuth = (id: PlanId) => openSignup({ plan: id });

  return (
    <section
      id="pricing-cards"
      className="relative z-10 pt-2 pb-12 sm:pt-3 sm:pb-14 lg:pb-16"
    >
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(plansJsonLd()) }}
      />
      <div className="max-w-container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Block 1 — starter + pro */}
          <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 bg-white border border-[#F1ECF4] rounded-3xl overflow-hidden">
            {[starter, pro].map((plan, i) => (
              <article
                key={plan.id}
                className={`p-7 lg:p-8 h-full flex flex-col ${
                  i === 0 ? "md:border-e md:border-[#F1ECF4]" : ""
                }`}
              >
                <header className="mb-4">
                  <h3 className="text-h2 font-semibold text-heading">
                    {plan.name}
                  </h3>
                </header>
                <PlanPrice plan={plan} />
                <button
                  type="button"
                  onClick={() => openAuth(plan.id)}
                  className="btn-premium block w-full text-center bg-white text-heading text-h4 font-medium py-3 rounded-xl mb-5 border border-[#E7DFEC] hover:bg-primary hover:text-white hover:border-primary cursor-pointer transition"
                >
                  ابدأ تجربتك المجانية
                </button>
                <ul className="space-y-3 text-h5 text-heading flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5">
                      <CheckIcon />
                      <FeatureText text={f} />
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>

          {/* Block 2 — advanced (featured) */}
          <article className="p-7 lg:p-8 flex flex-col bg-[#F1ECF4] rounded-3xl">
            <header className="mb-4 flex items-center gap-2.5 flex-wrap">
              <h3 className="text-h2 font-semibold text-heading">
                {advanced.name}
              </h3>
              <span className="inline-flex items-center text-h5 font-bold bg-[#F9F7FB] rounded-full px-4 py-1.5">
                <span className="popular-text-gradient">الأكثر طلباً</span>
              </span>
            </header>
            <PlanPrice plan={advanced} />
            <button
              type="button"
              onClick={() => openAuth(advanced.id)}
              className="btn-premium block w-full text-center bg-primary text-white text-h4 font-medium py-3 rounded-xl mb-5 hover:bg-primary-hover cursor-pointer transition"
            >
              ابدأ تجربتك المجانية
            </button>
            <ul className="space-y-3 text-h5 text-heading flex-1">
              {advanced.features.map((f) => (
                <li key={f} className="flex items-start gap-2.5">
                  <CheckIcon />
                  <FeatureText text={f} />
                </li>
              ))}
            </ul>
          </article>
        </div>
      </div>
    </section>
  );
}

/**
 * Renders a feature string with any embedded numeric runs (e.g., "1",
 * "500", "20", "5") wrapped in font-medium so they read as the salient
 * data points. Digits inside the wrapped span use dir="ltr" so multi-
 * digit numbers don't bidi-mangle inside the RTL paragraph.
 */
function FeatureText({ text }: { text: string }) {
  const parts = text.split(/(\d[\d,]*)/);
  return (
    <span>
      {parts.map((part, i) =>
        /^\d/.test(part) ? (
          <span key={i} className="font-medium" dir="ltr">
            {part}
          </span>
        ) : (
          part
        ),
      )}
    </span>
  );
}
