import { t } from "../i18n";
import { prayerCountdownReading, type PrayerCountdownInterval } from "../prayerCountdown";
import type { AppLanguage } from "../types";
import "./prayer-countdown.css";

/** Presentation only; both copies receive the next card's single clock reading. */
export function PrayerCountdown({
  interval,
  now,
  language,
  prayerName,
  decorative = false,
}: {
  interval: PrayerCountdownInterval;
  now: number;
  language: AppLanguage;
  prayerName: string;
  decorative?: boolean;
}) {
  const reading = prayerCountdownReading(interval, now, language);
  const [before, after] = t(language, "prayerTracking.timeLeft", { time: "\u0001" }).split("\u0001");
  return (
    <span className="prayer-countdown" data-prayer-countdown aria-hidden={decorative || undefined}>
      {!decorative && (
        <span className="sr-only">
          {t(language, "prayerMoment.countdownProgress", { prayer: prayerName })}.{" "}
          {t(language, "prayerTracking.timeLeft", { time: reading.text })}
        </span>
      )}
      <span className="prayer-countdown-visual" aria-hidden="true">
        <svg className="prayer-countdown-ring" viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false">
          <circle className="prayer-countdown-track" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
          <circle
            key={interval.endsAt}
            className="prayer-countdown-arc"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            pathLength="100"
            strokeDasharray="100"
            strokeDashoffset={100 - reading.elapsedPercent}
            transform="rotate(-90 12 12)"
          />
        </svg>
        {before && <span className="prayer-countdown-word">{before}</span>}
        <span className="prayer-countdown-digits" dir="ltr">
          <span>{reading.hoursMinutes}</span>
          <span className="prayer-countdown-seconds" key={reading.seconds}>
            :{reading.seconds}
          </span>
        </span>
        {after && <span className="prayer-countdown-word">{after}</span>}
      </span>
    </span>
  );
}
