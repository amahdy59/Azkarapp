import type { ComponentPropsWithoutRef, ElementType, ReactNode } from "react";

export interface CardProps extends ComponentPropsWithoutRef<"section"> {
  /** Semantic element for the wrapper. Card adds no interactive semantics of its own. */
  as?: ElementType;
  /** Flat = bordered surface only, raised = default card elevation, overlay = sheet/dialog elevation. */
  elevation?: "flat" | "raised" | "overlay";
  padding?: "none" | "sm" | "md" | "lg";
  className?: string;
  children: ReactNode;
}

const ELEVATION_CLASS: Record<NonNullable<CardProps["elevation"]>, string> = {
  flat: "",
  raised: "shadow-raised",
  overlay: "shadow-overlay",
};

const PADDING_CLASS: Record<NonNullable<CardProps["padding"]>, string> = {
  none: "",
  sm: "p-3",
  md: "p-4.5",
  lg: "p-6",
};

/** Shared card surface: opaque bg-card, border, radius, and one of the three documented elevation levels. */
export function Card({
  as: Component = "div",
  elevation = "raised",
  padding = "md",
  className = "",
  children,
  ...rest
}: CardProps) {
  return (
    <Component
      className={`rounded-3xl border border-border/40 bg-card ${PADDING_CLASS[padding]} ${ELEVATION_CLASS[elevation]} ${className}`.trim()}
      {...rest}
    >
      {children}
    </Component>
  );
}
