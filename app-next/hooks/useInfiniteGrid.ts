"use client";

import { useEffect } from "react";

/**
 * Animate an SVG <pattern> by id — pans both axes 0.5px/frame at 60fps
 * to create an infinite diagonal scroll. The pattern's tile size must
 * equal `tile` (default 40px) so the wrap is invisible.
 *
 * NOTE: uses setTimeout (not rAF) because the legacy MCP preview
 * throttles rAF to 0. setTimeout is cheap (one attribute write/frame)
 * and runs in every browser context.
 */
export function useInfiniteGrid(
  patternId: string,
  opts: { speed?: number; tile?: number; frameMs?: number } = {},
) {
  useEffect(() => {
    const speed = opts.speed ?? 0.5;
    const tile = opts.tile ?? 40;
    const frameMs = opts.frameMs ?? 16;

    const pattern = document.getElementById(patternId);
    if (!pattern) return;

    if (
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }

    let ox = 0;
    let oy = 0;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let cancelled = false;

    const tick = () => {
      if (cancelled) return;
      ox = (ox + speed) % tile;
      oy = (oy + speed) % tile;
      pattern.setAttribute("x", ox.toFixed(2));
      pattern.setAttribute("y", oy.toFixed(2));
      timer = setTimeout(tick, frameMs);
    };
    tick();

    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, [patternId, opts.speed, opts.tile, opts.frameMs]);
}
