import { useEffect, useRef, useState } from "react";
import { Sunrise, Sun, CloudSun, Sunset, MoonStar, Check, ChevronNext } from "./icons";
import { t } from "../i18n";
import { PrayerVirtueModal } from "./PrayerVirtueModal";
import type { AppLanguage, PrayerName, PrayerTrackingRecord } from "../types";
import type { PrayerTimes } from "../content/prayerTimes";
import { formatPrayerTimeLabel } from "../content/prayerTimes";
import { trackedLocation } from "../prayerMoment";

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

/**
 * Everything the prayer surfaces may record. The cards here still write the
 * two booleans; the prayer screen also writes where the prayer was prayed and
 * whether its rawātib were, which is why the write type is wider than the
 * field type above.
 */
export type PrayerTrackingWrite = PrayerTrackingField | "location" | "sunnah";

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
/**
 * The tick itself, shared with the prayer screen so a recorded deed looks the
 * same wherever it is recorded. It draws from the `checked` prop rather than a
 * `peer-checked:` variant — the sibling selector matched and even drove the pop
 * animation, yet the colour declarations never landed, leaving a ticked box
 * with a transparent fill and a grey ring. It still reads `peer-*` for hover
 * and active, which have no such problem.
 */
export function TrackingCheckMark({ checked }: { checked: boolean }) {
  return (
    <span
      aria-hidden="true"
      data-checked={checked ? "true" : undefined}
      className={`tracking-check pointer-events-none flex size-6 shrink-0 items-center justify-center rounded-full border-2 transition-[background-color,border-color,transform,box-shadow] duration-standard ease-standard peer-enabled:peer-active:scale-90 ${
        checked
          ? "border-primary bg-primary text-primary-foreground shadow-[0_2px_8px_-2px_var(--primary)]"
          : "border-border-control text-transparent peer-enabled:peer-hover:border-primary peer-enabled:peer-hover:bg-primary/10"
      }`}
    >
      <Check size={14} strokeWidth={3} />
    </span>
  );
}

function TrackingCheckbox({
  id,
  label,
  hint,
  checked,
  disabled,
  onChange,
}: {
  id: string;
  label: string;
  /** Names the answer where there is more to say than ticked or not. */
  hint?: string;
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
      <span className="pointer-events-none flex min-w-0 flex-col text-start">
        <span className="truncate text-[0.8125rem] font-bold text-foreground">{label}</span>
        {hint && <span className="truncate text-[0.6875rem] font-semibold text-muted-foreground">{hint}</span>}
      </span>
      {/* No focus ring here: the input covers the row and is the element
          that actually receives focus, so the global :focus-visible outline
          already draws one around the whole 48px target. A ring on this
          circle as well produced two indicators for one control. */}
      {/* Gold, matching the rest of the theme. The earlier rule reserved gold
          for temporal status and gave completion blue; that is overridden here
          by an explicit product decision. The two never collide in practice —
          status is a filled pill of text in the section above, completion is a
          24px circle in the tracking rows.

          Checked styling comes from React rather than a `peer-checked:` variant.
          The sibling selector matched and even drove the pop animation, yet the
          colour declarations never landed, so a ticked box kept a transparent
          fill and a grey ring — the state was announced correctly but invisible.
          Reading the prop we already hold removes the indirection entirely. */}
      <TrackingCheckMark checked={checked} />
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
  tracking: { mosque: boolean; adhkar: boolean; location: "mosque" | "home" | null };
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
      // Five unnamed articles announce as "article, article, article…". Naming
      // each from its own prayer heading makes the carousel navigable.
      aria-labelledby={`prayer-card-heading-${prayer}`}
      data-testid={`prayer-card-${prayer}`}
      data-prayer={prayer}
      data-prayer-state={state}
      className={`group/card flex w-[78%] min-w-[78%] shrink-0 snap-center flex-col rounded-[var(--ds-radius-card-large)] border p-3 text-center transition-[background-color,border-color,box-shadow] duration-standard ease-standard sm:w-full sm:min-w-0 sm:p-4 ${
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
        /* It opens the prayer, not its adhkar — those are now one card
           inside it. The old name told a screen-reader user the wrong
           destination from the moment the card started opening this screen. */
        aria-label={t(language, "prayerTracking.openPrayer", { prayer: name })}
        className="relative flex flex-col items-center rounded-2xl outline-none transition-colors duration-fast focus-visible:ring-[3px] focus-visible:ring-ring enabled:cursor-pointer disabled:cursor-default"
      >
        {/* The card has two interaction models now — this block opens the
            prayer, the rows below record it — and nothing distinguished them:
            the identity block was a button that looked like text. The chevron
            is the smallest thing that says "this leads somewhere", and it sits
            in the corner rather than beside the time: on the line it took
            enough width to wrap "12:54 PM" and drop that card out of step with
            the other four. */}

        <span
          aria-hidden="true"
          // The chip is the only place the per-prayer hue appears. Tinting the
          // whole card would put five competing colours behind the content.
          className="prayer-chip flex size-10 items-center justify-center rounded-full border transition-transform duration-standard ease-standard group-hover/card:scale-105"
        >
          <Icon size={20} />
        </span>
        {/* The chevron sits with the name rather than on the time's line,
            where it took enough width to wrap "12:54 PM" and drop that card out
            of step with the other four, and rather than in the corner, where it
            cost a positioning rule against a CSS cap with 151 bytes to spare. */}
        <span className="mt-1.5 flex items-center gap-1">
          <h3 id={`prayer-card-heading-${prayer}`} className="text-[0.9375rem] font-black text-foreground" dir="auto">
            {name}
          </h3>
          {onOpen && (
            <ChevronNext size={14} aria-hidden="true" data-rtl-flip className="shrink-0 text-muted-foreground" />
          )}
        </span>
        {/* The time is the strongest thing in the card: it is what the reader
            is scanning for. */}
        <p
          // Home-layout tests measure the next prayer's time; the id follows
          // whichever card is next rather than a fixed prayer.
          data-testid={state === "next" ? "next-prayer-time" : undefined}
          className="mt-0.5 whitespace-nowrap text-[1.375rem] font-black leading-none tracking-tight text-foreground"
          dir="auto"
        >
          {formatPrayerTimeLabel(time, language === "ar")}
        </p>
      </button>

      {/* Section 2 — temporal status. Fixed height so the divider below never
          moves when the next prayer adds its countdown line. */}
      <div className="mt-1.5 flex h-[2.5rem] flex-col items-center justify-start gap-0.5">
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

      <hr className="mt-1.5 border-t border-border/60" />

      {/* Section 3 — personal tracking. Its own fieldset so a screen reader
          announces which prayer these two controls belong to; the row of five
          otherwise repeats the same two labels with no context. */}
      <fieldset className="mt-1.5 flex flex-col border-0 p-0">
        <legend className="sr-only">{t(language, "prayerTracking.legend", { prayer: name })}</legend>
        {/* "Prayed", not "prayed at the mosque".
            The prayer screen records where — mosque or home — while this row
            only knew the mosque, so a prayer recorded at home showed here as an
            empty box: the two surfaces disagreed about the same fact, and the
            empty box read as "not recorded", which is the ambiguity the place
            model exists to end. This ticks for either answer and names the
            place beside it; ticking it here still means the mosque, because
            that is the only answer a single box can give. */}
        <TrackingCheckbox
          id={`prayer-${prayer}-mosque`}
          label={t(language, "prayerTracking.prayed")}
          hint={
            tracking.location
              ? t(language, tracking.location === "mosque" ? "prayerTracking.atMosque" : "prayerTracking.atHome")
              : undefined
          }
          checked={tracking.location !== null}
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
  const [virtuePrayer, setVirtuePrayer] = useState<PrayerName | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const ordered = PRAYER_ORDER.map((prayer) => models.find((model) => model.prayer === prayer)).filter(
    (model): model is PrayerCardModel => Boolean(model),
  );

  const focusIndex = Math.max(
    0,
    ordered.findIndex((model) => model.state === "current" || model.state === "next"),
  );

  useEffect(() => {
    const container = scrollRef.current;
    if (!container || focusIndex <= 0) return;
    const card = container.children[focusIndex] as HTMLElement | undefined;
    if (card) {
      // Keep the focused card fully visible. We do a manual calculation
      // instead of scrollIntoView to prevent the whole page from jumping.
      const offset =
        direction === "rtl"
          ? card.offsetLeft + card.offsetWidth - (container.offsetLeft + container.offsetWidth)
          : card.offsetLeft - container.offsetLeft;
      if (typeof container.scrollTo === "function") {
        container.scrollTo({ left: offset, behavior: "auto" });
      } else {
        container.scrollLeft = offset;
      }
    }
  }, [focusIndex, direction]);

  return (
    <div className="flex flex-col gap-3">
      <div
        ref={scrollRef}
        dir={direction}
        data-testid="prayer-tracker-cards"
        className="stagger-in flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:grid sm:grid-cols-[repeat(var(--prayer-columns),minmax(9rem,1fr))] sm:px-6 sm:pb-0 lg:grid-cols-[repeat(var(--prayer-columns),minmax(11rem,1fr))] lg:overflow-x-auto lg:px-8"
        style={{ ["--prayer-columns" as string]: "5" }}
      >
        {ordered.map((model) => {
          const record = byPrayer.get(model.prayer);
          return (
            <PrayerCard
              key={model.prayer}
              model={model}
              language={language}
              tracking={{
                mosque: record?.mosque ?? false,
                adhkar: record?.adhkar ?? false,
                location: trackedLocation(record),
              }}
              onToggle={(prayer, field, next) => {
                onToggle(prayer, field, next);
                if (field === "mosque" && next) setVirtuePrayer(prayer);
              }}
              onOpen={onOpen}
            />
          );
        })}
      </div>

      <PrayerVirtueModal
        prayer={virtuePrayer}
        language={language}
        direction={direction}
        onClose={() => setVirtuePrayer(null)}
      />
    </div>
  );
}

export { PRAYER_ORDER };
export type { PrayerTimes };
