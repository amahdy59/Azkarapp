import "./surface-panel.css";
import { memo, useId, useMemo, useState } from "react";
import { getCalendarYearPeriods, type CalendarType } from "../calendarPeriods";
import { getProgressDayKey } from "../progress";
import { formatNumerals } from "../formatting";
import { dashboardText as text } from "../i18n/progressDashboard";
import {
  formatProgressRange,
  metricProgressRange,
  type ProgressDailyRecord,
  type ProgressRange,
  type ProgressPreset,
} from "../progressDashboard";
import { progressHeatmapDay, progressHeatmapGrid, type HeatmapDay, type HeatmapMetric } from "../progressHeatmap";
import type { AppLanguage } from "../types";
import { useMediaQuery } from "../hooks/useMediaQuery";
import { Calendar, Check, ChevronLeft, ChevronRight } from "./icons";
import { ProgressSelectField } from "./ProgressSelectField";
import { ResponsiveSheet, SheetHeader } from "./ResponsiveSheet";

const practices: readonly HeatmapMetric[] = ["routines", "prayers", "pages", "quranGoals"];

export const ProgressHeatmap = memo(function ProgressHeatmap({
  records,
  range,
  now,
  dayStart,
  currentDay,
  language,
  calendar,
  period,
  displayDate,
}: {
  records: readonly ProgressDailyRecord[];
  range: ProgressRange;
  now: Date;
  dayStart: number;
  currentDay: boolean;
  language: AppLanguage;
  calendar: CalendarType;
  period: ProgressPreset | "custom";
  displayDate: Date;
}) {
  const id = useId();
  const compact = useMediaQuery("(max-width: 599px)");
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [metric, setMetric] = useState<HeatmapMetric>("routines");
  const windows = useMemo(
    () => ({
      routines: metricProgressRange(range, "routines", now, dayStart, false, currentDay),
      prayers: metricProgressRange(range, "prayers", now, dayStart, false, currentDay),
      pages: metricProgressRange(range, "pages", now, dayStart, false, currentDay),
      quranGoals: metricProgressRange(range, "quranGoals", now, dayStart, false, currentDay),
    }),
    [range, now, dayStart, currentDay],
  );
  const window = windows[metric];
  const applied = currentDay ? window : range;
  const latestKey = window.endKey < applied.startKey ? applied.startKey : window.endKey;
  const [selection, setSelection] = useState<string | null>(null);
  const selectedKey = selection && selection >= applied.startKey && selection <= window.endKey ? selection : latestKey;
  const [monthChoice, setMonthChoice] = useState<string | null>(null);
  const monthKey =
    monthChoice && monthChoice >= applied.startKey && monthChoice <= applied.endKey ? monthChoice : selectedKey;
  const grid = useMemo(
    () => progressHeatmapGrid({ startKey: applied.startKey, endKey: applied.endKey }, monthKey, calendar, language),
    [applied.startKey, applied.endKey, monthKey, calendar, language],
  );
  const byDay = useMemo(() => new Map(records.map((row) => [row.dayKey, row])), [records]);
  const day = (dayKey: string, key = metric) =>
    progressHeatmapDay(byDay.get(dayKey), dayKey, key, applied, windows[key]);
  const value = (entry: HeatmapDay, key = metric) => {
    if (entry.value === null)
      return text(
        language,
        entry.kind === "none"
          ? "noPagesRecorded"
          : entry.kind === "outside"
            ? "outsideRange"
            : entry.kind === "future"
              ? "upcoming"
              : "unavailable",
      );
    if (key === "quranGoals" && entry.value === 1) return text(language, "readingGoalReached");
    return entry.possible === null
      ? `${formatNumerals(entry.value, language)} ${text(language, "pagesUnit")}`
      : text(language, "countOf", {
          count: formatNumerals(entry.value, language),
          total: formatNumerals(entry.possible, language),
        });
  };
  const selected = day(selectedKey);
  const fullDateFormat = useMemo(
    () =>
      new Intl.DateTimeFormat(language === "ar" ? "ar-EG" : "en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
        weekday: "long",
        calendar: calendar === "hijri" ? "islamic-umalqura" : "gregory",
      }),
    [language, calendar],
  );
  const dateLabel = (key: string) => fullDateFormat.format(new Date(`${key}T12:00:00`));
  const weekdays = useMemo(
    () =>
      Array.from({ length: 7 }, (_, index) => {
        const date = new Date(2026, 9, language === "ar" ? 17 + index : 18 + index, 12);
        return {
          short: new Intl.DateTimeFormat(language, { weekday: "short" }).format(date),
          label: new Intl.DateTimeFormat(language, { weekday: "short" }).format(date),
          full: new Intl.DateTimeFormat(language, { weekday: "long" }).format(date),
        };
      }),
    [language],
  );
  const enabledKeys = grid.days.filter((key) => key >= applied.startKey && key <= window.endKey);
  const months = useMemo(
    () => (period === "year" ? getCalendarYearPeriods(displayDate, calendar, language) : []),
    [period, displayDate, calendar, language],
  );
  const selectMonth = (key: string) => {
    const next = key < applied.startKey ? applied.startKey : key;
    setMonthChoice(next);
    setSelection(next <= window.endKey ? next : null);
  };
  const Previous = language === "ar" ? ChevronRight : ChevronLeft;
  const Next = language === "ar" ? ChevronLeft : ChevronRight;
  const details = (
    <section
      className="progress-date-details"
      data-testid="progress-date-details"
      aria-labelledby={`${id}-date-heading`}
    >
      <h3 id={`${id}-date-heading`} className="text-base font-bold">
        <time dateTime={selectedKey}>{dateLabel(selectedKey)}</time>
      </h3>
      <p className="my-3 text-sm" role="status" aria-atomic="true">
        {text(language, metric)}: <bdi className="font-bold">{value(selected)}</bdi>
      </p>
      <dl className="divide-y divide-border">
        {practices
          .filter((key) => key !== metric)
          .map((key) => (
            <div key={key} className="progress-date-detail-row">
              <dt>{text(language, `short_${key}`)}</dt>
              <dd className="font-semibold">
                <bdi>{value(day(selectedKey, key), key)}</bdi>
              </dd>
            </div>
          ))}
      </dl>
    </section>
  );
  const scale =
    metric === "pages"
      ? ["0", "1–4", "5–10", "11–20", "21+"]
      : Array.from({ length: metric === "prayers" ? 6 : metric === "routines" ? 4 : 2 }, (_, count) => String(count));
  const legend = (
    <>
      <div className="heatmap-scale" aria-hidden="true">
        {scale.map((label, index) => (
          <span key={label}>
            <i
              className="heatmap-day"
              data-level={metric === "pages" ? index : Math.ceil((index / (scale.length - 1)) * 4)}
            />
            {formatNumerals(label, language)}
          </span>
        ))}
      </div>
      <p className="mt-3 progress-help" data-testid="progress-heatmap-legend">
        {text(language, metric === "pages" ? "pageHeatmapLegend" : "heatmapLegend")}
      </p>
    </>
  );
  return (
    <section
      className="progress-summary-card progress-heatmap"
      data-material-card="dense"
      data-testid="progress-heatmap"
      aria-labelledby={`${id}-heading`}
    >
      <div className="heatmap-heading">
        <div className="min-w-0">
          <h2 id={`${id}-heading`} className="surface-panel-heading">
            <span className="surface-panel-icon surface-control-finish" aria-hidden="true">
              <Calendar size={20} />
            </span>
            {text(language, "heatmap")}
          </h2>
          <p id={`${id}-help`} className="mt-1 progress-help">
            {text(language, "heatmapHelp")}
          </p>
        </div>
        <ProgressSelectField
          label={text(language, "heatmapPractice")}
          value={metric}
          onChange={setMetric}
          language={language}
          icon={Calendar}
          options={practices.map((key) => ({ value: key, label: text(language, `short_${key}`) }))}
        />
      </div>
      {months.length > 0 && (
        <div className="progress-month-overview" role="group" aria-label={text(language, "chooseMonth")}>
          {months.map((month) => {
            const key = getProgressDayKey(month.startDate, 0);
            const end = getProgressDayKey(month.endDate, 0);
            return (
              <button
                key={key}
                type="button"
                className="progress-month-button progress-focus"
                disabled={key > window.endKey}
                aria-pressed={monthKey >= key && monthKey <= end}
                onClick={() => selectMonth(key)}
              >
                {month.monthLabel}
              </button>
            );
          })}
        </div>
      )}
      <div className="heatmap-layout">
        <div className="min-w-0">
          {grid.long ? (
            <div className="heatmap-month-nav">
              <button
                type="button"
                className="progress-month-button progress-focus"
                aria-label={text(language, "previousMonth")}
                disabled={getProgressDayKey(grid.month.startDate, 0) <= applied.startKey}
                onClick={() => selectMonth(grid.previous)}
              >
                <Previous size={18} aria-hidden="true" />
              </button>
              <h3 className="min-w-0 text-center text-sm font-bold">
                {grid.month.monthLabel} {grid.month.yearLabel}
              </h3>
              <button
                type="button"
                className="progress-month-button progress-focus"
                aria-label={text(language, "nextMonth")}
                disabled={getProgressDayKey(grid.month.endDate, 0) >= window.endKey}
                onClick={() => selectMonth(grid.next)}
              >
                <Next size={18} aria-hidden="true" />
              </button>
            </div>
          ) : (
            <p className="my-3 text-sm font-semibold">{formatProgressRange(applied, language, calendar)}</p>
          )}
          <div className="heatmap-scroll progress-focus">
            <div className="heatmap-calendar">
              <div className="heatmap-grid heatmap-weekdays mb-2" aria-hidden="true">
                {weekdays.map(({ short, full }, index) => (
                  <span key={index} className="text-center text-xs font-semibold">
                    <abbr title={full}>{short}</abbr>
                  </span>
                ))}
              </div>
              <div
                className="heatmap-grid"
                role="group"
                aria-label={text(language, "heatmapDates")}
                aria-describedby={`${id}-help`}
              >
                {grid.days.map((key) => {
                  const entry = day(key);
                  const disabled = entry.kind === "outside" || entry.kind === "future";
                  const date = new Date(`${key}T12:00:00`);
                  const parts = fullDateFormat.formatToParts(date);
                  const number = parts.find((part) => part.type === "day")!.value;

                  return (
                    <button
                      key={key}
                      id={`${id}-${key}`}
                      type="button"
                      data-day={key}
                      data-kind={entry.kind}
                      data-level={entry.level}
                      className="heatmap-day progress-focus"
                      disabled={disabled}
                      aria-pressed={key === selectedKey && !disabled}
                      aria-label={`${dateLabel(key)} · ${text(language, metric)}: ${value(entry)}`}
                      aria-haspopup={compact ? "dialog" : undefined}
                      tabIndex={key === selectedKey || (disabled && !enabledKeys.length) ? 0 : -1}
                      onClick={() => {
                        setSelection(key);
                        if (compact) setDetailsOpen(true);
                      }}
                      onKeyDown={(event) => {
                        const index = enabledKeys.indexOf(key);
                        const columns =
                          getComputedStyle(event.currentTarget.parentElement!)
                            .gridTemplateColumns.split(" ")
                            .filter(Boolean).length || 7;
                        const delta =
                          event.key === "ArrowDown"
                            ? columns
                            : event.key === "ArrowUp"
                              ? -columns
                              : event.key === "ArrowRight"
                                ? language === "ar"
                                  ? -1
                                  : 1
                                : event.key === "ArrowLeft"
                                  ? language === "ar"
                                    ? 1
                                    : -1
                                  : null;
                        const target =
                          event.key === "Home"
                            ? 0
                            : event.key === "End"
                              ? enabledKeys.length - 1
                              : delta === null
                                ? null
                                : Math.max(0, Math.min(enabledKeys.length - 1, index + delta));
                        if (target !== null && enabledKeys[target]) {
                          event.preventDefault();
                          setSelection(enabledKeys[target]);
                          document.getElementById(`${id}-${enabledKeys[target]}`)?.focus();
                        }
                      }}
                    >
                      <span className="heatmap-weekday" aria-hidden="true">
                        {weekdays[(date.getDay() + (language === "ar" ? 1 : 0)) % 7]?.label}
                      </span>
                      <time dateTime={key}>{number}</time>
                      <span className="heatmap-count" aria-hidden="true">
                        {metric === "quranGoals" && entry.value === 1 ? (
                          <Check size={14} />
                        ) : entry.value === null ? (
                          "—"
                        ) : (
                          formatNumerals(entry.value, language)
                        )}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
          {compact && legend}
        </div>
        {!compact && (
          <div className="heatmap-detail-rail">
            {details}
            <div className="heatmap-legend-card">{legend}</div>
          </div>
        )}
      </div>
      {compact && (
        <ResponsiveSheet
          open={detailsOpen}
          onClose={() => setDetailsOpen(false)}
          title={text(language, "selectedDay")}
          language={language}
          direction={language === "ar" ? "rtl" : "ltr"}
          testId="progress-date-sheet"
          focusOnOpen
        >
          <SheetHeader
            title={text(language, "selectedDay")}
            onClose={() => setDetailsOpen(false)}
            language={language}
          />
          <div className="overflow-y-auto p-4">{details}</div>
        </ResponsiveSheet>
      )}
    </section>
  );
});
