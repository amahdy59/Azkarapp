import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { t } from "../i18n";
import type { BeforeInstallPromptEvent } from "../types";
import { usePwaLifecycle } from "./usePwaLifecycle";

const { loadReleaseNotes, reportError } = vi.hoisted(() => ({
  loadReleaseNotes: vi.fn(),
  reportError: vi.fn(),
}));

vi.mock("../releaseNotes", () => ({ loadReleaseNotes }));
vi.mock("../../lib/observability", () => ({ reportError }));

beforeEach(() => {
  window.localStorage.clear();
  loadReleaseNotes.mockReset();
  reportError.mockReset();
});

describe("usePwaLifecycle", () => {
  it("loads release notes, applies an update, and reports update failure", async () => {
    const notes = { en: ["Faster startup"], ar: ["بدء أسرع"] };
    loadReleaseNotes.mockResolvedValue(notes);
    const applyListener = vi.fn();
    window.addEventListener("azkar-apply-update", applyListener);
    const { result } = renderHook(() => usePwaLifecycle("en"));

    act(() => window.dispatchEvent(new Event("azkar-update-available")));
    await waitFor(() => expect(result.current.releaseNotes).toEqual(notes));
    expect(result.current.updateAvailable).toBe(true);

    act(() => result.current.applyUpdate());
    expect(result.current.isUpdating).toBe(true);
    expect(applyListener).toHaveBeenCalledOnce();

    act(() => window.dispatchEvent(new Event("azkar-update-failed")));
    expect(result.current.isUpdating).toBe(false);
    expect(result.current.pwaError).toBe(t("en", "pwa.updateError"));

    act(() => result.current.dismissUpdate());
    expect(result.current.updateAvailable).toBe(false);
    expect(result.current.releaseNotes).toBeNull();
    window.removeEventListener("azkar-apply-update", applyListener);
  });

  it("handles install acceptance and persists a later dismissal", async () => {
    const prompt = vi.fn(async () => undefined);
    const promptEvent = Object.assign(new Event("beforeinstallprompt", { cancelable: true }), {
      prompt,
      userChoice: Promise.resolve({ outcome: "accepted" as const, platform: "web" }),
    }) as BeforeInstallPromptEvent;
    const { result } = renderHook(() => usePwaLifecycle("en"));

    act(() => window.dispatchEvent(promptEvent));
    await waitFor(() => expect(result.current.installPrompt).toBe(promptEvent));
    await act(async () => result.current.installApp());

    expect(prompt).toHaveBeenCalledOnce();
    expect(result.current.installPrompt).toBeNull();
    expect(result.current.pwaStatus).toBe(t("en", "pwa.installAccepted"));

    act(() => result.current.dismissInstall());
    expect(result.current.installDismissed).toBe(true);
    expect(window.localStorage.getItem("azkarapp.install-dismissed")).toBe("true");
  });

  it("keeps installation usable when the browser prompt rejects", async () => {
    const error = new Error("prompt failed");
    const promptEvent = Object.assign(new Event("beforeinstallprompt"), {
      prompt: vi.fn().mockRejectedValue(error),
      userChoice: Promise.resolve({ outcome: "dismissed" as const, platform: "web" }),
    }) as BeforeInstallPromptEvent;
    const { result } = renderHook(() => usePwaLifecycle("ar"));

    act(() => window.dispatchEvent(promptEvent));
    await waitFor(() => expect(result.current.installPrompt).toBe(promptEvent));
    await act(async () => result.current.installApp());

    expect(reportError).toHaveBeenCalledWith(error, "pwa-install");
    expect(result.current.isInstalling).toBe(false);
    expect(result.current.pwaStatus).toBe(t("ar", "pwa.installDismissed"));
  });
});
