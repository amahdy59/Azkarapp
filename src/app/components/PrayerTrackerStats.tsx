import { useMemo } from "react";
import { AppLanguage, PrayerName, PrayerTrackingRecord } from "../types";
import { getPeriodRange } from "../calendarPeriods";
import { CalendarType } from "../calendarPeriods";
import { PRAYER_ORDER } from "./PrayerTrackerCards";
import { formatNumerals, formatRatio } from "../formatting";
import { t } from "../i18n";
import { Building, Check, Sparkles, Sun } from "./icons";

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
    const start = new Date(startKey);
    const end = new Date(endKey);
    const daysInPeriod = Math.max(1, Math.round((end.getTime() - start.getTime()) / 86400000) + 1);

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
        const isRawatib = Boolean(r.sunnah || r.sunnahBefore || r.sunnahAfter);
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
  }, [records, startKey, endKey]);

  return (
    <div className="flex flex-col gap-4 px-4 pb-4 sm:px-6">
      {/* Overview Totals for the Selected Period */}
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
        <div className="flex flex-col gap-1 rounded-2xl border border-border/60 bg-card p-3 shadow-xs">
          <div className="flex items-center gap-1.5 text-micro font-bold text-muted-foreground">
            <Sun className="size-3.5 text-primary" />
            <span className="truncate">{t(language, "prayerTracking.prayersSummary")}</span>
          </div>
          <div className="text-base font-black text-foreground">
            {formatRatio(stats.totalFard, stats.maxTotalPrayers, language)}
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-all duration-500"
              style={{
                width: `${Math.min(100, Math.round((stats.totalFard / Math.max(1, stats.maxTotalPrayers)) * 100))}%`,
              }}
            />
          </div>
        </div>

        <div className="flex flex-col gap-1 rounded-2xl border border-border/60 bg-card p-3 shadow-xs">
          <div className="flex items-center gap-1.5 text-micro font-bold text-muted-foreground">
            <Building className="size-3.5 text-primary" />
            <span className="truncate">{t(language, "prayerTracking.mosqueSummary")}</span>
          </div>
          <div className="text-base font-black text-foreground">
            {formatRatio(stats.totalMosque, stats.maxTotalPrayers, language)}
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-all duration-500"
              style={{
                width: `${Math.min(100, Math.round((stats.totalMosque / Math.max(1, stats.maxTotalPrayers)) * 100))}%`,
              }}
            />
          </div>
        </div>

        <div className="flex flex-col gap-1 rounded-2xl border border-border/60 bg-card p-3 shadow-xs">
          <div className="flex items-center gap-1.5 text-micro font-bold text-muted-foreground">
            <Sparkles className="size-3.5 text-secondary" />
            <span className="truncate">{t(language, "prayerTracking.rawatibSummary")}</span>
          </div>
          <div className="text-base font-black text-foreground">{formatNumerals(stats.totalRawatib, language)}</div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-secondary transition-all duration-500"
              style={{
                width: `${Math.min(100, Math.round((stats.totalRawatib / Math.max(1, stats.daysInPeriod * 4)) * 100))}%`,
              }}
            />
          </div>
        </div>

        <div className="flex flex-col gap-1 rounded-2xl border border-border/60 bg-card p-3 shadow-xs">
          <div className="flex items-center gap-1.5 text-micro font-bold text-muted-foreground">
            <Check className="size-3.5 text-success" />
            <span className="truncate">{t(language, "prayerTracking.adhkarSummary")}</span>
          </div>
          <div className="text-base font-black text-foreground">
            {formatRatio(stats.totalAdhkar, stats.maxTotalPrayers, language)}
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-success transition-all duration-500"
              style={{
                width: `${Math.min(100, Math.round((stats.totalAdhkar / Math.max(1, stats.maxTotalPrayers)) * 100))}%`,
              }}
            />
          </div>
        </div>
      </div>

      {/* Per-Prayer Detailed Breakdown */}
      {PRAYER_ORDER.map((prayer) => {
        const { fard, mosque, rawatib, adhkar } = stats.counts[prayer];
        const prayerName = t(language, `notifications.${prayer}`);
        const hasRawatib = prayer !== "asr";

        return (
          <div key={prayer} className="flex flex-col gap-2 rounded-2xl border border-border/50 bg-card p-3.5 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="font-extrabold text-subtitle text-foreground">{prayerName}</span>
              <span className="text-xs font-bold text-muted-foreground">
                {formatRatio(fard, stats.daysInPeriod, language)}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {/* Fard */}
              <div className="flex flex-col gap-1">
                <div className="flex justify-between items-center text-micro font-semibold text-muted-foreground">
                  <span>{t(language, "prayerTracking.fard")}</span>
                  <bdi className="font-bold text-foreground">{formatRatio(fard, stats.daysInPeriod, language)}</bdi>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary transition-all duration-500"
                    style={{ width: `${Math.min(100, Math.round((fard / Math.max(1, stats.daysInPeriod)) * 100))}%` }}
                  />
                </div>
              </div>

              {/* Mosque */}
              <div className="flex flex-col gap-1">
                <div className="flex justify-between items-center text-micro font-semibold text-muted-foreground">
                  <span>{t(language, "prayerTracking.atMosque")}</span>
                  <bdi className="font-bold text-foreground">{formatRatio(mosque, stats.daysInPeriod, language)}</bdi>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary/80 transition-all duration-500"
                    style={{ width: `${Math.min(100, Math.round((mosque / Math.max(1, stats.daysInPeriod)) * 100))}%` }}
                  />
                </div>
              </div>

              {/* Rawatib (if applicable) */}
              <div className="flex flex-col gap-1">
                <div className="flex justify-between items-center text-micro font-semibold text-muted-foreground">
                  <span>{t(language, "prayerTracking.rawatib")}</span>
                  <bdi className="font-bold text-foreground">
                    {hasRawatib ? formatRatio(rawatib, stats.daysInPeriod, language) : "—"}
                  </bdi>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-secondary transition-all duration-500"
                    style={{
                      width: hasRawatib
                        ? `${Math.min(100, Math.round((rawatib / Math.max(1, stats.daysInPeriod)) * 100))}%`
                        : "0%",
                    }}
                  />
                </div>
              </div>

              {/* Adhkar */}
              <div className="flex flex-col gap-1">
                <div className="flex justify-between items-center text-micro font-semibold text-muted-foreground">
                  <span>{t(language, "prayerTracking.adhkar")}</span>
                  <bdi className="font-bold text-foreground">{formatRatio(adhkar, stats.daysInPeriod, language)}</bdi>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-success transition-all duration-500"
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
