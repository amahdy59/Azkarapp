import { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import { Header } from "../../components/LayoutShells";
import { t } from "../../i18n";
import { shouldReduceMotion } from "../../motionPreferences";
import { useLayoutMode } from "../../hooks/useLayoutMode";
import "./SettingsScreen.css";
import type {
  AppLanguage,
  ColorBlindSupport,
  DailyCollectionCompletion,
  LocationSettings,
  ReminderSettings,
  StoredSession,
  TextSizeOption,
  ZikrFontOption,
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
  WhatsNewPanel,
  type SettingsSubScreen,
} from "./SettingsPanels";

interface SettingsScreenProps {
  themeMode: ThemeMode;
  language: AppLanguage;
  isGuest: boolean;
  isSyncing: boolean;
  syncError: string;
  syncStatus: "offline" | "needs-attention" | "syncing" | "up-to-date";
  lastSuccessfulSyncAt: string;
  sessions: StoredSession[];
  dailyCompletions: DailyCollectionCompletion[];
  savedCount: number;
  textSize: TextSizeOption;
  showTranslation: boolean;
  showTransliteration: boolean;
  highContrast: boolean;
  boldText: boolean;
  reduceMotion: boolean;
  reduceTransparency: boolean;
  hapticFeedback: boolean;
  forceRtl: boolean;
  colorBlindSupport: ColorBlindSupport;
  reminders: ReminderSettings;
  locationSettings?: LocationSettings;
  weeklyGoalDays: number;
  quietProgressEnabled: boolean;
  progressDayStartHour: number;
  calendarType?: "hijri" | "gregorian";
  direction: "ltr" | "rtl";
  onLanguageChange: (value: AppLanguage) => void;
  onThemeModeChange: (value: ThemeMode) => void;
  onCalendarTypeChange?: (value: "hijri" | "gregorian") => void;
  zikrFont?: ZikrFontOption;
  onTextSizeChange: (value: TextSizeOption) => void;
  onZikrFontChange: (value: ZikrFontOption) => void;
  onShowTranslationChange: (value: boolean) => void;
  onShowTransliterationChange: (value: boolean) => void;
  onHighContrastChange: (value: boolean) => void;
  onBoldTextChange: (value: boolean) => void;
  onReduceMotionChange: (value: boolean) => void;
  onReduceTransparencyChange: (value: boolean) => void;
  onHapticFeedbackChange: (value: boolean) => void;
  onForceRtlChange: (value: boolean) => void;
  onColorBlindSupportChange: (value: ColorBlindSupport) => void;
  onRemindersChange: (value: ReminderSettings) => void;
  onLocationChange?: (value: LocationSettings) => void;
  onWeeklyGoalDaysChange: (value: number) => void;
  onQuietProgressEnabledChange: (value: boolean) => void;
  onActivateAccount: () => void;
  onSignOut: () => void;
  onExportData: () => void;
  onResetPreferences: () => void;
  onClearLocalData: () => void;
  onDeleteAccount: () => void;
}

export function SettingsScreen({
  themeMode,
  language,
  isGuest,
  isSyncing,
  syncError,
  syncStatus,
  lastSuccessfulSyncAt,
  sessions,
  dailyCompletions,
  savedCount,
  textSize,
  showTranslation,
  showTransliteration,
  highContrast,
  boldText,
  reduceMotion,
  reduceTransparency,
  hapticFeedback,
  forceRtl,
  colorBlindSupport,
  reminders,
  locationSettings,
  weeklyGoalDays,
  quietProgressEnabled,
  progressDayStartHour,
  calendarType = "hijri",
  direction,
  onLanguageChange,
  onThemeModeChange,
  onCalendarTypeChange,
  onTextSizeChange,
  zikrFont,
  onZikrFontChange,
  onShowTranslationChange,
  onShowTransliterationChange,
  onHighContrastChange,
  onBoldTextChange,
  onReduceMotionChange,
  onReduceTransparencyChange,
  onHapticFeedbackChange,
  onForceRtlChange,
  onColorBlindSupportChange,
  onRemindersChange,
  onLocationChange,
  onWeeklyGoalDaysChange,
  onQuietProgressEnabledChange,
  onActivateAccount,
  onSignOut,
  onExportData,
  onResetPreferences,
  onClearLocalData,
  onDeleteAccount,
}: SettingsScreenProps) {
  const [sub, setSub] = useState<SettingsSubScreen>("root");
  const focusReturnSub = useRef<SettingsSubScreen>("root");
  const goBack = () => {
    const returnSub = focusReturnSub.current;
    setSub("root");
    requestAnimationFrame(() => {
      document.querySelector<HTMLElement>(`[data-testid="settings-sub-${returnSub}"]`)?.focus();
    });
  };
  const layoutMode = useLayoutMode();
  const isTwoPaneLayout = layoutMode === "expanded" || layoutMode === "large";
  const motionReduced = shouldReduceMotion(reduceMotion);
  // On two-pane layout, auto-select accessibility panel if user hasn't chosen one
  const effectiveSub = isTwoPaneLayout && sub === "root" ? "accessibility" : sub;

  const openSubPanel = (next: SettingsSubScreen) => {
    focusReturnSub.current = next;
    setSub(next);
  };

  useEffect(() => {
    if (isTwoPaneLayout || sub === "root") return;
    const frame = requestAnimationFrame(() => {
      document.querySelector<HTMLElement>("[data-settings-subheading]")?.focus();
    });
    return () => cancelAnimationFrame(frame);
  }, [isTwoPaneLayout, sub]);

  const panelVariants = motionReduced
    ? {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
        transition: { duration: 0.1 },
      }
    : {
        initial: { x: direction === "rtl" ? "-100%" : "100%", opacity: 0 },
        animate: { x: 0, opacity: 1 },
        exit: { x: direction === "rtl" ? "-100%" : "100%", opacity: 0 },
        transition: { type: "tween", duration: 0.22, ease: [0.16, 1, 0.3, 1] },
      };

  const rootVariants = motionReduced
    ? {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
        transition: { duration: 0.1 },
      }
    : {
        initial: { x: 0, opacity: 1 },
        animate: { x: 0, opacity: 1 },
        exit: { x: direction === "rtl" ? "30%" : "-30%", opacity: 0 },
        transition: { type: "tween", duration: 0.22, ease: "easeInOut" },
      };

  return (
    <div
      className="relative mx-auto flex h-full w-full max-w-[80rem] flex-col overflow-hidden bg-background"
      dir={direction}
    >
      {isTwoPaneLayout ? (
        /* ── Two-pane layout (Expanded 900px+) ── */
        <div className="settings-two-pane h-full">
          {/* Left: category list */}
          <div className="settings-nav-pane">
            <Header title={t(language, "common.settings")} language={language} />
            <SettingsRootPanel
              onNav={openSubPanel}
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
              locationSettings={locationSettings}
              calendarType={calendarType}
              onCalendarTypeChange={onCalendarTypeChange}
              activeSub={effectiveSub}
            />
          </div>
          {/* Right: detail panel */}
          <div className="settings-detail-pane">
            <div className="settings-form-inner">{renderSubPanel(effectiveSub)}</div>
          </div>
        </div>
      ) : (
        /* ── Compact/medium: existing slide-in animation ── */
        <>
          {sub === "root" && (
            <motion.div
              key="root"
              variants={rootVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="absolute inset-0 flex h-full w-full flex-col"
            >
              <Header title={t(language, "common.settings")} language={language} />
              <SettingsRootPanel
                onNav={openSubPanel}
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
                locationSettings={locationSettings}
                calendarType={calendarType}
                onCalendarTypeChange={onCalendarTypeChange}
              />
            </motion.div>
          )}
          {sub !== "root" && (
            <motion.div
              key={sub}
              variants={panelVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="absolute inset-0 flex h-full w-full flex-col"
            >
              {renderSubPanel(sub)}
            </motion.div>
          )}
        </>
      )}
    </div>
  );

  function renderSubPanel(panel: SettingsSubScreen) {
    switch (panel) {
      case "accessibility":
        return (
          <AccessibilityPanel
            language={language}
            direction={direction}
            textSize={textSize}
            zikrFont={zikrFont}
            showTranslation={showTranslation}
            showTransliteration={showTransliteration}
            highContrast={highContrast}
            boldText={boldText}
            reduceMotion={reduceMotion}
            reduceTransparency={reduceTransparency}
            hapticFeedback={hapticFeedback}
            forceRtl={forceRtl}
            colorBlindSupport={colorBlindSupport}
            onTextSizeChange={onTextSizeChange}
            onZikrFontChange={onZikrFontChange}
            onShowTranslationChange={onShowTranslationChange}
            onShowTransliterationChange={onShowTransliterationChange}
            onHighContrastChange={onHighContrastChange}
            onBoldTextChange={onBoldTextChange}
            onReduceMotionChange={onReduceMotionChange}
            onReduceTransparencyChange={onReduceTransparencyChange}
            onHapticFeedbackChange={onHapticFeedbackChange}
            onForceRtlChange={onForceRtlChange}
            onColorBlindSupportChange={onColorBlindSupportChange}
            onBack={goBack}
          />
        );
      case "downloads":
        return <DownloadsPanel language={language} onBack={goBack} />;
      case "notifications":
        return (
          <NotificationsPanel
            language={language}
            reminders={reminders}
            locationSettings={locationSettings}
            onRemindersChange={onRemindersChange}
            onLocationChange={onLocationChange}
            onBack={goBack}
          />
        );
      case "progress":
        return (
          <ProgressPanel
            language={language}
            direction={direction}
            sessions={sessions}
            dailyCompletions={dailyCompletions}
            quietProgressEnabled={quietProgressEnabled}
            progressDayStartHour={progressDayStartHour}
            weeklyGoalDays={weeklyGoalDays}
            onQuietProgressEnabledChange={onQuietProgressEnabledChange}
            onWeeklyGoalDaysChange={onWeeklyGoalDaysChange}
            onBack={goBack}
          />
        );
      case "account-data":
        return (
          <AccountDataPanel
            language={language}
            isGuest={isGuest}
            isSyncing={isSyncing}
            syncError={syncError}
            syncStatus={syncStatus}
            lastSuccessfulSyncAt={lastSuccessfulSyncAt}
            sessionCount={sessions.length}
            savedCount={savedCount}
            onActivateAccount={onActivateAccount}
            onSignOut={onSignOut}
            onExportData={onExportData}
            onResetPreferences={onResetPreferences}
            onClearLocalData={onClearLocalData}
            onDeleteAccount={onDeleteAccount}
            onBack={goBack}
          />
        );
      case "help":
        return <HelpPanel language={language} onBack={goBack} />;
      case "legal":
        return <LegalPanel language={language} onBack={goBack} />;
      case "sources":
        return <SourcesPanel language={language} onBack={goBack} />;
      case "whats-new":
        return <WhatsNewPanel language={language} onBack={goBack} />;
      case "about":
        return (
          <AboutPanel
            language={language}
            onHelp={() => setSub("help")}
            onLegal={() => setSub("legal")}
            onSources={() => setSub("sources")}
            onWhatsNew={() => setSub("whats-new")}
            onBack={goBack}
          />
        );
      default:
        return null;
    }
  }
}
