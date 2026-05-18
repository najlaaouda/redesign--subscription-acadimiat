"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { COUNTRIES, DEFAULT_COUNTRY, type Country } from "@/lib/countries";

type Step = 1 | 2 | 3;

const TITLES: Record<Step, string> = {
  1: "البيانات الشخصية",
  2: "بيانات الشركة",
  3: "كيف نخدمـك",
};

const baseInput =
  "w-full h-11 px-3.5 bg-white border-[1.5px] border-border rounded-[10px] text-sm font-medium text-heading transition focus:outline-none focus:border-primary focus:ring-[3px] focus:ring-primary/15";

const labelCls = "block text-[12.5px] font-semibold text-heading mb-1.5";
const hintCls = "text-text-muted font-normal ms-1.5";
const selectCls = `${baseInput} appearance-none bg-no-repeat cursor-pointer pe-3.5 ps-9`;

export function ContactForm() {
  const [step, setStep] = useState<Step>(1);
  const [submitted, setSubmitted] = useState(false);

  /* ─── Controlled state — needed so the Next button reacts to fills ─── */
  // Step 1 — personal info
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [country, setCountry] = useState<Country>(DEFAULT_COUNTRY);
  // Step 2 — company info
  const [companyName, setCompanyName] = useState("");
  const [website, setWebsite] = useState("");
  const [companySize, setCompanySize] = useState("");
  const [companyType, setCompanyType] = useState("");
  // Step 3 — needs (all optional)
  const [source, setSource] = useState("recommendation");
  const [needs, setNeeds] = useState("");

  /* ─── Per-step validity gates ─── */
  const phoneDigits = phone.replace(/\D/g, "");
  const step1Valid =
    firstName.trim().length >= 2 &&
    lastName.trim().length >= 2 &&
    email.trim().length >= 4 &&
    email.includes("@") &&
    phoneDigits.length === country.phoneLen;

  const step2Valid =
    companyName.trim().length >= 2 &&
    companySize !== "" &&
    companyType !== "";

  const step3Valid = true; // All step-3 fields are optional.

  const canProceed =
    step === 1 ? step1Valid : step === 2 ? step2Valid : step3Valid;

  function handleNext() {
    if (!canProceed) return;
    if (step < 3) {
      setStep((s) => (s + 1) as Step);
    } else {
      // Final submit — placeholder. Wire to /api/contact when backend lands.
      const payload = {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        phone: `${country.dial}${phoneDigits}`,
        companyName: companyName.trim(),
        website: website.trim(),
        companySize,
        companyType,
        source,
        needs: needs.trim(),
      };
      // eslint-disable-next-line no-console
      console.log("[B2B] Form submitted:", payload);
      setSubmitted(true);
      // No auto-reset — the success screen stays until the user navigates
      // away or clicks the home button. This mirrors /appointment's `done`
      // step where the confirmation is a destination, not a flash.
    }
  }

  const last = step === 3;

  /* ════════════════ Success screen ════════════════
     Mirrors /appointment's `done` step — green check icon + ring,
     confirmation heading, supporting copy, and a CTA back home.
     Shown after the final submit; replaces the form entirely. */
  if (submitted) {
    return (
      <div className="bg-white rounded-3xl shadow-[0_24px_64px_-12px_rgba(49,26,64,0.18)] p-6 sm:p-8 lg:p-10 max-w-2xl mx-auto">
        <div className="text-center py-6">
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
            تمّ إرسال طلبك
          </h2>
          <p className="text-h5 text-text-muted leading-relaxed max-w-md mx-auto mb-7">
            وصلنا طلبك بنجاح. سيتواصل معك أحد خبراء فريق المبيعات خلال يوم
            عمل واحد لتجهيز عرض مخصّص يناسب احتياجاتك.
          </p>
          <a
            href="/"
            className="inline-flex items-center justify-center bg-primary text-white text-h4 font-semibold px-7 py-3 rounded-xl hover:bg-primary-hover cursor-pointer transition btn-premium no-underline"
          >
            العودة إلى الصفحة الرئيسية
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl shadow-[0_24px_64px_-12px_rgba(49,26,64,0.18)] p-6 sm:p-8 lg:p-10 max-w-2xl mx-auto">
      {/* Card header — title aligns to the right (RTL start) on step 1
          (back button is omitted entirely on the first step so the title
          flush-aligns with the content beneath). */}
      <div className="flex items-center justify-between gap-4 mb-6 pb-5 border-b border-border">
        <div className="flex items-center gap-3">
          {step > 1 && (
            <button
              type="button"
              aria-label="رجوع"
              onClick={() => setStep((s) => (s - 1) as Step)}
              className="w-9 h-9 rounded-full border border-border hover:bg-primary-soft flex items-center justify-center text-heading transition cursor-pointer"
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
                  d="M9 6l6 6-6 6"
                />
              </svg>
            </button>
          )}
          <h2 className="text-h3 font-bold text-heading">{TITLES[step]}</h2>
        </div>

        {/* Step dots */}
        <div
          className="flex items-center gap-1.5"
          aria-label={`خطوة ${step} من 3`}
        >
          {[1, 2, 3].map((i) => (
            <span
              key={i}
              className="h-2 rounded-full transition-all"
              style={{
                width: i === step ? 24 : 8,
                backgroundColor:
                  i === step
                    ? "var(--color-primary)"
                    : i < step
                      ? "rgba(107,58,140,0.55)"
                      : "#E0DCE4",
              }}
            />
          ))}
        </div>
      </div>

      <form noValidate>
        {/* ════════════ STEP 1 — personal info ════════════ */}
        <div data-step="1" className={step === 1 ? "space-y-4" : "hidden"}>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="firstName" className={labelCls}>
                الاسم الأول
                <span className={hintCls}>(مطلوب إدخال الاسم الأول)</span>
              </label>
              <input
                id="firstName"
                name="firstName"
                type="text"
                autoComplete="given-name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className={baseInput}
              />
            </div>
            <div>
              <label htmlFor="lastName" className={labelCls}>
                الاسم الأخير
                <span className={hintCls}>(مطلوب إدخال الاسم الأخير)</span>
              </label>
              <input
                id="lastName"
                name="lastName"
                type="text"
                autoComplete="family-name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className={baseInput}
              />
            </div>
          </div>

          <div>
            <label htmlFor="email" className={labelCls}>
              البريد الإلكتروني
              <span className={hintCls}>(مطلوب إدخال البريد)</span>
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              dir="ltr"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={baseInput}
            />
          </div>

          <div>
            <label htmlFor="phone" className={labelCls}>
              رقم الموبايل
              <span className={hintCls}>(مطلوب إدخال رقم الموبايل)</span>
            </label>
            <PhoneFieldWithPicker
              id="phone"
              country={country}
              setCountry={setCountry}
              phone={phone}
              setPhone={setPhone}
            />
          </div>
        </div>

        {/* ════════════ STEP 2 — company info ════════════ */}
        <div data-step="2" className={step === 2 ? "space-y-4" : "hidden"}>
          <div>
            <label htmlFor="companyName" className={labelCls}>
              اسم الشركة
              <span className={hintCls}>(مطلوب إدخال اسم الشركة)</span>
            </label>
            <input
              id="companyName"
              name="companyName"
              type="text"
              autoComplete="organization"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className={baseInput}
            />
          </div>

          <div>
            <label htmlFor="website" className={labelCls}>
              الموقع الإلكتروني
            </label>
            <input
              id="website"
              name="website"
              type="url"
              dir="ltr"
              placeholder="https://"
              autoComplete="url"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              className={baseInput}
            />
          </div>

          <div>
            <label htmlFor="companySize" className={labelCls}>
              حجم الشركة
              <span className={hintCls}>(مطلوب إدخال حجم الشركة)</span>
            </label>
            <select
              id="companySize"
              name="companySize"
              value={companySize}
              onChange={(e) => setCompanySize(e.target.value)}
              className={selectCls}
            >
              <option value="" disabled>
                اختر حجم الشركة
              </option>
              <option value="1-10">1–10 موظفين</option>
              <option value="11-50">11–50 موظفاً</option>
              <option value="51-200">51–200 موظفاً</option>
              <option value="201-500">201–500 موظفاً</option>
              <option value="500+">أكثر من 500</option>
            </select>
          </div>

          <div>
            <label htmlFor="companyType" className={labelCls}>
              نوع الشركة
              <span className={hintCls}>(مطلوب إدخال نوع الشركة)</span>
            </label>
            <select
              id="companyType"
              name="companyType"
              value={companyType}
              onChange={(e) => setCompanyType(e.target.value)}
              className={selectCls}
            >
              <option value="" disabled>
                اختر نوع الشركة
              </option>
              <option value="education">مؤسّسة تعليمية</option>
              <option value="corporate">شركة قطاع خاص</option>
              <option value="government">جهة حكومية</option>
              <option value="ngo">منظّمة غير ربحية</option>
              <option value="other">أخرى</option>
            </select>
          </div>
        </div>

        {/* ════════════ STEP 3 — needs ════════════ */}
        <div data-step="3" className={step === 3 ? "space-y-4" : "hidden"}>
          <div>
            <label htmlFor="source" className={labelCls}>
              كيف سمعت عنا
            </label>
            <select
              id="source"
              name="source"
              value={source}
              onChange={(e) => setSource(e.target.value)}
              className={selectCls}
            >
              <option value="recommendation">توصية من أحد الأشخاص</option>
              <option value="search">محرّكات البحث</option>
              <option value="social">منصّات التواصل الاجتماعي</option>
              <option value="event">فعالية أو مؤتمر</option>
              <option value="ads">إعلانات</option>
              <option value="other">أخرى</option>
            </select>
          </div>
          <div>
            <label htmlFor="needs" className={labelCls}>
              أخبرنا عن احتياجاتك
            </label>
            <textarea
              id="needs"
              name="needs"
              rows={5}
              placeholder="عدد المتدربين، نوع الدورات، الميزات المطلوبة..."
              value={needs}
              onChange={(e) => setNeeds(e.target.value)}
              className={`${baseInput} h-auto min-h-[110px] py-2.5 resize-y`}
            />
          </div>
        </div>

        {/* Footer — submit aligned to the start (right in RTL); disabled
            until the current step's required fields are filled. */}
        <div className="flex items-center justify-start gap-3 mt-7 pt-5 border-t border-border">
          <button
            type="button"
            onClick={handleNext}
            disabled={!canProceed}
            className="btn-premium bg-primary text-white text-h4 font-medium px-7 h-12 rounded-xl hover:bg-primary-hover cursor-pointer transition inline-flex items-center gap-2 disabled:opacity-40 disabled:pointer-events-none"
          >
            <span>{last ? "إرسال الطلب" : "التالي"}</span>
            {!last && (
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                strokeWidth={2.4}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 18l-6-6 6-6"
                />
              </svg>
            )}
          </button>
        </div>

        <p className="text-[11px] text-text-muted/80 leading-relaxed pt-3 text-center">
          بإرسالك الطلب فأنت توافق على{" "}
          <a
            href="https://www.acadimiat.com/terms-and-condition"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary underline underline-offset-2 hover:text-primary-hover"
          >
            الشروط والأحكام
          </a>
          .
        </p>
      </form>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   Phone field with country picker — mirrors the pattern used in
   LoginModal / AuthModal's PhoneStep (Arabic-name search, dial code
   match, ISO match). Inline + self-contained.
   ════════════════════════════════════════════════════════════════ */
function PhoneFieldWithPicker({
  id,
  country,
  setCountry,
  phone,
  setPhone,
}: {
  id: string;
  country: Country;
  setCountry: (c: Country) => void;
  phone: string;
  setPhone: (v: string) => void;
}) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const [search, setSearch] = useState("");
  const pickerRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

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
    <div className="flex items-stretch gap-2" dir="ltr">
      <div ref={pickerRef} className="relative">
        <button
          type="button"
          onClick={() => setPickerOpen((v) => !v)}
          aria-haspopup="listbox"
          aria-expanded={pickerOpen}
          aria-label="اختر الدولة"
          className="inline-flex items-center gap-1.5 h-11 px-3 bg-primary-soft border-[1.5px] border-border rounded-[10px] text-[13.5px] font-semibold text-heading whitespace-nowrap cursor-pointer hover:bg-[#EAD9F2] transition"
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
        name="phone"
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
        className={`${baseInput} flex-1`}
      />
    </div>
  );
}
