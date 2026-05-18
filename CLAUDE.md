# CLAUDE.md

Guide for Claude Code working on **أكاديميات (acadimiat.com)** — a Saudi SaaS pricing + B2B booking site (RTL Arabic, mobile-first, premium SaaS aesthetic inspired by Notion / Stripe / Thinkific). Target deployment: **Vercel**.

## Repo overview — two codebases

The repository is organised into **two clearly-separated codebases**:

1. **`app-next/`** — **the production Next.js 16 + React 19 + TypeScript + Tailwind v4 app**. **All new work happens here.** This is what gets deployed to Vercel.
2. **`legacy/`** — the **original static prototype, frozen as design reference**: `index.html`, `contact.html`, `appointment.html`, `styles.css`, `script.js`, plus the `assets/` and `fonts/` directories. Do not edit unless explicitly patching the legacy preview.

The repo root is intentionally minimal — only `CLAUDE.md`, `.gitignore`, and the two subdirectories above. This keeps the production root signal high and lets Vercel's "Root Directory: `app-next/`" setting deploy cleanly.

Day-to-day workflow:

```bash
cd app-next
npm install        # first time only
npm run dev        # → http://localhost:3000
npm run build      # production build (must pass before push)
npm run start      # serve the prod build
```

`npm run build` runs TypeScript check + emits static HTML for every route. Use it after any non-trivial change.

## Non-negotiables

These rules apply to **every** change. Re-read them before non-trivial edits.

1. **SEO first.** Default to **Server Components**; only opt into `"use client"` when a hook, state, or event handler genuinely requires it. Every route exports `metadata`. Structured content (FAQ, pricing offers, organization, reservations) gets a matching JSON-LD blob inline in the page.
2. **Speed first.** Bundle size, LCP, CLS, INP all matter. Use `next/font`, `next/image`, code-split client components, keep CSS small. Animations must respect `prefers-reduced-motion`. Lazy-load anything below the fold.
3. **RTL correctness.** `dir="rtl"` on `<html>`; use logical Tailwind utilities (`border-s` / `border-e` / `ms-*` / `me-*`) not `border-l` / `border-r`. Wrap LTR fragments (numbers, USD prices, phone numbers, URLs) in `<span dir="ltr">`.
4. **Type safety.** TypeScript strict mode. `npm run build` is the source of truth — don't ship code that doesn't pass it.
5. **Don't edit the legacy static site** unless explicitly asked. The Next.js port is canonical.

## Stack

| Layer | Choice |
|---|---|
| Framework | **Next.js 16** (App Router + Turbopack) |
| Language | **TypeScript 5** (strict) |
| UI | **React 19** (Server + Client components) |
| Styling | **Tailwind v4** (CSS-first config in `globals.css`'s `@theme`) |
| Font | **IBM Plex Sans Arabic** via `next/font/google` |
| Carousel | **Swiper v11** (npm) |
| Confetti | **canvas-confetti** (npm) — fires on the Thank-You step |
| Hosting target | **Vercel** |

## Directory map

```
app-next/
├── app/                              # App Router routes + global concerns
│   ├── layout.tsx                    # <html dir="rtl"> + metadata + Organization JSON-LD
│   ├── page.tsx                      # / — composes all sections, mounts AuthModal + LoginModal
│   ├── globals.css                   # Tailwind import + @theme tokens + custom CSS
│   ├── robots.ts                     # /robots.txt generator
│   ├── sitemap.ts                    # /sitemap.xml generator (root, /contact, /appointment)
│   ├── contact/page.tsx              # /contact — B2B Talk-to-Sales (3-step form)
│   └── appointment/                  # /appointment — booking flow with calendar + time + form
│       ├── page.tsx                  # Server Component: metadata + JSON-LD shell
│       └── BookingFlow.tsx           # Client Component: 5-step state machine
│
├── components/                       # All UI components
│   ├── Nav.tsx                       # Sticky white nav
│   ├── Hero.tsx                      # Hero headline (kashida) + earnings badge
│   ├── InfiniteGrid.tsx              # SVG grid backdrop, setTimeout-driven
│   ├── BillingToggle.tsx             # شهري/سنوي + arrow annotation
│   ├── PricingProvider.tsx           # Context: billing state
│   ├── PricingCards.tsx              # 3 plans + Product JSON-LD; CTAs → openSignup()
│   ├── CompareTable.tsx              # Toggle button → sticky header + 7 pill tabs
│   ├── Addon.tsx                     # المركز الوطني card; CTA → /appointment (Link)
│   ├── Testimonials.tsx              # 3 count-up stats + AcademyMarquee
│   ├── AcademyMarquee.tsx            # Swiper-powered 27-academy carousel
│   ├── Faq.tsx                       # Dark FAQ section + FAQPage JSON-LD
│   ├── Footer.tsx                    # 3 link columns + App Store / Play Store
│   ├── BrandSymbols.tsx              # Inline <svg> sprite (kept as fallback)
│   ├── NewsletterForm.tsx            # Footer email input
│   ├── ContactForm.tsx               # /contact 3-step form
│   ├── CountUpStat.tsx               # Reusable stat with count-up
│   └── modals/
│       ├── AuthModal.tsx             # Signup → … → Thank-You → Onboarding (8 steps)
│       ├── LoginModal.tsx            # Email/phone + Passkey-first login
│       └── BookingModal.tsx          # DEPRECATED — replaced by /appointment route
│
├── hooks/
│   ├── useCountUp.ts                 # 0→N animation tied to scroll-into-view
│   ├── useInfiniteGrid.ts            # setTimeout-based grid scroll
│   └── useGeoCurrency.ts             # IP-based currency (SAR for GCC, USD elsewhere)
│
├── lib/                              # Pure data + types (no JSX)
│   ├── site.ts                       # SITE constants
│   ├── plans.ts                      # PLANS[] + Plan/PlanId/Billing types
│   ├── compareTable.ts               # CATEGORIES[] for the 7-tab feature table
│   ├── faq.ts                        # 9 Q&A items for the FAQ section
│   ├── academies.ts                  # 27 academy {name,url,image} entries
│   ├── countries.ts                  # 18 Arab-world country picker entries
│   ├── auth-events.ts                # openSignup() / openLogin() window-event bus
│   ├── email-suggest.ts              # Levenshtein typo detector
│   └── calendar.ts                   # Booking-flow date utilities + Intl formatters
│
├── public/                           # Favicon, manifest, og-image, /assets/*
│   ├── icon.svg
│   ├── site.webmanifest
│   └── assets/                       # 27 academy screenshots + brand logos + card brands
│
├── tsconfig.json
├── postcss.config.mjs                # Just the @tailwindcss/postcss plugin
└── package.json                      # next, react, swiper, canvas-confetti
```

## Design tokens — `app/globals.css`

Tailwind v4 reads CSS variables under `@theme` directly. Tokens defined:

```css
@theme {
  --color-primary: #6B3A8C;
  --color-primary-hover: #5A2F77;
  --color-primary-soft: #F4EDF8;
  --color-secondary: #E056A7;
  --color-secondary-soft: #FDF0F7;
  --color-heading: #311A40;       /* dark headings + body text */
  --color-text-muted: #7C7282;
  --color-border: #DFDCE0;
  --color-success: #1F8A4C;
  --color-warning: #F2C94C;
  --color-error: #D23030;

  --text-h1 … --text-h5            /* matching the legacy h1..h5 scale */
  --container-container: 1200px;
  --font-sans: var(--font-plex), "29LT Bukra", system-ui, sans-serif;
}
```

`--font-plex` is injected by `next/font` (`IBM_Plex_Sans_Arabic` in `app/layout.tsx`). Adding a new color: drop `--color-<name>: …` under `@theme` and Tailwind autogenerates `bg-<name>` / `text-<name>` / `border-<name>` etc.

`globals.css` also contains custom CSS sections for:
- `.popular-text-gradient` — animated 2-color text gradient
- `.hero-bg` + `.grid-layer` — infinite-grid backdrop
- `.faq-item-dark` — chevron rotate-on-open via CSS only
- `.academy-marquee-wrap` + `.academy-swiper` + `.academy-card*` — Swiper marquee styling
- `.btn-premium` — color-only hover transition (no lift)
- **`/appointment` section** — `.appointment-notice`, `.calendar-day*`, `.calendar-nav-btn`, `.calendar-legend__swatch`, `.time-slots-list` / `.time-slot*`, `.appointment-summary__chip`, `.appt-input` (the 12h/24h `.time-format-toggle` was removed)
- **Compare-table tooltip** — `.cmp-tip`, `.cmp-tip__icon`, `.cmp-tip__bubble` (right-anchored in RTL, multi-line, z-60 over sticky tabs)
- **Segmented tab control** — `.login-method-tabs`, `.login-method-tab`, `.login-method-tab.is-active` — Stripe/Shopify pill polish (track: `#F2F2F4` + 1px `#E5E7EB` border + 14px radius; active pill: white + soft 2-layer shadow; hover micro-elevation; press scale 0.985; 220ms Material easing). Used by **both** LoginModal's identifier tabs AND the verify-step code/password tabs.

## Brand assets — logo PNGs

The visible brand mark is **always** sourced from `/public/assets/`, never inline SVG. Two variants:

| Asset | Used in | Notes |
|---|---|---|
| `assets/logo 1.png` | Nav (sticky white header), all auth modals | Light-bg variant. URL-encode the space: `src="/assets/logo%201.png"` |
| `assets/white logo.png` | Footer (dark `bg-heading` background) | White-on-transparent for contrast. URL-encode: `src="/assets/white%20logo.png"` |

Always include `width` + `height` attributes to lock the box and prevent CLS, and `alt="أكاديميات"` for a11y + SEO.

`BrandSymbols.tsx` (the inline `<svg>` sprite) is kept mounted in `app/page.tsx` and `app/contact/page.tsx` as a fallback (zero visual cost — `width=0 height=0`) so any stale `<use href="#acad-logo-mark"/>` still resolves. Don't add new consumers — use the PNGs.

## SEO foundations

1. **`app/layout.tsx`** — site-wide `metadata` (title template, description, OG, Twitter, robots, canonical, manifest, theme-color) + Organization JSON-LD in `<head>` via `dangerouslySetInnerHTML`.
2. **Per-route `export const metadata`** — every page (`app/page.tsx`, `app/contact/page.tsx`, `app/appointment/page.tsx`) overrides title/description/og:url/canonical.
3. **PricingCards** emits a **Product** JSON-LD with 3 plan offers.
4. **Faq** emits a **FAQPage** JSON-LD with all 9 Q&A.
5. **`/appointment/page.tsx`** emits a `@graph` with **WebPage** + **BreadcrumbList** + **ReserveAction** (signals to Google that this is a bookable resource).
6. **`app/robots.ts`** generates `/robots.txt` (allow `/`, deny `/api/` + `/_next/`, link sitemap).
7. **`app/sitemap.ts`** generates `/sitemap.xml` (currently `/`, `/contact`, `/appointment`).

When you add a new route, **always**: register it in `sitemap.ts`, give it `export const metadata` with a unique title + canonical, and consider whether any of its content warrants extra JSON-LD (Article, BreadcrumbList, Course, Event, …).

## Performance discipline

| Practice | How |
|---|---|
| **Server Components default** | Don't add `"use client"` unless you use a hook, state, event handler, or browser API. Every client component fragments the bundle. |
| **next/font** | All fonts go through `next/font/google` or `next/font/local`. Never `<link>` Google Fonts. |
| **next/image** | Static decorative images and logos use `next/image`. Card-brand logos inside lazy modals can use plain `<img>` with explicit width/height. |
| **Lazy modals** | All modals are client components mounted at page root but render `null` until opened — they don't ship interactive code into the initial paint. |
| **Reduced motion** | Every keyframe / setTimeout-driven animation checks `window.matchMedia("(prefers-reduced-motion: reduce)").matches` and bails out. |
| **`loading="lazy"`** | All below-the-fold `<img>` get this attribute. Above-the-fold (logo, hero) get `loading="eager"` + `fetchpriority="high"`. |
| **Code splitting** | Automatic via Next.js — each route + each client component graph becomes its own JS chunk. |
| **CSS budget** | Tailwind v4 tree-shakes unused utilities. The custom CSS in `globals.css` is < 500 lines. Don't add per-component CSS files. |
| **No layout shift** | Fixed dimensions on images, modals, badges; fonts use `display: swap` with metric-compat fallback (next/font handles this). |

## Routes

### `/` — Homepage (`app/page.tsx`)
Composes: `BrandSymbols` → `Nav` → `PricingProvider` (wraps hero, grid, toggle, cards) → `CompareTable` → `Addon` → `Testimonials` → `Faq` → `Footer`. Auth modals mounted at page root.

### `/contact` — B2B Talk-to-Sales (`app/contact/page.tsx`)

3-step contact form. Pattern: `BrandSymbols` → `Nav` → JSON-LD `@graph` (ContactPage + BreadcrumbList + ContactPoint) → `<main>` with `InfiniteGrid` + hero title + `<ContactForm />`. Per-route metadata override + Twitter card.

**`ContactForm.tsx`** is fully **controlled state** (11 fields) so the "التالي / إرسال الطلب" button reacts live to fills. Validation gates per step:

| Step | Title | Required fields |
|---|---|---|
| 1 | البيانات الشخصية | الاسم الأول، الاسم الأخير (≥2), البريد (≥4 + `@`), رقم الموبايل (= `country.phoneLen`) |
| 2 | بيانات الشركة | اسم الشركة (≥2), حجم الشركة, نوع الشركة |
| 3 | كيف نخدمـك | (all optional) |

**Field-hint pattern (replaces `*` markers)**: each required label has an inline gray hint like `(مطلوب إدخال الاسم الأول)` next to the field name — mirrors the same pattern used in `/appointment`'s form step and consistently across the project.

**Phone field**: uses an inline `PhoneFieldWithPicker` (Arabic-name / dial-code / ISO search, 18 countries from `lib/countries.ts`) — same pattern as Signup's `PhoneStep` and LoginModal's identifier input.

**Header**: back button only renders on steps ≥ 2 so the step-1 title flushes against the card's right edge (RTL start). Submit button is right-aligned (`justify-start` in RTL) and disabled until the active step's gate passes.

**Terms link**: a single sentence "بإرسالك الطلب فأنت توافق على [الشروط والأحكام]" — the link target is `https://www.acadimiat.com/terms-and-condition` (opens in a new tab).

**Success screen (after submit)** — mirrors `/appointment`'s `done` step exactly:
- green check icon (80×80, `bg-success/15 + ring-success/5 + text-success`)
- heading "تمّ إرسال طلبك"
- supporting copy + CTA "العودة إلى الصفحة الرئيسية" (→ `/`)
- **no auto-reset** — the success page is a destination, not a flash. The form does NOT come back unless the user re-navigates.

The submit handler logs the payload to console and flips `submitted = true`. When backend lands, replace `console.log("[B2B] Form submitted:", payload)` with `await fetch("/api/contact", { method: "POST", body: JSON.stringify(payload) })` and gate `setSubmitted(true)` on the response.

### `/appointment` — Booking flow (`app/appointment/page.tsx`)

Production booking page for the المركز الوطني add-on. Triggered by the "احجز موعداً" CTA in `Addon.tsx`.

**Page envelope** (Server Component): `BrandSymbols` → `Nav` → JSON-LD `@graph` → `<main>` with `InfiniteGrid` + hero title + `<BookingFlow />`.

**`BookingFlow.tsx`** (Client Component) is a **4-step state machine**:

```
date → time → form → done
```

| Step | Purpose |
|---|---|
| `date` | Full month calendar with prev/next nav, Sun–Thu available, Fri/Sat + past dates disabled. **Info notice above** ("يجب الحصول على تراخيص التدريب المهني والتقني قبل حجز الموعد") + legend swatch below |
| `time` | List of 30-min slots from 09:00 → 17:30, always in **24h** (no toggle). Selected slot expands inline with "التالي". Header shows back-button on the right + the selected long date (e.g. "الثلاثاء، 30 يونيو 2026") flushed to the left |
| `form` | Summary chips (date + time) + name (with hint "(مطلوب إدخال الاسم)") + email (with hint "(مطلوب إدخال البريد)") + topic ("الموضوع (اختياري)"). Submit button = **"تأكيد الموعد"**, right-aligned (`justify-start`), disabled until name (≥2) + email (≥4 + `@`) pass — same pattern as `/contact`'s gate |
| `done` | Success state — **green** check icon (`bg-success/15 + ring-success/5 + text-success`, same as AuthModal's Thank-You) + chosen date/time + return-home link |

**Calendar nav arrows are RTL-natural**: the "previous month" button points **right** (`M9 6l6 6-6 6`), "next month" points **left** (`M15 6l-6 6 6 6`) — past is on the right in RTL reading direction.

**Earlier license-gate step + 12h/24h toggle were removed** per spec. The notice text above the calendar is the only mention of the licensing requirement now.

**Date utilities** live in `lib/calendar.ts`:
- `atMidnight(d)`, `sameDay(a, b)`, `atMonthStart(y, m)`, `daysInMonth(y, m)`
- `buildMonthCells(year, month, today)` → 7-column cell list with `disabled` / `available` flags
- `buildTimeSlots()` + `formatSlot(slot, "12" | "24")` — single source for the 30-min cadence
- `monthLabelFmt`, `longDateFmt`, `shortDayFmt` — Intl formatters with **`ar-SA-u-ca-gregory-nu-latn`** (Arabic month names, Latin digits)
- `WEEKDAY_LABELS_AR` — `["الأحد", "الإثنين", …, "السبت"]` — rendered in source order Sun→Sat; RTL flips them visually so Sunday sits on the right.

**Saudi work week**: `isWorkDay()` returns `true` for `getDay()` in `[0..4]` (Sun–Thu); `[5, 6]` (Fri, Sat) are weekend. The same convention is used by the legacy site and the older `BookingModal.tsx`.

**The form submit is a placeholder** — it logs `console.info("[Appointment] scheduled:", payload)` then advances to `done` after 600ms. When the real backend lands, replace the inner block of `handleSubmit` with a `fetch("/api/booking", { method: "POST", body: JSON.stringify(payload) })` and gate `setStep("done")` on the response.

**Deprecation note**: `components/modals/BookingModal.tsx` covered an earlier in-page version of this flow (license + flat 20-weekday list + 8 hourly slots, no form step). It is no longer imported anywhere — the `Addon` CTA now uses `<Link href="/appointment">`. Safe to remove in a future cleanup.

## Pricing area — `PricingProvider` context

The billing toggle (شهري/سنوي) lives in **`PricingProvider`** so the toggle, the cards, and the compare-table sticky header all react together.

`PricingProvider` wraps the entire `.hero-pricing-wrap` section. Components inside call:

```ts
const { billing, setBilling } = usePricing();
```

`billing` is `"yearly" | "monthly"`. Default = `"yearly"` (matches legacy).

**Single source of truth for prices**: [`lib/plans.ts`](app-next/lib/plans.ts) — `PLANS[]` with `monthlyUsd`, `yearlyUsd`, `yearlyTotalUsd`, `features`. Edit a price here and every consumer (cards, sticky-header, AuthModal trial step, Product JSON-LD) updates.

### How prices render across the funnel

| Component | yearly | monthly |
|---|---|---|
| `PricingCards` (main grid) | `$yearlyUsd` shown, with "**$yearlyTotalUsd** تدفع سنويًا" pill below | `$monthlyUsd` shown — **no pill** |
| `CompareTable` sticky header | `$yearlyUsd / شهريًا` + small `$yearlyTotalUsd / سنويًا` line below | `$monthlyUsd / شهريًا` only |
| `AuthModal` Trial step radio cards | Yearly: big `$yearlyTotalUsd` + sub `/ سنويًا ($yearlyUsd / شهريًا)` | Monthly: big `$monthlyUsd` + sub `/ شهريًا` |
| `AuthModal` Payment renewal | `بقيمة $yearlyTotalUsd / سنويًا` | `بقيمة $monthlyUsd / شهريًا` |
| `AuthModal` Thank-You renewal | Without addon: `بسعر $X / سنويًا`. **With addon ON**: `بسعر $X + $99 بإجمالي $(X+99) / سنويًا` (sum is dynamic) | Same pattern monthly |

### Feature lists — `FeatureText` helper

`PricingCards.tsx` defines a `<FeatureText text={…} />` helper that splits each feature string on numeric runs (`/(\d[\d,]*)/`) and wraps each numeric chunk in a `<span className="font-medium" dir="ltr">`. This is what makes the leading **1**, **500**, **20**, **5**, **2,000**, **15,000**, etc. read as the salient data points across the cards.

Feature strings live in `lib/plans.ts` as plain `string[]`. The data shape is parallel across the 3 plans by design — see the inline comments in `lib/plans.ts` mapping each row of Starter ↔ Pro ↔ Advanced so users compare across cards visually.

## Modals — auth-events bus

Modals mounted once at the page root. They listen for **`window` events** to open themselves — no prop drilling, no React Context for open state.

Helpers in **[`lib/auth-events.ts`](app-next/lib/auth-events.ts)**:

```ts
openSignup(detail?: { plan?: PlanId })   // dispatches "auth:open-signup"
openLogin()                              // dispatches "auth:open-login"
```

The booking flow has its own dedicated route (`/appointment`) so it does **not** participate in this bus — there's no `openBooking` helper.

### AuthModal — 8-step state machine

Order:
```
signup → email-otp → phone → phone-otp → trial → payment → thankyou → onboarding
```

**Side paths**:
- **SSO** (Google/Apple in `signup`) skips `email-otp` → `phone`.
- **Payment "تخطى"** → jumps to `onboarding`.
- **Thank-You "لنجهّز منصتك"** → `onboarding`.
- **Onboarding "إنهاء" / "تخطي الكل"** → closes modal + clears persisted state.

The modal's **max-width is dynamic per step**:

| Step | `max-w` |
|---|---|
| signup / email-otp / phone / phone-otp | `lg` |
| thankyou | `md` |
| onboarding | `2xl` |
| trial / payment | `4xl` |

Smooth `transition-[max-width] duration-300` between steps. **Overflow rule**: card has `overflow-hidden` only for trial/payment (sub-sections need clipped corners); other steps use `overflow-visible` so dropdowns / suggestions can extend past the card.

#### Signup — email field

`EmailFieldWithSuggest` combines:

1. **Gmail-style inline ghost completion** — typing `ali@g` shows `ali@g`**`mail.com`** as ghost; Tab or ArrowRight (at end) accepts. Domains checked in priority order: `gmail.com`, `hotmail.com`, `icloud.com`, `yahoo.com`, `live.com`, `outlook.com`.
2. **Levenshtein typo suggestion** — fallback if user typed `gamil.com`. `lib/email-suggest.ts`'s `suggestEmailFix()` checks against 10 domains; distance 1–2 → `هل تقصد user@gmail.com؟` below the field.
3. **`error` prop** — paints the field border red for already-registered emails.

**Already-registered** — `isEmailRegistered()` against a hard-coded `REGISTERED_EMAILS` Set. Triggers red border + `هذا البريد مسجّل مسبقاً. سجّل دخول` (the link closes signup and `openLogin()`). When the backend lands, swap the Set for `POST /auth/check-email`.

#### OTP step

- 6 square inputs — **56×56px desktop, 44×44px mobile**.
- `autoFocus={i === 0}` on the first box.
- Auto-advance on type, Backspace navigates back, paste of 6 digits distributes across boxes.
- Auto-submit fires 350ms after the 6th digit lands.
- 45-second resend countdown, then "إعادة الإرسال" appears.
- `autoComplete="one-time-code"` for native SMS autofill.

**Error state** — `verify(code)` returns `false` for magic code `"000000"`. Triggers red borders, `<p role="alert">تأكد من الأرقام المُدخَلة</p>`, focus jumps back to the first box. Any keystroke clears the error.

#### Phone step

Country chip opens a dropdown listbox with:
- Search field (auto-focused) matching against Arabic name, dial code, ISO code.
- Scrollable list of 18 Arab-world countries from [`lib/countries.ts`](app-next/lib/countries.ts).
- "لا توجد نتائج" empty state.

Each country carries `phoneLen` + `placeholder`. Submit button enables when `digits.length === country.phoneLen`. **`isPhoneRegistered()`** mirrors the email path.

#### Payment step

- **Card-brand auto-detection** — `detectBrand()` returns `"visa"|"mastercard"|"amex"|"mada"|null` with **Mada BINs checked first** so Mada cards aren't miscategorised.
- **Brand-aware formatting** — AmEx 15 digits chunked 4-6-5; others 16 digits chunked 4-4-4-4. `cardMaxLength(brand)` = 17 (AmEx) or 19 (others) including spaces.
- **Brand-aware CVV** — 4 digits for AmEx, 3 otherwise.
- **Expiry** — `formatExpiry()` clamps month 01–12, auto-pads single digit > 1.
- **No validation blocks submit** — "ابدأ تجربتك بـ $1" always proceeds. Shape only (digits, lengths), no Luhn / real-card guarantee.
- $99 add-on row at the bottom (cream gradient bg). Checkbox + label + price + "الأماكن محدودة: 10–15 عميل أسبوعياً" caveat.
- Renewal disclosure text dynamically shows the right amount + cadence based on `billing`.
- `autoComplete` wires to native saved-card flow: `cc-number`, `cc-exp`, `cc-csc`.

#### Onboarding step

3-screen questionnaire (terminal — pressing "إنهاء" / "تخطي الكل" closes modal + clears persisted state):

- **Screen 1** (mandatory): goal chips (multi, default `share-knowledge`) + academy-name input (required, `length >= 2`).
- **Screen 2** (optional): specialization chips (single, 6) + audience-size chips (single, 5).
- **Screen 3** (optional): first-30-day goal (single, 5) + current platform (single, 8 including Mazn, Udemy, Teachable, Kajabi, YouTube, WordPress).

Progress bar: 3 segments; segment `i` is `bg-primary` when `i ≤ screen`. `aria-current="step"` on active.

**Chip components**:
- `ChipMulti` — `+` unselected, `✓` selected. `aria-pressed`.
- `ChipSingle` — no icon unselected, `✓` selected. `role="radio"` + `aria-checked`.

Both share visual styling: `bg-white text-heading border-[#DFDCE0]` at rest, `bg-heading text-white border-heading` when selected.

The onboarding card is `max-w-2xl`. Earlier iterations layered a Shopify-style "stacked-cards" decoration behind it (two pseudo paper sheets peeking from the side); this was **removed** because the visible edges and borders were creating noise around the text. The card now uses just the standard modal shadow.

#### Thank-You step

`canvas-confetti` fires 3 bursts on mount (positions 20%/40%, 50%/35%, 80%/40%), then 2 more after 350ms. Brand palette `#6B3A8C`, `#E056A7`, `#F2C94C`, `#1F8A4C`. Skipped on `prefers-reduced-motion`. Button label = "لنجهّز منصتك" → navigates to `onboarding`.

### LoginModal — multi-step, tabbed

The Login modal is a small state machine of its own (separate from AuthModal's bus):

```
identify ─── tab=email ─→ email-verify
        └── tab=phone ─→ phone-otp (WhatsApp)
```

**Step `identify`**:
- logo + "أهلًا بعودتك"
- 3-button SSO row: Google + Apple + **Passkey** (always visible — don't hide based on `isUserVerifyingPlatformAuthenticatorAvailable()`, detection is unreliable)
- `<Divider>أو متابعة التسجيل</Divider>`
- **Segmented pill tab strip** with two tabs: `الدخول بالبريد الإلكتروني` (default active) ↔ `الدخول برقم الهاتف`. Uses the shared `.login-method-tabs` / `.login-method-tab` styles.
- Email tab → `<EmailFieldWithSuggest>` (Gmail-style inline ghost completion, same as Signup)
- Phone tab → `<PhoneInputWithPicker>` (Arabic-name / dial-code / ISO search, 18 countries) — **auto-focuses the input on tab switch**
- "تسجيل الدخول" CTA → calls `isEmailRegistered()` / `isPhoneRegistered()` (`lib/email-suggest.ts`). If NOT registered, paints the field red and shows `البريد المدخل غير مسجل.` / `رقم الهاتف المدخل غير مسجل.` with a one-click `إنشاء حساب جديد` link.
- "ليس لديك حساب؟ إنشاء حساب جديد" → switches to Signup
- **Help link** → `هل بحاجة لمساعدة؟` (primary color, hover primary-hover) opens `https://intercom.help/acadimiat/ar` in a new tab. **The WhatsApp icon + "تواصل معنا" were removed** — single clean help link routes to Intercom.

**Step `email-verify`** (email path): re-uses `OtpStep` from AuthModal, but with a `tabsSlot` prop that renders **another segmented tab strip** under the title:
- `الدخول بكود التحقّق` (default) → 6-digit OTP boxes (auto-advance, paste, 45s resend, magic code `"000000"` for error)
- `الدخول بكلمة المرور` → custom `PasswordPanel` with an `<input type="password">` field, a **show/hide eye icon** (`EyeIcon`/`EyeOffIcon` swap on click, sits at `inset-inline-end` so it's on the LEFT in RTL), `هل نسيت كلمة المرور؟` link directly under the field, and "تسجيل الدخول" CTA.

**Step `phone-otp`** (phone path): re-uses `OtpStep` with `subtitle` prop showing a small "🟢 عبر واتساب" badge under the channel info. No password tab.

Each step's back button returns to `identify`. Final success closes the modal. **Re-uses from AuthModal** (now exported): `EmailFieldWithSuggest`, `OtpStep` (with new optional `tabsSlot` + `subtitle` props), `BackChip`, `Divider`, `GoogleIcon`, `AppleIcon`.

### localStorage persistence — `acad_auth_state`

Auth state is persisted under key **`acad_auth_state`** with a 24-hour TTL. Persisted shape:

```ts
interface PersistedState {
  step: Step;
  email: string;
  phone: string;
  countryCode: string;        // ISO code so we restore the right Country
  billing: "yearly" | "monthly";
  addonOn: boolean;
  selectedPlan: PlanId;
  timestamp: number;
}
```

- **Save** — `useEffect` watches all states and writes JSON on every change.
- **Restore** — `auth:open-signup` event handler reads, validates TTL, `setState`s each value. `detail.plan` overrides persisted `selectedPlan`.
- **Clear** — only on explicit completion (`OnboardingStep` "إنهاء" / "تخطي الكل"). Closing with X / Escape / backdrop does NOT clear (resume next visit).

## Animations

| Animation | Where | How |
|---|---|---|
| Infinite grid backdrop | `InfiniteGrid` + `useInfiniteGrid` | `setTimeout(16)` updates `<pattern x= y=>` 0.5px/frame |
| Count-up stats | `useCountUp` | `setTimeout(16)` 0 → target with ease-out cubic |
| Academy marquee | `AcademyMarquee` | Swiper.js `loop + freeMode + speed:5000 + autoplay delay:0` |
| Animated gradient text | `.popular-text-gradient` | `background-clip:text` + 3s linear `popular-text-shift` |
| Modal card-in | inline `animate-` classes | Translate-Y fade-in |
| Thank-You confetti | `canvas-confetti` | 5 bursts, brand palette, reduced-motion safe |

**Why `setTimeout` instead of `requestAnimationFrame`**: rAF is throttled to 0 inside the MCP preview's headless browser. `setTimeout(16)` runs reliably everywhere. Keep this pattern for any per-frame animation.

## Academy marquee — Swiper

[`components/AcademyMarquee.tsx`](app-next/components/AcademyMarquee.tsx) instantiates Swiper in `useEffect`. Config:

```ts
{
  modules: [Autoplay, FreeMode],
  loop: true,
  loopAdditionalSlides: 5,
  slidesPerView: "auto",
  spaceBetween: 24,
  freeMode: true,
  speed: 5000,
  autoplay: { delay: 0, disableOnInteraction: false, pauseOnMouseEnter: true },
}
```

The combination `freeMode + delay:0 + speed:5000` produces a true continuous marquee (alternative configs snap card-by-card). CSS overrides default easing: `.academy-swiper .swiper-wrapper { transition-timing-function: linear !important; }`.

Each card = browser-mockup chrome (3 traffic-light dots + LTR host URL) + a 230px-tall screenshot. Data in **[`lib/academies.ts`](app-next/lib/academies.ts)** — 27 entries `{ name, url, image }`. Arabic image filenames work because we `encodeURIComponent(a.image)` at the `<img src>` site.

Mask: `.academy-swiper` has a horizontal `mask-image: linear-gradient(to left, transparent 0, #000 5%, #000 95%, transparent 100%)` so cards fade in/out at viewport edges. Hover lift: `.academy-card:hover { transform: translateY(-8px); }` (an exception to the color-only hover policy — this is a card treatment, not a button).

When adding a new academy: drop the screenshot into `public/assets/` and append an entry to the array.

## Compare table — toggle + sticky header + tabs

`CompareTable.tsx` is **collapsed by default** behind a **large prominent pill button** "مقارنة الخطــــط" (primary-soft bg + primary text + soft purple shadow, `text-[18px] font-semibold`, padding-x 40px so it reads as the section's primary CTA). Clicking it expands the table.

Once expanded, the table is wrapped in a **single sticky cluster** (`sticky top-20 z-30 bg-white border-b shadow-[0_4px_12px_-8px_rgba(49,26,64,0.12)]`) holding **both** the plan-column header and the 7 category-tabs row. They scroll together as one block so the user never loses the active column or the chosen tab.

1. **Plan header** — 4-column grid with plan name + reactive price + CTA. Price flips when `usePricing().billing` changes.
2. **7 pill tabs** — `رسوم وعمولات` (default), `المحتوى`, `الحسابات`, `مميزات المنصة`, `التدريب التفاعلي`, `التسويق والمبيعات`, `بوابة الدفع`. Active tab uses brand-purple; idle tabs `bg-[#F5F4F6]` with `hover:bg-primary-soft hover:text-primary`.
3. **Table body** — rows from `CATEGORIES[activeCat].rows` in [`lib/compareTable.ts`](app-next/lib/compareTable.ts). Cell values are `true` (✓), `false` (✕), or a string.

The table wrapper uses `overflow-visible` (NOT `overflow-x-auto`). Browsers force `overflow-y: auto` whenever `overflow-x` is non-visible, which would clip the tooltip bubble vertically — `overflow-visible` lets the bubble bleed above the row. The table is `w-full` with percent column widths, so it never horizontally overflows anyway.

Table text color is `#000` (true black) with `th[scope=row]` at `font-weight: 500`. Pro column has **no** featured highlight.

**Commission rates** (`رسوم وعمولات` tab): `10% + $1` / `5% + $1` / `بدون عمولة` for starter/pro/advanced.

### Info tooltips on feature labels — `.cmp-tip`

Rows in `lib/compareTable.ts` can carry an optional `tooltip?: string`. When present, the JSX renders a `<span class="cmp-tip">` with a small ⓘ SVG icon next to the label.

The bubble is **CSS-only, no `title=` attribute** — appears INSTANTLY on hover/focus without the browser's native ~500ms delay. Positioning:
- Right-anchored in RTL (`inset-inline-end: -8px`) so the bubble extends LEFT from the icon — never spills past the right viewport edge on rows where the icon sits near the right margin.
- `bottom: calc(100% + 8px)` — sits above the icon. Small CSS arrow at the bubble's end edge points down.
- Multi-line: `white-space: normal; width: max-content; max-width: 320px; min-width: 220px` — wraps long Sheet3 descriptions.
- Z-index **60** on the bubble, beats the sticky-tabs cluster's z-30. The `.cmp-tip` element itself has NO z-index (no stacking context) so the icon stays in the row's natural flow — when scrolling, the icon hides behind the sticky tabs (doesn't bleed through).

Currently 5 rows from **Sheet3** carry tooltips: `نظام محادثة للاستشارات`, `إسناد دورات`, `مجتمع أكاديميات الخاص`, `إطلاق سريع للمنصة`, `الأنشطة التفاعلية` — plus the legacy 3 in the fees tab (`عمولة أكاديميات`, `بوابة دفع أكاديميات`, `طلبات سحب الأرباح`).

## Footer — external links

3 link columns + Newsletter on the left. Each link has an optional `external: true` flag flipping it to `target="_blank" rel="noopener noreferrer"`.

Current links:
- **App Store** → `apps.apple.com/.../id6755721500` (new tab)
- **Google Play** → `play.google.com/.../com.elt.academyprovider2` (new tab)
- **الخدمات → المميزات** → `acadimiat.com/all-features`
- **الدعم → مركز المساعدة** → `intercom.help/acadimiat/ar` (new tab)
- **الدعم → الشروط والأحكام** → `acadimiat.com/terms-and-condition`
- **الدعم → الأسئلة الشائعة** → `acadimiat.com/faq`
- **مصادر → تواصل معنا** → `acadimiat.com/contact-us`
- **مصادر → المستثمرون** → `mailto:investors@acadimiat.com`
- **مصادر → مجتمع أكاديميات** → `create.acadimiat.com/` (new tab)
- **Social** — Facebook, Instagram, X, LinkedIn, Threads (each `target="_blank"`)

## Nav — sticky white

`Nav.tsx` is `sticky top-0 z-40` with solid white bg + thin bottom border. Hero's top padding (`pt-16 sm:pt-20 lg:pt-24`) accounts for the nav.

Links: **المميزات** (external) | **الأسعار** (current page) | **مركز المساعدة** (external, new tab).

CTAs: "ابدأ تجربتك المجانية" → `openSignup({ plan: "advanced" })`. "دخول" → `openLogin()`.

## RTL conventions

- `<html lang="ar" dir="rtl">` in `app/layout.tsx`.
- **Logical** Tailwind utilities (`border-s` / `border-e` / `ms-*` / `me-*`) — not `border-l` / `border-r`.
- Numbers and Latin must NOT bidi-flip → wrap in `<span dir="ltr">` (prices, phone, USD amounts, URLs, time slots).
- Phone input fields use `dir="ltr"` directly so country code + number read naturally.
- CSS: prefer `inset-inline-start` / `-end` over `left` / `right`.

## Kashida convention (`ـ` U+0640)

Tatweel is used selectively for elegant Arabic typographic stretching. **Insert only between connecting letters** — never after non-connectors (ر، د، ز، و، ا).

Examples in the codebase:
- Hero: `ابدأ تجربــتــك مجــــانًا، ثم ادفــــــــع` + `مع كامل المــيزات`
- FAQ heading: `الأســـــــئلة الشــــــائعة`
- Compare-table heading: `مقارنة الخطــــط`
- Testimonials: `مئات المواقع بُنيت مع أكاديميـــــــــات`

Add sparingly; don't strip existing ones when reformatting.

## Button hover policy

**Color-only hover** — no transform, no shadow, no lift, no scale. Just `filter: brightness(0.96)` on hover, `0.92` on active. The `.btn-premium` class wires transition timing.

Every new clickable element should:
- Have **`cursor-pointer`** explicitly (Tailwind v4 doesn't auto-add it to `<button>`).
- Use one of the established hover patterns:
  - Filled primary: `bg-primary text-white hover:bg-primary-hover`
  - Outline / alt: `bg-white text-heading border ... hover:bg-primary hover:text-white hover:border-primary`
  - Pill / tab: `hover:bg-primary-soft hover:text-primary`

**Exception**: academy cards in the marquee lift on hover (`translateY(-8px)`) — that's a card treatment, not a button.

## Currency — `useGeoCurrency` + Saudi Riyal

[`hooks/useGeoCurrency.ts`](app-next/hooks/useGeoCurrency.ts) hits `https://ipapi.co/country/` once, caches in `localStorage` (`acad_country`), maps GCC + Arab countries → `SAR`, everything else → `USD`. SSR default = `USD`.

**Not yet wired into `PricingCards`** — when prices go bilingual, call `useGeoCurrency()` and switch `yearlyUsd` → `yearlySar`.

**Saudi Riyal symbol** — use the **new SAMA 2024 mark** (Unicode U+20C1) via `@emran-alhaddad/saudi-riyal-font`:

```html
<span class="sar-icon icon-saudi_riyal_new" aria-label="ريال سعودي"></span>
```

**Don't use `﷼` (U+FDFC, legacy)**. Negative `margin-inline-start` keeps the symbol tight against digits.

## Deployment — Vercel

1. `vercel` CLI or import the GitHub repo at vercel.com.
2. **Build command**: default (`next build`).
3. **Output directory**: default (`.next`).
4. **Install command**: `npm install`.
5. **Root directory**: `app-next` (NOT the repo root — that's the legacy static site).
6. Environment vars: none for the current feature set. (When auth becomes real, add `NEXT_PUBLIC_API_URL`, etc.)
7. Custom domain: add `acadimiat.com` in Project → Settings → Domains.

Vercel auto-detects Next.js and enables image optimization, edge cache, and (free tier) the `geo` headers for future server-side currency detection.

## Gotchas — things that have bitten us

- **Tailwind v4 has no `tailwind.config.js`**. Add tokens inside `@theme` in `globals.css`. The Tailwind 3-style config file from old tutorials WILL NOT WORK here.
- **Tailwind v4 + Turbopack** can occasionally lose styles after editing `globals.css` if HMR bugs out. Restart `npm run dev` if styles disappear post-edit.
- **Don't run `npm run build` while `npm run dev` is running** — they share the `.next/` directory and the concurrent writes corrupt Turbopack's worker state, making every route return `500 Internal Server Error`. Recovery: kill the dev server, restart it. (Diff: TS-check-only is fine — but `next build` writes artifacts.)
- **`color-mix()` + Turbopack PostCSS** — occasional parser timeouts. If you hit a Turbopack panic about `parse_css failed`, replace `color-mix(in srgb, var(--color-primary) X%, transparent)` with a literal `rgba(107, 58, 140, 0.X)`.
- **Swiper v11 types** live under `swiper/types`, not the root. Import as `import type { SwiperOptions } from "swiper/types"`.
- **Headless Chrome (MCP preview) limitations**:
  - `requestAnimationFrame` throttled to 0 → use `setTimeout(16)` for per-frame animation.
  - `IntersectionObserver` callbacks don't fire reliably → use scroll listeners with `getBoundingClientRect`.
  - `preview_screenshot` times out on pages with full-screen `backdrop-blur` → use `preview_inspect` + `preview_snapshot` to verify modal state.
  - Platform-authenticator detection always returns `false` → never base UI visibility on it (the Passkey button stays visible).
- **Arabic filenames in `public/assets/`** must go through `encodeURIComponent()` when used as `<img src>`.
- **Server Components can't use hooks / state / event handlers**. Add `"use client"` only to the component (and its children) that actually need interactivity. Bubble client boundaries as low in the tree as possible to keep bundles small.
- **Don't re-add `<CtaStrip>`** — the standalone "ابدأ أكاديميتك" CTA under the FAQ was intentionally removed.
- **JSX `role` attribute** is typed as `AriaRole | undefined`, not `string`. If you accept a `role` prop, type it as `AriaRole`.
- **The legacy `index.html` linter** rewrites formatting after edits. Re-read before the next edit.

## Legacy static site (frozen reference)

`index.html` + `styles.css` + `script.js` + `appointment.html` + `contact.html` at the repo root form the **original static prototype**. All design decisions (palette, typography, kashida placement, button hover policy, RTL conventions) were prototyped here first and then ported to `app-next/`. Treat the static site as design source-of-truth — but **don't edit it** unless explicitly patching the legacy preview.

Key files:
- `index.html` — homepage (Tailwind via CDN, inline `<script>` config, Readex Pro font from Google Fonts).
- `contact.html` — B2B contact page (3-step form).
- `appointment.html` — booking page (license gate + month calendar + time + form + done) — earlier static design that's now ported to `/appointment` in `app-next/`.
- `styles.css` — CSS variables at `:root` + custom CSS layered on Tailwind preflight.
- `script.js` — one IIFE, vanilla JS, no dependencies except Swiper CDN global. State (`state.billing`, `state.currency`) persists in `localStorage` (`acad_billing` / `acad_currency`). Default = `yearly` + `USD`.

**Legacy preview** (only when you really need it):
```bash
npx --yes serve .       # from the repo root
# → http://localhost:3000 (or whatever serve picks)
```

`.claude/launch.json` configures `pricing-preview` with `autoPort: true` so a busy port falls back to a free one.

**Legacy specifics you might run into**:
- Prices live in **two places** (data attributes on `.price-amount` spans + `PLANS` object in `script.js`). Yearly USD: starter $23, pro $29, advanced $99. Monthly USD: starter $29, pro $39, advanced $129. Yearly totals: starter $276, pro $348, advanced $1,188.
- Modal open/close uses `body.modal-open` for scroll lock. `allModalsClosed()` releases it.
- Date formatting uses `Intl.DateTimeFormat('ar-SA-u-ca-gregory-nu-latn', …)` — same convention as the Next.js port. Don't drop `-nu-latn`.
- `script.js` `initInfiniteGrid`, `initCountUp`, `initAcademyMarquee`, `initCompareTabs`, `initCompareToggle` cover the same animations as the Next.js components.

**Legacy gotchas** (preview-only):
- The `serve` CLI caches aggressively. After a CSS / JS change: `preview_eval('location.replace(location.pathname + "?bust=" + Date.now())')`.
- Tailwind CDN preflight injects rules AFTER `styles.css` → some single-class CSS loses specificity. Use a parent selector to win.

## Strategic plan

The full product strategy lives at `C:\Users\pc\.claude\plans\rosy-meandering-snail.md`. Read it before making product-level changes (pricing values, trial length, copy direction). When in doubt, the live code wins, but check the plan for rationale.
