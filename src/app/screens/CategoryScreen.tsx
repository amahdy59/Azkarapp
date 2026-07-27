import React from "react";
import { Check, RotateCcw } from "../components/icons";
import { Volume2 } from "../components/icons";
import { t } from "../i18n";
import { CATEGORIES, isOccasionalCategory } from "../content/categories";
import { getAzkarByCategory } from "../content/azkar";
import { getLocalizedPreferredTiming } from "../content/localizedZikr";
import type { CategoryId } from "../types";
import { Header } from "../components/LayoutShells";
import { ProgressBar } from "../components/ProgressBar";
import { formatNumerals, numeralFontFamily } from "../formatting";
import { ScreenContainer } from "../components/ScreenContainer";

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
  const doneLabel = formatNumerals(done, language);
  const totalLabel = formatNumerals(azkar.length, language);
  const isOccasional = isOccasionalCategory(catId);

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
                {onPlayAllAudio && (
                  <button
                    type="button"
                    onClick={onPlayAllAudio}
                    className="interactive-elem flex h-11 items-center justify-center gap-1.5 rounded-btn border border-amber-500/40 bg-amber-500/10 px-3.5 text-amber-600 dark:text-amber-400 hover:bg-amber-500/15 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-amber-500"
                    aria-label={isArabic ? "تشغيل الصوتي للكل" : "Play All Audio"}
                    title={isArabic ? "تشغيل الصوتي للكل" : "Play All Audio"}
                  >
                    <Volume2 size={18} />
                    <span className="text-[0.875rem] font-bold">{isArabic ? "تشغيل الكل" : "Play All"}</span>
                  </button>
                )}
                {done > 0 && (
                  <button
                    type="button"
                    onClick={onReset}
                    className="interactive-elem flex h-11 w-11 shrink-0 items-center justify-center rounded-btn border border-destructive/40 bg-destructive/10 text-destructive hover:bg-destructive/15 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-destructive"
                    aria-label={isArabic ? "إعادة تعيين" : "Reset Progress"}
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
                  aria-label={isArabic ? "إعادة تعيين" : "Reset Progress"}
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
                aria-label={isArabic ? "إعادة تعيين التقدم" : "Reset Progress"}
              >
                <RotateCcw size={14} />
                <span>{isArabic ? "إعادة تعيين التقدم" : "Reset Progress"}</span>
              </button>
            </div>
          )
        )}
      </div>

      <div className="flex flex-1 flex-col overflow-y-auto px-5 py-4">
        {completedAzkar.length > 0 && (
          <div className="mb-6">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-[0.8125rem] font-bold text-muted-foreground">{t(language, "category.completed")}</h3>
            </div>
            <div className="flex flex-col gap-3">
              {completedAzkar.map(({ z, index }) => {
                const countLabel = formatNumerals(z.countLabel ?? String(z.repetitionCount), language);
                const timingTip = getLocalizedPreferredTiming(z, language) || z.preferredTiming;

                return (
                  <button
                    type="button"
                    key={z.id}
                    className="interactive-elem flex w-full items-start gap-3.5 rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-4 text-start focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring cursor-pointer hover:bg-emerald-500/10 transition-all dark:bg-emerald-950/20"
                    onClick={() => onZikr(index)}
                  >
                    <span
                      role="button"
                      tabIndex={0}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggle(index);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.stopPropagation();
                          handleToggle(index);
                        }
                      }}
                      aria-label={
                        isArabic
                          ? `${z.arabicText.slice(0, 30)}. مكتمل، انقر للتعطيل`
                          : `${z.translation.slice(0, 30)}. Completed, click to uncheck`
                      }
                      className="flex min-h-[44px] min-w-[44px] shrink-0 items-center justify-center rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-600 text-white dark:bg-emerald-500 dark:text-black shadow-sm">
                        <Check size={18} strokeWidth={3} />
                      </span>
                    </span>

                    <div className="min-w-0 flex-1 pt-0.5 opacity-90">
                      <p
                        className={`${isArabic ? "zikr-text font-arabic" : "font-sans"} text-start text-[1.0625rem] font-bold leading-[1.8] text-foreground whitespace-pre-line`}
                        dir={isArabic ? "rtl" : "ltr"}
                        lang={isArabic ? "ar" : "en"}
                      >
                        {isArabic ? z.arabicText : z.translation}
                      </p>

                      {timingTip && (
                        <div
                          className="mt-2.5 inline-flex items-center gap-1.5 rounded-xl bg-amber-500/15 px-3 py-1 text-[0.75rem] font-extrabold text-amber-800 dark:text-amber-300"
                          dir="auto"
                        >
                          <span>💡</span>
                          <span>{timingTip}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex shrink-0 items-center justify-center rounded-xl bg-muted/80 px-3 py-1.5 shadow-xs">
                      <span className="text-[0.875rem] font-extrabold text-muted-foreground">x{countLabel}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {remainingAzkar.length > 0 && (
          <div className="mb-6">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-[0.8125rem] font-bold text-muted-foreground">{t(language, "category.remaining")}</h3>
            </div>
            <div className="flex flex-col gap-3.5">
              {remainingAzkar.map(({ z, index }) => {
                const countLabel = formatNumerals(z.countLabel ?? String(z.repetitionCount), language);
                const timingTip = getLocalizedPreferredTiming(z, language) || z.preferredTiming;

                return (
                  <button
                    type="button"
                    key={z.id}
                    className="interactive-elem flex w-full items-start gap-3.5 rounded-2xl border border-border/80 bg-card p-4 text-start focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring cursor-pointer hover:border-primary/50 hover:shadow-md transition-all"
                    onClick={() => onZikr(index)}
                  >
                    <span
                      role="button"
                      tabIndex={0}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggle(index);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.stopPropagation();
                          handleToggle(index);
                        }
                      }}
                      aria-label={
                        isArabic
                          ? `${z.arabicText.slice(0, 30)}. غير مكتمل، انقر للتحديد`
                          : `${z.translation.slice(0, 30)}. Not completed, click to check`
                      }
                      className="flex min-h-[44px] min-w-[44px] shrink-0 items-center justify-center rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <span className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-muted-foreground/40 hover:border-emerald-500 hover:bg-emerald-500/10 transition-colors" />
                    </span>

                    <div className="min-w-0 flex-1 pt-0.5">
                      <p
                        className={`${isArabic ? "zikr-text font-arabic" : "font-sans"} text-start text-[1.0625rem] font-bold leading-[1.85] text-foreground whitespace-pre-line`}
                        dir={isArabic ? "rtl" : "ltr"}
                        lang={isArabic ? "ar" : "en"}
                      >
                        {isArabic ? z.arabicText : z.translation}
                      </p>

                      {timingTip && (
                        <div
                          className="mt-2.5 inline-flex items-center gap-1.5 rounded-xl bg-amber-500/15 px-3 py-1 text-[0.75rem] font-extrabold text-amber-800 dark:text-amber-300"
                          dir="auto"
                        >
                          <span>💡</span>
                          <span>{timingTip}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex shrink-0 items-center justify-center rounded-xl bg-amber-500/15 px-3 py-1.5 shadow-xs">
                      <span className="text-[0.875rem] font-extrabold text-amber-700 dark:text-amber-300">
                        x{countLabel}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </ScreenContainer>
  );
}
