import { useState } from "react";
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
  onPlayAllAudio,
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

    const counterLabelText = t(language, "category.counterProgress", {
      current: localizedCurrent,
      total: localizedTarget,
    });

    return (
      <div
        key={z.id}
        id={`zikr-card-${index}`}
        className={`flex w-full flex-col gap-3.5 rounded-2xl border p-4.5 transition-all shadow-xs ${
          isOccasional
            ? "border-border/80 bg-card hover:border-amber-500/40 hover:shadow-md"
            : isCardCompleted
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

        {/* Repetition Badge for Occasional Cards (if count > 1) */}
        {isOccasional && targetCount > 1 && (
          <div
            className="flex items-center gap-1.5 rounded-xl border border-primary/20 bg-primary/5 px-3 py-1.5 text-[0.8125rem] font-extrabold text-primary"
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

        {/* Bottom Action Footer for Routine Cards vs Occasional Cards */}
        {!isOccasional ? (
          <button
            type="button"
            onClick={() => handleCardTap(index, targetCount)}
            aria-label={
              isCardCompleted
                ? `${t(language, "category.completedButton")}. ${t(language, "category.completedToggle")}`
                : t(language, "category.remainingToggle")
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
                  {counterLabelText}
                </span>
                <span className="text-[0.8125rem] opacity-80">({t(language, "category.tapToCount")})</span>
              </>
            )}
          </button>
        ) : (
          <div className="flex items-center justify-between pt-1">
            <button
              type="button"
              onClick={() => onZikr(index)}
              className="interactive-elem flex h-9 items-center gap-1.5 rounded-xl border border-primary/30 bg-primary/5 px-3 text-[0.8125rem] font-bold text-primary hover:bg-primary/15 transition-all"
            >
              <span>{isArabic ? "اقرأ الذكر كاملاً" : "Read Full Dua"}</span>
              <span className="text-[1.125rem] leading-none" aria-hidden="true">
                {direction === "rtl" ? "←" : "→"}
              </span>
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <ScreenContainer dir={direction}>
      <Header title={isArabic ? cat.nameArabic : cat.name} onBack={onBack} language={language} />

      {!isOccasional && (
        <div className="shrink-0 border-b border-border px-5 py-4">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-[0.8125rem] font-bold text-muted-foreground">{t(language, "category.dailyProgress")}</p>
            <p
              className="text-[0.8125rem] font-bold text-muted-foreground"
              dir="auto"
              style={{ fontFamily: numeralFontFamily(language), fontVariantNumeric: "tabular-nums lining-nums" }}
            >
              {t(language, "category.counterProgress", {
                current: formatNumerals(done, language),
                total: formatNumerals(azkar.length, language),
              })}
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
                  onClick={onPlayAllAudio}
                  disabled={!onPlayAllAudio}
                  aria-disabled={!onPlayAllAudio}
                  className={`flex h-11 items-center justify-center gap-1.5 rounded-btn border border-amber-500/30 bg-amber-500/10 px-3.5 text-[0.8125rem] font-bold text-amber-700 dark:text-amber-300 transition-all ${
                    onPlayAllAudio
                      ? "hover:bg-amber-500/20 active:scale-95 cursor-pointer shadow-xs"
                      : "opacity-75 cursor-not-allowed"
                  }`}
                  aria-label={t(language, "category.playAllAudio")}
                  title={t(language, "category.playAllAudio")}
                >
                  <Volume2 size={16} />
                  <span>{t(language, "category.playAll")}</span>
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
        </div>
      )}

      <div className="flex flex-1 flex-col overflow-y-auto px-5 py-4">
        {isOccasional ? (
          <div className="flex flex-col gap-3.5">{azkar.map((z, index) => renderZikrCard({ z, index }, false))}</div>
        ) : (
          <>
            {remainingAzkar.length > 0 && (
              <div className="mb-6">
                <div className="mb-3 flex items-center justify-between">
                  <h2 className="text-[0.8125rem] font-bold text-muted-foreground">
                    {t(language, "category.remaining")}
                  </h2>
                  <span className="text-[0.75rem] font-semibold text-muted-foreground">
                    {t(language, "category.remainingCount", { count: formatNumerals(remainingAzkar.length, language) })}
                  </span>
                </div>
                <div className="flex flex-col gap-3.5">
                  {remainingAzkar.map(({ z, index }) => renderZikrCard({ z, index }, false))}
                </div>
              </div>
            )}

            {completedAzkar.length > 0 && (
              <div className="mb-6">
                <div className="mb-3 flex items-center justify-between">
                  <h2 className="text-[0.8125rem] font-bold text-muted-foreground">
                    {t(language, "category.completed")}
                  </h2>
                  <span className="text-[0.75rem] font-semibold text-muted-foreground">
                    {t(language, "category.completedCount", { count: formatNumerals(completedAzkar.length, language) })}
                  </span>
                </div>
                <div className="flex flex-col gap-3.5">
                  {completedAzkar.map(({ z, index }) => renderZikrCard({ z, index }, true))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </ScreenContainer>
  );
}
