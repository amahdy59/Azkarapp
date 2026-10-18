import { t } from "../i18n";
import { formatNumerals } from "../formatting";
import { PRAYER_NAMES } from "../content/prayerTimes";
import { trackedLocation } from "../prayerMoment";
import { prayerDisplayName } from "../prayerPresentation";
import type { AppLanguage, PrayerTrackingRecord } from "../types";
import { Check } from "./icons";

/** Read-only facts for the selected day, independent of today's clock. */
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
  const selected = [...byPrayer.values()];
  const practices = [
    {
      field: "sunnah",
      label: t(language, "prayerTracking.sunnah"),
      count: selected.filter((record) => record.sunnah).length,
    },
    {
      field: "adhkar",
      label: t(language, "prayerTracking.adhkar"),
      count: selected.filter((record) => record.adhkar).length,
    },
  ] as const;
  function recorded(value: boolean) {
    return value ? (
      <span className="inline-flex items-center justify-center text-foreground">
        <Check size={18} aria-hidden="true" />
        <span className="sr-only">{t(language, "progress.prayerPracticeRecorded")}</span>
      </span>
    ) : (
      <span>
        <span aria-hidden="true">—</span>
        <span className="sr-only">{t(language, "prayerTracking.notRecorded")}</span>
      </span>
    );
  }
  return (
    <div data-testid="prayer-progress-summary" className="px-4 pb-4 sm:px-5">
      <dl className="divide-y divide-border">
        {practices.map((practice) => (
          <div
            key={practice.field}
            className="flex min-w-0 flex-wrap items-center justify-between gap-x-4 gap-y-1 py-2"
          >
            <dt className="text-xs font-semibold leading-relaxed text-muted-foreground">{practice.label}</dt>
            <dd className="break-words text-sm font-bold text-foreground">
              {t(language, "progress.prayerPracticeCount", { count: formatNumerals(practice.count, language) })}
            </dd>
          </div>
        ))}
      </dl>
      <details className="mt-3">
        <summary className="min-h-11 cursor-pointer rounded-lg py-3 text-sm font-semibold text-foreground focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring">
          {t(language, "progress.prayerBreakdown")}
        </summary>
        <p className="mb-3 text-xs leading-relaxed text-muted-foreground">
          {t(language, "progress.prayerNoRecordExplanation")}
        </p>
        <div
          role="region"
          aria-label={t(language, "progress.prayerTrackingTable")}
          // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex -- Named native table scroll region must remain keyboard-scrollable at enlarged text.
          tabIndex={0}
          className="overflow-x-auto rounded-lg outline-none focus-visible:ring-[3px] focus-visible:ring-ring"
        >
          <table className="w-full min-w-[24rem] border-collapse text-start text-sm">
            <caption className="sr-only">{t(language, "progress.prayerTrackingTable")}</caption>
            <thead>
              <tr className="border-b border-border">
                <th scope="col" className="p-2 text-start font-semibold">
                  {t(language, "dailyPath.prayer")}
                </th>
                <th scope="col" className="p-2 text-start font-semibold">
                  {t(language, "prayerTracking.prayed")}
                </th>
                {practices.map((practice) => (
                  <th key={practice.field} scope="col" className="p-2 text-center font-semibold">
                    {practice.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {PRAYER_NAMES.map((prayer) => {
                const record = byPrayer.get(prayer);
                const location = trackedLocation(record);
                return (
                  <tr key={prayer} className="border-b border-border last:border-0">
                    <th scope="row" className="p-2 text-start font-semibold">
                      {prayerDisplayName(prayer, language, dayKey)}
                    </th>
                    <td className="p-2">
                      {location
                        ? t(language, location === "mosque" ? "prayerTracking.atMosque" : "prayerTracking.atHome")
                        : recorded(false)}
                    </td>
                    {practices.map((practice) => (
                      <td key={practice.field} className="p-2 text-center">
                        {recorded(record?.[practice.field] === true)}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </details>
    </div>
  );
}
