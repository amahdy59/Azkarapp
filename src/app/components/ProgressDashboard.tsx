import { ProgressSelectField } from "./ProgressSelectField";
import { BarChart3 } from "./icons";
import { useId, useMemo, useRef, useState } from "react";
import type { AppLanguage } from "../types";
import type { CalendarType } from "../calendarPeriods";
import { dashboardText as text } from "../i18n/progressDashboard";
import { formatNumerals, formatPercentage } from "../formatting";
import {
  DEFAULT_PROGRESS_METRICS,
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
import { ProgressRecordsTable } from "./ProgressRecordsTable";
import { IconButton } from "./LayoutShells";
import { ChevronUp, ChevronDown } from "./icons";

const action =
  "progress-dashboard-action min-h-11 rounded-lg border border-border-control px-3 py-2 text-sm font-semibold progress-focus disabled:opacity-50";
const summary = "progress-disclosure";

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
  onExport,
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
  onExport: () => Promise<void>;
}) {
  const id = useId();
  const [metrics, setMetrics] = useState<readonly ProgressMetric[]>(DEFAULT_PROGRESS_METRICS);
  const [draft, setDraft] = useState<readonly ProgressMetric[]>(DEFAULT_PROGRESS_METRICS);
  const [choosing, setChoosing] = useState(false);
  const chooseButton = useRef<HTMLButtonElement>(null);
  const [metric, setMetric] = useState<ProgressMetric>("prayers");
  const [tableOpen, setTableOpen] = useState(false);
  const exportKey = `${range.startKey}:${range.endKey}:${currentDay}:${calendar}`;
  const [exportState, setExportState] = useState<{ key: string; state: "idle" | "saving" | "saved" | "error" }>({
    key: exportKey,
    state: "idle",
  });
  const save = exportState.key === exportKey ? exportState.state : "idle";
  const setSave = (state: typeof exportState.state) => setExportState({ key: exportKey, state });
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
  const canCompare =
    matched.days >= 3 &&
    previous.count > 0 &&
    (metric !== "quranGoals" || (selected.possible === previous.possible && Boolean(selected.possible)));
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
      <section aria-labelledby={`${id}-overview`}>
        <div className="flex flex-wrap items-start justify-between gap-2">
          <h2 id={`${id}-overview`} data-testid="progress-primary-heading" className="min-w-0 flex-1 text-lg font-bold">
            {text(language, "overview")}
          </h2>
          <button
            ref={chooseButton}
            type="button"
            className={`${action} text-xs`}
            aria-expanded={choosing}
            aria-controls={`${id}-choices`}
            onClick={() => {
              setDraft(metrics);
              setChoosing(!choosing);
            }}
          >
            {text(language, "choose")}
          </button>
        </div>
        <p className="mt-1 max-w-prose progress-help">{text(language, "overviewHelp")}</p>
        <p className="mt-2 text-xs text-muted-foreground">
          {text(language, "currentRange", {
            range: values.prayers.days ? formatProgressRange(values.prayers.range, language, calendar) : "—",
          })}
        </p>
        {choosing && (
          <fieldset id={`${id}-choices`} className="my-3 min-w-0 space-y-3 rounded-xl border border-border bg-card p-3">
            <legend className="px-1 text-sm font-bold">{text(language, "choose")}</legend>
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
              <button
                type="button"
                className={action}
                disabled={!draft.length}
                onClick={() => {
                  setMetrics(draft);
                  setChoosing(false);
                  chooseButton.current?.focus();
                }}
              >
                {text(language, "apply")}
              </button>
              <button
                type="button"
                className={action}
                onClick={() => {
                  setChoosing(false);
                  chooseButton.current?.focus();
                }}
              >
                {text(language, "cancel")}
              </button>
              <button type="button" className={action} onClick={() => setDraft(DEFAULT_PROGRESS_METRICS)}>
                {text(language, "reset")}
              </button>
            </div>
          </fieldset>
        )}
        <dl className="progress-overview-grid mt-3" data-testid="progress-overview">
          {metrics.map((key) => (
            <div
              key={key}
              className="min-w-0 rounded-xl border border-border bg-card p-3 sm:p-4"
              data-material-card
              data-testid={`progress-metric-${key}`}
            >
              <dt className="text-xs font-semibold leading-relaxed text-muted-foreground">{text(language, key)}</dt>
              <dd className="mt-1 break-words text-xl font-bold tabular-nums">
                <bdi>{quantity(key)}</bdi>
              </dd>
              <dd className="mt-1 text-micro leading-relaxed text-muted-foreground">
                {key === "pages"
                  ? text(language, "pagesUnit")
                  : key === "quranGoals"
                    ? text(language, values[key].possible ? "knownGoalDays" : "noGoals")
                    : values[key].possible
                      ? formatPercentage(Math.round((values[key].count / values[key].possible!) * 100), language)
                      : "—"}
              </dd>
              {(values[key].range.startKey !== values.prayers.range.startKey ||
                values[key].range.endKey !== values.prayers.range.endKey) && (
                <dd className="mt-2 text-micro leading-relaxed text-muted-foreground">
                  {text(language, "currentRange", {
                    range: values[key].days ? formatProgressRange(values[key].range, language, calendar) : "—",
                  })}
                </dd>
              )}
            </div>
          ))}
        </dl>
      </section>
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
        {period === "day" ? (
          <p className="text-sm leading-relaxed text-muted-foreground">{text(language, "dayView")}</p>
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
              period={period === "custom" ? "month" : period}
              title={text(language, metric)}
              testId="progress-main-trend"
              hideSeriesControls
              valueKind={metric === "pages" ? "count" : "rate"}
              countUnit={text(language, "pagesUnit")}
              bucketDescription={text(language, metric === "pages" ? "countBuckets" : "rateBuckets")}
            />
            <p className="mt-3 text-xs text-muted-foreground">
              {points.length
                ? text(language, "completeRange", { range: formatProgressRange(complete, language, calendar) })
                : text(language, "noComplete")}
            </p>
            <div className="mt-4 border-t border-border pt-4" data-testid="progress-period-comparison">
              <h3 className="text-sm font-semibold">{text(language, "comparison")}</h3>
              {canCompare ? (
                <div className="mt-2 space-y-1">
                  <p className="text-sm font-bold">
                    {text(
                      language,
                      selected.count > previous.count
                        ? "more"
                        : selected.count < previous.count
                          ? "fewer"
                          : "unchanged",
                      { count: formatNumerals(Math.abs(selected.count - previous.count), language) },
                    )}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {text(language, "matched", { days: formatNumerals(matched.days, language) })}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatProgressRange(matched.previous, language, calendar)} ·{" "}
                    {text(language, "previousValue", { count: formatNumerals(previous.count, language) })}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatProgressRange(matched.current, language, calendar)} ·{" "}
                    {text(language, "currentValue", { count: formatNumerals(selected.count, language) })}
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
      <details
        className="rounded-xl border border-border bg-card px-4 pb-1 sm:px-5"
        onToggle={(event) => setTableOpen(event.currentTarget.open)}
      >
        <summary className={summary}>
          {text(language, "records")}
          <ChevronDown size={18} aria-hidden="true" />
        </summary>
        {tableOpen && (
          <div className="pb-4">
            <ProgressRecordsTable
              key={`${range.startKey}-${range.endKey}-${currentDay}`}
              records={scopedRows}
              metrics={metrics}
              language={language}
              calendar={calendar}
            />
          </div>
        )}
      </details>
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
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          className={action}
          disabled={save === "saving"}
          aria-describedby={`${id}-export-help`}
          onClick={async () => {
            setSave("saving");
            try {
              await onExport();
              setSave("saved");
            } catch {
              setSave("error");
            }
          }}
        >
          {text(language, "export")}
        </button>
        <span role="status" aria-atomic="true" className="text-xs text-muted-foreground">
          {save === "idle" ? "" : text(language, save)}
        </span>
      </div>
      <p id={`${id}-export-help`} className="text-micro leading-relaxed text-muted-foreground">
        {text(language, "exportHelp")}
      </p>
    </div>
  );
}
