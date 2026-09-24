import * as RadioGroupPrimitive from "@radix-ui/react-radio-group";
import { useId, type ReactNode } from "react";
import { LayoutGroup, motion, useReducedMotion } from "motion/react";

export interface SegmentedControlOption<T extends string> {
  value: T;
  label: ReactNode;
  testId?: string;
}

/**
 * Mutually exclusive choice control with correct radio-group semantics.
 *
 * Owns semantics and keyboard behavior only (role="radiogroup"/"radio", roving
 * tabindex, RTL-aware arrow-key navigation — all via Radix). Callers own their
 * own visuals through `className`/`itemClassName`, so this stays a semantics
 * primitive rather than a configurable "god component".
 *
 * Per docs/agent/ACCESSIBILITY_REQUIREMENTS.md §9, mutually exclusive
 * appearance/mode choices must use radio-group semantics — not
 * role="group" + aria-pressed.
 */
export function SegmentedControl<T extends string>({
  value,
  onChange,
  options,
  direction,
  className = "",
  itemClassName,
  "aria-label": ariaLabel,
  "aria-describedby": ariaDescribedBy,
  indicatorClassName = "bg-primary/15",
}: {
  value: T;
  onChange: (value: T) => void;
  options: ReadonlyArray<SegmentedControlOption<T>>;
  direction: "ltr" | "rtl";
  className?: string;
  /** Per-item classes; receives the selected state so callers can style their own tone. */
  itemClassName: (selected: boolean) => string;
  "aria-label": string;
  "aria-describedby"?: string;
  indicatorClassName?: string;
}) {
  const indicatorId = useId();
  const systemReducedMotion = useReducedMotion();
  const motionReduced =
    systemReducedMotion ||
    (typeof document !== "undefined" && document.documentElement.classList.contains("reduce-motion"));
  return (
    <LayoutGroup id={indicatorId}>
      <RadioGroupPrimitive.Root
        dir={direction}
        value={value}
        onValueChange={(next) => onChange(next as T)}
        className={className}
        aria-label={ariaLabel}
        aria-describedby={ariaDescribedBy}
      >
        {options.map((option) => (
          <RadioGroupPrimitive.Item
            key={option.value}
            value={option.value}
            data-testid={option.testId}
            className={`relative isolate overflow-hidden ${itemClassName(value === option.value)}`}
          >
            {value === option.value && (
              <motion.span
                layoutId={`${indicatorId}-active-pill`}
                className={`absolute inset-0 z-0 rounded-[inherit] ${indicatorClassName}`}
                transition={{ duration: motionReduced ? 0 : 0.18, ease: [0.22, 1, 0.36, 1] }}
                aria-hidden="true"
              />
            )}
            <span className="relative z-10">{option.label}</span>
          </RadioGroupPrimitive.Item>
        ))}
      </RadioGroupPrimitive.Root>
    </LayoutGroup>
  );
}
