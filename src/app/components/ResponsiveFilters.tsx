import { useRef, type ReactNode } from "react";
import { useLayoutMode } from "../hooks/useLayoutMode";
import { ChevronDown, SlidersHorizontal } from "./icons";
import "./responsive-filters.css";
import type { AppLanguage } from "../types";

/** Native disclosure: phones keep the applied context visible; wider layouts show the fields. */
export function ResponsiveFilters({
  label,
  summary,
  children,
  testId,
}: {
  label: string;
  summary: ReactNode;
  testId: string;
  language?: AppLanguage;
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
    <details ref={details} open={!compact} data-testid={testId} className="responsive-filters group">
      <summary
        ref={trigger}
        className={`${compact ? "grid" : "hidden"} responsive-filter-trigger cursor-pointer list-none items-center text-sm text-foreground focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring`}
      >
        <span
          className="flex items-center justify-center rounded-xl bg-primary/10 text-primary"
          style={{ width: 36, height: 36 }}
          aria-hidden="true"
        >
          <SlidersHorizontal size={20} />
        </span>
        <span className="responsive-filter-copy">
          <span className="font-semibold leading-normal">{label}</span>
          <span className="responsive-filter-context">{summary}</span>
        </span>
        <ChevronDown
          className="responsive-filter-chevron size-5 text-muted-foreground transition-transform duration-fast"
          aria-hidden="true"
        />
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
