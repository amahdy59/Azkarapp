import { useState } from "react";
import type { AppLanguage, PrayerTrackingRecord } from "../types";
import type { CalendarType } from "../calendarPeriods";
import { getPrayerInsights, getMatchedInsightPeriods } from "../progressInsights";
import { getPrayerPeriodStats } from "../prayerPeriodStats";
import { formatNumerals } from "../formatting";
import { t } from "../i18n";
import { progressText } from "../i18n/progressInsights";
import { saveFileToDevice } from "../share/shareDispatcher";
import { RecordingInsights } from "./RecordingInsights";
import { BarChart3 } from "./icons";
import { ProgressSelectField } from "./ProgressSelectField";
import { RecordingTimeline } from "./RecordingTimeline";
import { PeriodComparison } from "./PeriodComparison";

const METRICS = ["fard", "rawatib", "adhkar"] as const;
const LABELS = {
  fard: "prayerTracking.fard",
  rawatib: "prayerTracking.rawatib",
  adhkar: "prayerTracking.adhkar",
} as const;

export function PrayerTrackerStats({
  records,
  activeTab,
  displayDate,
  language,
  calendarType,
  now = new Date(),
}: {
  records: readonly PrayerTrackingRecord[];
  activeTab: "week" | "month" | "year";
  displayDate: Date;
  language: AppLanguage;
  calendarType: CalendarType;
  now?: Date;
}) {
  const [metric, setMetric] = useState<(typeof METRICS)[number]>("fard");
  const [exportState, setExportState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  // Prayer records use civil dates, independently of the devotional-day rollover.
  const stats = getPrayerInsights(records, activeTab, displayDate, now, language, calendarType);
  const range = { startKey: stats.startKey, endKey: stats.endKey, days: stats.days };
  const matched = getMatchedInsightPeriods(activeTab, displayDate, now, language, calendarType);
  const matchCounts = (value: typeof matched.current) =>
    getPrayerPeriodStats(records, value.startKey, value.endKey, value.days).totals[metric];
  const rows = stats.rows
    .filter((row) => metric !== "rawatib" || row.prayer !== "asr")
    .map((row) => ({ id: row.prayer, count: row[metric] }));
  const timelineSeries = [
    {
      id: "all",
      label: progressText(language, "insights.allPrayers"),
      measure: progressText(
        language,
        metric === "rawatib" ? "insights.allRawatibMeasure" : "insights.allPrayersMeasure",
      ),
      points: stats.trend.map((point) => ({
        ...point,
        recorded: point.totals[metric],
        possible: point.days * (metric === "rawatib" ? 4 : 5),
      })),
    },
    ...rows.map((row) => ({
      id: row.id,
      label: t(language, `notifications.${row.id}`),
      measure: progressText(language, "insights.singlePrayerMeasure"),
      points: stats.trend.map((point) => ({
        ...point,
        recorded: point.rows.find((item) => item.prayer === row.id)![metric],
        possible: point.days,
      })),
    })),
  ];
  async function download() {
    setExportState("saving");
    try {
      await saveFileToDevice(
        new File(
          [
            JSON.stringify(
              {
                measure: "days_with_practice_recorded",
                calendarType,
                dayBoundary: "civil",
                rawatibExcludes: ["asr"],
                matchedPeriods: matched,
                matchedPractice: metric,
                matchedCounts: {
                  current: matchCounts(matched.current),
                  previous: matchCounts(matched.previous),
                  possible: matched.days * (metric === "rawatib" ? 4 : 5),
                },
                ...range,
                ...stats,
              },
              null,
              2,
            ),
          ],
          `prayer-patterns-${range.startKey}.json`,
          { type: "application/json" },
        ),
      );
      setExportState("saved");
    } catch {
      setExportState("error");
    }
  }
  return (
    <div className="space-y-5 px-4 pb-4 sm:px-5" data-testid="prayer-comparison">
      <p className="progress-help" data-testid="prayer-coverage-hint">
        {progressText(language, "insights.coverage", { days: formatNumerals(range.days, language) })}
      </p>
      <div role="status" aria-atomic="true" className="sr-only">
        {t(language, LABELS[metric])}
      </div>
      <RecordingTimeline
        series={timelineSeries}
        language={language}
        period={activeTab}
        title={progressText(language, "insights.prayerTimeline")}
        seriesLabel={progressText(language, "insights.prayerFilter")}
        leadingControl={
          <ProgressSelectField
            label={progressText(language, "insights.practiceFilter")}
            language={language}
            icon={BarChart3}
            className="max-w-xs"
            value={metric}
            onChange={setMetric}
            options={METRICS.map((value) => ({
              value,
              label: progressText(
                language,
                value === "fard"
                  ? "insights.practiceFard"
                  : value === "rawatib"
                    ? "insights.practiceRawatib"
                    : "insights.practiceAdhkar",
              ),
            }))}
          />
        }
        testId="prayer-trends"
      />
      <PeriodComparison
        label={`${progressText(language, "insights.allPrayers")} · ${t(language, LABELS[metric])}`}
        current={matchCounts(matched.current)}
        previous={matchCounts(matched.previous)}
        possible={matched.days * (metric === "rawatib" ? 4 : 5)}
        days={matched.days}
        language={language}
        period={activeTab}
      />
      <h3 className="border-t border-border pt-5 text-base font-bold">
        {progressText(language, "insights.comparePrayers")}
      </h3>
      <RecordingInsights
        rows={rows}
        days={range.days}
        language={language}
        name={(id) => t(language, `notifications.${id}`)}
        practice="prayer"
      />
      <details className="text-xs text-muted-foreground">
        <summary className="min-h-11 cursor-pointer py-3 progress-focus">
          {progressText(language, "insights.aboutRecords")}
        </summary>
        <p>
          {progressText(language, metric === "fard" ? "insights.fardHint" : "insights.optionalHint")}{" "}
          {progressText(language, "insights.noRecord")}
        </p>
      </details>
      <div className="flex flex-wrap items-center gap-3 border-t border-border pt-3">
        <button
          type="button"
          disabled={exportState === "saving"}
          onClick={() => void download()}
          className="progress-export"
        >
          {progressText(language, "insights.exportPrayers")}
        </button>
        <span role="status" className="text-xs text-muted-foreground">
          {exportState === "idle" ? "" : progressText(language, `insights.${exportState}`)}
        </span>
      </div>
    </div>
  );
}
