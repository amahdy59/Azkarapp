import { useState } from "react";
import { Sunrise, Sun, CloudSun, Sunset, MoonStar, Check } from "./icons";
import { t } from "../i18n";
import { formatNumerals } from "../formatting";
import type { AppLanguage, PrayerName, PrayerTrackingRecord } from "../types";
import type { PrayerTimes } from "../content/prayerTimes";
import { formatPrayerTimeLabel } from "../content/prayerTimes";

/**
 * The five after-prayer cards.
 *
 * These cards sit on a normal card surface, not on the hero photograph, so
 * they use theme-aware tokens throughout. They previously used the on-media
 * family, which is white in every theme because its ground is a photograph —
 * in light mode that rendered white text and borders on a light card, and
 * left the show-more control effectively invisible.
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
      className={`relative flex h-11 items-center justify-between gap-2 rounded-xl px-2 transition-colors duration-fast ${
        disabled ? "cursor-not-allowed opacity-45" : "cursor-pointer hover:bg-muted"
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
      <span className="pointer-events-none min-w-0 truncate text-[0.8125rem] font-bold text-foreground">{label}</span>
      {/* No focus ring here: the input covers the row and is the element
          that actually receives focus, so the global :focus-visible outline
          already draws one around the whole 48px target. A ring on this
          circle as well produced two indicators for one control. */}
      <span
        aria-hidden="true"
        className="pointer-events-none flex size-6 shrink-0 items-center justify-center rounded-full border-2 border-border-control text-transparent transition-[background-color,border-color,transform,box-shadow] duration-standard ease-standard peer-enabled:peer-hover:border-info peer-enabled:peer-hover:bg-info/10 peer-checked:scale-105 peer-checked:border-info peer-checked:bg-info peer-checked:text-info-foreground peer-checked:shadow-[0_2px_8px_-2px_var(--info)]"
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
      data-prayer={prayer}
      data-prayer-state={state}
      className={`group/card flex w-[78%] min-w-[78%] shrink-0 snap-center flex-col rounded-[var(--ds-radius-card-large)] border p-4 text-center transition-[background-color,border-color,box-shadow] duration-standard ease-standard sm:w-full sm:min-w-0 sm:p-5 ${
        isCurrent
          ? "border-primary bg-gradient-to-b from-primary/12 to-transparent shadow-[0_0_0_1px_var(--primary),0_12px_32px_-12px_var(--primary)]"
          : state === "past"
            ? "border-border/60 bg-muted/40"
            : "border-border bg-gradient-to-b from-card to-muted/30 shadow-raised"
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
          // The chip is the only place the per-prayer hue appears. Tinting the
          // whole card would put five competing colours behind the content.
          className="prayer-chip flex size-12 items-center justify-center rounded-full border transition-transform duration-standard ease-standard group-hover/card:scale-105"
        >
          <Icon size={24} />
        </span>
        <h3 className="mt-2 text-[0.9375rem] font-black text-foreground" dir="auto">
          {name}
        </h3>
        {/* The time is the strongest thing in the card: it is what the reader
            is scanning for. */}
        <p
          // Home-layout tests measure the next prayer's time; the id follows
          // whichever card is next rather than a fixed prayer.
          data-testid={state === "next" ? "next-prayer-time" : undefined}
          className="mt-1 text-[1.5rem] font-black leading-none tracking-tight text-foreground"
          dir="auto"
        >
          {formatPrayerTimeLabel(time, language === "ar")}
        </p>
      </button>

      {/* Section 2 — temporal status. Fixed height so the divider below never
          moves when the next prayer adds its countdown line. */}
      <div className="mt-2 flex h-[2.75rem] flex-col items-center justify-start gap-0.5">
        <span
          data-testid={`prayer-status-${prayer}`}
          className={`inline-flex items-center rounded-full px-3 py-1 text-[0.75rem] font-black ${
            state === "current" || state === "next" ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"
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

      <hr className="mt-2 border-t border-border/60" />

      {/* Section 3 — personal tracking. Its own fieldset so a screen reader
          announces which prayer these two controls belong to; the row of five
          otherwise repeats the same two labels with no context. */}
      <fieldset className="mt-2 flex flex-col border-0 p-0">
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
  const [showUpcoming, setShowUpcoming] = useState(false);

  const ordered = PRAYER_ORDER.map((prayer) => models.find((model) => model.prayer === prayer)).filter(
    (model): model is PrayerCardModel => Boolean(model),
  );
  // A prayer that has not arrived cannot be tracked and cannot be read yet, so
  // by default it only takes up room. The ones that can be acted on — what has
  // passed, what is open now, and what is next — stay in view; the rest are one
  // tap away. "Next" is never hidden: it is the one people look for.
  const hidden = ordered.filter((model) => model.state === "upcoming");
  const visible = showUpcoming ? ordered : ordered.filter((model) => model.state !== "upcoming");

  return (
    <div className="flex flex-col gap-3">
      <div
        dir={direction}
        data-testid="prayer-tracker-cards"
        // A snap carousel on phones, an even grid from the small tier up. The
        // grid uses as many columns as there are cards so hiding the upcoming
        // ones does not leave a gap where they were.
        className="stagger-in flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-6 sm:pb-0 lg:grid-cols-[repeat(var(--prayer-columns),minmax(0,1fr))] lg:px-8"
        style={{ ["--prayer-columns" as string]: String(visible.length) }}
      >
        {visible.map((model) => {
          const record = byPrayer.get(model.prayer);
          return (
            <PrayerCard
              key={model.prayer}
              model={model}
              language={language}
              tracking={{ mosque: record?.mosque ?? false, adhkar: record?.adhkar ?? false }}
              onToggle={onToggle}
              onOpen={onOpen}
            />
          );
        })}
      </div>

      {hidden.length > 0 && (
        <button
          type="button"
          onClick={() => setShowUpcoming((current) => !current)}
          aria-expanded={showUpcoming}
          data-testid="prayer-show-upcoming"
          className="mx-auto flex min-h-11 items-center justify-center rounded-2xl border border-border-control px-4 text-[0.8125rem] font-black text-foreground transition-colors duration-fast hover:bg-muted focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring"
        >
          {showUpcoming
            ? t(language, "prayerTracking.hideUpcoming")
            : t(language, "prayerTracking.showUpcoming", { count: formatNumerals(hidden.length, language) })}
        </button>
      )}
    </div>
  );
}

export { PRAYER_ORDER };
export type { PrayerTimes };
