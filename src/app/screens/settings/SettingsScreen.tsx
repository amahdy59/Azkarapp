import { useState } from "react";
import { motion } from "motion/react";
import { Header } from "../../components/LayoutShells";
import { t } from "../../i18n";
import type {
  AppLanguage,
  ArabicFontOption,
  ColorBlindSupport,
  DailyCollectionCompletion,
  ReminderSettings,
  StoredSession,
  TextSizeOption,
  ThemeMode,
} from "../../types";
import {
  AboutPanel,
  AccessibilityPanel,
  AccountDataPanel,
  DownloadsPanel,
  HelpPanel,
  LegalPanel,
  NotificationsPanel,
  ProgressPanel,
  SettingsRootPanel,
  SourcesPanel,
  LanguagePanel,
  type SettingsSubScreen,
} from "./SettingsPanels";

interface SettingsScreenProps {
  themeMode: ThemeMode;
  language: AppLanguage;
  isGuest: boolean;
  isSyncing: boolean;
  syncError: string;
  sessions: StoredSession[];
  dailyCompletions: DailyCollectionCompletion[];
  savedCount: number;
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
  quietProgressEnabled: boolean;
  progressDayStartHour: number;
  direction: "ltr" | "rtl";
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
  onQuietProgressEnabledChange: (value: boolean) => void;
  onProgressDayStartHourChange: (value: number) => void;
  onActivateAccount: () => void;
  onSignOut: () => void;
  onExportData: () => void;
  onResetPreferences: () => void;
  onClearLocalData: () => void;
  onBack: () => void;
}

export function SettingsScreen({
  themeMode,
  language,
  isGuest,
  isSyncing,
  syncError,
  sessions,
  dailyCompletions,
  savedCount,
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
  quietProgressEnabled,
  progressDayStartHour,
  direction,
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
  onQuietProgressEnabledChange,
  onProgressDayStartHourChange,
  onActivateAccount,
  onSignOut,
  onExportData,
  onResetPreferences,
  onClearLocalData,
  onBack,
}: SettingsScreenProps) {
  const [sub, setSub] = useState<SettingsSubScreen>("root");
  const goBack = () => setSub("root");

  return (
    <div className="relative flex h-full flex-col overflow-hidden bg-background" dir={direction}>
      {sub === "root" && (
        <motion.div className="absolute inset-0 flex h-full w-full flex-col">
          <Header title={t(language, "common.settings")} onBack={onBack} language={language} />
          <SettingsRootPanel
            onNav={setSub}
            language={language}
            direction={direction}
            themeMode={themeMode}
            highContrast={highContrast}
            onThemeModeChange={onThemeModeChange}
            onDisableHighContrast={() => onHighContrastChange(false)}
            isGuest={isGuest}
            isSyncing={isSyncing}
            syncError={syncError}
            quietProgressEnabled={quietProgressEnabled}
          />
        </motion.div>
      )}
      {sub === "accessibility" && (
        <AccessibilityPanel
          language={language}
          direction={direction}
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
          direction={direction}
          sessions={sessions}
          dailyCompletions={dailyCompletions}
          quietProgressEnabled={quietProgressEnabled}
          progressDayStartHour={progressDayStartHour}
          weeklyGoalDays={weeklyGoalDays}
          onQuietProgressEnabledChange={onQuietProgressEnabledChange}
          onProgressDayStartHourChange={onProgressDayStartHourChange}
          onWeeklyGoalDaysChange={onWeeklyGoalDaysChange}
          onBack={goBack}
        />
      )}
      {sub === "account-data" && (
        <AccountDataPanel
          language={language}
          isGuest={isGuest}
          isSyncing={isSyncing}
          syncError={syncError}
          sessionCount={sessions.length}
          savedCount={savedCount}
          onActivateAccount={onActivateAccount}
          onSignOut={onSignOut}
          onExportData={onExportData}
          onResetPreferences={onResetPreferences}
          onClearLocalData={onClearLocalData}
          onBack={goBack}
        />
      )}
      {sub === "help" && <HelpPanel language={language} onBack={goBack} />}
      {sub === "legal" && <LegalPanel language={language} onBack={goBack} />}
      {sub === "sources" && <SourcesPanel language={language} onBack={goBack} />}
      {sub === "about" && (
        <AboutPanel
          language={language}
          onHelp={() => setSub("help")}
          onLegal={() => setSub("legal")}
          onSources={() => setSub("sources")}
          onBack={goBack}
        />
      )}
      {sub === "language" && (
        <LanguagePanel language={language} direction={direction} onLanguageChange={onLanguageChange} onBack={goBack} />
      )}
    </div>
  );
}
