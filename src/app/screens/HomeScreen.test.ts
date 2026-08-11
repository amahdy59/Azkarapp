import { beforeEach, describe, expect, it } from "vitest";
import { getHomeAction, getHomeBackgroundCategoryId, getTimeOfDayZikr, isFridayFeatureWindow } from "./HomeScreen";
import { CATEGORY_IDS } from "../progress";
import { getEstimatedPrayerTimes } from "../content/prayerTimes";
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

  it("uses the Friday scene on Home without changing the recommended routine", () => {
    expect(getHomeBackgroundCategoryId(new Date(2026, 7, 7, 9), "morning")).toBe("friday_kahf");
    expect(getHomeBackgroundCategoryId(new Date(2026, 7, 8, 9), "morning")).toBe("morning");
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
