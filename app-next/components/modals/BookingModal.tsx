"use client";

import { useEffect, useState } from "react";

/**
 * Booking flow:
 *   step 1 → "هل حصلت على ترخيص التدريب المهني والتقني؟"
 *     • نعم  → step 2 (calendar)
 *     • لا   → step 1.5 (licensing warning)
 *   step 2 → date picker grid (next 30 days, weekdays only)
 *   step 3 → time slot grid
 *   step 4 → confirmation
 */

type Step = "license" | "warning" | "date" | "time" | "done";

const TIME_SLOTS = [
  "09:00", "10:00", "11:00", "12:00",
  "14:00", "15:00", "16:00", "17:00",
];

function getNextWeekdays(count = 21): Date[] {
  const out: Date[] = [];
  const d = new Date();
  d.setDate(d.getDate() + 1); // start tomorrow
  while (out.length < count) {
    const day = d.getDay();
    if (day !== 5 && day !== 6) {
      // Skip Fri/Sat (Saudi weekend); adjust if needed.
      out.push(new Date(d));
    }
    d.setDate(d.getDate() + 1);
  }
  return out;
}

const dateFmt = new Intl.DateTimeFormat("ar-SA-u-ca-gregory-nu-latn", {
  day: "numeric",
  month: "short",
  weekday: "short",
});
const dateFmtLong = new Intl.DateTimeFormat("ar-SA-u-ca-gregory-nu-latn", {
  day: "numeric",
  month: "long",
  year: "numeric",
  weekday: "long",
});

interface BookingModalProps {
  open: boolean;
  onClose: () => void;
}

export function BookingModal({ open, onClose }: BookingModalProps) {
  const [step, setStep] = useState<Step>("license");
  const [date, setDate] = useState<Date | null>(null);
  const [time, setTime] = useState<string | null>(null);

  // Reset on close
  useEffect(() => {
    if (!open) {
      const t = setTimeout(() => {
        setStep("license");
        setDate(null);
        setTime(null);
      }, 200);
      return () => clearTimeout(t);
    }
  }, [open]);

  // ESC closes
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    document.body.classList.add("modal-open");
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.classList.remove("modal-open");
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[80]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="booking-title"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-heading/45 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative h-full overflow-y-auto p-4 sm:p-6 flex items-start sm:items-center justify-center">
        <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-[0_24px_64px_-12px_rgba(49,26,64,0.35)] p-7 sm:p-9">
          {/* Close */}
          <button
            type="button"
            onClick={onClose}
            aria-label="إغلاق"
            className="absolute top-4 left-4 w-9 h-9 rounded-full hover:bg-primary-soft flex items-center justify-center text-text-muted hover:text-heading transition"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {step === "license" && (
            <div>
              <h2 id="booking-title" className="text-h2 font-bold text-heading mb-2 pr-2">
                قبل الحجز
              </h2>
              <p className="text-h4 text-text-muted mb-6 pr-2">
                هل حصلت على ترخيص التدريب المهني والتقني؟
              </p>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setStep("date")}
                  className="bg-primary text-white text-h4 font-semibold py-3 rounded-xl hover:bg-primary-hover transition btn-premium"
                >
                  نعم
                </button>
                <button
                  type="button"
                  onClick={() => setStep("warning")}
                  className="bg-white text-heading text-h4 font-semibold py-3 rounded-xl border border-border hover:bg-primary-soft transition btn-premium"
                >
                  لا
                </button>
              </div>
            </div>
          )}

          {step === "warning" && (
            <div className="text-center pt-3">
              <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-warning/15 flex items-center justify-center">
                <svg className="w-7 h-7 text-warning" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                </svg>
              </div>
              <h2 className="text-h2 font-bold text-heading mb-3">يرجى الحصول على التراخيص أولاً</h2>
              <p className="text-h4 text-text-muted leading-relaxed mb-6">
                يلزم الحصول على ترخيص التدريب المهني والتقني قبل أن نتمكّن من تفعيل حجز الموعد لك.
              </p>
              <button
                type="button"
                onClick={onClose}
                className="bg-primary text-white text-h4 font-semibold px-7 py-3 rounded-xl hover:bg-primary-hover transition btn-premium"
              >
                حسناً
              </button>
            </div>
          )}

          {step === "date" && (
            <div>
              <button
                type="button"
                onClick={() => setStep("license")}
                className="text-h5 text-text-muted hover:text-heading transition flex items-center gap-1 mb-4"
                aria-label="رجوع"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 6l6 6-6 6" />
                </svg>
                رجوع
              </button>
              <h2 className="text-h2 font-bold text-heading mb-2">اختر تاريخ الموعد</h2>
              <p className="text-h5 text-text-muted mb-5">المواعيد المتاحة خلال الأسابيع القادمة</p>

              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-80 overflow-y-auto pr-1">
                {getNextWeekdays(20).map((d) => {
                  const key = d.toISOString();
                  const isSelected = date?.toDateString() === d.toDateString();
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => {
                        setDate(d);
                        setStep("time");
                      }}
                      className={`text-h5 px-2 py-3 rounded-xl border transition ${
                        isSelected
                          ? "bg-primary text-white border-primary"
                          : "bg-white text-heading border-border hover:bg-primary-soft"
                      }`}
                    >
                      {dateFmt.format(d)}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {step === "time" && date && (
            <div>
              <button
                type="button"
                onClick={() => setStep("date")}
                className="text-h5 text-text-muted hover:text-heading transition flex items-center gap-1 mb-4"
                aria-label="رجوع"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 6l6 6-6 6" />
                </svg>
                رجوع
              </button>
              <h2 className="text-h2 font-bold text-heading mb-2">اختر الوقت</h2>
              <p className="text-h5 text-text-muted mb-5">
                {dateFmtLong.format(date)}
              </p>

              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {TIME_SLOTS.map((t) => {
                  const isSelected = time === t;
                  return (
                    <button
                      key={t}
                      type="button"
                      onClick={() => {
                        setTime(t);
                        setStep("done");
                      }}
                      className={`text-h5 font-medium px-2 py-3 rounded-xl border transition ${
                        isSelected
                          ? "bg-primary text-white border-primary"
                          : "bg-white text-heading border-border hover:bg-primary-soft"
                      }`}
                      dir="ltr"
                    >
                      {t}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {step === "done" && date && time && (
            <div className="text-center pt-3">
              <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-success/15 flex items-center justify-center">
                <svg className="w-7 h-7 text-success" fill="none" stroke="currentColor" strokeWidth={2.4} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-h2 font-bold text-heading mb-3">تمّ حجز موعدك</h2>
              <p className="text-h4 text-text-muted leading-relaxed mb-2">
                {dateFmtLong.format(date)}
              </p>
              <p className="text-h4 text-heading font-semibold mb-6" dir="ltr">
                {time}
              </p>
              <p className="text-h5 text-text-muted leading-relaxed mb-6">
                سنرسل لك تأكيداً عبر البريد الإلكتروني بتفاصيل الموعد قريباً.
              </p>
              <button
                type="button"
                onClick={onClose}
                className="bg-primary text-white text-h4 font-semibold px-7 py-3 rounded-xl hover:bg-primary-hover transition btn-premium"
              >
                إغلاق
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
