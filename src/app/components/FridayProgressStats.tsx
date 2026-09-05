import { useMemo } from "react";
import { AppLanguage } from "../types";
import { getPeriodRange } from "../calendarPeriods";
import { CalendarType } from "../calendarPeriods";
import { getFridaySummary } from "../fridaySummary";
import { t } from "../i18n";
import { CheckCircle2, BookOpen } from "./icons";

export function FridayProgressStats({
  activeTab,
  displayDate,
  language,
  calendarType,
  direction,
}: {
  activeTab: "week" | "month" | "year";
  displayDate: Date;
  language: AppLanguage;
  calendarType: CalendarType;
  direction: "rtl" | "ltr";
}) {
  const { startKey, endKey } = useMemo(
    () => getPeriodRange(activeTab, displayDate, language, calendarType),
    [activeTab, displayDate, language, calendarType],
  );

  const stats = useMemo(() => {
    const start = new Date(startKey);
    const end = new Date(endKey);
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
    <div
      className="mt-4 w-full overflow-hidden rounded-3xl border border-border bg-card text-foreground shadow-raised"
      dir={direction}
    >
      <div className="border-b border-primary/40 bg-gradient-to-b from-muted/45 to-transparent px-4 py-4 text-start sm:px-6">
        <h2 className="text-lg font-black leading-tight text-foreground" dir="auto">
          {t(language, "friday.progressTitle", { count: stats.fridaysCount })}
        </h2>
      </div>

      <div className="p-4 sm:p-6 flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <div className="flex justify-between items-center text-sm font-bold">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={16} className="text-primary" />
              <span>{t(language, "friday.practicesDone")}</span>
            </div>
            <span>
              {stats.practicesDoneCount} / {stats.practicesTotalCount}
            </span>
          </div>
          <div className="h-2 w-full rounded-full bg-black/5 dark:bg-white/10 overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-500"
              style={{
                width: `${Math.min(100, Math.round((stats.practicesDoneCount / Math.max(1, stats.practicesTotalCount)) * 100))}%`,
              }}
            />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex justify-between items-center text-sm font-bold">
            <div className="flex items-center gap-2">
              <BookOpen size={16} className="text-success" />
              <span>{t(language, "friday.kahfOpened")}</span>
            </div>
            <span>
              {stats.kahfOpenedCount} / {stats.fridaysCount}
            </span>
          </div>
          <div className="h-2 w-full rounded-full bg-black/5 dark:bg-white/10 overflow-hidden">
            <div
              className="h-full bg-success rounded-full transition-all duration-500"
              style={{
                width: `${Math.min(100, Math.round((stats.kahfOpenedCount / Math.max(1, stats.fridaysCount)) * 100))}%`,
              }}
            />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex justify-between items-center text-sm font-bold">
            <span>{t(language, "friday.salawatCount")}</span>
            <span className="text-primary">{stats.salawatCount}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
