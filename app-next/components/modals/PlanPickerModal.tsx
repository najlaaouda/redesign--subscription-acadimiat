"use client";

import { useEffect, useState } from "react";
import { PLANS, type Billing, type PlanId } from "@/lib/plans";
import { CATEGORIES, type Cell } from "@/lib/compareTable";

/**
 * Full-screen plan switcher opened from the checkout step's
 * "تغيير الباقة" button. Shows the 3 plan cards + the feature
 * comparison table (same data as the homepage CompareTable).
 *
 * Stacks above AuthModal (z-[80] vs z-[70]). Escape closes only this
 * popup — the capture-phase listener stops the event before it reaches
 * AuthModal's own Escape handler.
 */
export function PlanPickerModal({
  open,
  currentPlan,
  billing,
  onSelect,
  onClose,
}: {
  open: boolean;
  currentPlan: PlanId;
  billing: Billing;
  onSelect: (id: PlanId) => void;
  onClose: () => void;
}) {
  const [activeCat, setActiveCat] = useState(CATEGORIES[0].id);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      e.stopImmediatePropagation();
      onClose();
    };
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  }, [open, onClose]);

  if (!open) return null;

  const category =
    CATEGORIES.find((c) => c.id === activeCat) ?? CATEGORIES[0];

  return (
    <div
      className="fixed inset-0 z-[80]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="plan-picker-title"
    >
      <div
        className="absolute inset-0 bg-heading/45 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative h-full overflow-y-auto p-4 sm:p-6 flex items-start justify-center">
        <div className="relative w-full max-w-5xl bg-white rounded-3xl shadow-[0_24px_64px_-12px_rgba(49,26,64,0.35)] p-6 sm:p-9">
          <button
            type="button"
            onClick={onClose}
            aria-label="إغلاق"
            className="absolute top-4 left-4 z-10 w-9 h-9 rounded-full hover:bg-primary-soft flex items-center justify-center text-text-muted hover:text-heading cursor-pointer transition"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.2} viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <h2
            id="plan-picker-title"
            className="text-h2 font-bold text-heading mb-1"
          >
            اختر الباقة المناسبة لك
          </h2>
          <p className="text-h5 text-text-muted mb-6">
            يمكنك تغيير الباقة في أي وقت من لوحة التحكم.
          </p>

          {/* Plan cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {PLANS.map((p) => {
              const isCurrent = p.id === currentPlan;
              const price = billing === "yearly" ? p.yearlyUsd : p.monthlyUsd;
              return (
                <div
                  key={p.id}
                  className={`flex flex-col rounded-2xl border-2 p-5 transition ${
                    isCurrent
                      ? "border-primary bg-primary-soft/40"
                      : "border-[#DFDCE0]"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <h3 className="text-h3 font-bold text-heading">{p.name}</h3>
                    {isCurrent && (
                      <span className="text-[12px] font-semibold text-primary bg-white border border-primary/30 rounded-full px-2.5 py-0.5">
                        الباقة الحالية
                      </span>
                    )}
                  </div>

                  <p className="text-heading mb-1">
                    <span dir="ltr" className="text-h1 font-bold">
                      ${price}
                    </span>{" "}
                    <span className="text-h5 text-text-muted">/ شهريًا</span>
                  </p>
                  <p className="text-h5 text-text-muted mb-4 min-h-[1.5em]">
                    {billing === "yearly" && (
                      <>
                        <span dir="ltr" className="font-medium text-heading">
                          ${p.yearlyTotalUsd.toLocaleString("en-US")}
                        </span>{" "}
                        تدفع سنويًا
                      </>
                    )}
                  </p>

                  <ul className="space-y-2 mb-5 flex-1">
                    {p.features.map((f) => (
                      <li
                        key={f}
                        className="flex items-start gap-2 text-h5 text-heading leading-relaxed"
                      >
                        <span
                          className="mt-[0.55em] w-1.5 h-1.5 rounded-full bg-primary shrink-0"
                          aria-hidden="true"
                        />
                        {f}
                      </li>
                    ))}
                  </ul>

                  <button
                    type="button"
                    onClick={() => onSelect(p.id)}
                    aria-pressed={isCurrent}
                    className={`w-full h-11 rounded-xl text-h5 font-medium cursor-pointer transition btn-premium ${
                      isCurrent
                        ? "bg-primary text-white hover:bg-primary-hover"
                        : "bg-white text-heading border border-[#DFDCE0] hover:bg-primary hover:text-white hover:border-primary"
                    }`}
                  >
                    {isCurrent ? "متابعة بهذه الباقة" : "اختيار الباقة"}
                  </button>
                </div>
              );
            })}
          </div>

          {/* Feature comparison */}
          <h3 className="text-h3 font-bold text-heading mt-10 mb-4">
            مقارنة المميزات
          </h3>

          <div
            role="tablist"
            aria-label="فئات المميزات"
            className="flex flex-wrap gap-2 mb-4"
          >
            {CATEGORIES.map((c) => {
              const active = c.id === category.id;
              return (
                <button
                  key={c.id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setActiveCat(c.id)}
                  className={`px-4 py-2 rounded-full text-h5 font-medium cursor-pointer transition ${
                    active
                      ? "bg-primary text-white"
                      : "bg-[#F5F4F6] text-heading hover:bg-primary-soft hover:text-primary"
                  }`}
                >
                  {c.title}
                </button>
              );
            })}
          </div>

          <div className="overflow-x-auto rounded-2xl border border-[#DFDCE0]">
            <table className="w-full min-w-[560px] text-h5 text-[#000]">
              <thead className="bg-[#FAFAFB]">
                <tr>
                  <th scope="col" className="text-start font-semibold p-3 w-[40%]">
                    {category.title}
                  </th>
                  {PLANS.map((p) => (
                    <th
                      key={p.id}
                      scope="col"
                      className={`text-center font-semibold p-3 ${
                        p.id === currentPlan ? "text-primary" : ""
                      }`}
                    >
                      {p.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {category.rows.map((row) => (
                  <tr key={row.label} className="border-t border-[#DFDCE0]">
                    <th scope="row" className="text-start font-medium p-3">
                      {row.label}
                    </th>
                    {row.values.map((v, i) => (
                      <td key={i} className="text-center p-3">
                        {renderCell(v)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
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
  return <span dir="auto">{v}</span>;
}
