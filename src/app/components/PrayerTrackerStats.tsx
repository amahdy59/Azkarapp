import { useMemo } from "react";
import { AppLanguage, PrayerName, PrayerTrackingRecord } from "../types";
import { getPeriodRange } from "../calendarPeriods";
import { CalendarType } from "../calendarPeriods";
import { PRAYER_ORDER } from "./PrayerTrackerCards";
import { t } from "../i18n";

export function PrayerTrackerStats({
  records,
  activeTab,
  displayDate,
  language,
  calendarType,
}: {
  records: readonly PrayerTrackingRecord[];
  activeTab: "week" | "month" | "year";
  displayDate: Date;
  language: AppLanguage;
  calendarType: CalendarType;
}) {
  const { startKey, endKey } = useMemo(
    () => getPeriodRange(activeTab, displayDate, language, calendarType),
    [activeTab, displayDate, language, calendarType],
  );

  const stats = useMemo(() => {
    // Calculate days by finding all unique dayKeys in records within range, or by counting days between start and end?
    // Actually, to know max possible, we can parse startKey and endKey
    const start = new Date(startKey);
    const end = new Date(endKey);
    // Rough days count
    const daysInPeriod = Math.round((end.getTime() - start.getTime()) / 86400000) + 1;

    // If year, that's huge. Let's cap at 365 or actual days

    const counts: Record<PrayerName, { mosque: number; adhkar: number }> = {
      fajr: { mosque: 0, adhkar: 0 },
      dhuhr: { mosque: 0, adhkar: 0 },
      asr: { mosque: 0, adhkar: 0 },
      maghrib: { mosque: 0, adhkar: 0 },
      isha: { mosque: 0, adhkar: 0 },
    };

    records.forEach((r) => {
      if (r.dayKey >= startKey && r.dayKey <= endKey) {
        if (r.mosque) counts[r.prayer].mosque++;
        if (r.adhkar) counts[r.prayer].adhkar++;
      }
    });

    return { counts, daysInPeriod };
  }, [records, startKey, endKey]);

  return (
    <div className="flex flex-col gap-3 px-4 pb-4 sm:px-6">
      {PRAYER_ORDER.map((prayer) => {
        const { mosque, adhkar } = stats.counts[prayer];
        const prayerName = t(language, `notifications.${prayer}`);

        return (
          <div key={prayer} className="flex flex-col gap-1 rounded-2xl border border-border/40 bg-card p-3 shadow-sm">
            <div className="font-bold text-[0.9375rem] text-foreground">{prayerName}</div>

            <div className="grid grid-cols-2 gap-3 mt-1">
              <div className="flex flex-col gap-1">
                <div className="flex justify-between text-[0.75rem] font-medium text-muted-foreground">
                  <span>{t(language, "prayerTracking.mosque")}</span>
                  <span>
                    {mosque} / {stats.daysInPeriod}
                  </span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-black/5 dark:bg-white/10 overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, Math.round((mosque / Math.max(1, stats.daysInPeriod)) * 100))}%` }}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <div className="flex justify-between text-[0.75rem] font-medium text-muted-foreground">
                  <span>{t(language, "prayerTracking.adhkar")}</span>
                  <span>
                    {adhkar} / {stats.daysInPeriod}
                  </span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-black/5 dark:bg-white/10 overflow-hidden">
                  <div
                    className="h-full bg-success rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, Math.round((adhkar / Math.max(1, stats.daysInPeriod)) * 100))}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
