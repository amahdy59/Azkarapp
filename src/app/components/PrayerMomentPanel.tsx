import { useMemo, useState } from "react";
import type { PrayerTrackingWrite } from "./PrayerTrackerCards";
import { ChevronDown, CloudSun, MoonStar, Sun, Sunrise, Sunset } from "./icons";
import { t } from "../i18n";
import { formatPrayerTimeLabel, getEstimatedPrayerTimes } from "../content/prayerTimes";
import { isJumuahPrayer, prayerDisplayName } from "../prayerPresentation";
import { JUMUAH_VIRTUE } from "../content/fridayPrayer";
import { getPrayerVirtues } from "../content/prayerVirtues";
import type { AppLanguage, LocationSettings, PrayerName, PrayerTrackingRecord } from "../types";
import { HomeCard } from "./HomeCard";
import { PrayerActionsCard } from "./PrayerActionsCard";
import { dateFromProgressDayKey } from "../progress";
import { formatDisplayDate } from "../formatting";

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
  calendarType = "hijri",
  hijriDateOffset = 0,
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
  calendarType?: "hijri" | "gregorian";
  hijriDateOffset?: number;
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
  const [evidenceExpanded, setEvidenceExpanded] = useState(false);
  const times = useMemo(() => getEstimatedPrayerTimes(now, locationSettings), [now, locationSettings]);

  const isArabic = language === "ar";
  const name = prayerDisplayName(prayer, language, dayKey);
  const virtue = isJumuahPrayer(prayer, dayKey) ? JUMUAH_VIRTUE : getPrayerVirtues(prayer)[0];

  const titleText = onGlass ? "text-on-media" : "text-foreground";
  const bodyText = onGlass ? "text-on-media-muted" : "text-muted-foreground";
  const accentText = onGlass ? "text-on-media-accent" : "text-primary";
  const hairline = onGlass ? "border-white/20" : "border-border/60";

  // The checklist writes this record day, which can precede the civil date
  // around midnight. Name it explicitly instead of implying today's adhan.
  const recordDate = dateFromProgressDayKey(dayKey);
  const dateLabel = Number.isNaN(recordDate.getTime())
    ? dayKey
    : formatDisplayDate(recordDate, language, calendarType, hijriDateOffset);

  return (
    <HomeCard as="article" onGlass={onGlass} padding="none" className="prayer-moment-panel min-w-0 overflow-hidden">
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
          headingLevel={2}
          subtitle={
            prayer === "fajr" && times.shrouk ? (
              <p data-testid="prayer-sunrise-context" dir="auto">
                {t(language, "notifications.shrouk")}: {formatPrayerTimeLabel(times.shrouk, isArabic)}
              </p>
            ) : undefined
          }
          infoContext={
            <div
              data-testid="prayer-moment-status"
              className={`flex min-w-0 flex-col gap-1 text-label leading-normal ${bodyText}`}
            >
              <time dateTime={dayKey} data-testid="prayer-record-date" dir="auto">
                {t(language, "prayerMoment.recordDate", { date: dateLabel })}
              </time>
            </div>
          }
        >
          {virtue && (
            <section
              className={`prayer-actions-evidence min-w-0 border-t pt-2 text-start ${hairline}`}
              data-expanded={evidenceExpanded}
              data-testid="prayer-moment-virtue"
              aria-labelledby={`prayer-virtue-heading-${prayer}`}
            >
              <h3
                id={`prayer-virtue-heading-${prayer}`}
                className={`text-title font-semibold leading-normal ${accentText}`}
                dir="auto"
              >
                <span className="prayer-evidence-desktop-title leading-normal">
                  {t(language, "prayerMoment.virtueTitle", { prayer: name })}
                </span>
                <button
                  type="button"
                  className="prayer-evidence-toggle flex min-h-11 w-full items-center justify-between gap-2 rounded-xl text-start focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring"
                  aria-expanded={evidenceExpanded}
                  aria-controls={`prayer-evidence-body-${prayer}`}
                  onClick={() => setEvidenceExpanded((expanded) => !expanded)}
                >
                  <span>{t(language, "prayerMoment.virtueTitle", { prayer: name })}</span>
                  <ChevronDown
                    size={18}
                    aria-hidden="true"
                    className={evidenceExpanded ? "rotate-180 shrink-0" : "shrink-0"}
                  />
                </button>
              </h3>
              <div id={`prayer-evidence-body-${prayer}`} className="prayer-evidence-body">
                <p
                  className={`mt-1 text-label font-medium leading-normal ${bodyText}`}
                  dir="auto"
                  data-testid="prayer-virtue-attribution"
                >
                  {t(language, "prayerMoment.virtueAttribution")}
                </p>
                <p
                  className={`mt-1 text-base font-semibold leading-loose ${titleText}`}
                  dir={isArabic || !virtue.textEnglish ? "rtl" : "ltr"}
                  lang={isArabic || !virtue.textEnglish ? "ar" : "en"}
                >
                  {isArabic ? virtue.textArabic : (virtue.textEnglish ?? virtue.textArabic)}{" "}
                  <span
                    className={`inline text-xs font-medium ${bodyText}`}
                    dir="auto"
                    data-testid="prayer-virtue-source"
                  >
                    {isArabic ? virtue.referenceArabic : virtue.referenceEnglish}
                  </span>
                </p>
              </div>
            </section>
          )}
        </PrayerActionsCard>
      </div>
    </HomeCard>
  );
}
