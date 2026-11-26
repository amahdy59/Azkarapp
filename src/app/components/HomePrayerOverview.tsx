import type { CSSProperties, ReactNode } from "react";
import { ArrowCircleRight, CheckCircle2, ChevronDown, CircleIcon, Clock } from "./icons";
import { PRAYER_ICON, type PrayerCardModel } from "./PrayerTrackerCards";
import { formatPrayerTimeLabel } from "../content/prayerTimes";
import { prayerDisplayName } from "../prayerPresentation";
import { trackedLocation } from "../prayerMoment";
import { useMediaQuery } from "../hooks/useMediaQuery";
import { t } from "../i18n";
import type { AppLanguage, PrayerName, PrayerTrackingRecord } from "../types";
import "./home-prayer-overview.css";

interface SummaryProps {
  models: readonly PrayerCardModel[];
  language: AppLanguage;
  dayKey: string;
  elapsedPercent: number;
  onGlass?: boolean;
  expanded: boolean;
  onToggleExpanded: () => void;
  disclosureDisabled?: boolean;
}

/** Persistent context; scroll and clock updates never change the reader's choice. */
export function HomePrayerSummary({
  models,
  language,
  dayKey,
  elapsedPercent,
  onGlass = false,
  expanded,
  onToggleExpanded,
  disclosureDisabled,
}: SummaryProps) {
  const current = models.find((model) => model.state === "current");
  const next = models.find((model) => model.state === "next");
  return (
    <div
      className={`home-prayer-interval ${onGlass ? "hero-glass home-glass-surface" : ""}`}
      data-testid="home-prayer-interval"
      data-summary-pair={Boolean(current && next) || undefined}
    >
      <span
        className="home-prayer-interval-shade"
        aria-hidden="true"
        style={{ "--interval-elapsed": `${Math.max(0, Math.min(100, elapsedPercent))}%` } as CSSProperties}
      />
      <div className="home-prayer-summary-context">
        {current && (
          <div className="home-prayer-summary-stat" data-prayer-summary-state="current">
            <span className="home-prayer-summary-label">{t(language, "prayerTracking.nowPill")}</span>
            <div className="home-prayer-summary-value">
              <strong className="home-prayer-summary-name">
                {prayerDisplayName(current.prayer, language, dayKey)}
              </strong>
            </div>
          </div>
        )}
        {next && (
          <div className="home-prayer-summary-stat" data-prayer-summary-state="next" data-prayer-countdown-line>
            <span className="home-prayer-summary-label">{t(language, "prayerTracking.nextShort")}</span>
            <div className="home-prayer-summary-value">
              <strong className="home-prayer-summary-name home-prayer-next-label">
                {prayerDisplayName(next.prayer, language, dayKey)}
              </strong>
              <span aria-hidden="true">·</span>
              <Clock size={14} aria-hidden="true" />
              <bdi id="home-prayer-countdown" className="home-prayer-summary-countdown">
                {next.countdown}
              </bdi>
            </div>
          </div>
        )}
      </div>
      <button
        type="button"
        className="home-prayer-disclosure ui-action-cue"
        data-testid="home-prayer-disclosure"
        aria-expanded={expanded}
        aria-controls="home-prayer-timings"
        aria-label={t(language, expanded ? "home.hidePrayerTimes" : "home.showPrayerTimes")}
        title={t(language, expanded ? "home.hidePrayerTimes" : "home.showPrayerTimes")}
        disabled={disclosureDisabled}
        onClick={onToggleExpanded}
      >
        <span className="home-prayer-disclosure-label">
          {t(language, expanded ? "home.hidePrayerTimes" : "home.showPrayerTimes")}
        </span>
        <ChevronDown size={16} aria-hidden="true" />
      </button>
    </div>
  );
}

/** Presentation only. Dated calculation, recording and persistence stay upstream. */
export function HomePrayerOverview({
  models,
  language,
  dayKey,
  selectedPrayer,
  onOpen,
  onGlass = false,
  location,
  records = [],
}: {
  models: readonly PrayerCardModel[];
  language: AppLanguage;
  dayKey: string;
  selectedPrayer: PrayerName | null;
  onOpen: (prayer: PrayerName) => void;
  onGlass?: boolean;
  location?: ReactNode;
  records?: readonly PrayerTrackingRecord[];
}) {
  const individualCards = useMediaQuery("(min-width: 768px)");
  const glassClass = onGlass ? "hero-glass home-glass-surface" : "";
  return (
    <div
      className="home-prayer-overview-v2"
      data-grouped={!individualCards || undefined}
      data-on-glass={onGlass || undefined}
      data-testid="prayer-tracker-cards"
    >
      <div className={`home-prayer-grid ${individualCards ? "" : glassClass}`} data-testid="home-all-prayers-row">
        {models.map((model) => {
          const name = prayerDisplayName(model.prayer, language, dayKey);
          const Icon = PRAYER_ICON[model.prayer];
          const selected = selectedPrayer === model.prayer;
          const time = formatPrayerTimeLabel(model.time, language === "ar");
          const periodAt = time.lastIndexOf(" ");
          const unavailable = `home-prayer-unavailable-${model.prayer}`;
          const record = records.find((item) => item.dayKey === dayKey && item.prayer === model.prayer);
          const recorded = Boolean(trackedLocation(record));
          const statusId = `home-prayer-status-${model.prayer}`;
          const temporalLabel =
            model.state === "current"
              ? t(language, "prayerTracking.nowPill")
              : model.state === "next"
                ? t(language, "prayerTracking.nextShort")
                : model.state === "upcoming"
                  ? t(language, "prayerTracking.upcoming")
                  : "";
          const recordingLabel = recorded
            ? t(language, "home.prayerRecorded")
            : model.isRecordable
              ? t(language, "prayerTracking.notRecorded")
              : "";
          const statusLabel = [temporalLabel, recordingLabel].filter(Boolean).join(". ");
          return (
            <article
              key={model.prayer}
              data-testid={`prayer-card-${model.prayer}`}
              data-prayer={model.prayer}
              data-prayer-state={model.state}
              data-density="summary"
              data-selected={selected || undefined}
              data-recorded={recorded || undefined}
              className={`home-prayer-tile ${individualCards ? glassClass : ""}`}
              aria-labelledby={`home-prayer-name-${model.prayer}`}
              aria-current={model.state === "current" ? "step" : undefined}
            >
              <button
                type="button"
                data-prayer-trigger={model.prayer}
                disabled={!model.isOpenable}
                aria-haspopup="dialog"
                aria-label={t(language, "prayerTracking.openPrayer", { prayer: name })}
                title={[name, time, statusLabel].filter(Boolean).join(" · ")}
                aria-describedby={[
                  `prayer-summary-time-${model.prayer}`,
                  statusId,
                  !model.isOpenable && unavailable,
                  model.state === "next" && "home-prayer-countdown",
                ]
                  .filter(Boolean)
                  .join(" ")}
                onClick={(event) => {
                  event.currentTarget.focus({ preventScroll: true });
                  onOpen(model.prayer);
                }}
              >
                <Icon size={20} data-prayer-icon aria-hidden="true" />
                <h3 id={`home-prayer-name-${model.prayer}`}>{name}</h3>
                <bdi data-prayer-time id={`prayer-summary-time-${model.prayer}`}>
                  <span data-prayer-time-digits>{periodAt > 0 ? time.slice(0, periodAt) : time}</span>
                  {periodAt > 0 && (
                    <>
                      {" "}
                      <span className="home-prayer-period">{time.slice(periodAt + 1)}</span>
                    </>
                  )}
                </bdi>
                {(recorded || model.isRecordable || model.state === "next") && (
                  <span
                    className="home-prayer-status-badge"
                    data-status={recorded ? "recorded" : model.isRecordable ? "unrecorded" : "next"}
                    aria-hidden="true"
                  >
                    {recorded ? (
                      <span className="home-prayer-recorded" data-testid={`prayer-recorded-${model.prayer}`}>
                        <CheckCircle2 size={16} aria-hidden="true" />
                      </span>
                    ) : model.isRecordable ? (
                      <CircleIcon size={16} />
                    ) : model.state === "next" ? (
                      <ArrowCircleRight size={16} className="home-prayer-next-icon" />
                    ) : null}
                  </span>
                )}
                <span className="sr-only" id={statusId}>
                  {statusLabel}
                </span>
              </button>
              {!model.isOpenable && (
                <span id={unavailable} className="sr-only">
                  {t(language, "home.prayerUnavailable")}
                </span>
              )}
            </article>
          );
        })}
      </div>
      {location && (
        <div className={`home-prayer-location ${onGlass ? "hero-glass home-glass-surface" : ""}`}>{location}</div>
      )}
    </div>
  );
}
