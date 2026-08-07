import { type ReactNode, type HTMLAttributes } from "react";
import { useScreenFocus } from "../hooks/useScreenFocus";

interface ScreenContainerProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  className?: string;
  dir?: "ltr" | "rtl";
  screenName?: string;
}

export function ScreenContainer({ children, className = "", dir, screenName, ...props }: ScreenContainerProps) {
  useScreenFocus(screenName);

  return (
    // Deliberately a div, not <main>: App.tsx already renders the single
    // #main-content landmark that wraps every screen. Nesting a second <main>
    // inside it produced two main landmarks.
    <div
      className={`scroll-container flex flex-1 min-h-0 w-full flex-col bg-background pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-[max(0.5rem,env(safe-area-inset-top))] ${className}`}
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
