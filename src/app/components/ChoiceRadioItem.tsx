import * as RadioGroupPrimitive from "@radix-ui/react-radio-group";
import { forwardRef, type ComponentPropsWithoutRef, type ElementRef } from "react";
import { Check } from "./icons";
import { cn } from "./ui/utils";

/** A radio choice surface; callers retain the group's value, direction and layout. */
export const ChoiceRadioItem = forwardRef<
  ElementRef<typeof RadioGroupPrimitive.Item>,
  ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Item>
>(function ChoiceRadioItem({ className, children, ...props }, ref) {
  return (
    <RadioGroupPrimitive.Item
      ref={ref}
      {...props}
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
