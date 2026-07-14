import React, { useState } from "react";
import { motion } from "motion/react";
import { Header } from "../../components/LayoutShells";
import type {
  AppLanguage,
  AudioQuality,
  ColorBlindSupport,
  StoredSession,
  TextSizeOption,
  ThemeMode,
} from "../../types";
import { t } from "../../i18n";
import { LanguagePanel, SettingsRootPanel, type SettingsSubScreen } from "./SettingsPanels";

export function SettingsScreen({
  themeMode,
  languageLabel,
  language,
  phoneAuthEnabled,
  isGuest,
  isSyncing,
  sessions,
  currentStreak,
  longestStreak,
  textSize,
  highContrast,
  boldText,
  reduceMotion,
  hapticFeedback,
  forceRtl,
  voiceOver,
  audioQuality,
  colorBlindSupport,
  onLanguageChange,
  onThemeModeChange,
  onTextSizeChange,
  onHighContrastChange,
  onBoldTextChange,
  onReduceMotionChange,
  onHapticFeedbackChange,
  onForceRtlChange,
  onVoiceOverChange,
  onAudioQualityChange,
  onColorBlindSupportChange,
  onActivateAccount,
  onSignOut,
  onBack,
}: {
  themeMode: ThemeMode;
  languageLabel: string;
  language: AppLanguage;
  phoneAuthEnabled: boolean;
  isGuest: boolean;
  isSyncing: boolean;
  sessions: StoredSession[];
  currentStreak: number;
  longestStreak: number;
  textSize: TextSizeOption;
  highContrast: boolean;
  boldText: boolean;
  reduceMotion: boolean;
  hapticFeedback: boolean;
  forceRtl: boolean;
  voiceOver: boolean;
  audioQuality: AudioQuality;
  colorBlindSupport: ColorBlindSupport;
  onLanguageChange: (value: AppLanguage) => void;
  onThemeModeChange: (value: ThemeMode) => void;
  onTextSizeChange: (value: TextSizeOption) => void;
  onHighContrastChange: (value: boolean) => void;
  onBoldTextChange: (value: boolean) => void;
  onReduceMotionChange: (value: boolean) => void;
  onHapticFeedbackChange: (value: boolean) => void;
  onForceRtlChange: (value: boolean) => void;
  onVoiceOverChange: (value: boolean) => void;
  onAudioQualityChange: (value: AudioQuality) => void;
  onColorBlindSupportChange: (value: ColorBlindSupport) => void;
  onActivateAccount: () => void;
  onSignOut: () => void;
  onBack: () => void;
}) {
  const [sub, setSub] = useState<SettingsSubScreen>("root");
  const goBack = () => setSub("root");

  return (
    <div className="relative flex h-full flex-col overflow-hidden bg-background">
      {sub === "root" && (
        <motion.div
          className="absolute inset-0 flex h-full w-full flex-col"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <Header title={t(language, "common.settings")} onBack={onBack} />
          <SettingsRootPanel
            onNav={setSub}
            language={language}
            themeMode={themeMode}
            languageLabel={languageLabel}
            phoneAuthEnabled={phoneAuthEnabled}
            audioQuality={audioQuality}
            textSize={textSize}
            isGuest={isGuest}
            isSyncing={isSyncing}
            onThemeModeChange={onThemeModeChange}
            onActivateAccount={onActivateAccount}
            onSignOut={onSignOut}
          />
        </motion.div>
      )}
      {sub === "language" && (
        <LanguagePanel language={language} selectedLanguage={language} onChange={onLanguageChange} onBack={goBack} />
      )}
    </div>
  );
}
