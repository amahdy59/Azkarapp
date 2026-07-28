import type { AppLanguage, AppStateSnapshot } from "../types";
import { clearStoredAppData, resetStoredSettings } from "../state";
import { t } from "../i18n";

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
    onConfirm: () => void,
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
      () => {
        clearStoredAppData();
        window.location.reload();
      },
      true,
    );
  };

  return {
    handleExportData,
    handleResetPreferences,
    handleClearLocalData,
  };
}
