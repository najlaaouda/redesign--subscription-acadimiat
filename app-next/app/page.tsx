import type { Metadata } from "next";
import { BrandSymbols } from "@/components/BrandSymbols";
import { Nav } from "@/components/Nav";
import { InfiniteGrid } from "@/components/InfiniteGrid";
import { Hero } from "@/components/Hero";
import { PricingProvider } from "@/components/PricingProvider";
import { BillingToggle } from "@/components/BillingToggle";
import { PricingCards } from "@/components/PricingCards";
import { CompareTable } from "@/components/CompareTable";
import { Addon } from "@/components/Addon";
import { Testimonials } from "@/components/Testimonials";
import { Faq } from "@/components/Faq";
import { Footer } from "@/components/Footer";
import { AuthModal } from "@/components/modals/AuthModal";
import { LoginModal } from "@/components/modals/LoginModal";

export const metadata: Metadata = {
  title: "الأسعار — أكاديميات | ابدأ أكاديميتك بـ $1 لأول شهر",
  description:
    "جرّب أكاديميات مجاناً 3 أيام، ادفع $1 للشهر الكامل. باقات مرنة للمدرّبين والمستشارين وصُنّاع المحتوى. 3 خطط: الانطلاقة، الاحترافية، المتقدمة.",
  alternates: { canonical: "/" },
  openGraph: {
    title: "الأسعار — أكاديميات | ابدأ أكاديميتك بـ $1 لأول شهر",
    description:
      "3 باقات مرنة + خدمات إضافية. تجربة مجانية 3 أيام بدون بطاقة بنكية.",
    url: "/",
  },
};

export default function HomePage() {
  return (
    <>
      <BrandSymbols />
      <Nav />

      {/* PricingProvider wraps everything that needs to react to the
          billing toggle (cards, compare-table sticky header, etc.) */}
      <PricingProvider>
        <div className="hero-pricing-wrap relative isolate overflow-hidden bg-white">
          <InfiniteGrid id="grid-pattern-base" />
          <Hero />
          <BillingToggle />
          <PricingCards />
        </div>

        <CompareTable />
      </PricingProvider>

      <Addon />
      <Testimonials />
      <Faq />
      <Footer />

      {/* Auth modals — mounted once at the page root. They listen for
          `auth:open-signup` / `auth:open-login` window events, so any
          component can trigger them via lib/auth-events helpers. */}
      <AuthModal />
      <LoginModal />
    </>
  );
}
