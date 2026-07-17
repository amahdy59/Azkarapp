import React, { useState } from "react";
import { motion } from "motion/react";
import { Header } from "../../components/LayoutShells";
import type {
  AppLanguage,
  ArabicFontOption,
  ColorBlindSupport,
  ReminderSettings,
  StoredSession,
  TextSizeOption,
  ThemeMode,
} from "../../types";
import { t } from "../../i18n";
import {
  AboutPanel,
  AccessibilityPanel,
  DownloadsPanel,
  LanguagePanel,
  NotificationsPanel,
  ProgressPanel,
  SettingsRootPanel,
  type SettingsSubScreen,
} from "./SettingsPanels";

export function SettingsScreen({
  themeMode,
  languageLabel,
  language,
  isGuest,
  isSyncing,
  syncError,
  sessions,
  currentStreak,
  longestStreak,
  textSize,
  arabicFont,
  showTranslation,
  showTransliteration,
  highContrast,
  boldText,
  reduceMotion,
  hapticFeedback,
  forceRtl,
  colorBlindSupport,
  reminders,
  weeklyGoalDays,
  onLanguageChange,
  onThemeModeChange,
  onTextSizeChange,
  onArabicFontChange,
  onShowTranslationChange,
  onShowTransliterationChange,
  onHighContrastChange,
  onBoldTextChange,
  onReduceMotionChange,
  onHapticFeedbackChange,
  onForceRtlChange,
  onColorBlindSupportChange,
  onRemindersChange,
  onWeeklyGoalDaysChange,
  onActivateAccount,
  onSignOut,
  onBack,
}: {
  themeMode: ThemeMode;
  languageLabel: string;
  language: AppLanguage;
  isGuest: boolean;
  isSyncing: boolean;
  syncError: string;
  sessions: StoredSession[];
  currentStreak: number;
  longestStreak: number;
  textSize: TextSizeOption;
  arabicFont: ArabicFontOption;
  showTranslation: boolean;
  showTransliteration: boolean;
  highContrast: boolean;
  boldText: boolean;
  reduceMotion: boolean;
  hapticFeedback: boolean;
  forceRtl: boolean;
  colorBlindSupport: ColorBlindSupport;
  reminders: ReminderSettings;
  weeklyGoalDays: number;
  onLanguageChange: (value: AppLanguage) => void;
  onThemeModeChange: (value: ThemeMode) => void;
  onTextSizeChange: (value: TextSizeOption) => void;
  onArabicFontChange: (value: ArabicFontOption) => void;
  onShowTranslationChange: (value: boolean) => void;
  onShowTransliterationChange: (value: boolean) => void;
  onHighContrastChange: (value: boolean) => void;
  onBoldTextChange: (value: boolean) => void;
  onReduceMotionChange: (value: boolean) => void;
  onHapticFeedbackChange: (value: boolean) => void;
  onForceRtlChange: (value: boolean) => void;
  onColorBlindSupportChange: (value: ColorBlindSupport) => void;
  onRemindersChange: (value: ReminderSettings) => void;
  onWeeklyGoalDaysChange: (value: number) => void;
  onActivateAccount: () => void;
  onSignOut: () => void;
  onBack: () => void;
}) {
  const [sub, setSub] = useState<SettingsSubScreen>("root");
  const goBack = () => setSub("root");

  return (
    <div className="relative flex h-full flex-col overflow-hidden bg-background">
      {sub === "root" && (
        <motion.div className="absolute inset-0 flex h-full w-full flex-col">
          <Header title={t(language, "common.settings")} onBack={onBack} />
          <SettingsRootPanel
            onNav={setSub}
            language={language}
            themeMode={themeMode}
            languageLabel={languageLabel}
            textSize={textSize}
            isGuest={isGuest}
            isSyncing={isSyncing}
            syncError={syncError}
            onThemeModeChange={onThemeModeChange}
            onActivateAccount={onActivateAccount}
            onSignOut={onSignOut}
          />
        </motion.div>
      )}
      {sub === "language" && (
        <LanguagePanel language={language} selectedLanguage={language} onChange={onLanguageChange} onBack={goBack} />
      )}
      {sub === "accessibility" && (
        <AccessibilityPanel
          language={language}
          textSize={textSize}
          arabicFont={arabicFont}
          showTranslation={showTranslation}
          showTransliteration={showTransliteration}
          highContrast={highContrast}
          boldText={boldText}
          reduceMotion={reduceMotion}
          hapticFeedback={hapticFeedback}
          forceRtl={forceRtl}
          colorBlindSupport={colorBlindSupport}
          onTextSizeChange={onTextSizeChange}
          onArabicFontChange={onArabicFontChange}
          onShowTranslationChange={onShowTranslationChange}
          onShowTransliterationChange={onShowTransliterationChange}
          onHighContrastChange={onHighContrastChange}
          onBoldTextChange={onBoldTextChange}
          onReduceMotionChange={onReduceMotionChange}
          onHapticFeedbackChange={onHapticFeedbackChange}
          onForceRtlChange={onForceRtlChange}
          onColorBlindSupportChange={onColorBlindSupportChange}
          onBack={goBack}
        />
      )}
      {sub === "downloads" && <DownloadsPanel language={language} onBack={goBack} />}
      {sub === "notifications" && (
        <NotificationsPanel
          language={language}
          reminders={reminders}
          onRemindersChange={onRemindersChange}
          onBack={goBack}
        />
      )}
      {sub === "progress" && (
        <ProgressPanel
          language={language}
          sessions={sessions}
          currentStreak={currentStreak}
          longestStreak={longestStreak}
          weeklyGoalDays={weeklyGoalDays}
          onWeeklyGoalDaysChange={onWeeklyGoalDaysChange}
          onBack={goBack}
        />
      )}
      {sub === "about" && <AboutPanel language={language} onBack={goBack} />}
    </div>
  );
}
