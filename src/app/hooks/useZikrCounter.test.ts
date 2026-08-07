import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useZikrCounter } from "./useZikrCounter";
import type { Zikr } from "../types";

function makeZikr(overrides: Partial<Zikr> = {}): Zikr {
  return {
    id: "z-1",
    category: "morning",
    arabicText: "بِاسْمِكَ اللَّهُمَّ",
    translation: "In Your name, O Allah",
    transliteration: "Bismika Allahumma",
    repetitionCount: 3,
    ...overrides,
  } as Zikr;
}

function setup(
  overrides: Parameters<typeof useZikrCounter>[0] extends never ? never : Partial<Record<string, unknown>>,
) {
  const onComplete = vi.fn();
  const onAdvance = vi.fn();
  const vibrate = vi.fn();
  const props = {
    z: makeZikr(),
    idx: 0,
    isDone: false,
    language: "en" as const,
    azkarLength: 5,
    collectionCompletedCount: 0,
    hapticFeedback: false,
    vibrate,
    onComplete,
    onAdvance,
    ...overrides,
  };
  const view = renderHook(() => useZikrCounter(props as Parameters<typeof useZikrCounter>[0]));
  return { ...view, onComplete, onAdvance, vibrate };
}

/** Minimal click-like event whose target is a detached element. */
function tapEventOn(target: Element) {
  return { target } as unknown as React.MouseEvent<HTMLElement>;
}

describe("useZikrCounter", () => {
  it("counts up and reports completion once the repetition target is reached", () => {
    const { result, onComplete } = setup({});

    act(() => result.current.handleTap());
    expect(result.current.count).toBe(1);
    expect(result.current.complete).toBe(false);

    act(() => result.current.handleTap());
    act(() => result.current.handleTap());
    expect(result.current.count).toBe(3);
    expect(result.current.complete).toBe(true);
    expect(onComplete).toHaveBeenCalledWith(0);
  });

  it("ignores further taps once complete", () => {
    const { result } = setup({ z: makeZikr({ repetitionCount: 1 }) });

    act(() => result.current.handleTap());
    expect(result.current.count).toBe(1);

    act(() => result.current.handleTap());
    expect(result.current.count).toBe(1);
  });

  it("does not count surface taps that land on an interactive control", () => {
    const { result } = setup({});
    const button = document.createElement("button");
    document.body.appendChild(button);

    // Counting the whole reader surface is a convenience; it must never fire
    // because the user pressed Save, Share, or a sheet control.
    act(() => result.current.handleSurfaceTap(tapEventOn(button)));
    expect(result.current.count).toBe(0);

    button.remove();
  });

  it("counts a surface tap on inert content", () => {
    const { result } = setup({});
    const paragraph = document.createElement("p");
    document.body.appendChild(paragraph);

    act(() => result.current.handleSurfaceTap(tapEventOn(paragraph)));
    expect(result.current.count).toBe(1);

    paragraph.remove();
  });

  it("never counts surface taps for a full surah", () => {
    // Long chapters are read and scrolled; only the explicit counter counts,
    // so a stray tap cannot mark Al-Kahf complete.
    const { result } = setup({ z: makeZikr({ isSurah: true, repetitionCount: 1 }) });
    const paragraph = document.createElement("p");
    document.body.appendChild(paragraph);

    act(() => result.current.handleSurfaceTap(tapEventOn(paragraph)));
    expect(result.current.count).toBe(0);

    paragraph.remove();
  });

  it("resets back to an incomplete, zeroed state", () => {
    const { result } = setup({ z: makeZikr({ repetitionCount: 1 }) });

    act(() => result.current.handleTap());
    expect(result.current.complete).toBe(true);

    act(() => result.current.handleReset());
    expect(result.current.count).toBe(0);
    expect(result.current.complete).toBe(false);
  });

  it("vibrates only when haptics are enabled", () => {
    const quiet = setup({ hapticFeedback: false });
    act(() => quiet.result.current.handleTap());
    expect(quiet.vibrate).not.toHaveBeenCalled();

    const haptic = setup({ hapticFeedback: true });
    act(() => haptic.result.current.handleTap());
    expect(haptic.vibrate).toHaveBeenCalled();
  });

  it("starts already complete when the zikr was done in a previous session", () => {
    const { result } = setup({ isDone: true, z: makeZikr({ repetitionCount: 3 }) });
    expect(result.current.count).toBe(3);
    expect(result.current.complete).toBe(true);
  });
});
