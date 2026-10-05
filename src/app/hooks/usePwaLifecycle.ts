import { useCallback, useEffect, useRef, useState } from "react";
import { reportError } from "../../lib/observability";
import { t } from "../i18n";
import { APP_RELEASE } from "../releaseStamp";
import { loadReleaseNotes, markReleaseSeen, readSeenRelease, type ReleaseNotes } from "../releaseNotes";
import { escapeStaleServiceWorker, rememberUpdateAttempt } from "../pwaUpdate";
import { deferUpdate, readUpdateDeferral, remainingUpdateDeferral } from "../updateDeferral";
import type { AppLanguage, BeforeInstallPromptEvent } from "../types";

const INSTALL_DISMISSED_KEY = "azkarapp.install-dismissed";

function readInstallDismissed() {
  try {
    return window.localStorage.getItem(INSTALL_DISMISSED_KEY) === "true";
  } catch {
    return false;
  }
}

export function usePwaLifecycle(language: AppLanguage) {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [hasWaitingUpdate, setHasWaitingUpdate] = useState(false);
  const [releaseNotes, setReleaseNotes] = useState<ReleaseNotes | null>(null);
  const [updatedNotes, setUpdatedNotes] = useState<ReleaseNotes | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);
  const [pwaError, setPwaError] = useState("");
  const [pwaStatus, setPwaStatus] = useState("");
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [installDismissed, setInstallDismissed] = useState(readInstallDismissed);
  const statusTimer = useRef<number | undefined>(undefined);
  const deferralTimer = useRef<number | undefined>(undefined);
  const [initialDeferral] = useState(readUpdateDeferral);
  const deferredUpdate = useRef(initialDeferral);
  const updateRequest = useRef(0);

  const showWaitingUpdate = useCallback((notes: ReleaseNotes | null) => {
    setHasWaitingUpdate(true);
    window.clearTimeout(deferralTimer.current);
    setReleaseNotes(notes);
    // A failed/offline notes fetch must not undo the reader's known choice.
    const release = notes?.release || deferredUpdate.current?.release || "unknown";
    const remaining = remainingUpdateDeferral(deferredUpdate.current, release);
    setUpdateAvailable(remaining === 0);
    if (remaining > 0) {
      deferralTimer.current = window.setTimeout(() => setUpdateAvailable(true), remaining);
    }
  }, []);

  useEffect(() => {
    let active = true;
    const handleUpdate = () => {
      const request = ++updateRequest.current;
      setPwaError("");
      void loadReleaseNotes().then((notes) => {
        if (active && request === updateRequest.current) showWaitingUpdate(notes);
      });
    };
    const handleInstallPrompt = (event: Event) => {
      event.preventDefault();
      setInstallPrompt(event as BeforeInstallPromptEvent);
    };
    const handleUpdateFailure = () => {
      setIsUpdating(false);
      setPwaError(t(language, "pwa.updateError"));
    };

    window.addEventListener("azkar-update-available", handleUpdate);
    window.addEventListener("azkar-update-failed", handleUpdateFailure);
    window.addEventListener("beforeinstallprompt", handleInstallPrompt);
    return () => {
      active = false;
      window.removeEventListener("azkar-update-available", handleUpdate);
      window.removeEventListener("azkar-update-failed", handleUpdateFailure);
      window.removeEventListener("beforeinstallprompt", handleInstallPrompt);
    };
  }, [language, showWaitingUpdate]);

  /**
   * Tell "here is what you just got" from "here is what is waiting for you".
   *
   * The notes are fetched from the network; the app is served from the
   * service-worker precache, and that worker waits for the reader before it
   * takes over. So a deployed release that differs from the last one seen means
   * one of two entirely different things, and this used to read as the first in
   * both cases: a reader still running last week's bundle was told the app
   * had been updated, shown notes for features they did not have, and given a
   * Close button as the only way out. Comparing against the release this bundle
   * was actually built from separates them — a match is a recap, a mismatch is
   * an update waiting, and the prompt for it can offer to apply it.
   *
   * A first run stores the stamp silently: someone opening Azkar for the first
   * time should not be met with a changelog.
   */
  useEffect(() => {
    if (typeof navigator !== "undefined" && !navigator.onLine) return;

    let cancelled = false;
    const request = ++updateRequest.current;
    void loadReleaseNotes().then((notes) => {
      if (cancelled || request !== updateRequest.current || !notes?.release) return;

      if (APP_RELEASE && notes.release !== APP_RELEASE) {
        /* Still on the old build after asking for the new one. The worker
           serving it has had its chance, so it is discarded rather than asked
           again — see escapeStaleServiceWorker. This reloads when it fires, so
           there is nothing to show. */
        void escapeStaleServiceWorker({
          deployedRelease: notes.release,
          runningRelease: APP_RELEASE,
          getRegistration: () => navigator.serviceWorker?.getRegistration?.() ?? Promise.resolve(undefined),
          reload: () => window.location.reload(),
        }).then((escalated) => {
          if (cancelled || request !== updateRequest.current || escalated) return;
          showWaitingUpdate(notes);
        });
        return;
      }

      const seen = readSeenRelease();
      if (seen === null) {
        markReleaseSeen(notes.release);
        return;
      }
      if (seen !== notes.release) setUpdatedNotes(notes);
    });

    return () => {
      cancelled = true;
    };
  }, [showWaitingUpdate]);

  useEffect(() => () => window.clearTimeout(statusTimer.current), []);
  useEffect(() => () => window.clearTimeout(deferralTimer.current), []);

  const applyUpdate = useCallback(() => {
    window.clearTimeout(deferralTimer.current);
    setPwaError("");
    setIsUpdating(true);
    // The notes were on screen when this was tapped, so the recap after the
    // reload would only repeat what the reader has just read.
    if (releaseNotes?.release) {
      markReleaseSeen(releaseNotes.release);
      // What the next load checks against: if this build is still running then,
      // the handover did not take and the worker gets discarded instead.
      rememberUpdateAttempt(releaseNotes.release);
    }
    window.dispatchEvent(new Event("azkar-apply-update"));
  }, [releaseNotes]);

  const dismissUpdate = useCallback(() => {
    ++updateRequest.current;
    deferredUpdate.current = deferUpdate(releaseNotes?.release || deferredUpdate.current?.release || "unknown");
    showWaitingUpdate(releaseNotes);
  }, [releaseNotes, showWaitingUpdate]);

  const reviewUpdate = useCallback(() => {
    window.clearTimeout(deferralTimer.current);
    setUpdateAvailable(true);
  }, []);

  const dismissUpdatedNotes = useCallback(() => {
    if (updatedNotes?.release) markReleaseSeen(updatedNotes.release);
    setUpdatedNotes(null);
  }, [updatedNotes]);

  const installApp = useCallback(async () => {
    if (!installPrompt) return;
    try {
      setIsInstalling(true);
      await installPrompt.prompt();
      const choice = await installPrompt.userChoice;
      setPwaStatus(t(language, choice?.outcome === "accepted" ? "pwa.installAccepted" : "pwa.installDismissed"));
    } catch (error) {
      reportError(error, "pwa-install");
      setPwaStatus(t(language, "pwa.installDismissed"));
    } finally {
      setIsInstalling(false);
      setInstallPrompt(null);
      window.clearTimeout(statusTimer.current);
      statusTimer.current = window.setTimeout(() => setPwaStatus(""), 3000);
    }
  }, [installPrompt, language]);

  const dismissInstall = useCallback(() => {
    try {
      window.localStorage.setItem(INSTALL_DISMISSED_KEY, "true");
    } catch {
      // The in-memory dismissal still keeps the current session quiet.
    }
    setInstallDismissed(true);
  }, []);

  return {
    applyUpdate,
    dismissInstall,
    dismissUpdate,
    dismissUpdatedNotes,
    installApp,
    installDismissed,
    installPrompt,
    isInstalling,
    isUpdating,
    pwaError,
    pwaStatus,
    releaseNotes,
    updatedNotes,
    updateAvailable,
    hasWaitingUpdate,
    reviewUpdate,
  };
}
