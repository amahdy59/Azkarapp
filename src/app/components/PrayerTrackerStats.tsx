import { useMemo } from "react";
import { AppLanguage, PrayerName, PrayerTrackingRecord } from "../types";
import { getElapsedPeriod } from "../elapsedPeriod";
import { getPeriodRange } from "../calendarPeriods";
import { CalendarType } from "../calendarPeriods";
import { PRAYER_ORDER } from "./PrayerTrackerCards";
import { formatNumerals, formatRatio, formatPercentage } from "../formatting";
import { t } from "../i18n";
import { ChevronDown } from "./icons";

interface PrayerPeriodCounts {
  fard: number;
  mosque: number;
  rawatib: number;
  adhkar: number;
}

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
  const period = useMemo(
    () => getPeriodRange(activeTab, displayDate, language, calendarType),
    [activeTab, displayDate, language, calendarType],
  );

  const { startKey, endKey, days: daysInPeriod } = getElapsedPeriod(period.startKey, period.endKey, now);

  const stats = useMemo(() => {
    const counts: Record<PrayerName, PrayerPeriodCounts> = {
      fajr: { fard: 0, mosque: 0, rawatib: 0, adhkar: 0 },
      dhuhr: { fard: 0, mosque: 0, rawatib: 0, adhkar: 0 },
      asr: { fard: 0, mosque: 0, rawatib: 0, adhkar: 0 },
      maghrib: { fard: 0, mosque: 0, rawatib: 0, adhkar: 0 },
      isha: { fard: 0, mosque: 0, rawatib: 0, adhkar: 0 },
    };

    let totalFard = 0;
    let totalMosque = 0;
    let totalRawatib = 0;
    let totalAdhkar = 0;

    records.forEach((r) => {
      if (r.dayKey >= startKey && r.dayKey <= endKey && counts[r.prayer]) {
        const isFard = r.location === "mosque" || r.location === "home" || r.mosque;
        const isMosque = r.location === "mosque" || r.mosque;
        const isRawatib = r.prayer !== "asr" && Boolean(r.sunnah || r.sunnahBefore || r.sunnahAfter);
        const isAdhkar = Boolean(r.adhkar);

        if (isFard) {
          counts[r.prayer].fard++;
          totalFard++;
        }
        if (isMosque) {
          counts[r.prayer].mosque++;
          totalMosque++;
        }
        if (isRawatib) {
          counts[r.prayer].rawatib++;
          totalRawatib++;
        }
        if (isAdhkar) {
          counts[r.prayer].adhkar++;
          totalAdhkar++;
        }
      }
    });

    const maxTotalPrayers = daysInPeriod * 5;

    return { counts, daysInPeriod, totalFard, totalMosque, totalRawatib, totalAdhkar, maxTotalPrayers };
  }, [records, startKey, endKey, daysInPeriod]);

  const recordingRate = (count: number, total: number) =>
    total === 0 ? "—" : formatPercentage(Math.round((count / total) * 100), language);

  return (
    <div className="flex flex-col gap-3 px-4 pb-4 sm:px-5">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <span className="text-sm font-bold text-foreground">{t(language, "progress.prayerRecordingRate")}</span>
        <bdi className="text-xl font-black text-primary">
          {activeTab === "year"
            ? recordingRate(stats.totalFard, stats.maxTotalPrayers)
            : formatRatio(stats.totalFard, stats.maxTotalPrayers, language)}
        </bdi>
      </div>
      <p className="text-xs leading-relaxed text-muted-foreground" data-testid="prayer-coverage-hint">
        {t(language, "progress.recordingCoverageHint", { days: formatNumerals(daysInPeriod, language) })}
      </p>
      <details className="group border-t border-border">
        <summary className="flex min-h-11 cursor-pointer items-center justify-between gap-2 py-3 text-sm font-bold text-foreground focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring">
          {t(language, "progress.showPrayerBreakdown")}
          <ChevronDown size={18} className="shrink-0 group-open:rotate-180" aria-hidden="true" />
        </summary>
        <dl className="divide-y divide-border">
          {(
            [
              ["prayerTracking.mosqueSummary", stats.totalMosque, stats.maxTotalPrayers],
              ["prayerTracking.rawatibSummary", stats.totalRawatib, stats.daysInPeriod * 4],
              ["prayerTracking.adhkarSummary", stats.totalAdhkar, stats.maxTotalPrayers],
            ] as const
          ).map(([label, count, total]) => (
            <div key={label} className="flex flex-wrap justify-between gap-2 py-3 text-sm">
              <dt className="text-muted-foreground">{t(language, label)}</dt>
              <dd className="font-bold text-foreground">
                <bdi>{activeTab === "year" ? recordingRate(count, total) : formatRatio(count, total, language)}</bdi>
              </dd>
            </div>
          ))}
        </dl>
        <div className="mt-3 divide-y divide-border">
          {PRAYER_ORDER.map((prayer) => {
            const { fard, mosque, rawatib, adhkar } = stats.counts[prayer];
            return (
              <section key={prayer} className="py-4">
                <h3 className="mb-3 text-base font-bold text-foreground">
                  {t(language, ("notifications." + prayer) as Parameters<typeof t>[1])}
                </h3>
                <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {(
                    [
                      ["prayerTracking.fard", fard],
                      ["prayerTracking.atMosque", mosque],
                      ["prayerTracking.rawatib", prayer === "asr" ? null : rawatib],
                      ["prayerTracking.adhkar", adhkar],
                    ] as const
                  ).map(([label, count]) => (
                    <div key={label} className="min-w-0">
                      <dt className="text-xs leading-relaxed text-muted-foreground">{t(language, label)}</dt>
                      <dd className="mt-1 text-sm font-bold text-foreground">
                        <bdi>
                          {count === null
                            ? "—"
                            : activeTab === "year"
                              ? recordingRate(count, stats.daysInPeriod)
                              : formatRatio(count, stats.daysInPeriod, language)}
                        </bdi>
                      </dd>
                    </div>
                  ))}
                </dl>
              </section>
            );
          })}
        </div>
      </details>
    </div>
  );
}
