import Link from "next/link";
import { SITE } from "@/lib/site";
import { NewsletterForm } from "@/components/NewsletterForm";

const APP_STORE_URL =
  "https://apps.apple.com/us/app/acadimiat-manager/id6755721500";
const PLAY_STORE_URL =
  "https://play.google.com/store/apps/details?id=com.elt.academyprovider2&hl=ar";

type FooterLink = {
  href: string;
  label: string;
  /** open in new tab */
  external?: boolean;
};

const cols: { title: string; links: FooterLink[] }[] = [
  {
    title: "الخدمـات",
    links: [
      { href: "https://www.acadimiat.com/all-features", label: "المميزات" },
    ],
  },
  {
    title: "الدعـم",
    links: [
      {
        href: "https://intercom.help/acadimiat/ar",
        label: "مركز المسـاعدة",
        external: true,
      },
      {
        href: "https://www.acadimiat.com/terms-and-condition",
        label: "الشروط والأحكام",
      },
      {
        href: "https://www.acadimiat.com/faq",
        label: "الأسئلة الشائعة",
      },
    ],
  },
  {
    title: "مصـادر أخرى",
    links: [
      {
        href: "https://www.acadimiat.com/contact-us",
        label: "تواصل معنا",
      },
      {
        href: "mailto:investors@acadimiat.com",
        label: "المستثمرون",
      },
      {
        href: "https://create.acadimiat.com/",
        label: "مجتمع أكاديميـات",
        external: true,
      },
    ],
  },
];

export function Footer() {
  return (
    <footer className="bg-heading text-white border-t border-white/10 pt-14 pb-10">
      <div className="max-w-container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top grid */}
        <div className="grid grid-cols-2 md:grid-cols-12 gap-8 mb-12">
          {/* Brand + apps */}
          <div className="col-span-2 md:col-span-3">
            <Link href="/" className="inline-flex items-center gap-2 mb-6" aria-label={SITE.name}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/assets/white%20logo.png"
                alt={SITE.name}
                className="h-10 w-auto"
                width={140}
                height={40}
              />
            </Link>

            {/* App store buttons */}
            <div className="flex flex-col gap-2.5 w-[160px]">
              {/* App Store */}
              <a
                href={APP_STORE_URL}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="تنزيل من App Store"
                className="flex items-center gap-2 border border-white/60 rounded-xl px-4 py-2 hover:bg-white/10 transition"
              >
                <svg
                  className="w-6 h-6 text-white shrink-0"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
                </svg>
                <span className="leading-tight text-left">
                  <span className="block text-[10px] text-white">تنزيل من</span>
                  <span className="block text-[13px] font-semibold text-white">
                    App Store
                  </span>
                </span>
              </a>

              {/* Google Play */}
              <a
                href={PLAY_STORE_URL}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="احصل عليه من Google Play"
                className="flex items-center gap-2 border border-white/60 rounded-xl px-4 py-2 hover:bg-white/10 transition"
              >
                <svg
                  className="w-6 h-6 shrink-0"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                >
                  <path
                    d="M3.5 20.5V3.5c0-.5.3-.95.77-1.17l9.66 9.67-9.66 9.67c-.47-.22-.77-.67-.77-1.17z"
                    fill="#00C3FF"
                  />
                  <path
                    d="M17.42 8.85l3.79 2.18c.84.49.84 1.45 0 1.94l-3.79 2.18-3.49-3.15 3.49-3.15z"
                    fill="#FFD500"
                  />
                  <path
                    d="M4.27 2.33c.18-.08.4-.1.6-.05L17.42 8.85l-3.49 3.15L4.27 2.33z"
                    fill="#00E676"
                  />
                  <path
                    d="M4.27 21.67L13.93 12l3.49 3.15L4.87 21.72c-.2.05-.42.03-.6-.05z"
                    fill="#FF3B30"
                  />
                </svg>
                <span className="leading-tight text-left">
                  <span className="block text-[10px] text-white">
                    احصل عليه من
                  </span>
                  <span className="block text-[13px] font-semibold text-white">
                    Google Play
                  </span>
                </span>
              </a>
            </div>
          </div>

          {/* Link columns */}
          {cols.map((col) => (
            <div key={col.title} className="md:col-span-2">
              <h4 className="text-h5 font-semibold mb-4 text-white">
                {col.title}
              </h4>
              <ul className="space-y-3 text-white/85 text-h5">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <a
                      href={l.href}
                      {...(l.external && {
                        target: "_blank",
                        rel: "noopener noreferrer",
                      })}
                      className="hover:text-white transition"
                    >
                      {l.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Newsletter */}
          <div className="col-span-2 md:col-span-3">
            <h4 className="text-h5 font-semibold mb-2 text-white">
              النشرة البريدية
            </h4>
            <p className="text-white/75 text-h5 mb-3 leading-relaxed">
              اشترك ليصلك كافة التحديثات أوّلاً بأوّل.
            </p>
            <NewsletterForm />
          </div>
        </div>

        {/* Bottom — legal */}
        <div className="pt-8 border-t border-white/10 text-white/65 text-h5 leading-relaxed">
          <p>
            مملوكة ومُدارة من قِبل شركة تكنولوجيا التعليم الإلكتروني ذ.م.م —
            البحرين. علامة تجارية مسجّلة لدى الهيئة السعودية للملكية الفكرية.
          </p>
          <p className="mt-2">
            © {new Date().getFullYear()} {SITE.name}. جميع الحقوق محفوظة.
          </p>
        </div>
      </div>
    </footer>
  );
}
