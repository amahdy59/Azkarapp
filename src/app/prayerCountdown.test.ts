import { describe, expect, it } from "vitest";
import { prayerCountdownReading } from "./prayerCountdown";

describe("absolute prayer countdown", () => {
  const interval = {
    startsAt: Date.parse("2026-10-29T20:00:00+03:00"),
    endsAt: Date.parse("2026-10-30T05:00:00+02:00"),
  };
  it("retains actual elapsed time across midnight and a repeated DST hour", () => {
    const before = prayerCountdownReading(interval, Date.parse("2026-10-29T23:30:00+03:00"), "en");
    const after = prayerCountdownReading(interval, Date.parse("2026-10-30T00:30:00+02:00"), "en");
    expect(before.text).toBe("06:30:00");
    expect(after.text).toBe("04:30:00");
    expect(before.elapsedPercent).toBe(35);
    expect(after.elapsedPercent).toBeCloseTo(55);
  });
  it.each(["en", "ar"] as const)("keeps %s seconds through the last fraction and clamps at zero", (language) => {
    expect(prayerCountdownReading(interval, interval.endsAt - 1, language).text).toBe(
      language === "ar" ? "٠٠:٠٠:٠١" : "00:00:01",
    );
    expect(prayerCountdownReading(interval, interval.endsAt + 3000, language)).toMatchObject({
      text: language === "ar" ? "٠٠:٠٠:٠٠" : "00:00:00",
      elapsedPercent: 100,
    });
    expect(prayerCountdownReading(interval, interval.startsAt - 1000, language).elapsedPercent).toBe(0);
  });
  it("decreases seconds without rounding the minute up", () => {
    expect(prayerCountdownReading(interval, interval.endsAt - 146_380, "en").text).toBe("00:02:27");
    expect(prayerCountdownReading(interval, interval.endsAt - 145_380, "en").text).toBe("00:02:26");
  });
  it("fills the interval from empty to full as the next prayer approaches", () => {
    const duration = interval.endsAt - interval.startsAt;
    const stages = [0, 0.25, 0.5, 0.75, 1].map(
      (fraction) => prayerCountdownReading(interval, interval.startsAt + duration * fraction, "en").elapsedPercent,
    );
    expect(stages).toEqual([0, 25, 50, 75, 100]);
  });
});
