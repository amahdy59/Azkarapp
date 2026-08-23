import { type ReactNode, type HTMLAttributes } from "react";
import { useScreenFocus } from "../hooks/useScreenFocus";

interface ScreenContainerProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  className?: string;
  dir?: "ltr" | "rtl";
  screenName?: string;
  /**
   * Drops the screen's own block padding so a surface can run to the physical
   * edges of the viewport. Only the Mushaf uses it: the printed page is the
   * whole screen, and the safe-area insets move onto its header and footer
   * chrome instead of sitting outside the paper.
   */
  edgeToEdge?: boolean;
}

export function ScreenContainer({
  children,
  className = "",
  dir,
  screenName,
  edgeToEdge = false,
  ...props
}: ScreenContainerProps) {
  useScreenFocus(screenName);

  const blockPadding = edgeToEdge
    ? ""
    : "pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-[max(0.5rem,env(safe-area-inset-top))]";

  return (
    // Deliberately a div, not <main>: App.tsx already renders the single
    // #main-content landmark that wraps every screen. Nesting a second <main>
    // inside it produced two main landmarks.
    <div
      className={`app-screen-surface scroll-container flex flex-1 min-h-0 w-full flex-col bg-background ${blockPadding} ${className}`}
      dir={dir}
      {...props}
    >
      {/* screenName drives document.title only. It used to also render an
          sr-only live region, but every screen already carries a heading with
          the same text, and since Phase 04 focus moves to #main-content on each
          view change — so the region announced the screen name a second time. */}
      {children}
    </div>
  );
}
