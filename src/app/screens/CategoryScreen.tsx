import React from "react";
import { Check, ChevronNext, RotateCcw } from "../components/icons";
import { t } from "../i18n";
import { CATEGORIES } from "../content/categories";
import { getAzkarByCategory } from "../content/azkar";
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
  onReset,
  onRepeat,
  onBack,
}: {
  catId: CategoryId;
  completed: Set<number>;
  isArabic: boolean;
  direction: "ltr" | "rtl";
  onZikr: (i: number) => void;
  onReset: () => void;
  onRepeat: () => void;
  onBack: () => void;
}) {
  const azkar = getAzkarByCategory(catId);
  const cat = CATEGORIES.find((c) => c.id === catId)!;
  const done = completed.size;
  const resumeIdx = azkar.findIndex((_, i) => !completed.has(i));
  const language = isArabic ? "ar" : "en";
  const doneLabel = formatNumerals(done, language);
  const totalLabel = formatNumerals(azkar.length, language);

  const remainingAzkar = azkar
    .map((z, i) => ({ z, index: i }))
    .filter((x) => !completed.has(x.index))
    .sort((a, b) => a.z.orderIndex - b.z.orderIndex);

  const completedAzkar = azkar
    .map((z, i) => ({ z, index: i }))
    .filter((x) => completed.has(x.index))
    .sort((a, b) => a.z.orderIndex - b.z.orderIndex);

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

        <div className="mt-4 flex w-full gap-3">
          {done > 0 && done < azkar.length && (
            <button
              onClick={onReset}
              className="interactive-elem flex h-14 w-14 shrink-0 items-center justify-center rounded-btn border border-destructive/40 bg-destructive/10 text-destructive hover:bg-destructive/15 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-destructive"
              aria-label={isArabic ? "إعادة تعيين" : "Reset Progress"}
            >
              <RotateCcw size={22} />
            </button>
          )}
          {done < azkar.length ? (
            <button
              onClick={() => onZikr(Math.max(0, resumeIdx))}
              className="interactive-elem flex h-14 flex-1 items-center justify-center gap-2 rounded-btn bg-primary text-[1rem] font-bold text-primary-foreground shadow-sm focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring"
            >
              <ChevronNext size={20} />
              {done === 0 ? t(language, "category.startSession") : t(language, "common.continue")}
            </button>
          ) : (
            <button
              type="button"
              onClick={onRepeat}
              className="interactive-elem flex h-14 flex-1 items-center justify-center gap-2 rounded-btn border border-primary/40 bg-primary/10 text-primary focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring"
            >
              <RotateCcw size={20} />
              <span className="text-[1rem] font-bold">{t(language, "category.readAgain")}</span>
            </button>
          )}
        </div>
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
                return (
                  <button
                    key={z.id}
                    onClick={() => onZikr(index)}
                    className="interactive-elem flex w-full items-center gap-3 rounded-card border border-border bg-card p-3 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring"
                  >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                      <Check size={16} />
                    </div>

                    <div className="min-w-0 flex-1 opacity-70">
                      <p
                        className={`${isArabic ? "zikr-text" : "font-sans"} line-clamp-2 text-start text-[1rem] font-medium leading-[26px] text-foreground`}
                        dir={isArabic ? "rtl" : "ltr"}
                        lang={isArabic ? "ar" : "en"}
                      >
                        {isArabic ? z.arabicText.split("\n")[0] : z.translation}
                      </p>
                      {!isArabic && (
                        <p
                          className="mt-1 line-clamp-1 text-start text-[0.75rem] text-muted-foreground"
                          dir="ltr"
                          lang="en"
                        >
                          {z.transliteration}
                        </p>
                      )}
                    </div>

                    <div className="flex shrink-0 items-center justify-center rounded-xl bg-muted/60 px-3 py-1.5 opacity-70">
                      <span className="text-[0.8125rem] font-bold text-muted-foreground">x{countLabel}</span>
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
            <div className="flex flex-col gap-3">
              {remainingAzkar.map(({ z, index }) => {
                const countLabel = formatNumerals(z.countLabel ?? String(z.repetitionCount), language);

                return (
                  <button
                    key={z.id}
                    onClick={() => onZikr(index)}
                    className="interactive-elem flex w-full items-center gap-3 rounded-card border border-border bg-card p-3 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring"
                  >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-[1.5px] border-muted-foreground/40">
                      {/* Empty circle */}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p
                        className={`${isArabic ? "zikr-text" : "font-sans"} line-clamp-2 text-start text-[1rem] font-medium leading-[26px] text-foreground`}
                        dir={isArabic ? "rtl" : "ltr"}
                        lang={isArabic ? "ar" : "en"}
                      >
                        {isArabic ? z.arabicText.split("\n")[0] : z.translation}
                      </p>
                      {!isArabic && (
                        <p
                          className="mt-1 line-clamp-1 text-start text-[0.75rem] text-muted-foreground"
                          dir="ltr"
                          lang="en"
                        >
                          {z.transliteration}
                        </p>
                      )}
                    </div>

                    <div className="flex shrink-0 items-center justify-center rounded-xl bg-muted/60 px-3 py-1.5">
                      <span className="text-[0.8125rem] font-bold text-muted-foreground">x{countLabel}</span>
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
