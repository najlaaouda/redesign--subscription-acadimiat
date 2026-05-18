"use client";

import { useInfiniteGrid } from "@/hooks/useInfiniteGrid";

/**
 * Hero infinite-grid backdrop — an SVG pattern that pans diagonally to
 * create an endless scrolling feel. The `id` prop must be unique per
 * page (use a different id for hero vs. contact-page backdrops).
 */
export function InfiniteGrid({ id }: { id: string }) {
  useInfiniteGrid(id);
  return (
    <div className="hero-bg" aria-hidden="true">
      <svg className="grid-layer grid-layer--base" preserveAspectRatio="none">
        <defs>
          <pattern
            id={id}
            width="40"
            height="40"
            patternUnits="userSpaceOnUse"
            x="0"
            y="0"
          >
            <path
              d="M 40 0 L 0 0 0 40"
              fill="none"
              stroke="rgba(107, 58, 140, 0.75)"
              strokeWidth="1"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#${id})`} />
      </svg>
    </div>
  );
}
