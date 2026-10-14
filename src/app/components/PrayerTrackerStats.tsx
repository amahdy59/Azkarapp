import { useId, useMemo, useState } from "react";
import type { AppLanguage, PrayerTrackingRecord } from "../types";
import { getElapsedPeriod } from "../elapsedPeriod";
import { getPeriodRange, type CalendarType } from "../calendarPeriods";
import { getPrayerPeriodStats } from "../prayerPeriodStats";
import { formatNumerals, formatRatio, formatPercentage } from "../formatting";
import { t } from "../i18n";
import { RecordedComparisonBar } from "./RecordedComparisonBar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";

const METRICS = ["fard", "location", "mosque", "rawatib", "adhkar"] as const;
type Metric = (typeof METRICS)[number];
const LABELS = {
  fard: "prayerTracking.fard",
  location: "progress.prayerLocationBreakdown",
  mosque: "prayerTracking.atMosque",
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
  const id = useId();
  const [metric, setMetric] = useState<Metric>("fard");
  const period = getPeriodRange(activeTab, displayDate, language, calendarType);
  const elapsed = getElapsedPeriod(period.startKey, period.endKey, now);
  const { startKey, endKey, days } = elapsed;
  const stats = useMemo(() => getPrayerPeriodStats(records, startKey, endKey, days), [records, startKey, endKey, days]);
  const pct = (count: number, possible: number) =>
    possible ? formatPercentage(Math.round((count / possible) * 100), language) : "—";
  const ratio = (count: number, possible: number) => (possible ? formatRatio(count, possible, language) : "—");
  const recordedCount = (count: number, possible: number) =>
    possible
      ? t(language, "progress.recordedCount", {
          done: formatNumerals(count, language),
          total: formatNumerals(possible, language),
        })
      : "—";
  const name = (prayer: (typeof stats.rows)[number]["prayer"]) => t(language, `notifications.${prayer}`);
  const metricLabel = t(language, LABELS[metric]);
  const total = stats.totals[metric === "location" ? "fard" : metric];
  const possible = metric === "rawatib" ? days * 4 : stats.possible;
  return (
    <div className="space-y-4 px-4 pb-4 sm:px-5" data-testid="prayer-comparison">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <span className="text-sm font-bold text-foreground">{t(language, "progress.prayerRecordingRate")}</span>
        <p className="text-foreground">
          <bdi className="text-xl font-black">{recordedCount(stats.totals.fard, stats.possible)}</bdi>
          <bdi className="ms-2 text-sm text-muted-foreground">{pct(stats.totals.fard, stats.possible)}</bdi>
        </p>
      </div>
      <p className="text-xs leading-relaxed text-muted-foreground" data-testid="prayer-coverage-hint">
        {t(language, "progress.recordingCoverageHint", { days: formatNumerals(days, language) })}
      </p>
      <div className="border-t border-border pt-4">
        <label htmlFor={`${id}-metric`} className="mb-2 block text-sm font-bold">
          {t(language, "progress.comparePrayerMetric")}
        </label>
        <Select
          dir={language === "ar" ? "rtl" : "ltr"}
          value={metric}
          onValueChange={(value) => setMetric(value as Metric)}
        >
          <SelectTrigger id={`${id}-metric`}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {METRICS.map((value) => (
              <SelectItem key={value} value={value}>
                {t(language, LABELS[value])}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p
          className={metric === "fard" ? "sr-only" : "mt-3 flex flex-wrap justify-between gap-2 text-sm"}
          role="status"
          aria-atomic="true"
        >
          <span className="sr-only">{metricLabel}</span>
          <bdi>{recordedCount(total, possible)}</bdi>
        </p>
        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
          {t(language, metric === "location" ? "progress.locationStackHint" : "progress.prayerComparisonHint")}
        </p>
      </div>
      <ul className="divide-y divide-border" aria-label={metricLabel}>
        {stats.rows.map((row) => {
          const applicable = metric !== "rawatib" || row.prayer !== "asr";
          const count = row[metric === "location" ? "fard" : metric];
          const segments =
            metric === "location"
              ? [
                  { label: t(language, "prayerTracking.atMosque"), value: row.mosque, color: "var(--primary)" },
                  { label: t(language, "prayerTracking.atHome"), value: row.home, color: "var(--info)" },
                  {
                    label: t(language, "progress.missed"),
                    value: Math.max(0, days - row.fard),
                    color: "var(--border-control)",
                  },
                ]
              : [{ label: metricLabel, value: count, color: "var(--primary)" }];
          const chartLabel = `${name(row.prayer)} · ${metricLabel}: ${ratio(count, days)}${metric === "location" ? `; ${segments.map((segment) => `${segment.label}: ${formatNumerals(segment.value, language)}`).join("; ")}` : ""}`;
          return (
            <li key={row.prayer} className="py-3" data-testid={`prayer-comparison-${row.prayer}`}>
              <div className="mb-2 flex flex-wrap items-baseline justify-between gap-2 text-sm">
                <span className="font-bold">{name(row.prayer)}</span>
                <bdi className="text-muted-foreground">
                  {applicable
                    ? days
                      ? t(language, "progressTrend.recordedDays", {
                          done: formatNumerals(count, language),
                          total: formatNumerals(days, language),
                        })
                      : "—"
                    : t(language, "progress.notApplicable")}
                </bdi>
              </div>
              {applicable && (
                <RecordedComparisonBar label={chartLabel} segments={segments} max={days} language={language} />
              )}
            </li>
          );
        })}
      </ul>
      <details className="border-t border-border">
        <summary className="min-h-11 cursor-pointer py-3 text-sm font-bold focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring">
          {t(language, "progress.prayerExactRecords")}
        </summary>
        <div
          role="region"
          aria-label={t(language, "progress.prayerExactRecords")}
          // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex -- Named native table scroll region needs keyboard access.
          tabIndex={0}
          className="overflow-x-auto rounded-lg focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring"
        >
          <table className="w-full text-sm text-start">
            <caption className="sr-only">{t(language, "progress.prayerExactRecords")}</caption>
            <thead>
              <tr className="border-b border-border">
                <th scope="col" className="p-2 text-start">
                  {t(language, "dailyPath.prayer")}
                </th>
                {(["fard", "mosque", "rawatib", "adhkar"] as const).map((value) => (
                  <th scope="col" key={value} className="p-2 text-start">
                    {t(language, LABELS[value])}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {stats.rows.map((row) => (
                <tr key={row.prayer} className="border-b border-border">
                  <th scope="row" className="p-2 text-start font-medium">
                    {name(row.prayer)}
                  </th>
                  {(["fard", "mosque", "rawatib", "adhkar"] as const).map((value) => (
                    <td key={value} className="whitespace-nowrap p-2">
                      <bdi dir="ltr">
                        {value === "rawatib" && row.prayer === "asr"
                          ? t(language, "progress.notApplicable")
                          : ratio(row[value], days)}
                      </bdi>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <th scope="row" className="p-2 text-start">
                  {t(language, "progress.totalCompleted")}
                </th>
                {(["fard", "mosque", "rawatib", "adhkar"] as const).map((value) => (
                  <td key={value} className="whitespace-nowrap p-2">
                    <bdi dir="ltr">{ratio(stats.totals[value], days * (value === "rawatib" ? 4 : 5))}</bdi>
                  </td>
                ))}
              </tr>
            </tfoot>
          </table>
        </div>
      </details>
    </div>
  );
}
