import { describe, expect, it } from "vitest";
import referenceCases from "./wmm2025.fixtures.json";
import { getGeomagneticField, getMagneticDeclination, MAGNETIC_MODEL } from "./geomagnetic";

describe("offline WMM2025 magnetic reference", () => {
  it("requires model maintenance six months before the shipped correction expires", () => {
    // Deliberate calendar gate: update the model and official reference cases before this date.
    expect(Date.now(), `Review ${MAGNETIC_MODEL.name} by ${MAGNETIC_MODEL.reviewBy}; see PRAYER_TIMES.md`).toBeLessThan(
      Date.parse(MAGNETIC_MODEL.reviewBy),
    );
  });
  it("matches all 100 independently published NOAA WMM2025 reference cases", () => {
    // Source: WMM2025COF.zip / WMM2025_TestValues.txt; metres vs km is deliberate.
    expect(referenceCases).toHaveLength(100);
    for (const row of referenceCases) {
      const [year, altitudeKm, latitude, longitude, declination, , horizontal, north, east, down] = row as [
        number,
        number,
        number,
        number,
        number,
        number,
        number,
        number,
        number,
        number,
      ];
      const integerYear = Math.floor(year);
      const start = Date.UTC(integerYear, 0, 1);
      const date = new Date(start + (year - integerYear) * (Date.UTC(integerYear + 1, 0, 1) - start));
      const field = getGeomagneticField(latitude, longitude, date, altitudeKm * 1000)!;
      expect(field, `NOAA case ${row}`).not.toBeNull();
      expect(field.declination).toBeCloseTo(declination, 2);
      expect(field.horizontalIntensity).toBeCloseTo(horizontal, 2);
      expect(field.north).toBeCloseTo(north, 2);
      expect(field.east).toBeCloseTo(east, 2);
      expect(field.down).toBeCloseTo(down, 2);
    }
  });

  it("does not extrapolate an expired model or accept invalid coordinates/altitudes", () => {
    for (const date of [new Date("2024-12-31"), new Date("2030-01-01"), new Date(NaN)])
      expect(getMagneticDeclination(30, 31, date)).toBeNull();
    for (const [latitude, longitude, altitude] of [
      [91, 0, 0],
      [0, -181, 0],
      [NaN, 0, 0],
      [0, 0, 850001],
      [0, 0, -1001],
    ])
      expect(getGeomagneticField(latitude!, longitude!, new Date("2026-01-01"), altitude!)).toBeNull();
  });

  it("refuses compass guidance in the model's low-horizontal-field caution region", () => {
    expect(getGeomagneticField(89, -121, new Date("2025-01-01"), 28000)?.horizontalIntensity).toBeLessThan(6000);
    expect(getMagneticDeclination(89, -121, new Date("2025-01-01"), 28000)).toBeNull();
    expect(getMagneticDeclination(30.0444, 31.2357, new Date("2026-11-24"))).toBeGreaterThan(0);
  });

  it("remains finite at either geographic pole", () => {
    for (const latitude of [-90, 90])
      expect(Number.isFinite(getGeomagneticField(latitude, 0, new Date("2026-01-01"))?.declination)).toBe(true);
  });
});
