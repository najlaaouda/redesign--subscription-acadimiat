"use client";

import Link from "next/link";
import { useState } from "react";
import { openLogin, openSignup } from "@/lib/auth-events";

/**
 * Top nav — solid white background, 3 main links:
 *   - المميزات   → external (same tab)
 *   - الأسعار    → / (current page)
 *   - مركز المساعدة → external (new tab, intercom)
 *
 * Logo on the right (RTL start), CTAs on the left.
 */
export function Nav() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 left-0 right-0 z-40 bg-white border-b border-border/60 shadow-[0_1px_0_rgba(0,0,0,0.02)]">
      <div className="max-w-container mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
        {/* Brand */}
        <Link
          href="/"
          className="flex items-center gap-2 group flex-shrink-0"
          aria-label="أكاديميات"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/assets/logo%201.png"
            alt="أكاديميات"
            className="h-9 w-auto transition"
            width={120}
            height={36}
          />
        </Link>

        {/* Centered nav (desktop) */}
        <nav
          className="hidden lg:flex items-center gap-1"
          aria-label="القائمة الرئيسية"
        >
          <a
            href="https://www.acadimiat.com/all-features"
            className="px-4 py-2 text-h5 text-heading rounded-full transition hover:bg-primary-soft"
          >
            المميزات
          </a>
          <Link
            href="/"
            aria-current="page"
            className="px-4 py-2 text-h5 text-heading font-medium rounded-full transition bg-primary-soft"
          >
            الأسعار
          </Link>
          <a
            href="https://intercom.help/acadimiat/ar"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 text-h5 text-heading rounded-full transition hover:bg-primary-soft"
          >
            مركز المساعدة
          </a>
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            type="button"
            onClick={() => openSignup({ plan: "advanced" })}
            className="inline-flex items-center bg-primary text-white text-h4 font-medium px-5 py-2.5 rounded-full shadow-sm btn-premium cursor-pointer hover:bg-primary-hover transition"
          >
            ابدأ تجربتك المجانية
          </button>
          <button
            type="button"
            onClick={openLogin}
            className="hidden sm:inline-flex items-center text-h4 font-medium text-heading px-4 py-2 rounded-full bg-white border border-border/70 hover:bg-primary-soft shadow-sm btn-premium cursor-pointer transition"
          >
            دخول
          </button>

          {/* Mobile menu toggle */}
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            className="lg:hidden w-10 h-10 rounded-full bg-white border border-border/70 flex items-center justify-center text-heading shadow-sm"
            aria-label="القائمة"
            aria-expanded={open}
            aria-controls="mobile-menu"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div
          id="mobile-menu"
          className="lg:hidden border-t border-border bg-white"
        >
          <nav
            className="max-w-container mx-auto px-4 py-4 flex flex-col gap-1"
            aria-label="القائمة المتنقّلة"
          >
            <a
              href="https://www.acadimiat.com/all-features"
              className="px-4 py-3 text-h4 text-heading rounded-xl hover:bg-primary-soft transition"
            >
              المميزات
            </a>
            <Link
              href="/"
              className="px-4 py-3 text-h4 text-heading font-medium rounded-xl bg-primary-soft"
            >
              الأسعار
            </Link>
            <a
              href="https://intercom.help/acadimiat/ar"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-3 text-h4 text-heading rounded-xl hover:bg-primary-soft transition"
            >
              مركز المساعدة
            </a>
          </nav>
        </div>
      )}
    </header>
  );
}
