import { describe, expect, it } from "vitest";
import { getQiblaBearing, getQiblaTurn, normalizeDegrees, smoothCompassHeading } from "./qibla";

describe("Qibla direction", () => {
  it("calculates known bearings without a network request", () => {
    expect(getQiblaBearing(30.0444, 31.2357)).toBeCloseTo(136.1, 1);
    expect(getQiblaBearing(51.5072, -0.1276)).toBeCloseTo(119, 1);
  });

  it("normalizes headings and chooses the shortest turn", () => {
    expect(normalizeDegrees(-10)).toBe(350);
    expect(getQiblaTurn(5, 355)).toBe(10);
    expect(getQiblaTurn(355, 5)).toBe(-10);
  });

  it("smooths compass readings across north without jumping around the dial", () => {
    expect(smoothCompassHeading(358, 2)).toBeCloseTo(359);
    expect(smoothCompassHeading(2, 358)).toBeCloseTo(1);
  });

  it("catches up immediately after a large physical turn", () => {
    expect(smoothCompassHeading(0, 90)).toBe(90);
  });
});
