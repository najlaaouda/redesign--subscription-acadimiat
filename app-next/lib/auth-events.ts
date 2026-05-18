/**
 * Lightweight cross-component event bus for opening / switching auth modals.
 *
 * The two modals (Signup + Login) are mounted once at the page root and
 * listen for `auth:open-signup` / `auth:open-login` events. Anything in the
 * tree can trigger them via the helpers below — no React Context required.
 *
 * This is how the original site allowed the "لدي حساب؟" link inside Signup
 * to close one modal and open the other without prop drilling.
 */
import type { PlanId } from "@/lib/plans";

export type OpenSignupDetail = { plan?: PlanId };
export type OpenLoginDetail = Record<string, never>;

declare global {
  interface WindowEventMap {
    "auth:open-signup": CustomEvent<OpenSignupDetail>;
    "auth:open-login": CustomEvent<OpenLoginDetail>;
  }
}

/** Open the Signup modal, optionally pre-selecting a plan. */
export function openSignup(detail: OpenSignupDetail = {}): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent("auth:open-signup", { detail }));
}

/** Open the Login modal. */
export function openLogin(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent("auth:open-login", { detail: {} }));
}
