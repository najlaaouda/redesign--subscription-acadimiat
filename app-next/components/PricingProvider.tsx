"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import type { Billing } from "@/lib/plans";

/**
 * Shared billing state for the entire pricing area (toggle bar + cards +
 * compare-table sticky header). Default = "yearly" (matches the original
 * site's default + the inline price the cards render server-side).
 */
interface PricingState {
  billing: Billing;
  setBilling: (b: Billing) => void;
}

const PricingContext = createContext<PricingState | null>(null);

export function PricingProvider({ children }: { children: ReactNode }) {
  const [billing, setBilling] = useState<Billing>("yearly");
  return (
    <PricingContext.Provider value={{ billing, setBilling }}>
      {children}
    </PricingContext.Provider>
  );
}

export function usePricing(): PricingState {
  const ctx = useContext(PricingContext);
  if (!ctx)
    throw new Error("usePricing must be used inside <PricingProvider>");
  return ctx;
}
