import { act, renderHook } from "@testing-library/react";
import { afterEach, expect, it } from "vitest";
import { useAppRouting } from "./useAppRouting";

afterEach(() => window.history.replaceState(null, "", "/"));

it("keeps shared reading context through completion and clears it on leaving the flow", () => {
  window.history.replaceState(null, "", "/#/azkar/morning?mode=complete");
  const savedModes = { morning: "core", evening: "core", before_sleep: "core" } as const;
  const { result } = renderHook(() =>
    useAppRouting({
      routineModes: savedModes,
      hasCompletedOnboarding: true,
      reduceMotion: true,
    }),
  );
  expect(result.current.sharedRoutineMode).toBe("complete");
  act(() => result.current.setView("completion"));
  expect(result.current.sharedRoutineMode).toBe("complete");
  act(() => result.current.setView("home"));
  expect(result.current.sharedRoutineMode).toBeUndefined();
  expect(savedModes.morning).toBe("core");
});
