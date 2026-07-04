export function ProgressBar({ 
  value, 
  max, 
  height = 8, 
  trackColor = "var(--muted)", 
  fillColor = "var(--primary)",
  "aria-label": ariaLabel,
}: { 
  value: number; 
  max: number; 
  height?: number; 
  trackColor?: string; 
  fillColor?: string;
  "aria-label"?: string;
}) {
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0;
  return (
    <div 
      className="w-full rounded-full overflow-hidden" 
      style={{ height, background: trackColor }}
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-label={ariaLabel || "Progress bar"}
    >
      <div 
        className="h-full rounded-full transition-all duration-500" 
        style={{ width: `${pct}%`, background: fillColor }} 
      />
    </div>
  );
}
