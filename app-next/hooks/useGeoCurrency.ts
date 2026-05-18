"use client";

import { useEffect, useState } from "react";
import type { Currency } from "@/lib/plans";

/**
 * GCC + Arab countries → SAR as a sensible regional default.
 * Everyone else → USD.
 * Tweak the country list if you want per-country currencies (AED, KWD, etc.).
 */
const SAR_COUNTRIES = new Set([
  "SA", "AE", "KW", "BH", "OM", "QA", "YE",
  "JO", "LB", "EG", "IQ", "PS", "SY", "DZ", "MA", "TN", "LY", "SD",
]);

/**
 * Detect a sensible currency for the visitor.
 *
 *   1. Reads localStorage `acad_currency` if the user previously picked one
 *      (kept for forward-compat with the original site).
 *   2. Calls a free no-key IP geolocation endpoint (ipapi.co) — cached
 *      in localStorage so subsequent visits don't re-fetch.
 *   3. Falls back to "USD" on any failure.
 *
 * Runs only in the browser. SSR-safe (initial value = "USD").
 */
export function useGeoCurrency(): Currency {
  const [currency, setCurrency] = useState<Currency>("USD");

  useEffect(() => {
    let cancelled = false;

    // 1. Stored choice wins (forward-compat with legacy localStorage key).
    try {
      const stored = window.localStorage.getItem("acad_currency");
      if (stored === "USD" || stored === "SAR") {
        setCurrency(stored);
        return;
      }
      const country = window.localStorage.getItem("acad_country");
      if (country) {
        setCurrency(SAR_COUNTRIES.has(country) ? "SAR" : "USD");
        return;
      }
    } catch {
      /* localStorage may be blocked — ignore */
    }

    // 2. Fetch country code from IP. ipapi.co is free for ~1k req/day
    //    without a key; swap for your own endpoint when traffic grows.
    fetch("https://ipapi.co/country/")
      .then((r) => (r.ok ? r.text() : null))
      .then((country) => {
        if (cancelled || !country) return;
        const code = country.trim().toUpperCase();
        try {
          window.localStorage.setItem("acad_country", code);
        } catch {
          /* ignore */
        }
        setCurrency(SAR_COUNTRIES.has(code) ? "SAR" : "USD");
      })
      .catch(() => {
        /* keep USD default */
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return currency;
}
