import { useEffect, useState } from "react";
import type { AppLanguage, LocationSettings } from "../types";
import { getCurrentPrayerPeriod, timeToMinutes, type PrayerName } from "../content/prayerTimes";
import { t } from "../i18n";
import { Clock } from "./icons";
import { formatDisplayTime, formatNumerals } from "../formatting";

export function NextPrayerWidget({
  language,
  locationSettings,
  now = new Date(),
}: {
  language: AppLanguage;
  locationSettings?: LocationSettings;
  now?: Date;
}) {
  const [currentTime, setCurrentTime] = useState(now);

  useEffect(() => {
    // We update every second for the countdown
    const timer = window.setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => window.clearInterval(timer);
  }, []);

  const { currentPrayer, prayerTimes } = getCurrentPrayerPeriod(currentTime, locationSettings);

  let nextPrayer: PrayerName;
  let nextPrayerTimeStr: string;
  let isTomorrow = false;

  const nowMins = currentTime.getHours() * 60 + currentTime.getMinutes();
  const fajrM = timeToMinutes(prayerTimes.fajr);

  if (currentPrayer === "fajr") {
    nextPrayer = "dhuhr";
    nextPrayerTimeStr = prayerTimes.dhuhr;
  } else if (currentPrayer === "dhuhr") {
    nextPrayer = "asr";
    nextPrayerTimeStr = prayerTimes.asr;
  } else if (currentPrayer === "asr") {
    nextPrayer = "maghrib";
    nextPrayerTimeStr = prayerTimes.maghrib;
  } else if (currentPrayer === "maghrib") {
    nextPrayer = "isha";
    nextPrayerTimeStr = prayerTimes.isha;
  } else {
    nextPrayer = "fajr";
    nextPrayerTimeStr = prayerTimes.fajr;
    if (nowMins >= fajrM) {
      isTomorrow = true;
    }
  }

  // Next prayer Date object
  const [hours, mins] = nextPrayerTimeStr.split(":").map(Number);
  const nextPrayerDate = new Date(currentTime);
  nextPrayerDate.setHours(hours ?? 0, mins ?? 0, 0, 0);
  if (isTomorrow) {
    nextPrayerDate.setDate(nextPrayerDate.getDate() + 1);
  }

  const diffMs = nextPrayerDate.getTime() - currentTime.getTime();
  const diffSecs = Math.max(0, Math.floor(diffMs / 1000));

  const h = Math.floor(diffSecs / 3600);
  const m = Math.floor((diffSecs % 3600) / 60);
  const s = diffSecs % 60;

  const pad = (n: number) => n.toString().padStart(2, "0");
  let countdownStr = `${pad(h)}:${pad(m)}:${pad(s)}`;
  if (h === 0) {
    countdownStr = `${pad(m)}:${pad(s)}`;
  }
  const formattedCountdown = formatNumerals(countdownStr, language);

  const formattedTime = formatDisplayTime(nextPrayerDate, language);

  const prayerNames: Record<PrayerName, string> = {
    fajr: t(language, "notifications.fajr"),
    dhuhr: t(language, "notifications.dhuhr"),
    asr: t(language, "notifications.asr"),
    maghrib: t(language, "notifications.maghrib"),
    isha: t(language, "notifications.isha"),
  };

  const nextPrayerName = prayerNames[nextPrayer];

  return (
    <button
      onClick={() => {
        document.getElementById("prayer-tracker-card")?.scrollIntoView({ behavior: "smooth" });
      }}
      className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-black/30 px-3 py-1.5 text-xs font-bold text-white shadow-md backdrop-blur-md transition-transform hover:bg-black/40 active:scale-95 cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-ring"
      aria-label={`${t(language, "home.nextPrayer")} ${nextPrayerName} ${formattedTime}. ${formattedCountdown}`}
    >
      <Clock className="size-4 opacity-90" aria-hidden="true" />
      <span className="opacity-90">{nextPrayerName}</span>
      <span className="h-4 w-px bg-white/30 mx-1" aria-hidden="true" />
      <bdi className="font-mono opacity-100" dir="ltr">
        {formattedCountdown}
      </bdi>
    </button>
  );
}
