import { useId, useState } from "react";
import type { CalendarType } from "../calendarPeriods";
import type { AppLanguage } from "../types";
import { dashboardText as text } from "../i18n/progressDashboard";
import {
  formatProgressRange,
  validateProgressRange,
  type ProgressPreset,
  type ProgressRange,
} from "../progressDashboard";
import { ChevronPrevious, ChevronNext, Calendar, Globe } from "./icons";
import { ProgressSelectField } from "./ProgressSelectField";
import { IconButton } from "./LayoutShells";
import { ResponsiveFilters } from "./ResponsiveFilters";

const rangeActionClass = "min-h-11 rounded-lg px-3 text-xs font-semibold underline underline-offset-4 progress-focus";

export function ProgressRangeToolbar({
  period,
  range,
  today,
  language,
  calendar,
  onPeriod,
  onCalendar,
  onCustom,
  onPrevious,
  onNext,
  onToday,
  nextDisabled,
}: {
  period: ProgressPreset | "custom";
  range: ProgressRange;
  today: string;
  language: AppLanguage;
  calendar: CalendarType;
  onPeriod: (period: ProgressPreset) => void;
  onCalendar: (calendar: CalendarType) => void;
  onCustom: (range: ProgressRange) => void;
  onPrevious: () => void;
  onNext: () => void;
  onToday: () => void;
  nextDisabled: boolean;
}) {
  const id = useId();
  const focusPeriod = () => document.getElementById(`${id}-period`)?.focus();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(range);
  const [error, setError] = useState<ReturnType<typeof validateProgressRange>>(null);
  const edit = () => {
    setDraft({
      startKey: range.startKey > today ? today : range.startKey,
      endKey: range.endKey > today ? today : range.endKey,
    });
    setError(null);
    setEditing(true);
  };
  const fieldClass =
    "min-h-11 w-full min-w-0 rounded-lg border border-border-control bg-card px-3 py-2 text-sm text-foreground progress-focus";
  return (
    <div className="progress-range-toolbar" role="group" aria-label={text(language, "period")}>
      <ResponsiveFilters
        compactLabel
        label={text(language, "rangeFilters")}
        summary={`${text(language, period)} · ${text(language, calendar)}`}
        testId="progress-range-disclosure"
      >
        {({ collapse, restoreSelectFocus }) => (
          <>
            <div className="progress-range-fields" data-testid="progress-range-fields">
              <ProgressSelectField
                onCloseAutoFocus={restoreSelectFocus}
                triggerId={`${id}-period`}
                label={text(language, "period")}
                language={language}
                icon={Calendar}
                value={editing ? "custom" : period}
                options={(["day", "week", "month", "year", "custom"] as const).map((value) => ({
                  value,
                  label: text(language, value),
                }))}
                onChange={(value) => {
                  if (value === "custom") edit();
                  else {
                    setEditing(false);
                    setError(null);
                    onPeriod(value);
                    collapse();
                  }
                }}
              />
              <ProgressSelectField
                onCloseAutoFocus={restoreSelectFocus}
                label={text(language, "calendar")}
                language={language}
                icon={Globe}
                value={calendar}
                options={(["gregorian", "hijri"] as const).map((value) => ({ value, label: text(language, value) }))}
                onChange={(value) => {
                  onCalendar(value);
                  if (!editing) collapse();
                }}
              />
            </div>
            {period === "custom" && !editing && (
              <button type="button" className={rangeActionClass} onClick={edit}>
                {text(language, "editDates")}
              </button>
            )}
            {editing && (
              <form
                className="mt-2 space-y-3 border-t border-border pt-3"
                onSubmit={(event) => {
                  event.preventDefault();
                  const problem = validateProgressRange(draft, today);
                  setError(problem);
                  if (!problem) {
                    onCustom(draft);
                    setEditing(false);
                    if (!collapse()) focusPeriod();
                  }
                }}
                noValidate
              >
                <p id={`${id}-help`} className="progress-help">
                  {text(language, "dateHelp")}
                </p>
                <div className="progress-range-fields">
                  {(["startKey", "endKey"] as const).map((key) => (
                    <label key={key} className="block min-w-0 space-y-1 text-xs font-semibold">
                      <span>{text(language, key === "startKey" ? "start" : "end")}</span>
                      <input
                        className={fieldClass}
                        type="date"
                        dir="ltr"
                        value={draft[key]}
                        max={today}
                        aria-invalid={Boolean(error)}
                        aria-describedby={`${id}-help${error ? ` ${id}-error` : ""}`}
                        onChange={(event) => {
                          setDraft({ ...draft, [key]: event.target.value });
                          setError(null);
                        }}
                      />
                    </label>
                  ))}
                </div>
                {error && (
                  <p id={`${id}-error`} role="alert" className="text-sm font-semibold text-destructive">
                    {text(language, error)}
                  </p>
                )}
                <div className="flex flex-wrap gap-2">
                  <button
                    type="submit"
                    className="min-h-11 rounded-lg bg-primary px-4 py-2 text-sm font-bold text-primary-foreground progress-focus"
                  >
                    {text(language, "apply")}
                  </button>
                  <button
                    type="button"
                    className="min-h-11 rounded-lg border border-border-control px-4 py-2 text-sm font-semibold progress-focus"
                    onClick={() => {
                      setEditing(false);
                      setError(null);
                      if (!collapse()) focusPeriod();
                    }}
                  >
                    {text(language, "cancel")}
                  </button>
                </div>
              </form>
            )}
          </>
        )}
      </ResponsiveFilters>
      <div
        className="progress-range-navigation mt-2 flex min-w-0 flex-wrap items-center gap-1"
        data-testid="progress-period-navigation"
      >
        <div className="flex min-w-[min(100%,14rem)] flex-1 items-center gap-1">
          <IconButton label={text(language, "previous")} onClick={onPrevious}>
            <ChevronPrevious size={18} aria-hidden="true" />
          </IconButton>
          <p
            className="min-w-0 flex-1 break-words text-center text-sm font-semibold leading-relaxed"
            role="status"
            aria-atomic="true"
            data-testid="garden-view-date"
          >
            {formatProgressRange(range, language, calendar)}
          </p>
          <IconButton label={text(language, "next")} onClick={onNext} disabled={nextDisabled}>
            <ChevronNext size={18} aria-hidden="true" />
          </IconButton>
        </div>
        <button
          type="button"
          className={rangeActionClass}
          onClick={() => {
            setEditing(false);
            setError(null);
            onToday();
          }}
        >
          {text(language, "today")}
        </button>
      </div>
    </div>
  );
}
