import type { HTMLAttributes } from "react";
import "./reading-header-surface.css";

/** Same readable, borderless action in every reading header and responsive tier. */
export const READING_HEADER_ACTION_CLASS =
  "flex h-[44px] w-[44px] min-h-[44px] min-w-[44px] shrink-0 items-center justify-center rounded-full text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-inset focus-visible:ring-ring disabled:opacity-40";

/** In-flow reading chrome borrows its canvas; no content scrolls behind it. */
export function ReadingHeaderSurface({ className = "", ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      data-reading-chrome
      data-seamless-header
      className={`reading-header-surface relative isolate flex w-full shrink-0 flex-col items-center gap-1.5 px-6 pb-2.5 pt-2 text-center ${className}`}
      {...props}
    />
  );
}
