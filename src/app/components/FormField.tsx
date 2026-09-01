import { useId, type InputHTMLAttributes, type ReactNode, type WheelEvent } from "react";

/**
 * One anatomy for a form field: a visible label, the control, and an optional
 * hint tied to it.
 *
 * The app had three labelling patterns living side by side — a `<label
 * htmlFor>` on the reminder times, a wrapping `<label>` on the prayer
 * adjustments, and, on the manual-location fields, a placeholder doubling as
 * the label with an `aria-label` behind it. The third is the one that fails a
 * reader: a placeholder is a hint, it disappears the moment there is a value,
 * and it leaves the field unnamed on screen the moment it matters most — while
 * checking what you typed.
 *
 * The control styling lived at twenty-one call sites, so a change to focus
 * treatment or height meant twenty-one edits and, in practice, drift.
 */
export const FIELD_CONTROL_CLASS =
  "h-11 w-full min-w-0 rounded-xl border border-border-control bg-background px-3 text-[0.875rem] text-foreground focus-visible:ring-[3px] focus-visible:ring-ring focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50";

export interface FormFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "id" | "className"> {
  /** Always visible. A field without one is a field the reader has to guess. */
  label: string;
  /** Shown under the control and announced with it. */
  hint?: ReactNode;
  /**
   * What is wrong with the current value.
   *
   * Marks the control invalid and replaces the hint, so the message is attached
   * to the field that caused it rather than to a status line elsewhere on the
   * page — which tells a sighted user something failed while leaving a screen
   * reader no way to find which field to fix.
   */
  error?: ReactNode;
  /** Extra classes for the control itself. */
  controlClassName?: string;
  /** Extra classes for the field wrapper. */
  className?: string;
}

export function FormField({ label, hint, error, controlClassName = "", className = "", ...control }: FormFieldProps) {
  const id = useId();
  const message = error ?? hint;
  const messageId = message ? `${id}-message` : undefined;

  /**
   * A wheel over a focused number input changes its value. Scrolling a settings
   * page with the pointer over the latitude field silently moves the user's
   * location, and nothing on screen says it happened. Dropping focus on wheel
   * keeps the scroll and leaves the value alone.
   */
  const handleWheel =
    control.type === "number" ? (event: WheelEvent<HTMLInputElement>) => event.currentTarget.blur() : undefined;

  return (
    <div className={`flex min-w-0 flex-col gap-1.5 ${className}`.trim()}>
      <label htmlFor={id} className="text-[0.8125rem] font-bold text-foreground">
        {label}
      </label>
      <input
        id={id}
        aria-describedby={messageId}
        aria-invalid={error ? true : undefined}
        className={`${FIELD_CONTROL_CLASS} ${controlClassName}`.trim()}
        {...control}
        // After the spread on purpose: this is a safety rail, not a default a
        // caller should be able to drop by passing its own handler.
        onWheel={handleWheel ?? control.onWheel}
      />
      {message && (
        <p
          id={messageId}
          className={`text-[0.75rem] font-medium leading-snug ${error ? "text-destructive" : "text-muted-foreground"}`}
        >
          {message}
        </p>
      )}
    </div>
  );
}
