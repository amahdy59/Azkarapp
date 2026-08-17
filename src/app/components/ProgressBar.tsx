import { useEffect, useState } from "react";

export function ProgressBar({
  value,
  max,
  height = 8,
  trackColor = "var(--muted)",
  fillColor = "var(--primary)",
  direction,
  "aria-label": ariaLabel,
}: {
  value: number;
  max: number;
  height?: number;
  trackColor?: string;
  fillColor?: string;
  direction?: "ltr" | "rtl";
  "aria-label": string;
}) {
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0;
  // The bar fills in from empty when it first appears, so arriving on a screen
  // shows the progress being made rather than a bar that was always there.
  // After that first paint `pct` drives it directly, and the existing width
  // transition carries every later change — so counting up mid-session still
  // animates from wherever the bar already was, not from zero.
  const [hasEntered, setHasEntered] = useState(false);
  useEffect(() => {
    const frame = requestAnimationFrame(() => setHasEntered(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <div
      className="flex w-full overflow-hidden rounded-full"
      data-slot="progress-track"
      style={{ height, background: trackColor }}
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-label={ariaLabel}
      dir={direction}
    >
      <div
        className="h-full rounded-full transition-[width] duration-emphasis ease-standard"
        data-slot="progress-fill"
        style={{ width: hasEntered ? `${pct}%` : "0%", background: fillColor }}
      />
    </div>
  );
}
