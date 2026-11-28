import { act, cleanup, renderHook, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { useSafeAreaCollisionPadding } from "./useSafeAreaCollisionPadding";

function insets(top: number, right: number, bottom: number, left: number) {
  [top, right, bottom, left].forEach((value, index) => {
    document.documentElement.style.setProperty(
      `--app-safe-area-${["top", "right", "bottom", "left"][index]}`,
      `${value}px`,
    );
  });
}

afterEach(() => {
  cleanup();
  for (const edge of ["top", "right", "bottom", "left"]) {
    document.documentElement.style.removeProperty(`--app-safe-area-${edge}`);
  }
});

describe("safe-area collision bounds", () => {
  it("retains ordinary browser margins without physical insets", () => {
    const { result } = renderHook(() => useSafeAreaCollisionPadding());
    expect(result.current).toEqual({ top: 8, right: 8, bottom: 8, left: 8 });
  });

  it("protects all physical edges and follows live rotation/navigation changes", async () => {
    insets(32, 0, 24, 0);
    const first = renderHook(() => useSafeAreaCollisionPadding());
    const second = renderHook(() => useSafeAreaCollisionPadding({ top: 12, bottom: 16 }));
    expect(first.result.current).toEqual({ top: 40, right: 8, bottom: 32, left: 8 });
    expect(second.result.current).toEqual({ top: 44, right: 0, bottom: 40, left: 0 });
    first.unmount();
    act(() => insets(0, 36, 0, 0));
    await waitFor(() => expect(second.result.current).toEqual({ top: 12, right: 36, bottom: 16, left: 0 }));
    act(() => insets(0, 0, 0, 0));
    await waitFor(() => expect(second.result.current).toEqual({ top: 12, right: 0, bottom: 16, left: 0 }));
  });

  it("ignores malformed or negative dimensions", () => {
    document.documentElement.style.setProperty("--app-safe-area-top", "invalid");
    document.documentElement.style.setProperty("--app-safe-area-bottom", "-48px");
    const { result } = renderHook(() => useSafeAreaCollisionPadding(16));
    expect(result.current).toEqual({ top: 16, right: 16, bottom: 16, left: 16 });
  });

  it("observes live inset changes again after the final consumer unmounts", async () => {
    const first = renderHook(() => useSafeAreaCollisionPadding());
    first.unmount();
    insets(20, 0, 16, 0);
    const next = renderHook(() => useSafeAreaCollisionPadding());
    expect(next.result.current).toEqual({ top: 28, right: 8, bottom: 24, left: 8 });
    act(() => insets(0, 24, 0, 12));
    await waitFor(() => expect(next.result.current).toEqual({ top: 8, right: 32, bottom: 8, left: 20 }));
  });
});
