import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { useAppRouting } from "./useAppRouting";
import { useOverlayBack } from "./useOverlayBack";
import { acquireAudioControlLock } from "../audioControlLock";

const native = vi.hoisted(() => ({ listener: undefined as (() => void) | undefined, exit: vi.fn(), remove: vi.fn() }));
vi.mock("../native/platform", () => ({ isNativeAndroid: () => true }));
vi.mock("@capacitor/app", () => ({
  App: {
    exitApp: native.exit,
    addListener: vi.fn(async (_: string, listener: () => void) => {
      native.listener = listener;
      return { remove: native.remove };
    }),
  },
}));
beforeEach(() => {
  window.history.replaceState(null, "", "/#/home");
  native.listener = undefined;
  vi.clearAllMocks();
});
afterEach(() => window.history.replaceState(null, "", "/"));

it("native Back closes the open overlay before exiting Home, respects audio lock and removes its listener", async () => {
  const close = vi.fn();
  const { result, unmount } = renderHook(() => {
    const id = useOverlayBack(true, close);
    const routing = useAppRouting({
      routineModes: { morning: "core", evening: "core", before_sleep: "core", after_prayer: "core" },
      hasCompletedOnboarding: true,
      reduceMotion: true,
    });
    return { id, routing };
  });
  await waitFor(() => expect(native.listener).toBeTypeOf("function"));
  const dialog = document.createElement("section");
  dialog.setAttribute("role", "dialog");
  dialog.dataset.backDismiss = result.current.id;
  document.body.append(dialog);
  act(() => native.listener!());
  expect(close).toHaveBeenCalledOnce();
  expect(native.exit).not.toHaveBeenCalled();
  dialog.remove();
  const release = acquireAudioControlLock();
  act(() => native.listener!());
  expect(native.exit).not.toHaveBeenCalled();
  release();
  act(() => native.listener!());
  expect(native.exit).toHaveBeenCalledOnce();
  unmount();
  expect(native.remove).toHaveBeenCalled();
});
