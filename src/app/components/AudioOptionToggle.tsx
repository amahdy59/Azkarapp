import { Check } from "./icons";
import type { ReactNode } from "react";

/** Shared binary option anatomy for every listening surface. */
export function AudioOptionToggle({
  label,
  hint,
  checked,
  onChange,
  disabled,
  switchRole = false,
  className = "",
}: {
  label: ReactNode;
  hint?: string;
  checked: boolean;
  onChange: () => void;
  disabled?: boolean;
  switchRole?: boolean;
  className?: string;
}) {
  return (
    <button
      type="button"
      aria-label={switchRole ? hint : undefined}
      role={switchRole ? "switch" : undefined}
      aria-checked={switchRole ? checked : undefined}
      aria-pressed={switchRole ? undefined : checked}
      disabled={disabled}
      onClick={onChange}
      className={`audio-options-row flex min-h-11 w-full items-center justify-between gap-3 rounded-xl px-3 py-2 text-start text-sm font-medium text-foreground hover:bg-muted/70 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring disabled:opacity-50 ${className}`}
    >
      <span className="min-w-0">
        <span className="block font-semibold">{label}</span>
        {hint && <span className="block text-micro text-muted-foreground">{hint}</span>}
      </span>
      <span aria-hidden="true" className={`audio-option-check ${checked ? "audio-option-check--on" : ""}`}>
        {checked && <Check size={14} />}
      </span>
    </button>
  );
}
