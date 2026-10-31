import { renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useCounterAnnouncement } from "./useCounterAnnouncement";
import { shouldAnnounceCount } from "../counterAnnouncement";

describe("counter speech", () => {
  it.each([3, 7, 10])("announces each short count up to %i", (target) => {
    for (let count = 1; count <= target; count++) expect(shouldAnnounceCount(count, target)).toBe(true);
  });
  it("keeps long counts quiet between milestones", () => {
    expect([1, 2, 9, 11, 49, 51].filter((count) => shouldAnnounceCount(count, 100))).toEqual([]);
    expect([10, 50, 100].every((count) => shouldAnnounceCount(count, 100))).toBe(true);
  });
  it("announces changed counts, clears resets and does not speak restored progress", () => {
    const initial = { count: 3, target: 7, language: "en" as const, identity: "a" };
    const { result, rerender } = renderHook((p) => useCounterAnnouncement(p.count, p.target, p.language, p.identity), {
      initialProps: initial,
    });
    expect(result.current).toBe("");
    rerender({ ...initial, count: 4 });
    expect(result.current).toBe("4 / 7");
    rerender({ ...initial, count: 7 });
    expect(result.current).toContain("7 / 7");
    rerender({ ...initial, count: 0 });
    expect(result.current).toBe("");
    rerender({ ...initial, count: 5, identity: "b" });
    expect(result.current).toBe("");
  });
});
