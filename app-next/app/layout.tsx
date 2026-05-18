import type { Metadata, Viewport } from "next";
import { IBM_Plex_Sans_Arabic } from "next/font/google";
import "./globals.css";

/**
 * IBM Plex Sans Arabic — self-hosted via next/font for zero render-blocking
 * Google Fonts requests, automatic font-display:swap, and CLS-free swap.
 * Subset to "arabic" + "latin" so Latin fallback text (prices, USD symbol)
 * renders with consistent metrics.
 */
const plex = IBM_Plex_Sans_Arabic({
  variable: "--font-plex",
  subsets: ["arabic", "latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
  preload: true,
});

const SITE_URL = "https://acadimiat.com";
const SITE_NAME = "أكاديميات";
const SITE_DESCRIPTION =
  "منصّة سعودية متكاملة تساعد المدرّبين وصنّاع المحتوى والمستشارين على بناء أكاديمياتهم الرقمية، رفع دوراتهم، وبيع منتجاتهم. ابدأ بـ $1 لأول شهر.";

/* ════════════════════════════════════════════════════════════════
   SEO — comprehensive metadata for crawlers + social previews.
   ════════════════════════════════════════════════════════════════ */
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "أكاديميات — منصّتك التعليمية الكاملة | ابدأ بـ $1 لأول شهر",
    template: "%s | أكاديميات",
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  authors: [{ name: "Acadimiat" }],
  generator: "Next.js",
  keywords: [
    "أكاديميات",
    "منصة تعليمية",
    "دورات أونلاين",
    "بيع دورات",
    "LMS عربي",
    "Acadimiat",
    "online academy",
    "Arabic LMS",
    "course platform",
  ],
  referrer: "origin-when-cross-origin",
  creator: "Acadimiat",
  publisher: "Acadimiat",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: "/",
    languages: {
      "ar-SA": "/",
    },
  },
  openGraph: {
    type: "website",
    locale: "ar_SA",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: "أكاديميات — منصّتك التعليمية الكاملة",
    description: SITE_DESCRIPTION,
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "أكاديميات — منصّة الدورات والمنتجات الرقمية",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "أكاديميات — منصّتك التعليمية الكاملة",
    description: SITE_DESCRIPTION,
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-snippet": -1,
      "max-image-preview": "large",
      "max-video-preview": -1,
    },
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
  category: "education",
};

export const viewport: Viewport = {
  themeColor: "#6B3A8C",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  colorScheme: "light",
};

/* ════════════════════════════════════════════════════════════════
   JSON-LD — Organization schema for Knowledge Graph + rich results.
   ════════════════════════════════════════════════════════════════ */
const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: SITE_NAME,
  alternateName: "Acadimiat",
  url: SITE_URL,
  logo: `${SITE_URL}/icon.svg`,
  description: SITE_DESCRIPTION,
  contactPoint: {
    "@type": "ContactPoint",
    contactType: "sales",
    availableLanguage: ["Arabic", "English"],
    url: `${SITE_URL}/contact`,
  },
  sameAs: [
    "https://twitter.com/acadimiat",
    "https://www.linkedin.com/company/acadimiat",
    "https://www.instagram.com/acadimiat",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" className={plex.variable}>
      <head>
        {/* JSON-LD: Organization (Knowledge Graph hint) */}
        <script
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationJsonLd),
          }}
        />
      </head>
      <body className="font-sans bg-white text-heading antialiased">
        {children}
      </body>
    </html>
  );
}
