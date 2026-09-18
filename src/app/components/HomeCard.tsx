import { forwardRef, type ComponentPropsWithoutRef, type ElementType, type ReactNode } from "react";
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

export interface HomeCardSubSurfaceProps extends ComponentPropsWithoutRef<"div"> {
  /**
   * Whether the sub-surface sits over a glass card on media.
   * If true, uses a frosted glass style instead of an opaque theme background.
   */
  onGlass?: boolean;
  className?: string;
  children: ReactNode;
}

/**
 * Standard nested sub-surface for inner blocks, cards, or lists inside HomeCard
 * ensuring consistent frost, border, and backdrop-blur.
 */
export function HomeCardSubSurface({ onGlass = false, className = "", children, ...rest }: HomeCardSubSurfaceProps) {
  return (
    <div
      className={cn(
        onGlass
          ? "rounded-2xl border border-white/10 bg-white/8 text-on-media"
          : "rounded-2xl border border-border bg-muted text-foreground",
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  );
}

interface HomeCardComponent {
  (props: HomeCardProps & { ref?: React.Ref<HTMLElement> }): ReactNode;
  SubSurface: typeof HomeCardSubSurface;
}

/**
 * A standard surface for all home screen cards to ensure consistent glassmorphism
 * effects, borders, shadows, and padding across all screens and screen sizes.
 */
const HomeCardBase = forwardRef<HTMLElement, HomeCardProps>(function HomeCard(
  { as: Component = "section", onGlass = false, elevation = "raised", className = "", children, ...rest },
  ref,
) {
  if (onGlass) {
    return (
      <Component
        ref={ref}
        className={cn("hero-glass home-glass-surface rounded-3xl p-5 sm:p-6 md:p-7", className)}
        {...rest}
      >
        {children}
      </Component>
    );
  }

  return (
    <Card
      ref={ref}
      as={Component}
      elevation={elevation}
      padding="none"
      className={cn("p-5 sm:p-6 md:p-7", className)}
      {...rest}
    >
      {children}
    </Card>
  );
});

export const HomeCard = Object.assign(HomeCardBase, {
  SubSurface: HomeCardSubSurface,
}) as HomeCardComponent;
