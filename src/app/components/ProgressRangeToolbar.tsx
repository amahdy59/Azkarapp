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
import { Calendar } from "./icons";
import { ProgressSelectField } from "./ProgressSelectField";
import { ResponsiveSheet, SheetHeader } from "./ResponsiveSheet";
import { FIELD_CONTROL_CLASS, FIELD_LABEL_CLASS } from "./FormField";

export function ProgressRangeToolbar({
  period,
  range,
  today,
  language,
  calendar,
  onPeriod,
  onCustom,
  dateTestId = "garden-view-date",
}: {
  period: ProgressPreset | "custom";
  range: ProgressRange;
  today: string;
  language: AppLanguage;
  calendar: CalendarType;
  onPeriod: (period: ProgressPreset) => void;
  onCustom: (range: ProgressRange) => void;
  dateTestId?: string;
}) {
  const id = useId();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(range);
  const [error, setError] = useState<ReturnType<typeof validateProgressRange>>(null);
  const close = () => {
    setEditing(false);
    setError(null);
  };
  const focus = () => document.getElementById(`${id}-period`)?.focus({ preventScroll: true });
  return (
    <div className="progress-range-toolbar" role="group" aria-label={text(language, "dateRange")}>
      <ProgressSelectField<ProgressPreset | "custom" | "editDates">
        triggerId={`${id}-period`}
        label={text(language, "dateRange")}
        value={editing ? "custom" : period}
        language={language}
        icon={Calendar}
        displayValue={
          <span className="block" role="status" aria-atomic="true" data-testid={dateTestId}>
            <span className="progress-range-preset">{text(language, period)}</span>
            <span className="progress-range-dates">{formatProgressRange(range, language, calendar)}</span>
          </span>
        }
        options={(["last30", "day", "week", "month", "year", "custom"] as const).map((value) => ({
          value: value === "custom" && period === "custom" ? "editDates" : value,
          label: text(language, value === "custom" && period === "custom" ? "editDates" : value),
        }))}
        onCloseAutoFocus={(event) => {
          if (editing) event.preventDefault();
        }}
        onChange={(value) => {
          if (value === "custom" || value === "editDates") {
            setDraft({
              startKey: range.startKey > today ? today : range.startKey,
              endKey: range.endKey > today ? today : range.endKey,
            });
            setError(null);
            setEditing(true);
          } else onPeriod(value);
        }}
      />
      <ResponsiveSheet
        open={editing}
        onClose={close}
        onCloseAutoFocus={(event) => {
          event.preventDefault();
          focus();
        }}
        title={text(language, "custom")}
        language={language}
        direction={language === "ar" ? "rtl" : "ltr"}
        testId="progress-date-sheet"
        focusOnOpen
        drawerClassName="progress-date-sheet overflow-hidden"
      >
        <SheetHeader
          title={text(language, "custom")}
          language={language}
          onClose={close}
          className="progress-date-sheet-header"
        />
        <form
          className="min-h-0 space-y-4 overflow-y-auto px-4 pb-4"
          noValidate
          onSubmit={(event) => {
            event.preventDefault();
            const problem = validateProgressRange(draft, today);
            setError(problem);
            if (!problem) {
              onCustom(draft);
              close();
            }
          }}
        >
          <p id={`${id}-help`} className="progress-help">
            {text(language, "dateHelp")}
          </p>
          <div className="progress-range-fields">
            {(["startKey", "endKey"] as const).map((key) => (
              <label key={key} className={`block min-w-0 space-y-1 ${FIELD_LABEL_CLASS}`}>
                <span>{text(language, key === "startKey" ? "start" : "end")}</span>
                <input
                  className={FIELD_CONTROL_CLASS}
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
              onClick={close}
            >
              {text(language, "cancel")}
            </button>
          </div>
        </form>
      </ResponsiveSheet>
    </div>
  );
}
