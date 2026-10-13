import * as RadioGroupPrimitive from "@radix-ui/react-radio-group";
import { forwardRef, type ComponentPropsWithoutRef, type ElementRef } from "react";
import { Check } from "./icons";
import { cn } from "./ui/utils";

/** A radio choice surface; callers retain the group's value, direction and layout. */
export const ChoiceRadioItem = forwardRef<
  ElementRef<typeof RadioGroupPrimitive.Item>,
  ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Item>
>(function ChoiceRadioItem({ className, children, onKeyDown, onKeyDownCapture, ...props }, ref) {
  return (
    <RadioGroupPrimitive.Item
      ref={ref}
      {...props}
      onKeyDownCapture={(event) => {
        onKeyDownCapture?.(event);
        onKeyDown?.(event);
        if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey) return;
        const group = event.currentTarget.closest('[role="radiogroup"]');
        if (!group) return;
        const rtl = group.getAttribute("dir") === "rtl";
        const forward = event.key === "ArrowDown" || event.key === (rtl ? "ArrowLeft" : "ArrowRight");
        const backward = event.key === "ArrowUp" || event.key === (rtl ? "ArrowRight" : "ArrowLeft");
        if (!forward && !backward && event.key !== "Home" && event.key !== "End") return;
        const choices = Array.from(group.querySelectorAll<HTMLButtonElement>('[role="radio"]')).filter(
          (item) => !item.disabled && item.getAttribute("aria-disabled") !== "true",
        );
        const index = choices.indexOf(event.currentTarget);
        if (index < 0) return;
        const next =
          choices[
            event.key === "Home"
              ? 0
              : event.key === "End"
                ? choices.length - 1
                : (index + (forward ? 1 : -1) + choices.length) % choices.length
          ];
        // Radix defers roving focus. A quick keyup can clear its selection intent
        // before focus arrives; commit this navigation in the original key event.
        event.preventDefault();
        next?.focus();
        next?.click();
      }}
      className={cn(
        "relative flex min-h-11 items-center justify-center gap-2 rounded-xl border border-border-control bg-card px-3 py-2 text-center text-sm font-semibold text-foreground transition-colors duration-fast hover:bg-muted data-[state=checked]:border-primary data-[state=checked]:bg-primary/10 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
    >
      {children}
      <span className="pointer-events-none absolute end-1.5 top-1.5 size-3.5 text-primary" aria-hidden="true">
        <RadioGroupPrimitive.Indicator>
          <Check size={14} />
        </RadioGroupPrimitive.Indicator>
      </span>
    </RadioGroupPrimitive.Item>
  );
});
