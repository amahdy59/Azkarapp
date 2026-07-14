import React from "react";
import { Check, ChevronNext, RotateCcw } from "../components/icons";
import { t } from "../i18n";
import { CATEGORIES } from "../content/categories";
import { getAzkarByCategory } from "../content/azkar";
import type { CategoryId } from "../types";
import { Header } from "../components/LayoutShells";
import { ProgressBar } from "../components/ProgressBar";
import { RepBadge } from "../components/ZikrComponents";
import { formatNumerals, numeralFontFamily } from "../formatting";

export function CategoryScreen({
  catId,
  completed,
  isArabic,
  onZikr,
  onReset,
  onBack,
}: {
  catId: CategoryId;
  completed: Set<number>;
  isArabic: boolean;
  onZikr: (i: number) => void;
  onReset: () => void;
  onBack: () => void;
}) {
  const azkar = getAzkarByCategory(catId);
  const cat = CATEGORIES.find((c) => c.id === catId)!;
  const done = completed.size;
  const resumeIdx = azkar.findIndex((_, i) => !completed.has(i));
  const pct = Math.round((done / azkar.length) * 100);
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
    <div className="flex h-full flex-col bg-background">
      <Header
        title={isArabic ? cat.nameArabic : cat.name}
        subtitle={
          isArabic
            ? t(language, "category.remainingSubtitle", {
                remaining: formatNumerals(azkar.length - done, language),
                total: totalLabel,
              })
            : t(language, "category.completeSubtitle", { done: doneLabel, total: totalLabel })
        }
        onBack={onBack}
      />

      <div className="shrink-0 border-b border-border px-5 py-4">
        <div className="mb-2 flex items-center justify-between" dir={isArabic ? "rtl" : "ltr"}>
          <p className="text-[13px] font-bold text-muted-foreground">{t(language, "category.dailyProgress")}</p>
          <p
            className="text-[13px] font-bold text-primary"
            dir="ltr"
            style={{ fontFamily: numeralFontFamily(language), fontVariantNumeric: "tabular-nums lining-nums" }}
          >
            {formatNumerals(pct, language)}%
          </p>
        </div>
        <ProgressBar value={done} max={azkar.length} height={8} trackColor="var(--card)" fillColor="var(--primary)" />

        <div className="mt-4 flex w-full gap-3" dir={isArabic ? "rtl" : "ltr"}>
          {done > 0 && (
            <button
              onClick={onReset}
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#F5EBE9] text-[#7C3636] transition-all hover:bg-[#ebd9d5] active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-destructive dark:bg-red-950/30 dark:text-red-400 dark:hover:bg-red-950/50"
              aria-label={isArabic ? "إعادة تعيين" : "Reset Progress"}
            >
              <RotateCcw size={20} />
            </button>
          )}
          {done < azkar.length ? (
            <button
              onClick={() => onZikr(Math.max(0, resumeIdx))}
              className="flex h-12 flex-1 items-center justify-center gap-2 rounded-2xl bg-primary text-[15px] font-bold text-primary-foreground shadow-sm transition-all active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <ChevronNext size={18} className={isArabic ? "rotate-180" : ""} />
              {done === 0
                ? t(language, "category.startSession")
                : t(language, "category.resumeZikr", { index: formatNumerals(resumeIdx + 1, language) })}
            </button>
          ) : (
            <div
              className="flex h-12 flex-1 items-center justify-center gap-2 rounded-2xl"
              style={{
                background: "color-mix(in srgb, var(--primary) 15%, transparent)",
                border: "1px solid color-mix(in srgb, var(--primary) 40%, transparent)",
              }}
            >
              <Check size={18} className="text-primary" />
              <span className="text-[15px] font-bold text-primary">{t(language, "category.sessionComplete")}</span>
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-1 flex-col overflow-y-auto px-5 py-4">
        {remainingAzkar.length > 0 && (
          <div className="mb-6" dir={isArabic ? "rtl" : "ltr"}>
            <div className="mb-1 flex items-center justify-between">
              <h3 className="text-[13px] font-bold text-muted-foreground">{t(language, "category.remaining")}</h3>
            </div>
            <h4 className="mb-3 text-[13px] font-bold text-primary">{t(language, "category.nextAndRemaining")}</h4>
            <div className="flex flex-col gap-3">
              {remainingAzkar.map(({ z, index }, idx) => {
                const isNextUp = idx === 0;
                const countLabel = formatNumerals(z.countLabel ?? String(z.repetitionCount), language);

                return (
                  <button
                    key={z.id}
                    onClick={() => onZikr(index)}
                    className={`flex w-full items-center gap-3 rounded-[20px] p-3 transition-all active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                      isNextUp ? "border-2 border-primary bg-card shadow-sm" : "border border-border bg-card"
                    }`}
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border">
                      <span
                        className="text-[15px] font-medium text-foreground"
                        style={{
                          fontFamily: numeralFontFamily(language),
                          fontVariantNumeric: "tabular-nums lining-nums",
                        }}
                      >
                        {formatNumerals(index + 1, language)}
                      </span>
                    </div>

                    <div className="min-w-0 flex-1 text-center">
                      <p className="zikr-text text-[18px] font-medium leading-[28px] text-foreground" dir="rtl">
                        {z.arabicText.split("\n")[0]}
                      </p>
                    </div>

                    <div className="flex shrink-0 flex-row items-center gap-2">
                      {isNextUp && (
                        <span className="rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-[11px] font-bold text-primary">
                          {isArabic ? "التالي" : "Next"}
                        </span>
                      )}
                      <span className="rounded-full bg-blue-100 px-3 py-1 text-[12px] font-bold text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                        x{countLabel}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {completedAzkar.length > 0 && (
          <div className="mb-6" dir={isArabic ? "rtl" : "ltr"}>
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-[13px] font-bold text-muted-foreground">{t(language, "category.completed")}</h3>
            </div>
            <div className="flex flex-col gap-3">
              {completedAzkar.map(({ z, index }) => (
                <div
                  key={z.id}
                  className="flex w-full items-center gap-3 rounded-[20px] border border-border/50 bg-muted/40 p-3"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border/50 bg-muted">
                    <span
                      className="text-[15px] font-medium text-muted-foreground"
                      style={{
                        fontFamily: numeralFontFamily(language),
                        fontVariantNumeric: "tabular-nums lining-nums",
                      }}
                    >
                      {formatNumerals(index + 1, language)}
                    </span>
                  </div>

                  <div className="min-w-0 flex-1 text-center opacity-60">
                    <p className="zikr-text text-[18px] font-medium leading-[28px] text-muted-foreground" dir="rtl">
                      {z.arabicText.split("\n")[0]}
                    </p>
                  </div>

                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white">
                    <Check size={16} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
