"use client";

import { useState } from "react";
import { CATEGORIES, type Cell } from "@/lib/compareTable";
import { PLANS } from "@/lib/plans";
import { usePricing } from "@/components/PricingProvider";
import { openSignup } from "@/lib/auth-events";

/**
 * Compare table with:
 *   • A "مقارنة الخطط" toggle pill that opens/closes the whole block.
 *   • A sticky plan-column header (name + price + CTA) — price reflects
 *     the active billing toggle (شهري / سنوي).
 *   • A pill row of category tabs (رسوم وعمولات / المحتوى / ...) that
 *     filters the table to the active category.
 *
 * Default open category = "fees" (matches the legacy site default).
 * The table itself is fully server-side renderable when expanded.
 */

export function CompareTable() {
  const { billing } = usePricing();
  const [open, setOpen] = useState(false);
  const [activeCat, setActiveCat] = useState(CATEGORIES[0].id);
  const activeCategory =
    CATEGORIES.find((c) => c.id === activeCat) ?? CATEGORIES[0];

  return (
    <section id="compare" className="pt-2 pb-12 lg:pb-16 bg-white">
      <div className="max-w-container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Toggle button — large and prominent so it reads as the
            section's primary CTA, not as a quiet helper. */}
        <div className="flex justify-center mb-8">
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            aria-controls="compare-table-wrapper"
            className="inline-flex items-center gap-3 bg-primary-soft hover:bg-[#EAD9F2] text-primary text-[17px] sm:text-[18px] font-semibold px-8 py-2.5 sm:px-10 sm:py-3 rounded-full border border-primary/15 shadow-[0_2px_8px_rgba(107,58,140,0.08)] cursor-pointer transition btn-premium"
          >
            <span>
              {open ? "إخفاء مقارنة الخطط" : "مقارنة الخطــــط"}
            </span>
            <svg
              className={`w-5 h-5 sm:w-6 sm:h-6 transition-transform ${open ? "rotate-180" : ""}`}
              fill="none"
              stroke="currentColor"
              strokeWidth={2.4}
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>

        {open && (
          <div id="compare-table-wrapper">
            {/* Sticky cluster — plan header + category tabs ride together
                on scroll so the user never loses the active column or the
                tab they switched to. */}
            <div className="sticky top-20 z-30 bg-white border-b border-border shadow-[0_4px_12px_-8px_rgba(49,26,64,0.12)]">
              {/* Plan header — plan name + price (reactive) + CTA */}
              <div
                className="grid items-stretch pb-3"
                style={{
                  gridTemplateColumns: "minmax(160px,1.6fr) 1fr 1fr 1fr",
                }}
              >
                <div className="px-5 py-4">
                  <h2 className="text-[20px] sm:text-[28px] font-bold text-heading tracking-tight">
                    مقارنة الخطــــط
                  </h2>
                </div>
                {PLANS.map((p) => {
                  const monthly =
                    billing === "yearly" ? p.yearlyUsd : p.monthlyUsd;
                  return (
                    <div
                      key={p.id}
                      className="text-center px-3 py-4 flex flex-col items-center justify-between gap-2"
                    >
                      <div>
                        <h3 className="text-[15px] sm:text-[16px] font-semibold text-heading mb-1">
                          {p.name}
                        </h3>
                        <div className="text-[28px] sm:text-[32px] font-bold text-heading leading-none">
                          ${monthly}
                          <span className="text-h5 font-medium text-text-muted">
                            {" "}
                            / شهريًا
                          </span>
                        </div>
                        {billing === "yearly" && (
                          <div className="text-[12px] text-text-muted mt-1">
                            ${p.yearlyTotalUsd} / سنويًا
                          </div>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => openSignup({ plan: p.id })}
                        aria-label={`ابدأ تجربتك المجانية لخطة ${p.name}`}
                        className={`mt-2 text-h5 font-semibold rounded-lg px-4 py-2 cursor-pointer transition btn-premium ${
                          p.popular
                            ? "bg-primary text-white hover:bg-primary-hover"
                            : "bg-white text-primary border border-primary/40 hover:bg-primary hover:text-white hover:border-primary"
                        }`}
                      >
                        ابدأ تجربتك المجانية
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* Category tabs (pill row) — sits inside the sticky cluster
                  so it scrolls along with the plan header. */}
              <div className="flex justify-center pt-2 pb-3 border-t border-border/60">
                <div
                  className="flex flex-wrap justify-center gap-2 max-w-full overflow-x-auto pb-1"
                  role="tablist"
                  aria-label="فئات المقارنة"
                >
                  {CATEGORIES.map((cat) => {
                    const isActive = cat.id === activeCat;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        role="tab"
                        aria-selected={isActive}
                        onClick={() => setActiveCat(cat.id)}
                        className={`flex-shrink-0 px-5 py-2 rounded-full text-h5 font-medium whitespace-nowrap cursor-pointer transition btn-premium ${
                          isActive
                            ? "bg-primary text-white shadow-sm"
                            : "bg-[#F5F4F6] text-heading hover:bg-primary-soft hover:text-primary"
                        }`}
                      >
                        {cat.title}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Table — wrapper allows the tooltip bubble to bleed above the
                first rows without being clipped. The table itself uses
                w-full with percent column widths so it never horizontally
                overflows; no overflow-x-auto needed. */}
            <div className="overflow-visible">
              <table
                className="w-full border-collapse"
                style={{ fontSize: 15, color: "#000" }}
              >
                <colgroup>
                  <col style={{ width: "38%" }} />
                  <col />
                  <col />
                  <col />
                </colgroup>
                <tbody>
                  {activeCategory.rows.map((row, i) => (
                    <tr key={i} className="border-t border-border">
                      <th
                        scope="row"
                        className="text-start px-5 py-3.5"
                        style={{ fontWeight: 500 }}
                      >
                        {row.label}
                        {row.tooltip && (
                          <span
                            className="cmp-tip"
                            tabIndex={0}
                            aria-label={row.tooltip}
                          >
                            <svg
                              className="cmp-tip__icon"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth={2}
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              aria-hidden="true"
                            >
                              <circle cx="12" cy="12" r="10" />
                              <line x1="12" y1="16" x2="12" y2="12" />
                              <line x1="12" y1="8" x2="12.01" y2="8" />
                            </svg>
                            <span className="cmp-tip__bubble" role="tooltip">
                              {row.tooltip}
                            </span>
                          </span>
                        )}
                      </th>
                      {row.values.map((v, j) => (
                        <td
                          key={j}
                          className="text-center px-3 py-3.5"
                          style={{ fontWeight: 400 }}
                        >
                          {renderCell(v)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

function renderCell(v: Cell) {
  if (v === true)
    return (
      <span aria-label="متوفر" className="text-primary text-lg">
        ✓
      </span>
    );
  if (v === false)
    return (
      <span aria-label="غير متوفر" className="text-text-muted/50 text-base">
        ✕
      </span>
    );
  return v;
}
