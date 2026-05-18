import type { Metadata } from "next";
import { BrandSymbols } from "@/components/BrandSymbols";
import { Nav } from "@/components/Nav";
import { InfiniteGrid } from "@/components/InfiniteGrid";
import { BookingFlow } from "./BookingFlow";

/* ════════════════════════════════════════════════════════════════
   Per-route SEO metadata. The root `metadata` in app/layout.tsx
   handles site-wide defaults (OG image, Twitter, robots, manifest);
   here we only override page-specific fields.
   ════════════════════════════════════════════════════════════════ */
export const metadata: Metadata = {
  title: "احجز موعداً — أكاديميات",
  description:
    "احجز موعداً مجانياً مع فريق المركز الوطني في أكاديميات لمناقشة احتياجات أكاديميتك التدريبية. اختر التاريخ والوقت الذي يناسبك.",
  alternates: { canonical: "/appointment" },
  openGraph: {
    title: "احجز موعداً — أكاديميات",
    description:
      "احجز موعداً مجانياً مع فريق المركز الوطني في أكاديميات لمناقشة احتياجات أكاديميتك التدريبية.",
    url: "/appointment",
  },
  twitter: {
    title: "احجز موعداً — أكاديميات",
    description:
      "احجز موعداً مجانياً مع فريق المركز الوطني في أكاديميات.",
  },
};

/* ════════════════════════════════════════════════════════════════
   JSON-LD — WebPage + BreadcrumbList + ReserveAction so search
   engines understand this is a bookable resource.
   ════════════════════════════════════════════════════════════════ */
const SITE_URL = "https://acadimiat.com";
const PAGE_URL = `${SITE_URL}/appointment`;

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebPage",
      "@id": `${PAGE_URL}#webpage`,
      url: PAGE_URL,
      name: "احجز موعداً — أكاديميات",
      description:
        "احجز موعداً مجانياً مع فريق المركز الوطني في أكاديميات لمناقشة احتياجات أكاديميتك التدريبية.",
      inLanguage: "ar-SA",
      isPartOf: { "@id": `${SITE_URL}/#website` },
      breadcrumb: { "@id": `${PAGE_URL}#breadcrumbs` },
    },
    {
      "@type": "BreadcrumbList",
      "@id": `${PAGE_URL}#breadcrumbs`,
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "الصفحة الرئيسية",
          item: `${SITE_URL}/`,
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "احجز موعداً",
          item: PAGE_URL,
        },
      ],
    },
    {
      "@type": "ReserveAction",
      target: PAGE_URL,
      result: {
        "@type": "Reservation",
        name: "موعد استشارة مع فريق المركز الوطني",
        provider: { "@id": `${SITE_URL}/#organization` },
      },
    },
  ],
};

export default function AppointmentPage() {
  return (
    <>
      <BrandSymbols />
      <Nav />

      {/* eslint-disable-next-line react/no-danger */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <main className="relative isolate overflow-hidden bg-white min-h-screen">
        <InfiniteGrid id="grid-pattern-appointment" />

        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 sm:pt-36 lg:pt-40 pb-16">
          <h1 className="text-center text-[32px] sm:text-[44px] lg:text-[54px] font-bold text-heading leading-[1.2] tracking-tight mb-4">
            احجز موعداً مع{" "}
            <span className="popular-text-gradient">فريق المبيعات</span>
          </h1>

          <p className="text-center text-h4 text-text-muted leading-relaxed max-w-2xl mx-auto mb-10 lg:mb-12">
            حدّد الموعد الذي يناسبك، وسيتواصل معك أحد خبرائنا في الموعد المحدّد
            لمناقشة متطلبات المركز الوطني.
          </p>

          <BookingFlow />
        </div>
      </main>
    </>
  );
}
