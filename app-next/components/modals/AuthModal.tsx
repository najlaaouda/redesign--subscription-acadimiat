"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import confetti from "canvas-confetti";
import { PLANS, type PlanId } from "@/lib/plans";
import { openLogin, type OpenSignupDetail } from "@/lib/auth-events";
import {
  isEmailRegistered,
  isPhoneRegistered,
  suggestEmailFix,
} from "@/lib/email-suggest";
import { COUNTRIES, DEFAULT_COUNTRY, type Country } from "@/lib/countries";

/**
 * Auth + checkout flow — one modal, multiple step screens.
 *
 *   signup       → email + Google/Apple buttons (floating-label)
 *   email-otp    → 6-digit OTP from email (56×56 boxes, 44×44 mobile)
 *   phone        → mobile number with country prefix (LTR)
 *   phone-otp    → 6-digit OTP from SMS
 *   trial        → billing radio (yearly/monthly) + timeline (2-column)
 *   payment      → card form + timeline (2-column) + $99 add-on row
 *   thankyou     → confetti + success + "لنجهّز منصتك"
 *   onboarding   → 3-screen academy-setup questionnaire (terminal step)
 *
 * Order: signup → email-otp → phone → phone-otp → trial → payment
 *        → thankyou → onboarding (final)
 *
 * Side paths:
 *   • Payment "تخطى" → jumps directly to onboarding.
 *   • Thank-You "لنجهّز منصتك" → onboarding.
 *   • Onboarding "إنهاء" / "تخطي الكل" → closes modal + clears persisted state.
 *
 * SSO (Google/Apple) skips `email-otp` and goes straight to `phone`.
 *
 * The modal is self-managed: listens for `auth:open-signup` events. The
 * card width auto-adjusts per step (lg / 4xl / md) so wider steps get
 * room for the side-by-side timeline.
 */

type Step =
  | "signup"
  | "email-otp"
  | "phone"
  | "phone-otp"
  | "trial"
  | "payment"
  | "onboarding"
  | "thankyou";

const inputCls =
  "w-full h-[52px] px-4 bg-white border border-[#DFDCE0] rounded-xl text-h4 text-heading transition focus:outline-none focus:border-primary focus:ring-[3px] focus:ring-primary/15";

/** Per-step modal width — trial/payment need room for the timeline,
 *  onboarding gets extra width so chip rows breathe in 2-3 columns. */
const stepMaxW: Record<Step, string> = {
  signup: "max-w-lg",
  "email-otp": "max-w-lg",
  phone: "max-w-lg",
  "phone-otp": "max-w-lg",
  trial: "max-w-4xl",
  payment: "max-w-4xl",
  onboarding: "max-w-2xl",
  thankyou: "max-w-md",
};

/* localStorage persistence — lets the user close the modal mid-flow and
   resume from the same step on next visit. Keyed under a single JSON
   blob with a timestamp so we can age out stale state. */
const STORAGE_KEY = "acad_auth_state";
const STATE_TTL_MS = 24 * 60 * 60 * 1000; // 24h

interface PersistedState {
  step: Step;
  email: string;
  phone: string;
  countryCode: string;
  billing: "yearly" | "monthly";
  addonOn: boolean;
  selectedPlan: PlanId;
  timestamp: number;
}

function loadPersistedState(): Partial<PersistedState> | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PersistedState;
    if (Date.now() - parsed.timestamp > STATE_TTL_MS) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function AuthModal() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<Step>("signup");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [country, setCountry] = useState<Country>(DEFAULT_COUNTRY);
  const [billing, setBilling] = useState<"yearly" | "monthly">("yearly");
  const [addonOn, setAddonOn] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<PlanId>("pro");

  // Open handler — restores any in-progress flow from localStorage so the
  // user resumes where they left off instead of starting at "signup".
  useEffect(() => {
    const handler = (e: CustomEvent<OpenSignupDetail>) => {
      const saved = loadPersistedState();
      if (saved) {
        if (saved.step) setStep(saved.step);
        if (saved.email !== undefined) setEmail(saved.email);
        if (saved.phone !== undefined) setPhone(saved.phone);
        if (saved.countryCode) {
          const match = COUNTRIES.find((c) => c.code === saved.countryCode);
          if (match) setCountry(match);
        }
        if (saved.billing) setBilling(saved.billing);
        if (saved.addonOn !== undefined) setAddonOn(saved.addonOn);
        if (saved.selectedPlan) setSelectedPlan(saved.selectedPlan);
      } else {
        setStep("signup");
      }
      // Event-supplied plan overrides any persisted one (user clicked a
      // pricing card / Nav CTA explicitly for a plan).
      if (e.detail?.plan) setSelectedPlan(e.detail.plan);
      setOpen(true);
    };
    window.addEventListener("auth:open-signup", handler);
    return () => window.removeEventListener("auth:open-signup", handler);
  }, []);

  // Persist every change to localStorage while the modal is open. The
  // user closing the modal doesn't clear it — they'll resume next time.
  // Cleared explicitly when the flow finishes (Thank-You's close button).
  useEffect(() => {
    if (typeof window === "undefined") return;
    const state: PersistedState = {
      step,
      email,
      phone,
      countryCode: country.code,
      billing,
      addonOn,
      selectedPlan,
      timestamp: Date.now(),
    };
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      /* quota exceeded — ignore */
    }
  }, [step, email, phone, country.code, billing, addonOn, selectedPlan, country]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    document.body.classList.add("modal-open");
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.classList.remove("modal-open");
    };
  }, [open]);

  if (!open) return null;

  const plan = PLANS.find((p) => p.id === selectedPlan) ?? PLANS[1];
  const close = () => setOpen(false);
  const switchToLogin = () => {
    setOpen(false);
    openLogin();
  };

  return (
    <div
      className="fixed inset-0 z-[70]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-title"
    >
      <div
        className="absolute inset-0 bg-heading/45 backdrop-blur-sm"
        onClick={close}
      />

      <div className="relative h-full overflow-y-auto p-4 sm:p-6 flex items-start sm:items-center justify-center">
        <div
          className={`relative w-full ${stepMaxW[step]} bg-white rounded-3xl shadow-[0_24px_64px_-12px_rgba(49,26,64,0.35)] transition-[max-width] duration-300 ${
            /* Cards with multi-color sub-sections (timeline + form +
               add-on row) need their corners clipped. Simple text-only
               steps allow overflow so dropdowns (country picker, email
               suggest) can extend past the card. */
            step === "trial" || step === "payment"
              ? "overflow-hidden"
              : "overflow-visible"
          }`}
        >
          {step === "signup" && (
            <div className="p-7 sm:p-9 relative">
              <CloseChip onClick={close} />
              <SignupStep
                email={email}
                setEmail={setEmail}
                onContinue={() => setStep("email-otp")}
                onSso={() => setStep("phone")}
                onSwitchToLogin={switchToLogin}
              />
            </div>
          )}

          {step === "email-otp" && (
            <div className="p-7 sm:p-9 relative">
              <CloseChip onClick={close} />
              <OtpStep
                title="تحقّق من بريدك الإلكتروني"
                channelLabel="البريد"
                channelValue={email || "بريدك الإلكتروني"}
                onChangeChannel={() => setStep("signup")}
                onBack={() => setStep("signup")}
                onContinue={() => setStep("phone")}
              />
            </div>
          )}

          {step === "phone" && (
            <div className="p-7 sm:p-9 relative">
              <CloseChip onClick={close} />
              <PhoneStep
                phone={phone}
                setPhone={setPhone}
                country={country}
                setCountry={setCountry}
                onBack={() => setStep("email-otp")}
                onContinue={() => setStep("phone-otp")}
                onSwitchToLogin={switchToLogin}
              />
            </div>
          )}

          {step === "phone-otp" && (
            <div className="p-7 sm:p-9 relative">
              <CloseChip onClick={close} />
              <OtpStep
                title="تحقّق من رقم الموبايل"
                channelLabel="رقم الموبايل"
                channelValue={`+966 ${phone || "رقمك"}`}
                onChangeChannel={() => setStep("phone")}
                onBack={() => setStep("phone")}
                onContinue={() => setStep("trial")}
              />
            </div>
          )}

          {step === "trial" && (
            <TrialStep
              planName={plan.name}
              yearlyMonthly={plan.yearlyUsd}
              yearlyTotal={plan.yearlyTotalUsd}
              monthly={plan.monthlyUsd}
              billing={billing}
              setBilling={setBilling}
              onSkip={close}
              onContinue={() => setStep("payment")}
            />
          )}

          {step === "payment" && (
            <PaymentStep
              planName={plan.name}
              billing={billing}
              renewalAmount={
                billing === "yearly" ? plan.yearlyTotalUsd : plan.monthlyUsd
              }
              addonOn={addonOn}
              setAddonOn={setAddonOn}
              /* Skipping payment jumps straight to the academy-setup
                 questions instead of closing the flow. */
              onSkip={() => setStep("onboarding")}
              onBack={() => setStep("trial")}
              onContinue={() => setStep("thankyou")}
            />
          )}

          {step === "onboarding" && (
            <div className="p-7 sm:p-9 relative">
              <CloseChip onClick={close} />
              {/* Onboarding is the FINAL step now — its "Finish" /
                  "Skip all" both close the modal and clear persisted
                  state so the next visit starts at signup. */}
              <OnboardingStep
                onFinish={() => {
                  try {
                    window.localStorage.removeItem(STORAGE_KEY);
                  } catch {
                    /* ignore */
                  }
                  setStep("signup");
                  setEmail("");
                  setPhone("");
                  setBilling("yearly");
                  setAddonOn(false);
                  close();
                }}
              />
            </div>
          )}

          {step === "thankyou" && (
            <ThankyouStep
              planName={plan.name}
              billing={billing}
              renewalAmount={
                billing === "yearly" ? plan.yearlyTotalUsd : plan.monthlyUsd
              }
              addonOn={addonOn}
              /* "لنجهّز منصتك" → navigate to the onboarding questionnaire
                 so the user customises their academy before reaching the
                 dashboard. */
              onContinue={() => setStep("onboarding")}
            />
          )}
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   Shared 2-column timeline used by Trial + Payment modals.
   The timeline shows "today" → "trial-end + $1 charge" with a vertical
   connector that's solid up to the active dot and faded past it.
   ════════════════════════════════════════════════════════════════ */
function TrialTimeline() {
  const trialEnd = new Date();
  trialEnd.setDate(trialEnd.getDate() + 3);
  const trialEndFmt = new Intl.DateTimeFormat("ar-SA-u-ca-gregory-nu-latn", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(trialEnd);

  // CSS Grid lays out the dots in a dedicated 48px-wide column and the
  // texts in the second column. The dot cells have fixed h-12 (48px), so
  // the connector — absolute-positioned inside dot 1's cell with
  // `top-12 h-12` — drops into the grid's `gap-y-12` (48px) and lands
  // exactly at the top of dot 2, regardless of how tall the paragraph
  // text in the adjacent column is. Bullet-proof against text reflow.
  return (
    <aside className="hidden md:flex md:flex-col md:justify-center p-8 lg:p-10 bg-white h-full">
      <div className="grid grid-cols-[48px_1fr] items-start gap-x-4 gap-y-12">
        {/* Row 1 — Dot 1 (active) */}
        <div className="relative w-12 h-12">
          <span className="block w-full h-full rounded-full bg-primary text-white shadow-sm flex items-center justify-center">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </span>
          <span
            className="absolute right-[23px] top-12 w-[2px] h-12"
            style={{
              background:
                "linear-gradient(to bottom, var(--color-primary) 50%, rgba(107,58,140,0.2) 50%)",
            }}
            aria-hidden="true"
          />
        </div>
        {/* Row 1 — Text */}
        <div className="pt-1">
          <span className="inline-block bg-white border border-[#DFDCE0] text-h5 text-heading font-medium rounded-full px-3 py-1 mb-2">
            اليوم
          </span>
          <p className="text-h5 text-heading leading-relaxed">
            ستبدأ فترتك المجانية لمدّة 3 أيام
          </p>
        </div>

        {/* Row 2 — Dot 2 (future) */}
        <div className="w-12 h-12">
          <span className="block w-full h-full rounded-full bg-white border-2 border-primary/30 text-primary flex items-center justify-center">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
              <rect x="3" y="5" width="18" height="16" rx="2" />
              <path d="M16 3v4M8 3v4M3 11h18" />
            </svg>
          </span>
        </div>
        {/* Row 2 — Text */}
        <div className="pt-1">
          <span className="inline-block bg-white border border-[#DFDCE0] text-h5 text-heading font-medium rounded-full px-3 py-1 mb-2">
            {trialEndFmt}
          </span>
          <p className="text-h5 text-heading leading-relaxed">
            سيبدأ اشتراكك بـ <span dir="ltr" className="font-bold">$1</span> لأول شهر — يمكنك الإلغاء في أي وقت
          </p>
        </div>
      </div>
    </aside>
  );
}

/* ════════════════════════════════════════════════════════════════
   Trial step — 2-column: pricing radios right, timeline left
   ════════════════════════════════════════════════════════════════ */
function TrialStep({
  planName,
  yearlyMonthly,
  yearlyTotal,
  monthly,
  billing,
  setBilling,
  onSkip,
  onContinue,
}: {
  planName: string;
  yearlyMonthly: number;
  yearlyTotal: number;
  monthly: number;
  billing: "yearly" | "monthly";
  setBilling: (b: "yearly" | "monthly") => void;
  onSkip: () => void;
  onContinue: () => void;
}) {
  const trialEnd = new Date();
  trialEnd.setDate(trialEnd.getDate() + 3);
  const trialEndFmt = new Intl.DateTimeFormat("ar-SA-u-ca-gregory-nu-latn", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(trialEnd);

  return (
    <div className="grid grid-cols-1 md:grid-cols-[1fr_1.1fr]">
      {/* LEFT (RTL end) — timeline */}
      <div className="md:order-2 relative md:h-full">
        <button
          type="button"
          onClick={onSkip}
          className="absolute top-5 left-6 z-10 text-h5 text-text-muted hover:text-heading underline underline-offset-4 cursor-pointer transition"
        >
          تخطى
        </button>
        <TrialTimeline />
      </div>

      {/* RIGHT (RTL start) — pricing */}
      <section className="md:order-1 p-7 sm:p-9 lg:p-10 bg-white relative">
        <h2
          id="auth-title"
          className="text-h2 font-bold text-heading text-start mb-6 pt-2"
        >
          جرّب خطة <span className="text-primary">{planName}</span> مجاناً
        </h2>

        {/* Radio cards — yearly shows the annual TOTAL big with the
            per-month equivalent in the sub-label. Monthly shows the
            single monthly price. Switching updates everything live
            because billing is a React state. */}
        <div className="space-y-3" role="radiogroup" aria-label="اختر نوع الفوترة">
          <RadioCard
            selected={billing === "yearly"}
            onClick={() => setBilling("yearly")}
            label="سنوي"
            price={`$${yearlyTotal.toLocaleString("en-US")}`}
            sub={`/ سنويًا  ($${yearlyMonthly} / شهريًا)`}
          />
          <RadioCard
            selected={billing === "monthly"}
            onClick={() => setBilling("monthly")}
            label="شهري"
            price={`$${monthly}`}
            sub="/ شهريًا"
          />
        </div>

        {/* Summary box */}
        <div className="mt-5 rounded-xl border border-[#DFDCE0] bg-[#FAFAFB] p-4">
          <div className="flex justify-between items-center gap-3">
            <span className="text-heading text-h5 font-medium">
              سيتم الخصم في {trialEndFmt}
            </span>
            <span className="text-heading font-semibold" dir="ltr">$1</span>
          </div>
          <div className="border-t border-[#DFDCE0] my-3" />
          <div className="flex justify-between items-center gap-3">
            <span className="text-heading font-medium">اليوم</span>
            <span className="text-success font-semibold">مجاناً</span>
          </div>
        </div>

        <button
          type="button"
          onClick={onContinue}
          className="w-full h-[52px] mt-5 bg-primary text-white text-h4 font-medium rounded-xl hover:bg-primary-hover cursor-pointer transition btn-premium"
        >
          التالي
        </button>

        {/* Trust rows */}
        <ul className="mt-5 space-y-2.5 text-text-muted text-h5">
          <li className="flex items-center gap-2">
            <CheckSm /> جرّب 3 أيام مجاناً بدون بطاقة بنكية
          </li>
          <li className="flex items-center gap-2">
            <CheckSm /> يمكنك الإلغاء في أي وقت
          </li>
        </ul>
      </section>
    </div>
  );
}

function RadioCard({
  selected,
  onClick,
  label,
  price,
  sub,
}: {
  selected: boolean;
  onClick: () => void;
  label: string;
  price: string;
  sub: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      role="radio"
      aria-checked={selected}
      className={`w-full flex items-center justify-between gap-3 p-4 rounded-xl border-2 cursor-pointer transition text-start ${
        selected
          ? "bg-primary-soft border-primary"
          : "bg-white border-[#DFDCE0] hover:border-primary/40"
      }`}
    >
      <span className="flex flex-col items-start gap-1">
        <span className={`text-h5 font-semibold ${selected ? "text-primary" : "text-heading"}`}>
          {label}
        </span>
        <span className="text-h4 text-heading">
          <strong dir="ltr" className="font-bold">{price}</strong>{" "}
          <span className="text-text-muted text-h5">{sub}</span>
        </span>
      </span>
      <span
        className={`shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center ${
          selected ? "border-primary bg-primary" : "border-[#DFDCE0]"
        }`}
        aria-hidden="true"
      >
        {selected && <span className="w-2 h-2 rounded-full bg-white" />}
      </span>
    </button>
  );
}

function CheckSm() {
  return (
    <svg className="w-4 h-4 text-success shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M5 13l4 4L19 7" />
    </svg>
  );
}

/* ════════════════════════════════════════════════════════════════
   Signup step (unchanged from previous design)
   ════════════════════════════════════════════════════════════════ */
function SignupStep({
  email,
  setEmail,
  onContinue,
  onSso,
  onSwitchToLogin,
}: {
  email: string;
  setEmail: (v: string) => void;
  onContinue: () => void;
  onSso: () => void;
  onSwitchToLogin: () => void;
}) {
  const enabled = email.length >= 4 && email.includes("@");
  // Memoised typo suggestion — only recomputes when the email changes.
  const suggestion = useMemo(() => suggestEmailFix(email), [email]);
  // "Already registered" error — set on Continue, cleared on edit.
  const [alreadyRegistered, setAlreadyRegistered] = useState(false);
  useEffect(() => {
    if (alreadyRegistered) setAlreadyRegistered(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [email]);

  const handleContinue = () => {
    if (isEmailRegistered(email)) {
      setAlreadyRegistered(true);
      return;
    }
    onContinue();
  };
  return (
    <>
      <div className="flex justify-center mb-5 mt-1">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/assets/logo%201.png"
          alt="أكاديميات"
          className="h-11 w-auto"
          width={140}
          height={44}
        />
      </div>
      <h2 id="auth-title" className="text-h2 font-bold text-heading text-center mb-1">
        أنشئ حسابًا في ثوانٍ
      </h2>
      <p className="text-h5 text-text-muted text-center mb-6">
        ابدأ تجربتك المجانية لمدّة 3 أيام بدون بطاقة بنكية
      </p>
      <div className="space-y-3 mb-5">
        <button type="button" onClick={onSso} className="w-full h-[52px] inline-flex items-center justify-center gap-2.5 bg-white border border-[#DFDCE0] hover:bg-[#F9F7FB] text-heading text-h4 font-medium px-4 rounded-xl cursor-pointer transition btn-premium">
          <GoogleIcon /> المتابعة عبر Google
        </button>
        <button type="button" onClick={onSso} className="w-full h-[52px] inline-flex items-center justify-center gap-2.5 bg-white border border-[#DFDCE0] hover:bg-[#F9F7FB] text-heading text-h4 font-medium px-4 rounded-xl cursor-pointer transition btn-premium">
          <AppleIcon /> المتابعة عبر Apple
        </button>
      </div>
      <Divider>أو متابعة التسجيل بالبريد الإلكتروني</Divider>

      {/* Email with a Gmail-style inline ghost completion + the
          Levenshtein typo-fix line as a fallback. The `error` prop
          paints the field border red when the email is already
          registered. */}
      <EmailFieldWithSuggest
        id="signup-email"
        value={email}
        onChange={setEmail}
        error={alreadyRegistered}
      />

      {/* Already-registered message takes priority over the typo
          suggestion (registered is a hard stop). */}
      {alreadyRegistered ? (
        <p className="text-h5 text-error mt-2" role="alert">
          هذا البريد مسجّل مسبقاً.{" "}
          <button
            type="button"
            onClick={onSwitchToLogin}
            className="text-primary font-semibold hover:text-primary-hover cursor-pointer underline underline-offset-2"
          >
            سجّل دخول
          </button>
        </p>
      ) : suggestion ? (
        <p className="text-h5 text-text-muted mt-2">
          هل تقصد{" "}
          <button
            type="button"
            onClick={() => setEmail(suggestion)}
            className="text-primary font-medium hover:text-primary-hover cursor-pointer"
            dir="ltr"
          >
            {suggestion}
          </button>
          ؟
        </p>
      ) : null}

      <button
        type="button"
        disabled={!enabled}
        onClick={handleContinue}
        className="w-full h-[52px] mt-4 bg-primary text-white text-h4 font-medium rounded-xl hover:bg-primary-hover cursor-pointer transition btn-premium disabled:opacity-40 disabled:pointer-events-none"
      >
        متابعة التسجيل
      </button>
      <p className="text-h5 text-text-muted text-center mt-4">
        لديك حساب على أكاديميات؟{" "}
        <button type="button" onClick={onSwitchToLogin} className="text-primary font-medium hover:text-primary-hover cursor-pointer">
          تسجيل الدخول
        </button>
      </p>
      <p className="text-[11px] text-text-muted text-center mt-4 leading-relaxed">
        بمتابعة التسجيل فأنت موافق على{" "}
        <a
          href="https://www.acadimiat.com/terms-and-condition"
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary hover:text-primary-hover underline underline-offset-2"
        >
          الشروط والأحكام
        </a>
        .
      </p>
    </>
  );
}

/* ════════════════════════════════════════════════════════════════
   OTP step
   ════════════════════════════════════════════════════════════════ */
export function OtpStep({
  title,
  channelLabel,
  channelValue,
  onChangeChannel,
  onBack,
  onContinue,
  tabsSlot,
  subtitle,
}: {
  title: string;
  channelLabel: string;
  channelValue: string;
  onChangeChannel: () => void;
  onBack: () => void;
  onContinue: () => void;
  /** Optional tab strip rendered between the title and the OTP boxes
      (used by LoginModal's email-verify step to switch code↔password). */
  tabsSlot?: React.ReactNode;
  /** Optional extra subtitle (e.g. "عبر واتساب" badge for the phone path). */
  subtitle?: React.ReactNode;
}) {
  const [digits, setDigits] = useState(["", "", "", "", "", ""]);
  const [seconds, setSeconds] = useState(45);
  const [error, setError] = useState(false);
  const inputs = useRef<(HTMLInputElement | null)[]>([]);
  const filled = digits.every((d) => d);

  useEffect(() => {
    if (seconds === 0) return;
    const t = setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [seconds]);

  // Demo OTP validation: code "000000" is the canonical "wrong" code so
  // QA can verify the error state. Any other 6-digit value passes.
  // Replace with a real server check when the auth backend lands.
  const verify = (code: string) => code !== "000000";

  // Auto-submit when all 6 boxes are filled. Validate first; on error
  // we shake the form via the red-border state below + clear the inputs.
  useEffect(() => {
    if (!filled) return;
    const t = setTimeout(() => {
      const code = digits.join("");
      if (verify(code)) {
        setError(false);
        onContinue();
      } else {
        setError(true);
        // Refocus the first box so the user can re-enter without clicking.
        setTimeout(() => inputs.current[0]?.focus(), 0);
      }
    }, 350);
    return () => clearTimeout(t);
  }, [filled, digits, onContinue]);

  const setDigit = (idx: number, val: string) => {
    const clean = val.replace(/\D/g, "").slice(0, 1);
    setDigits((d) => {
      const next = [...d];
      next[idx] = clean;
      return next;
    });
    // Any keystroke after an error clears the error so the user gets
    // a clean canvas to retry on.
    if (error) setError(false);
    if (clean && idx < 5) inputs.current[idx + 1]?.focus();
  };
  const onKey = (idx: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !digits[idx] && idx > 0) {
      inputs.current[idx - 1]?.focus();
    }
  };
  const onPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pasted) return;
    e.preventDefault();
    const next = ["", "", "", "", "", ""];
    for (let i = 0; i < pasted.length; i++) next[i] = pasted[i];
    setDigits(next);
    if (error) setError(false);
    inputs.current[Math.min(pasted.length, 5)]?.focus();
  };

  return (
    <>
      <BackChip onClick={onBack} />
      <div className="flex justify-center mb-5 mt-1">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/assets/logo%201.png"
          alt="أكاديميات"
          className="h-11 w-auto"
          width={140}
          height={44}
        />
      </div>
      <h2 className="text-h2 font-bold text-heading text-center mb-5">{title}</h2>
      {/* tabs (if provided) sit directly under the title — matches the
          login-verify mockup where the segmented tab strip is BEFORE the
          channel-info message. */}
      {tabsSlot}
      <p className="text-h5 text-text-muted text-center mb-1 leading-relaxed">
        أرسلنا كود التحقّق المكوّن من 6 أرقام إلى {channelLabel}
      </p>
      <p className="text-h5 text-heading font-semibold text-center mb-2" dir="ltr">{channelValue}</p>
      {subtitle && (
        <p className="text-h5 text-text-muted text-center mb-2">{subtitle}</p>
      )}
      <div className="text-center mb-5">
        <button type="button" onClick={onChangeChannel} className="text-h5 text-primary font-medium hover:text-primary-hover cursor-pointer">
          تغيير {channelLabel}
        </button>
      </div>
      <div className="flex justify-center gap-2 sm:gap-2.5 mb-2" dir="ltr">
        {digits.map((d, i) => (
          <input
            key={i}
            ref={(el) => { inputs.current[i] = el; }}
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            autoFocus={i === 0}
            value={d}
            onChange={(e) => setDigit(i, e.target.value)}
            onKeyDown={(e) => onKey(i, e)}
            onPaste={onPaste}
            maxLength={1}
            aria-invalid={error}
            className={`w-11 h-11 sm:w-14 sm:h-14 text-center text-h2 font-bold bg-white border-[1.5px] rounded-xl focus:outline-none transition ${
              error
                ? "border-error text-error focus:border-error focus:ring-[3px] focus:ring-error/15"
                : "border-[#DFDCE0] text-heading focus:border-primary focus:ring-[3px] focus:ring-primary/15"
            }`}
          />
        ))}
      </div>

      {/* Error slot — reserves space so the layout doesn't shift when the
          error toggles in/out. */}
      <div className="min-h-[24px] mb-3 text-center">
        {error && (
          <p className="text-h5 text-error font-medium" role="alert">
            تأكد من الأرقام المُدخَلة
          </p>
        )}
      </div>

      <button
        type="button"
        disabled={!filled}
        onClick={() => {
          const code = digits.join("");
          if (verify(code)) {
            setError(false);
            onContinue();
          } else {
            setError(true);
            setTimeout(() => inputs.current[0]?.focus(), 0);
          }
        }}
        className="w-full h-[52px] bg-primary text-white text-h4 font-medium rounded-xl hover:bg-primary-hover cursor-pointer transition btn-premium disabled:opacity-40 disabled:pointer-events-none"
      >
        تحقّق
      </button>
      <p className="text-h5 text-text-muted text-center mt-4">
        لم يصلك الرمز؟{" "}
        {seconds > 0 ? (
          <span className="text-heading font-medium">
            إعادة الإرسال خلال <span dir="ltr">00:{seconds.toString().padStart(2, "0")}</span>
          </span>
        ) : (
          <button type="button" onClick={() => setSeconds(45)} className="text-primary font-medium hover:text-primary-hover cursor-pointer">
            إعادة الإرسال
          </button>
        )}
      </p>
    </>
  );
}

/* ════════════════════════════════════════════════════════════════
   Phone step — country picker + per-country length validation
   ════════════════════════════════════════════════════════════════ */
function PhoneStep({
  phone, setPhone, country, setCountry, onBack, onContinue, onSwitchToLogin,
}: {
  phone: string;
  setPhone: (v: string) => void;
  country: Country;
  setCountry: (c: Country) => void;
  onBack: () => void;
  onContinue: () => void;
  onSwitchToLogin: () => void;
}) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [alreadyRegistered, setAlreadyRegistered] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  // Digits-only length is what we validate against. Spaces in the input
  // (if the user pastes a formatted number) don't count.
  const digits = phone.replace(/\D/g, "");
  const enabled = digits.length === country.phoneLen;

  // Editing the phone (or switching country) clears the registered error
  // so the user can retry without an extra interaction.
  useEffect(() => {
    if (alreadyRegistered) setAlreadyRegistered(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phone, country.code]);

  const handleSendOtp = () => {
    if (isPhoneRegistered(country.dial, digits)) {
      setAlreadyRegistered(true);
      return;
    }
    onContinue();
  };

  // Filter the country list by free-text search. Matches:
  //   • Arabic name (substring)
  //   • dial code (with or without "+", e.g. "20" finds Egypt)
  //   • ISO code (e.g. "EG", "SA")
  const filteredCountries = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return COUNTRIES;
    const qDigits = q.replace(/\D/g, "");
    return COUNTRIES.filter((c) => {
      if (c.name.includes(q)) return true;
      if (c.code.toLowerCase().includes(q)) return true;
      // Dial code: strip "+" then check if the typed digits are a prefix
      // (so "9" → 966/971/974/etc., "20" → 20)
      if (qDigits && c.dial.replace(/\D/g, "").startsWith(qDigits)) return true;
      return false;
    });
  }, [search]);

  // Close picker on outside-click. Also reset the search query when closing.
  useEffect(() => {
    if (!pickerOpen) {
      setSearch("");
      return;
    }
    const onDocClick = (e: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setPickerOpen(false);
      }
    };
    document.addEventListener("mousedown", onDocClick);
    // Auto-focus the search field so the user can start typing immediately.
    setTimeout(() => searchRef.current?.focus(), 50);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [pickerOpen]);

  // When the country changes, trim any extra digits beyond the new max.
  useEffect(() => {
    if (digits.length > country.phoneLen) {
      setPhone(digits.slice(0, country.phoneLen));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [country.code]);

  return (
    <>
      <BackChip onClick={onBack} />
      <div className="flex justify-center mb-5 mt-1">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/assets/logo%201.png"
          alt="أكاديميات"
          className="h-11 w-auto"
          width={140}
          height={44}
        />
      </div>
      <h2 className="text-h2 font-bold text-heading text-center mb-2">أدخل رقم الموبايل</h2>
      <p className="text-h5 text-text-muted text-center mb-7 leading-relaxed">
        نحن بحاجة لرقم الموبايل ليساعدنا على تأمين حسابك.
      </p>

      <label htmlFor="auth-phone" className="sr-only">رقم الموبايل</label>
      <div className="flex items-stretch gap-2" dir="ltr">
        {/* Country chip — click to open the country dropdown */}
        <div ref={pickerRef} className="relative">
          <button
            type="button"
            onClick={() => setPickerOpen((v) => !v)}
            aria-haspopup="listbox"
            aria-expanded={pickerOpen}
            aria-label="اختر الدولة"
            className="inline-flex items-center gap-1.5 h-[52px] px-3 bg-primary-soft border border-[#DFDCE0] rounded-xl text-h4 font-semibold text-heading whitespace-nowrap cursor-pointer hover:bg-[#EAD9F2] transition"
          >
            <span className="text-lg leading-none">{country.flag}</span>
            <span>{country.dial}</span>
            <svg className={`w-3 h-3 transition-transform ${pickerOpen ? "rotate-180" : ""}`} fill="none" stroke="currentColor" strokeWidth={2.4} viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {pickerOpen && (
            <div
              className="absolute top-full inset-x-0 mt-1.5 w-72 bg-white border border-[#DFDCE0] rounded-xl shadow-lg z-30 overflow-hidden"
              dir="rtl"
              onMouseDown={(e) => e.preventDefault()}
            >
              {/* Search field — supports Arabic name, dial code, or ISO */}
              <div className="p-2 border-b border-[#DFDCE0]">
                <input
                  ref={searchRef}
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="ابحث (اسم الدولة أو الرمز…)"
                  className="w-full h-10 px-3 text-h5 text-heading bg-[#F9F7FB] border border-transparent rounded-lg outline-none focus:border-primary focus:bg-white transition"
                />
              </div>
              <ul
                role="listbox"
                aria-label="قائمة الدول"
                className="max-h-80 overflow-auto py-1"
              >
                {filteredCountries.length === 0 ? (
                  <li className="px-3 py-3 text-h5 text-text-muted text-center">
                    لا توجد نتائج
                  </li>
                ) : (
                  filteredCountries.map((c) => {
                    const selected = c.code === country.code;
                    return (
                      <li key={c.code} role="option" aria-selected={selected}>
                        <button
                          type="button"
                          onClick={() => {
                            setCountry(c);
                            setPickerOpen(false);
                          }}
                          className={`w-full flex items-center gap-2 px-3 py-2 text-h5 text-heading cursor-pointer transition ${
                            selected ? "bg-primary-soft" : "hover:bg-primary-soft/60"
                          }`}
                        >
                          <span className="text-lg leading-none">{c.flag}</span>
                          <span className="flex-1 text-start">{c.name}</span>
                          <span dir="ltr" className="text-text-muted">{c.dial}</span>
                        </button>
                      </li>
                    );
                  })
                )}
              </ul>
            </div>
          )}
        </div>

        <input
          id="auth-phone"
          type="tel"
          inputMode="numeric"
          autoComplete="tel-national"
          dir="ltr"
          placeholder={country.placeholder}
          value={phone}
          onChange={(e) =>
            setPhone(e.target.value.replace(/\D/g, "").slice(0, country.phoneLen))
          }
          maxLength={country.phoneLen}
          aria-invalid={alreadyRegistered}
          className={`flex-1 w-full h-[52px] px-4 bg-white border rounded-xl text-h4 transition focus:outline-none ${
            alreadyRegistered
              ? "border-error text-error focus:border-error focus:ring-[3px] focus:ring-error/15"
              : "border-[#DFDCE0] text-heading focus:border-primary focus:ring-[3px] focus:ring-primary/15"
          }`}
        />
      </div>

      {/* "Phone already registered" message — appears under the field,
          gives the user a one-click path to switch to Login. */}
      {alreadyRegistered && (
        <p className="text-h5 text-error mt-2" role="alert">
          هذا الرقم مستخدم مسبقاً.{" "}
          <button
            type="button"
            onClick={onSwitchToLogin}
            className="text-primary font-semibold hover:text-primary-hover cursor-pointer underline underline-offset-2"
          >
            سجّل دخول
          </button>
        </p>
      )}

      <button
        type="button"
        disabled={!enabled}
        onClick={handleSendOtp}
        className="w-full h-[52px] mt-5 bg-primary text-white text-h4 font-medium rounded-xl hover:bg-primary-hover cursor-pointer transition btn-premium disabled:opacity-40 disabled:pointer-events-none"
      >
        إرسال رمز التحقّق
      </button>
    </>
  );
}

/* ════════════════════════════════════════════════════════════════
   Payment step — 2-column (form + timeline) + $99 add-on row
   ════════════════════════════════════════════════════════════════ */
type CardBrand = "visa" | "mastercard" | "amex" | "mada" | null;
function detectBrand(number: string): CardBrand {
  const n = number.replace(/\D/g, "");
  const madaBins = [
    "440795","446672","419593","455708","457865","468540","474491","484783",
    "486094","504300","513213","520058","521076","529741","530906","531095",
    "532013","535825","535989","536023","537767","543357","549760","554180",
    "557606","558848","588845","529415","543085","550000","558563","585265",
    "588982","604906",
  ];
  if (madaBins.some((bin) => n.startsWith(bin))) return "mada";
  if (n.startsWith("4")) return "visa";
  if (/^5[1-5]/.test(n) || /^2[2-7]/.test(n)) return "mastercard";
  if (/^3[47]/.test(n)) return "amex";
  return null;
}
/* ───── Card-number formatting ─────
   • AmEx (begins with 34 / 37)  → 15 digits, chunked 4-6-5
   • Visa / Mastercard / Mada / fallback → 16 digits, chunked 4-4-4-4
   The brand is detected from whatever digits the user has typed so the
   formatter and the maxLength chip update live as they type.
   No validation — we only enforce the SHAPE; submit always proceeds. */
function formatCardNumber(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  const brand = detectBrand(digits);
  if (brand === "amex") {
    const truncated = digits.slice(0, 15);
    const a = truncated.slice(0, 4);
    const b = truncated.slice(4, 10);
    const c = truncated.slice(10, 15);
    return [a, b, c].filter(Boolean).join(" ");
  }
  const truncated = digits.slice(0, 16);
  return truncated.replace(/(\d{4})(?=\d)/g, "$1 ");
}

/* Max characters the card-number input will accept (digits + spaces). */
function cardMaxLength(brand: CardBrand): number {
  return brand === "amex" ? 17 /* 4+6+5 + 2 spaces */ : 19 /* 4×4 + 3 spaces */;
}

/* CVV/CVC length — AmEx prints a 4-digit code on the front, everyone else
   prints 3 on the back. */
function cvvMaxLength(brand: CardBrand): number {
  return brand === "amex" ? 4 : 3;
}

/* ───── Expiry formatting ─────
   Auto-inserts the `/`, clamps the month to 01-12, and auto-pads a single
   leading digit > 1 (e.g. "5" → "05/") so the cursor jumps to the year. */
function formatExpiry(raw: string): string {
  const digits = raw.replace(/\D/g, "").slice(0, 4);
  if (digits.length === 0) return "";

  let mm = digits.slice(0, Math.min(2, digits.length));
  if (mm.length === 1 && Number(mm) > 1) mm = `0${mm}`;
  if (mm.length === 2) {
    const month = Number(mm);
    if (month === 0) mm = "01";
    else if (month > 12) mm = "12";
  }

  if (digits.length <= 2) return mm;
  return `${mm}/${digits.slice(2)}`;
}

function PaymentStep({
  planName,
  billing,
  renewalAmount,
  addonOn,
  setAddonOn,
  onSkip,
  onBack,
  onContinue,
}: {
  planName: string;
  billing: "yearly" | "monthly";
  /** The post-trial subscription price for the chosen billing cycle.
   *  yearly → annual total ($1,188), monthly → per-month ($129). */
  renewalAmount: number;
  addonOn: boolean;
  setAddonOn: (v: boolean) => void;
  onSkip: () => void;
  onBack: () => void;
  onContinue: () => void;
}) {
  const [card, setCard] = useState("");
  const [exp, setExp] = useState("");
  const [cvv, setCvv] = useState("");
  const brand = detectBrand(card);

  const trialEnd = new Date();
  trialEnd.setDate(trialEnd.getDate() + 30); // renewal date
  const renewFmt = new Intl.DateTimeFormat("ar-SA-u-ca-gregory-nu-latn", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(trialEnd);

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-[1fr_1.1fr]">
        {/* LEFT — timeline */}
        <div className="md:order-2 relative">
          <button
            type="button"
            onClick={onSkip}
            className="absolute top-5 left-6 z-10 text-h5 text-text-muted hover:text-heading underline underline-offset-4 cursor-pointer transition"
          >
            تخطى
          </button>
          <TrialTimeline />
        </div>

        {/* RIGHT — payment form */}
        <section className="md:order-1 p-7 sm:p-9 lg:p-10 bg-white relative">
          <BackChip onClick={onBack} />

          {/* Title on its own row (the encryption badge moved down to sit
              opposite the card-brand logos). */}
          <h2 className="text-h2 font-bold text-heading mb-3 pt-2">الدفع</h2>

          {/* Card brand row + encryption badge — start (right in RTL) = badge,
              end (left in RTL) = logos. Aligns the trust badge with the brand
              logos visually on the same horizontal line. */}
          <div className="flex items-center justify-between gap-3 mb-5 flex-wrap">
            <span className="inline-flex items-center gap-1.5 text-h5 text-text-muted">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                <rect x="4" y="10" width="16" height="10" rx="2" />
                <path d="M8 10V7a4 4 0 1 1 8 0v3" strokeLinecap="round" />
              </svg>
              بياناتك مشفّرة بالكامل
            </span>
            <div className="flex items-center gap-2">
              {/* eslint-disable @next/next/no-img-element */}
              <img src="/assets/Mada.png" alt="Mada" className="h-6 w-auto object-contain" />
              <img src="/assets/express.png" alt="American Express" className="h-6 w-auto object-contain" />
              <img src="/assets/Mastercard.png" alt="Mastercard" className="h-6 w-auto object-contain" />
              <img src="/assets/visa.png" alt="Visa" className="h-6 w-auto object-contain" />
              {/* eslint-enable @next/next/no-img-element */}
            </div>
          </div>

          {/* Card number — floating label moves to the LEFT so the brand
              icon can sit on the RIGHT (RTL start) where the user requested. */}
          <div className="float-input relative h-[56px] bg-white border-[1.5px] border-[#DFDCE0] focus-within:border-primary rounded-xl mb-3">
            <input
              id="card-number"
              type="text"
              inputMode="numeric"
              autoComplete="cc-number"
              dir="ltr"
              placeholder=" "
              value={card}
              onChange={(e) => setCard(formatCardNumber(e.target.value))}
              maxLength={cardMaxLength(brand)}
              className="peer w-full h-full bg-transparent text-h4 text-heading pt-5 pb-1 ps-4 pe-14 outline-none rounded-xl font-mono tracking-wider"
            />
            <label
              htmlFor="card-number"
              className="absolute left-4 top-1/2 -translate-y-1/2 text-h5 text-text-muted pointer-events-none transition-all
                peer-focus:top-2 peer-focus:translate-y-0 peer-focus:text-[11px] peer-focus:text-primary peer-focus:font-medium
                peer-[:not(:placeholder-shown)]:top-2 peer-[:not(:placeholder-shown)]:translate-y-0 peer-[:not(:placeholder-shown)]:text-[11px] peer-[:not(:placeholder-shown)]:text-primary peer-[:not(:placeholder-shown)]:font-medium"
            >
              رقم البطاقة
            </label>
            <span className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
              {brand ? <CardBrandIcon brand={brand} /> : <CreditCardIcon />}
            </span>
          </div>

          {/* Expiry + CVV */}
          <div className="grid grid-cols-2 gap-3">
            <div className="float-input relative h-[56px] bg-white border-[1.5px] border-[#DFDCE0] focus-within:border-primary rounded-xl">
              <input
                id="card-exp"
                type="text"
                inputMode="numeric"
                autoComplete="cc-exp"
                dir="ltr"
                placeholder=" "
                value={exp}
                onChange={(e) => setExp(formatExpiry(e.target.value))}
                maxLength={5}
                className="peer w-full h-full bg-transparent text-h4 text-heading pt-5 pb-1 px-4 outline-none rounded-xl"
              />
              <label
                htmlFor="card-exp"
                className="absolute right-4 top-1/2 -translate-y-1/2 text-h5 text-text-muted pointer-events-none transition-all
                  peer-focus:top-2 peer-focus:translate-y-0 peer-focus:text-[11px] peer-focus:text-primary peer-focus:font-medium
                  peer-[:not(:placeholder-shown)]:top-2 peer-[:not(:placeholder-shown)]:translate-y-0 peer-[:not(:placeholder-shown)]:text-[11px] peer-[:not(:placeholder-shown)]:text-primary peer-[:not(:placeholder-shown)]:font-medium"
              >
                تاريخ الانتهاء
              </label>
            </div>
            <div className="float-input relative h-[56px] bg-white border-[1.5px] border-[#DFDCE0] focus-within:border-primary rounded-xl">
              <input
                id="card-cvv"
                type="text"
                inputMode="numeric"
                autoComplete="cc-csc"
                dir="ltr"
                placeholder=" "
                value={cvv}
                onChange={(e) =>
                  setCvv(
                    e.target.value
                      .replace(/\D/g, "")
                      .slice(0, cvvMaxLength(brand))
                  )
                }
                maxLength={cvvMaxLength(brand)}
                className="peer w-full h-full bg-transparent text-h4 text-heading pt-5 pb-1 px-4 outline-none rounded-xl"
              />
              <label
                htmlFor="card-cvv"
                className="absolute right-4 top-1/2 -translate-y-1/2 text-h5 text-text-muted pointer-events-none transition-all
                  peer-focus:top-2 peer-focus:translate-y-0 peer-focus:text-[11px] peer-focus:text-primary peer-focus:font-medium
                  peer-[:not(:placeholder-shown)]:top-2 peer-[:not(:placeholder-shown)]:translate-y-0 peer-[:not(:placeholder-shown)]:text-[11px] peer-[:not(:placeholder-shown)]:text-primary peer-[:not(:placeholder-shown)]:font-medium"
              >
                كود التحقّق
              </label>
            </div>
          </div>

          <button
            type="button"
            onClick={onContinue}
            className="w-full h-[52px] mt-5 bg-primary text-white text-h4 font-medium rounded-xl hover:bg-primary-hover cursor-pointer transition btn-premium"
          >
            ابدأ تجربتك بـ <span dir="ltr">$1</span>
          </button>

          <p className="text-h5 text-text-muted leading-relaxed mt-3">
            سيتم تجديد اشتراكك تلقائيًا للخطّة{" "}
            <span className="text-heading font-medium">{planName}</span> بتاريخ{" "}
            <span className="text-heading font-medium">{renewFmt}</span> بقيمة{" "}
            <span dir="ltr" className="text-heading font-medium">
              ${renewalAmount.toLocaleString("en-US")}
            </span>
            {" "}
            {billing === "yearly" ? "/ سنويًا" : "/ شهريًا"}
            {addonOn && (
              <>
                {" "}
                + <span dir="ltr" className="text-heading font-medium">$99</span>{" "}
                مقابل الخدمة الإضافية
              </>
            )}
            .
          </p>
        </section>
      </div>

      {/* $99 add-on row — full-width below the 2-column block.
          Layout (RTL, top → bottom):
            • Header  : [eyebrow pill on right]  [gift line on left]
            • Body    : description (right-aligned, full width)
            • Action  : [☑ تأكيد الاشتراك بالخدمة  →  right]   [ $99 →  left]
            • Footer  : "الأماكن محدودة..." right-aligned below the action row */}
      <div className="border-t border-[#DFDCE0] bg-gradient-to-b from-[#FFFCEC] to-[#FFFEF7] px-7 sm:px-9 lg:px-10 py-5">
        {/* Header row */}
        <div className="flex items-center justify-between gap-2 mb-2 flex-wrap">
          <span className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-[#A87F00] bg-white border border-[#E5C870] rounded-full px-3 py-1">
            خدمة إضافية — لمرة واحدة
          </span>
          <span className="inline-flex items-center gap-1.5 text-h5 text-[#A87F00] font-medium">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M20 12v10H4V12M2 7h20v5H2zM12 22V7M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7zM12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" stroke="currentColor" strokeWidth="1.5" fill="none" />
            </svg>
            ستحصل على شهرين مجاناً
          </span>
        </div>

        {/* Body description */}
        <p className="text-h5 text-heading leading-relaxed mb-4 text-start">
          بناء وتجهيز أكاديميتك كاملة: دومين، هوية بصرية، أول كورس، صفحة هبوط، وربط الدفع.
        </p>

        {/* Action row: checkbox first (right in RTL) + label after it,
            $99 on the opposite (left) side. */}
        <div className="flex items-center justify-between gap-3 mb-1.5 flex-wrap">
          <label className="inline-flex items-center gap-2.5 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={addonOn}
              onChange={(e) => setAddonOn(e.target.checked)}
              className="w-5 h-5 accent-primary cursor-pointer"
            />
            <span className="text-h4 text-heading font-medium">
              تأكيد الاشتراك بالخدمة
            </span>
          </label>
          <span className="text-h2 font-bold text-heading">
            <span dir="ltr">$99</span>
          </span>
        </div>

        {/* Footer caveat — right-aligned below the action row */}
        <p className="text-h5 text-text-muted text-start">
          الأماكن محدودة: 10–15 عميل أسبوعياً
        </p>
      </div>
    </>
  );
}

function CreditCardIcon() {
  return (
    <svg className="w-7 h-5 text-text-muted" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} aria-hidden="true">
      <rect x="2" y="5" width="20" height="14" rx="2" />
      <path d="M2 10h20" />
    </svg>
  );
}

function CardBrandIcon({ brand }: { brand: NonNullable<CardBrand> }) {
  const map = {
    visa: { label: "VISA", bg: "#1A1F71", color: "#ffffff" },
    mastercard: { label: "MC", bg: "#EB001B", color: "#ffffff" },
    amex: { label: "AMEX", bg: "#2E77BB", color: "#ffffff" },
    mada: { label: "مدى", bg: "#84B740", color: "#1A1A1A" },
  } as const;
  const m = map[brand];
  return (
    <span
      className="inline-flex items-center justify-center w-10 h-6 rounded text-[10px] font-bold tracking-wider"
      style={{ backgroundColor: m.bg, color: m.color }}
      aria-label={`بطاقة ${brand}`}
    >
      {m.label}
    </span>
  );
}

/* ════════════════════════════════════════════════════════════════
   Onboarding (3 chips + academy name)
   ════════════════════════════════════════════════════════════════ */
/* ════════════════════════════════════════════════════════════════
   Onboarding — 3-screen academy-setup questionnaire
   ─────────────────────────────────────────────────────────────────
   Layout per screen:
     • progress bar at the top (3 segments, current filled in primary)
     • content (question + chip groups + optional input)
     • footer:
         – Screen 1 → "التالي" (right) only, no prev/skip-all
         – Screen 2 / 3 → "التالي" / "إنهاء" (right) + tabs (left): تخطي الكل + السابق
 ════════════════════════════════════════════════════════════════ */

type OnboardingScreen = 1 | 2 | 3;

const ONB_GOALS = [
  { id: "share-knowledge",  label: "مشاركة خبرتك وتعليم الآخرين" },
  { id: "sell-courses",     label: "بيع دورات تدريبية" },
  { id: "personal-brand",   label: "بناء علامة شخصية كمدرّب أو خبير" },
  { id: "team-training",    label: "تدريب فريق العمل أو الموظفين" },
  { id: "consulting",       label: "تقديم استشارات أو برامج تعليمية" },
  { id: "extra-income",     label: "إنشاء مصدر دخل إضافي" },
  { id: "community",        label: "بناء مجتمع تعليمي" },
];
const ONB_SPECIALIZATIONS = [
  { id: "business",  label: "ريادة الأعمال" },
  { id: "tech",      label: "التقنية والبرمجة" },
  { id: "design",    label: "التصميم والإبداع" },
  { id: "marketing", label: "التسويق وصناعة المحتوى" },
  { id: "health",    label: "الصحة والتطوير الشخصي" },
  { id: "other",     label: "أخرى" },
];
const ONB_AUDIENCES = [
  { id: "none",     label: "لا يوجد" },
  { id: "under50",  label: "أقل من 50" },
  { id: "50-100",   label: "100 - 50" },
  { id: "200-1000", label: "1,000 - 200" },
  { id: "1000+",    label: "1,000+" },
];
const ONB_FIRST_MONTH = [
  { id: "launch-course", label: "إطلاق أول دورة بسرعة" },
  { id: "build-content", label: "بناء محتوى أكاديمي" },
  { id: "first-sale",    label: "تحقيق أول بيع" },
  { id: "setup-pro",     label: "تجهيز الأكاديمية بشكل احترافي" },
  { id: "try-platform",  label: "تجربة المنصة فقط" },
];
const ONB_PLATFORMS = [
  { id: "none",      label: "لا أستخدم أي منصة حتى الآن" },
  { id: "mazn",      label: "Mazn" },
  { id: "udemy",     label: "Udemy" },
  { id: "teachable", label: "Teachable" },
  { id: "kajabi",    label: "Kajabi" },
  { id: "youtube",   label: "YouTube" },
  { id: "wordpress", label: "WordPress" },
  { id: "other",     label: "أخرى" },
];

function OnboardingStep({ onFinish }: { onFinish: () => void }) {
  const [screen, setScreen] = useState<OnboardingScreen>(1);
  // Screen 1
  const [goals, setGoals] = useState<string[]>(["share-knowledge"]);
  const [academyName, setAcademyName] = useState("");
  // Screen 2
  const [specialization, setSpecialization] = useState<string | null>(null);
  const [audience, setAudience] = useState<string | null>(null);
  // Screen 3
  const [firstMonthGoal, setFirstMonthGoal] = useState<string | null>(null);
  const [platform, setPlatform] = useState<string | null>(null);

  const canProceedFromScreen1 = academyName.trim().length >= 2;

  const goNext = () => {
    if (screen < 3) setScreen((s) => (s + 1) as OnboardingScreen);
    else onFinish();
  };
  const goPrev = () => {
    if (screen > 1) setScreen((s) => (s - 1) as OnboardingScreen);
  };

  const toggleMulti = (
    current: string[],
    setter: (v: string[]) => void,
    id: string
  ) => setter(current.includes(id) ? current.filter((x) => x !== id) : [...current, id]);

  return (
    <div className="min-h-[520px] flex flex-col">
      {/* Progress bar — 3 segments, fill up-to-current */}
      <div className="flex gap-2 mb-7 pt-1">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className={`flex-1 h-1.5 rounded-full transition-colors ${
              i <= screen ? "bg-primary" : "bg-[#E0DCE4]"
            }`}
            aria-current={i === screen ? "step" : undefined}
          />
        ))}
      </div>

      {/* Screen content — grows to fill so the footer pins to the bottom */}
      <div className="flex-1">
        {screen === 1 && (
          <>
            <h2 className="text-h2 font-bold text-heading text-start mb-1">
              هيا نبدأ بمعلوماتك
            </h2>
            <p className="text-h5 text-text-muted text-start mb-6">
              سنخصص تجربتك بناءً على إجاباتك
            </p>

            <p className="text-h4 font-medium text-heading mb-3 text-start">
              ما الهدف من إنشاء أكاديميتك؟
            </p>
            <div className="flex flex-wrap gap-2 mb-7">
              {ONB_GOALS.map((g) => {
                const selected = goals.includes(g.id);
                return (
                  <ChipMulti
                    key={g.id}
                    selected={selected}
                    onClick={() => toggleMulti(goals, setGoals, g.id)}
                    label={g.label}
                  />
                );
              })}
            </div>

            <label
              htmlFor="academy-name"
              className="block text-h4 font-medium text-heading mb-1.5 text-start"
            >
              ما اسم أكاديميتك؟{" "}
              <span className="text-h5 text-text-muted">(يجب إدخال الاسم)</span>
            </label>
            <input
              id="academy-name"
              type="text"
              value={academyName}
              onChange={(e) => setAcademyName(e.target.value)}
              className={inputCls}
            />
            <p className="text-h5 text-text-muted text-start mt-1.5">
              يمكنك تغييره من لوحة التحكم لاحقاً
            </p>
          </>
        )}

        {screen === 2 && (
          <>
            <p className="text-h4 font-medium text-heading mb-3 text-start">
              ما هو اختصاص أكاديميتك؟
            </p>
            <div className="flex flex-wrap gap-2 mb-7">
              {ONB_SPECIALIZATIONS.map((s) => (
                <ChipSingle
                  key={s.id}
                  selected={specialization === s.id}
                  onClick={() => setSpecialization(s.id)}
                  label={s.label}
                />
              ))}
            </div>

            <p className="text-h4 font-medium text-heading mb-3 text-start">
              ما هو حجم جمهورك الحالي؟
            </p>
            <div className="flex flex-wrap gap-2">
              {ONB_AUDIENCES.map((a) => (
                <ChipSingle
                  key={a.id}
                  selected={audience === a.id}
                  onClick={() => setAudience(a.id)}
                  label={a.label}
                />
              ))}
            </div>
          </>
        )}

        {screen === 3 && (
          <>
            <p className="text-h4 font-medium text-heading mb-3 text-start">
              ما هو أهم شيء لك في أول 30 يوم؟
            </p>
            <div className="flex flex-wrap gap-2 mb-7">
              {ONB_FIRST_MONTH.map((f) => (
                <ChipSingle
                  key={f.id}
                  selected={firstMonthGoal === f.id}
                  onClick={() => setFirstMonthGoal(f.id)}
                  label={f.label}
                />
              ))}
            </div>

            <p className="text-h4 font-medium text-heading mb-3 text-start">
              ما المنصة التي تستخدمها حاليًا؟
            </p>
            <div className="flex flex-wrap gap-2">
              {ONB_PLATFORMS.map((p) => (
                <ChipSingle
                  key={p.id}
                  selected={platform === p.id}
                  onClick={() => setPlatform(p.id)}
                  label={p.label}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Footer — pinned at the bottom of the min-height card.
          Order (RTL → DOM order):
            • السابق (right, RTL start)
            • تخطي الكل (centred via justify-between's middle child)
            • التالي / إنهاء (left, RTL end)
          On screen 1, السابق + تخطي الكل are hidden — only التالي shows
          on the left. The first question already has a default answer
          and the academy-name input is required; subsequent screens are
          all optional. */}
      <div className="pt-6 mt-6 border-t border-[#DFDCE0]">
        {screen === 1 ? (
          <div className="flex justify-end">
            <button
              type="button"
              disabled={!canProceedFromScreen1}
              onClick={goNext}
              className="bg-primary text-white text-h4 font-medium px-7 py-3 rounded-xl hover:bg-primary-hover cursor-pointer transition btn-premium disabled:opacity-40 disabled:pointer-events-none"
            >
              التالي
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={goPrev}
              className="text-h5 text-text-muted hover:text-heading cursor-pointer inline-flex items-center gap-1"
            >
              <svg
                className="w-3.5 h-3.5"
                fill="none"
                stroke="currentColor"
                strokeWidth={2.2}
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                {/* In RTL, "previous" arrow points right (towards the start) */}
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 6l6 6-6 6" />
              </svg>
              السابق
            </button>

            <button
              type="button"
              onClick={onFinish}
              className="text-h5 text-text-muted hover:text-heading underline underline-offset-4 cursor-pointer"
            >
              تخطي الكل
            </button>

            <button
              type="button"
              onClick={goNext}
              className="bg-primary text-white text-h4 font-medium px-7 py-3 rounded-xl hover:bg-primary-hover cursor-pointer transition btn-premium"
            >
              {screen === 3 ? "إنهاء" : "التالي"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/* Chip — unified appearance for single + multi.
   • Both look identical at rest: white bg + gray border.
   • Multi shows "+" when unselected (signals "you can add more").
   • Single shows no icon at rest (it's a pick-one choice).
   • Both show "✓" + filled dark when selected. */
function ChipMulti({
  selected, onClick, label,
}: { selected: boolean; onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={`inline-flex items-center gap-1.5 text-h5 px-4 py-2 rounded-full border cursor-pointer transition ${
        selected
          ? "bg-heading text-white border-heading"
          : "bg-white text-heading border-[#DFDCE0] hover:border-primary/40 hover:bg-primary-soft/50"
      }`}
    >
      <span aria-hidden="true">{selected ? "✓" : "+"}</span>
      {label}
    </button>
  );
}

function ChipSingle({
  selected, onClick, label,
}: { selected: boolean; onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      role="radio"
      aria-checked={selected}
      className={`inline-flex items-center gap-1.5 text-h5 px-4 py-2 rounded-full border cursor-pointer transition ${
        selected
          ? "bg-heading text-white border-heading"
          : "bg-white text-heading border-[#DFDCE0] hover:border-primary/40 hover:bg-primary-soft/50"
      }`}
    >
      {selected && <span aria-hidden="true">✓</span>}
      {label}
    </button>
  );
}

/* ════════════════════════════════════════════════════════════════
   Thank-You step — confetti + success + renewal notice
   ════════════════════════════════════════════════════════════════ */
function ThankyouStep({
  planName,
  billing,
  renewalAmount,
  addonOn,
  onContinue,
}: {
  planName: string;
  billing: "yearly" | "monthly";
  renewalAmount: number;
  /** Whether the $99 add-on was selected during payment. */
  addonOn: boolean;
  /** "لنجهّز منصتك" → onboarding questionnaire. */
  onContinue: () => void;
}) {
  const renew = new Date();
  renew.setDate(renew.getDate() + 33); // 3-day trial + 30-day month
  const renewFmt = new Intl.DateTimeFormat("ar-SA-u-ca-gregory-nu-latn", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(renew);

  // Fire confetti when the step mounts.
  useEffect(() => {
    const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;

    const colors = ["#6B3A8C", "#E056A7", "#F2C94C", "#1F8A4C", "#E056A7"];
    const fire = (origin: { x: number; y: number }) =>
      confetti({
        particleCount: 60,
        spread: 80,
        startVelocity: 35,
        gravity: 0.9,
        ticks: 200,
        origin,
        colors,
      });

    fire({ x: 0.2, y: 0.4 });
    fire({ x: 0.5, y: 0.35 });
    fire({ x: 0.8, y: 0.4 });

    const t = setTimeout(() => {
      fire({ x: 0.3, y: 0.5 });
      fire({ x: 0.7, y: 0.5 });
    }, 350);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="p-8 sm:p-10 text-center">
      <div className="w-20 h-20 mx-auto mb-5 rounded-full bg-success/15 flex items-center justify-center ring-8 ring-success/5">
        <svg className="w-10 h-10 text-success" fill="none" stroke="currentColor" strokeWidth={2.6} viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <h2 className="text-h1 font-bold text-heading mb-2">تهانينا! تم الاشتراك بنجاح</h2>
      <p className="text-h4 text-text-muted leading-relaxed mb-5">
        سعداء بانضمامك لعائلة أكاديميات
      </p>
      <p className="text-h5 text-text-muted leading-relaxed mb-7">
        سيتم تجديد الاشتراك تلقائياً بتاريخ{" "}
        <span className="text-heading font-medium">{renewFmt}</span> بسعر{" "}
        <span className="text-heading font-medium" dir="ltr">
          ${renewalAmount.toLocaleString("en-US")}
        </span>
        {addonOn && (
          <>
            {" "}
            +{" "}
            <span className="text-heading font-medium" dir="ltr">
              $99
            </span>{" "}
            بإجمالي{" "}
            <span className="text-heading font-semibold" dir="ltr">
              ${(renewalAmount + 99).toLocaleString("en-US")}
            </span>
          </>
        )}{" "}
        {billing === "yearly" ? "/ سنويًا" : "/ شهريًا"} بعد انتهاء الفترة التجريبية.
      </p>
      <button
        type="button"
        onClick={onContinue}
        className="w-full h-[52px] bg-primary text-white text-h4 font-medium rounded-xl hover:bg-primary-hover cursor-pointer transition btn-premium"
      >
        لنجهّز منصتك
      </button>
      {/* planName kept for future "خطة {planName}" if needed */}
      <span className="sr-only">{planName}</span>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   Email field with inline ghost-text completion (Gmail-style)
   ─────────────────────────────────────────────────────────────────
   Once the user types `@` + at least one character of the domain, we
   look up the first matching common domain and render its remainder
   as muted "ghost" text right after the caret. Tab or ArrowRight
   accepts the suggestion. Pressing more letters narrows it further;
   typing something unmatched hides the ghost.
   ════════════════════════════════════════════════════════════════ */
const SUGGESTED_DOMAINS = [
  "gmail.com",
  "hotmail.com",
  "icloud.com",
  "yahoo.com",
  "live.com",
  "outlook.com",
];

export function EmailFieldWithSuggest({
  id,
  value,
  onChange,
  label = "البريد الإلكتروني",
  autoComplete = "email",
  error = false,
}: {
  id: string;
  value: string;
  onChange: (v: string) => void;
  label?: string;
  autoComplete?: string;
  /** When true, paints the border + label in error color. */
  error?: boolean;
}) {
  // Parse the email — we need the bit after `@` to look up a match.
  const atIndex = value.lastIndexOf("@");
  const hasAt = atIndex >= 0;
  const typedDomain = hasAt ? value.slice(atIndex + 1).toLowerCase() : "";

  // Best match = first domain that starts with what's been typed.
  // Ghost suffix = the *remainder* of that domain (what's NOT yet typed).
  // Show only when:
  //   • the user has typed @ + at least one char of the domain
  //   • that prefix matches a known domain
  //   • the domain isn't already complete
  const ghostSuffix = useMemo(() => {
    if (!hasAt || typedDomain.length === 0) return "";
    const match = SUGGESTED_DOMAINS.find((d) => d.startsWith(typedDomain));
    if (!match || match === typedDomain) return "";
    return match.slice(typedDomain.length);
  }, [hasAt, typedDomain]);

  const accept = () => {
    if (!ghostSuffix) return;
    onChange(value + ghostSuffix);
  };

  return (
    <div
      className={`float-input relative h-[52px] bg-white border rounded-xl transition ${
        error
          ? "border-error focus-within:border-error"
          : "border-[#DFDCE0] focus-within:border-primary"
      }`}
    >
      {/* Ghost overlay — uses the SAME font, padding, and direction as
          the input. The invisible spacer mirrors the typed text width
          so the visible ghost suffix appears exactly where the input's
          cursor sits. The whole layer is non-interactive. */}
      <div
        aria-hidden="true"
        dir="ltr"
        className="absolute inset-y-0 inset-x-4 pt-5 pb-1.5 text-h4 leading-tight font-normal pointer-events-none whitespace-pre overflow-hidden"
      >
        <span className="invisible">{value}</span>
        <span className="text-text-muted/70">{ghostSuffix}</span>
      </div>

      <input
        id={id}
        type="email"
        dir="ltr"
        autoComplete={autoComplete}
        placeholder=" "
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          // Tab + ArrowRight (when caret is at the end) → accept.
          // We block Tab's default focus-shift only if a suggestion exists.
          if (!ghostSuffix) return;
          if (e.key === "Tab") {
            e.preventDefault();
            accept();
            return;
          }
          const target = e.currentTarget;
          const atEnd = target.selectionStart === target.value.length;
          if (atEnd && e.key === "ArrowRight") {
            e.preventDefault();
            accept();
          }
        }}
        className="peer relative w-full h-full bg-transparent text-h4 text-heading pt-5 pb-1.5 px-4 outline-none rounded-xl"
      />
      <label
        htmlFor={id}
        className="absolute right-4 top-1/2 -translate-y-1/2 text-h5 text-text-muted pointer-events-none transition-all
        peer-focus:top-1.5 peer-focus:translate-y-0 peer-focus:text-[11px] peer-focus:text-primary peer-focus:font-medium
        peer-[:not(:placeholder-shown)]:top-1.5 peer-[:not(:placeholder-shown)]:translate-y-0 peer-[:not(:placeholder-shown)]:text-[11px] peer-[:not(:placeholder-shown)]:text-primary peer-[:not(:placeholder-shown)]:font-medium"
      >
        {label}
      </label>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   Shared sub-components
   ════════════════════════════════════════════════════════════════ */
export function FloatField({
  id, type = "text", label, value, onChange, dir, autoComplete,
}: {
  id: string;
  type?: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  dir?: "ltr" | "rtl";
  autoComplete?: string;
}) {
  return (
    <div className="float-input relative h-[52px] bg-white border border-[#DFDCE0] focus-within:border-primary rounded-xl">
      <input
        id={id}
        type={type}
        dir={dir}
        autoComplete={autoComplete}
        placeholder=" "
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="peer w-full h-full bg-transparent text-h4 text-heading pt-5 pb-1.5 px-4 outline-none rounded-xl"
      />
      <label
        htmlFor={id}
        className="absolute right-4 top-1/2 -translate-y-1/2 text-h5 text-text-muted pointer-events-none transition-all
        peer-focus:top-1.5 peer-focus:translate-y-0 peer-focus:text-[11px] peer-focus:text-primary peer-focus:font-medium
        peer-[:not(:placeholder-shown)]:top-1.5 peer-[:not(:placeholder-shown)]:translate-y-0 peer-[:not(:placeholder-shown)]:text-[11px] peer-[:not(:placeholder-shown)]:text-primary peer-[:not(:placeholder-shown)]:font-medium"
      >
        {label}
      </label>
    </div>
  );
}

export function Divider({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative my-5 text-center">
      <span className="px-3 bg-white text-h5 text-text-muted relative z-10">{children}</span>
      <span className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-px bg-[#DFDCE0]" />
    </div>
  );
}

function CloseChip({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="إغلاق"
      className="absolute top-4 left-4 z-10 w-9 h-9 rounded-full hover:bg-primary-soft flex items-center justify-center text-text-muted hover:text-heading cursor-pointer transition"
    >
      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
      </svg>
    </button>
  );
}

export function BackChip({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="رجوع"
      className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full hover:bg-primary-soft flex items-center justify-center text-text-muted hover:text-heading cursor-pointer transition"
    >
      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 6l6 6-6 6" />
      </svg>
    </button>
  );
}

export function GoogleIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.99.66-2.26 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.1A6.57 6.57 0 0 1 5.5 12c0-.74.13-1.45.34-2.1V7.07H2.18A11 11 0 0 0 1 12c0 1.77.43 3.45 1.18 4.93l3.66-2.84z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07L5.84 9.9C6.71 7.3 9.14 5.38 12 5.38z" />
    </svg>
  );
}
export function AppleIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
    </svg>
  );
}
