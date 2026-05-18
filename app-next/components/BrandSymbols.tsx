/**
 * Inline SVG <defs> sprite — referenced via <use href="#acad-logo-mark"/>
 * throughout the app. Rendered once at the top of <body>.
 */
export function BrandSymbols() {
  return (
    <svg
      width="0"
      height="0"
      style={{ position: "absolute" }}
      aria-hidden="true"
    >
      <defs>
        <symbol id="acad-logo-mark" viewBox="0 0 32 32">
          <path d="M16 4 L30 12 L16 20 L2 12 Z" fill="currentColor" />
          <path
            d="M6 14.5 L6 21 Q 6 26 16 26 Q 26 26 26 21 L 26 14.5"
            fill="none"
            stroke="currentColor"
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity={0.55}
          />
          <circle cx="29" cy="13" r="1.5" fill="currentColor" />
          <path
            d="M29 13 L 29 18"
            stroke="currentColor"
            strokeWidth={1.5}
            strokeLinecap="round"
          />
        </symbol>
      </defs>
    </svg>
  );
}
