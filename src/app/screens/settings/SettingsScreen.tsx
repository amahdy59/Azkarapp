import { displayLocationName } from "../../content/prayerLocations";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Header } from "../../components/LayoutShells";
import { t } from "../../i18n";
import { shouldReduceMotion } from "../../motionPreferences";
import { useLayoutMode } from "../../hooks/useLayoutMode";
import { useScreenFocus } from "../../hooks/useScreenFocus";
import "./SettingsScreen.css";
import type { SettingsScreenProps } from "./SettingsScreen.types";
import {
  AppearancePanel,
  PrayerSettingsPanel,
  AboutPanel,
  AccessibilityPanel,
  AccountDataPanel,
  AudioSettingsPanel,
  DownloadsPanel,
  HelpPanel,
  LegalPanel,
  NotificationsPanel,
  PrayerLocationPanel,
  ProgressPanel,
  ReadingPanel,
  SettingsRootPanel,
  SourcesPanel,
  WhatsNewPanel,
  type SettingsSubScreen,
} from "./SettingsPanels";

export function SettingsScreen({
  onReviewUpdate,
  audioController,
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
  readerToolLabels = true,
  onReaderToolLabelsChange,
  highContrast,
  boldText,
  reduceMotion,
  reduceTransparency,
  homeWirdImages = false,
  appMaterial = "solid",
  onAppMaterialChange,
  homeMaterial = "inherit",
  onHomeMaterialChange,
  onHomeWirdImagesChange,
  hapticFeedback,
  forceRtl,
  colorBlindSupport,
  reminders,
  locationSettings,
  weeklyGoalDays,
  quietProgressEnabled,
  progressDayStartHour,
  calendarType = "hijri",
  hijriDateOffset = 0,
  direction,
  onLanguageChange,
  onThemeModeChange,
  onCalendarTypeChange,
  onHijriDateOffsetChange,
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
  onRestoreData,
  onResetPreferences,
  onClearLocalData,
  onDeleteAccount,
  initialSub,
  onSubChange,
  onSubBack,
}: SettingsScreenProps) {
  useScreenFocus(t(language, "common.settings"));
  const [sub, setSub] = useState<SettingsSubScreen>(
    () => initialSub ?? (new URLSearchParams(window.location.search).has("pair") ? "account-data" : "root"),
  );
  const focusReturnSub = useRef<SettingsSubScreen>("root");
  const [returnFocusSub, setReturnFocusSub] = useState<SettingsSubScreen>();
  const goBack = () => {
    const returnSub = focusReturnSub.current;
    const parent: SettingsSubScreen =
      sub === "location" || sub === "notifications" ? "prayer" : sub === "downloads" ? "audio" : "root";
    setSub(parent);
    setReturnFocusSub(returnSub);
    onSubBack?.();
  };
  const layoutMode = useLayoutMode();
  const isTwoPaneLayout = layoutMode === "expanded" || layoutMode === "large";
  const motionReduced = shouldReduceMotion(reduceMotion);
  // The same first category is selected by default on wide layouts.
  const effectiveSub = isTwoPaneLayout && sub === "root" ? "appearance" : sub;
  const rootFocusSub =
    returnFocusSub === "location" || returnFocusSub === "notifications"
      ? "prayer"
      : returnFocusSub === "downloads"
        ? "audio"
        : returnFocusSub;

  const openSubPanel = (next: SettingsSubScreen) => {
    setReturnFocusSub(undefined);
    focusReturnSub.current = next;
    setSub(next);
    onSubChange?.(next);
    if (next === effectiveSub) {
      // The desktop default panel is already mounted, so its mount effect
      // cannot transfer focus when its navigation row is explicitly chosen.
      requestAnimationFrame(() => {
        document.querySelector<HTMLElement>("[data-settings-subheading]")?.focus();
      });
    }
  };

  useEffect(() => {
    if (initialSub) setSub(initialSub);
  }, [initialSub]);

  const forwardOffset = direction === "rtl" ? -28 : 28;

  const panelVariants = motionReduced
    ? {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
        transition: { duration: 0.1 },
      }
    : {
        initial: { x: forwardOffset, opacity: 0 },
        animate: { x: 0, opacity: 1 },
        exit: { x: -forwardOffset, opacity: 0 },
        transition: { duration: 0.22, ease: [0.22, 1, 0.36, 1] },
      };

  const rootVariants = motionReduced
    ? {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
        transition: { duration: 0.1 },
      }
    : {
        initial: { x: -forwardOffset, opacity: 0 },
        animate: { x: 0, opacity: 1 },
        exit: { x: forwardOffset, opacity: 0 },
        transition: { duration: 0.22, ease: [0.22, 1, 0.36, 1] },
      };

  return (
    <div
      data-testid="settings-screen"
      className="relative mx-auto flex h-full w-full max-w-[80rem] flex-col overflow-hidden bg-background"
      dir={direction}
    >
      {isTwoPaneLayout ? (
        /* ── Two-pane layout (Expanded 900px+) ── */
        <div className="settings-two-pane h-full">
          {/* Left: category list */}
          <div className="settings-nav-pane">
            <Header title={t(language, "common.settings")} language={language} pageGutters />
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
              hijriDateOffset={hijriDateOffset}
              onHijriDateOffsetChange={onHijriDateOffsetChange}
              textSize={textSize}
              zikrFont={zikrFont}
              activeSub={
                effectiveSub === "location" || effectiveSub === "notifications"
                  ? "prayer"
                  : effectiveSub === "downloads"
                    ? "audio"
                    : effectiveSub
              }
              focusOnMount={rootFocusSub}
            />
          </div>
          {/* Right: detail panel */}
          <div className="settings-detail-pane">
            <div className="settings-form-inner">{renderSubPanel(effectiveSub)}</div>
          </div>
        </div>
      ) : (
        /* ── Compact/medium: smooth transition ── */
        <AnimatePresence mode="wait" initial={false}>
          {sub === "root" ? (
            <motion.div
              key="root"
              variants={rootVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="absolute inset-0 flex h-full w-full flex-col"
            >
              <Header title={t(language, "common.settings")} language={language} pageGutters />
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
                hijriDateOffset={hijriDateOffset}
                onHijriDateOffsetChange={onHijriDateOffsetChange}
                textSize={textSize}
                zikrFont={zikrFont}
                focusOnMount={rootFocusSub}
              />
            </motion.div>
          ) : (
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
        </AnimatePresence>
      )}
    </div>
  );

  function renderSubPanel(panel: SettingsSubScreen) {
    switch (panel) {
      case "appearance":
        return (
          <AppearancePanel
            appMaterial={appMaterial}
            onAppMaterialChange={onAppMaterialChange}
            homeMaterial={homeMaterial}
            onHomeMaterialChange={onHomeMaterialChange}
            homeWirdImages={homeWirdImages}
            onHomeWirdImagesChange={onHomeWirdImagesChange}
            reduceTransparency={reduceTransparency}
            onReduceTransparencyChange={onReduceTransparencyChange}
            language={language}
            direction={direction}
            themeMode={themeMode}
            highContrast={highContrast}
            onThemeModeChange={onThemeModeChange}
            onDisableHighContrast={() => onHighContrastChange(false)}
            onLanguageChange={onLanguageChange}
            calendarType={calendarType}
            onCalendarTypeChange={onCalendarTypeChange}
            hijriDateOffset={hijriDateOffset}
            onHijriDateOffsetChange={onHijriDateOffsetChange}
            onBack={goBack}
          />
        );
      case "prayer":
        return (
          <PrayerSettingsPanel
            language={language}
            cityName={displayLocationName(locationSettings, language)}
            focusOnMount={
              returnFocusSub === "location" || returnFocusSub === "notifications" ? returnFocusSub : undefined
            }
            onNav={openSubPanel}
            onBack={goBack}
          />
        );
      case "audio":
        return (
          <AudioSettingsPanel
            language={language}
            direction={direction}
            controller={audioController}
            onBack={goBack}
            onOpenDownloads={() => openSubPanel("downloads")}
            focusOnMount={returnFocusSub === "downloads"}
          />
        );
      case "reading":
        return (
          <ReadingPanel
            language={language}
            direction={direction}
            textSize={textSize}
            zikrFont={zikrFont}
            showTranslation={showTranslation}
            showTransliteration={showTransliteration}
            readerToolLabels={readerToolLabels}
            onReaderToolLabelsChange={onReaderToolLabelsChange}
            onTextSizeChange={onTextSizeChange}
            onZikrFontChange={onZikrFontChange}
            onShowTranslationChange={onShowTranslationChange}
            onShowTransliterationChange={onShowTransliterationChange}
            onBack={goBack}
          />
        );
      case "accessibility":
        return (
          <AccessibilityPanel
            language={language}
            direction={direction}
            highContrast={highContrast}
            boldText={boldText}
            reduceMotion={reduceMotion}
            reduceTransparency={reduceTransparency}
            hapticFeedback={hapticFeedback}
            forceRtl={forceRtl}
            colorBlindSupport={colorBlindSupport}
            onHighContrastChange={onHighContrastChange}
            onBoldTextChange={onBoldTextChange}
            onReduceMotionChange={onReduceMotionChange}
            onReduceTransparencyChange={onReduceTransparencyChange}
            onHapticFeedbackChange={onHapticFeedbackChange}
            onForceRtlChange={onForceRtlChange}
            onColorBlindSupportChange={onColorBlindSupportChange}
            onBack={goBack}
            onOpenReading={() => openSubPanel("reading")}
          />
        );
      case "downloads":
        return <DownloadsPanel language={language} direction={direction} onBack={goBack} />;
      case "location":
        return (
          <PrayerLocationPanel
            language={language}
            locationSettings={locationSettings}
            onLocationChange={onLocationChange}
            onBack={goBack}
          />
        );
      case "notifications":
        return (
          <NotificationsPanel
            language={language}
            reminders={reminders}
            onRemindersChange={onRemindersChange}
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
            onRestoreData={onRestoreData}
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
            onReviewUpdate={onReviewUpdate}
            language={language}
            onHelp={() => openSubPanel("help")}
            onLegal={() => openSubPanel("legal")}
            onSources={() => openSubPanel("sources")}
            onWhatsNew={() => openSubPanel("whats-new")}
            onBack={goBack}
          />
        );
      default:
        return null;
    }
  }
}
