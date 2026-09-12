import type { AppLanguage, AppStateSnapshot } from "../types";
import { clearStoredAppData, resetStoredSettings } from "../state";
import { t } from "../i18n";
import { deleteCurrentAccount, signOutSupabase } from "../../lib/auth";
import { isSupabaseConfigured } from "../../lib/supabase";
import { reportError } from "../../lib/observability";

/**
 * Clears every local trace of the user's data.
 *
 * The reader's data is in three places, not one. `clearStoredAppData()` empties
 * localStorage; the Cache API holds downloaded audio and the downloaded mushaf
 * — its page images and QCF fonts — which can run to hundreds of megabytes.
 * Clearing storage alone left all of it on the device, so someone who asked the
 * app to erase their data kept most of it.
 *
 * Downloaded audio lives in two places that have to go together: the Cache API
 * bucket holding the bytes, and `azkar.audio-downloads.v1`, which is the only
 * index of which URLs are in that bucket. `removeDownloadedAudio()` removes
 * both, so it runs before storage is cleared — clearing storage first would
 * strand the cached bytes with nothing able to find or delete them.
 *
 * Each removal is attempted independently: one unavailable Cache API bucket
 * must not stop the others, or a reader on a browser that blocks one of them
 * can clear nothing at all.
 *
 * Both modules are imported dynamically, as `main.tsx` already does, so the
 * Cache API paths, the audio catalogue and the mushaf page list stay out of the
 * settings bundle.
 */
export async function clearAllLocalData() {
  await Promise.allSettled([
    ...(isSupabaseConfigured ? [signOutSupabase()] : []),
    import("../audio/audioOfflineCache").then(({ removeDownloadedAudio }) => removeDownloadedAudio()),
    import("../content/mushafOfflineCache").then(({ removeDownloadedMushaf }) => removeDownloadedMushaf()),
  ]);
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
