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
    <main
      className={`scroll-container flex h-full flex-col bg-background pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-[max(0.5rem,env(safe-area-inset-top))] ${className}`}
      dir={dir}
      {...props}
    >
      {screenName && (
        <div className="sr-only" aria-live="polite" aria-atomic="true">
          {screenName}
        </div>
      )}
      {children}
    </main>
  );
}
