import { useCallback, useEffect, useRef, useState } from "react";
import { reportError } from "../../lib/observability";
import { t } from "../i18n";
import { loadReleaseNotes, markReleaseSeen, readSeenRelease, type ReleaseNotes } from "../releaseNotes";
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
  const [releaseNotes, setReleaseNotes] = useState<ReleaseNotes | null>(null);
  const [updatedNotes, setUpdatedNotes] = useState<ReleaseNotes | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);
  const [pwaError, setPwaError] = useState("");
  const [pwaStatus, setPwaStatus] = useState("");
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [installDismissed, setInstallDismissed] = useState(readInstallDismissed);
  const statusTimer = useRef<number | undefined>(undefined);

  useEffect(() => {
    const handleUpdate = () => {
      setUpdateAvailable(true);
      setPwaError("");
      setReleaseNotes(null);
      void loadReleaseNotes().then(setReleaseNotes);
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
      window.removeEventListener("azkar-update-available", handleUpdate);
      window.removeEventListener("azkar-update-failed", handleUpdateFailure);
      window.removeEventListener("beforeinstallprompt", handleInstallPrompt);
    };
  }, [language]);

  /**
   * Recap the notes for a release the reader never got to read.
   *
   * The update prompt shows the notes *before* the update, and applying it
   * reloads the app — so anyone who tapped Refresh without reading, or who
   * chose Later and updated on a subsequent launch, lost them for good. This
   * compares the deployed stamp against the last one shown and recaps only
   * when they differ. A first run stores the stamp silently: someone opening
   * Azkar for the first time should not be met with a changelog.
   */
  useEffect(() => {
    if (typeof navigator !== "undefined" && !navigator.onLine) return;

    let cancelled = false;
    void loadReleaseNotes().then((notes) => {
      if (cancelled || !notes?.release) return;

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
  }, []);

  useEffect(() => () => window.clearTimeout(statusTimer.current), []);

  const applyUpdate = useCallback(() => {
    setPwaError("");
    setIsUpdating(true);
    // The notes were on screen when this was tapped, so the recap after the
    // reload would only repeat what the reader has just read.
    if (releaseNotes?.release) markReleaseSeen(releaseNotes.release);
    window.dispatchEvent(new Event("azkar-apply-update"));
  }, [releaseNotes]);

  const dismissUpdate = useCallback(() => {
    setUpdateAvailable(false);
    setReleaseNotes(null);
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
  };
}
