import { describe, expect, it } from "vitest";
import { PRAYER_LOCATION_PRESETS, searchPrayerLocations } from "./prayerLocations";

describe("searchPrayerLocations", () => {
  it("offers useful offline defaults when the query is empty", () => {
    expect(searchPrayerLocations("").map((location) => location.id)).toEqual([
      "makkah",
      "madinah",
      "cairo",
      "riyadh",
      "dubai",
      "london",
    ]);
  });

  it("searches city, country, and aliases in English", () => {
    expect(searchPrayerLocations("NYC")[0]?.id).toBe("new-york");
    expect(searchPrayerLocations("Canada")[0]?.id).toBe("toronto");
  });

  it("searches Arabic without requiring exact hamza spelling", () => {
    expect(searchPrayerLocations("اسطنبول")[0]?.id).toBe("istanbul");
    expect(searchPrayerLocations("مصر").map((location) => location.id)).toEqual(["cairo", "alexandria"]);
  });

  it("keeps every preset coordinate and IANA time zone usable offline", () => {
    expect(new Set(PRAYER_LOCATION_PRESETS.map((location) => location.id)).size).toBe(PRAYER_LOCATION_PRESETS.length);
    for (const location of PRAYER_LOCATION_PRESETS) {
      expect(location.latitude).toBeGreaterThanOrEqual(-90);
      expect(location.latitude).toBeLessThanOrEqual(90);
      expect(location.longitude).toBeGreaterThanOrEqual(-180);
      expect(location.longitude).toBeLessThanOrEqual(180);
      expect(() => new Intl.DateTimeFormat("en", { timeZone: location.timeZone }).format()).not.toThrow();
    }
  });
});
