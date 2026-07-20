import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
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

  const panelVariants = reduceMotion
    ? {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
        transition: { duration: 0.15 },
      }
    : {
        initial: { x: direction === "rtl" ? "-100%" : "100%", opacity: 0 },
        animate: { x: 0, opacity: 1 },
        exit: { x: direction === "rtl" ? "-100%" : "100%", opacity: 0 },
        transition: { type: "spring", stiffness: 380, damping: 33 },
      };

  const rootVariants = reduceMotion
    ? {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
        transition: { duration: 0.15 },
      }
    : {
        initial: { x: 0, opacity: 1 },
        animate: { x: 0, opacity: 1 },
        exit: { x: direction === "rtl" ? "30%" : "-30%", opacity: 0 },
        transition: { type: "tween", duration: 0.22, ease: "easeInOut" },
      };

  return (
    <div className="relative flex h-full flex-col overflow-hidden bg-background" dir={direction}>
      <AnimatePresence mode="wait" initial={false}>
        {sub === "root" && (
          <motion.div
            key="root"
            variants={rootVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="absolute inset-0 flex h-full w-full flex-col"
          >
            <Header title={t(language, "common.settings")} onBack={onBack} language={language} />
            <SettingsRootPanel
              onNav={setSub}
              language={language}
              direction={direction}
              themeMode={themeMode}
              highContrast={highContrast}
              onThemeModeChange={onThemeModeChange}
              onDisableHighContrast={() => onHighContrastChange(false)}
              onLanguageChange={onLanguageChange}
              isGuest={isGuest}
              isSyncing={isSyncing}
              syncError={syncError}
              quietProgressEnabled={quietProgressEnabled}
            />
          </motion.div>
        )}
        {sub === "accessibility" && (
          <motion.div
            key="accessibility"
            variants={panelVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="absolute inset-0 flex h-full w-full flex-col"
          >
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
          </motion.div>
        )}
        {sub === "downloads" && (
          <motion.div
            key="downloads"
            variants={panelVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="absolute inset-0 flex h-full w-full flex-col"
          >
            <DownloadsPanel language={language} onBack={goBack} />
          </motion.div>
        )}
        {sub === "notifications" && (
          <motion.div
            key="notifications"
            variants={panelVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="absolute inset-0 flex h-full w-full flex-col"
          >
            <NotificationsPanel
              language={language}
              reminders={reminders}
              onRemindersChange={onRemindersChange}
              onBack={goBack}
            />
          </motion.div>
        )}
        {sub === "progress" && (
          <motion.div
            key="progress"
            variants={panelVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="absolute inset-0 flex h-full w-full flex-col"
          >
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
          </motion.div>
        )}
        {sub === "account-data" && (
          <motion.div
            key="account-data"
            variants={panelVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="absolute inset-0 flex h-full w-full flex-col"
          >
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
          </motion.div>
        )}
        {sub === "help" && (
          <motion.div
            key="help"
            variants={panelVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="absolute inset-0 flex h-full w-full flex-col"
          >
            <HelpPanel language={language} onBack={goBack} />
          </motion.div>
        )}
        {sub === "legal" && (
          <motion.div
            key="legal"
            variants={panelVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="absolute inset-0 flex h-full w-full flex-col"
          >
            <LegalPanel language={language} onBack={goBack} />
          </motion.div>
        )}
        {sub === "sources" && (
          <motion.div
            key="sources"
            variants={panelVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="absolute inset-0 flex h-full w-full flex-col"
          >
            <SourcesPanel language={language} onBack={goBack} />
          </motion.div>
        )}
        {sub === "about" && (
          <motion.div
            key="about"
            variants={panelVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="absolute inset-0 flex h-full w-full flex-col"
          >
            <AboutPanel
              language={language}
              onHelp={() => setSub("help")}
              onLegal={() => setSub("legal")}
              onSources={() => setSub("sources")}
              onBack={goBack}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
