import { useId, type ReactNode } from "react";
import { ChevronDown } from "./icons";
import { t } from "../i18n";
import type { AppLanguage } from "../types";
import "./reader-footer.css";

export function ReaderFooterTools({
  language,
  expanded = true,
  onToggle,
  children,
  primary,
}: {
  language?: AppLanguage;
  expanded?: boolean;
  onToggle?: () => void;
  children: ReactNode;
  primary?: ReactNode;
}) {
  const toolsId = useId();
  return (
    <div className="reader-footer-composition w-full" data-expanded={expanded}>
      {onToggle && language && (
        <div className="reader-tools-disclosure flex items-center justify-center gap-3 py-1" data-reading-chrome>
          <button
            type="button"
            data-testid="reader-tools-toggle"
            aria-expanded={expanded}
            aria-controls={toolsId}
            aria-label={t(language, expanded ? "reader.hideTools" : "reader.showTools")}
            title={t(language, expanded ? "reader.hideTools" : "reader.showTools")}
            onClick={(event) => {
              event.stopPropagation();
              onToggle();
            }}
            className="reader-tools-toggle inline-flex min-h-11 min-w-11 items-center justify-center gap-2 rounded-xl border border-border bg-muted/40 px-3 text-label font-medium text-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring"
          >
            <span className="inline-grid">
              <span className="col-start-1 row-start-1">
                {t(language, expanded ? "reader.hideTools" : "reader.showTools")}
              </span>
              <span aria-hidden="true" className="invisible col-start-1 row-start-1">
                {t(language, expanded ? "reader.showTools" : "reader.hideTools")}
              </span>
            </span>
            <span
              className="reader-tools-chevron flex size-6 shrink-0 items-center justify-center rounded-full bg-card"
              aria-hidden="true"
            >
              <ChevronDown size={16} className={expanded ? undefined : "rotate-180"} />
            </span>
          </button>
        </div>
      )}
      <div
        className="reader-tools-actions"
        data-reading-chrome
        id={toolsId}
        aria-hidden={!expanded}
        style={{ visibility: expanded ? "visible" : "hidden" }}
      >
        {children}
      </div>
      {primary && <div className="reader-primary-actions">{primary}</div>}
    </div>
  );
}
