import { fireEvent, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useOverlayOrigin, registerOverlayOpener, overlayReturnTarget } from "./useOverlayOrigin";

afterEach(() => document.querySelectorAll("[data-origin-fixture]").forEach((node) => node.remove()));
function button(edge?: string) {
  const node = document.createElement("button");
  node.dataset.originFixture = "";
  if (edge) node.dataset.overlayEdge = edge;
  document.body.append(node);
  return node;
}

describe("overlay trigger origin", () => {
  it("recovers to the replacement rail after resizing hides the phone opener", () => {
    const frame = document.createElement("article");
    frame.dataset.originFixture = "";
    const phone = document.createElement("button");
    phone.hidden = true;
    const rail = document.createElement("button");
    rail.dataset.testid = "mushaf-rail-more";
    frame.append(phone, rail);
    document.body.append(frame);
    expect(overlayReturnTarget(phone, frame)).toBe(rail);
    rail.setAttribute("inert", "");
    expect(overlayReturnTarget(phone, frame)).toBeNull();
  });
  it("remembers unfocused pointer openers and freezes origin while open", () => {
    const top = button("top"),
      bottom = button("bottom");
    const { result, rerender } = renderHook(({ open }) => useOverlayOrigin(open), { initialProps: { open: false } });
    fireEvent.pointerDown(top);
    rerender({ open: true });
    expect(result.current).toMatchObject({ origin: "top", opener: top });
    fireEvent.pointerDown(bottom);
    rerender({ open: true });
    expect(result.current.origin).toBe("top");
    rerender({ open: false });
    rerender({ open: true });
    expect(result.current).toMatchObject({ origin: "bottom", opener: bottom });
  });

  it("uses keyboard focus and explicit overrides", () => {
    const target = button("top");
    target.focus();
    const { result } = renderHook(() => useOverlayOrigin(true, "bottom"));
    expect(result.current).toMatchObject({ origin: "bottom", opener: target });
  });

  it("inherits the original toolbar opener through a nested panel handoff", () => {
    const trigger = button("top");
    const surface = document.createElement("section");
    surface.dataset.originFixture = "";
    surface.dataset.overlayOrigin = "top";
    const nested = document.createElement("button");
    surface.append(nested);
    document.body.append(surface);
    registerOverlayOpener(surface, trigger);
    renderHook(() => useOverlayOrigin(false));
    fireEvent.pointerDown(nested);
    const { result } = renderHook(() => useOverlayOrigin(true));
    expect(result.current).toMatchObject({ origin: "top", opener: trigger });
  });

  it("uses the physical button position when no edge is declared", () => {
    const target = button();
    vi.spyOn(target, "getBoundingClientRect").mockReturnValue({ top: 20, height: 44 } as DOMRect);
    const { result, rerender } = renderHook(({ open }) => useOverlayOrigin(open), { initialProps: { open: false } });
    fireEvent.click(target);
    rerender({ open: true });
    expect(result.current.origin).toBe("top");
  });
});
