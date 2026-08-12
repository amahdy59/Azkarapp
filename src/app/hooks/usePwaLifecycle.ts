import { useCallback, useEffect, useRef, useState } from "react";
import { reportError } from "../../lib/observability";
import { t } from "../i18n";
import { loadReleaseNotes, type ReleaseNotes } from "../releaseNotes";
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

  useEffect(() => () => window.clearTimeout(statusTimer.current), []);

  const applyUpdate = useCallback(() => {
    setPwaError("");
    setIsUpdating(true);
    window.dispatchEvent(new Event("azkar-apply-update"));
  }, []);

  const dismissUpdate = useCallback(() => {
    setUpdateAvailable(false);
    setReleaseNotes(null);
  }, []);

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
    installApp,
    installDismissed,
    installPrompt,
    isInstalling,
    isUpdating,
    pwaError,
    pwaStatus,
    releaseNotes,
    updateAvailable,
  };
}
