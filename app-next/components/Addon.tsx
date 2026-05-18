import Link from "next/link";

/**
 * Addon section — "المركز الوطني" enterprise upsell.
 *
 * Server Component: the CTA navigates to /appointment for the dedicated
 * booking flow (license gate → calendar → time → details → done) instead
 * of the older in-page BookingModal. The route is bookmarkable, indexable,
 * and SEO-friendly while keeping the same brand-color CTA styling.
 */
const FEATURES = [
  "استبانات لقياس مستوى رضا المستفيدين",
  "دعم اللغتين العربية والإنجليزية",
  "نظام تذاكر لاستقبال الشكاوى والمقترحات",
  "فصول افتراضية مدمجة داخل المنصة",
  "نظام التحقق الآمن من هوية المستخدمين",
  "نظام تتبع تقدم المتدربين ونسب الإنجاز",
  "أدوات لكشف الاقتباس ومنع الغش في التكليفات",
  "دعم تسهيلات الوصول لذوي الإعاقة",
  "إنشاء قوالب برامج تدريبية متنوعة",
];

const Check = () => (
  <svg
    width="20"
    height="20"
    className="w-5 h-5 text-primary mt-0.5 flex-shrink-0"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2.5}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M5 13l4 4L19 7" />
  </svg>
);

export function Addon() {
  return (
    <section id="enterprise-plans" className="py-14 lg:py-20 bg-white">
      <div className="max-w-container mx-auto px-4 sm:px-6 lg:px-8 space-y-6 lg:space-y-8">
        {/* Addon card — "إضافات" pill is absolute-positioned at top-right
            of the card so it sits above the border without affecting layout. */}
        <article className="relative bg-[#F9F7FB] border-[1.5px] border-primary rounded-[24px] p-7 lg:p-9 mt-4">
          <span className="absolute -top-3.5 right-8 inline-flex items-center bg-primary-soft text-primary text-h5 font-bold rounded-full px-5 py-1.5 z-10">
            إضافات
          </span>
          <div className="grid md:grid-cols-[1fr_1.25fr] gap-8 lg:gap-14 items-center">
            <div>
              <h3 className="text-[24px] font-medium text-heading leading-tight tracking-tight mb-2">
                المركز الوطني
              </h3>
              <p className="text-h4 text-black font-normal leading-relaxed mb-4">
                متاحة لمشتركي الباقات الأساسية (الانطلاقة، الاحترافية، المتقدمة)
              </p>
              <Link
                href="/appointment"
                className="inline-flex items-center justify-center bg-primary text-white text-h4 font-semibold px-7 py-3 rounded-xl hover:bg-primary-hover cursor-pointer transition btn-premium no-underline"
              >
                احجز موعداً
              </Link>
            </div>

            <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-7 gap-y-3.5 list-none p-0 m-0">
              {FEATURES.map((f) => (
                <li
                  key={f}
                  className="flex items-start gap-3 text-h5 text-heading"
                >
                  <Check />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
          </div>
        </article>

        {/* Tagline below the add-on */}
        <p className="text-center text-h4 text-heading leading-relaxed pt-2">
          أكاديميات تقدم حلولاً مخصصة للشركات.{" "}
          <Link
            href="/contact"
            className="inline-block font-semibold no-underline transition"
            style={{
              borderBottom: "2px solid #6B3A8C",
              paddingBottom: "1px",
            }}
          >
            <span className="popular-text-gradient">تواصل معنا</span>
          </Link>{" "}
          للحصول على عرض سعر حسب احتياجك.
        </p>
      </div>
    </section>
  );
}
