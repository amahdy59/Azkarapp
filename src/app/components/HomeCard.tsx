import type { ComponentPropsWithoutRef, ElementType, ReactNode } from "react";
import { Card } from "./Card";
import { cn } from "./ui/utils";

export interface HomeCardProps extends ComponentPropsWithoutRef<"section"> {
  /** Semantic element for the wrapper. */
  as?: ElementType;
  /**
   * If true, renders the card as a glass surface meant to sit above media (hero photograph).
   * Automatically applies 'hero-glass' and 'home-glass-surface' classes.
   * If false, renders as a standard elevated Card (opaque, with borders).
   */
  onGlass?: boolean;
  elevation?: "flat" | "raised" | "overlay";
  className?: string;
  children: ReactNode;
}

/**
 * A standard surface for all home screen cards to ensure consistent glassmorphism
 * effects, borders, shadows, and padding across all screens and screen sizes.
 */
export function HomeCard({
  as: Component = "section",
  onGlass = false,
  elevation = "raised",
  className = "",
  children,
  ...rest
}: HomeCardProps) {
  if (onGlass) {
    return (
      <Component className={cn("hero-glass home-glass-surface rounded-3xl p-5 sm:p-6 md:p-7", className)} {...rest}>
        {children}
      </Component>
    );
  }

  return (
    <Card as={Component} elevation={elevation} padding="none" className={cn("p-5 sm:p-6 md:p-7", className)} {...rest}>
      {children}
    </Card>
  );
}
