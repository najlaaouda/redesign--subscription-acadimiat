import type { Metadata } from "next";
import { BrandSymbols } from "@/components/BrandSymbols";
import { Nav } from "@/components/Nav";
import { InfiniteGrid } from "@/components/InfiniteGrid";
import { ContactForm } from "@/components/ContactForm";

export const metadata: Metadata = {
  title: "تواصل معنا — أكاديميات",
  description:
    "تواصل مع فريق مبيعات أكاديميات لتجهيز عرض مخصّص يناسب احتياجات مؤسّستك التدريبية. ردّ خلال يوم عمل واحد.",
  alternates: { canonical: "/contact" },
  openGraph: {
    title: "تواصل معنا — أكاديميات",
    description:
      "احصل على عرض سعر مخصّص لمؤسّستك من فريق مبيعات أكاديميات.",
    url: "/contact",
  },
  twitter: {
    title: "تواصل معنا — أكاديميات",
    description:
      "احصل على عرض سعر مخصّص لمؤسّستك من فريق مبيعات أكاديميات.",
  },
};

/* JSON-LD — ContactPage + BreadcrumbList + ContactPoint so search engines
   index this as a sales-contact resource tied to the Organization. */
const SITE_URL = "https://acadimiat.com";
const PAGE_URL = `${SITE_URL}/contact`;
const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "ContactPage",
      "@id": `${PAGE_URL}#webpage`,
      url: PAGE_URL,
      name: "تواصل معنا — أكاديميات",
      description:
        "تواصل مع فريق مبيعات أكاديميات لتجهيز عرض مخصّص يناسب احتياجات مؤسّستك التدريبية.",
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
          name: "تواصل معنا",
          item: PAGE_URL,
        },
      ],
    },
    {
      "@type": "ContactPoint",
      contactType: "sales",
      availableLanguage: ["Arabic", "English"],
      url: PAGE_URL,
      areaServed: "SA",
    },
  ],
};

export default function ContactPage() {
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
        <InfiniteGrid id="grid-pattern-contact" />

        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 sm:pt-36 lg:pt-40 pb-16">
          <h1 className="text-center text-[32px] sm:text-[44px] lg:text-[54px] font-bold text-heading leading-[1.2] tracking-tight mb-4">
            حلول تدريب مرنة تناسب{" "}
            <span className="popular-text-gradient">الشركات والفرق الكبيرة</span>
          </h1>

          <p className="text-center text-h4 text-text-muted leading-relaxed max-w-2xl mx-auto mb-10 lg:mb-12">
            أخبرنا عن احتياجات مؤسّستك، وسيتواصل معك أحد خبرائنا خلال يوم عمل
            واحد لتجهيز عرض مخصّص يناسب حجم فريقك وأهدافك التدريبية.
          </p>

          <ContactForm />
        </div>
      </main>
    </>
  );
}
