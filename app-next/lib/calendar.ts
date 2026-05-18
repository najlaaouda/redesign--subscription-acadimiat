/**
 * Calendar utilities used by the /appointment booking flow.
 *
 * - Work-week definition matches Saudi Arabia: Sunday (0) → Thursday (4)
 *   are work days; Friday (5) and Saturday (6) are weekend.
 * - All formatters use `ar-SA-u-ca-gregory-nu-latn` so month names are
 *   Arabic but digits stay Latin (matching the rest of the site).
 */

export const WORK_WEEK_LAST_DAY = 4; // 0 = Sunday, 4 = Thursday

export type TimeFormat = "12" | "24";

/** Strip time-of-day, returning a Date at 00:00 local. */
export function atMidnight(d: Date = new Date()): Date {
  const copy = new Date(d);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

/** Whether `d` falls on Sunday → Thursday in the local timezone. */
export function isWorkDay(d: Date): boolean {
  const wd = d.getDay();
  return wd >= 0 && wd <= WORK_WEEK_LAST_DAY;
}

export function sameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

/** First day (00:00) of a given month. */
export function atMonthStart(year: number, month: number): Date {
  return new Date(year, month, 1);
}

/** Number of calendar days in `month` (0-11) of `year`. */
export function daysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

export interface MonthCell {
  /** `null` for leading-empty cells before day 1. */
  date: Date | null;
  /** Day-of-month (1-31). Undefined when `date` is null. */
  day?: number;
  /** True for past dates or weekend days. */
  disabled?: boolean;
  /** Convenience: same as `disabled === false`. */
  available?: boolean;
}

/**
 * Build the 7-column cell list for a month view. Leading empties pad the
 * row up to the first day of the month. The caller decides how many rows
 * to render (typically 6 to cover any month layout).
 */
export function buildMonthCells(
  year: number,
  month: number,
  today: Date,
): MonthCell[] {
  const start = atMonthStart(year, month);
  const leading = start.getDay(); // 0..6 — empties before day 1
  const total = daysInMonth(year, month);

  const cells: MonthCell[] = [];
  for (let i = 0; i < leading; i++) cells.push({ date: null });

  for (let day = 1; day <= total; day++) {
    const date = new Date(year, month, day);
    const past = date < today;
    const workDay = isWorkDay(date);
    const disabled = past || !workDay;
    cells.push({ date, day, disabled, available: !disabled });
  }

  return cells;
}

/* ──────────────────────────────────────────────────────────────
   Time slots — 09:00 → 17:30 in 30-minute steps.
   30-min cadence matches the original design reference; this is
   tighter than `BookingModal.tsx` which used hourly slots.
   ────────────────────────────────────────────────────────────── */
export interface TimeSlot {
  /** Stable "HH:MM" identifier in 24h notation, used as the value. */
  id: string;
  hour: number;
  minute: number;
}

export function buildTimeSlots(): TimeSlot[] {
  const slots: TimeSlot[] = [];
  for (let h = 9; h <= 17; h++) {
    slots.push({ id: pad2(h) + ":00", hour: h, minute: 0 });
    if (h < 17) slots.push({ id: pad2(h) + ":30", hour: h, minute: 30 });
  }
  // Trailing 17:30 for symmetry.
  slots.push({ id: "17:30", hour: 17, minute: 30 });
  return slots;
}

function pad2(n: number): string {
  return n < 10 ? "0" + n : String(n);
}

export function formatSlot(slot: TimeSlot, fmt: TimeFormat): string {
  const mm = pad2(slot.minute);
  if (fmt === "24") return pad2(slot.hour) + ":" + mm;
  const period = slot.hour >= 12 ? "م" : "ص";
  let h12 = slot.hour % 12;
  if (h12 === 0) h12 = 12;
  return pad2(h12) + ":" + mm + " " + period;
}

/* ──────────────────────────────────────────────────────────────
   Shared formatters — defined once so we don't re-allocate Intl
   objects on every render.
   ────────────────────────────────────────────────────────────── */
export const monthLabelFmt = new Intl.DateTimeFormat(
  "ar-SA-u-ca-gregory-nu-latn",
  { month: "long", year: "numeric" },
);

export const longDateFmt = new Intl.DateTimeFormat(
  "ar-SA-u-ca-gregory-nu-latn",
  { weekday: "long", day: "numeric", month: "long", year: "numeric" },
);

export const shortDayFmt = new Intl.DateTimeFormat(
  "ar-SA-u-ca-gregory-nu-latn",
  { weekday: "long", day: "numeric" },
);

/** Localized weekday labels rendered in the calendar header (Sun → Sat). */
export const WEEKDAY_LABELS_AR = [
  "الأحد",
  "الإثنين",
  "الثلاثاء",
  "الأربعاء",
  "الخميس",
  "الجمعة",
  "السبت",
] as const;
