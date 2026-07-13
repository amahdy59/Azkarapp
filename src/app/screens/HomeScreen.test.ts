import { describe, expect, it } from "vitest";
import { getScheduledCategory } from "./HomeScreen";

describe("Home featured zikr schedule", () => {
  it.each([
    [4, "before_sleep"],
    [5, "morning"],
    [14, "morning"],
    [15, "evening"],
    [20, "evening"],
    [21, "before_sleep"],
  ] as const)("maps local hour %i to %s", (hour, expectedCategory) => {
    expect(getScheduledCategory(new Date(2026, 0, 1, hour))).toBe(expectedCategory);
  });
});
