import { formatNumerals } from "./formatting";
import type { AppLanguage } from "./types";

export interface PrayerCountdownInterval {
  startsAt: number;
  endsAt: number;
}

/** Absolute instants preserve elapsed time across midnight, DST and suspended tabs. */
export function prayerCountdownReading(interval: PrayerCountdownInterval, now: number, language: AppLanguage) {
  const remaining = Math.max(0, Math.ceil((interval.endsAt - now) / 1000));
  const pad = (value: number) => value.toString().padStart(2, "0");
  const hoursMinutes = formatNumerals(
    `${pad(Math.floor(remaining / 3600))}:${pad(Math.floor(remaining / 60) % 60)}`,
    language,
  );
  const seconds = formatNumerals(pad(remaining % 60), language);
  return {
    hoursMinutes,
    seconds,
    text: `${hoursMinutes}:${seconds}`,
    elapsedPercent: Math.max(
      0,
      Math.min(100, ((now - interval.startsAt) / (interval.endsAt - interval.startsAt)) * 100),
    ),
  };
}
