import React, { useState } from "react";
import { Check, RotateCcw, Volume2 } from "../components/icons";
import { t } from "../i18n";
import { CATEGORIES, isOccasionalCategory } from "../content/categories";
import { getAzkarByCategory } from "../content/azkar";
import type { CategoryId, Zikr } from "../types";
import { Header } from "../components/LayoutShells";
import { ProgressBar } from "../components/ProgressBar";
import { formatNumerals, numeralFontFamily } from "../formatting";
import { ScreenContainer } from "../components/ScreenContainer";
import { getLocalizedPreferredTiming, hasSpecificRecommendedTiming } from "../content/localizedZikr";

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
  onPlayAllAudio: _onPlayAllAudio,
}: {
  catId: CategoryId;
  completed: Set<number>;
  isArabic: boolean;
  direction: "ltr" | "rtl";
  onZikr: (i: number) => void;
  onToggleZikr?: (i: number) => void;
  onReset: () => void;
  onRepeat: () => void;
  onBack: () => void;
  onPlayAllAudio?: () => void;
}) {
  const azkar = getAzkarByCategory(catId);
  const cat = CATEGORIES.find((c) => c.id === catId)!;
  const done = completed.size;
  const resumeIdx = azkar.findIndex((_, i) => !completed.has(i));
  const language = isArabic ? "ar" : "en";
  const doneLabel = formatNumerals(done, language);
  const totalLabel = formatNumerals(azkar.length, language);
  const isOccasional = isOccasionalCategory(catId);

  const [cardCounts, setCardCounts] = useState<Record<number, number>>({});

  const remainingAzkar = azkar
    .map((z, i) => ({ z, index: i }))
    .filter((x) => !completed.has(x.index))
    .sort((a, b) => a.z.orderIndex - b.z.orderIndex);

  const completedAzkar = azkar
    .map((z, i) => ({ z, index: i }))
    .filter((x) => completed.has(x.index))
    .sort((a, b) => a.z.orderIndex - b.z.orderIndex);

  const handleToggle = (index: number) => {
    if (onToggleZikr) {
      onToggleZikr(index);
    } else {
      onZikr(index);
    }
  };

  const handleCardTap = (index: number, repetitionCount: number) => {
    const isAlreadyDone = completed.has(index);
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
      const nextIncomplete = azkar.findIndex((_, i) => i > index && !completed.has(i));
      const targetIndex =
        nextIncomplete !== -1 ? nextIncomplete : azkar.findIndex((_, i) => i !== index && !completed.has(i));

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

    return (
      <div
        key={z.id}
        id={`zikr-card-${index}`}
        className={`flex w-full flex-col gap-3.5 rounded-2xl border p-4.5 transition-all shadow-xs ${
          isCardCompleted
            ? "border-emerald-500/30 bg-emerald-500/5 dark:bg-emerald-950/20"
            : "border-border/80 bg-card hover:border-primary/40 hover:shadow-md"
        }`}
      >
        {/* Card Header & Text — Clicking text opens full Reader */}
        <button
          type="button"
          onClick={() => onZikr(index)}
          className="interactive-elem min-w-0 w-full text-start focus-visible:outline-none focus-visible:rounded-lg focus-visible:ring-[2px] focus-visible:ring-ring"
        >
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

        {/* Bottom Action Footer: Interactive Counter Button */}
        <button
          type="button"
          onClick={() => handleCardTap(index, targetCount)}
          aria-label={
            isCardCompleted
              ? `${isArabic ? "مكتمل" : "Completed"}. ${t(language, "category.completedToggle")}`
              : isArabic
                ? `تكرار الذكر: ${localizedCurrent} من ${localizedTarget}`
                : `Repeat zikr: ${localizedCurrent} of ${localizedTarget}`
          }
          className={`interactive-elem flex min-h-[46px] w-full items-center justify-center gap-2 rounded-xl px-4 text-[0.9375rem] font-bold transition-all focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring active:scale-[0.98] ${
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
                {isArabic ? `${localizedCurrent} من ${localizedTarget}` : `${localizedCurrent} of ${localizedTarget}`}
              </span>
              <span className="text-[0.8125rem] opacity-80">({t(language, "category.tapToCount")})</span>
            </>
          )}
        </button>
      </div>
    );
  };

  return (
    <ScreenContainer dir={direction}>
      <Header title={isArabic ? cat.nameArabic : cat.name} onBack={onBack} language={isArabic ? "ar" : "en"} />

      <div className="shrink-0 border-b border-border px-5 py-4">
        <div className="mb-2 flex items-center justify-between">
          <p className="text-[0.8125rem] font-bold text-muted-foreground">{t(language, "category.dailyProgress")}</p>
          <p
            className="text-[0.8125rem] font-bold text-muted-foreground"
            dir="auto"
            style={{ fontFamily: numeralFontFamily(language), fontVariantNumeric: "tabular-nums lining-nums" }}
          >
            {isArabic ? `${formatNumerals(done, language)} من ${totalLabel}` : `${doneLabel} of ${totalLabel}`}
          </p>
        </div>
        <ProgressBar
          value={done}
          max={azkar.length}
          height={8}
          trackColor="var(--card)"
          fillColor="var(--primary)"
          direction={direction}
          aria-label={t(language, "category.dailyProgress")}
        />

        {!isOccasional ? (
          <div className="mt-4 flex w-full gap-3">
            {done < azkar.length ? (
              <>
                <button
                  type="button"
                  onClick={() => onZikr(Math.max(0, resumeIdx))}
                  className="interactive-elem flex h-11 flex-1 items-center justify-center gap-2 rounded-btn bg-primary text-[0.9375rem] font-bold text-primary-foreground shadow-sm focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring"
                >
                  <span className="leading-none">
                    {done === 0 ? t(language, "category.startSession") : t(language, "common.continue")}
                  </span>
                  <span className="text-[1.125rem] leading-none" aria-hidden="true">
                    {direction === "rtl" ? "←" : "→"}
                  </span>
                </button>
                <button
                  type="button"
                  disabled
                  aria-disabled="true"
                  className="flex h-11 items-center justify-center gap-1.5 rounded-btn border border-amber-500/30 bg-amber-500/10 px-3 text-amber-700/80 dark:text-amber-300/80 opacity-75 cursor-not-allowed focus-visible:outline-none"
                  aria-label={t(language, "category.audioComingSoon")}
                  title={t(language, "category.audioComingSoon")}
                >
                  <Volume2 size={18} className="shrink-0 opacity-70" />
                  <span className="text-[0.875rem] font-bold">{t(language, "category.playAll")}</span>
                  <span className="rounded-full bg-amber-500/20 px-1.5 py-0.5 text-[0.6875rem] font-semibold text-amber-800 dark:text-amber-200 leading-none">
                    {t(language, "common.comingSoon")}
                  </span>
                </button>
                {done > 0 && (
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
        ) : (
          done > 0 && (
            <div className="mt-3 flex justify-end">
              <button
                type="button"
                onClick={onReset}
                className="interactive-elem flex h-9 items-center gap-1.5 rounded-lg px-3 text-[0.75rem] font-bold text-destructive hover:bg-destructive/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-destructive"
                aria-label={t(language, "category.resetProgress")}
              >
                <RotateCcw size={14} />
                <span>{t(language, "category.resetProgress")}</span>
              </button>
            </div>
          )
        )}
      </div>

      <div className="flex flex-1 flex-col overflow-y-auto px-5 py-4">
        {remainingAzkar.length > 0 && (
          <div className="mb-6">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-[0.8125rem] font-bold text-muted-foreground">{t(language, "category.remaining")}</h2>
            </div>
            <div className="flex flex-col gap-3.5">
              {remainingAzkar.map(({ z, index }) => renderZikrCard({ z, index }, false))}
            </div>
          </div>
        )}

        {completedAzkar.length > 0 && (
          <div className="mb-6">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-[0.8125rem] font-bold text-muted-foreground">{t(language, "category.completed")}</h2>
            </div>
            <div className="flex flex-col gap-3.5">
              {completedAzkar.map(({ z, index }) => renderZikrCard({ z, index }, true))}
            </div>
          </div>
        )}
      </div>
    </ScreenContainer>
  );
}
