import { useEffect, useId, useRef, useState } from "react";
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
import { ResponsiveSheet, SheetHeader } from "./ResponsiveSheet";
import { useLayoutMode } from "../hooks/useLayoutMode";

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
  onMonth,
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
  onMonth?: (month: string) => void;
  onPrevious: () => void;
  onNext: () => void;
  onToday: () => void;
  nextDisabled: boolean;
}) {
  const id = useId();
  const compact = useLayoutMode() === "compact";
  const focusPeriod = () => document.getElementById(`${id}-period`)?.focus();
  const [editing, setEditing] = useState(false);
  const [mode, setMode] = useState<"single" | "month" | "range">("range");
  const [monthDraft, setMonthDraft] = useState(range.startKey.slice(0, 7));
  const toolbar = useRef<HTMLDivElement>(null);
  const datesTrigger = useRef<HTMLButtonElement>(null);
  const returnToDates = useRef(false);
  const [draft, setDraft] = useState(range);
  const [error, setError] = useState<ReturnType<typeof validateProgressRange>>(null);
  useEffect(() => {
    const editor = toolbar.current?.querySelector("form");
    if (!editing || !editor) return;
    if (returnToDates.current) editor.querySelector<HTMLInputElement>("input:checked")?.focus();
    const cancel = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      event.preventDefault();
      setEditing(false);
      setError(null);
      const disclosure = toolbar.current?.querySelector("details");
      const summary = disclosure?.querySelector("summary");
      if (summary && getComputedStyle(summary).display !== "none") {
        disclosure!.open = false;
        summary.focus();
      } else if (returnToDates.current) datesTrigger.current?.focus();
      else document.getElementById(`${id}-period`)?.focus();
    };
    editor.addEventListener("keydown", cancel);
    return () => editor.removeEventListener("keydown", cancel);
  }, [editing, id, compact]);
  const edit = (fromDates = false) => {
    returnToDates.current = fromDates;
    setMode(range.startKey === range.endKey ? "single" : "range");
    setMonthDraft((range.startKey > today ? today : range.startKey).slice(0, 7));
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
    <div ref={toolbar} className="progress-range-toolbar" role="group" aria-label={text(language, "period")}>
      <div
        className="progress-range-navigation mt-2 flex min-w-0 flex-wrap items-center gap-1"
        data-testid="progress-period-navigation"
      >
        <div className="flex min-w-0 flex-1 flex-wrap items-center justify-between gap-1">
          <IconButton label={text(language, "previous")} onClick={onPrevious}>
            <ChevronPrevious size={18} aria-hidden="true" />
          </IconButton>
          <button
            ref={datesTrigger}
            type="button"
            className="flex min-h-11 min-w-full order-first items-center justify-center gap-2 rounded-lg px-1 text-center text-sm font-semibold leading-relaxed progress-focus min-[420px]:order-none min-[420px]:min-w-0 min-[420px]:flex-1"
            aria-label={`${text(language, "pickDates")}: ${formatProgressRange(range, language, calendar)}`}
            aria-expanded={editing}
            aria-controls={editing ? `${id}-date-editor` : undefined}
            onClick={() => {
              const disclosure = toolbar.current?.querySelector("details");
              if (disclosure) disclosure.open = true;
              edit(true);
            }}
          >
            <Calendar className="size-4 shrink-0" aria-hidden="true" />
            <span className="min-w-0 truncate" role="status" aria-atomic="true" data-testid="garden-view-date">
              {formatProgressRange(range, language, calendar)}
            </span>
          </button>
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
      <ResponsiveFilters
        language={language}
        label={text(language, "rangeFilters")}
        summary={`${text(language, period === "custom" && range.startKey === range.endKey ? "singleDate" : period)} · ${text(language, calendar)}`}
        testId="progress-range-disclosure"
      >
        {({ collapse, restoreSelectFocus }) => {
          const form = (
            <form
              id={`${id}-date-editor`}
              className="mt-2 space-y-3 border-t border-border pt-3"
              onSubmit={(event) => {
                event.preventDefault();
                const selected = mode === "single" ? { startKey: draft.startKey, endKey: draft.startKey } : draft;
                const problem =
                  mode === "month"
                    ? !/^\d{4}-(0[1-9]|1[0-2])$/.test(monthDraft) || monthDraft.startsWith("0000")
                      ? "invalid"
                      : monthDraft > today.slice(0, 7)
                        ? "future"
                        : null
                    : validateProgressRange(selected, today);
                setError(problem);
                if (!problem) {
                  if (mode === "month") {
                    if (onMonth) onMonth(monthDraft);
                    else {
                      const [year, month] = monthDraft.split("-").map(Number);
                      const end = `${monthDraft}-${new Date(year!, month!, 0).getDate()}`;
                      onCustom({ startKey: `${monthDraft}-01`, endKey: end > today ? today : end });
                    }
                  } else onCustom(selected);
                  setEditing(false);
                  if (!collapse()) {
                    if (returnToDates.current) datesTrigger.current?.focus();
                    else focusPeriod();
                  }
                }
              }}
              noValidate
            >
              <p id={`${id}-help`} className="sr-only">
                {text(language, "dateHelp")}
              </p>
              {compact && (
                <ProgressSelectField
                  label={text(language, "calendarShort")}
                  language={language}
                  icon={Globe}
                  value={calendar}
                  options={(["gregorian", "hijri"] as const).map((value) => ({ value, label: text(language, value) }))}
                  onChange={onCalendar}
                />
              )}
              <fieldset className="flex flex-wrap gap-2">
                <legend className="sr-only">{text(language, "dateMode")}</legend>
                {(["single", "month", "range"] as const).map((value) => (
                  <label
                    key={value}
                    className="flex min-h-11 cursor-pointer items-center gap-2 rounded-lg border border-border-control bg-card px-3 py-2 text-xs font-semibold"
                  >
                    <input
                      type="radio"
                      name={`${id}-mode`}
                      value={value}
                      checked={mode === value}
                      onChange={() => {
                        setMode(value);
                        setError(null);
                      }}
                      className="size-4 accent-primary progress-focus"
                    />
                    {text(language, value === "single" ? "singleDate" : value === "month" ? "month" : "custom")}
                  </label>
                ))}
              </fieldset>
              <div className="progress-range-fields">
                {mode === "month" ? (
                  <label className="block min-w-0 space-y-1 text-xs font-semibold">
                    <span>{text(language, "monthDate")}</span>
                    <input
                      className={fieldClass}
                      type="month"
                      dir="ltr"
                      value={monthDraft}
                      max={today.slice(0, 7)}
                      placeholder="YYYY-MM"
                      aria-invalid={Boolean(error)}
                      aria-describedby={error ? `${id}-error` : undefined}
                      onChange={(event) => {
                        setMonthDraft(event.target.value);
                        setError(null);
                      }}
                    />
                  </label>
                ) : (
                  (mode === "single" ? (["startKey"] as const) : (["startKey", "endKey"] as const)).map((key) => (
                    <label key={key} className="block min-w-0 space-y-1 text-xs font-semibold">
                      <span>
                        {text(language, mode === "single" ? "gregorianDate" : key === "startKey" ? "start" : "end")}
                      </span>
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
                  ))
                )}
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
                    if (!collapse()) {
                      if (returnToDates.current) datesTrigger.current?.focus();
                      else focusPeriod();
                    }
                  }}
                >
                  {text(language, "cancel")}
                </button>
              </div>
            </form>
          );
          return (
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
                <button type="button" className={rangeActionClass} onClick={() => edit()}>
                  {text(language, "editDates")}
                </button>
              )}
              {editing &&
                (compact ? (
                  <ResponsiveSheet
                    open
                    onCloseAutoFocus={(event) => {
                      event.preventDefault();
                      datesTrigger.current?.focus({ preventScroll: true });
                    }}
                    onClose={() => {
                      setEditing(false);
                      setError(null);
                      collapse();
                    }}
                    title={text(language, "pickDates")}
                    language={language}
                    direction={language === "ar" ? "rtl" : "ltr"}
                    testId="progress-date-sheet"
                    focusOnOpen
                    drawerClassName="progress-date-sheet overflow-hidden"
                  >
                    <SheetHeader
                      className="progress-date-sheet-header"
                      title={text(language, "pickDates")}
                      language={language}
                      onClose={() => {
                        setEditing(false);
                        setError(null);
                        collapse();
                      }}
                    />
                    <div className="min-h-0 overflow-y-auto overscroll-contain px-4 pb-4" data-vaul-no-drag>
                      {form}
                    </div>
                  </ResponsiveSheet>
                ) : (
                  form
                ))}
            </>
          );
        }}
      </ResponsiveFilters>
    </div>
  );
}
