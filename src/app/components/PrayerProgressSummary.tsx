import { t } from "../i18n";
import { progressText } from "../i18n/progressInsights";
import { PRAYER_NAMES } from "../content/prayerTimes";
import { trackedLocation } from "../prayerMoment";
import { prayerDisplayName } from "../prayerPresentation";
import type { AppLanguage, PrayerTrackingRecord } from "../types";
import { Check } from "./icons";

/** A daily status diagram; Home remains the place to record practices. */
export function PrayerProgressSummary({
  records,
  dayKey,
  language,
}: {
  records: readonly PrayerTrackingRecord[];
  dayKey: string;
  language: AppLanguage;
}) {
  const byPrayer = new Map(
    records.filter((record) => record.dayKey === dayKey).map((record) => [record.prayer, record]),
  );
  return (
    <div data-testid="prayer-progress-summary" className="px-4 pb-4 sm:px-5">
      <ul className="divide-y divide-border">
        {PRAYER_NAMES.map((prayer) => {
          const record = byPrayer.get(prayer);
          const location = trackedLocation(record);
          return (
            <li key={prayer} className="flex flex-wrap items-start justify-between gap-2 py-3">
              <span className="text-sm font-bold">{prayerDisplayName(prayer, language, dayKey)}</span>
              <div className="flex flex-wrap items-center justify-end gap-x-3 gap-y-2 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1">
                  {location && <Check size={16} aria-hidden="true" />}
                  {t(
                    language,
                    location === "mosque"
                      ? "prayerTracking.atMosque"
                      : location === "home"
                        ? "prayerTracking.atHome"
                        : "prayerTracking.notRecorded",
                  )}
                </span>
                {prayer !== "asr" && (record?.sunnah || record?.sunnahBefore || record?.sunnahAfter) && (
                  <span className="inline-flex items-center gap-1">
                    <Check size={14} aria-hidden="true" />
                    {t(language, "prayerTracking.rawatib")}
                  </span>
                )}
                {record?.adhkar && (
                  <span className="inline-flex items-center gap-1">
                    <Check size={14} aria-hidden="true" />
                    {t(language, "prayerTracking.adhkar")}
                  </span>
                )}
              </div>
            </li>
          );
        })}
      </ul>
      <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
        {progressText(language, "insights.noRecord")}
      </p>
    </div>
  );
}
