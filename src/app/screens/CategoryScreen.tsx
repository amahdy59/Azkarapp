/* eslint-disable jsx-a11y/no-noninteractive-tabindex */
import { useState } from "react";
import { Check, ChevronDown, RotateCcw, SlidersHorizontal, Volume2 } from "../components/icons";
import { t } from "../i18n";
import "../../styles/animations/ZikrAnimations.css";
import { CATEGORIES, isOccasionalCategory } from "../content/categories";
import {
  getAzkarByCategory,
  getAzkarForMode,
  getAzkarForPrayer,
  getCollectionIntroduction,
  getRoutineStepCount,
  isRoutineCategory,
} from "../content/azkar";
import type { CategoryId, RitualGroupId, RoutineMode, Zikr, ZikrGroupId } from "../types";
import { Header } from "../components/LayoutShells";
import { ProgressBar } from "../components/ProgressBar";
import { formatNumerals, numeralFontFamily } from "../formatting";
import { ScreenContainer } from "../components/ScreenContainer";
import { getLocalizedPreferredTiming, hasSpecificRecommendedTiming } from "../content/localizedZikr";
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
  const isOccasional = isOccasionalCategory(catId);
  const [preparationSteps, setPreparationSteps] = useState<Set<string>>(() => new Set());
  const orderedAzkar = azkar.map((z, i) => ({ z, index: i }));
  const groupedAzkar = orderedAzkar.reduce<Array<{ groupId: ZikrGroupId; items: typeof orderedAzkar }>>(
    (groups, item) => {
      const groupId = item.z.groupId ?? "ask";
      const existing = groups.find((group) => group.groupId === groupId);
      if (existing) {
        existing.items.push(item);
      } else {
        groups.push({ groupId, items: [item] });
      }
      return groups;
    },
    [],
  );

  const groupLabel = (groupId: ZikrGroupId) => {
    const keys: Record<ZikrGroupId, string> = {
      begin: "category.groupBegin",
      quran_protection: "category.groupQuranProtection",
      dua_protection: "category.groupDuaProtection",
      renew: "category.groupRenew",
      ask: "category.groupAsk",
      repeat: "category.groupRepeat",
      prepare: "category.prepareTitle",
      settle: "category.groupSettle",
      final: "category.groupFinal",
    };
    return t(language, keys[groupId]);
  };

  const ritualChunks = (items: typeof orderedAzkar) =>
    items.reduce<Array<{ ritualGroupId?: RitualGroupId; items: typeof orderedAzkar }>>((chunks, item) => {
      const previous = chunks.at(-1);
      if (item.z.ritualGroupId && previous?.ritualGroupId === item.z.ritualGroupId) {
        previous.items.push(item);
      } else {
        chunks.push({ ritualGroupId: item.z.ritualGroupId, items: [item] });
      }
      return chunks;
    }, []);

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
      <ZikrAccordion
        key={z.id}
        z={z}
        index={index}
        isCardCompleted={isCardCompleted}
        language={language}
        isArabic={isArabic}
        direction={direction}
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
          title={`${isArabic ? cat.nameArabic : cat.name}${prayer ? ` · ${t(language, `notifications.${prayer}`)}` : ""}`}
          onBack={onBack}
          language={language}
        />

        <div className="shrink-0 border-b border-border px-5 py-4">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-[0.8125rem] font-bold text-muted-foreground">{t(language, "category.dailyProgress")}</p>
            <p
              className="text-[0.8125rem] font-bold text-muted-foreground"
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
              className="mt-4 flex min-h-12 w-full items-center justify-between rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 text-start text-emerald-800 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring dark:text-emerald-200"
            >
              <span className="font-extrabold">{t(language, "category.coreCompleted")}</span>
              <span className="text-[0.75rem] font-bold">
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
                    className="interactive-elem flex h-11 shrink-0 items-center justify-center gap-2 rounded-btn border border-border bg-card px-3 text-[0.8125rem] font-extrabold text-foreground shadow-xs focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring"
                    aria-label={`${t(language, "category.routineLength")}: ${t(language, routineMode === "core" ? "category.core" : "category.complete")}`}
                  >
                    <SlidersHorizontal size={17} aria-hidden="true" />
                    <span>{t(language, routineMode === "core" ? "category.core" : "category.complete")}</span>
                    <ChevronDown size={15} aria-hidden="true" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="min-w-[14rem] rounded-2xl p-1.5">
                  <DropdownMenuLabel className="px-3 py-2 text-[0.75rem] font-black text-muted-foreground">
                    {t(language, "category.routineLength")}
                  </DropdownMenuLabel>
                  <DropdownMenuRadioGroup
                    value={routineMode}
                    onValueChange={(mode) => onRoutineModeChange?.(mode as RoutineMode)}
                  >
                    {(["complete", "core"] as const).map((mode) => (
                      <DropdownMenuRadioItem key={mode} value={mode} className="min-h-11 rounded-xl px-8 font-bold">
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
                  className="interactive-elem flex h-11 flex-1 min-w-[140px] items-center justify-center gap-2 rounded-btn bg-primary text-[0.9375rem] font-bold text-primary-foreground shadow-sm focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring"
                >
                  <span className="leading-none">
                    {completedItemCount === 0 ? t(language, "category.startSession") : t(language, "common.continue")}
                  </span>
                  <span className="text-[1.125rem] leading-none" aria-hidden="true">
                    {direction === "rtl" ? "←" : "→"}
                  </span>
                </button>
                {onPlayAllAudio && (
                  <button
                    type="button"
                    onClick={onPlayAllAudio}
                    className="flex h-11 items-center justify-center gap-1.5 rounded-btn border border-amber-500/30 bg-amber-500/10 px-3.5 text-[0.8125rem] font-bold text-amber-700 shadow-xs transition-all hover:bg-amber-500/20 active:scale-95 dark:text-amber-300"
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
                    className="interactive-elem flex h-11 w-11 shrink-0 items-center justify-center rounded-btn border border-destructive/40 bg-destructive/10 text-destructive hover:bg-destructive/15 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-destructive"
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
                  className="interactive-elem flex h-11 flex-1 items-center justify-center gap-2 rounded-btn border border-primary/40 bg-primary/10 text-primary focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring"
                >
                  {isArabic ? (
                    <>
                      <span className="text-[0.9375rem] font-bold leading-none">
                        {t(language, "category.readAgain")}
                      </span>
                      <RotateCcw size={18} className="shrink-0" />
                    </>
                  ) : (
                    <>
                      <RotateCcw size={18} className="shrink-0" />
                      <span className="text-[0.9375rem] font-bold leading-none">
                        {t(language, "category.readAgain")}
                      </span>
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={onReset}
                  className="interactive-elem flex h-11 w-11 shrink-0 items-center justify-center rounded-btn border border-destructive/40 bg-destructive/10 text-destructive hover:bg-destructive/15 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-destructive"
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
            <aside className="mb-4 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4">
              <div className="mb-2 flex items-center justify-between gap-3">
                <h2 className="text-[0.8125rem] font-extrabold text-amber-900 dark:text-amber-200">
                  {t(language, "category.introductionLabel")}
                </h2>
                <span className="rounded-full bg-card/80 px-2.5 py-1 text-[0.6875rem] font-bold text-muted-foreground">
                  {t(language, "category.optional")}
                </span>
              </div>
              <p
                className={`${isArabic ? "zikr-text font-arabic" : "font-sans"} text-start text-[0.9375rem] font-semibold leading-7 text-foreground`}
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
                <h2 id="sleep-prepare-title" className="text-[0.875rem] font-extrabold text-foreground">
                  {t(language, "category.prepareTitle")}
                </h2>
                <span className="text-[0.75rem] font-black text-primary" data-testid="sleep-preparation-count">
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
                    <span className="min-w-0 flex-1 text-[0.8125rem] font-bold text-foreground">
                      {t(language, labelKey)}
                    </span>
                  </label>
                ))}
              </div>
              {preparationSteps.size === 3 && (
                <div
                  role="status"
                  className="celebration-pop mt-3 flex items-center gap-3 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-start"
                  data-testid="sleep-preparation-complete"
                >
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white dark:bg-emerald-500 dark:text-slate-950">
                    <Check size={19} strokeWidth={3} aria-hidden="true" />
                  </span>
                  <span>
                    <span className="block text-[0.8125rem] font-black text-foreground">
                      {t(language, "category.prepareCompleteTitle")}
                    </span>
                    <span className="mt-0.5 block text-[0.75rem] font-semibold leading-5 text-muted-foreground">
                      {t(language, "category.prepareCompleteBody")}
                    </span>
                  </span>
                </div>
              )}
            </section>
          )}

          {isOccasional ? (
            <div className="flex flex-col gap-2">
              {azkar.map((z, index) => renderZikrCard({ z, index }, completed.has(z.id)))}
            </div>
          ) : isMainRoutine ? (
            <div className="mb-6 flex flex-col gap-6">
              {groupedAzkar.map((group) => {
                const groupProgress = stepProgress(group.items);
                return (
                  <section key={group.groupId} aria-labelledby={`group-${group.groupId}`}>
                    <div className="mb-3 flex items-center justify-between gap-3 px-1">
                      <h2 id={`group-${group.groupId}`} className="text-[0.875rem] font-extrabold text-foreground">
                        {groupLabel(group.groupId)}
                      </h2>
                      <span
                        className="text-[0.75rem] font-bold text-muted-foreground"
                        style={{ fontFamily: numeralFontFamily(language) }}
                      >
                        {t(language, "category.groupProgress", {
                          done: formatNumerals(groupProgress.done, language),
                          total: formatNumerals(groupProgress.total, language),
                        })}
                      </span>
                    </div>

                    <div className="flex flex-col gap-2">
                      {ritualChunks(group.items).map((chunk, chunkIndex) =>
                        chunk.ritualGroupId ? (
                          <div
                            key={chunk.ritualGroupId}
                            className={`rounded-3xl border ${routineMode === "core" ? "border-border/30 bg-card overflow-hidden" : "border-primary/25 bg-primary/5 p-3"}`}
                            data-ritual-group={chunk.ritualGroupId}
                          >
                            <div className={`mb-3 px-1 ${routineMode === "core" ? "p-3 pb-0" : ""}`}>
                              <h3 className="text-[0.8125rem] font-extrabold text-primary">
                                {t(
                                  language,
                                  chunk.ritualGroupId === "three_quls"
                                    ? "category.ritualThreeQuls"
                                    : "category.ritualTasbih",
                                )}
                              </h3>
                              <p className="mt-1 text-[0.75rem] font-semibold leading-5 text-muted-foreground">
                                {t(
                                  language,
                                  chunk.ritualGroupId === "three_quls" && catId === "before_sleep"
                                    ? "category.ritualSleepInstruction"
                                    : chunk.ritualGroupId === "three_quls"
                                      ? "category.ritualThreeQulsInstruction"
                                      : "category.ritualTasbihInstruction",
                                )}
                              </p>
                            </div>
                            <div
                              className={`flex flex-col ${routineMode === "core" ? "gap-0 divide-y divide-border/20" : "gap-3"}`}
                            >
                              {chunk.items.map(({ z, index }) => renderZikrCard({ z, index }, completed.has(z.id)))}
                            </div>
                          </div>
                        ) : (
                          <div
                            key={`${group.groupId}-${chunkIndex}`}
                            className={`flex flex-col ${routineMode === "core" ? "gap-0 divide-y divide-border/20 rounded-2xl border border-border/30 bg-card overflow-hidden" : "gap-2"}`}
                          >
                            {chunk.items.map(({ z, index }) => renderZikrCard({ z, index }, completed.has(z.id)))}
                          </div>
                        ),
                      )}
                    </div>
                  </section>
                );
              })}
            </div>
          ) : (
            <div
              className={`mb-6 flex flex-col ${routineMode === "core" ? "gap-0 divide-y divide-border/20 rounded-2xl border border-border/30 bg-card overflow-hidden" : "gap-2"}`}
            >
              {orderedAzkar.map(({ z, index }) => renderZikrCard({ z, index }, completed.has(z.id)))}
            </div>
          )}
        </div>
      </div>
    </ScreenContainer>
  );
}

function ZikrAccordion({
  z,
  index,
  isCardCompleted,
  language,
  isArabic,
  direction,
  onToggleZikr,
}: {
  z: Zikr;
  index: number;
  isCardCompleted: boolean;
  language: "ar" | "en";
  isArabic: boolean;
  direction: "ltr" | "rtl";
  onToggleZikr?: (i: number) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const targetCount = z.repetitionCount;
  const showTiming = hasSpecificRecommendedTiming(z);
  const timingText = getLocalizedPreferredTiming(z, language);

  return (
    <div
      id={`zikr-card-${index}`}
      className={`flex w-full flex-col bg-transparent transition-all ${isCardCompleted ? "opacity-60 grayscale" : ""}`}
    >
      <div
        role="button"
        tabIndex={0}
        onClick={() => setExpanded(!expanded)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setExpanded(!expanded);
          }
        }}
        className="flex w-full items-center p-3 gap-3 cursor-pointer outline-none focus-visible:ring-[3px] focus-visible:ring-ring rounded-t-2xl"
        dir={direction}
      >
        {/* Index */}
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-muted/60 text-[0.875rem] font-bold text-muted-foreground">
          {formatNumerals(index + 1, language)}
        </div>

        {/* Text */}
        <div className="flex-1 text-start min-w-0" dir={direction}>
          <p
            className={`${isArabic ? "font-arabic" : "font-sans"} text-[1.0625rem] font-bold text-foreground line-clamp-1`}
            lang={isArabic ? "ar" : "en"}
          >
            {isArabic ? z.arabicText : z.translation}
          </p>
          <p className="mt-1 text-[0.75rem] font-semibold text-muted-foreground">
            {t(language, "category.repetitionInstruction", { count: formatNumerals(targetCount, language) })}
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 shrink-0">
          <div className="flex items-center justify-center min-h-[44px] min-w-[44px] rounded-full">
            <ChevronDown
              size={20}
              className={`text-muted-foreground transition-transform ${expanded ? "rotate-180" : ""}`}
            />
          </div>
          {onToggleZikr && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onToggleZikr(index);
              }}
              className="flex items-center justify-center min-h-[44px] min-w-[44px] rounded-full focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring"
              aria-label={
                isCardCompleted
                  ? t(language, "category.completedToggle", { defaultValue: "Completed — tap to uncheck" })
                  : t(language, "category.remainingToggle", { defaultValue: "Not completed — tap to check" })
              }
            >
              {isCardCompleted ? (
                <Check size={24} className="text-emerald-500" strokeWidth={3} />
              ) : (
                <div className="size-[20px] rounded-full border-[2.5px] border-muted-foreground opacity-50" />
              )}
            </button>
          )}
        </div>
      </div>

      {expanded && (
        <div className="flex flex-col items-center gap-3 p-4 pt-1 border-t border-border/20 bg-muted/10">
          <div className="min-h-[44px] min-w-0 w-full flex flex-col items-center text-center mt-3">
            {isArabic && z.hasSeekRefuge && (
              <div className="mb-2 text-center pointer-events-none">
                <p className="font-arabic text-[1rem] font-bold text-amber-900/90 dark:text-amber-200/90 tracking-wide">
                  أَعُوذُ بِاللَّهِ مِنَ الشَّيْطَانِ الرَّجِيمِ
                </p>
              </div>
            )}
            {isArabic && (z.hasBasmalah || z.isSurah) && (
              <div className="mb-2 text-center pointer-events-none">
                <p className="font-arabic text-[1.05rem] font-bold text-amber-900/90 dark:text-amber-200/90 tracking-wide">
                  بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
                </p>
              </div>
            )}
            <p
              className={`${isArabic ? "zikr-text font-arabic" : "font-sans"} text-center text-[1.0625rem] font-bold leading-[1.85] text-foreground whitespace-pre-line`}
              dir={isArabic ? "rtl" : "ltr"}
              lang={isArabic ? "ar" : "en"}
            >
              {isArabic ? z.arabicText : z.translation}
            </p>
          </div>

          {showTiming && timingText && (
            <div
              className="flex items-center gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 px-3.5 py-2 text-[0.8125rem] font-extrabold text-amber-900 dark:text-amber-200"
              dir={isArabic ? "rtl" : "ltr"}
            >
              <span aria-hidden="true" className="shrink-0">
                💡
              </span>
              <span className="leading-snug">{timingText}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
