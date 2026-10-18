import { useState } from "react";
import { formatNumerals } from "../formatting";
import { t } from "../i18n";
import { progressText } from "../i18n/progressInsights";
import {
  getRoutineInsights,
  getMatchedInsightPeriods,
  countRoutineRecords,
  getZikrItemInsights,
  type InsightPeriod,
} from "../progressInsights";
import type { CalendarType } from "../calendarPeriods";
import type { AppLanguage, DailyCollectionCompletion, ZikrDayRecord } from "../types";
import { saveFileToDevice } from "../share/shareDispatcher";
import { RecordingInsights } from "./RecordingInsights";
import { RecordingTimeline } from "./RecordingTimeline";
import { PeriodComparison } from "./PeriodComparison";
import { ZikrInsights } from "./ZikrInsights";

export function RoutineInsights({
  records,
  period,
  displayDate,
  now,
  language,
  calendarType,
  progressDayStartHour,
  weeklyGoalDays,
  isQuranDoneForDay,
  zikrHistory = [],
}: {
  records: readonly DailyCollectionCompletion[];
  period: InsightPeriod;
  displayDate: Date;
  now: Date;
  language: AppLanguage;
  calendarType: CalendarType;
  progressDayStartHour: number;
  weeklyGoalDays?: number;
  isQuranDoneForDay?: (dayKey: string) => boolean;
  zikrHistory?: readonly ZikrDayRecord[];
}) {
  const data = getRoutineInsights(records, period, displayDate, now, language, calendarType, progressDayStartHour);
  const matched = getMatchedInsightPeriods(period, displayDate, now, language, calendarType, progressDayStartHour);
  const [exportState, setExportState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const name = (id: string) => t(language, `progressTrend.${id === "before_sleep" ? "sleep" : id}`);
  const timelineSeries = [
    {
      id: "all",
      label: progressText(language, "insights.allRoutines"),
      measure: progressText(language, "insights.allRoutinesMeasure"),
      points: data.trend.map((point) => ({
        ...point,
        recorded: Object.values(point.routines).reduce((sum, count) => sum + count, 0),
        possible: point.days * 3,
      })),
    },
    ...data.rows.map((row) => ({
      id: row.id,
      label: name(row.id),
      measure: progressText(language, "insights.singleRoutineMeasure"),
      points: data.trend.map((point) => ({
        ...point,
        recorded: point.routines[row.id as keyof typeof point.routines],
        possible: point.days,
      })),
    })),
  ];
  const completeDays = data.trend.flatMap((point) => {
    const keys: string[] = [];
    for (
      let date = new Date(`${point.startKey}T12:00:00`);
      date <= new Date(`${point.endKey}T12:00:00`);
      date.setDate(date.getDate() + 1)
    )
      keys.push(
        `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`,
      );
    return keys;
  });
  const quranDays = completeDays.filter((day) => isQuranDoneForDay?.(day)).length;
  const activeDays = new Set(
    records
      .filter((record) => record.dayKey >= data.startKey && record.dayKey <= data.endKey)
      .map((record) => record.dayKey),
  ).size;
  async function download() {
    setExportState("saving");
    try {
      await saveFileToDevice(
        new File(
          [
            JSON.stringify(
              {
                measure: "days_with_collection_completion_recorded",
                calendarType,
                progressDayStartHour,
                ...data,
                matchedPeriods: matched,
                matchedCounts: {
                  current: countRoutineRecords(records, matched.current),
                  previous: countRoutineRecords(records, matched.previous),
                  possible: matched.days * 3,
                },
                zikrItems: getZikrItemInsights(zikrHistory, data.startKey, data.endKey),
                zikrHistory: zikrHistory.filter((row) => row.dayKey >= data.startKey && row.dayKey <= data.endKey),
              },
              null,
              2,
            ),
          ],
          `azkar-patterns-${data.startKey}.json`,
          { type: "application/json" },
        ),
      );
      setExportState("saved");
    } catch {
      setExportState("error");
    }
  }
  return (
    <section
      data-testid="today-garden-card"
      className="mb-5 w-full rounded-2xl border border-border bg-card p-4 text-foreground sm:p-5"
      aria-labelledby="routine-insights-heading"
    >
      <h2 id="routine-insights-heading" data-testid="progress-primary-heading" className="text-lg font-black">
        {progressText(language, "insights.routineTitle")}
      </h2>
      <p className="mb-5 mt-2 text-xs leading-relaxed text-muted-foreground">
        {progressText(language, "insights.coverage", { days: formatNumerals(data.days, language) })}
      </p>
      <RecordingTimeline
        series={timelineSeries}
        language={language}
        period={period}
        title={progressText(language, "insights.routineTimeline")}
        testId="routine-trends"
      />
      <div className="mt-6 border-t border-border pt-5">
        <PeriodComparison
          label={progressText(language, "insights.allRoutines")}
          current={countRoutineRecords(records, matched.current)}
          previous={countRoutineRecords(records, matched.previous)}
          possible={matched.days * 3}
          days={matched.days}
          language={language}
          period={period}
        />
        <h3 className="mb-4 text-base font-bold">{progressText(language, "insights.compareRoutines")}</h3>
        <RecordingInsights rows={data.rows} days={data.days} language={language} name={name} />
      </div>
      {period === "week" && (
        <div className="mt-5 space-y-3 border-t border-border pt-4">
          {isQuranDoneForDay && (
            <p className="text-sm">
              <span className="font-bold">{t(language, "progressTrend.quran")}</span>
              <span className="ms-2 text-muted-foreground">
                {progressText(language, "insights.daysRecorded", { count: formatNumerals(quranDays, language) })}
              </span>
            </p>
          )}
          {weeklyGoalDays && (
            <div>
              <h3 className="text-sm font-bold">{t(language, "progressPanel.weeklyGoal")}</h3>
              <p className="mt-1 text-xs text-muted-foreground">
                {t(language, "progressPanel.goalProgress", {
                  done: formatNumerals(Math.min(activeDays, weeklyGoalDays), language),
                  goal: formatNumerals(weeklyGoalDays, language),
                })}
              </p>
            </div>
          )}
        </div>
      )}
      <ZikrInsights records={zikrHistory} startKey={data.startKey} endKey={data.endKey} language={language} />
      <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-border pt-3">
        <button
          type="button"
          onClick={() => void download()}
          disabled={exportState === "saving"}
          className="min-h-11 rounded-lg px-3 text-sm font-semibold text-foreground underline underline-offset-4 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring disabled:opacity-50"
        >
          {progressText(language, "insights.exportRoutines")}
        </button>
        <span role="status" className="text-xs text-muted-foreground">
          {exportState === "idle" ? "" : progressText(language, `insights.${exportState}`)}
        </span>
      </div>
    </section>
  );
}
