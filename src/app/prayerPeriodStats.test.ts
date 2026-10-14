import { describe, expect, it } from "vitest";
import { getPrayerPeriodStats } from "./prayerPeriodStats";
import type { PrayerTrackingRecord } from "./types";

const record = (dayKey: string, extra: Partial<PrayerTrackingRecord> = {}): PrayerTrackingRecord => ({
  dayKey,
  prayer: "fajr",
  mosque: false,
  adhkar: false,
  ...extra,
});
describe("prayer comparison records", () => {
  it("partitions locations, deduplicates through the existing merge and excludes future records", () => {
    const stats = getPrayerPeriodStats(
      [
        record("2026-01-01", { mosque: true }),
        record("2026-01-01", { mosque: true, adhkar: true }),
        record("2026-01-02", { location: "home", sunnahBefore: true }),
        record("2026-01-03", { adhkar: true }),
        record("2026-01-04", { mosque: true }),
        record("2026-01-02", { prayer: "asr", location: "home", sunnah: true }),
      ],
      "2026-01-01",
      "2026-01-03",
      3,
    );
    expect(stats.rows[0]).toMatchObject({ fard: 2, mosque: 1, home: 1, rawatib: 1, adhkar: 2 });
    expect(stats.rows[2]).toMatchObject({ fard: 1, rawatib: 0 });
    expect(stats.totals).toEqual({ fard: 3, mosque: 1, home: 2, rawatib: 1, adhkar: 2 });
    expect(stats.possible).toBe(15);
    for (const row of stats.rows) expect(row.home + row.mosque).toBe(row.fard);
  });
  it("honors a later corrected location instead of counting both locations", () => {
    const stats = getPrayerPeriodStats(
      [
        record("2026-01-01", { location: "mosque", mosque: true, updatedAt: "2026-01-01T10:00:00Z" }),
        record("2026-01-01", { location: "home", updatedAt: "2026-01-01T11:00:00Z" }),
      ],
      "2026-01-01",
      "2026-01-01",
      1,
    );
    expect(stats.rows[0]).toMatchObject({ fard: 1, mosque: 0, home: 1 });
  });
});
