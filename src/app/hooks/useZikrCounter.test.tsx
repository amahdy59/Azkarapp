import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { COMPREHENSIVE_DUAS } from "../content/comprehensiveDuas";
import { COUNTER_ADVANCE_DELAY_MS } from "../constants/reader";
import { useZikrCounter } from "./useZikrCounter";

afterEach(() => vi.useRealTimers());

describe("useZikrCounter with comprehensive duas", () => {
  it("completes and advances a dua using its reported repetition count", () => {
    vi.useFakeTimers();
    const dua = COMPREHENSIVE_DUAS.find((item) => item.id === "comprehensive-dua-42")!;
    const onComplete = vi.fn();
    const onAdvance = vi.fn();
    const { result } = renderHook(() =>
      useZikrCounter({
        z: dua,
        idx: 41,
        isDone: false,
        language: "en",
        azkarLength: 47,
        collectionCompletedCount: 0,
        hapticFeedback: false,
        vibrate: () => undefined,
        onComplete,
        onAdvance,
      }),
    );

    for (let count = 0; count < dua.repetitionCount; count += 1) {
      act(() => result.current.handleTap());
    }

    expect(result.current.count).toBe(100);
    expect(onComplete).toHaveBeenCalledOnce();
    act(() => vi.advanceTimersByTime(COUNTER_ADVANCE_DELAY_MS));
    expect(onAdvance).toHaveBeenCalledWith(41);
  });
});
