/* eslint-disable jsx-a11y/no-noninteractive-tabindex */
import { useState } from "react";
import { Check, RotateCcw, Volume2 } from "../components/icons";
import { t } from "../i18n";
import { CATEGORIES, isOccasionalCategory } from "../content/categories";
import {
  getAzkarByCategory,
  getAzkarForMode,
  getCollectionIntroduction,
  getRoutineStepCount,
  isRoutineCategory,
} from "../content/azkar";
import type { CategoryId, RitualGroupId, RoutineMode, Zikr, ZikrGroupId } from "../types";
import { Header } from "../components/LayoutShells";
import { ProgressBar } from "../components/ProgressBar";
import { formatNumerals, numeralFontFamily } from "../formatting";
import { ScreenContainer } from "../components/ScreenContainer";
import { SegmentedControl } from "../components/SegmentedControl";
import {
  getLocalizedPreferredTiming,
  getLocalizedZikrBenefit,
  hasSpecificRecommendedTiming,
} from "../content/localizedZikr";

export function CategoryScreen({
  catId,
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
  const allAzkar = getAzkarByCategory(catId);
  const azkar = getAzkarForMode(catId, isMainRoutine ? routineMode : "complete");
  const introduction = getCollectionIntroduction(catId);
  const cat = CATEGORIES.find((c) => c.id === catId)!;
  const completedItemCount = azkar.filter((zikr) => completed.has(zikr.id)).length;
  const resumeIdx = azkar.findIndex((zikr) => !completed.has(zikr.id));
  const language = isArabic ? "ar" : "en";
  const isOccasional = isOccasionalCategory(catId);

  const [cardCounts, setCardCounts] = useState<Record<number, number>>({});
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

  const handleToggle = (index: number) => {
    if (onToggleZikr) {
      onToggleZikr(index);
    } else {
      onZikr(index);
    }
  };

  const handleCardTap = (index: number, repetitionCount: number) => {
    const isAlreadyDone = azkar[index] ? completed.has(azkar[index].id) : false;
    if (isAlreadyDone) {
      setCardCounts((prev) => ({ ...prev, [index]: 0 }));
      handleToggle(index);
      return;
    }

    const currentCount = cardCounts[index] ?? 0;
    const nextCount = currentCount + 1;

    if (nextCount >= repetitionCount) {
      setCardCounts((prev) => ({ ...prev, [index]: repetitionCount }));
      handleToggle(index);

      // Smooth auto-scroll to next incomplete card
      const nextIncomplete = azkar.findIndex((zikr, i) => i > index && !completed.has(zikr.id));
      const targetIndex =
        nextIncomplete !== -1 ? nextIncomplete : azkar.findIndex((zikr, i) => i !== index && !completed.has(zikr.id));

      if (targetIndex !== -1) {
        setTimeout(() => {
          const el = document.getElementById(`zikr-card-${targetIndex}`);
          if (el) {
            el.scrollIntoView({ behavior: "smooth", block: "nearest" });
          }
        }, 120);
      }
    } else {
      setCardCounts((prev) => ({ ...prev, [index]: nextCount }));
      if (typeof navigator !== "undefined" && "vibrate" in navigator) {
        navigator.vibrate(15);
      }
    }
  };

  const renderZikrCard = ({ z, index }: { z: Zikr; index: number }, isCardCompleted: boolean) => {
    const targetCount = z.repetitionCount;
    const currentCount = isCardCompleted ? targetCount : (cardCounts[index] ?? 0);
    const localizedCurrent = formatNumerals(currentCount, language);
    const localizedTarget = formatNumerals(targetCount, language);
    const showTiming = hasSpecificRecommendedTiming(z);
    const timingText = getLocalizedPreferredTiming(z, language);
    const contextTip = getLocalizedZikrBenefit(z, language) || timingText;

    const counterLabelText = t(language, "category.counterProgress", {
      current: localizedCurrent,
      total: localizedTarget,
    });

    if (isOccasional) {
      return (
        <button
          key={z.id}
          id={`zikr-card-${index}`}
          type="button"
          onClick={() => onZikr(index)}
          className="flex w-full cursor-pointer flex-col gap-3.5 rounded-2xl border border-border/40 bg-card p-4.5 text-start transition-all shadow-raised hover:border-amber-500/40 hover:shadow-xl focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring"
        >
          <p
            className={`${isArabic ? "zikr-text font-arabic" : "font-sans"} text-start text-[1.0625rem] font-bold leading-[1.85] text-foreground whitespace-pre-line`}
            dir={isArabic ? "rtl" : "ltr"}
            lang={isArabic ? "ar" : "en"}
          >
            {isArabic ? z.arabicText : z.translation}
          </p>

          {/* Repetition Badge for Occasional Cards (if count > 1) */}
          {targetCount > 1 && (
            <div
              className="inline-flex items-center gap-1.5 self-start rounded-xl border border-primary/20 bg-primary/5 px-3 py-1.5 text-[0.8125rem] font-extrabold text-primary"
              dir={isArabic ? "rtl" : "ltr"}
            >
              <span aria-hidden="true" className="shrink-0">
                🔁
              </span>
              <span>
                {isArabic
                  ? `تُقال ${formatNumerals(targetCount, language)} مرات`
                  : `Recite ${formatNumerals(targetCount, language)} times`}
              </span>
            </div>
          )}

          {/* Suggested Timing / Context Tip Pill for Occasional Cards */}
          {contextTip && (
            <div
              className="flex items-center gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 px-3.5 py-2 text-[0.8125rem] font-extrabold text-amber-900 dark:text-amber-200"
              dir={isArabic ? "rtl" : "ltr"}
            >
              <span aria-hidden="true" className="shrink-0">
                💡
              </span>
              <span className="leading-snug">{contextTip}</span>
            </div>
          )}
        </button>
      );
    }

    return (
      <div
        key={z.id}
        id={`zikr-card-${index}`}
        className={`flex w-full flex-col gap-3.5 rounded-2xl border p-4.5 transition-all shadow-raised ${
          isCardCompleted
            ? "border-emerald-500/30 bg-emerald-500/15 dark:bg-emerald-950/30"
            : "border-border/40 bg-card hover:border-primary/40 hover:shadow-xl"
        }`}
      >
        {/* Card Header & Text — Clicking text opens full Reader */}
        <button
          type="button"
          onClick={() => onZikr(index)}
          className="interactive-elem min-h-[44px] min-w-0 w-full text-start focus-visible:outline-none focus-visible:rounded-lg focus-visible:ring-[3px] focus-visible:ring-ring"
        >
          {isMainRoutine && routineMode === "complete" && z.includedInCore && (
            <span className="mb-2 inline-flex rounded-full bg-primary/10 px-2.5 py-1 text-[0.6875rem] font-extrabold text-primary">
              {t(language, "category.coreBadge")}
            </span>
          )}
          {catId === "before_sleep" && z.groupId === "final" && (
            <span className="mb-2 inline-flex rounded-full bg-amber-500/15 px-2.5 py-1 text-[0.6875rem] font-extrabold text-amber-800 dark:text-amber-200">
              {t(language, "category.finalWords")}
            </span>
          )}
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
            className={`${isArabic ? "zikr-text font-arabic" : "font-sans"} text-start text-[1.0625rem] font-bold leading-[1.85] text-foreground whitespace-pre-line`}
            dir={isArabic ? "rtl" : "ltr"}
            lang={isArabic ? "ar" : "en"}
          >
            {isArabic ? z.arabicText : z.translation}
          </p>
        </button>

        {/* Specific Recommended Timing Pill — shown ONLY for specific zikrs */}
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

        {/* Bottom Action Footer for Routine Cards */}
        <button
          type="button"
          onClick={() => handleCardTap(index, targetCount)}
          aria-label={
            isCardCompleted
              ? `${t(language, "category.completedButton")}. ${t(language, "category.completedToggle")}`
              : t(language, "category.remainingToggle")
          }
          className={`interactive-elem flex min-h-[46px] w-full items-center justify-center gap-2 rounded-xl px-4 text-[0.9375rem] font-bold transition-all focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring ${
            isCardCompleted
              ? "bg-emerald-600 text-white dark:bg-emerald-500 dark:text-slate-950 shadow-xs hover:bg-emerald-700"
              : currentCount > 0
                ? "border border-amber-500/40 bg-amber-500/15 text-amber-900 dark:text-amber-200 shadow-xs"
                : "border border-primary/40 bg-primary/10 text-primary hover:bg-primary/20 shadow-xs"
          }`}
        >
          {isCardCompleted ? (
            <>
              <Check size={18} strokeWidth={3} className="shrink-0" />
              <span>{t(language, "category.completedButton")}</span>
            </>
          ) : (
            <>
              <span
                className="text-[1.0625rem] font-extrabold"
                dir="auto"
                style={{ fontFamily: numeralFontFamily(language), fontVariantNumeric: "tabular-nums lining-nums" }}
              >
                {counterLabelText}
              </span>
              <span className="text-[0.8125rem] opacity-80">({t(language, "category.tapToCount")})</span>
            </>
          )}
        </button>
      </div>
    );
  };

  return (
    <ScreenContainer dir={direction} className="relative">
      <div className="relative z-10 flex flex-col min-h-screen">
        <Header title={isArabic ? cat.nameArabic : cat.name} onBack={onBack} language={language} />

        {!isOccasional && (
          <div className="shrink-0 border-b border-border px-5 py-4">
            {isMainRoutine && (
              <SegmentedControl
                value={routineMode}
                onChange={(mode) => onRoutineModeChange?.(mode)}
                direction={direction}
                aria-label={`${t(language, "category.complete")} / ${t(language, "category.core")}`}
                className="mb-4 grid grid-cols-2 rounded-2xl border border-border bg-muted/60 p-1"
                itemClassName={(selected) =>
                  `min-h-11 rounded-xl px-2 text-[0.75rem] font-extrabold transition-colors focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring ${
                    selected ? "bg-card text-primary shadow-sm" : "text-muted-foreground"
                  }`
                }
                options={(["complete", "core"] as const).map((mode) => ({
                  value: mode,
                  label: t(language, mode === "core" ? "category.coreSummary" : "category.completeSummary", {
                    count: formatNumerals(
                      mode === "core" ? getRoutineStepCount(catId, "core") : getAzkarForMode(catId, "complete").length,
                      language,
                    ),
                  }),
                }))}
              />
            )}

            <div className="mb-2 flex items-center justify-between">
              <p className="text-[0.8125rem] font-bold text-muted-foreground">
                {t(language, "category.dailyProgress")}
              </p>
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

            <div className="mt-4 flex w-full gap-3">
              {completedItemCount < azkar.length ? (
                <>
                  <button
                    type="button"
                    onClick={() => onZikr(Math.max(0, resumeIdx))}
                    className="interactive-elem flex h-11 flex-1 items-center justify-center gap-2 rounded-btn bg-primary text-[0.9375rem] font-bold text-primary-foreground shadow-sm focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring"
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
        )}

        <div
          role="region"
          aria-label={isArabic ? cat.nameArabic : cat.name}
          tabIndex={0}
          className="flex flex-1 flex-col overflow-y-auto px-5 py-4 outline-none focus-visible:ring-1 focus-visible:ring-ring/40"
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
              <h2 id="sleep-prepare-title" className="text-[0.875rem] font-extrabold text-foreground">
                {t(language, "category.prepareTitle")}
              </h2>
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
                    className="flex min-h-11 cursor-pointer items-center gap-3 rounded-xl bg-muted/60 px-3"
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
                      className="size-5 accent-primary"
                    />
                    <span className="text-[0.8125rem] font-bold text-foreground">{t(language, labelKey)}</span>
                  </label>
                ))}
              </div>
            </section>
          )}

          {isOccasional ? (
            <div className="flex flex-col gap-3.5">{azkar.map((z, index) => renderZikrCard({ z, index }, false))}</div>
          ) : isMainRoutine ? (
            <div className="mb-6 flex flex-col gap-6">
              {groupedAzkar.map((group) => {
                const groupProgress = stepProgress(group.items);
                return (
                  <section key={group.groupId} aria-labelledby={`group-${group.groupId}`}>
                    <div className="mb-3 flex items-center justify-between gap-3">
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

                    <div className="flex flex-col gap-3.5">
                      {ritualChunks(group.items).map((chunk, chunkIndex) =>
                        chunk.ritualGroupId ? (
                          <div
                            key={chunk.ritualGroupId}
                            className="rounded-3xl border border-primary/25 bg-primary/5 p-3"
                            data-ritual-group={chunk.ritualGroupId}
                          >
                            <div className="mb-3 px-1">
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
                            <div className="flex flex-col gap-3">
                              {chunk.items.map(({ z, index }) => renderZikrCard({ z, index }, completed.has(z.id)))}
                            </div>
                          </div>
                        ) : (
                          <div key={`${group.groupId}-${chunkIndex}`} className="flex flex-col gap-3.5">
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
            <div className="mb-6 flex flex-col gap-3.5">
              {orderedAzkar.map(({ z, index }) => renderZikrCard({ z, index }, completed.has(z.id)))}
            </div>
          )}
        </div>
      </div>
    </ScreenContainer>
  );
}
