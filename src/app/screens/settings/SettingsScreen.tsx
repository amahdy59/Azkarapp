import React, { useState } from "react";
import { motion } from "motion/react";
import { Header } from "../../components/LayoutShells";
import { t } from "../../i18n";
import type { AppLanguage } from "../../types";
import { 
  SettingsRootPanel, 
  AccessibilityPanel, 
  DownloadsPanel, 
  NotificationsPanel, 
  ProgressPanel, 
  AboutPanel,
  SettingsSubScreen
} from "./SettingsPanels";

export function SettingsScreen({
  darkMode,
  languageLabel,
  language,
  isArabic,
  isGuest,
  isSyncing,
  onToggleDark,
  onSignOut,
  onBack,
}: {
  darkMode: boolean;
  languageLabel: string;
  language: AppLanguage;
  isArabic: boolean;
  isGuest: boolean;
  isSyncing: boolean;
  onToggleDark: () => void;
  onSignOut: () => void;
  onBack: () => void;
}) {
  const [sub, setSub] = useState<SettingsSubScreen>("root");
  const goBack = () => setSub("root");

  return (
    <div className="flex flex-col h-full bg-background relative overflow-hidden">
      {sub === "root" && (
        <motion.div className="flex flex-col h-full w-full absolute inset-0"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <Header title={t(language, "common.settings")} onBack={onBack} />
          <SettingsRootPanel
            onNav={setSub}
            language={language}
            darkMode={darkMode}
            languageLabel={languageLabel}
            isGuest={isGuest}
            isSyncing={isSyncing}
            onToggleDark={onToggleDark}
            onSignOut={onSignOut}
          />
        </motion.div>
      )}
      {sub === "accessibility"  && <AccessibilityPanel  onBack={goBack} />}
      {sub === "downloads"      && <DownloadsPanel       onBack={goBack} />}
      {sub === "notifications"  && <NotificationsPanel  onBack={goBack} />}
      {sub === "progress"       && <ProgressPanel        onBack={goBack} />}
      {sub === "about"          && <AboutPanel           onBack={goBack} />}
    </div>
  );
}
