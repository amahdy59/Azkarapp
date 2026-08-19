import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { t } from "../i18n";
import type { BeforeInstallPromptEvent } from "../types";
import { usePwaLifecycle } from "./usePwaLifecycle";

const { loadReleaseNotes, reportError } = vi.hoisted(() => ({
  loadReleaseNotes: vi.fn(),
  reportError: vi.fn(),
}));

// Only the network call is faked: the seen-release helpers are plain
// localStorage, and the recap logic is only worth testing against the real ones.
vi.mock("../releaseNotes", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../releaseNotes")>()),
  loadReleaseNotes,
}));
vi.mock("../../lib/observability", () => ({ reportError }));

beforeEach(() => {
  window.localStorage.clear();
  loadReleaseNotes.mockReset();
  loadReleaseNotes.mockResolvedValue(null);
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

  it("recaps the notes for a release the reader never saw", async () => {
    window.localStorage.setItem("azkarapp.release-seen", "2026-07-01");
    const notes = { release: "2026-08-19", en: ["Mushaf paging"], ar: ["تصفح المصحف"] };
    loadReleaseNotes.mockResolvedValue(notes);

    const { result } = renderHook(() => usePwaLifecycle("en"));
    await waitFor(() => expect(result.current.updatedNotes).toEqual(notes));

    act(() => result.current.dismissUpdatedNotes());
    expect(result.current.updatedNotes).toBeNull();
    expect(window.localStorage.getItem("azkarapp.release-seen")).toBe("2026-08-19");
  });

  it("stays quiet on a first run rather than greeting a new reader with a changelog", async () => {
    loadReleaseNotes.mockResolvedValue({ release: "2026-08-19", en: ["Mushaf paging"], ar: ["تصفح المصحف"] });

    const { result } = renderHook(() => usePwaLifecycle("en"));
    await waitFor(() => expect(window.localStorage.getItem("azkarapp.release-seen")).toBe("2026-08-19"));
    expect(result.current.updatedNotes).toBeNull();
  });

  it("does not recap notes the reader has just read in the update prompt", async () => {
    window.localStorage.setItem("azkarapp.release-seen", "2026-07-01");
    const notes = { release: "2026-08-19", en: ["Mushaf paging"], ar: ["تصفح المصحف"] };
    loadReleaseNotes.mockResolvedValue(notes);

    const { result } = renderHook(() => usePwaLifecycle("en"));
    act(() => window.dispatchEvent(new Event("azkar-update-available")));
    await waitFor(() => expect(result.current.releaseNotes).toEqual(notes));

    act(() => result.current.applyUpdate());
    expect(window.localStorage.getItem("azkarapp.release-seen")).toBe("2026-08-19");
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
