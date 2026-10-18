import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { usePrayerSelectionAnchor } from "./usePrayerSelectionAnchor";
import type { PrayerName } from "../types";

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
    act(() => f.row.dispatchEvent(new Event("scroll")));
    expect(parseFloat(f.panel.style.getPropertyValue("--prayer-anchor-opacity"))).toBeCloseTo(0.5);
    f.bounds.cardX = -200;
    act(() => f.row.dispatchEvent(new Event("scroll")));
    expect(f.panel.style.getPropertyValue("--prayer-anchor-opacity")).toBe("0");
    f.bounds.cardX = 300;
    act(() => f.row.dispatchEvent(new Event("scroll")));
    expect(f.panel.style.getPropertyValue("--prayer-anchor-opacity")).toBe("1");
  });

  it("remeasures resized geometry and cleans styles and listeners when the disclosure closes", () => {
    const f = fixture();
    const hook = renderHook(
      ({ prayer }: { prayer: PrayerName | null }) => usePrayerSelectionAnchor(f.stripRef, f.panelRef, prayer, "rtl"),
      { initialProps: { prayer: "fajr" as PrayerName | null } },
    );
    f.bounds.panelX = 150;
    act(() => window.dispatchEvent(new Event("resize")));
    expect(f.panel.style.getPropertyValue("--prayer-anchor-x")).toBe("250px");
    hook.rerender({ prayer: null });
    expect(f.panel.style.length).toBe(0);
    act(() => {
      f.row.dispatchEvent(new Event("scroll"));
      window.dispatchEvent(new Event("resize"));
    });
    expect(f.panel.style.length).toBe(0);
  });

  it("does not attach a light when the surface is absent", () => {
    const f = fixture();
    renderHook(() => usePrayerSelectionAnchor(f.stripRef, { current: null }, "fajr", "rtl"));
    expect(f.panel.style.length).toBe(0);
  });
});
