import { useMemo } from "react";
import type { PrayerTrackingWrite } from "./PrayerTrackerCards";
import { PrayerSceneArt } from "./PrayerSceneArt";
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

/** One shape for the three cards that record something. */
/**
 * The prayer at hand: the sky it is called in, why it is worth walking to, and
 * the three things a reader records about it.
 *
 * One component for two call sites. It is the body of PrayerMomentScreen, and
 * it is what Home shows in place of a link once the prayer is close enough to
 * act on — recording a prayer that is happening now should not cost a
 * navigation. Home and the screen therefore cannot drift: there is one hero,
 * one virtue, one set of action cards, and one definition of "live".
 *
 * It renders a fragment of grid items rather than its own container, because
 * the two call sites legitimately differ there — the screen is a scrolling
 * page, Home is one section in a column — while everything inside the grid is
 * the same in both.
 */
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
  fullWidth = false,
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
  /**
   * Rendered over the Home hero's photograph rather than on the page ground.
   *
   * The card carries its own `PrayerSceneArt` everywhere else, which is right
   * on its own screen and wrong on Home: two illustrations, the page's
   * photograph and the card's sky, competing for the same focal point behind
   * the same text. On glass the card drops its scene and lets the photograph be
   * the single ground, which is what `hero-glass` and the `on-media` tokens
   * were built for.
   */
  onGlass?: boolean;
  /** Future prayers may be previewed shortly before adhan, but not recorded. */
  canRecord?: boolean;
  onOpenAdhkar: (prayer: PrayerName) => void;
  fullWidth?: boolean;
}) {
  const moment: PrayerMoment = useMemo(
    () => getPrayerMoment({ prayer, now, dayKey, records, location: locationSettings }),
    [dayKey, locationSettings, now, prayer, records],
  );

  const isArabic = language === "ar";
  const name = t(language, `notifications.${prayer}`);
  const Icon = PRAYER_ICON[prayer];
  const virtue = getPrayerVirtues(prayer)[0];

  /* The prayer leads from twenty minutes before its adhan until the next one,
     and the moment it is recorded. Everywhere else this is a reference for a
     prayer that is not the one at hand. */
  /* The wide band is a fixed navy surface, so its controls take on-media colours
     rather than theme ones. Declared here rather than inline: this is the
     pairing that fails silently when one class string is left behind. */
  const titleText = onGlass ? "text-on-media" : "text-foreground";
  const bodyText = onGlass ? "text-on-media-muted" : "text-muted-foreground";
  const accentText = onGlass ? "text-on-media-accent" : "text-primary";
  const hairline = onGlass ? "border-white/20" : "border-border/60";

  const isLive = moment.phase === "now" || moment.phase === "approaching" || moment.phase === "recorded";

  /* Only while the prayer is still ahead. Once it is in, "in 0 min" is worse
     than silence, and once recorded the wait is no longer the point. */
  const countdown =
    moment.phase === "approaching" || moment.phase === "upcoming"
      ? moment.minutesUntil <= 1
        ? t(language, "prayerMoment.countdownSoon")
        : t(language, "prayerMoment.countdownMinutes", { minutes: formatNumerals(moment.minutesUntil, language) })
      : null;

  const approachFraction =
    moment.phase === "approaching" && moment.leadMinutes > 0
      ? Math.min(1, Math.max(0, (moment.leadMinutes - moment.minutesUntil) / moment.leadMinutes))
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
    <>
      <HomeCard as="article" onGlass={onGlass} className="flex flex-col overflow-hidden">
        <div className={`flex flex-col ${fullWidth && virtue && isLive ? "md:grid md:grid-cols-2" : ""}`}>
          <section
            /* A floor, not a height: the scene is the ground for the name and
            the time, and at content height alone it read as a strip of sky
            rather than as the sky. It still grows for a longer name, and on
            the wide grid it stretches to match the virtue beside it.

            bg-on-media-surface under the art, as the Home hero carries under
            its photograph. The scene is an absolutely positioned sibling at
            -z-10, so nothing in the ancestor chain describes what this white
            text sits on: the analyser read it as white on the light theme's
            page colour at 1.08:1, and it was right to — one failed paint and
            that is what a reader would get. */
            className={`relative isolate min-h-[11rem] border-b ${hairline} ${
              fullWidth && virtue && isLive ? "journey-hero-aside" : ""
            } ${onGlass ? "" : "bg-on-media-surface text-white"}`}
            data-testid="prayer-moment-hero"
          >
            {!onGlass && <PrayerSceneArt prayer={prayer} className="absolute inset-0 -z-10" />}
            {/* Fixed light-on-dark, because the scene is its own ground in every
            theme — the same rule the Home hero follows over its photograph. */}
            <div className="flex h-full flex-col justify-between gap-4 p-5 text-white">
              {/* Top block: Icon on left (if RTL, visually on left means start if flex-row-reverse or just justify-between), Name on right. Actually, flex items-start justify-between puts first item on start, second on end. To put Name on end and Icon on start, we can just use direction and let flex handle it. But the image shows Name on right (which is start in RTL) and Icon on left (which is end in RTL). So we use justify-between. */}
              <div className="flex flex-col gap-1 text-start">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-3xl font-black leading-tight md:text-4xl" dir="auto">
                      {name}
                    </h2>
                    {countdown && (
                      <p className="mt-1 text-label font-medium text-white/70" dir="auto">
                        {countdown}
                      </p>
                    )}
                  </div>
                  <span
                    className={`flex size-12 shrink-0 items-center justify-center rounded-full border-[1.5px] border-[currentColor]/70 ${accentText}`}
                  >
                    <Icon size={24} aria-hidden="true" />
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <div className="flex flex-wrap items-center gap-2.5">
                  <p className="text-4xl font-black leading-none tabular-nums" dir="auto">
                    {formatPrayerTimeLabel(moment.time, isArabic)}
                  </p>
                  {moment.phase === "now" && (
                    <span className="rounded-full bg-primary px-3 py-1 text-xs font-black text-primary-foreground">
                      {t(language, "prayerMoment.badgeNow")}
                    </span>
                  )}
                </div>
                {prayer === "fajr" && moment.shroukTime && (
                  <p className="text-sm font-semibold text-white/80 sm:hidden" dir="auto">
                    {t(language, "notifications.shrouk")}: {formatPrayerTimeLabel(moment.shroukTime, isArabic)}
                  </p>
                )}

                {approachFraction !== null && (
                  <div
                    role="meter"
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-valuenow={Math.round(approachFraction * 100)}
                    aria-label={t(language, "prayerMoment.countdownProgress", { prayer: name })}
                    className={`h-2 w-full overflow-hidden rounded-full ${onGlass ? "bg-white/20" : "bg-muted"}`}
                  >
                    <div
                      className="h-full rounded-full bg-primary transition-[width] duration-500 motion-reduce:transition-none"
                      style={{ width: `${Math.round(approachFraction * 100)}%` }}
                    />
                  </div>
                )}
              </div>
              <p className="flex items-center gap-2 text-label font-medium text-white/90">
                <span className="size-1.5 rounded-full bg-primary" aria-hidden="true" />
                {t(language, statusKey)}
              </p>
            </div>
          </section>
          {virtue && isLive && (
            <section
              className={`flex min-h-[11rem] flex-col justify-center border-b p-5 text-start md:p-6 ${hairline}`}
              data-testid="prayer-moment-virtue"
            >
              <h3 className={`text-subtitle font-black ${accentText}`} dir="auto">
                {t(language, "prayerMoment.virtueTitle", { prayer: name })}
              </h3>
              <p className={`mt-2 text-xs font-bold ${bodyText}`} dir="auto">
                {t(language, "prayerMoment.virtueAttribution")}
              </p>
              <p
                className={`mt-2 text-title font-bold leading-loose ${titleText} ${isArabic || !virtue.textEnglish ? "zikr-text" : ""}`}
                dir={isArabic || !virtue.textEnglish ? "rtl" : "ltr"}
                lang={isArabic || !virtue.textEnglish ? "ar" : "en"}
              >
                {isArabic ? virtue.textArabic : (virtue.textEnglish ?? virtue.textArabic)}
              </p>
              <p className={`mt-2 text-xs font-semibold ${bodyText}`} dir="auto">
                {isArabic ? virtue.referenceArabic : virtue.referenceEnglish}
              </p>
            </section>
          )}
        </div>
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
          />
        </div>
      </HomeCard>
    </>
  );
}
