"use client";

import { useCountUp } from "@/hooks/useCountUp";
import { AcademyMarquee } from "@/components/AcademyMarquee";

function CountUpNumber({ to }: { to: number }) {
  const { ref, value } = useCountUp(to);
  return <span ref={ref}>{value}</span>;
}

/**
 * Testimonials — 3 count-up stats + Swiper marquee of 27 academy screenshots.
 * Wrapped in an outer `#F9F7FB` div so the 60px rounded corners reveal
 * the lavender add-on color instead of the page's white background.
 */
export function Testimonials() {
  return (
    <div style={{ background: "#F9F7FB" }}>
      <section
        id="testimonials"
        className="py-16 lg:py-20 overflow-hidden"
        style={{ background: "#F3F1EC", borderRadius: "60px" }}
      >
        <div className="max-w-container mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-center text-[28px] sm:text-[36px] text-heading font-bold leading-tight tracking-tight mb-10 lg:mb-12">
            مئات المواقع بُنيت مع أكاديميـــــــــات
          </h2>
          <div className="flex flex-wrap items-start justify-center gap-x-10 sm:gap-x-16 lg:gap-x-24 gap-y-8 mb-14 lg:mb-16">
            <Stat to={250} prefix="+$" suffix="K" label="إيرادات عملائنا" />
            <Stat to={500} prefix="+" label="أكاديمية مفعلة" />
            <Stat to={27} prefix="+" label="نجم ومؤثر اختار أكاديميات" />
          </div>
        </div>

        {/* Full-bleed marquee below the stats */}
        <AcademyMarquee />
      </section>
    </div>
  );
}

function Stat({
  to,
  prefix = "",
  suffix = "",
  label,
}: {
  to: number;
  prefix?: string;
  suffix?: string;
  label: string;
}) {
  return (
    <div className="text-center">
      <div className="text-[36px] sm:text-[42px] text-heading font-extrabold leading-none mb-3">
        <span dir="ltr">
          {prefix}
          <CountUpNumber to={to} />
          {suffix}
        </span>
      </div>
      <div className="text-h4 text-text-muted">{label}</div>
    </div>
  );
}
