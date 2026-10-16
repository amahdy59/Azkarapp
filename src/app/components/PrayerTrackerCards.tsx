import { useEffect, useRef, useState, type CSSProperties } from "react";
import { Sunrise, Sun, CloudSun, Sunset, MoonStar, Check, ChevronNext } from "./icons";
import { t } from "../i18n";
import { PrayerVirtueModal } from "./PrayerVirtueModal";
import type { AppLanguage, PrayerName, PrayerTrackingRecord } from "../types";
import type { PrayerTimes } from "../content/prayerTimes";
import { formatPrayerTimeLabel } from "../content/prayerTimes";
import { trackedLocation } from "../prayerMoment";
import { prayerDisplayName } from "../prayerPresentation";

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

export const PRAYER_ICON: Record<PrayerName, typeof Sun> = {
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
  /** Sunrise closes the Fajr window; it is context, not a trackable prayer. */
  shroukTime?: string;
  state: PrayerTemporalState;
  isOpenable: boolean;
  isRecordable: boolean;
  /** Only present on the next prayer. */
  countdown?: string;
  remainingPercent?: number;
  /** Decorative surface emphasis, independent of recording and prayer validity. */
  emphasis?: number;
}

/** The independent fields a prayer card or actions card tracks. */
export type PrayerTrackingField = "mosque" | "adhkar" | "sunnah" | "sunnahBefore" | "sunnahAfter";

/**
 * Everything the prayer surfaces may record. The cards here write the
 * booleans; the prayer screen also writes where the prayer was prayed.
 */
export type PrayerTrackingWrite = PrayerTrackingField | "location";

function statusLabel(language: AppLanguage, state: PrayerTemporalState) {
  if (state === "current") return t(language, "prayerTracking.now");
  if (state === "next") return t(language, "prayerTracking.next");
  if (state === "past") return t(language, "prayerTracking.past");
  return t(language, "prayerTracking.upcoming");
}

/**
 * A native checkbox with a rounded-square check indicator.
 *
 * The control stays an `<input type="checkbox">` because the two rows are
 * independent — a prayer can be both prayed at the mosque and followed by its
 * adhkar — which is exactly what radios cannot express. The input is the whole
 * row so the 48px target and the label come free, and `peer` drives the visual
 * indicator from real checked/focus/disabled state rather than from React.
 */
/**
 * The tick itself, shared with the prayer screen so a recorded deed looks the
 * same wherever it is recorded. It draws from the `checked` prop rather than a
 * `peer-checked:` variant — the sibling selector matched and even drove the pop
 * animation, yet the colour declarations never landed, leaving a ticked box
 * with a transparent fill and a grey ring. It still reads `peer-*` for hover
 * and active, which have no such problem.
 */
export function TrackingCheckMark({
  checked,
  onGlass = false,
  compact = false,
  statusOnly = false,
}: {
  checked: boolean;
  onGlass?: boolean;
  compact?: boolean;
  /** Noninteractive completion marks retain their circular status shape. */
  statusOnly?: boolean;
}) {
  return (
    <span
      aria-hidden="true"
      data-checked={checked ? "true" : undefined}
      className={`tracking-check pointer-events-none flex ${compact ? "size-5" : "size-6"} shrink-0 items-center justify-center ${statusOnly ? "rounded-full" : "rounded-md"} border-2 transition-[background-color,border-color,transform,box-shadow] duration-standard ease-standard peer-enabled:peer-active:scale-90 ${
        checked
          ? "border-primary bg-primary text-primary-foreground shadow-[0_2px_8px_-2px_var(--primary)]"
          : onGlass
            ? "border-white/70 text-transparent peer-enabled:peer-hover:border-white peer-enabled:peer-hover:bg-white/10"
            : "border-border-control text-transparent peer-enabled:peer-hover:border-primary peer-enabled:peer-hover:bg-primary/10"
      }`}
    >
      <Check size={compact ? 12 : 14} strokeWidth={3} />
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
  onGlass,
}: {
  id: string;
  label: string;
  /** Names the answer where there is more to say than ticked or not. */
  hint?: string;
  checked: boolean;
  disabled: boolean;
  onChange: (next: boolean) => void;
  onGlass?: boolean;
}) {
  return (
    <label
      htmlFor={id}
      className={`relative flex min-h-11 items-center justify-between gap-2 rounded-xl px-2.5 py-1 my-0.5 border transition-all duration-standard ${
        disabled
          ? "cursor-not-allowed opacity-40 border-transparent bg-transparent"
          : checked
            ? onGlass
              ? "cursor-pointer bg-white/15 border-white/30 text-on-media shadow-2xs"
              : "cursor-pointer bg-primary/10 border-primary/30 text-foreground shadow-2xs"
            : onGlass
              ? "cursor-pointer hover:bg-white/10 border-transparent bg-transparent text-on-media/80"
              : "cursor-pointer hover:bg-muted border-transparent bg-transparent text-muted-foreground hover:text-foreground"
      }`}
    >
      {/* The input *is* the row: it fills the full 48px rather than being
          clipped to a screen-reader pinpoint. Keyboard focus then lands on
          something the size of the target it represents — an sr-only input
          reads as a clipped control to auditing tools, and its hit area no
          longer matches what the eye is aiming at. Transparent, not hidden,
          so the visible checkbox beneath stays the only thing drawn. */}
      <input
        id={id}
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(event) => onChange(event.currentTarget.checked)}
        className="tracking-choice peer absolute inset-0 m-0 h-full w-full cursor-pointer appearance-none rounded-2xl opacity-0 disabled:cursor-not-allowed"
      />
      <span className="pointer-events-none flex min-w-0 flex-col text-start">
        <span className={`truncate text-label font-bold ${onGlass ? "text-on-media" : "text-foreground"}`}>
          {label}
        </span>
        {hint && (
          <span
            className={`truncate text-micro font-semibold ${onGlass ? "text-on-media/70" : "text-muted-foreground"}`}
          >
            {hint}
          </span>
        )}
      </span>
      {/* Keyboard focus is drawn on this visible checkbox. The transparent input
          still owns the full row-sized pointer target without painting a
          rectangular outline around an invisible box. */}
      {/* Gold, matching the rest of the theme. The earlier rule reserved gold
          for temporal status and gave completion blue; that is overridden here
          by an explicit product decision. The two never collide in practice —
          status is a filled pill of text in the section above, completion is a
          24px checkbox in the tracking rows.

          Checked styling comes from React rather than a `peer-checked:` variant.
          The sibling selector matched and even drove the pop animation, yet the
          colour declarations never landed, so a ticked box kept a transparent
          fill and a grey ring — the state was announced correctly but invisible.
          Reading the prop we already hold removes the indirection entirely. */}
      <TrackingCheckMark checked={checked} onGlass={onGlass} />
    </label>
  );
}

function PrayerCard({
  model,
  language,
  tracking,
  onToggle,
  onOpen,
  onGlass,
  summaryOnly,
  selected,
  dayKey,
}: {
  model: PrayerCardModel;
  language: AppLanguage;
  tracking: { mosque: boolean; adhkar: boolean; location: "mosque" | "home" | null; sunnah?: boolean };
  onGlass?: boolean;
  onToggle: (prayer: PrayerName, field: PrayerTrackingField, next: boolean) => void;
  onOpen?: (prayer: PrayerName | null) => void;
  summaryOnly?: boolean;
  selected?: boolean;
  dayKey: string;
}) {
  const { prayer, time, state, countdown, isOpenable, isRecordable } = model;
  const Icon = PRAYER_ICON[prayer];
  const name = prayerDisplayName(prayer, language, dayKey);
  const timeLabel = formatPrayerTimeLabel(time, language === "ar");
  const periodStart = timeLabel.lastIndexOf(" ");
  // Future prayers show their controls so the card keeps its shape, but they
  // cannot be marked: nothing has happened yet to record.
  const disabled = !isRecordable;
  const isCurrent = state === "current";
  const previousPrayer = PRAYER_ORDER[(PRAYER_ORDER.indexOf(prayer) + PRAYER_ORDER.length - 1) % PRAYER_ORDER.length]!;
  const footerText =
    state === "next"
      ? (countdown ?? t(language, "prayerTracking.next"))
      : state === "upcoming"
        ? t(language, "prayerTracking.afterPrayer", { prayer: prayerDisplayName(previousPrayer, language, dayKey) })
        : tracking.location === "mosque"
          ? t(language, "prayerTracking.atMosque")
          : tracking.location === "home"
            ? t(language, "prayerTracking.atHome")
            : tracking.adhkar
              ? t(language, "prayerTracking.adhkarRecorded")
              : t(language, "prayerTracking.notRecorded");

  if (summaryOnly) {
    return (
      <article
        aria-labelledby={`prayer-card-heading-${prayer}`}
        data-testid={`prayer-card-${prayer}`}
        data-prayer={prayer}
        data-prayer-state={state}
        data-density="summary"
        aria-current={isCurrent ? "step" : undefined}
        data-selected={selected ? "true" : undefined}
        style={{ "--prayer-focus": model.emphasis ?? (isCurrent ? 1 : state === "next" ? 0.15 : 0) } as CSSProperties}
        className={`home-prayer-summary-card relative grid min-w-0 rounded-xl border text-center transition-colors duration-standard ease-standard ${
          onGlass
            ? "hero-glass home-glass-surface text-on-media"
            : state === "next"
              ? "border-primary bg-primary/15 text-foreground"
              : "border-border bg-muted/40 text-foreground hover:bg-muted"
        }`}
      >
        <button
          type="button"
          onClick={() => {
            if (!isOpenable) return;
            onOpen?.(selected ? null : prayer);
          }}
          disabled={!onOpen || !isOpenable}
          aria-expanded={selected}
          aria-controls="home-expanded-prayer"
          aria-label={t(language, "prayerTracking.openPrayer", { prayer: name })}
          aria-describedby={`prayer-summary-time-${prayer} prayer-summary-status-${prayer} prayer-summary-detail-${prayer}`}
          className="home-prayer-summary-button no-press grid min-h-16 min-w-0 grid-cols-[minmax(0,max-content)_minmax(0,max-content)] justify-between gap-x-2.5 gap-y-1 rounded-xl outline-none transition-colors"
        >
          <div className="home-prayer-identity min-w-0 text-start" data-prayer-identity>
            <span
              aria-hidden="true"
              data-prayer-icon
              className={`home-prayer-icon flex size-7 shrink-0 items-center justify-center ${
                isCurrent || state === "next"
                  ? onGlass
                    ? "text-on-media-accent"
                    : "text-primary"
                  : onGlass
                    ? "text-on-media-muted"
                    : "text-muted-foreground"
              }`}
            >
              <Icon size={19} />
            </span>
            <h3
              id={`prayer-card-heading-${prayer}`}
              className={`min-w-0 max-w-full text-sm font-bold leading-tight [overflow-wrap:anywhere] ${state === "next" ? (onGlass ? "text-on-media-accent" : "text-primary") : onGlass ? "text-on-media" : "text-foreground"}`}
              dir="auto"
            >
              {name}
            </h3>
          </div>
          <div className="home-prayer-timing min-w-0 text-end" data-prayer-timing>
            <span
              id={`prayer-summary-status-${prayer}`}
              data-prayer-state-label
              data-testid={countdown && state === "next" ? "next-prayer" : undefined}
              className={`max-w-full text-xs font-semibold ${state === "next" ? "home-prayer-next-label" : ""} ${isCurrent || state === "next" ? (onGlass ? "text-on-media-accent" : "text-primary") : onGlass ? "text-on-media-muted" : "text-muted-foreground"}`}
              dir="auto"
            >
              {state === "next" ? t(language, "prayerTracking.nextShort") : statusLabel(language, state)}
            </span>
            <p
              id={`prayer-summary-time-${prayer}`}
              data-testid={state === "next" ? "next-prayer-time" : undefined}
              className={`max-w-full text-base font-extrabold tabular-nums [overflow-wrap:anywhere] ${state === "next" ? (onGlass ? "text-on-media-accent" : "text-primary") : onGlass ? "text-on-media" : "text-foreground"}`}
              dir="auto"
            >
              {periodStart > 0 ? (
                <>
                  {timeLabel.slice(0, periodStart)}{" "}
                  <span className="text-xs font-semibold">{timeLabel.slice(periodStart + 1)}</span>
                </>
              ) : (
                timeLabel
              )}
            </p>
            {state === "next" && countdown && (
              <span
                data-prayer-compact-countdown
                aria-hidden="true"
                dir="auto"
                className="hidden text-xs font-semibold tabular-nums"
              >
                {countdown}
              </span>
            )}
          </div>
        </button>
        <div
          data-prayer-footer
          className={`home-prayer-footer w-full border-t px-2 py-1.5 text-center text-xs font-semibold ${state === "next" ? (onGlass ? "border-white/20 text-on-media-accent" : "border-primary/30 text-primary") : onGlass ? "border-white/10 text-on-media-muted" : "border-border text-muted-foreground"}`}
        >
          <span
            id={`prayer-summary-detail-${prayer}`}
            data-prayer-detail
            dir="auto"
            className={`min-w-0 [overflow-wrap:anywhere] ${state === "next" ? "text-end text-sm tabular-nums" : ""}`}
          >
            {footerText}
          </span>
          {state === "next" && model.remainingPercent !== undefined && (
            <progress
              className="home-prayer-remaining mt-2.5"
              max={100}
              value={model.remainingPercent}
              aria-label={t(language, "prayerTracking.timeRemainingUntil", { prayer: name })}
              aria-valuetext={countdown}
            />
          )}
        </div>
      </article>
    );
  }

  return (
    <article
      // Five unnamed articles announce as "article, article, article…". Naming
      // each from its own prayer heading makes the carousel navigable.
      aria-labelledby={`prayer-card-heading-${prayer}`}
      data-testid={`prayer-card-${prayer}`}
      data-prayer={prayer}
      data-prayer-state={state}
      data-density="full"
      aria-current={isCurrent ? "step" : undefined}
      className={`group/card flex w-[78%] min-w-[78%] shrink-0 snap-center flex-col rounded-[var(--ds-radius-card-large)] border p-3 text-center transition-[background-color,border-color,box-shadow] duration-standard ease-standard sm:w-full sm:min-w-0 sm:p-4 ${
        onGlass
          ? `hero-glass ${isCurrent ? "ring-2 ring-primary border-transparent" : "border-transparent"}`
          : isCurrent
            ? "surface-active-card"
            : state === "past"
              ? "border-border/60 bg-muted/40"
              : "surface-upcoming-card"
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
          <h3
            id={`prayer-card-heading-${prayer}`}
            className={`whitespace-nowrap text-subtitle font-black ${onGlass ? "text-on-media" : "text-foreground"}`}
            dir="auto"
          >
            {name}
          </h3>
          {onOpen && (
            <ChevronNext
              size={14}
              aria-hidden="true"
              data-rtl-flip
              className={`shrink-0 ${onGlass ? "text-on-media/70" : "text-muted-foreground"}`}
            />
          )}
        </span>
        {/* The time is the strongest thing in the card: it is what the reader
            is scanning for. */}
        <p
          // Home-layout tests measure the next prayer's time; the id follows
          // whichever card is next rather than a fixed prayer.
          data-testid={state === "next" ? "next-prayer-time" : undefined}
          className={`mt-0.5 whitespace-nowrap text-headline font-black leading-none tracking-tight ${onGlass ? "text-on-media" : "text-foreground"}`}
          dir="auto"
        >
          {formatPrayerTimeLabel(time, language === "ar")}
        </p>
        {prayer === "fajr" && model.shroukTime && (
          <p
            className={`mt-1 hidden text-xs font-bold sm:block ${onGlass ? "text-on-media-muted" : "text-muted-foreground"}`}
          >
            {t(language, "notifications.shrouk")}: {formatPrayerTimeLabel(model.shroukTime, language === "ar")}
          </p>
        )}
      </button>

      {/* Section 2 — temporal status. Fixed height so the divider below never
          moves when the next prayer adds its countdown line. */}
      <div className="mt-1.5 flex h-[2.5rem] flex-col items-center justify-start gap-0.5">
        <span
          data-testid={`prayer-status-${prayer}`}
          className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-black ${
            state === "current" || state === "next"
              ? "bg-primary text-primary-foreground"
              : onGlass
                ? "bg-white/10 text-on-media"
                : "bg-muted text-foreground"
          }`}
        >
          {statusLabel(language, state)}
        </span>
        {countdown && state === "next" && (
          <span
            data-testid="next-prayer"
            className={`text-xs font-bold ${onGlass ? "text-on-media-accent" : "text-primary"}`}
            dir="auto"
          >
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
          onGlass={onGlass}
        />
        <TrackingCheckbox
          id={`prayer-${prayer}-sunnah`}
          label={t(language, "prayerTracking.sunnah")}
          checked={tracking.sunnah ?? false}
          disabled={disabled}
          onChange={(next) => onToggle(prayer, "sunnah", next)}
          onGlass={onGlass}
        />
        <TrackingCheckbox
          id={`prayer-${prayer}-adhkar`}
          label={t(language, "prayerTracking.adhkar")}
          checked={tracking.adhkar}
          disabled={disabled}
          onChange={(next) => onToggle(prayer, "adhkar", next)}
          onGlass={onGlass}
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
  onGlass,
  summaryOnly,
  compactSummary = false,
  selectedPrayer,
}: {
  models: readonly PrayerCardModel[];
  language: AppLanguage;
  direction: "ltr" | "rtl";
  records: readonly PrayerTrackingRecord[];
  dayKey: string;
  onToggle: (prayer: PrayerName, field: PrayerTrackingField, next: boolean) => void;
  onOpen?: (prayer: PrayerName | null) => void;
  onGlass?: boolean;
  /** Keep overview surfaces scannable; focused views retain full recording. */
  summaryOnly?: boolean;
  compactSummary?: boolean;
  /** The Home summary whose shared detail panel is expanded below the strip. */
  selectedPrayer?: PrayerName | null;
}) {
  const byPrayer = new Map(records.filter((record) => record.dayKey === dayKey).map((r) => [r.prayer, r]));
  const [virtuePrayer, setVirtuePrayer] = useState<PrayerName | null>(null);
  const [summaryOverflows, setSummaryOverflows] = useState(false);
  const summaryRef = useRef<HTMLDivElement>(null);
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
    if (!container || focusIndex <= 0 || compactSummary) return;
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
  }, [focusIndex, direction, compactSummary]);

  useEffect(() => {
    const row = summaryRef.current;
    if (!row || !compactSummary) return;
    const measure = () => {
      setSummaryOverflows(row.scrollWidth > row.clientWidth + 1);
      // Measure natural content, not the synchronized footer box, so wrapped
      // labels can grow or shrink the shared row without a sizing feedback loop.
      const heights = [...row.querySelectorAll<HTMLElement>("[data-prayer-footer]")].map((footer) => {
        const style = getComputedStyle(footer);
        const content = [...footer.children].reduce((height, child) => {
          const childStyle = getComputedStyle(child);
          return (
            height +
            child.getBoundingClientRect().height +
            parseFloat(childStyle.marginTop) +
            parseFloat(childStyle.marginBottom)
          );
        }, 0);
        return (
          content +
          parseFloat(style.paddingTop) +
          parseFloat(style.paddingBottom) +
          parseFloat(style.borderTopWidth) +
          parseFloat(style.borderBottomWidth)
        );
      });
      const height = `${Math.ceil(Math.max(0, ...heights))}px`;
      if (row.style.getPropertyValue("--prayer-footer-height") !== height)
        row.style.setProperty("--prayer-footer-height", height);
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(row);
    for (const child of row.children) observer.observe(child);
    for (const content of row.querySelectorAll("[data-prayer-footer] > *")) observer.observe(content);
    return () => observer.disconnect();
  }, [compactSummary]);

  // Keep current and next together where they fit; otherwise retain a visible
  // portion of the preceding card while revealing next. Never move the page.
  const nextPrayer = ordered.find((model) => model.state === "next")?.prayer;
  useEffect(() => {
    const row = summaryRef.current;
    if (!row || !compactSummary || !summaryOverflows) return;
    const card = row.querySelector<HTMLElement>(`[data-prayer="${nextPrayer}"]`);
    if (!card) return;
    const frame = row.getBoundingClientRect();
    const target = card.getBoundingClientRect();
    const current = row.querySelector<HTMLElement>('[data-prayer-state="current"]');
    const previous = current?.getBoundingClientRect();
    const pairFits =
      previous && Math.max(target.right, previous.right) - Math.min(target.left, previous.left) <= frame.width - 8;
    const anchor = pairFits ? previous : target;
    const delta = pairFits
      ? direction === "rtl"
        ? anchor.right - frame.right + 4
        : anchor.left - frame.left - 4
      : direction === "rtl"
        ? target.left - frame.left - 4
        : target.right - frame.right + 4;
    row.scrollLeft += delta;
  }, [compactSummary, direction, nextPrayer, summaryOverflows]);

  // A selected summary is the disclosure's visual anchor. Keep it fully in
  // view after selection without moving the vertical page or changing card gaps.
  useEffect(() => {
    const row = summaryRef.current;
    if (!row || !compactSummary || !selectedPrayer) return;
    const card = row.querySelector<HTMLElement>(`[data-prayer="${selectedPrayer}"]`);
    if (!card) return;
    const frame = row.getBoundingClientRect();
    const bounds = card.getBoundingClientRect();
    const offset =
      bounds.left < frame.left + 4
        ? bounds.left - frame.left - 4
        : bounds.right > frame.right - 4
          ? bounds.right - frame.right + 4
          : 0;
    if (offset) row.scrollLeft += offset;
  }, [compactSummary, selectedPrayer]);

  return (
    <div className="flex flex-col gap-3">
      {summaryOnly ? (
        <div
          ref={scrollRef}
          dir={direction}
          data-testid="prayer-tracker-cards"
          className={`stagger-in grid gap-1 overflow-visible ${compactSummary ? "home-prayer-overview grid-cols-1" : "grid-cols-2 sm:grid-cols-3 xl:grid-cols-5"}`}
          style={{ ["--prayer-columns" as string]: "5" }}
          id="home-prayer-overview"
        >
          <div
            ref={summaryRef}
            data-testid={compactSummary ? "home-all-prayers-row" : undefined}
            className={
              compactSummary
                ? "home-all-prayers-row grid min-w-0 gap-2 overflow-x-auto rounded-xl p-1 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-inset focus-visible:ring-ring"
                : "contents"
            }
            role={compactSummary ? "region" : undefined}
            aria-label={compactSummary ? t(language, "prayerMoment.dayTitle") : undefined}
            tabIndex={compactSummary && summaryOverflows ? 0 : undefined}
          >
            {ordered.map((model) => {
              const record = byPrayer.get(model.prayer);
              return (
                <PrayerCard
                  key={model.prayer}
                  model={model}
                  dayKey={dayKey}
                  language={language}
                  onGlass={onGlass}
                  tracking={{
                    mosque: record?.mosque ?? false,
                    adhkar: record?.adhkar ?? false,
                    sunnah: record?.sunnah ?? false,
                    location: trackedLocation(record),
                  }}
                  onToggle={(prayer, field, next) => {
                    onToggle(prayer, field, next);
                    if (field === "mosque" && next) setVirtuePrayer(prayer);
                  }}
                  onOpen={onOpen}
                  summaryOnly={summaryOnly}
                  selected={summaryOnly && model.prayer === selectedPrayer}
                />
              );
            })}
          </div>
        </div>
      ) : (
        <div
          ref={scrollRef}
          dir={direction}
          data-testid="prayer-tracker-cards"
          className="stagger-in flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2 [scrollbar-width:none] sm:grid sm:grid-cols-[repeat(var(--prayer-columns),minmax(9rem,1fr))] sm:px-6 sm:pb-0 lg:grid-cols-[repeat(var(--prayer-columns),minmax(11rem,1fr))] lg:overflow-x-auto lg:px-8 [&::-webkit-scrollbar]:hidden"
          style={{ ["--prayer-columns" as string]: "5" }}
        >
          {ordered.map((model) => {
            const record = byPrayer.get(model.prayer);
            return (
              <PrayerCard
                key={model.prayer}
                model={model}
                dayKey={dayKey}
                language={language}
                onGlass={onGlass}
                tracking={{
                  mosque: record?.mosque ?? false,
                  adhkar: record?.adhkar ?? false,
                  sunnah: record?.sunnah ?? false,
                  location: trackedLocation(record),
                }}
                onToggle={(prayer, field, next) => {
                  onToggle(prayer, field, next);
                  if (field === "mosque" && next) setVirtuePrayer(prayer);
                }}
                onOpen={onOpen}
                summaryOnly={summaryOnly}
                selected={summaryOnly && model.prayer === selectedPrayer}
              />
            );
          })}
        </div>
      )}

      <PrayerVirtueModal
        prayer={virtuePrayer}
        language={language}
        direction={direction}
        onClose={() => setVirtuePrayer(null)}
        onGlass={onGlass}
      />
    </div>
  );
}

export { PRAYER_ORDER };
export type { PrayerTimes };
