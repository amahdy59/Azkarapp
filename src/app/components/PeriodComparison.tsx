import type { AppLanguage } from "../types";
import type { InsightPeriod } from "../progressInsights";
import { formatNumerals, formatPercentage } from "../formatting";
import { progressText } from "../i18n/progressInsights";

export function PeriodComparison({
  current,
  previous,
  possible,
  days,
  language,
  period,
  label,
}: {
  current: number;
  previous: number;
  possible: number;
  days: number;
  language: AppLanguage;
  period: InsightPeriod;
  label: string;
}) {
  if (days < 3 || !possible || !previous) return null;
  const delta = Math.round(((current - previous) / possible) * 100);
  return (
    <div data-testid="period-comparison" className="mb-4 rounded-lg bg-muted p-3 text-sm">
      <p className="mb-1 text-xs font-semibold text-muted-foreground">{label}</p>
      <p className="font-semibold">
        {progressText(
          language,
          delta > 0 ? "insights.periodHigher" : delta < 0 ? "insights.periodLower" : "insights.periodSteady",
          { count: formatNumerals(Math.abs(delta), language) },
        )}
      </p>
      <p className="mt-1 text-xs text-muted-foreground">
        {progressText(language, `insights.match${period}`, { days: formatNumerals(days, language) })}
      </p>
      <p className="mt-1 text-xs text-muted-foreground">
        {progressText(language, "insights.previousToCurrent", {
          previous: formatPercentage(Math.round((previous / possible) * 100), language),
          current: formatPercentage(Math.round((current / possible) * 100), language),
        })}
      </p>
    </div>
  );
}
