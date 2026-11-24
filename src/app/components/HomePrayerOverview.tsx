import type { CSSProperties, ReactNode } from "react";
import { ChevronDown, Clock } from "./icons";
import { useMediaQuery } from "../hooks/useMediaQuery";
import { PRAYER_ICON, type PrayerCardModel } from "./PrayerTrackerCards";
import { formatPrayerTimeLabel } from "../content/prayerTimes";
import { prayerDisplayName } from "../prayerPresentation";
import { t } from "../i18n";
import type { AppLanguage, PrayerName } from "../types";
import "./home-prayer-overview.css";

/** Home presentation only. Calculation, availability and recording stay upstream. */
export function HomePrayerOverview({
  models,
  language,
  dayKey,
  selectedPrayer,
  elapsedPercent,
  onOpen,
  onGlass = false,
  location,
}: {
  models: readonly PrayerCardModel[];
  language: AppLanguage;
  dayKey: string;
  selectedPrayer: PrayerName | null;
  elapsedPercent: number;
  onOpen: (prayer: PrayerName | null) => void;
  onGlass?: boolean;
  location?: ReactNode;
}) {
  const current = models.find((model) => model.state === "current");
  const next = models.find((model) => model.state === "next");
  const desktop = useMediaQuery("(min-width: 1200px)");
  return (
    <div
      className={`home-prayer-overview-v2 ${onGlass && !desktop ? "hero-glass home-glass-surface" : ""}`}
      data-desktop={desktop || undefined}
      data-on-glass={onGlass || undefined}
      data-testid="prayer-tracker-cards"
    >
      <div
        className={`home-prayer-interval ${desktop && onGlass ? "hero-glass home-glass-surface" : ""}`}
        data-testid="home-prayer-interval"
        data-summary-pair={Boolean(current && next) || undefined}
      >
        <span
          className="home-prayer-interval-shade"
          aria-hidden="true"
          style={{ "--interval-elapsed": `${Math.max(0, Math.min(100, elapsedPercent))}%` } as CSSProperties}
        />
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
              <bdi id="home-prayer-countdown" className="home-prayer-summary-countdown">
                {next.countdown}
              </bdi>
            </div>
          </div>
        )}
      </div>
      <div className="home-prayer-grid" data-testid="home-all-prayers-row">
        {models.map((model) => {
          const name = prayerDisplayName(model.prayer, language, dayKey);
          const Icon = PRAYER_ICON[model.prayer];
          const selected = selectedPrayer === model.prayer;
          const time = formatPrayerTimeLabel(model.time, language === "ar");
          const periodAt = time.lastIndexOf(" ");
          const unavailable = `home-prayer-unavailable-${model.prayer}`;
          return (
            <article
              key={model.prayer}
              data-testid={`prayer-card-${model.prayer}`}
              data-prayer={model.prayer}
              data-prayer-state={model.state}
              data-density="summary"
              data-selected={selected || undefined}
              className={`home-prayer-tile ${desktop && onGlass ? "hero-glass home-glass-surface" : ""}`}
              aria-labelledby={`home-prayer-name-${model.prayer}`}
              aria-current={model.state === "current" ? "step" : undefined}
            >
              <button
                type="button"
                data-prayer-trigger={model.prayer}
                disabled={!model.isOpenable}
                aria-expanded={selected}
                aria-controls="home-expanded-prayer"
                aria-label={t(language, selected ? "home.closePrayer" : "prayerTracking.openPrayer", { prayer: name })}
                aria-describedby={
                  [!model.isOpenable && unavailable, model.state === "next" && "home-prayer-countdown"]
                    .filter(Boolean)
                    .join(" ") || undefined
                }
                onClick={() => onOpen(selected ? null : model.prayer)}
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
                <ChevronDown size={16} className="home-prayer-chevron" data-prayer-chevron aria-hidden="true" />
                <span className="home-prayer-desktop-status" aria-hidden="true">
                  {model.state !== "next" && <Clock size={16} />}
                  {model.state === "next"
                    ? model.countdown
                    : t(
                        language,
                        model.state === "current"
                          ? "prayerTracking.nowPill"
                          : model.state === "past"
                            ? "prayerTracking.past"
                            : "prayerTracking.upcoming",
                      )}
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
        <div className={`home-prayer-location ${desktop && onGlass ? "hero-glass home-glass-surface" : ""}`}>
          {location}
        </div>
      )}
    </div>
  );
}
