import type { ComponentProps } from "react";
import { cn } from "./ui/utils";

export function DevotionalFooter({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      data-testid="reader-dock"
      {...props}
      className={cn("reader-dock devotional-footer flex flex-col items-center gap-3", className)}
    />
  );
}

/** Shared support action; screens own labels, icons and counting behavior. */
export function DevotionalAction({
  className,
  active = false,
  ...props
}: ComponentProps<"button"> & { active?: boolean }) {
  return (
    <button
      type="button"
      {...props}
      className={cn(
        "flex min-h-11 shrink-0 items-center justify-center gap-1.5 rounded-xl border px-2 transition-colors duration-fast focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring disabled:opacity-50",
        active
          ? "border-primary bg-primary text-primary-foreground shadow-raised"
          : "devotional-secondary-action border-border/60 bg-card text-foreground hover:bg-muted",
        className,
      )}
    />
  );
}
