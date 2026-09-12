import { beforeEach, describe, expect, it } from "vitest";
import {
  getHomeAction,
  getTimeOfDayZikr,
  isFridayFeatureWindow,
  isDhuhaWindow,
  isLastThirdOfNight,
} from "./HomeScreen";
import { CATEGORY_IDS } from "../progress";
import { getEstimatedPrayerTimes, timeToMinutes } from "../content/prayerTimes";
import { getAzkarByCategory } from "../content/azkar";
import type { CategoryId, LocationSettings } from "../types";

const cairo: LocationSettings = {
  latitude: 30.0444,
  longitude: 31.2357,
  cityName: "Cairo",
  calculationMethod: 5,
  autoDetect: false,
  timeZone: "Africa/Cairo",
};

function atTime(date: Date, time: string, minuteDelta = 0) {
  const [hours = "0", minutes = "0"] = time.split(":");
  const result = new Date(date);
  result.setHours(Number(hours), Number(minutes) + minuteDelta, 0, 0);
  return result;
}

function progress(values: Partial<Record<CategoryId, number[]>> = {}) {
  const result = {} as Record<CategoryId, Set<string>>;
  for (const id of CATEGORY_IDS) {
    const zikrs = getAzkarByCategory(id);
    result[id] = new Set((values[id] ?? []).map((index) => zikrs[index]?.id).filter(Boolean) as string[]);
  }
  return result;
}

describe("getHomeAction", () => {
  beforeEach(() => window.localStorage.clear());

  it("resumes an interrupted collection before suggesting a fresh one", () => {
    const action = getHomeAction(progress({ evening: [0, 1] }), new Date(2026, 6, 17, 9));

    expect(action).toMatchObject({ categoryId: "evening", index: 2, completedCount: 2, kind: "resume" });
  });

  it("uses time of day only as a suggestion for a new session", () => {
    const date = new Date(2026, 6, 17, 12);
    const asr = getEstimatedPrayerTimes(date, cairo).asr;
    const action = getHomeAction(progress(), atTime(date, asr), cairo);

    expect(action).toMatchObject({ categoryId: "evening", index: 0, kind: "start" });
  });

  it("switches recommendations at the calculated local Asr and Isha boundaries", () => {
    const date = new Date(2026, 6, 17, 12);
    const times = getEstimatedPrayerTimes(date, cairo);

    expect(getTimeOfDayZikr(atTime(date, times.asr, -1), "en", cairo).categoryId).toBe("morning");
    expect(getTimeOfDayZikr(atTime(date, times.asr), "en", cairo).categoryId).toBe("evening");
    expect(getTimeOfDayZikr(atTime(date, times.isha, -1), "en", cairo).categoryId).toBe("evening");
    expect(getTimeOfDayZikr(atTime(date, times.isha), "en", cairo).categoryId).toBe("before_sleep");
  });

  it("switches from sleep azkar to duas only during the calculated last third of the night", () => {
    const date = new Date(2026, 6, 17, 12);
    const previousDay = new Date(date);
    previousDay.setDate(previousDay.getDate() - 1);
    const maghrib = timeToMinutes(getEstimatedPrayerTimes(previousDay, cairo).maghrib);
    const fajr = timeToMinutes(getEstimatedPrayerTimes(date, cairo).fajr);
    const nightDuration = 24 * 60 - maghrib + fajr;
    const startMinutes = (maghrib + (nightDuration * 2) / 3) % (24 * 60);
    const before = new Date(date);
    before.setHours(Math.floor(startMinutes / 60), Math.floor(startMinutes % 60) - 1, 0, 0);
    const start = new Date(date);
    start.setHours(Math.floor(startMinutes / 60), Math.ceil(startMinutes % 60), 0, 0);

    expect(isLastThirdOfNight(before, cairo)).toBe(false);
    expect(isLastThirdOfNight(start, cairo)).toBe(true);
    expect(getTimeOfDayZikr(start, "en", cairo)).toMatchObject({
      categoryId: "comprehensive_duas",
      title: "Time for Dua",
    });
    expect(isLastThirdOfNight(atTime(date, getEstimatedPrayerTimes(date, cairo).fajr), cairo)).toBe(false);
  });

  it("expands the Friday feature from Thursday Maghrib until Friday Maghrib", () => {
    const thursday = new Date(2026, 7, 6, 12);
    const friday = new Date(2026, 7, 7, 12);
    const thursdayMaghrib = getEstimatedPrayerTimes(thursday, cairo).maghrib;
    const fridayMaghrib = getEstimatedPrayerTimes(friday, cairo).maghrib;

    expect(isFridayFeatureWindow(atTime(thursday, thursdayMaghrib, -1), cairo)).toBe(false);
    expect(isFridayFeatureWindow(atTime(thursday, thursdayMaghrib), cairo)).toBe(true);
    expect(isFridayFeatureWindow(atTime(friday, fridayMaghrib, -1), cairo)).toBe(true);
    expect(isFridayFeatureWindow(atTime(friday, fridayMaghrib), cairo)).toBe(false);
    expect(isFridayFeatureWindow(new Date(2026, 7, 8, 12), cairo)).toBe(false);
  });
});

describe("the forenoon window", () => {
  /* Derived from the day's own Fajr and Dhuhr rather than from a clock. The
     owner described it as roughly half past nine to half eleven, which is what
     this produces for Cairo — but a fixed pair of hours would drift into the
     wrong part of the morning in another season or another latitude, and the
     Duha prayer follows the sun, not the timetable. */
  const times = getEstimatedPrayerTimes(new Date(2026, 8, 6), cairo);
  const fajr = timeToMinutes(times.fajr);
  const dhuhr = timeToMinutes(times.dhuhr);
  const at = (minutes: number) => {
    const date = new Date(2026, 8, 6);
    date.setHours(Math.floor(minutes / 60), Math.round(minutes % 60), 0, 0);
    return date;
  };

  it("opens in the later part of the morning, not at first light", () => {
    expect(isDhuhaWindow(at(fajr + 10), cairo)).toBe(false);
    expect(isDhuhaWindow(at(fajr + (dhuhr - fajr) * 0.3), cairo)).toBe(false);
  });

  it("is open through the middle of the forenoon", () => {
    expect(isDhuhaWindow(at(fajr + (dhuhr - fajr) * 0.75), cairo)).toBe(true);
  });

  it("closes before Dhuhr, so it never competes with the prayer being called", () => {
    expect(isDhuhaWindow(at(dhuhr - 10), cairo)).toBe(false);
    expect(isDhuhaWindow(at(dhuhr + 30), cairo)).toBe(false);
  });

  it("lands near the hours the owner asked for", () => {
    // Cairo in September: the window should cover mid-morning.
    expect(isDhuhaWindow(at(10 * 60), cairo)).toBe(true);
    expect(isDhuhaWindow(at(7 * 60), cairo)).toBe(false);
  });
});
