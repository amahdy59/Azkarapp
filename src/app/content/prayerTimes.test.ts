import { describe, expect, it } from "vitest";
import { getCurrentPrayerPeriod, timeToMinutes } from "./prayerTimes";

describe("prayerTimes", () => {
  it("converts HH:MM strings to total minutes", () => {
    expect(timeToMinutes("04:30")).toBe(270);
    expect(timeToMinutes("15:30")).toBe(930);
  });

  it("identifies Fajr window in the early morning", () => {
    const earlyMorning = new Date(2026, 6, 28, 6, 0); // 6:00 AM
    const period = getCurrentPrayerPeriod(earlyMorning);
    expect(period.currentPrayer).toBe("fajr");
    expect(period.isFajrOrMaghrib).toBe(true);
  });

  it("identifies Asr window in the afternoon", () => {
    const afternoon = new Date(2026, 6, 28, 17, 0); // After calculated Cairo Asr
    const period = getCurrentPrayerPeriod(afternoon);
    expect(period.currentPrayer).toBe("asr");
    expect(period.isFajrOrMaghrib).toBe(false);
  });

  it("identifies Maghrib window in the evening", () => {
    const evening = new Date(2026, 6, 28, 20, 0); // After calculated Cairo Maghrib
    const period = getCurrentPrayerPeriod(evening);
    expect(period.currentPrayer).toBe("maghrib");
    expect(period.isFajrOrMaghrib).toBe(true);
  });
});
