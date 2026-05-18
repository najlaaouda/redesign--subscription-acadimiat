"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Animates a number from 0 → `target` over `duration` ms, easing out cubic,
 * triggered the first time the element enters the viewport.
 *
 * Uses scroll listener + getBoundingClientRect (not IntersectionObserver)
 * because IO doesn't fire reliably inside the legacy MCP preview.
 * setTimeout (not rAF) for the same compatibility reason.
 */
export function useCountUp(target: number, duration = 1800) {
  const ref = useRef<HTMLSpanElement | null>(null);
  const [value, setValue] = useState(0);
  const startedRef = useRef(false);

  useEffect(() => {
    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

    if (reduced) {
      setValue(target);
      return;
    }

    const animate = () => {
      if (startedRef.current) return;
      startedRef.current = true;
      const start = Date.now();
      const step = () => {
        const t = Math.min(1, (Date.now() - start) / duration);
        const eased = 1 - Math.pow(1 - t, 3);
        setValue(Math.round(eased * target));
        if (t < 1) setTimeout(step, 16);
      };
      step();
    };

    const onScroll = () => {
      const el = ref.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight && rect.bottom > 0) {
        animate();
        window.removeEventListener("scroll", onScroll);
      }
    };

    // Fire once on mount (in case already in view), then on scroll.
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [target, duration]);

  return { ref, value };
}
