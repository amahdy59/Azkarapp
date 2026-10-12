import "./progress-period-navigation.css";
import { IconButton } from "./LayoutShells";
import { ChevronPrevious, ChevronNext } from "./icons";
import { t } from "../i18n";
import type { AppLanguage } from "../types";

export function ProgressPeriodNavigation({
  heading,
  language,
  onPrevious,
  onNext,
  nextDisabled,
}: {
  heading: { primary: string; secondary?: string; accessible: string };
  language: AppLanguage;
  onPrevious: () => void;
  onNext: () => void;
  nextDisabled: boolean;
}) {
  return (
    <div
      data-testid="progress-period-navigation"
      className="progress-period-navigation mt-3 min-h-16 items-center gap-2 border-b border-border px-1 py-3"
    >
      <IconButton onClick={onPrevious} label={t(language, "garden.prevPeriod")}>
        <ChevronPrevious size={18} aria-hidden="true" />
      </IconButton>
      <span
        data-testid="garden-view-date"
        className="min-w-0 break-words px-1 text-center leading-relaxed text-foreground"
        dir="auto"
        aria-live="polite"
        aria-atomic="true"
      >
        <span className="sr-only">{heading.accessible}</span>
        <span aria-hidden="true" className="block text-sm font-bold">
          {heading.primary}
        </span>
        {heading.secondary && (
          <span aria-hidden="true" className="mt-1 block text-xs font-medium text-muted-foreground">
            {heading.secondary}
          </span>
        )}
      </span>
      <IconButton onClick={onNext} disabled={nextDisabled} label={t(language, "garden.nextPeriod")}>
        <ChevronNext size={18} aria-hidden="true" />
      </IconButton>
    </div>
  );
}
