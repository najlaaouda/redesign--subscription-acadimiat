import Link from "next/link";

/**
 * Dark CTA Strip between FAQ and Footer.
 * Stats + a single white CTA that scrolls back to the pricing cards.
 */
export function CtaStrip() {
  return (
    <section className="bg-heading border-t border-white/10 py-14">
      <div className="max-w-container mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div className="text-white">
          <h2 className="text-[26px] sm:text-[32px] font-bold leading-tight mb-3">
            ابدأ أكاديميتك اليـوم
          </h2>
          <p className="text-h4 text-white/85 leading-relaxed">
            انضمّ إلى <span dir="ltr">+2K</span> مدرّب حقّقوا{" "}
            <span dir="ltr">+$250K</span> مع أكاديميات.
          </p>
        </div>
        <Link
          href="/#pricing-cards"
          className="inline-flex items-center justify-center bg-white text-heading text-h4 font-semibold px-7 py-3.5 rounded-xl btn-premium whitespace-nowrap"
        >
          اختر باقتك الآن
        </Link>
      </div>
    </section>
  );
}
