import { useState, useEffect, lazy, Suspense } from "react";
import "./CompletionScreen.css";
import { Check, Home, Info, RotateCcw, Share2, X } from "../components/icons";
import { Button } from "../components/ui/button";
import { Modal, SheetHeader } from "../components/ResponsiveSheet";
import { CompletionReflectionCard } from "../components/CompletionReflectionCard";
import { GrowthEventStatus } from "../components/RoutineGarden";
import { CATEGORIES } from "../content/categories";
import { getAzkarForMode, getAzkarForPrayer, isRoutineCategory } from "../content/azkarCore";
import { getCompletionReflection } from "../completionReflection";
import { useMediaQuery } from "../hooks/useMediaQuery";
import { formatHijriDate, formatNumerals } from "../formatting";
import { t } from "../i18n";
import { vibrateIfEnabled } from "../motionPreferences";
import { getCategoryStreak, type GrowthEvent } from "../progress";
import type { AppLanguage, CategoryId, DailyCollectionCompletion, PrayerName, RoutineMode, ThemeMode } from "../types";

const CollectionShareModal = lazy(() =>
  import("../components/CollectionShareModal").then((module) => ({ default: module.CollectionShareModal })),
);

export function CompletionScreen({
  catId,
  sessionStart,
  completedAt: sessionCompletedAt,
  dailyCompletions,
  growthEvent,
  quietProgressEnabled,
  progressDayStartHour,
  onHome,
  language,
  direction,
  completionLevel = "complete",
  onContinueComplete,
  onNewSession,
  onOpenBenefits,
  prayer,
  themeMode,
  reduceMotion = false,
  hapticFeedback = true,
}: {
  catId: CategoryId;
  sessionStart: number;
  completedAt?: number;
  dailyCompletions: DailyCollectionCompletion[];
  growthEvent: GrowthEvent | null;
  quietProgressEnabled: boolean;
  progressDayStartHour: number;
  onHome: () => void;
  language: AppLanguage;
  direction: "ltr" | "rtl";
  completionLevel?: RoutineMode;
  onContinueComplete?: () => void;
  onNewSession?: () => void;
  onOpenBenefits?: () => void;
  prayer?: PrayerName;
  themeMode?: ThemeMode;
  reduceMotion?: boolean;
  hapticFeedback?: boolean;
}) {
  const cat = CATEGORIES.find((item) => item.id === catId)!;
  const azkar =
    catId === "after_prayer" && prayer
      ? getAzkarForPrayer(prayer, completionLevel)
      : getAzkarForMode(catId, completionLevel);
  // Freeze the finished session's metadata. Opening details/sharing must not add
  // time to a session that has already ended.
  const [completedAt] = useState(() => new Date(sessionCompletedAt ?? Date.now()));
  const elapsedMin = Math.max(1, Math.round((completedAt.getTime() - sessionStart) / 60_000));
  const isArabic = language === "ar";
  const [shareOpen, setShareOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const isDesktop = useMediaQuery("(min-width: 900px)");

  useEffect(() => {
    // Haptics remain independent from the still alternative for visual motion.
    vibrateIfEnabled(hapticFeedback, [30, 50, 30, 50, 50]);
  }, [catId, hapticFeedback]);

  const categoryName = isArabic ? cat.nameArabic : cat.name;
  const categoryStreak = getCategoryStreak(dailyCompletions, catId, completedAt, progressDayStartHour);
  const streakMessage = t(
    language,
    categoryStreak === 1
      ? "completion.categoryStreakOne"
      : categoryStreak === 2
        ? "completion.categoryStreakTwo"
        : "completion.categoryStreakMany",
    { category: categoryName, count: formatNumerals(categoryStreak, language) },
  );
  const canContinue = isRoutineCategory(catId) && completionLevel === "core" && Boolean(onContinueComplete);
  const reflection = getCompletionReflection(sessionStart);

  const completionContent = (
    <div
      className={`completion-screen completion-screen-enter bg-background text-center ${isDesktop ? "completion-screen--dialog" : ""}`}
      dir={direction}
      data-testid="completion-screen"
      data-reduce-motion={reduceMotion || undefined}
    >
      <div className="completion-layout mx-auto w-full max-w-lg">
        {!isDesktop && (
          <p className="sr-only" role="status" aria-live="polite">
            {t(language, "completion.sessionComplete", { category: categoryName })}
          </p>
        )}

        <header className="completion-header">
          {!isDesktop && (
            <div
              className="completion-check mx-auto mb-7 flex size-14 items-center justify-center rounded-full border-2 border-primary text-primary"
              aria-hidden="true"
            >
              <Check size={28} strokeWidth={2.5} />
            </div>
          )}
          <p
            className="completion-greeting flex flex-wrap items-baseline justify-center gap-x-3 gap-y-2 text-lg leading-8 text-foreground"
            data-testid="completion-greeting"
            lang={language}
          >
            <span className="min-w-0 max-w-full break-words">{t(language, "completion.blessing")}</span>
            <span className="completion-greeting-separator text-primary" aria-hidden="true">
              ·
            </span>
            <span className="min-w-0 max-w-full break-words">{t(language, "completion.acceptance")}</span>
          </p>
          <h1 className="mt-4 break-words text-xl font-bold leading-8 text-foreground">
            {t(language, "completion.completed", { category: categoryName })}
          </h1>
        </header>

        <CompletionReflectionCard evidence={reflection} language={language} onExplore={onOpenBenefits} />

        <footer className="completion-actions grid gap-3" data-testid="completion-actions">
          {canContinue && (
            <Button size="lg" onClick={onContinueComplete} className="w-full">
              {t(language, "category.continueAdditional", {
                count: formatNumerals(
                  (catId === "after_prayer" && prayer
                    ? getAzkarForPrayer(prayer, "complete")
                    : getAzkarForMode(catId, "complete")
                  ).filter((zikr) => !zikr.includedInCore).length,
                  language,
                ),
              })}
            </Button>
          )}
          <Button size="lg" variant={canContinue ? "outline" : "default"} onClick={onHome} className="w-full">
            <Home size={18} aria-hidden="true" />{" "}
            {t(language, onNewSession ? "completion.done" : "completion.returnHome")}
          </Button>
          <div className="completion-secondary-actions grid grid-cols-2 gap-2" data-has-restart={Boolean(onNewSession)}>
            <Button
              variant="ghost"
              onClick={(event) => {
                // Safari pointer clicks do not focus buttons automatically.
                // Give the dialog a real opener to restore on dismissal.
                event.currentTarget.focus({ preventScroll: true });
                setShareOpen(true);
              }}
              aria-haspopup="dialog"
              aria-label={t(language, "completion.shareCollection", { category: categoryName })}
              className="completion-secondary-action w-full text-xs text-muted-foreground"
            >
              <Share2 size={18} aria-hidden="true" />
              <span>{t(language, "completion.shareAzkar")}</span>
            </Button>
            <Button
              variant="ghost"
              onClick={(event) => {
                event.currentTarget.focus({ preventScroll: true });
                setDetailsOpen(true);
              }}
              aria-haspopup="dialog"
              className="completion-secondary-action w-full text-xs text-muted-foreground"
            >
              <Info size={18} aria-hidden="true" />
              <span>{t(language, "completion.sessionDetails")}</span>
            </Button>
            {onNewSession && (
              <Button
                variant="ghost"
                onClick={onNewSession}
                className="completion-secondary-action w-full text-xs text-muted-foreground"
              >
                <RotateCcw size={18} aria-hidden="true" />
                <span>{t(language, "completion.newSession")}</span>
              </Button>
            )}
          </div>
        </footer>
      </div>
    </div>
  );

  return (
    <>
      {isDesktop ? (
        <Modal
          open
          onClose={onHome}
          title={t(language, "completion.sessionComplete", { category: categoryName })}
          language={language}
          direction={direction}
          protectedSurface
          showCloseButton={false}
          maxWidthClassName="max-w-xl"
          className="completion-dialog"
          testId="completion-desktop-dialog"
        >
          <div
            className="completion-dialog-toolbar grid shrink-0 grid-cols-[3.5rem_minmax(0,1fr)_3.5rem] items-center gap-3 px-3 pt-4 pb-3"
            data-testid="completion-dialog-toolbar"
          >
            <div
              className="completion-check col-start-2 mx-auto flex size-14 items-center justify-center rounded-full border-2 border-primary text-primary"
              aria-hidden="true"
            >
              <Check size={28} strokeWidth={2.5} />
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="size-12 border border-border/60 bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground"
              onClick={onHome}
              aria-label={t(language, "common.close")}
            >
              <X size={20} aria-hidden="true" />
            </Button>
          </div>
          {completionContent}
        </Modal>
      ) : (
        completionContent
      )}
      <Modal
        open={detailsOpen}
        onClose={() => setDetailsOpen(false)}
        title={t(language, "completion.sessionDetails")}
        language={language}
        direction={direction}
        protectedSurface
        showCloseButton={false}
        maxWidthClassName="max-w-md"
      >
        <SheetHeader
          title={t(language, "completion.sessionDetails")}
          language={language}
          onClose={() => setDetailsOpen(false)}
        />
        <div
          className="min-h-0 overflow-y-auto px-5 pb-5 pt-4 text-start text-sm leading-7"
          data-testid="completion-session-details"
        >
          <p>{t(language, "completion.elapsed", { count: formatNumerals(elapsedMin, language) })}</p>
          <p className="mt-1 text-muted-foreground">{t(language, "completion.elapsedHint")}</p>
          <p className="mt-2" dir="auto">
            {formatHijriDate(completedAt, language)}
          </p>
          {quietProgressEnabled && categoryStreak > 0 && (
            <p className="mt-3" data-testid="completion-streak">
              {streakMessage}
            </p>
          )}
          {quietProgressEnabled && growthEvent?.kind === "palm" && (
            <GrowthEventStatus event={growthEvent} language={language} />
          )}
        </div>
      </Modal>
      {shareOpen && (
        <Suspense
          fallback={
            <p className="sr-only" role="status">
              {t(language, "shareStoryPack.generating")}
            </p>
          }
        >
          <CollectionShareModal
            open
            initialFormat="square"
            initialScope="all"
            contentAlignment="balanced"
            onClose={() => setShareOpen(false)}
            dialogTitle={t(language, "completion.shareCollection", { category: categoryName })}
            dialogDescription={t(language, "completion.shareCollectionHint")}
            collectionTitle={categoryName}
            collectionTitleArabic={cat.nameArabic}
            collectionTitleEnglish={cat.name}
            categoryId={catId}
            routineMode={completionLevel}
            prayer={prayer}
            items={azkar}
            language={language}
            themeMode={themeMode}
          />
        </Suspense>
      )}
    </>
  );
}
