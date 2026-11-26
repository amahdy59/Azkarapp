import { ProgressSelectField } from "./ProgressSelectField";
import {
  BarChart3,
  BookOpen,
  CheckCircle2,
  Moon,
  MoonStar,
  Building,
  ClockCheck,
  Feather,
  Repeat,
  Sun,
  Sunrise,
  Sprout,
} from "./icons";
import { ProgressBar } from "./ProgressBar";
import { useId, useMemo, useState, type ReactNode } from "react";
import type { AppLanguage } from "../types";
import type { CalendarType } from "../calendarPeriods";
import { dashboardText as text } from "../i18n/progressDashboard";
import { formatNumerals, formatPercentage } from "../formatting";
import {
  DEFAULT_PROGRESS_METRICS,
  compareProgressMetric,
  PROGRESS_METRICS,
  dashboardProgressTimeline,
  formatProgressRange,
  matchedDashboardRanges,
  metricProgressRange,
  summarizeProgressMetric,
  type ProgressDailyRecord,
  type ProgressMetric,
  type ProgressPreset,
  type ProgressRange,
} from "../progressDashboard";
import { RecordingTimeline } from "./RecordingTimeline";
import { ProgressHeatmap } from "./ProgressHeatmap";
import { ProgressRoutineComparison } from "./ProgressRoutineComparison";
import { ProgressMetricCard } from "./ProgressMetricCard";
import { Button } from "./ui/button";
import { ChevronDown } from "./icons";

const summary = "progress-disclosure";
export type ProgressDashboardView = "overview" | "trends";
const METRIC_ICONS = {
  prayers: ClockCheck,
  routines: Feather,
  pages: BookOpen,
  quranGoals: CheckCircle2,
  mosque: Building,
  rawatib: Sunrise,
  adhkar: Repeat,
  morning: Sun,
  evening: Moon,
  sleep: MoonStar,
} as const;

export function ProgressDashboard({
  records,
  range,
  period,
  displayDate,
  now,
  dayStart,
  currentDay,
  language,
  calendar,
  view = "overview",
  onShowTrend,
  onChooseWeek,
  renderBreakdown,
  renderSpecial,
}: {
  records: readonly ProgressDailyRecord[];
  range: ProgressRange;
  period: ProgressPreset | "custom";
  displayDate: Date;
  now: Date;
  dayStart: number;
  currentDay: boolean;
  language: AppLanguage;
  calendar: CalendarType;
  view?: ProgressDashboardView;
  onShowTrend?: () => void;
  onChooseWeek?: () => void;
  renderBreakdown?: (metric: ProgressMetric, range: ProgressRange) => ReactNode;
  renderSpecial?: (topic: "friday" | "zikr") => ReactNode;
}) {
  const id = useId();
  const [metric, setMetric] = useState<ProgressMetric>("prayers");
  const [special, setSpecial] = useState<"friday" | "zikr" | null>(null);
  const values = useMemo(
    () =>
      Object.fromEntries(
        PROGRESS_METRICS.map((key) => [
          key,
          summarizeProgressMetric(records, metricProgressRange(range, key, now, dayStart, false, currentDay), key),
        ]),
      ) as Record<ProgressMetric, ReturnType<typeof summarizeProgressMetric>>,
    [records, range, now, dayStart, currentDay],
  );
  const complete = useMemo(
    () => metricProgressRange(range, metric, now, dayStart, true, currentDay),
    [range, metric, now, dayStart, currentDay],
  );
  const points = useMemo(
    () => dashboardProgressTimeline(records, complete, metric, period, displayDate, language, calendar),
    [records, complete, metric, period, displayDate, language, calendar],
  );
  const matched = useMemo(
    () => matchedDashboardRanges(complete, period, displayDate, language, calendar),
    [complete, period, displayDate, language, calendar],
  );
  const previous = summarizeProgressMetric(records, matched.previous, metric);
  const selected = summarizeProgressMetric(records, matched.current, metric);
  const comparison = compareProgressMetric(selected, previous, metric);
  const comparisonValue = (value: typeof selected) =>
    comparison?.kind === "rate"
      ? text(language, "rateValue", {
          rate: formatPercentage(Math.round((value.count / value.possible!) * 1000) / 10, language),
          count: formatNumerals(value.count, language),
          total: formatNumerals(value.possible!, language),
        })
      : `${formatNumerals(value.count, language)} ${text(language, "pagesUnit")}`;
  const quantity = (key: ProgressMetric) => {
    const value = values[key];
    return (key === "quranGoals" && !value.possible) || (key === "pages" && value.count === 0)
      ? "—"
      : value.possible === null
        ? formatNumerals(value.count, language)
        : text(language, "countOf", {
            count: formatNumerals(value.count, language),
            total: formatNumerals(value.possible, language),
          });
  };
  return (
    <div className="progress-dashboard space-y-5" data-testid="progress-dashboard">
      {view === "overview" && (
        <section className="progress-summary-card progress-overview-summary" aria-labelledby={`${id}-overview`}>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2
              id={`${id}-overview`}
              data-testid="progress-primary-heading"
              className="min-w-0 flex-1 basis-40 text-lg font-bold"
            >
              {text(language, "overview")}
            </h2>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            {text(language, "currentRange", {
              range: values.prayers.days ? formatProgressRange(values.prayers.range, language, calendar) : "—",
            })}
          </p>
          <dl className="progress-overview-grid mt-3" data-testid="progress-overview">
            {DEFAULT_PROGRESS_METRICS.map((key) => {
              const value = values[key];
              const caption =
                key === "quranGoals"
                  ? text(language, value.possible ? "knownGoalDays" : "noGoals")
                  : value.count === 0
                    ? text(language, "noMetricRecords")
                    : key === "pages"
                      ? text(language, "pagesUnit")
                      : value.possible
                        ? formatPercentage(Math.round((value.count / value.possible) * 100), language)
                        : "—";
              return (
                <ProgressMetricCard
                  key={key}
                  metric={key}
                  value={value}
                  valueText={quantity(key)}
                  caption={caption}
                  language={language}
                  icon={METRIC_ICONS[key]}
                  rangeLabel={
                    value.range.startKey !== values.prayers.range.startKey ||
                    value.range.endKey !== values.prayers.range.endKey
                      ? text(language, "currentRange", {
                          range: value.days ? formatProgressRange(value.range, language, calendar) : "—",
                        })
                      : undefined
                  }
                  onExplore={() => {
                    setMetric(key);
                    setSpecial(null);
                    onShowTrend?.();
                  }}
                />
              );
            })}
          </dl>
        </section>
      )}
      {view === "overview" && (
        <div className="progress-overview-support">
          <ProgressHeatmap
            key={`${range.startKey}:${range.endKey}:${currentDay}:${calendar}`}
            {...{ records, range, now, dayStart, currentDay, language, calendar, period, displayDate }}
          />
        </div>
      )}
      {view === "trends" && (
        <>
          <section
            className="progress-trend-card rounded-2xl border border-border bg-card p-4 sm:p-5"
            aria-labelledby={`${id}-trend`}
            data-material-card="dense"
          >
            <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
              <h2 id={`${id}-trend`} className="text-lg font-bold">
                {text(language, "trend")}
              </h2>
              <ProgressSelectField
                label={text(language, "metric")}
                value={special ?? metric}
                onChange={(value: ProgressMetric | "friday" | "zikr") => {
                  if (value === "friday" || value === "zikr") setSpecial(value);
                  else {
                    setSpecial(null);
                    setMetric(value);
                  }
                }}
                language={language}
                icon={BarChart3}
                className="w-full sm:w-72 sm:max-w-full"
                options={[
                  ...DEFAULT_PROGRESS_METRICS.map((key) => ({ value: key, label: text(language, `short_${key}`) })),
                  ...(renderSpecial
                    ? (["friday", "zikr"] as const).map((key) => ({
                        value: key,
                        label: text(language, key === "friday" ? "detail_friday" : "individualZikr"),
                      }))
                    : []),
                ]}
              />
            </div>
            {special ? (
              renderSpecial?.(special)
            ) : period === "day" ? (
              <div className="space-y-3">
                <p className="text-sm leading-relaxed text-muted-foreground">{text(language, "dayView")}</p>
                {onChooseWeek && (
                  <Button type="button" variant="pill" size="pill" onClick={onChooseWeek}>
                    {text(language, "viewWeek")}
                  </Button>
                )}
              </div>
            ) : (
              <>
                <p className="mb-3 progress-help">{text(language, "completeDays")}</p>
                <RecordingTimeline
                  key={`${metric}-${complete.startKey}-${complete.endKey}`}
                  series={[
                    {
                      id: metric,
                      label: text(language, metric),
                      measure: text(language, metric === "pages" ? "countBuckets" : "rateBuckets"),
                      points,
                    },
                  ]}
                  language={language}
                  period={period === "custom" || period === "last30" ? "month" : period}
                  title={text(language, metric)}
                  testId="progress-main-trend"
                  hideSeriesControls
                  chartDisplay={metric === "pages" ? "columns" : "line"}
                  valueKind={metric === "pages" ? "count" : "rate"}
                  countUnit={text(language, "pagesUnit")}
                  bucketDescription={text(language, metric === "pages" ? "countBuckets" : "rateBuckets")}
                />
                <p className="mt-3 text-xs text-muted-foreground">
                  {points.length
                    ? text(language, "completeRange", { range: formatProgressRange(complete, language, calendar) })
                    : text(language, "noComplete")}
                </p>
                <div className="progress-comparison-card" data-testid="progress-period-comparison">
                  <h3 className="flex items-center gap-2 text-base font-bold">
                    <BarChart3 size={22} className="text-primary" aria-hidden="true" />
                    {text(language, "comparison")}
                  </h3>
                  {comparison ? (
                    <div className="mt-2 space-y-1">
                      <p className="progress-comparison-change text-lg font-bold">
                        <Sprout size={26} aria-hidden="true" />
                        {text(
                          language,
                          comparison.kind === "rate"
                            ? Math.abs(comparison.change) < 0.05
                              ? "rateUnchanged"
                              : comparison.change > 0
                                ? "rateHigher"
                                : "rateLower"
                            : comparison.change > 0
                              ? "more"
                              : comparison.change < 0
                                ? "fewer"
                                : "unchanged",
                          { count: formatNumerals(Math.round(Math.abs(comparison.change) * 10) / 10, language) },
                        )}
                      </p>
                      {comparison.kind === "rate" && (
                        <div className="progress-comparison-bars">
                          {[
                            { label: "currentPeriod" as const, value: comparison.currentRate },
                            { label: "previousPeriod" as const, value: comparison.previousRate },
                          ].map(({ label, value }) => (
                            <div key={label}>
                              <span>{text(language, label)}</span>
                              <ProgressBar
                                value={value}
                                max={100}
                                height={8}
                                aria-label={text(language, label)}
                                aria-valuetext={formatPercentage(Math.round(value * 10) / 10, language)}
                                fillColor={label === "currentPeriod" ? "var(--primary)" : "var(--muted-foreground)"}
                              />
                              <bdi>{formatPercentage(Math.round(value * 10) / 10, language)}</bdi>
                            </div>
                          ))}
                        </div>
                      )}
                      <p className="text-xs text-muted-foreground">
                        {text(language, "matched", { days: formatNumerals(matched.days, language) })}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatProgressRange(matched.previous, language, calendar)} ·{" "}
                        <bdi>{text(language, "previousValue", { count: comparisonValue(previous) })}</bdi>
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatProgressRange(matched.current, language, calendar)} ·{" "}
                        <bdi>{text(language, "currentValue", { count: comparisonValue(selected) })}</bdi>
                      </p>
                    </div>
                  ) : (
                    <p className="mt-2 progress-help">{text(language, "comparisonEarly")}</p>
                  )}
                </div>
              </>
            )}
          </section>
          {!special && (
            <>
              {(["routines", "morning", "evening", "sleep"] as ProgressMetric[]).includes(metric) && (
                <ProgressRoutineComparison values={values} language={language} />
              )}
              {renderBreakdown?.(metric, complete)}
            </>
          )}
        </>
      )}
      {view === "trends" && (
        <details className="rounded-xl border border-border bg-card px-4 sm:px-5">
          <summary className={summary}>
            {text(language, "boundaries")}
            <ChevronDown size={18} aria-hidden="true" />
          </summary>
          <div className="space-y-2 pb-4 progress-help">
            <p>{text(language, "boundaryHelp", { hour: formatNumerals(dayStart, language) })}</p>
            <p>{text(language, "goalHelp")}</p>
            <p>{text(language, "chronological")}</p>
          </div>
        </details>
      )}
    </div>
  );
}
