import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { usePrayerSelectionAnchor } from "./usePrayerSelectionAnchor";
import type { PrayerName } from "../types";

let frames = new Map<number, FrameRequestCallback>();
let frameId = 0;
const flush = () => {
  const pending = [...frames.values()];
  frames.clear();
  pending.forEach((callback) => callback(0));
};
beforeEach(() => {
  frames = new Map();
  vi.spyOn(window, "requestAnimationFrame").mockImplementation((callback) => {
    frames.set(++frameId, callback);
    return frameId;
  });
  vi.spyOn(window, "cancelAnimationFrame").mockImplementation((id) => {
    frames.delete(id);
  });
});

afterEach(() => {
  document.body.replaceChildren();
  vi.restoreAllMocks();
});

function fixture() {
  const strip = document.createElement("div");
  const row = document.createElement("div");
  row.dataset.testid = "home-all-prayers-row";
  const card = document.createElement("article");
  card.dataset.prayer = "fajr";
  const panel = document.createElement("section");
  row.append(card);
  strip.append(row);
  document.body.append(strip, panel);
  const bounds = { cardX: 300, panelX: 100, rowWidth: 600, panelWidth: 600, stripBottom: 200 };
  vi.spyOn(strip, "getBoundingClientRect").mockImplementation(
    () => new DOMRect(100, 0, bounds.rowWidth, bounds.stripBottom),
  );
  vi.spyOn(row, "getBoundingClientRect").mockImplementation(() => new DOMRect(100, 60, bounds.rowWidth, 140));
  vi.spyOn(card, "getBoundingClientRect").mockImplementation(() => new DOMRect(bounds.cardX, 60, 200, 120));
  vi.spyOn(panel, "getBoundingClientRect").mockImplementation(
    () => new DOMRect(bounds.panelX, 200, bounds.panelWidth, 300),
  );
  const stripRef = { current: strip };
  const panelRef = { current: panel };
  return { stripRef, panelRef, bounds, row, panel };
}

describe("prayer selection light", () => {
  it("keeps a flush card fully lit despite subpixel edge rounding", () => {
    const f = fixture();
    f.bounds.cardX = 500.000001;
    renderHook(() => usePrayerSelectionAnchor(f.stripRef, f.panelRef, "fajr", "rtl"));
    expect(f.panel.style.getPropertyValue("--prayer-anchor-opacity")).toBe("1");
  });

  it("aligns to physical card geometry in either direction and retains a 20px clear gap", () => {
    const f = fixture();
    const hook = renderHook(
      ({ direction }: { direction: "rtl" | "ltr" }) =>
        usePrayerSelectionAnchor(f.stripRef, f.panelRef, "fajr", direction),
      { initialProps: { direction: "rtl" } },
    );
    expect(f.panel.style.getPropertyValue("--prayer-anchor-x")).toBe("300px");
    expect(f.panel.style.getPropertyValue("--prayer-anchor-width")).toBe("130px");
    expect(f.panel.style.getPropertyValue("--prayer-panel-offset")).toBe("0px");
    f.bounds.cardX = 200;
    f.bounds.stripBottom = 186;
    hook.rerender({ direction: "ltr" });
    expect(f.panel.style.getPropertyValue("--prayer-anchor-x")).toBe("200px");
    expect(f.panel.style.getPropertyValue("--prayer-panel-offset")).toBe("14px");
  });

  it("fades a partially visible selection, hides it offscreen, and restores it without changing selection", () => {
    const f = fixture();
    renderHook(() => usePrayerSelectionAnchor(f.stripRef, f.panelRef, "fajr", "rtl"));
    f.bounds.cardX = 60;
    act(() => {
      f.row.dispatchEvent(new Event("scroll"));
      flush();
    });
    expect(parseFloat(f.panel.style.getPropertyValue("--prayer-anchor-opacity"))).toBeCloseTo(0.5);
    f.bounds.cardX = -200;
    act(() => {
      f.row.dispatchEvent(new Event("scroll"));
      flush();
    });
    expect(f.panel.style.getPropertyValue("--prayer-anchor-opacity")).toBe("0");
    f.bounds.cardX = 300;
    act(() => {
      f.row.dispatchEvent(new Event("scroll"));
      flush();
    });
    expect(f.panel.style.getPropertyValue("--prayer-anchor-opacity")).toBe("1");
  });

  it("remeasures resized geometry and cleans styles and listeners when the disclosure closes", () => {
    const f = fixture();
    const hook = renderHook(
      ({ prayer }: { prayer: PrayerName | null }) => usePrayerSelectionAnchor(f.stripRef, f.panelRef, prayer, "rtl"),
      { initialProps: { prayer: "fajr" as PrayerName | null } },
    );
    f.bounds.panelX = 150;
    act(() => {
      window.dispatchEvent(new Event("resize"));
      flush();
    });
    expect(f.panel.style.getPropertyValue("--prayer-anchor-x")).toBe("250px");
    hook.rerender({ prayer: null });
    expect(f.panel.style.length).toBe(0);
    act(() => {
      f.row.dispatchEvent(new Event("scroll"));
      window.dispatchEvent(new Event("resize"));
    });
    expect(f.panel.style.length).toBe(0);
  });

  it("coalesces observer/scroll bursts and skips unchanged writes", () => {
    const f = fixture();
    const hook = renderHook(() => usePrayerSelectionAnchor(f.stripRef, f.panelRef, "fajr", "rtl"));
    const reads = vi.spyOn(f.row, "getBoundingClientRect");
    const writes = vi.spyOn(f.panel.style, "setProperty");
    reads.mockClear();
    act(() => {
      for (let n = 0; n < 20; n++) f.row.dispatchEvent(new Event("scroll"));
    });
    expect(reads).not.toHaveBeenCalled();
    act(flush);
    expect(reads).toHaveBeenCalledOnce();
    expect(writes).not.toHaveBeenCalled();
    act(() => f.row.dispatchEvent(new Event("scroll")));
    hook.unmount();
    act(flush);
    expect(reads).toHaveBeenCalledOnce();
  });

  it("does not attach a light when the surface is absent", () => {
    const f = fixture();
    renderHook(() => usePrayerSelectionAnchor(f.stripRef, { current: null }, "fajr", "rtl"));
    expect(f.panel.style.length).toBe(0);
  });

  it("cancels pending hidden geometry and reconciles once visible", () => {
    const visibility = vi.spyOn(document, "visibilityState", "get").mockReturnValue("visible");
    const f = fixture();
    const hook = renderHook(() => usePrayerSelectionAnchor(f.stripRef, f.panelRef, "fajr", "rtl"));
    const reads = vi.spyOn(f.row, "getBoundingClientRect");
    reads.mockClear();
    act(() => {
      f.row.dispatchEvent(new Event("scroll"));
      visibility.mockReturnValue("hidden");
      document.dispatchEvent(new Event("visibilitychange"));
      flush();
      f.row.dispatchEvent(new Event("scroll"));
      flush();
    });
    expect(reads).not.toHaveBeenCalled();
    act(() => {
      visibility.mockReturnValue("visible");
      document.dispatchEvent(new Event("visibilitychange"));
      flush();
    });
    expect(reads).toHaveBeenCalledOnce();
    hook.unmount();
    visibility.mockRestore();
  });
});
