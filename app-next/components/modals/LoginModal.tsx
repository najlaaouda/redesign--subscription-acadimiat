"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  AppleIcon,
  BackChip,
  Divider,
  EmailFieldWithSuggest,
  GoogleIcon,
  OtpStep,
} from "@/components/modals/AuthModal";
import { openSignup } from "@/lib/auth-events";
import { COUNTRIES, DEFAULT_COUNTRY, type Country } from "@/lib/countries";
import { isEmailRegistered, isPhoneRegistered } from "@/lib/email-suggest";

/**
 * Login modal — multi-step, Passkey-first.
 *
 *   ┌─── identify ───────────────────────────────────────────────┐
 *   │  Logo → "أهلًا بعودتك"                                       │
 *   │  → 3-button SSO row (Google + Apple + Passkey)               │
 *   │  → divider                                                   │
 *   │  → tabs: [الدخول بالبريد] [الدخول برقم الهاتف]               │
 *   │  → corresponding field + "تسجيل الدخول" button               │
 *   │  → "ليس لديك حساب؟ إنشاء حساب جديد"                          │
 *   │  → "هل بحاجة لمساعدة؟" → opens intercom.help                 │
 *   └──────────────────────────────────────────────────────────────┘
 *           │ email path                       │ phone path
 *           ▼                                  ▼
 *   ┌─ email-verify ─────────────┐   ┌─ phone-otp ────────────┐
 *   │  tabs: [كود التحقق]         │   │  6-digit OTP via         │
 *   │        [كلمة المرور]        │   │  WhatsApp (OtpStep).     │
 *   │  → corresponding panel      │   │                          │
 *   └─────────────────────────────┘   └──────────────────────────┘
 *
 * Each step's "back" returns to `identify` so the user can switch
 * method or fix typos. On final success the modal just closes
 * (real backend will navigate to the dashboard).
 */

type Step = "identify" | "email-verify" | "phone-otp";
type LoginMethod = "email" | "phone";
type VerifyTab = "code" | "password";

export function LoginModal() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<Step>("identify");
  const [method, setMethod] = useState<LoginMethod>("email");
  const [verifyTab, setVerifyTab] = useState<VerifyTab>("code");

  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [country, setCountry] = useState<Country>(DEFAULT_COUNTRY);
  const [password, setPassword] = useState("");
  /** "not registered" error message — shown under the active field. */
  const [notRegistered, setNotRegistered] = useState<"email" | "phone" | null>(null);

  /* ─── Open / close plumbing ─── */
  useEffect(() => {
    const handler = () => {
      setStep("identify");
      setMethod("email");
      setVerifyTab("code");
      setOpen(true);
    };
    window.addEventListener("auth:open-login", handler);
    return () => window.removeEventListener("auth:open-login", handler);
  }, []);

  useEffect(() => {
    if (open) return;
    // Reset transient state shortly after close so re-opening starts fresh.
    const t = setTimeout(() => {
      setEmail("");
      setPhone("");
      setCountry(DEFAULT_COUNTRY);
      setPassword("");
      setNotRegistered(null);
      setStep("identify");
    }, 250);
    return () => clearTimeout(t);
  }, [open]);

  // Clear the not-registered banner the moment the user edits the active
  // field or switches tabs — mirrors the signup "already-registered" UX.
  useEffect(() => {
    if (notRegistered) setNotRegistered(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [email, phone, country.code, method]);

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

  const close = () => setOpen(false);
  const switchToSignup = () => {
    setOpen(false);
    openSignup();
  };

  /* ─── Identify-step enable rules ─── */
  const digits = phone.replace(/\D/g, "");
  const emailEnabled = email.trim().length >= 4 && email.includes("@");
  const phoneEnabled = digits.length === country.phoneLen;
  const identifyEnabled = method === "email" ? emailEnabled : phoneEnabled;

  const handleIdentifyContinue = () => {
    if (!identifyEnabled) return;
    if (method === "email") {
      // Block unknown emails — the auth backend would do this server-side,
      // here we mirror the signup pattern using the local REGISTERED_EMAILS
      // hard-coded set.
      if (!isEmailRegistered(email)) {
        setNotRegistered("email");
        return;
      }
      setVerifyTab("code");
      setStep("email-verify");
    } else {
      if (!isPhoneRegistered(country.dial, digits)) {
        setNotRegistered("phone");
        return;
      }
      setStep("phone-otp");
    }
  };

  /* ──────────────────────────────────────────────────────────── */
  return (
    <div
      className="fixed inset-0 z-[70]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="login-title"
    >
      <div
        className="absolute inset-0 bg-heading/45 backdrop-blur-sm"
        onClick={close}
      />

      <div className="relative h-full overflow-y-auto p-4 sm:p-6 flex items-start sm:items-center justify-center">
        <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-[0_24px_64px_-12px_rgba(49,26,64,0.35)] p-7 sm:p-9">
          <button
            type="button"
            onClick={close}
            aria-label="إغلاق"
            className="absolute top-4 left-4 z-10 w-9 h-9 rounded-full hover:bg-primary-soft flex items-center justify-center text-text-muted hover:text-heading cursor-pointer transition"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              strokeWidth={2.2}
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>

          {/* ═══════ STEP: identify ═══════ */}
          {step === "identify" && (
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

              <h2
                id="login-title"
                className="text-h2 font-bold text-heading text-center mb-1"
              >
                أهلًا بعودتك
              </h2>
              <p className="text-h5 text-text-muted text-center mb-6">
                سجّل دخولك للوصول إلى لوحة التحكّم
              </p>

              <div className="grid grid-cols-3 gap-2.5 mb-5">
                <SsoTile label="Google" icon={<GoogleIcon />} onClick={close} />
                <SsoTile label="Apple" icon={<AppleIcon />} onClick={close} />
                <SsoTile
                  label="Passkey"
                  icon={<PasskeyIcon />}
                  onClick={close}
                />
              </div>

              <Divider>أو متابعة التسجيل</Divider>

              {/* Method tabs — email is default active */}
              <div
                className="login-method-tabs mb-4"
                role="tablist"
                aria-label="طريقة الدخول"
              >
                <button
                  type="button"
                  role="tab"
                  aria-selected={method === "email"}
                  className={
                    "login-method-tab" + (method === "email" ? " is-active" : "")
                  }
                  onClick={() => setMethod("email")}
                >
                  الدخول بالبريد الإلكتروني
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={method === "phone"}
                  className={
                    "login-method-tab" + (method === "phone" ? " is-active" : "")
                  }
                  onClick={() => setMethod("phone")}
                >
                  الدخول برقم الهاتف
                </button>
              </div>

              {/* Field — depends on the active tab */}
              {method === "email" ? (
                <EmailFieldWithSuggest
                  id="login-email"
                  value={email}
                  onChange={setEmail}
                  autoComplete="email"
                  error={notRegistered === "email"}
                />
              ) : (
                <PhoneInputWithPicker
                  id="login-phone"
                  country={country}
                  setCountry={setCountry}
                  phone={phone}
                  setPhone={setPhone}
                  error={notRegistered === "phone"}
                />
              )}

              {/* Not-registered error — appears under the field with a
                  one-click "إنشاء حساب جديد" path. */}
              {notRegistered && (
                <p className="text-h5 text-error mt-2" role="alert">
                  {notRegistered === "email"
                    ? "البريد المدخل غير مسجل."
                    : "رقم الهاتف المدخل غير مسجل."}{" "}
                  <button
                    type="button"
                    onClick={switchToSignup}
                    className="text-primary font-semibold hover:text-primary-hover cursor-pointer underline underline-offset-2"
                  >
                    إنشاء حساب جديد
                  </button>
                </p>
              )}

              <button
                type="button"
                disabled={!identifyEnabled}
                onClick={handleIdentifyContinue}
                className="w-full h-[52px] mt-4 bg-primary text-white text-h4 font-medium rounded-xl hover:bg-primary-hover cursor-pointer transition btn-premium disabled:opacity-40 disabled:pointer-events-none"
              >
                تسجيل الدخول
              </button>

              <p className="text-h5 text-text-muted text-center mt-4">
                ليس لديك حساب؟{" "}
                <button
                  type="button"
                  onClick={switchToSignup}
                  className="text-primary font-medium hover:text-primary-hover cursor-pointer"
                >
                  إنشاء حساب جديد
                </button>
              </p>

              {/* Help link — routes to the Intercom help center.
                  WhatsApp icon + "تواصل معنا" suffix were removed. */}
              <p className="text-h5 text-text-muted text-center mt-3">
                <a
                  href="https://intercom.help/acadimiat/ar"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary font-medium hover:text-primary-hover transition"
                >
                  هل بحاجة لمساعدة؟
                </a>
              </p>
            </>
          )}

          {/* ═══════ STEP: email-verify (code | password tabs) ═══════ */}
          {step === "email-verify" && verifyTab === "code" && (
            <OtpStep
              title="تحقّق من هويتك"
              channelLabel="البريد"
              channelValue={email}
              onChangeChannel={() => setStep("identify")}
              onBack={() => setStep("identify")}
              onContinue={close}
              tabsSlot={
                <EmailVerifyTabs
                  active={verifyTab}
                  onChange={setVerifyTab}
                />
              }
            />
          )}

          {step === "email-verify" && verifyTab === "password" && (
            <PasswordPanel
              email={email}
              password={password}
              setPassword={setPassword}
              onBack={() => setStep("identify")}
              onContinue={close}
              tabsSlot={
                <EmailVerifyTabs
                  active={verifyTab}
                  onChange={setVerifyTab}
                />
              }
            />
          )}

          {/* ═══════ STEP: phone-otp (WhatsApp) ═══════ */}
          {step === "phone-otp" && (
            <OtpStep
              title="تحقّق من هويتك"
              channelLabel="رقم الموبايل"
              channelValue={`${country.dial} ${phone}`}
              onChangeChannel={() => setStep("identify")}
              onBack={() => setStep("identify")}
              onContinue={close}
              subtitle={
                <span className="inline-flex items-center gap-1.5">
                  <WhatsAppIcon />
                  <span>عبر واتساب</span>
                </span>
              }
            />
          )}
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   Email-verify tab strip — toggles between [code] and [password]
   ════════════════════════════════════════════════════════════════ */
function EmailVerifyTabs({
  active,
  onChange,
}: {
  active: VerifyTab;
  onChange: (t: VerifyTab) => void;
}) {
  return (
    <div
      className="login-method-tabs mb-5"
      role="tablist"
      aria-label="طريقة التحقّق"
    >
      <button
        type="button"
        role="tab"
        aria-selected={active === "code"}
        className={
          "login-method-tab" + (active === "code" ? " is-active" : "")
        }
        onClick={() => onChange("code")}
      >
        الدخول بكود التحقّق
      </button>
      <button
        type="button"
        role="tab"
        aria-selected={active === "password"}
        className={
          "login-method-tab" + (active === "password" ? " is-active" : "")
        }
        onClick={() => onChange("password")}
      >
        الدخول بكلمة المرور
      </button>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   Password panel — shown in email-verify when the user picks the
   password tab. Submits on Enter or button click.
   ════════════════════════════════════════════════════════════════ */
function PasswordPanel({
  email,
  password,
  setPassword,
  onBack,
  onContinue,
  tabsSlot,
}: {
  email: string;
  password: string;
  setPassword: (v: string) => void;
  onBack: () => void;
  onContinue: () => void;
  tabsSlot: React.ReactNode;
}) {
  const [showPassword, setShowPassword] = useState(false);
  const enabled = password.length >= 6;
  const submit = () => {
    if (enabled) onContinue();
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
      <h2 className="text-h2 font-bold text-heading text-center mb-5">
        تحقّق من هويتك
      </h2>

      {/* Tabs sit directly under the title — matches OtpStep layout
          so switching tabs doesn't shift content vertically. */}
      {tabsSlot}

      <p className="text-h5 text-text-muted text-center mb-1 leading-relaxed">
        أدخل كلمة المرور المرتبطة بـ
      </p>
      <p
        className="text-h5 text-heading font-semibold text-center mb-5"
        dir="ltr"
      >
        {email}
      </p>

      <label htmlFor="login-password" className="sr-only">
        كلمة المرور
      </label>
      {/* relative wrapper hosts the show/hide toggle on the end side
          (left in RTL). ps-4 = start padding (right), pe-12 reserves
          room for the toggle button so digits never collide with it. */}
      <div className="relative">
        <input
          id="login-password"
          type={showPassword ? "text" : "password"}
          autoComplete="current-password"
          autoFocus
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") submit();
          }}
          placeholder="••••••••"
          className="w-full h-[52px] ps-4 pe-12 bg-white border border-[#DFDCE0] rounded-xl text-h4 text-heading focus:outline-none focus:border-primary focus:ring-[3px] focus:ring-primary/15 transition"
        />
        <button
          type="button"
          onClick={() => setShowPassword((v) => !v)}
          aria-label={showPassword ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"}
          aria-pressed={showPassword}
          className="absolute inset-y-0 end-2 flex items-center justify-center w-9 h-9 my-auto rounded-lg text-text-muted hover:text-heading hover:bg-primary-soft cursor-pointer transition"
        >
          {showPassword ? <EyeOffIcon /> : <EyeIcon />}
        </button>
      </div>

      {/* Forgot-password link sits directly under the field per spec. */}
      <p className="text-h5 text-text-muted text-end mt-2">
        <button
          type="button"
          className="text-primary font-medium hover:text-primary-hover cursor-pointer"
        >
          هل نسيت كلمة المرور؟
        </button>
      </p>

      <button
        type="button"
        disabled={!enabled}
        onClick={submit}
        className="w-full h-[52px] mt-5 bg-primary text-white text-h4 font-medium rounded-xl hover:bg-primary-hover cursor-pointer transition btn-premium disabled:opacity-40 disabled:pointer-events-none"
      >
        تسجيل الدخول
      </button>
    </>
  );
}

/* ════════════════════════════════════════════════════════════════
   Phone input with country picker — mirrors AuthModal's PhoneStep
   field. Inline picker: search by Arabic name, dial code, or ISO.
   ════════════════════════════════════════════════════════════════ */
function PhoneInputWithPicker({
  id,
  country,
  setCountry,
  phone,
  setPhone,
  error = false,
}: {
  id: string;
  country: Country;
  setCountry: (c: Country) => void;
  phone: string;
  setPhone: (v: string) => void;
  /** Paint the input in error color when not registered. */
  error?: boolean;
}) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const [search, setSearch] = useState("");
  const pickerRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const phoneInputRef = useRef<HTMLInputElement>(null);

  // Auto-focus the phone field when the picker mounts (i.e., when the
  // user switches to the phone tab) so they can type immediately.
  useEffect(() => {
    phoneInputRef.current?.focus();
  }, []);

  const digits = phone.replace(/\D/g, "");

  const filteredCountries = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return COUNTRIES;
    const qDigits = q.replace(/\D/g, "");
    return COUNTRIES.filter((c) => {
      if (c.name.includes(q)) return true;
      if (c.code.toLowerCase().includes(q)) return true;
      if (qDigits && c.dial.replace(/\D/g, "").startsWith(qDigits)) return true;
      return false;
    });
  }, [search]);

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
    setTimeout(() => searchRef.current?.focus(), 50);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [pickerOpen]);

  useEffect(() => {
    if (digits.length > country.phoneLen) {
      setPhone(digits.slice(0, country.phoneLen));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [country.code]);

  return (
    <>
      <label htmlFor={id} className="sr-only">
        رقم الموبايل
      </label>
      <div className="flex items-stretch gap-2" dir="ltr">
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
            <svg
              className={`w-3 h-3 transition-transform ${pickerOpen ? "rotate-180" : ""}`}
              fill="none"
              stroke="currentColor"
              strokeWidth={2.4}
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>

          {pickerOpen && (
            <div
              className="absolute top-full inset-x-0 mt-1.5 w-72 bg-white border border-[#DFDCE0] rounded-xl shadow-lg z-30 overflow-hidden"
              dir="rtl"
              onMouseDown={(e) => e.preventDefault()}
            >
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
                          <span dir="ltr" className="text-text-muted">
                            {c.dial}
                          </span>
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
          id={id}
          ref={phoneInputRef}
          type="tel"
          inputMode="numeric"
          autoComplete="tel-national"
          dir="ltr"
          placeholder={country.placeholder}
          value={phone}
          onChange={(e) =>
            setPhone(
              e.target.value.replace(/\D/g, "").slice(0, country.phoneLen),
            )
          }
          maxLength={country.phoneLen}
          aria-invalid={error}
          className={`flex-1 w-full h-[52px] px-4 bg-white border rounded-xl text-h4 transition focus:outline-none ${
            error
              ? "border-error text-error focus:border-error focus:ring-[3px] focus:ring-error/15"
              : "border-[#DFDCE0] text-heading focus:border-primary focus:ring-[3px] focus:ring-primary/15"
          }`}
        />
      </div>
    </>
  );
}

/* ════════════════════════════════════════════════════════════════
   SSO tile — icon stacked over the label (grid-cols-3)
   ════════════════════════════════════════════════════════════════ */
function SsoTile({
  label,
  icon,
  onClick,
}: {
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex flex-col items-center justify-center gap-2 h-[64px] bg-white border border-[#DFDCE0] hover:bg-[#F9F7FB] text-heading rounded-xl cursor-pointer transition btn-premium"
    >
      {icon}
      <span className="text-h5 font-medium">{label}</span>
    </button>
  );
}

function PasskeyIcon() {
  return (
    <svg
      className="w-5 h-5 text-heading"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      aria-hidden="true"
    >
      <circle cx="9" cy="8" r="4" />
      <path
        d="M9 12c-3.31 0-6 2.69-6 6h6m6-4l3 3-2 2-3-3v-2.5L13.5 13H16v2zM16 13l4 4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function EyeIcon() {
  return (
    <svg
      className="w-5 h-5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg
      className="w-5 h-5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M17.94 17.94A10.94 10.94 0 0 1 12 19c-6.5 0-10-7-10-7a18.5 18.5 0 0 1 4.06-5.06" />
      <path d="M9.9 4.24A10.93 10.93 0 0 1 12 4c6.5 0 10 7 10 7a18.6 18.6 0 0 1-2.16 3.19" />
      <path d="M14.12 14.12A3 3 0 0 1 9.88 9.88" />
      <line x1="2" y1="2" x2="22" y2="22" />
    </svg>
  );
}

function WhatsAppIcon() {
  return (
    <svg
      className="w-3.5 h-3.5 text-[#25D366]"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.71.306 1.263.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
    </svg>
  );
}
