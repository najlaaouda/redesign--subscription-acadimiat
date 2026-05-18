/**
 * Hero — earnings badge + bilingual kashida headline + hand-drawn arrow.
 * Server-rendered (no client state) → indexable by Google immediately.
 */
export function Hero() {
  return (
    <section className="hero-section relative pt-16 sm:pt-20 lg:pt-24 pb-4 sm:pb-6 lg:pb-8">
      <div className="relative z-10 max-w-container mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Earnings badge */}
        <span className="inline-flex items-center gap-2 bg-[#F5F4F6] text-heading rounded-full px-4 py-1.5 text-h5 font-medium mb-6">
          <svg
            className="w-4 h-4 text-heading"
            fill="none"
            stroke="currentColor"
            strokeWidth={2.4}
            strokeLinecap="round"
            strokeLinejoin="round"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path d="M23 6l-9.5 9.5-5-5L1 18" />
            <path d="M17 6h6v6" />
          </svg>
          <span dir="ltr">+$250K</span> أرباح عملاء أكاديميات
        </span>

        {/* Headline — Arabic kashida ـ for elegant stretching */}
        <h1 className="text-[30px] sm:text-[42px] lg:text-[52px] font-bold leading-[1.4] tracking-tight mb-4 text-heading">
          <span className="block">
            ابدأ تجربــتــك مجــــانًا، ثم ادفــــــــع
          </span>
          <span className="block">
            <span className="popular-text-gradient">$1 لأول شهر</span>{" "}
            مع كامل المــيزات
          </span>
        </h1>
      </div>
    </section>
  );
}
