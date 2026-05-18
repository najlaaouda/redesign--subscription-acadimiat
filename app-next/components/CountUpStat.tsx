"use client";

import { useCountUp } from "@/hooks/useCountUp";

export function CountUpStat({
  to,
  prefix = "",
  suffix = "",
  label,
}: {
  to: number;
  prefix?: string;
  suffix?: string;
  label: string;
}) {
  const { ref, value } = useCountUp(to);
  return (
    <div className="text-center">
      <div className="text-[36px] sm:text-[42px] text-heading font-extrabold leading-none mb-3">
        <span dir="ltr">
          {prefix}
          <span ref={ref}>{value}</span>
          {suffix}
        </span>
      </div>
      <div className="text-h4 text-text-muted">{label}</div>
    </div>
  );
}
