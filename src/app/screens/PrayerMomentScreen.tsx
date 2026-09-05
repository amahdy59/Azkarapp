import { useMemo, useState } from "react";
import { ScreenContainer } from "../components/ScreenContainer";
import { Header } from "../components/LayoutShells";
import { TrackingCheckMark } from "../components/PrayerTrackerCards";
import { PrayerSceneArt } from "../components/PrayerSceneArt";
import {
  Building,
  Clock,
  CloudSun,
  Home,
  Info,
  Lock,
  MoonStar,
  Sun,
  Sunrise,
  Sunset,
  Translate,
} from "../components/icons";
import { t } from "../i18n";
import { PRAYER_NAMES, formatPrayerTimeLabel, getEstimatedPrayerTimes } from "../content/prayerTimes";
import { getPrayerSunnah } from "../content/prayerSunnah";
import { Modal } from "../components/ResponsiveSheet";
import { getPrayerVirtues } from "../content/prayerVirtues";
import { getPrayerMoment, type PrayerMoment } from "../prayerMoment";
import type { AppLanguage, LocationSettings, PrayerName, PrayerTrackingRecord } from "../types";

const PRAYER_ICON: Record<PrayerName, typeof Sunrise> = {
  fajr: Sunrise,
  dhuhr: Sun,
  asr: CloudSun,
  maghrib: Sunset,
  isha: MoonStar,
};

/** One shape for the three cards that record something. */
const ACTION_CARD =
  "relative flex items-start gap-3 rounded-2xl border p-3.5 text-start transition-colors duration-fast focus-within:ring-[3px] focus-within:ring-ring";

function CardIcon({ children, active }: { children: React.ReactNode; active: boolean }) {
  return (
    <span
      aria-hidden="true"
      className={`flex size-11 shrink-0 items-center justify-center rounded-full border ${
        active ? "border-primary/50 bg-primary/15 text-primary" : "border-border bg-muted/40 text-muted-foreground"
      }`}
    >
      {children}
    </span>
  );
}

/**
 * A card that records one thing about this prayer.
 *
 * The input covers the whole card rather than sitting in a corner of it, so
 * the target is the card and the focus ring is drawn around what the eye is
 * aiming at — the same technique the tracking rows on Home use, at card scale.
 */
function ActionCard({
  id,
  title,
  detail,
  checked,
  disabled,
  onChange,
  icon,
  footer,
  emphasis = false,
}: {
  id: string;
  title: string;
  detail: string;
  checked: boolean;
  disabled?: boolean;
  onChange: (next: boolean) => void;
  icon: React.ReactNode;
  footer?: React.ReactNode;
  emphasis?: boolean;
}) {
  return (
    <div
      className={`${ACTION_CARD} ${
        emphasis ? "border-primary/60 bg-primary/[0.06]" : "border-border bg-card"
      } ${disabled ? "opacity-60" : ""}`}
      data-testid={`prayer-action-${id}`}
    >
      {/* The input is the card: it covers it, so the target and the focus ring
          are the card itself. It takes its name from the title already on
          screen rather than from a screen-reader-only copy of it, which was
          announcing the card twice. */}
      <input
        id={id}
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(event) => onChange(event.currentTarget.checked)}
        aria-labelledby={`${id}-title`}
        aria-describedby={`${id}-detail`}
        className="peer absolute inset-0 m-0 h-full w-full cursor-pointer appearance-none rounded-2xl opacity-0 disabled:cursor-not-allowed"
      />
      <TrackingCheckMark checked={checked} />
      <span className="pointer-events-none min-w-0 flex-1">
        <span id={`${id}-title`} className="block truncate text-[0.9375rem] font-black text-foreground">
          {title}
        </span>
        <span id={`${id}-detail`} className="mt-0.5 block text-[0.8125rem] font-semibold text-muted-foreground">
          {detail}
        </span>
        {footer}
      </span>
      <CardIcon active={checked || emphasis}>{icon}</CardIcon>
    </div>
  );
}

export function PrayerMomentScreen({
  prayer,
  language,
  direction,
  records,
  dayKey,
  locationSettings,
  now = new Date(),
  onBack,
  onToggle,
  onOpenAdhkar,
  onSelectPrayer,
}: {
  prayer: PrayerName;
  language: AppLanguage;
  direction: "ltr" | "rtl";
  records: readonly PrayerTrackingRecord[];
  dayKey: string;
  locationSettings?: LocationSettings;
  /** Injected so the screen's states can be held to a fixed clock in a test. */
  now?: Date;
  onBack: () => void;
  onToggle: (prayer: PrayerName, field: "location" | "adhkar" | "sunnah", value: unknown) => void;
  onOpenAdhkar: (prayer: PrayerName) => void;
  onSelectPrayer: (prayer: PrayerName) => void;
}) {
  const moment: PrayerMoment = useMemo(
    () => getPrayerMoment({ prayer, now, dayKey, records, location: locationSettings }),
    [dayKey, locationSettings, now, prayer, records],
  );

  const times = useMemo(() => getEstimatedPrayerTimes(now, locationSettings), [locationSettings, now]);
  const isArabic = language === "ar";
  const name = t(language, `notifications.${prayer}`);
  const Icon = PRAYER_ICON[prayer];
  const sunnah = moment.sunnahFocus ? getPrayerSunnah(prayer, moment.sunnahFocus) : null;
  const [evidenceOpen, setEvidenceOpen] = useState(false);
  const virtue = getPrayerVirtues(prayer)[0];

  /* The prayer leads the screen from twenty minutes before its adhan until the
     next one, and the moment it is recorded. Everywhere else the screen is a
     reference for a prayer that is not the one at hand. */
  const isLive = moment.phase === "now" || moment.phase === "approaching" || moment.phase === "recorded";
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
    <ScreenContainer dir={direction} screenName={name} data-testid="prayer-moment-screen" data-prayer={prayer}>
      <Header title={name} onBack={onBack} language={language} />

      {/* A scrolling column, so its children keep their own height and the
          column scrolls past them. Without `shrink-0` the flex algorithm takes
          the overflow out of whichever child is allowed to give — and the hero
          is, because clipping the scene to its corners means `overflow: hidden`,
          which switches off the automatic minimum size. It collapsed from 150px
          to 37px with the sky and half the type cropped inside it. */}
      {/* A scrolling column, so its children keep their own height and the
          column scrolls past them. Without `shrink-0` the flex algorithm takes
          the overflow out of whichever child is allowed to give — and the hero
          is, because clipping the scene to its corners means `overflow: hidden`,
          which switches off the automatic minimum size. It collapsed from 150px
          to 37px with the sky and half the type cropped inside it.

          From the tablet tier it becomes a two-column grid inside the shared
          content measure. `auto-rows-min` and `content-start` are what keep it
          a page rather than a poster: a grid whose rows may stretch will spread
          three rows of content down a 900px desk screen, leaving 150px of empty
          card between every band. */}
      <div className="page-content-center flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto px-4 pb-6 [&>*]:shrink-0 md:grid md:content-start md:grid-cols-2 md:gap-4">
        {/* The prayer, its time, and the sky it is called in. */}
        <section
          className="relative isolate overflow-hidden rounded-2xl border border-border"
          data-testid="prayer-moment-hero"
        >
          <PrayerSceneArt prayer={prayer} className="absolute inset-0 -z-10 h-full w-full" />
          {/* Fixed light-on-dark, because the scene is its own ground in every
              theme — the same rule the Home hero follows over its photograph. */}
          <div className="flex flex-col justify-between gap-3 p-4 text-white">
            <div className="flex items-start justify-between gap-3">
              <h2 className="text-2xl font-black leading-tight md:text-3xl" dir="auto">
                {name}
              </h2>
              <span className="flex size-11 shrink-0 items-center justify-center rounded-full border border-primary/70 text-primary">
                <Icon size={22} aria-hidden="true" />
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-2.5">
              <p className="text-3xl font-black leading-none tabular-nums" dir="auto">
                {formatPrayerTimeLabel(moment.time, isArabic)}
              </p>
              {isLive && (
                <span className="rounded-full bg-primary px-3 py-1 text-[0.75rem] font-black text-primary-foreground">
                  {t(language, "prayerMoment.badgeNow")}
                </span>
              )}
            </div>
            <p className="flex items-center gap-2 text-[0.8125rem] font-bold text-white/80">
              <span className="size-1.5 rounded-full bg-primary" aria-hidden="true" />
              {t(language, statusKey)}
            </p>
          </div>
        </section>

        {/* Why this prayer is worth walking to — before the deed, where it can
            still be an invitation rather than a reward for one. */}
        {virtue && isLive && (
          <section
            className="flex flex-col justify-center rounded-2xl border border-border bg-card p-4 text-center"
            data-testid="prayer-moment-virtue"
          >
            <h3 className="text-[0.9375rem] font-black text-primary" dir="auto">
              {t(language, "prayerMoment.virtueTitle", { prayer: name })}
            </h3>
            <p className="mt-2 text-[0.75rem] font-bold text-muted-foreground" dir="auto">
              {t(language, "prayerMoment.virtueAttribution")}
            </p>
            <p className="zikr-text mt-2 text-[1.0625rem] font-bold leading-loose text-foreground" dir="rtl" lang="ar">
              {virtue.textArabic}
            </p>
            <p className="mt-2 text-[0.75rem] font-semibold text-muted-foreground" dir="auto">
              {isArabic ? virtue.referenceArabic : virtue.referenceEnglish}
            </p>
          </section>
        )}

        {/* Auto-fit rather than three fixed columns: Fajr has nothing after it
            and Asr nothing before, so the row is often two cards, and a fixed
            third column left a card-shaped hole beside them. */}
        <div className="grid gap-3 md:col-span-2 md:grid-cols-2">
          {/* Where it was prayed. Two choices rather than one tick, so "at
              home" is a recorded answer instead of the absence of one. */}
          <div
            className={`${ACTION_CARD} flex-col ${
              moment.location ? "border-primary/60 bg-primary/[0.06]" : "border-border bg-card"
            }`}
            data-testid="prayer-action-location"
          >
            <div className="flex w-full items-start gap-3">
              <TrackingCheckMark checked={moment.location !== null} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-[0.9375rem] font-black text-foreground">
                  {t(language, "prayerMoment.locationTitle")}
                </p>
                <p className="mt-0.5 text-[0.8125rem] font-semibold text-muted-foreground">
                  {t(language, "prayerMoment.locationDetail")}
                </p>
              </div>
              <CardIcon active={moment.location !== null}>
                <Building size={20} aria-hidden="true" />
              </CardIcon>
            </div>

            <div
              className="mt-3 flex w-full gap-2"
              role="radiogroup"
              aria-label={t(language, "prayerMoment.locationTitle")}
            >
              {(["mosque", "home"] as const).map((place) => {
                const selected = moment.location === place;
                const PlaceIcon = place === "mosque" ? Building : Home;
                return (
                  <button
                    key={place}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    data-testid={`prayer-location-${place}`}
                    onClick={() => onToggle(prayer, "location", selected ? null : place)}
                    className={`flex min-h-11 flex-1 items-center justify-center gap-2 rounded-full border px-3 text-[0.8125rem] font-bold transition-colors focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring ${
                      selected
                        ? "border-primary bg-primary/15 text-primary"
                        : "border-border text-foreground hover:bg-muted"
                    }`}
                  >
                    <PlaceIcon size={17} aria-hidden="true" />
                    {t(language, `prayerMoment.${place}`)}
                  </button>
                );
              })}
            </div>
          </div>

          {/* The adhkar that follow the prayer. Offered once the prayer itself
              is recorded — the reader's own answer, not the clock's guess —
              and never the only way to reach them: the collection stays where
              it has always been in the Azkar library. */}
          <ActionCard
            id="prayer-adhkar"
            title={t(language, "prayerMoment.adhkarTitle")}
            detail={t(language, "prayerMoment.adhkarDetail")}
            checked={moment.adhkarDone}
            onChange={(next) => onToggle(prayer, "adhkar", next)}
            icon={<Translate size={20} aria-hidden="true" />}
            footer={
              <span className="mt-2 flex items-center gap-1.5 text-[0.75rem] font-bold text-muted-foreground">
                {moment.location ? (
                  <button
                    type="button"
                    onClick={() => onOpenAdhkar(prayer)}
                    data-testid="prayer-open-adhkar"
                    className="pointer-events-auto relative z-10 flex min-h-11 items-center gap-1.5 rounded-full border border-border px-3 transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring"
                  >
                    {t(language, "prayerMoment.adhkarOpen")}
                  </button>
                ) : (
                  <span className="flex items-center gap-1.5" data-testid="prayer-adhkar-hint">
                    <Lock size={14} aria-hidden="true" />
                    {t(language, "prayerMoment.adhkarHint")}
                  </span>
                )}
              </span>
            }
          />

          {/* The rawātib. Absent for a prayer that has none rather than shown
              empty, and it names the rak'ahs that are due now — the ones before
              the fard while it is still ahead, the ones after it once it is
              in. */}
          {sunnah && moment.sunnahFocus && (
            <ActionCard
              id="prayer-sunnah"
              /* The rank is on the card, not implied by its position: the four
                 before Asr are encouraged without being among the twelve, and a
                 layout that cannot tell the two apart tells the reader
                 something untrue. */
              title={t(
                language,
                sunnah.rank === "confirmed" ? "prayerMoment.sunnahTitle" : "prayerMoment.sunnahTitleOptional",
              )}
              detail={sunnahDetail}
              checked={moment.sunnahDone}
              onChange={(next) => onToggle(prayer, "sunnah", next)}
              icon={<Clock size={20} aria-hidden="true" />}
              footer={
                <span className="mt-2 flex">
                  {/* Above the input that covers the card, so the narration can
                      be read without recording a prayer nobody has prayed. */}
                  <button
                    type="button"
                    onClick={() => setEvidenceOpen(true)}
                    data-testid="prayer-sunnah-evidence"
                    className="pointer-events-auto relative z-10 flex min-h-11 items-center gap-1.5 rounded-full border border-border px-3 text-[0.75rem] font-bold text-muted-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring"
                  >
                    <Info size={15} aria-hidden="true" />
                    {t(language, "prayerMoment.evidenceOpen")}
                  </button>
                </span>
              }
            />
          )}
        </div>

        {/* The narration this sunnah rests on, one press from the card that
            asks for it — so a reader can check the claim rather than take the
            app's word for it. */}
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
              <p className="text-[0.9375rem] font-black text-primary" dir="auto">
                {sunnahDetail}
              </p>
              <p className="zikr-text text-[1rem] font-bold leading-loose text-foreground" dir="rtl" lang="ar">
                {sunnah.evidence.textArabic}
              </p>
              <p className="text-[0.8125rem] font-semibold text-muted-foreground" dir="auto">
                {isArabic ? sunnah.evidence.referenceArabic : sunnah.evidence.referenceEnglish}
              </p>
              {/* Named only where the narration sits outside the two Sahihs,
                  which is exactly where a reader needs to be told. */}
              {(isArabic ? sunnah.evidence.gradingArabic : sunnah.evidence.gradingEnglish) && (
                <p className="text-[0.75rem] font-bold text-muted-foreground/80" dir="auto">
                  {isArabic ? sunnah.evidence.gradingArabic : sunnah.evidence.gradingEnglish}
                </p>
              )}
              {sunnah.rank === "optional" && (
                <p className="text-[0.75rem] font-semibold leading-6 text-muted-foreground" dir="auto">
                  {t(language, "prayerMoment.optionalNote")}
                </p>
              )}
            </div>
          </Modal>
        )}

        {/* The day's five, so this screen is never a dead end. */}
        <nav
          className="mt-1 flex items-stretch justify-between gap-1 rounded-2xl border border-border bg-card p-1.5 md:col-span-2"
          aria-label={t(language, "prayerMoment.dayTitle")}
          data-testid="prayer-moment-strip"
        >
          {PRAYER_NAMES.map((item) => {
            const ItemIcon = PRAYER_ICON[item];
            const current = item === prayer;
            return (
              <button
                key={item}
                type="button"
                onClick={() => onSelectPrayer(item)}
                aria-current={current ? "true" : undefined}
                data-testid={`prayer-strip-${item}`}
                className={`flex min-h-11 flex-1 flex-col items-center justify-center gap-0.5 rounded-xl px-1 py-1.5 transition-colors focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring ${
                  current ? "bg-primary/15 text-primary" : "text-muted-foreground hover:bg-muted"
                }`}
              >
                <ItemIcon size={18} aria-hidden="true" />
                <span className="text-[0.6875rem] font-black">{t(language, `notifications.${item}`)}</span>
                <span className="text-[0.6875rem] font-semibold tabular-nums" dir="auto">
                  {formatPrayerTimeLabel(times[item], isArabic)}
                </span>
              </button>
            );
          })}
        </nav>
      </div>
    </ScreenContainer>
  );
}
