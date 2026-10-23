import { formatNumerals, formatPercentage } from "../formatting";
import { progressText } from "../i18n/progressInsights";
import { getRecordingPattern, type InsightRow } from "../progressInsights";
import type { AppLanguage } from "../types";
import { RecordedComparisonBar } from "./RecordedComparisonBar";

export function RecordingInsights({
  rows,
  days,
  language,
  name,
  practice = "routine",
}: {
  rows: readonly InsightRow[];
  days: number;
  language: AppLanguage;
  name: (id: string) => string;
  practice?: "routine" | "prayer";
}) {
  const pattern = getRecordingPattern(rows, days);
  const list = (ids: readonly string[]) => ids.map(name).join(language === "ar" ? "، " : ", ");
  return (
    <div className="space-y-5">
      {pattern.kind === "pattern" ? (
        <dl className="grid gap-4 border-b border-border pb-4 sm:grid-cols-2">
          <div>
            <dt className="text-xs font-semibold text-muted-foreground">
              {progressText(language, "insights.strongest")}
            </dt>
            <dd className="mt-1 text-lg font-bold text-foreground">{list(pattern.strongest)}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold text-muted-foreground">
              {progressText(language, "insights.attention")}
            </dt>
            <dd className="mt-1 text-lg font-bold text-foreground">{list(pattern.attention)}</dd>
            <dd className="mt-1 progress-help">
              {progressText(language, practice === "prayer" ? "insights.prayerCue" : "insights.routineCue")}
            </dd>
            <dd>
              <a
                href="#/settings/notifications"
                className="mt-2 inline-flex min-h-11 items-center rounded-lg px-2 text-xs font-semibold text-foreground underline underline-offset-4 progress-focus"
              >
                {progressText(
                  language,
                  practice === "prayer" ? "insights.prayerReminders" : "insights.routineReminders",
                )}
              </a>
            </dd>
          </div>
        </dl>
      ) : (
        <p className="text-sm leading-relaxed text-muted-foreground" data-testid="recording-pattern-message">
          {progressText(language, `insights.${pattern.kind}`)}
        </p>
      )}
      <div
        className="flex flex-wrap justify-between gap-2 text-xs font-semibold text-muted-foreground"
        aria-hidden="true"
      >
        <span>{progressText(language, "insights.recordedDays")}</span>
        <span>
          {formatPercentage(0, language)} – {formatPercentage(100, language)}
        </span>
      </div>
      <ul className="space-y-4">
        {rows.map((row) => {
          const percentage = days ? Math.round((row.count / days) * 100) : 0;
          const value = days ? formatPercentage(percentage, language) : "—";
          const count = progressText(language, row.count === 1 ? "insights.dayRecorded" : "insights.daysRecorded", {
            count: formatNumerals(row.count, language),
          });
          const weeklyAverage = days ? (row.count / days) * 7 : 0;
          const context =
            days < 7
              ? count
              : weeklyAverage > 0 && weeklyAverage < 1
                ? progressText(language, "insights.lessThanWeekly")
                : progressText(language, "insights.weeklyAverage", {
                    count: new Intl.NumberFormat(language === "ar" ? "ar-EG" : "en-GB", {
                      maximumFractionDigits: 1,
                    }).format(weeklyAverage),
                  });
          return (
            <li key={row.id} data-testid={`insight-${row.id}`}>
              <div className="mb-2 flex flex-wrap items-baseline justify-between gap-2">
                <span className="text-sm font-bold">{name(row.id)}</span>
                <span className="text-sm">
                  <bdi className="font-bold">{value}</bdi>
                  <span className="ms-2 text-xs text-muted-foreground">{context}</span>
                </span>
              </div>
              <RecordedComparisonBar
                label={`${name(row.id)}: ${value}; ${count}`}
                segments={[{ label: name(row.id), value: row.count, color: "var(--primary)" }]}
                max={days}
                language={language}
              />
            </li>
          );
        })}
      </ul>
    </div>
  );
}
