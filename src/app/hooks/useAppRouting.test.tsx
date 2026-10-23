import { act, renderHook } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { useAppRouting } from "./useAppRouting";
import { acquireAudioControlLock } from "../audioControlLock";

afterEach(() => window.history.replaceState(null, "", "/"));

it("blocks internal navigation while listening is locked without pushing a history trap", () => {
  window.history.replaceState({ view: "home" }, "", "/#/home");
  const { result } = renderHook(() =>
    useAppRouting({
      routineModes: { morning: "core", evening: "core", before_sleep: "core", after_prayer: "core" },
      hasCompletedOnboarding: true,
      reduceMotion: true,
    }),
  );
  const release = acquireAudioControlLock();
  const push = vi.spyOn(window.history, "pushState");
  try {
    act(() => {
      result.current.push("library");
      result.current.replace("progress");
      result.current.handleNavTab("settings");
    });
    expect(result.current.view).toBe("home");
    expect(result.current.activeTab).toBe("home");
    act(() => {
      window.history.replaceState({ view: "library" }, "", "/#/azkar");
      window.dispatchEvent(new PopStateEvent("popstate", { state: { view: "library" } }));
    });
    expect(result.current.view).toBe("home");
    expect(window.location.hash).toBe("#/home");
    expect(push).not.toHaveBeenCalled();
  } finally {
    release();
    push.mockRestore();
  }
  act(() => result.current.handleNavTab("azkar"));
  expect(result.current.view).toBe("library");
});

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

it("uses temporary full reading context without altering an abbreviated preference", () => {
  window.history.replaceState(null, "", "/#/azkar");
  const savedModes = {
    morning: "core",
    evening: "complete",
    before_sleep: "complete",
    after_prayer: "complete",
  } as const;
  const { result } = renderHook(() =>
    useAppRouting({ routineModes: savedModes, hasCompletedOnboarding: true, reduceMotion: true }),
  );
  act(() => {
    result.current.setReadingRoutineMode("morning", "complete");
    result.current.setActiveCat("morning");
    result.current.push("reader");
  });
  expect(result.current.sharedRoutineMode).toBe("complete");
  expect(window.location.hash).toContain("mode=complete");
  expect(savedModes.morning).toBe("core");
});

it("leaves modal and consumed keys alone and pushes history for a legitimate search shortcut", () => {
  window.history.replaceState(null, "", "/#/home");
  const { result } = renderHook(() =>
    useAppRouting({
      routineModes: { morning: "core", evening: "core", before_sleep: "core", after_prayer: "core" },
      hasCompletedOnboarding: true,
      reduceMotion: true,
    }),
  );
  const historyPush = vi.spyOn(window.history, "pushState");
  const dialog = document.createElement("div");
  dialog.setAttribute("role", "dialog");
  document.body.append(dialog);
  act(() => window.dispatchEvent(new KeyboardEvent("keydown", { key: "k", ctrlKey: true, cancelable: true })));
  expect(result.current.view).toBe("home");
  dialog.remove();
  const consumed = new KeyboardEvent("keydown", { key: "k", ctrlKey: true, cancelable: true });
  consumed.preventDefault();
  act(() => window.dispatchEvent(consumed));
  expect(result.current.view).toBe("home");
  act(() => window.dispatchEvent(new KeyboardEvent("keydown", { key: "k", ctrlKey: true, cancelable: true })));
  expect(result.current.view).toBe("search");
  expect(historyPush).toHaveBeenCalledOnce();
  historyPush.mockRestore();
});
