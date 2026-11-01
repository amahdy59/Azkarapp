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
import { Calendar, ChevronLeft, ChevronRight } from "./icons";
import { ProgressSelectField } from "./ProgressSelectField";

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
  const [metric, setMetric] = useState<HeatmapMetric>("routines");
  const window = metricProgressRange(range, metric, now, dayStart, false, currentDay);
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
    progressHeatmapDay(
      byDay.get(dayKey),
      dayKey,
      key,
      applied,
      metricProgressRange(range, key, now, dayStart, false, currentDay),
    );
  const value = (entry: HeatmapDay) =>
    entry.value === null
      ? text(language, entry.kind === "outside" ? "outsideRange" : entry.kind === "future" ? "upcoming" : "unavailable")
      : entry.possible === null
        ? `${formatNumerals(entry.value, language)} ${text(language, "pagesUnit")}`
        : text(language, "countOf", {
            count: formatNumerals(entry.value, language),
            total: formatNumerals(entry.possible, language),
          });
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
  const numberFormat = useMemo(
    () =>
      new Intl.DateTimeFormat(language === "ar" ? "ar-EG" : "en-GB", {
        day: "numeric",
        calendar: calendar === "hijri" ? "islamic-umalqura" : "gregory",
      }),
    [language, calendar],
  );
  const monthFormat = useMemo(
    () =>
      new Intl.DateTimeFormat(language === "ar" ? "ar-EG" : "en-GB", {
        month: "short",
        calendar: calendar === "hijri" ? "islamic-umalqura" : "gregory",
      }),
    [language, calendar],
  );
  const weekdays = useMemo(
    () =>
      Array.from({ length: 7 }, (_, index) => {
        const date = new Date(2026, 9, language === "ar" ? 17 + index : 18 + index, 12);
        return {
          short: new Intl.DateTimeFormat(language, { weekday: "narrow" }).format(date),
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
  return (
    <section
      className="progress-summary-card progress-heatmap"
      data-material-card
      data-testid="progress-heatmap"
      aria-labelledby={`${id}-heading`}
    >
      <div className="progress-heatmap-heading">
        <div className="min-w-0">
          <h2 id={`${id}-heading`} className="text-lg font-bold">
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
      <div className="progress-heatmap-layout">
        <div className="min-w-0">
          {grid.long ? (
            <div className="progress-heatmap-month-nav">
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
          {/* This labelled viewport provides native keyboard scrolling for enlarged calendars. */}
          <div
            role="region"
            aria-label={text(language, "heatmapDates")}
            aria-describedby={`${id}-help`}
            className="progress-heatmap-scroll progress-focus"
            // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex
            tabIndex={0}
          >
            <div className="progress-heatmap-calendar">
              <div className="progress-heatmap-grid mb-2" aria-hidden="true">
                {weekdays.map(({ short, full }, index) => (
                  <span key={index} className="text-center text-xs font-semibold">
                    <abbr title={full}>{short}</abbr>
                  </span>
                ))}
              </div>
              <div className="progress-heatmap-grid" role="group" aria-label={text(language, "heatmapDates")}>
                {grid.days.map((key) => {
                  const entry = day(key);
                  const disabled = entry.kind === "outside" || entry.kind === "future";
                  const date = new Date(`${key}T12:00:00`);
                  const monthStart =
                    numberFormat
                      .formatToParts(date)
                      .find((part) => part.type === "day")
                      ?.value.replace(/[٠-٩]/g, (digit) => String("٠١٢٣٤٥٦٧٨٩".indexOf(digit))) === "1";
                  return (
                    <button
                      key={key}
                      id={`${id}-${key}`}
                      type="button"
                      data-day={key}
                      data-kind={entry.kind}
                      data-level={entry.level}
                      className="progress-heatmap-day progress-focus"
                      disabled={disabled}
                      aria-pressed={key === selectedKey && !disabled}
                      aria-label={`${dateLabel(key)} · ${text(language, metric)}: ${value(entry)}`}
                      tabIndex={key === selectedKey || (disabled && !enabledKeys.length) ? 0 : -1}
                      onClick={() => setSelection(key)}
                      onKeyDown={(event) => {
                        const index = enabledKeys.indexOf(key);
                        const delta =
                          event.key === "ArrowDown"
                            ? 7
                            : event.key === "ArrowUp"
                              ? -7
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
                          document.getElementById(`${id}-${enabledKeys[target]}`)?.focus({ preventScroll: true });
                        }
                      }}
                    >
                      <time dateTime={key}>
                        {numberFormat.format(date)}
                        {(monthStart || key === applied.startKey) && (
                          <span className="progress-heatmap-month-label">{monthFormat.format(date)}</span>
                        )}
                      </time>
                      <span className="progress-heatmap-count" aria-hidden="true">
                        {entry.value === null ? "—" : formatNumerals(entry.value, language)}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
          <p className="mt-3 progress-help" data-testid="progress-heatmap-legend">
            {text(language, metric === "pages" ? "pageHeatmapLegend" : "heatmapLegend")}
          </p>
        </div>
        <section
          className="progress-date-details"
          data-testid="progress-date-details"
          aria-labelledby={`${id}-date-heading`}
        >
          <h3 id={`${id}-date-heading`} className="text-base font-bold">
            {text(language, "selectedDay")}
          </h3>
          <p className="mt-2 text-sm font-semibold">
            <time dateTime={selectedKey}>{dateLabel(selectedKey)}</time>
          </p>
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
                    <bdi>{value(day(selectedKey, key))}</bdi>
                  </dd>
                </div>
              ))}
          </dl>
        </section>
      </div>
    </section>
  );
});
