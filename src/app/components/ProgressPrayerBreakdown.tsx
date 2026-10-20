import { ProgressSelectField } from "./ProgressSelectField";
import { BarChart3 } from "./icons";
import { useMemo, useState } from "react";
import { getPrayerPeriodStats } from "../prayerPeriodStats";
import { formatNumerals } from "../formatting";
import { progressRangeDays, type ProgressRange } from "../progressDashboard";
import { dashboardText } from "../i18n/progressDashboard";
import { t } from "../i18n";
import type { AppLanguage, PrayerTrackingRecord } from "../types";
import { RecordingInsights } from "./RecordingInsights";
import { RecordedComparisonBar } from "./RecordedComparisonBar";

export function ProgressPrayerBreakdown({
  records,
  range,
  language,
}: {
  records: readonly PrayerTrackingRecord[];
  range: ProgressRange;
  language: AppLanguage;
}) {
  const [metric, setMetric] = useState<"fard" | "mosque" | "rawatib" | "adhkar">("fard");
  const stats = useMemo(
    () => getPrayerPeriodStats(records, range.startKey, range.endKey, progressRangeDays(range)),
    [records, range],
  );
  if (!stats.days) return <p className="py-3 text-sm text-muted-foreground">{dashboardText(language, "noComplete")}</p>;
  return (
    <section className="mb-5 space-y-4" aria-label={dashboardText(language, "perPrayer")}>
      <h3 className="text-base font-bold">{dashboardText(language, "perPrayer")}</h3>
      <ProgressSelectField
        label={dashboardText(language, "prayerMetric")}
        language={language}
        icon={BarChart3}
        className="max-w-sm"
        value={metric}
        onChange={setMetric}
        options={(["fard", "mosque", "rawatib", "adhkar"] as const).map((key) => ({
          value: key,
          label: dashboardText(language, key === "fard" ? "short_prayers" : `short_${key}`),
        }))}
      />
      {metric === "fard" ? (
        <ul className="space-y-5">
          {stats.rows.map((row) => {
            const label = t(language, `notifications.${row.prayer}`);
            return (
              <li key={row.prayer}>
                <p className="mb-2 flex flex-wrap justify-between gap-2 text-sm font-semibold">
                  <span>{label}</span>
                  <bdi>
                    {dashboardText(language, "countOf", {
                      count: formatNumerals(row.fard, language),
                      total: formatNumerals(stats.days, language),
                    })}
                  </bdi>
                </p>
                <RecordedComparisonBar
                  max={stats.days}
                  language={language}
                  label={`${label}: ${row.fard}/${stats.days}`}
                  segments={[
                    { label: t(language, "prayerTracking.atMosque"), value: row.mosque, color: "var(--primary)" },
                    { label: t(language, "prayerTracking.atHome"), value: row.home, color: "var(--muted-foreground)" },
                    {
                      label: t(language, "prayerTracking.notRecorded"),
                      value: stats.days - row.fard,
                      color: "var(--muted)",
                    },
                  ]}
                />
              </li>
            );
          })}
        </ul>
      ) : (
        <RecordingInsights
          language={language}
          days={stats.days}
          practice="prayer"
          name={(prayer) => t(language, `notifications.${prayer}`)}
          rows={stats.rows
            .filter((row) => metric !== "rawatib" || row.prayer !== "asr")
            .map((row) => ({ id: row.prayer, count: row[metric] }))}
        />
      )}
    </section>
  );
}
