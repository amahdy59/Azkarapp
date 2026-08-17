import { Sunrise, Sun, CloudSun, Sunset, MoonStar, Check } from "./icons";
import { t } from "../i18n";
import type { AppLanguage, PrayerName, PrayerTrackingRecord } from "../types";
import type { PrayerTimes } from "../content/prayerTimes";
import { formatPrayerTimeLabel } from "../content/prayerTimes";

/**
 * The five after-prayer cards.
 *
 * Two rules drive the whole layout. First, every card is the same height with
 * its icon, name, time, status, divider and both tracking rows at the same
 * vertical offsets — so the row of cards reads as a table, and a prayer
 * changing state never nudges anything sideways. That is why the status block
 * reserves its height rather than growing when the next prayer adds a
 * countdown line. Second, gold means time and blue means you: only the prayer
 * whose window is open carries the gold card, and a completion tick is never
 * gold no matter how it is set.
 */

const PRAYER_ORDER = ["fajr", "dhuhr", "asr", "maghrib", "isha"] as const satisfies readonly PrayerName[];

const PRAYER_ICON: Record<PrayerName, typeof Sun> = {
  fajr: Sunrise,
  dhuhr: Sun,
  asr: CloudSun,
  maghrib: Sunset,
  isha: MoonStar,
};

export type PrayerTemporalState = "past" | "current" | "next" | "upcoming";

export interface PrayerCardModel {
  prayer: PrayerName;
  time: string;
  state: PrayerTemporalState;
  /** Only present on the next prayer. */
  countdown?: string;
}

/** The two independent booleans a card tracks. */
export type PrayerTrackingField = "mosque" | "adhkar";

function statusLabel(language: AppLanguage, state: PrayerTemporalState) {
  if (state === "current") return t(language, "prayerTracking.now");
  if (state === "next") return t(language, "prayerTracking.next");
  if (state === "past") return t(language, "prayerTracking.past");
  return t(language, "prayerTracking.upcoming");
}

/**
 * A native checkbox wearing a circle.
 *
 * The control stays an `<input type="checkbox">` because the two rows are
 * independent — a prayer can be both prayed at the mosque and followed by its
 * adhkar — which is exactly what radios cannot express. The input is the whole
 * row so the 48px target and the label come free, and `peer` drives the visual
 * circle from real checked/focus/disabled state rather than from React.
 */
function TrackingCheckbox({
  id,
  label,
  checked,
  disabled,
  onChange,
}: {
  id: string;
  label: string;
  checked: boolean;
  disabled: boolean;
  onChange: (next: boolean) => void;
}) {
  return (
    <label
      htmlFor={id}
      className={`relative flex h-12 items-center justify-between gap-3 rounded-2xl px-2 transition-colors duration-fast ${
        disabled ? "cursor-not-allowed opacity-45" : "cursor-pointer hover:bg-on-media/8"
      }`}
    >
      {/* The input *is* the row: it fills the full 48px rather than being
          clipped to a screen-reader pinpoint. Keyboard focus then lands on
          something the size of the target it represents — an sr-only input
          reads as a clipped control to auditing tools, and its hit area no
          longer matches what the eye is aiming at. Transparent, not hidden,
          so the visual circle beneath stays the only thing drawn. */}
      <input
        id={id}
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(event) => onChange(event.currentTarget.checked)}
        className="peer absolute inset-0 m-0 h-full w-full cursor-pointer appearance-none rounded-2xl opacity-0 disabled:cursor-not-allowed"
      />
      <span className="pointer-events-none min-w-0 truncate text-[0.875rem] font-bold text-on-media">{label}</span>
      <span
        aria-hidden="true"
        className="pointer-events-none flex size-6 shrink-0 items-center justify-center rounded-full border-2 border-on-media/45 text-transparent transition-[background-color,border-color,transform] duration-standard ease-standard peer-checked:border-info peer-checked:bg-info peer-checked:text-info-foreground peer-focus-visible:ring-[3px] peer-focus-visible:ring-ring peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-transparent"
      >
        <Check size={14} strokeWidth={3} />
      </span>
    </label>
  );
}

function PrayerCard({
  model,
  language,
  tracking,
  onToggle,
  onOpen,
}: {
  model: PrayerCardModel;
  language: AppLanguage;
  tracking: { mosque: boolean; adhkar: boolean };
  onToggle: (prayer: PrayerName, field: PrayerTrackingField, next: boolean) => void;
  onOpen?: (prayer: PrayerName) => void;
}) {
  const { prayer, time, state, countdown } = model;
  const Icon = PRAYER_ICON[prayer];
  const name = t(language, `notifications.${prayer}`);
  // Future prayers show their controls so the card keeps its shape, but they
  // cannot be marked: nothing has happened yet to record.
  const disabled = state === "upcoming" || state === "next";
  const isCurrent = state === "current";

  return (
    <article
      data-testid={`prayer-card-${prayer}`}
      data-prayer-state={state}
      className={`flex h-[27rem] flex-col rounded-[var(--ds-radius-card-large)] border p-6 text-center transition-[background-color,border-color,box-shadow] duration-standard ease-standard ${
        isCurrent
          ? "border-primary bg-primary/10 shadow-overlay"
          : state === "past"
            ? "border-on-media/12 bg-on-media-surface/45"
            : "border-on-media/18 bg-on-media-surface/70"
      }`}
    >
      {/* Section 1 — identity and timing, and the way into this prayer's
          adhkar. The card used to be one big button; the tracking rows took
          that over, so the identity block keeps the affordance rather than
          adding a separate "open" control the brief rules out. */}
      <button
        type="button"
        onClick={() => onOpen?.(prayer)}
        disabled={!onOpen}
        aria-label={t(language, "prayerTracking.openAdhkar", { prayer: name })}
        className="flex flex-col items-center rounded-2xl outline-none transition-colors duration-fast focus-visible:ring-[3px] focus-visible:ring-ring enabled:cursor-pointer disabled:cursor-default"
      >
        <span
          aria-hidden="true"
          className={`flex size-16 items-center justify-center rounded-full ${
            isCurrent ? "bg-primary/20 text-primary" : "bg-on-media/10 text-on-media"
          }`}
        >
          <Icon size={30} />
        </span>
        <h3 className="mt-3 text-[1.0625rem] font-black text-on-media" dir="auto">
          {name}
        </h3>
        {/* The time is the strongest thing in the card: it is what the reader
            is scanning for. */}
        <p
          // Home-layout tests measure the next prayer's time; the id follows
          // whichever card is next rather than a fixed prayer.
          data-testid={state === "next" ? "next-prayer-time" : undefined}
          className="mt-1 text-[2rem] font-black leading-none tracking-tight text-on-media"
          dir="auto"
        >
          {formatPrayerTimeLabel(time, language === "ar")}
        </p>
      </button>

      {/* Section 2 — temporal status. Fixed height so the divider below never
          moves when the next prayer adds its countdown line. */}
      <div className="mt-3 flex h-[3.25rem] flex-col items-center justify-start gap-1">
        <span
          data-testid={`prayer-status-${prayer}`}
          className={`inline-flex items-center rounded-full px-3 py-1 text-[0.75rem] font-black ${
            state === "current" || state === "next"
              ? "bg-primary text-primary-foreground"
              : "bg-on-media/10 text-on-media-muted"
          }`}
        >
          {statusLabel(language, state)}
        </span>
        {countdown && state === "next" && (
          <span data-testid="next-prayer" className="text-[0.75rem] font-bold text-primary" dir="auto">
            {countdown}
          </span>
        )}
      </div>

      <hr className="mt-5 border-t border-on-media/12" />

      {/* Section 3 — personal tracking. Its own fieldset so a screen reader
          announces which prayer these two controls belong to; the row of five
          otherwise repeats the same two labels with no context. */}
      <fieldset className="mt-3 flex flex-col gap-1 border-0 p-0">
        <legend className="sr-only">{t(language, "prayerTracking.legend", { prayer: name })}</legend>
        <TrackingCheckbox
          id={`prayer-${prayer}-mosque`}
          label={t(language, "prayerTracking.mosque")}
          checked={tracking.mosque}
          disabled={disabled}
          onChange={(next) => onToggle(prayer, "mosque", next)}
        />
        <TrackingCheckbox
          id={`prayer-${prayer}-adhkar`}
          label={t(language, "prayerTracking.adhkar")}
          checked={tracking.adhkar}
          disabled={disabled}
          onChange={(next) => onToggle(prayer, "adhkar", next)}
        />
      </fieldset>
    </article>
  );
}

export function PrayerTrackerCards({
  models,
  language,
  direction,
  records,
  dayKey,
  onToggle,
  onOpen,
}: {
  models: readonly PrayerCardModel[];
  language: AppLanguage;
  direction: "ltr" | "rtl";
  records: readonly PrayerTrackingRecord[];
  dayKey: string;
  onToggle: (prayer: PrayerName, field: PrayerTrackingField, next: boolean) => void;
  onOpen?: (prayer: PrayerName) => void;
}) {
  const byPrayer = new Map(records.filter((record) => record.dayKey === dayKey).map((r) => [r.prayer, r]));

  return (
    <div
      dir={direction}
      data-testid="prayer-tracker-cards"
      // Five equal columns rather than space-between, so every card is the same
      // width and the gaps stay 24px whatever the container does. Narrower
      // tiers fall back to two columns and then one; the card itself is
      // unchanged at every tier.
      className="stagger-in grid grid-cols-1 gap-6 px-4 sm:grid-cols-2 sm:px-6 lg:grid-cols-5 lg:px-8"
    >
      {PRAYER_ORDER.map((prayer) => {
        const model = models.find((candidate) => candidate.prayer === prayer);
        if (!model) return null;
        const record = byPrayer.get(prayer);
        return (
          <PrayerCard
            key={prayer}
            model={model}
            language={language}
            tracking={{ mosque: record?.mosque ?? false, adhkar: record?.adhkar ?? false }}
            onToggle={onToggle}
            onOpen={onOpen}
          />
        );
      })}
    </div>
  );
}

export { PRAYER_ORDER };
export type { PrayerTimes };
