import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const nativeBack = vi.hoisted(() => ({ listener: undefined as (() => void) | undefined }));
const exitApp = vi.hoisted(() => vi.fn());

vi.mock("@capacitor/core", () => ({ Capacitor: { getPlatform: () => "android" } }));
vi.mock("@capacitor/app", () => ({
  App: {
    addListener: vi.fn(async (_event: string, callback: () => void) => {
      nativeBack.listener = callback;
      return { remove: vi.fn() };
    }),
    exitApp,
  },
}));

import { useAppRouting } from "./useAppRouting";

const options = {
  routineModes: { morning: "core", evening: "core", before_sleep: "core" } as const,
  hasCompletedOnboarding: true,
  reduceMotion: true,
};

describe("Android hardware Back navigation", () => {
  beforeEach(() => {
    nativeBack.listener = undefined;
    exitApp.mockClear();
    window.history.replaceState(null, "", "/");
  });

  afterEach(() => window.history.replaceState(null, "", "/"));

  it("exits the app when Back is pressed on Home", async () => {
    window.history.replaceState({ view: "home" }, "", "/#/home");
    renderHook(() => useAppRouting(options));
    await waitFor(() => expect(nativeBack.listener).toBeDefined());

    act(() => nativeBack.listener?.());

    expect(exitApp).toHaveBeenCalledOnce();
  });

  it("returns a directly opened screen to Home when it has no app history", async () => {
    window.history.replaceState({ view: "settings" }, "", "/#/settings");
    const { result } = renderHook(() => useAppRouting(options));
    await waitFor(() => expect(nativeBack.listener).toBeDefined());

    act(() => nativeBack.listener?.());

    await waitFor(() => expect(result.current.view).toBe("home"));
    expect(exitApp).not.toHaveBeenCalled();
  });

  it("uses the existing browser history for screens opened from inside the app", async () => {
    const { result } = renderHook(() => useAppRouting(options));
    await waitFor(() => expect(nativeBack.listener).toBeDefined());
    act(() => result.current.push("settings"));
    await waitFor(() => expect(result.current.view).toBe("settings"));
    const historyBack = vi.spyOn(window.history, "back");

    act(() => nativeBack.listener?.());

    expect(historyBack).toHaveBeenCalledOnce();
    expect(exitApp).not.toHaveBeenCalled();
  });
});
