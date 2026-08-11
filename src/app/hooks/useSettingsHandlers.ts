import type { AppLanguage, AppStateSnapshot } from "../types";
import { clearStoredAppData, resetStoredSettings } from "../state";
import { t } from "../i18n";
import { deleteCurrentAccount } from "../../lib/auth";
import { reportError } from "../../lib/observability";

/**
 * Clears every local trace of the user's data.
 *
 * Downloaded audio lives in two places that have to go together: the Cache API
 * bucket holding the bytes, and `azkar.audio-downloads.v1`, which is the only
 * index of which URLs are in that bucket. `removeDownloadedAudio()` removes
 * both, so it runs first — clearing storage on its own would strand the cached
 * bytes with nothing able to find or delete them.
 *
 * The audio module is imported dynamically, as `main.tsx` already does, so the
 * Cache API paths and the audio catalogue stay out of the settings bundle.
 */
export async function clearAllLocalData() {
  try {
    const { removeDownloadedAudio } = await import("../audio/audioOfflineCache");
    await removeDownloadedAudio();
  } catch {
    // Offline audio is unsupported, blocked, or already gone. Local data still
    // clears — a failure here must not leave the user unable to clear anything.
  }
  clearStoredAppData();
}

export function useSettingsHandlers({
  selectedLang,
  appStateSnapshot,
  showConfirm,
}: {
  selectedLang: AppLanguage;
  appStateSnapshot: AppStateSnapshot;
  showConfirm: (
    title: string,
    description: string,
    confirmLabel: string,
    cancelLabel: string,
    onConfirm: () => void | Promise<void>,
    destructive?: boolean,
  ) => void;
}) {
  const handleExportData = () => {
    const blob = new Blob([JSON.stringify(appStateSnapshot, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `azkar-data-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 0);
  };

  const handleResetPreferences = () => {
    showConfirm(
      t(selectedLang, "settings.resetPreferencesTitle"),
      t(selectedLang, "settings.resetPreferencesConfirm"),
      t(selectedLang, "common.reset"),
      t(selectedLang, "common.cancel"),
      () => {
        resetStoredSettings();
        window.location.reload();
      },
      false,
    );
  };

  const handleClearLocalData = () => {
    showConfirm(
      t(selectedLang, "settings.clearLocalDataTitle"),
      t(selectedLang, "settings.clearLocalDataConfirm"),
      t(selectedLang, "settings.clearLocalDataAction"),
      t(selectedLang, "common.cancel"),
      async () => {
        await clearAllLocalData();
        window.location.reload();
      },
      true,
    );
  };

  const handleDeleteAccount = () => {
    showConfirm(
      t(selectedLang, "settings.deleteAccountTitle"),
      t(selectedLang, "settings.deleteAccountConfirm"),
      t(selectedLang, "settings.deleteAccountAction"),
      t(selectedLang, "common.cancel"),
      async () => {
        try {
          handleExportData();
          await deleteCurrentAccount();
          await clearAllLocalData();
          window.location.reload();
        } catch (error) {
          reportError(error, "account-delete");
          throw new Error(t(selectedLang, "settings.deleteAccountFailed"), { cause: error });
        }
      },
      true,
    );
  };

  return {
    handleExportData,
    handleResetPreferences,
    handleClearLocalData,
    handleDeleteAccount,
  };
}
