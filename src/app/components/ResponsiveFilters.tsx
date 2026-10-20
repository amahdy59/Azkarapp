import { useRef, type ReactNode } from "react";
import { useLayoutMode } from "../hooks/useLayoutMode";
import { ChevronDown } from "./icons";

/** Native disclosure: phones keep the applied context visible; wider layouts show the fields. */
export function ResponsiveFilters({
  label,
  summary,
  children,
  testId,
  compactLabel = false,
}: {
  label: string;
  summary: ReactNode;
  testId: string;
  compactLabel?: boolean;
  children: (controls: {
    compact: boolean;
    collapse: () => boolean;
    restoreSelectFocus: (event: Event) => void;
  }) => ReactNode;
}) {
  const compact = useLayoutMode() === "compact";
  const details = useRef<HTMLDetailsElement>(null);
  const trigger = useRef<HTMLElement>(null);
  const focus = () => trigger.current?.focus({ preventScroll: true });
  const collapse = () => {
    if (!compact || !details.current) return false;
    details.current.open = false;
    focus();
    return true;
  };
  return (
    <details ref={details} open={!compact} data-testid={testId} className="group">
      <summary
        ref={trigger}
        className={`${compact ? "flex" : "hidden"} min-h-11 cursor-pointer list-none items-center justify-between gap-3 rounded-xl border border-border-control bg-card px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring [&::-webkit-details-marker]:hidden`}
      >
        <span className="min-w-0 break-words">
          <span className={compactLabel ? "sr-only" : "block font-semibold"}>{label}</span>
          <span className={compactLabel ? "block font-semibold" : "block text-xs text-muted-foreground"}>
            {summary}
          </span>
        </span>
        <ChevronDown className="size-5 shrink-0 group-open:rotate-180" aria-hidden="true" />
      </summary>
      <div className={compact ? "pt-3" : undefined}>
        {children({
          compact,
          collapse,
          restoreSelectFocus: (event) => {
            if (compact && !details.current?.open) {
              event.preventDefault();
              focus();
            }
          },
        })}
      </div>
    </details>
  );
}
