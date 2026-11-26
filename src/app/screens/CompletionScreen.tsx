import { useState, useEffect, lazy, Suspense, Fragment } from "react";
import "./CompletionScreen.css";
import { Check, ChevronNext, Home, Share2 } from "../components/icons";
import { Button } from "../components/ui/button";
import { CompletionReflectionCard } from "../components/CompletionReflectionCard";
import { GrowthEventStatus } from "../components/RoutineGarden";
import { CATEGORIES } from "../content/categories";
import { getAzkarForMode, getAzkarForPrayer, isRoutineCategory } from "../content/azkarCore";
import { getCompletionReflection } from "../completionReflection";
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

  return (
    <div
      className="completion-screen completion-screen-enter h-full overflow-y-auto bg-background px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-5 text-center"
      dir={direction}
      data-testid="completion-screen"
      data-reduce-motion={reduceMotion || undefined}
    >
      <div className="mx-auto flex w-full max-w-lg flex-col gap-5 pb-2 sm:gap-6 sm:pt-3">
        <p className="sr-only" role="status" aria-live="polite">
          {t(language, "completion.sessionComplete", { category: categoryName })}
        </p>

        <header>
          <div
            className="completion-check mx-auto mb-3 flex size-12 items-center justify-center rounded-full border-2 border-primary text-primary"
            aria-hidden="true"
          >
            <Check size={25} strokeWidth={2.5} />
          </div>
          <h1 className="break-words text-display font-extrabold leading-9 text-foreground">
            {t(language, "completion.mashaAllah")
              .split(/(?<=’)/u)
              .map((part, index) => (
                <Fragment key={index}>
                  {index > 0 && <wbr />}
                  {part}
                </Fragment>
              ))}
          </h1>
          <p className="mt-2 text-lg font-bold text-foreground">
            {t(language, "completion.completed", { category: categoryName })}
          </p>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">{t(language, "completion.acceptance")}</p>
        </header>

        <CompletionReflectionCard evidence={reflection} language={language} onExplore={onOpenBenefits} />

        <section aria-label={t(language, "completion.sessionSummary")} className="text-sm text-muted-foreground">
          <p className="font-semibold" data-testid="completion-count">
            {formatNumerals(azkar.length, language)} {t(language, "completion.completedAzkar")}
          </p>
          {quietProgressEnabled && categoryStreak > 0 && <p className="mt-1 leading-6">{streakMessage}</p>}
          {quietProgressEnabled && growthEvent?.kind === "palm" && (
            <GrowthEventStatus event={growthEvent} language={language} />
          )}
          <details className="completion-details mt-1">
            <summary className="mx-auto flex min-h-11 w-fit max-w-full cursor-pointer items-center justify-center gap-1 rounded-xl px-3 py-2 text-xs underline underline-offset-4 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring">
              {t(language, "completion.sessionDetails")}
              <ChevronNext size={16} className="completion-details-chevron shrink-0" aria-hidden="true" />
            </summary>
            <div className="mx-auto max-w-sm space-y-1 pt-1 text-xs leading-6" data-testid="completion-session-details">
              <p>{t(language, "completion.elapsed", { count: formatNumerals(elapsedMin, language) })}</p>
              <p>{t(language, "completion.elapsedHint")}</p>
              <p dir="auto">{formatHijriDate(completedAt, language)}</p>
            </div>
          </details>
        </section>

        <div className="grid gap-2.5" data-testid="completion-actions">
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
          <Button
            size="lg"
            variant="outline"
            onClick={(event) => {
              // Safari pointer clicks do not focus buttons automatically.
              // Give the dialog a real opener to restore on dismissal.
              event.currentTarget.focus({ preventScroll: true });
              setShareOpen(true);
            }}
            aria-haspopup="dialog"
            className="w-full"
          >
            <Share2 size={18} aria-hidden="true" />
            {t(language, "completion.shareCollection", { category: categoryName })}
          </Button>
          {onNewSession && (
            <Button size="lg" variant="ghost" onClick={onNewSession} className="w-full text-muted-foreground">
              {t(language, "completion.newSession")}
            </Button>
          )}
        </div>
      </div>
      {shareOpen && (
        <Suspense fallback={<p role="status">{t(language, "shareStoryPack.generating")}</p>}>
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
    </div>
  );
}
