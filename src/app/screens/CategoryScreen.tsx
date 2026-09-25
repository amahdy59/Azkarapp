/* eslint-disable jsx-a11y/no-noninteractive-tabindex */
import { useState } from "react";
import { ArrowNext, Check, ChevronDown, RefreshCw, RotateCcw, SlidersHorizontal, Volume2 } from "../components/icons";
import { t } from "../i18n";
import "../../styles/animations/ZikrAnimations.css";
import { CATEGORIES } from "../content/categories";
import {
  getAzkarByCategory,
  getAzkarForMode,
  getAzkarForPrayer,
  getCollectionIntroduction,
  getRoutineStepCount,
  isRoutineCategory,
} from "../content/azkar";
import type { CategoryId, RitualGroupId, RoutineMode, Zikr } from "../types";
import { Header } from "../components/LayoutShells";
import { ProgressBar } from "../components/ProgressBar";
import { formatNumerals, numeralFontFamily } from "../formatting";
import { ScreenContainer } from "../components/ScreenContainer";
import { AzkarListLayout } from "../components/AzkarListLayout";
import { AzkarListItem } from "../components/AzkarListItem";
import { isPrayerName } from "../content/prayerTimes";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";

export function CategoryScreen({
  catId,
  subCategory,
  completed,
  isArabic,
  direction,
  onZikr,
  onToggleZikr,
  onReset,
  onRepeat,
  onBack,
  onPlayAllAudio,
  audioCoverage,
  routineMode = "complete",
  onRoutineModeChange,
}: {
  catId: CategoryId;
  subCategory?: string;
  completed: Set<string>;
  isArabic: boolean;
  direction: "ltr" | "rtl";
  onZikr: (i: number) => void;
  onToggleZikr?: (i: number) => void;
  onReset: () => void;
  onRepeat: () => void;
  onBack: () => void;
  onPlayAllAudio?: () => void;
  audioCoverage?: { available: number; unavailable: number; total: number };
  routineMode?: RoutineMode;
  onRoutineModeChange?: (mode: RoutineMode) => void;
}) {
  const isMainRoutine = isRoutineCategory(catId);
  const prayer = catId === "after_prayer" && isPrayerName(subCategory) ? subCategory : undefined;
  const allAzkar = prayer ? getAzkarForPrayer(prayer, "complete") : getAzkarByCategory(catId);
  const azkar = prayer
    ? getAzkarForPrayer(prayer, isMainRoutine ? routineMode : "complete")
    : getAzkarForMode(catId, isMainRoutine ? routineMode : "complete");
  const introduction = getCollectionIntroduction(catId);
  const cat = CATEGORIES.find((c) => c.id === catId)!;
  const completedItemCount = azkar.filter((zikr) => completed.has(zikr.id)).length;
  const resumeIdx = azkar.findIndex((zikr) => !completed.has(zikr.id));
  const language = isArabic ? "ar" : "en";
  const [preparationSteps, setPreparationSteps] = useState<Set<string>>(() => new Set());
  const orderedAzkar = azkar.map((z, i) => ({ z, index: i }));

  const stepProgress = (items: typeof orderedAzkar) => {
    const rituals = new Map<RitualGroupId, typeof orderedAzkar>();
    const standalone = items.filter((item) => {
      if (!item.z.ritualGroupId) return true;
      const ritualItems = rituals.get(item.z.ritualGroupId) ?? [];
      ritualItems.push(item);
      rituals.set(item.z.ritualGroupId, ritualItems);
      return false;
    });
    return {
      total: standalone.length + rituals.size,
      done:
        standalone.filter(({ z }) => completed.has(z.id)).length +
        [...rituals.values()].filter((ritualItems) => ritualItems.every(({ z }) => completed.has(z.id))).length,
    };
  };

  const headerProgress =
    isMainRoutine && routineMode === "core"
      ? stepProgress(orderedAzkar)
      : { done: completedItemCount, total: azkar.length };

  const renderZikrCard = ({ z, index }: { z: Zikr; index: number }, isCardCompleted: boolean) => {
    return (
      <AzkarListItem
        key={z.id}
        z={z}
        index={index}
        isCardCompleted={isCardCompleted}
        language={language}
        isArabic={isArabic}
        direction={direction}
        onClickText={onZikr}
        onToggleZikr={onToggleZikr}
      />
    );
  };

  return (
    <ScreenContainer dir={direction} className="relative" screenName={isArabic ? cat.nameArabic : cat.name}>
      <div
        className="relative z-10 mx-auto flex min-h-0 w-full max-w-[var(--content-form)] flex-1 flex-col"
        data-testid="category-overview"
      >
        <Header
          title={
            catId === "after_prayer" && prayer
              ? isArabic
                ? `أذكار بعد ${t(language, `notifications.${prayer}`)}`
                : `After ${t(language, `notifications.${prayer}`)}`
              : isArabic
                ? cat.nameArabic
                : cat.name
          }
          onBack={onBack}
          language={language}
        />

        <div className="shrink-0 border-b border-border px-5 py-4">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-label font-bold text-muted-foreground">{t(language, "category.dailyProgress")}</p>
            <p
              className="text-label font-bold text-muted-foreground"
              dir="auto"
              style={{ fontFamily: numeralFontFamily(language), fontVariantNumeric: "tabular-nums lining-nums" }}
            >
              {t(language, "category.counterProgress", {
                current: formatNumerals(headerProgress.done, language),
                total: formatNumerals(headerProgress.total, language),
              })}
            </p>
          </div>
          <ProgressBar
            value={headerProgress.done}
            max={headerProgress.total}
            height={8}
            trackColor="var(--card)"
            fillColor="var(--primary)"
            direction={direction}
            aria-label={t(language, "category.dailyProgress")}
          />

          {isMainRoutine && routineMode === "core" && completedItemCount === azkar.length && (
            <button
              type="button"
              onClick={() => onRoutineModeChange?.("complete")}
              className="mt-4 flex min-h-12 w-full items-center justify-between rounded-2xl border border-success/30 bg-success/10 px-4 text-start text-success focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring dark:text-success"
            >
              <span className="font-extrabold">{t(language, "category.coreCompleted")}</span>
              <span className="text-xs font-bold">
                {t(language, "category.continueAdditional", {
                  count: formatNumerals(allAzkar.filter((zikr) => !zikr.includedInCore).length, language),
                })}
              </span>
            </button>
          )}

          <div className="mt-4 flex w-full flex-wrap items-center gap-3">
            {isMainRoutine && (
              <DropdownMenu dir={direction}>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    data-testid="routine-mode-filter"
                    className="interactive-elem order-2 flex h-11 shrink-0 items-center justify-center gap-2 rounded-btn border border-border bg-card px-3 text-label font-extrabold text-foreground shadow-xs focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring"
                    aria-label={`${t(language, "category.routineLength")}: ${t(language, routineMode === "core" ? "category.core" : "category.complete")}`}
                  >
                    <SlidersHorizontal size={17} aria-hidden="true" />
                    <span>{t(language, routineMode === "core" ? "category.core" : "category.complete")}</span>
                    <ChevronDown size={15} aria-hidden="true" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="min-w-[14rem]">
                  <DropdownMenuLabel className="px-3 py-2 text-xs font-black text-muted-foreground">
                    {t(language, "category.routineLength")}
                  </DropdownMenuLabel>
                  <DropdownMenuRadioGroup
                    value={routineMode}
                    onValueChange={(mode) => onRoutineModeChange?.(mode as RoutineMode)}
                  >
                    {(["complete", "core"] as const).map((mode) => (
                      <DropdownMenuRadioItem key={mode} value={mode} className="font-bold">
                        {t(language, mode === "core" ? "category.coreSummary" : "category.completeSummary", {
                          count: formatNumerals(
                            mode === "core" ? getRoutineStepCount(catId, "core", prayer) : allAzkar.length,
                            language,
                          ),
                        })}
                      </DropdownMenuRadioItem>
                    ))}
                  </DropdownMenuRadioGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {completedItemCount < azkar.length ? (
              <>
                <button
                  type="button"
                  data-testid="start-session-button"
                  onClick={() => onZikr(Math.max(0, resumeIdx))}
                  className="interactive-elem order-1 flex h-11 flex-1 min-w-[140px] items-center justify-center gap-2 rounded-btn bg-primary text-subtitle font-bold text-primary-foreground shadow-sm focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring"
                >
                  <span className="leading-none">
                    {completedItemCount === 0 ? t(language, "category.startSession") : t(language, "common.continue")}
                  </span>
                  <ArrowNext size={18} data-rtl-flip aria-hidden="true" className="shrink-0" />
                </button>
                {onPlayAllAudio && (
                  <button
                    type="button"
                    onClick={onPlayAllAudio}
                    className="order-4 flex h-11 items-center justify-center gap-1.5 rounded-btn border border-primary/30 bg-primary/10 px-3.5 text-label font-bold text-primary shadow-xs transition-[color,background-color,border-color,box-shadow,transform] hover:bg-primary/20 active:scale-95 dark:text-primary"
                    aria-label={t(language, "category.playAllAudio")}
                    title={
                      audioCoverage
                        ? `${t(language, "category.playAllAudio")}: ${audioCoverage.available}/${audioCoverage.total}`
                        : t(language, "category.playAllAudio")
                    }
                  >
                    <Volume2 size={16} />
                    <span>
                      {t(language, "category.playAll")}
                      {audioCoverage
                        ? ` · ${formatNumerals(audioCoverage.available, language)}/${formatNumerals(audioCoverage.total, language)}`
                        : ""}
                    </span>
                  </button>
                )}
                {completedItemCount > 0 && (
                  <button
                    type="button"
                    onClick={onReset}
                    className="interactive-elem order-3 flex h-11 w-11 shrink-0 items-center justify-center rounded-btn border border-destructive/40 bg-destructive/10 text-destructive hover:bg-destructive/15 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-destructive"
                    aria-label={t(language, "category.resetProgress")}
                  >
                    <RotateCcw size={18} />
                  </button>
                )}
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={onRepeat}
                  className="interactive-elem order-1 flex h-11 flex-1 items-center justify-center gap-2 rounded-btn border border-primary/40 bg-primary/10 text-primary focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring"
                >
                  {isArabic ? (
                    <>
                      <span className="text-subtitle font-bold leading-none">{t(language, "category.readAgain")}</span>
                      <RefreshCw size={18} className="shrink-0" aria-hidden="true" />
                    </>
                  ) : (
                    <>
                      <RefreshCw size={18} className="shrink-0" aria-hidden="true" />
                      <span className="text-subtitle font-bold leading-none">{t(language, "category.readAgain")}</span>
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={onReset}
                  className="interactive-elem order-3 flex h-11 w-11 shrink-0 items-center justify-center rounded-btn border border-destructive/40 bg-destructive/10 text-destructive hover:bg-destructive/15 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-destructive"
                  aria-label={t(language, "category.resetProgress")}
                >
                  <RotateCcw size={18} />
                </button>
              </>
            )}
          </div>
        </div>

        <div
          role="region"
          aria-label={isArabic ? cat.nameArabic : cat.name}
          tabIndex={0}
          className="flex flex-1 flex-col overflow-y-auto px-4 py-4 outline-none focus-visible:ring-1 focus-visible:ring-ring/40"
        >
          {introduction && (
            <aside className="mb-4 rounded-2xl border border-primary/30 bg-primary/10 p-4">
              <div className="mb-2 flex items-center justify-between gap-3">
                <h2 className="text-label font-extrabold text-primary">{t(language, "category.introductionLabel")}</h2>
                <span className="rounded-full bg-card/80 px-2.5 py-1 text-micro font-bold text-muted-foreground">
                  {t(language, "category.optional")}
                </span>
              </div>
              <p
                className={`${isArabic ? "zikr-text" : "font-sans"} text-start text-subtitle font-semibold leading-7 text-foreground`}
                dir={isArabic ? "rtl" : "ltr"}
                lang={isArabic ? "ar" : "en"}
              >
                {isArabic ? introduction.arabicText : introduction.translation}
              </p>
            </aside>
          )}

          {catId === "before_sleep" && (
            <section
              className="mb-5 rounded-3xl border border-border/40 bg-card p-5 shadow-raised"
              aria-labelledby="sleep-prepare-title"
            >
              <div className="flex items-center justify-between gap-3">
                <h2 id="sleep-prepare-title" className="text-sm font-extrabold text-foreground">
                  {t(language, "category.prepareTitle")}
                </h2>
                <span className="text-xs font-black text-primary" data-testid="sleep-preparation-count">
                  {formatNumerals(preparationSteps.size, language)} / {formatNumerals(3, language)}
                </span>
              </div>
              <div className="mt-3">
                <ProgressBar
                  value={preparationSteps.size}
                  max={3}
                  height={6}
                  direction={direction}
                  aria-label={t(language, "category.prepareProgress")}
                />
              </div>
              <div className="mt-3 grid gap-2">
                {(
                  [
                    ["wudu", "category.prepareWudu"],
                    ["dust", "category.prepareDustBed"],
                    ["right", "category.prepareRightSide"],
                  ] as const
                ).map(([id, labelKey]) => (
                  <label
                    key={id}
                    className={`flex min-h-12 cursor-pointer items-center gap-3 rounded-2xl border px-3 transition-colors ${
                      preparationSteps.has(id)
                        ? "border-primary/35 bg-primary/10"
                        : "border-border/50 bg-muted/60 hover:border-primary/30"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={preparationSteps.has(id)}
                      onChange={() =>
                        setPreparationSteps((previous) => {
                          const next = new Set(previous);
                          if (next.has(id)) next.delete(id);
                          else next.add(id);
                          return next;
                        })
                      }
                      className="peer sr-only"
                    />
                    <span
                      className={`flex size-7 shrink-0 items-center justify-center rounded-xl border transition-colors peer-focus-visible:ring-[3px] peer-focus-visible:ring-ring ${
                        preparationSteps.has(id)
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border bg-background text-transparent"
                      }`}
                      aria-hidden="true"
                    >
                      <Check size={16} strokeWidth={3} />
                    </span>
                    <span className="min-w-0 flex-1 text-label font-bold text-foreground">{t(language, labelKey)}</span>
                  </label>
                ))}
              </div>
              {preparationSteps.size === 3 && (
                <div
                  role="status"
                  className="celebration-pop mt-3 flex items-center gap-3 rounded-2xl border border-success/30 bg-success/10 p-3 text-start"
                  data-testid="sleep-preparation-complete"
                >
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-success text-white dark:bg-success dark:text-primary-foreground">
                    <Check size={19} strokeWidth={3} aria-hidden="true" />
                  </span>
                  <span>
                    <span className="block text-label font-black text-foreground">
                      {t(language, "category.prepareCompleteTitle")}
                    </span>
                    <span className="mt-0.5 block text-xs font-semibold leading-5 text-muted-foreground">
                      {t(language, "category.prepareCompleteBody")}
                    </span>
                  </span>
                </div>
              )}
            </section>
          )}

          <AzkarListLayout
            azkar={azkar}
            completed={completed}
            catId={catId}
            isMainRoutine={isMainRoutine}
            routineMode={routineMode}
            language={language}
            renderZikrCard={({ z, index }, isCompleted) => renderZikrCard({ z, index }, isCompleted)}
          />
        </div>
      </div>
    </ScreenContainer>
  );
}
