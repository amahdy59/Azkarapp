import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useHomePrayerScroll } from "./useHomePrayerScroll";

describe("Home prayer scroll thresholds", () => {
  it("holds the current geometry during prayer interaction, then reconciles scroll", () => {
    const view = renderHook(() => useHomePrayerScroll());
    act(() => view.result.current.updateScroll(150, true));
    expect(view.result.current.condensed).toBe(false);
    act(() => view.result.current.updateScroll(150));
    expect(view.result.current.condensed).toBe(true);
    act(() => view.result.current.updateScroll(0, true));
    expect(view.result.current.condensed).toBe(true);
    act(() => view.result.current.updateScroll(0));
    expect(view.result.current.condensed).toBe(false);
  });
  it("collapses above 96px and restores at 8px without threshold flicker", () => {
    const view = renderHook(() => useHomePrayerScroll());
    const scroll = (top: number) => act(() => view.result.current.updateScroll(top));
    scroll(96);
    expect(view.result.current.condensed).toBe(false);
    scroll(97);
    expect(view.result.current.condensed).toBe(true);
    for (const top of [96, 40, 9]) {
      scroll(top);
      expect(view.result.current.condensed).toBe(true);
    }
    scroll(8);
    expect(view.result.current.condensed).toBe(false);
    scroll(40);
    expect(view.result.current.condensed).toBe(false);
  });
  it("updates only at state boundaries and accepts rapid reversals", () => {
    let renders = 0;
    const view = renderHook(() => {
      renders += 1;
      return useHomePrayerScroll();
    });
    const initial = renders;
    act(() => {
      for (let top = 0; top <= 96; top++) view.result.current.updateScroll(top);
    });
    expect(renders).toBe(initial);
    act(() => view.result.current.updateScroll(150));
    expect(renders).toBe(initial + 1);
    act(() => {
      for (const top of [180, 250, 90, 40]) view.result.current.updateScroll(top);
    });
    expect(renders).toBe(initial + 1);
    act(() => view.result.current.updateScroll(0));
    expect(view.result.current.condensed).toBe(false);
    act(() => view.result.current.updateScroll(150));
    expect(view.result.current.condensed).toBe(true);
    act(() => view.result.current.updateScroll(-10));
    expect(view.result.current.condensed).toBe(false);
  });
});
