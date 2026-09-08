import { useMemo, useState } from "react";
import { TrackingCheckMark } from "./PrayerTrackerCards";
import { PrayerSceneArt } from "./PrayerSceneArt";
import { CloudSun, Info, MoonStar, Sun, Sunrise, Sunset, Translate } from "./icons";
import { t } from "../i18n";
import { formatPrayerTimeLabel } from "../content/prayerTimes";
import { formatNumerals } from "../formatting";
import { getPrayerSunnah } from "../content/prayerSunnah";
import { Modal } from "./ResponsiveSheet";
import { getPrayerVirtues } from "../content/prayerVirtues";
import { getPrayerMoment, type PrayerMoment } from "../prayerMoment";
import type { AppLanguage, LocationSettings, PrayerName, PrayerTrackingRecord } from "../types";

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
}: {
  prayer: PrayerName;
  language: AppLanguage;
  direction: "ltr" | "rtl";
  records: readonly PrayerTrackingRecord[];
  dayKey: string;
  locationSettings?: LocationSettings;
  /** Injected so the states can be held to a fixed clock in a test. */
  now?: Date;
  onToggle: (
    prayer: PrayerName,
    field: "location" | "adhkar" | "sunnah",
    value: boolean | "mosque" | "home" | null,
  ) => void;
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
  onOpenAdhkar: (prayer: PrayerName) => void;
}) {
  const moment: PrayerMoment = useMemo(
    () => getPrayerMoment({ prayer, now, dayKey, records, location: locationSettings }),
    [dayKey, locationSettings, now, prayer, records],
  );

  const isArabic = language === "ar";
  const name = t(language, `notifications.${prayer}`);
  const Icon = PRAYER_ICON[prayer];
  const sunnah = moment.sunnahFocus ? getPrayerSunnah(prayer, moment.sunnahFocus) : null;
  const [evidenceOpen, setEvidenceOpen] = useState(false);
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
  const iconButton = onGlass
    ? "border-white/30 text-on-media-muted hover:bg-white/10"
    : "border-border text-muted-foreground hover:bg-muted";

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

  /* Arabic counts its rak'ahs, it does not number them: two is a dual noun and
     four takes the plural, so a "{count} rak'ahs" template would read as
     broken Arabic at both of the counts the confirmed rawātib actually use. */
  const rakahCount = (sunnah?.before ?? 0) + (sunnah?.after ?? 0);
  const rakahs = t(language, rakahCount === 4 ? "prayerMoment.rakahFour" : "prayerMoment.rakahTwo");
  const sunnahDetail = moment.sunnahFocus
    ? t(language, moment.sunnahFocus === "before" ? "prayerMoment.sunnahBefore" : "prayerMoment.sunnahAfter", {
        rakahs,
        prayer: name,
      })
    : "";

  return (
    <>
      {/* The prayer, its time, and the sky it is called in. */}
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
        className={`relative isolate min-h-[11rem] overflow-hidden ${
          onGlass ? "border-b border-white/10" : "rounded-2xl border border-border bg-on-media-surface"
        }`}
        data-testid="prayer-moment-hero"
      >
        {!onGlass && <PrayerSceneArt prayer={prayer} className="absolute inset-0 -z-10 h-full w-full" />}
        {/* Fixed light-on-dark, because the scene is its own ground in every
            theme — the same rule the Home hero follows over its photograph. */}
        <div className="flex h-full flex-col justify-between gap-3 p-4 text-white">
          <div className="flex items-start justify-between gap-3">
            <h2 className="text-2xl font-black leading-tight md:text-3xl" dir="auto">
              {name}
            </h2>
            <span
              className={`flex size-11 shrink-0 items-center justify-center rounded-full border border-[currentColor]/70 ${accentText}`}
            >
              <Icon size={22} aria-hidden="true" />
            </span>
          </div>
          <div className="flex flex-col gap-2">
            {/* The wait, before the time itself: "in 15 min" is what a reader
                checking the card actually wants, and the clock time is the
                detail that answers "when exactly". */}
            {countdown && (
              <p className="text-label font-bold text-white/85" dir="auto">
                {countdown}
              </p>
            )}
            <div className="flex flex-wrap items-center gap-2.5">
              <p className="text-3xl font-black leading-none tabular-nums" dir="auto">
                {formatPrayerTimeLabel(moment.time, isArabic)}
              </p>
              {/* Only when the prayer is actually in.  also covers the
                  approach and the moments after recording, so the badge read
                  "Now" beside a countdown saying the prayer was thirteen minutes
                  away — a contradiction that only became visible once the
                  countdown was there to contradict. */}
              {moment.phase === "now" && (
                <span className="rounded-full bg-primary px-3 py-1 text-xs font-black text-primary-foreground">
                  {t(language, "prayerMoment.badgeNow")}
                </span>
              )}
            </div>
            {/* How much of the approach has run. A meter rather than a
                progressbar: this reports a quantity within a known range, and
                it is measured against this prayer's own lead — which is capped
                by half the gap from the previous prayer, so a bar drawn against
                the uncapped constant would start part-filled for exactly the
                prayers whose window is shortest. */}
            {approachFraction !== null && (
              <div
                role="meter"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={Math.round(approachFraction * 100)}
                aria-label={t(language, "prayerMoment.countdownProgress", { prayer: name })}
                className="h-1.5 w-full overflow-hidden rounded-full bg-white/20"
              >
                <div
                  className="h-full rounded-full bg-primary transition-[width] duration-500 motion-reduce:transition-none"
                  style={{ width: `${Math.round(approachFraction * 100)}%` }}
                />
              </div>
            )}
          </div>
          <p className="flex items-center gap-2 text-label font-bold text-white/80">
            <span className="size-1.5 rounded-full bg-primary" aria-hidden="true" />
            {t(language, statusKey)}
          </p>
        </div>
      </section>

      {/* Why this prayer is worth walking to — before the deed, where it can
          still be an invitation rather than a reward for one. */}
      {virtue && isLive && (
        <section
          className={`flex flex-col justify-center p-4 text-center ${
            onGlass ? "border-b border-white/10" : "rounded-2xl border border-border bg-card"
          }`}
          data-testid="prayer-moment-virtue"
        >
          <h3 className={`text-subtitle font-black ${accentText}`} dir="auto">
            {t(language, "prayerMoment.virtueTitle", { prayer: name })}
          </h3>
          <p className={`mt-2 text-xs font-bold ${bodyText}`} dir="auto">
            {t(language, "prayerMoment.virtueAttribution")}
          </p>
          {/* The narration itself, in the reader's language where a reviewed
              rendering exists. `lang` and `dir` describe the text that is drawn,
              not the interface around it — English prose marked `lang="ar"` is
              read aloud with an Arabic voice. */}
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

      {/* Auto-fit, actually: the comment here used to say this while the class
          said two fixed columns, which is what left a card-shaped hole under
          the pair whenever there were three. The count genuinely varies — Fajr
          has no rawatib after it, Asr none before — so the row fits as many
          columns as 15rem allows and never reserves one for a card that is not
          there. */}
      {/* One card, three numbered steps.
          This was three separately bordered cards sitting in a row inside the
          panel — a box inside a box inside a box — which read as three
          unrelated things rather than as one sequence with an order to it. The
          steps are numbered now and divided by hairlines, on a single surface,
          with one primary action at the end instead of a control tucked into
          each card. Every control and every test id is the one that was here
          before: this is the same behaviour, arranged. */}
      <section
        className={`p-4 md:col-span-2 ${onGlass ? "" : "rounded-2xl border border-border bg-card"}`}
        data-testid="prayer-journey"
        aria-labelledby="prayer-journey-title"
      >
        <div className="min-w-0">
          <h3 id="prayer-journey-title" className={`text-subtitle font-black ${titleText}`} dir="auto">
            {t(language, "prayerMoment.journeyTitle")}
          </h3>
          <p className={`mt-0.5 text-label font-semibold ${bodyText}`} dir="auto">
            {t(language, "prayerMoment.journeySubtitle")}
          </p>
        </div>

        <ol className="mt-3 flex flex-col">
          {/* Where it was prayed. Two choices rather than one tick, so "at
              home" is a recorded answer instead of the absence of one. */}
          <li
            className={`relative flex items-start gap-3 border-t py-3.5 first:border-t-0 first:pt-0 ${hairline}`}
            data-testid="prayer-action-location"
          >
            {/* One answer, not a choice of two places. Whether the prayer was
                prayed at all is the reader's business; whether it was prayed in
                congregation is what the day's path counts, so that is what is
                asked. Recording "at home" changed no outcome anywhere — it was
                a question asked for the app's benefit rather than the
                reader's. */}
            <input
              id="prayer-mosque"
              type="checkbox"
              checked={moment.location === "mosque"}
              onChange={(event) => onToggle(prayer, "location", event.currentTarget.checked ? "mosque" : null)}
              aria-labelledby="prayer-mosque-title"
              className="tracking-choice peer absolute inset-0 m-0 h-full w-full cursor-pointer appearance-none rounded-xl opacity-0"
            />
            <div className="min-w-0 flex-1">
              <p id="prayer-mosque-title" className={`text-subtitle font-black ${titleText}`} dir="auto">
                <span className={bodyText}>{formatNumerals(1, language)}. </span>
                {t(language, "prayerTracking.mosque")}
              </p>
              <p className={`mt-0.5 text-label font-semibold ${bodyText}`} dir="auto">
                {moment.location === "mosque"
                  ? t(language, "prayerMoment.mosqueRecorded")
                  : t(language, "prayerMoment.mosquePrompt")}
              </p>
            </div>
            <TrackingCheckMark checked={moment.location === "mosque"} />
          </li>

          {/* The adhkar that follow the prayer. */}
          <li
            className={`relative flex items-start gap-3 border-t py-3.5 ${hairline}`}
            data-testid="prayer-action-prayer-adhkar"
          >
            <input
              id="prayer-adhkar"
              type="checkbox"
              checked={moment.adhkarDone}
              onChange={(event) => onToggle(prayer, "adhkar", event.currentTarget.checked)}
              aria-labelledby="prayer-adhkar-title"
              className="tracking-choice peer absolute inset-0 m-0 h-full w-full cursor-pointer appearance-none rounded-xl opacity-0"
            />
            <div className="min-w-0 flex-1">
              <p id="prayer-adhkar-title" className={`text-subtitle font-black ${titleText}`} dir="auto">
                <span className={bodyText}>{formatNumerals(2, language)}. </span>
                {t(language, "prayerMoment.journeyStepAdhkar")}
              </p>
              <p className={`mt-0.5 text-label font-semibold ${bodyText}`} dir="auto">
                {t(language, "prayerMoment.journeyStepAdhkarDetail")}
              </p>
            </div>
            <TrackingCheckMark checked={moment.adhkarDone} />
          </li>

          {/* The rawātib. Absent for a prayer that has none rather than shown
              empty, and it names the rak'ahs that are due now — the ones before
              the fard while it is still ahead, the ones after it once it is
              in. */}
          {sunnah && moment.sunnahFocus && (
            <li
              className={`relative flex items-start gap-3 border-t py-3.5 ${hairline}`}
              data-testid="prayer-action-prayer-sunnah"
            >
              <input
                id="prayer-sunnah"
                type="checkbox"
                checked={moment.sunnahDone}
                onChange={(event) => onToggle(prayer, "sunnah", event.currentTarget.checked)}
                aria-labelledby="prayer-sunnah-title"
                className="tracking-choice peer absolute inset-0 m-0 h-full w-full cursor-pointer appearance-none rounded-xl opacity-0"
              />
              <div className="min-w-0 flex-1">
                <p id="prayer-sunnah-title" className={`text-subtitle font-black ${titleText}`} dir="auto">
                  <span className={bodyText}>{formatNumerals(3, language)}. </span>
                  {/* The rank is named, not implied by position: the four
                      before Asr are encouraged without being among the twelve,
                      and a layout that cannot tell the two apart tells the
                      reader something untrue. */}
                  {t(
                    language,
                    sunnah.rank === "confirmed" ? "prayerMoment.sunnahTitle" : "prayerMoment.sunnahTitleOptional",
                  )}
                </p>
                <p className={`mt-0.5 text-label font-semibold ${bodyText}`} dir="auto">
                  {sunnahDetail}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEvidenceOpen(true)}
                data-testid="prayer-sunnah-evidence"
                aria-label={t(language, "prayerMoment.evidenceOpen")}
                className={`relative z-10 flex size-11 shrink-0 items-center justify-center rounded-full border transition-colors focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring ${iconButton}`}
              >
                <Info size={17} aria-hidden="true" />
              </button>
              <TrackingCheckMark checked={moment.sunnahDone} />
            </li>
          )}
        </ol>

        {/* One primary action for the whole card, rather than a control inside
            each step. It stays locked until the prayer itself is recorded —
            the reader's own answer, not the clock's guess — and it is never the
            only way in: the collection keeps its place in the Azkar library. */}
        <button
          type="button"
          onClick={() => onOpenAdhkar(prayer)}
          data-testid="prayer-open-adhkar"
          className="mt-3 flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-primary px-4 text-subtitle font-black text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring"
        >
          <Translate size={18} aria-hidden="true" />
          {t(language, "prayerMoment.journeyOpenAdhkar")}
        </button>
      </section>

      {/* The narration this sunnah rests on, one press from the card that asks
          for it — so a reader can check the claim rather than take the app's
          word for it. */}
      {sunnah && evidenceOpen && (
        <Modal
          open
          onClose={() => setEvidenceOpen(false)}
          title={t(language, "prayerMoment.evidenceTitle")}
          direction={direction}
          testId="prayer-sunnah-evidence-sheet"
          maxWidthClassName="max-w-[32rem]"
        >
          <div className="flex flex-col gap-3 px-5 py-4 text-center">
            <p className="text-subtitle font-black text-primary" dir="auto">
              {sunnahDetail}
            </p>
            {/* The narration in the reader's language where one is reviewed,
                with lang and dir describing the text drawn rather than the
                interface around it. */}
            <p
              className={`text-base font-bold leading-loose text-foreground ${
                isArabic || !sunnah.evidence.textEnglish ? "zikr-text" : ""
              }`}
              dir={isArabic || !sunnah.evidence.textEnglish ? "rtl" : "ltr"}
              lang={isArabic || !sunnah.evidence.textEnglish ? "ar" : "en"}
            >
              {isArabic ? sunnah.evidence.textArabic : (sunnah.evidence.textEnglish ?? sunnah.evidence.textArabic)}
            </p>
            <p className="text-label font-semibold text-muted-foreground" dir="auto">
              {isArabic ? sunnah.evidence.referenceArabic : sunnah.evidence.referenceEnglish}
            </p>
            {/* Named only where the narration sits outside the two Sahihs,
                which is exactly where a reader needs to be told. */}
            {(isArabic ? sunnah.evidence.gradingArabic : sunnah.evidence.gradingEnglish) && (
              <p className="text-xs font-bold text-muted-foreground/80" dir="auto">
                {isArabic ? sunnah.evidence.gradingArabic : sunnah.evidence.gradingEnglish}
              </p>
            )}
            {sunnah.rank === "optional" && (
              <p className="text-xs font-semibold leading-6 text-muted-foreground" dir="auto">
                {t(language, "prayerMoment.optionalNote")}
              </p>
            )}
          </div>
        </Modal>
      )}
    </>
  );
}
