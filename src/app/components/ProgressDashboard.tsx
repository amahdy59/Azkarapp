import { RecordedPagesChart } from "./RecordedPagesChart";
import { recordedPageRhythm } from "../recordedPageRhythm";
import { t } from "../i18n";
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
  Lightbulb,
  Sprout,
} from "./icons";
import { ProgressBar } from "./ProgressBar";
import { useId, useMemo, useRef, useState } from "react";
import type { AppLanguage } from "../types";
import type { CalendarType } from "../calendarPeriods";
import { dashboardText as text } from "../i18n/progressDashboard";
import { formatNumerals, formatPercentage } from "../formatting";
import { getProgressDayKey } from "../progress";
import {
  DEFAULT_PROGRESS_METRICS,
  compareProgressMetric,
  PROGRESS_METRICS,
  dashboardProgressTimeline,
  formatProgressRange,
  matchedDashboardRanges,
  metricProgressRange,
  summarizeProgressMetric,
  scopeProgressDailyRecords,
  type ProgressDailyRecord,
  type ProgressMetric,
  type ProgressPreset,
  type ProgressRange,
} from "../progressDashboard";
import { RecordingTimeline } from "./RecordingTimeline";
import { ProgressHeatmap } from "./ProgressHeatmap";
import { ProgressRoutineComparison } from "./ProgressRoutineComparison";
import { ProgressMetricCard } from "./ProgressMetricCard";
import { IconButton } from "./LayoutShells";
import { Button } from "./ui/button";
import { ChevronUp, ChevronDown } from "./icons";
import { Modal, SheetHeader } from "./ResponsiveSheet";

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
}) {
  const id = useId();
  const [metrics, setMetrics] = useState<readonly ProgressMetric[]>(DEFAULT_PROGRESS_METRICS);
  const [draft, setDraft] = useState<readonly ProgressMetric[]>(DEFAULT_PROGRESS_METRICS);
  const [choosing, setChoosing] = useState(false);
  const chooseButton = useRef<HTMLButtonElement>(null);
  const [metric, setMetric] = useState<ProgressMetric>("prayers");
  const [chartDisplay, setChartDisplay] = useState<"line" | "columns">("columns");
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
  const scopedRows = useMemo(
    () => scopeProgressDailyRecords(records, range, now, dayStart, currentDay),
    [records, range, now, dayStart, currentDay],
  );
  const quantity = (key: ProgressMetric) => {
    const value = values[key];
    return key === "quranGoals" && !value.possible
      ? "—"
      : value.possible === null
        ? formatNumerals(value.count, language)
        : text(language, "countOf", {
            count: formatNumerals(value.count, language),
            total: formatNumerals(value.possible, language),
          });
  };
  const hasActivity = scopedRows.some((row) => PROGRESS_METRICS.some((key) => (row[key] ?? 0) > 0));
  const move = (key: ProgressMetric, step: number) => {
    const next = [...draft];
    const index = next.indexOf(key);
    const target = index + step;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target]!, next[index]!];
    setDraft(next);
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
            <Button
              ref={chooseButton}
              type="button"
              variant="pill"
              size="pill"
              data-testid="progress-choose-metrics"
              className="min-w-11"
              title={text(language, "choose")}
              aria-expanded={choosing}
              aria-haspopup="dialog"
              aria-controls={`${id}-choices`}
              onClick={() => {
                setDraft(metrics);
                setChoosing(!choosing);
              }}
            >
              <BarChart3 className="size-5" aria-hidden="true" />
              <span>{text(language, "choose")}</span>
            </Button>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            {text(language, "currentRange", {
              range: values.prayers.days ? formatProgressRange(values.prayers.range, language, calendar) : "—",
            })}
          </p>
          <Modal
            open={choosing}
            onClose={() => setChoosing(false)}
            onCloseAutoFocus={(event) => {
              event.preventDefault();
              chooseButton.current?.focus({ preventScroll: true });
            }}
            title={text(language, "choose")}
            language={language}
            direction={language === "ar" ? "rtl" : "ltr"}
            showCloseButton={false}
            className="filter-sheet"
            testId="progress-metric-dialog"
          >
            <SheetHeader
              title={text(language, "choose")}
              language={language}
              onClose={() => setChoosing(false)}
              className="filter-sheet-header"
            />
            <fieldset id={`${id}-choices`} className="min-h-0 min-w-0 space-y-3 overflow-y-auto p-3">
              <p className="progress-help">{text(language, "chooseHelp")}</p>
              <div className="progress-metric-choices">
                {PROGRESS_METRICS.map((key) => (
                  <label
                    key={key}
                    className="flex min-h-11 cursor-pointer items-center gap-2 rounded-lg px-2 py-2 text-sm"
                  >
                    <input
                      type="checkbox"
                      checked={draft.includes(key)}
                      onChange={() =>
                        setDraft(draft.includes(key) ? draft.filter((item) => item !== key) : [...draft, key])
                      }
                      className="size-5 shrink-0 accent-primary progress-focus"
                    />
                    {text(language, key)}
                  </label>
                ))}
              </div>
              <ol className="divide-y divide-border">
                {draft.map((key, index) => (
                  <li key={key} className="flex min-w-0 items-center justify-between gap-2 py-1 text-sm">
                    <span>{text(language, key)}</span>
                    <span className="flex shrink-0 gap-1">
                      <IconButton
                        label={text(language, "moveUp", { metric: text(language, key) })}
                        disabled={index === 0}
                        onClick={() => move(key, -1)}
                      >
                        <ChevronUp size={18} aria-hidden="true" />
                      </IconButton>
                      <IconButton
                        label={text(language, "moveDown", { metric: text(language, key) })}
                        disabled={index === draft.length - 1}
                        onClick={() => move(key, 1)}
                      >
                        <ChevronDown size={18} aria-hidden="true" />
                      </IconButton>
                    </span>
                  </li>
                ))}
              </ol>
              <p role="status" className="text-xs text-muted-foreground">
                {draft.length
                  ? text(language, "selected", { count: formatNumerals(draft.length, language) })
                  : text(language, "chooseOne")}
              </p>
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  size="pill"
                  disabled={!draft.length}
                  onClick={() => {
                    setMetrics(draft);
                    setChoosing(false);
                  }}
                >
                  {text(language, "apply")}
                </Button>
                <Button
                  type="button"
                  variant="pill"
                  size="pill"
                  onClick={() => {
                    setChoosing(false);
                  }}
                >
                  {text(language, "cancel")}
                </Button>
                <Button type="button" variant="ghost" size="pill" onClick={() => setDraft(DEFAULT_PROGRESS_METRICS)}>
                  {text(language, "reset")}
                </Button>
              </div>
            </fieldset>
          </Modal>
          <dl className="progress-overview-grid mt-3" data-testid="progress-overview">
            {metrics.map((key) => {
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
          <div className="progress-routine-column">
            <ProgressRoutineComparison values={values} language={language} />
            <div className="progress-summary-card progress-rhythm-panel" data-material-card>
              <RecordedPagesChart
                title={t(language, "home.recordedPagesRhythm")}
                language={language}
                points={recordedPageRhythm(
                  range.startKey,
                  range.endKey,
                  getProgressDayKey(now, dayStart),
                  new Map(records.map((record) => [record.dayKey, record.pages])),
                )}
              />
            </div>
            {view === "overview" &&
              hasActivity &&
              values.morning.days >= 3 &&
              values.morning.count !== values.evening.count && (
                <aside className="progress-insight-card" data-material-card aria-label={text(language, "insight")}>
                  <Lightbulb className="progress-practice-icon" aria-hidden="true" />
                  <div>
                    <h3 className="text-sm font-bold">{text(language, "insight")}</h3>
                    <p className="mt-1 text-sm leading-relaxed">
                      {text(language, "routineInsight", {
                        morning: formatNumerals(values.morning.count, language),
                        evening: formatNumerals(values.evening.count, language),
                      })}
                    </p>
                  </div>
                </aside>
              )}
          </div>
        </div>
      )}
      {view === "trends" && (
        <>
          <section
            className="progress-trend-card rounded-2xl border border-border bg-card p-4 sm:p-5"
            aria-labelledby={`${id}-trend`}
            data-material-card
          >
            <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
              <h2 id={`${id}-trend`} className="text-lg font-bold">
                {text(language, "trend")}
              </h2>
              <ProgressSelectField
                label={text(language, "metric")}
                value={metric}
                onChange={setMetric}
                language={language}
                icon={BarChart3}
                className="w-full sm:w-72 sm:max-w-full"
                options={PROGRESS_METRICS.map((key) => ({ value: key, label: text(language, `short_${key}`) }))}
              />
            </div>
            {period !== "day" && (
              <div className="progress-chart-display mb-3">
                <ProgressSelectField
                  label={text(language, "chartDisplay")}
                  value={chartDisplay}
                  onChange={setChartDisplay}
                  language={language}
                  icon={BarChart3}
                  options={(["columns", "line"] as const).map((value) => ({ value, label: text(language, value) }))}
                />
              </div>
            )}
            {period === "day" ? (
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
                  chartDisplay={chartDisplay}
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
          <details className="rounded-xl border border-border bg-card px-4 sm:px-5">
            <summary className={summary}>
              {text(language, "categories")}
              <ChevronDown size={18} aria-hidden="true" />
            </summary>
            <p className="mb-3 progress-help">{text(language, "categoryHelp")}</p>
            <ul className="space-y-3 pb-4">
              {PROGRESS_METRICS.filter((key) => key !== "pages" && key !== "quranGoals").map((key) => (
                <li key={key} className="space-y-1">
                  <p className="flex flex-wrap justify-between gap-2 text-sm">
                    <span>{text(language, key)}</span>
                    <bdi className="font-semibold">{quantity(key)}</bdi>
                  </p>
                  <div
                    role="img"
                    aria-label={`${text(language, key)}: ${quantity(key)}`}
                    className="flex h-2 overflow-hidden rounded-full bg-muted"
                    dir={language === "ar" ? "rtl" : "ltr"}
                  >
                    <div
                      className="h-full bg-primary"
                      style={{
                        width: `${values[key].possible ? Math.min(100, (values[key].count / values[key].possible!) * 100) : 0}%`,
                      }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          </details>
        </>
      )}
      {view !== "trends" && (
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
