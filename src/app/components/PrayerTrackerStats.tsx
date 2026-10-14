import { useMemo } from "react";
import { AppLanguage, PrayerName, PrayerTrackingRecord } from "../types";
import { getElapsedPeriod } from "../elapsedPeriod";
import { getPeriodRange } from "../calendarPeriods";
import { CalendarType } from "../calendarPeriods";
import { PRAYER_ORDER, PRAYER_ICON } from "./PrayerTrackerCards";
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

  const overallPct =
    stats.maxTotalPrayers > 0 ? Math.min(100, Math.round((stats.totalFard / stats.maxTotalPrayers) * 100)) : 0;

  return (
    <div className="flex flex-col gap-3 px-4 pb-4 sm:px-5">
      <div className="flex flex-col gap-1.5">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <span className="text-sm font-bold text-foreground">{t(language, "progress.prayerRecordingRate")}</span>
          <bdi className="text-xl font-black text-primary">
            {activeTab === "year"
              ? recordingRate(stats.totalFard, stats.maxTotalPrayers)
              : formatRatio(stats.totalFard, stats.maxTotalPrayers, language)}
          </bdi>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary transition-all duration-standard"
            style={{ width: `${overallPct}%` }}
          />
        </div>
      </div>
      <p className="text-xs leading-relaxed text-muted-foreground" data-testid="prayer-coverage-hint">
        {t(language, "progress.recordingCoverageHint", { days: formatNumerals(daysInPeriod, language) })}
      </p>
      <details className="group border-t border-border">
        <summary className="flex min-h-11 cursor-pointer items-center justify-between gap-2 py-3 text-sm font-bold text-foreground focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring">
          {t(language, "progress.showPrayerBreakdown")}
          <ChevronDown size={18} className="shrink-0 group-open:rotate-180" aria-hidden="true" />
        </summary>
        <dl className="grid grid-cols-1 gap-2.5 py-2 sm:grid-cols-3">
          {(
            [
              ["prayerTracking.mosqueSummary", stats.totalMosque, stats.maxTotalPrayers],
              ["prayerTracking.rawatibSummary", stats.totalRawatib, stats.daysInPeriod * 4],
              ["prayerTracking.adhkarSummary", stats.totalAdhkar, stats.maxTotalPrayers],
            ] as const
          ).map(([label, count, total]) => {
            const pct = total > 0 ? Math.min(100, Math.round((count / total) * 100)) : null;
            return (
              <div
                key={label}
                className="flex flex-col justify-between rounded-xl border border-border/70 bg-muted/30 p-3 transition-colors"
              >
                <div className="flex items-center justify-between gap-2">
                  <dt className="text-xs font-bold text-muted-foreground">{t(language, label)}</dt>
                  {pct !== null && (
                    <span className="rounded-md bg-primary/10 px-1.5 py-0.5 text-micro font-bold text-primary">
                      {formatPercentage(pct, language)}
                    </span>
                  )}
                </div>
                <dd className="mt-2 text-base font-black text-foreground">
                  <bdi>{activeTab === "year" ? recordingRate(count, total) : formatRatio(count, total, language)}</bdi>
                </dd>
                <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary transition-all duration-standard"
                    style={{ width: `${pct ?? 0}%` }}
                  />
                </div>
              </div>
            );
          })}
        </dl>
        <div className="mt-3 divide-y divide-border">
          {PRAYER_ORDER.map((prayer) => {
            const { fard, mosque, rawatib, adhkar } = stats.counts[prayer];
            const Icon = PRAYER_ICON[prayer];
            return (
              <section key={prayer} className="py-4">
                <div className="mb-3 flex items-center gap-2">
                  <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Icon size={16} />
                  </span>
                  <h3 className="text-base font-bold text-foreground">
                    {t(language, ("notifications." + prayer) as Parameters<typeof t>[1])}
                  </h3>
                </div>
                <dl className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
                  {(
                    [
                      ["prayerTracking.fard", fard, stats.daysInPeriod],
                      ["prayerTracking.atMosque", mosque, stats.daysInPeriod],
                      ["prayerTracking.rawatib", prayer === "asr" ? null : rawatib, stats.daysInPeriod],
                      ["prayerTracking.adhkar", adhkar, stats.daysInPeriod],
                    ] as const
                  ).map(([label, count, maxPossible]) => {
                    const pct =
                      count !== null && maxPossible > 0 ? Math.min(100, Math.round((count / maxPossible) * 100)) : 0;
                    return (
                      <div
                        key={label}
                        className="flex flex-col justify-between rounded-xl border border-border/50 bg-card/60 p-2.5 shadow-2xs transition-colors hover:border-border"
                      >
                        <dt className="text-xs font-semibold text-muted-foreground">{t(language, label)}</dt>
                        <dd className="mt-1 flex items-baseline justify-between gap-1 text-sm font-bold text-foreground">
                          <bdi>
                            {count === null
                              ? "—"
                              : activeTab === "year"
                                ? recordingRate(count, stats.daysInPeriod)
                                : formatRatio(count, stats.daysInPeriod, language)}
                          </bdi>
                          {count !== null && (
                            <span className="text-micro font-medium text-muted-foreground">
                              {activeTab === "year"
                                ? formatRatio(count, stats.daysInPeriod, language)
                                : formatPercentage(pct, language)}
                            </span>
                          )}
                        </dd>
                        {count !== null && (
                          <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted/60">
                            <div
                              className={`h-full rounded-full transition-all duration-standard ${
                                pct > 0 ? "bg-primary" : "bg-transparent"
                              }`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </dl>
              </section>
            );
          })}
        </div>
      </details>
    </div>
  );
}
