import { useMemo } from "react";
import type { PrayerTrackingWrite } from "./PrayerTrackerCards";
import { CloudSun, MoonStar, Sun, Sunrise, Sunset } from "./icons";
import { t } from "../i18n";
import { formatPrayerTimeLabel } from "../content/prayerTimes";
import { formatNumerals } from "../formatting";
import { getPrayerVirtues } from "../content/prayerVirtues";
import { getPrayerMoment, type PrayerMoment } from "../prayerMoment";
import type { AppLanguage, LocationSettings, PrayerName, PrayerTrackingRecord } from "../types";
import { HomeCard } from "./HomeCard";
import { PrayerActionsCard } from "./PrayerActionsCard";

export const PRAYER_ICON: Record<PrayerName, typeof Sunrise> = {
  fajr: Sunrise,
  dhuhr: Sun,
  asr: CloudSun,
  maghrib: Sunset,
  isha: MoonStar,
};

/** One compact identity, reviewed virtue and editable checklist on Home and the prayer screen. */
export function PrayerMomentPanel({
  prayer,
  language,
  direction,
  records,
  dayKey,
  locationSettings,
  now = new Date(),
  onToggle,
  onOpenAdhkar,
  onGlass = false,
  canRecord = true,
}: {
  prayer: PrayerName;
  language: AppLanguage;
  direction: "ltr" | "rtl";
  records: readonly PrayerTrackingRecord[];
  dayKey: string;
  locationSettings?: LocationSettings;
  /** Injected so the states can be held to a fixed clock in a test. */
  now?: Date;
  onToggle: (prayer: PrayerName, field: PrayerTrackingWrite, value: boolean | "mosque" | "home" | null) => void;
  /** Use Home’s shared on-media palette when composed over its photograph. */
  onGlass?: boolean;
  /** Future prayers may be previewed shortly before adhan, but not recorded. */
  canRecord?: boolean;
  onOpenAdhkar: (prayer: PrayerName) => void;
}) {
  const moment: PrayerMoment = useMemo(
    () => getPrayerMoment({ prayer, now, dayKey, records, location: locationSettings }),
    [dayKey, locationSettings, now, prayer, records],
  );

  const isArabic = language === "ar";
  const name = t(language, `notifications.${prayer}`);
  const virtue = getPrayerVirtues(prayer)[0];

  const titleText = onGlass ? "text-on-media" : "text-foreground";
  const bodyText = onGlass ? "text-on-media-muted" : "text-muted-foreground";
  const accentText = onGlass ? "text-on-media-accent" : "text-primary";
  const hairline = onGlass ? "border-white/20" : "border-border/60";

  /* Only while the prayer is still ahead. Once it is in, "in 0 min" is worse
     than silence, and once recorded the wait is no longer the point. */
  const countdown =
    moment.phase === "approaching" || moment.phase === "upcoming"
      ? moment.minutesUntil <= 1
        ? t(language, "prayerMoment.countdownSoon")
        : t(language, "prayerMoment.countdownMinutes", { minutes: formatNumerals(moment.minutesUntil, language) })
      : null;

  const statusKey =
    moment.phase === "recorded"
      ? "prayerMoment.statusRecorded"
      : moment.phase === "now"
        ? "prayerMoment.statusNow"
        : moment.phase === "approaching"
          ? "prayerMoment.statusApproaching"
          : moment.phase === "passed"
            ? "prayerMoment.statusPassed"
            : "prayerMoment.statusUpcoming";

  return (
    <HomeCard as="article" onGlass={onGlass} padding="none" className="min-w-0 overflow-hidden">
      <div data-testid="prayer-journey">
        <PrayerActionsCard
          prayer={prayer}
          language={language}
          direction={direction}
          records={records}
          dayKey={dayKey}
          canRecord={canRecord}
          onToggle={onToggle}
          onOpenAdhkar={onOpenAdhkar}
          onGlass={onGlass}
          showProgress
          headingLevel={2}
          status={
            <div
              data-testid="prayer-moment-status"
              className={`flex flex-wrap gap-x-3 gap-y-1 text-label leading-relaxed ${bodyText}`}
            >
              <p>{t(language, statusKey)}</p>
              {countdown && <p dir="auto">{countdown}</p>}
              {prayer === "fajr" && moment.shroukTime && (
                <p dir="auto">
                  {t(language, "notifications.shrouk")}: {formatPrayerTimeLabel(moment.shroukTime, isArabic)}
                </p>
              )}
            </div>
          }
        >
          {virtue && (
            <section
              className={`min-w-0 border-y py-3 text-start ${hairline}`}
              data-testid="prayer-moment-virtue"
              aria-labelledby={`prayer-virtue-heading-${prayer}`}
            >
              <h3 id={`prayer-virtue-heading-${prayer}`} className={`text-sm font-semibold ${accentText}`} dir="auto">
                {t(language, "prayerMoment.virtueTitle", { prayer: name })}
              </h3>
              <p className={`mt-1 text-xs font-medium ${bodyText}`} dir="auto">
                {t(language, "prayerMoment.virtueAttribution")}
              </p>
              <p
                className={`mt-1 text-base font-semibold leading-loose ${titleText}`}
                dir={isArabic || !virtue.textEnglish ? "rtl" : "ltr"}
                lang={isArabic || !virtue.textEnglish ? "ar" : "en"}
              >
                {isArabic ? virtue.textArabic : (virtue.textEnglish ?? virtue.textArabic)}
              </p>
              <p className={`mt-1 text-xs font-medium ${bodyText}`} dir="auto">
                {isArabic ? virtue.referenceArabic : virtue.referenceEnglish}
              </p>
            </section>
          )}
        </PrayerActionsCard>
      </div>
    </HomeCard>
  );
}
