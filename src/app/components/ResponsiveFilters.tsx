import { useRef, useState, useEffect, type ReactNode } from "react";
import { useLayoutMode } from "../hooks/useLayoutMode";
import { ChevronDown, SlidersHorizontal } from "./icons";
import "./responsive-filters.css";
import type { AppLanguage } from "../types";
import { ResponsiveSheet, SheetHeader } from "./ResponsiveSheet";

/** Phones edit filters in a portalled sheet; wider layouts show the fields. */
export function ResponsiveFilters({
  label,
  summary,
  children,
  testId,
  language = "en",
  compactIconOnly = false,
}: {
  label: string;
  summary: ReactNode;
  testId: string;
  language?: AppLanguage;
  compactIconOnly?: boolean;
  children: (controls: {
    compact: boolean;
    collapse: () => boolean;
    restoreSelectFocus: (event: Event) => void;
  }) => ReactNode;
}) {
  const compact = useLayoutMode() === "compact";
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!compact) setOpen(false);
  }, [compact]);
  const focus = () => {
    const target = trigger.current ?? root.current?.querySelector<HTMLElement>("input, button");
    target?.focus({ preventScroll: true });
  };
  const collapse = () => {
    if (!compact) return false;
    setOpen(false);
    return true;
  };
  return (
    <div
      ref={root}
      data-testid={testId}
      className="responsive-filters"
      data-open={open || undefined}
      data-icon-only={compactIconOnly || undefined}
    >
      {compact && (
        <button
          ref={trigger}
          type="button"
          aria-expanded={open}
          aria-haspopup="dialog"
          aria-label={compactIconOnly ? label : undefined}
          title={compactIconOnly ? label : undefined}
          onClick={() => setOpen(true)}
          className="grid w-full responsive-filter-trigger surface-card-finish cursor-pointer items-center text-start text-sm text-foreground focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring"
        >
          <span
            className="surface-control-finish flex items-center justify-center rounded-xl bg-primary/10 text-primary"
            style={{ width: 36, height: 36 }}
            aria-hidden="true"
          >
            <SlidersHorizontal size={20} />
          </span>
          <span className={compactIconOnly ? "sr-only" : "responsive-filter-copy"}>
            <span className="font-semibold leading-normal">{label}</span>
            <span className="responsive-filter-context">{summary}</span>
          </span>
          {!compactIconOnly && (
            <ChevronDown
              className="responsive-filter-chevron size-5 text-muted-foreground transition-transform duration-fast"
              aria-hidden="true"
            />
          )}
        </button>
      )}
      {compact
        ? open && (
            <ResponsiveSheet
              open={open}
              onClose={() => setOpen(false)}
              onCloseAutoFocus={(event) => {
                event.preventDefault();
                focus();
              }}
              title={label}
              language={language}
              direction={language === "ar" ? "rtl" : "ltr"}
              testId={`${testId}-sheet`}
              focusOnOpen
              drawerClassName="filter-sheet"
            >
              <SheetHeader
                title={label}
                language={language}
                onClose={() => setOpen(false)}
                className="filter-sheet-header"
              />
              <div className="min-h-0 overflow-y-auto p-3">
                {children({
                  compact,
                  collapse,
                  restoreSelectFocus: (event) => {
                    if (!open) {
                      event.preventDefault();
                      focus();
                    }
                  },
                })}
              </div>
            </ResponsiveSheet>
          )
        : children({ compact, collapse, restoreSelectFocus: () => undefined })}
    </div>
  );
}
