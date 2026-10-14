import { useMemo } from "react";
import { AppLanguage } from "../types";
import { getElapsedPeriod } from "../elapsedPeriod";
import { getPeriodRange } from "../calendarPeriods";
import { CalendarType } from "../calendarPeriods";
import { getFridaySummary } from "../fridaySummary";
import { formatNumerals, formatRatio } from "../formatting";
import { t } from "../i18n";
import { CheckCircle2, BookOpen } from "./icons";

export function FridayProgressStats({
  activeTab,
  displayDate,
  language,
  calendarType,
  direction,
  now = new Date(),
}: {
  activeTab: "week" | "month" | "year";
  displayDate: Date;
  language: AppLanguage;
  calendarType: CalendarType;
  direction: "rtl" | "ltr";
  now?: Date;
}) {
  const period = useMemo(
    () => getPeriodRange(activeTab, displayDate, language, calendarType),
    [activeTab, displayDate, language, calendarType],
  );

  const { startKey, endKey } = getElapsedPeriod(period.startKey, period.endKey, now);

  const stats = useMemo(() => {
    const start = new Date(`${startKey}T12:00:00`);
    const end = new Date(`${endKey}T12:00:00`);
    const fridays: string[] = [];

    // Find all Fridays in range
    const cursor = new Date(start);
    while (cursor <= end) {
      if (cursor.getDay() === 5) {
        const yyyy = cursor.getFullYear();
        const mm = String(cursor.getMonth() + 1).padStart(2, "0");
        const dd = String(cursor.getDate()).padStart(2, "0");
        fridays.push(`${yyyy}-${mm}-${dd}`);
      }
      cursor.setDate(cursor.getDate() + 1);
    }

    let kahfOpenedCount = 0;
    let salawatCount = 0;
    let practicesDoneCount = 0;
    let practicesTotalCount = 0;

    fridays.forEach((fKey) => {
      const s = getFridaySummary(fKey);
      if (s.kahfOpened) kahfOpenedCount++;
      salawatCount += s.salawatCount;
      practicesDoneCount += s.practicesDone;
      practicesTotalCount += s.practicesTotal;
    });

    return { kahfOpenedCount, salawatCount, practicesDoneCount, practicesTotalCount, fridaysCount: fridays.length };
  }, [startKey, endKey]);

  return (
    <div className="w-full overflow-hidden rounded-2xl border border-border bg-card text-foreground" dir={direction}>
      <div className="border-b border-primary/40 bg-gradient-to-b from-muted/45 to-transparent px-4 py-4 text-start sm:px-6">
        <h2 className="text-lg font-black leading-tight text-foreground" dir="auto">
          {t(language, "friday.progressTitle", { count: formatNumerals(stats.fridaysCount, language) })}
        </h2>
      </div>

      <div className="p-4 sm:p-6 flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <div className="flex justify-between items-center text-sm font-bold">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={16} className="text-primary" />
              <span>{t(language, "friday.practicesDone")}</span>
            </div>
            <bdi className="text-sm font-bold text-foreground">
              {formatRatio(stats.practicesDoneCount, stats.practicesTotalCount, language)}
            </bdi>
          </div>
          {stats.practicesTotalCount > 0 && (
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary transition-all duration-standard"
                style={{
                  width: `${Math.min(100, Math.round((stats.practicesDoneCount / stats.practicesTotalCount) * 100))}%`,
                }}
              />
            </div>
          )}
        </div>
        <div className="flex flex-col gap-1.5">
          <div className="flex justify-between items-center text-sm font-bold">
            <div className="flex items-center gap-2">
              <BookOpen size={16} className="text-success" />
              <span>{t(language, "friday.kahfOpened")}</span>
            </div>
            <bdi className="text-sm font-bold text-foreground">
              {formatRatio(stats.kahfOpenedCount, stats.fridaysCount, language)}
            </bdi>
          </div>
          {stats.fridaysCount > 0 && (
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-success transition-all duration-standard"
                style={{
                  width: `${Math.min(100, Math.round((stats.kahfOpenedCount / stats.fridaysCount) * 100))}%`,
                }}
              />
            </div>
          )}
        </div>
        {activeTab !== "year" && (
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center text-sm font-bold">
              <span>{t(language, "friday.salawatCount")}</span>
              <bdi className="text-sm font-bold text-primary">{formatNumerals(stats.salawatCount, language)}</bdi>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
