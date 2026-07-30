import type { AppLanguage, AppStateSnapshot } from "../types";
import { clearStoredAppData, resetStoredSettings } from "../state";
import { t } from "../i18n";
import { deleteCurrentAccount } from "../../lib/auth";

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

  const handleDeleteAccount = () => {
    showConfirm(
      selectedLang === "ar" ? "حذف الحساب نهائياً" : "Permanently delete account",
      selectedLang === "ar"
        ? "سيتم تنزيل نسخة من بياناتك أولاً، ثم حذف الحساب وبياناته نهائياً."
        : "A copy of your data will download first, then your account and cloud data will be permanently deleted.",
      selectedLang === "ar" ? "تنزيل البيانات وحذف الحساب" : "Export data and delete account",
      t(selectedLang, "common.cancel"),
      async () => {
        try {
          handleExportData();
          await deleteCurrentAccount();
          clearStoredAppData();
          window.location.reload();
        } catch (error) {
          console.error("Account deletion failed", error instanceof Error ? error.message : "Unknown error");
          window.alert(
            selectedLang === "ar"
              ? "تعذر حذف الحساب. لم تُحذف بياناتك المحلية، ويمكنك المحاولة مرة أخرى."
              : "Account deletion failed. Your local data was kept, so you can try again.",
          );
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
