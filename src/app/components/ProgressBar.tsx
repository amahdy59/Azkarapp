export function ProgressBar({
  value,
  max,
  height = 8,
  trackColor = "var(--muted)",
  fillColor = "var(--primary)",
  direction = "ltr",
  "aria-label": ariaLabel,
}: {
  value: number;
  max: number;
  height?: number;
  trackColor?: string;
  fillColor?: string;
  direction?: "ltr" | "rtl";
  "aria-label"?: string;
}) {
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0;
  return (
    <div
      className="flex w-full overflow-hidden rounded-full"
      data-slot="progress-track"
      style={{ height, background: trackColor, justifyContent: direction === "rtl" ? "flex-end" : "flex-start" }}
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-label={ariaLabel || "Progress bar"}
    >
      <div
        className="h-full rounded-full transition-all duration-300"
        data-slot="progress-fill"
        style={{ width: `${pct}%`, background: fillColor }}
      />
    </div>
  );
}
