import { useRef, type ReactNode } from "react";
import { useLayoutMode } from "../hooks/useLayoutMode";
import { ChevronDown, SlidersHorizontal } from "./icons";
import { t } from "../i18n";
import type { AppLanguage } from "../types";

/** Native disclosure: phones keep the applied context visible; wider layouts show the fields. */
export function ResponsiveFilters({
  label,
  summary,
  children,
  testId,
  language = "en",
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
    <details ref={details} open={!compact} data-testid={testId} className="group">
      <summary
        ref={trigger}
        className={`${compact ? "flex" : "hidden"} min-h-11 cursor-pointer list-none items-center justify-between gap-2 rounded-xl border border-border-control bg-card px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring [&::-webkit-details-marker]:hidden`}
      >
        <SlidersHorizontal className="size-5 shrink-0 text-primary" aria-hidden="true" />
        <span className="min-w-0 flex-1">
          <span className="block truncate text-xs text-muted-foreground">{label}</span>
          <span className="block truncate font-semibold">{summary}</span>
        </span>
        <span className="flex shrink-0 items-center gap-1 text-micro font-semibold text-primary">
          <span className="group-open:hidden">{t(language, "common.expand")}</span>
          <span className="hidden group-open:inline">{t(language, "common.collapse")}</span>
          <ChevronDown
            className="size-5 shrink-0 transition-transform duration-fast motion-reduce:transition-none group-open:rotate-180"
            aria-hidden="true"
          />
        </span>
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
