"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type AriaRole,
} from "react";
import {
  WEEKDAY_LABELS_AR,
  atMidnight,
  atMonthStart,
  buildMonthCells,
  buildTimeSlots,
  formatSlot,
  longDateFmt,
  monthLabelFmt,
  sameDay,
  type TimeSlot,
} from "@/lib/calendar";

/**
 * Booking flow used by /appointment.
 *
 * Steps:
 *   date → time → form → done
 *
 * The license-gate step was removed per spec — the booking flow now opens
 * directly on the calendar. The 12h/24h time-format toggle was also removed;
 * slots are always rendered in 24h notation.
 */

type Step = "date" | "time" | "form" | "done";

const TIME_SLOTS = buildTimeSlots();

export function BookingFlow() {
  const today = useMemo(() => atMidnight(), []);

  /* ─── State ─── */
  const [step, setStep] = useState<Step>("date");
  const [viewYear, setViewYear] = useState<number>(today.getFullYear());
  const [viewMonth, setViewMonth] = useState<number>(today.getMonth());
  const [date, setDate] = useState<Date | null>(null);
  const [time, setTime] = useState<TimeSlot | null>(null);

  // Form fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [topic, setTopic] = useState("");
  const [submitting, setSubmitting] = useState(false);

  /* ─── Calendar derived data ─── */
  const cells = useMemo(
    () => buildMonthCells(viewYear, viewMonth, today),
    [viewYear, viewMonth, today],
  );
  const monthLabel = useMemo(
    () => monthLabelFmt.format(atMonthStart(viewYear, viewMonth)),
    [viewYear, viewMonth],
  );
  const canGoPrev = useMemo(() => {
    const cur = atMonthStart(today.getFullYear(), today.getMonth());
    const view = atMonthStart(viewYear, viewMonth);
    return view > cur;
  }, [viewYear, viewMonth, today]);

  const goPrev = useCallback(() => {
    if (!canGoPrev) return;
    setViewMonth((m) => {
      if (m === 0) {
        setViewYear((y) => y - 1);
        return 11;
      }
      return m - 1;
    });
  }, [canGoPrev]);

  const goNext = useCallback(() => {
    setViewMonth((m) => {
      if (m === 11) {
        setViewYear((y) => y + 1);
        return 0;
      }
      return m + 1;
    });
  }, []);

  /* ─── Form validation (mirrors the signup "متابعة التسجيل" pattern) ─── */
  const trimmedName = name.trim();
  const trimmedEmail = email.trim();
  const canSubmit =
    trimmedName.length >= 2 &&
    trimmedEmail.length >= 4 &&
    trimmedEmail.includes("@");

  /* ─── Form submit ─── */
  const handleSubmit = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (!date || !time || !canSubmit) return;
      setSubmitting(true);

      const payload = {
        date: date.toISOString(),
        time: time.id,
        name: trimmedName,
        email: trimmedEmail,
        topic: topic.trim(),
      };
      if (typeof window !== "undefined") {
        console.info("[Appointment] scheduled:", payload);
      }

      window.setTimeout(() => {
        setSubmitting(false);
        setStep("done");
      }, 600);
    },
    [date, time, canSubmit, trimmedName, trimmedEmail, topic],
  );

  /* ─── Scroll to top on step change ─── */
  useEffect(() => {
    if (typeof window === "undefined") return;
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [step]);

  /* ════════════════ STEP: date (calendar) ════════════════ */
  if (step === "date") {
    return (
      <>
        <div className="appointment-notice mb-5">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="appointment-notice__icon"
            aria-hidden="true"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <p>يجب الحصول على تراخيص التدريب المهني والتقني قبل حجز الموعد.</p>
        </div>

        <Card role="application" ariaLabel="تقويم اختيار الموعد">
          <div className="flex items-center justify-between gap-4 mb-6">
            <h2
              className="text-h2 font-medium text-heading m-0"
              aria-live="polite"
            >
              {monthLabel}
            </h2>
            <div className="flex items-center gap-2">
              {/* Previous-month arrow points RIGHT (toward past in RTL),
                  mirroring the next-month arrow which points LEFT. */}
              <CalendarNavButton
                ariaLabel="الشهر السابق"
                disabled={!canGoPrev}
                onClick={goPrev}
              >
                <path d="M9 6l6 6-6 6" />
              </CalendarNavButton>
              <CalendarNavButton ariaLabel="الشهر التالي" onClick={goNext}>
                <path d="M15 6l-6 6 6 6" />
              </CalendarNavButton>
            </div>
          </div>

          <div
            className="calendar-weekdays grid grid-cols-7 gap-2 mb-2"
            aria-hidden="true"
          >
            {WEEKDAY_LABELS_AR.map((label) => (
              <span key={label} className="calendar-weekday">
                {label}
              </span>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-2" role="grid">
            {cells.map((c, i) => {
              if (!c.date) {
                return (
                  <span
                    key={`empty-${i}`}
                    className="calendar-day calendar-day--empty"
                    aria-hidden="true"
                  />
                );
              }
              const selected = date != null && sameDay(c.date, date);
              const disabled = c.disabled === true;
              return (
                <button
                  key={c.date.toISOString()}
                  type="button"
                  disabled={disabled}
                  aria-pressed={selected}
                  aria-label={longDateFmt.format(c.date)}
                  className={
                    "calendar-day" +
                    (disabled ? " calendar-day--disabled" : "") +
                    (selected ? " calendar-day--selected" : "")
                  }
                  onClick={() => {
                    if (disabled) return;
                    setDate(c.date);
                    setTime(null);
                    setStep("time");
                  }}
                >
                  {c.day}
                </button>
              );
            })}
          </div>

          <div className="calendar-legend mt-6 pt-5 border-t border-border flex items-center gap-2 text-h5 text-text-muted">
            <span className="calendar-legend__swatch" aria-hidden="true" />
            <span>الأيّام المتاحة للحجز</span>
          </div>
        </Card>
      </>
    );
  }

  /* ════════════════ STEP: time ════════════════ */
  if (step === "time" && date) {
    return (
      <Card>
        <div className="flex items-center justify-between gap-4 mb-6">
          <BackButton ariaLabel="رجوع" onClick={() => setStep("date")} />
          {/* Selected date sits where the 12/24h toggle used to be (end side in RTL = left). */}
          <h2 className="text-h3 font-bold text-heading m-0 text-end">
            {longDateFmt.format(date)}
          </h2>
        </div>

        <div
          className="time-slots-list"
          role="listbox"
          aria-label="الفترات المتاحة"
        >
          {TIME_SLOTS.map((slot) => {
            const selected = time?.id === slot.id;
            return (
              <div
                key={slot.id}
                role="option"
                aria-selected={selected}
                className={"time-slot" + (selected ? " is-selected" : "")}
              >
                <button
                  type="button"
                  className="time-slot__btn"
                  onClick={() => setTime(slot)}
                >
                  {formatSlot(slot, "24")}
                </button>
                {selected && (
                  <button
                    type="button"
                    className="time-slot__next"
                    onClick={() => setStep("form")}
                  >
                    التالي
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </Card>
    );
  }

  /* ════════════════ STEP: form ════════════════ */
  if (step === "form" && date && time) {
    return (
      <Card>
        <div className="flex items-center gap-3 mb-6 pb-5 border-b border-border">
          <BackButton ariaLabel="رجوع" onClick={() => setStep("time")} />
          <h2 className="text-h3 font-bold text-heading m-0">
            بيانات التواصل
          </h2>
        </div>

        <div
          className="appointment-summary mb-6 flex flex-wrap gap-2"
          aria-live="polite"
        >
          <SummaryChip
            icon={
              <>
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </>
            }
            label={longDateFmt.format(date)}
          />
          <SummaryChip
            icon={
              <>
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </>
            }
            label={formatSlot(time, "24")}
            dir="ltr"
          />
        </div>

        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          <Field id="appt-name" label="الاسم" hint="(مطلوب إدخال الاسم)">
            <input
              id="appt-name"
              name="name"
              type="text"
              required
              autoComplete="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="الاسم الكامل"
              className="appt-input"
            />
          </Field>

          <Field
            id="appt-email"
            label="البريد الإلكتروني"
            hint="(مطلوب إدخال البريد)"
          >
            <input
              id="appt-email"
              name="email"
              type="email"
              required
              autoComplete="email"
              dir="ltr"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              className="appt-input"
            />
          </Field>

          <Field id="appt-topic" label="الموضوع" hint="(اختياري)">
            <textarea
              id="appt-topic"
              name="topic"
              rows={4}
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="اكتب وصفاً مختصراً للموضوع الذي تودّ مناقشته…"
              className="appt-input resize-y"
            />
          </Field>

          {/* Submit button — aligns to the start (right in RTL), and is
              disabled until the required fields pass the same shape-check
              the signup "متابعة التسجيل" button uses. */}
          <div className="flex justify-start pt-2">
            <button
              type="submit"
              disabled={submitting || !canSubmit}
              className="inline-flex items-center justify-center bg-primary text-white text-h4 font-semibold px-7 py-3 rounded-xl hover:bg-primary-hover cursor-pointer transition btn-premium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? "جاري الحفظ…" : "تأكيد الموعد"}
            </button>
          </div>
        </form>
      </Card>
    );
  }

  /* ════════════════ STEP: done ════════════════ */
  if (step === "done" && date && time) {
    return (
      <Card>
        <div className="text-center py-6">
          {/* Green success icon — matches the Thank-You step in AuthModal
              (bg-success/15 + ring-success/5 + text-success). */}
          <div
            className="w-20 h-20 mx-auto mb-5 rounded-full bg-success/15 flex items-center justify-center ring-8 ring-success/5"
            aria-hidden="true"
          >
            <svg
              className="w-10 h-10 text-success"
              fill="none"
              stroke="currentColor"
              strokeWidth={2.6}
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h2 className="text-h2 font-medium text-heading mt-5 mb-2">
            تمّ تأكيد موعدك
          </h2>
          <p className="text-h4 text-text-muted leading-relaxed mb-1">
            {longDateFmt.format(date)}
          </p>
          <p className="text-h4 text-heading font-semibold mb-5" dir="ltr">
            {formatSlot(time, "24")}
          </p>
          <p className="text-h5 text-text-muted leading-relaxed max-w-md mx-auto mb-7">
            سيصلك تأكيد على بريدك الإلكتروني، وسيتواصل معك فريقنا قبل الموعد.
          </p>
          <a
            href="/"
            className="inline-flex items-center justify-center bg-primary text-white text-h4 font-semibold px-7 py-3 rounded-xl hover:bg-primary-hover cursor-pointer transition btn-premium no-underline"
          >
            العودة إلى الصفحة الرئيسية
          </a>
        </div>
      </Card>
    );
  }

  return null;
}

/* ──────────────────────────────────────────────────────────────
   Local UI helpers
   ────────────────────────────────────────────────────────────── */

function Card({
  children,
  role,
  ariaLabel,
}: {
  children: React.ReactNode;
  role?: AriaRole;
  ariaLabel?: string;
}) {
  return (
    <div
      className="bg-white rounded-3xl shadow-[0_24px_64px_-12px_rgba(49,26,64,0.18)] p-6 sm:p-8 lg:p-10 max-w-2xl mx-auto"
      role={role}
      aria-label={ariaLabel}
    >
      {children}
    </div>
  );
}

function CalendarNavButton({
  children,
  ariaLabel,
  disabled,
  onClick,
}: {
  children: React.ReactNode;
  ariaLabel: string;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      className={"calendar-nav-btn" + (disabled ? " is-disabled" : "")}
      aria-label={ariaLabel}
      disabled={disabled}
      onClick={onClick}
    >
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2.4}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        {children}
      </svg>
    </button>
  );
}

function BackButton({
  ariaLabel,
  onClick,
}: {
  ariaLabel: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={ariaLabel}
      onClick={onClick}
      className="w-9 h-9 rounded-full border border-border hover:bg-primary-soft flex items-center justify-center text-heading cursor-pointer transition"
    >
      <svg
        className="w-4 h-4"
        fill="none"
        stroke="currentColor"
        strokeWidth={2.2}
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 6l6 6-6 6" />
      </svg>
    </button>
  );
}

function Field({
  id,
  label,
  hint,
  children,
}: {
  id: string;
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label
        htmlFor={id}
        className="block text-h5 font-semibold text-heading mb-2"
      >
        {label}
        {hint && (
          <span className="text-text-muted font-normal ms-2">{hint}</span>
        )}
      </label>
      {children}
    </div>
  );
}

function SummaryChip({
  icon,
  label,
  dir,
}: {
  icon: React.ReactNode;
  label: string;
  dir?: "ltr" | "rtl";
}) {
  return (
    <span className="appointment-summary__chip">
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        {icon}
      </svg>
      <span dir={dir}>{label}</span>
    </span>
  );
}
