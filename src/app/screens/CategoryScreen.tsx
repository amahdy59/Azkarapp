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
      <Header title={isArabic ? cat.nameArabic : cat.name} onBack={onBack} />

      <div className="shrink-0 border-b border-border px-5 py-4">
        <div className="mb-2 flex items-center justify-between" dir={isArabic ? "rtl" : "ltr"}>
          <p className="text-[13px] font-bold text-muted-foreground">{t(language, "category.dailyProgress")}</p>
          <p
            className="text-[13px] font-bold text-muted-foreground"
            dir="auto"
            style={{ fontFamily: numeralFontFamily(language), fontVariantNumeric: "tabular-nums lining-nums" }}
          >
            {isArabic ? `${formatNumerals(done, language)} من ${totalLabel}` : `${doneLabel} of ${totalLabel}`}
          </p>
        </div>
        <ProgressBar value={done} max={azkar.length} height={8} trackColor="var(--card)" fillColor="var(--primary)" />

        <div className="mt-4 flex w-full gap-3" dir="ltr">
          {done > 0 && (
            <button
              onClick={onReset}
              className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#F5EBE9] text-[#7C3636] transition-all hover:bg-[#ebd9d5] active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-destructive dark:bg-red-950/30 dark:text-red-400 dark:hover:bg-red-950/50"
              aria-label={isArabic ? "إعادة تعيين" : "Reset Progress"}
            >
              <RotateCcw size={22} />
            </button>
          )}
          {done < azkar.length ? (
            <button
              onClick={() => onZikr(Math.max(0, resumeIdx))}
              className="flex h-14 flex-1 items-center justify-center gap-2 rounded-2xl bg-primary text-[16px] font-bold text-primary-foreground shadow-sm transition-all active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              dir={isArabic ? "rtl" : "ltr"}
            >
              <ChevronNext size={20} className={isArabic ? "rotate-180" : ""} />
              {done === 0 ? t(language, "category.startSession") : t(language, "common.continue")}
            </button>
          ) : (
            <div
              className="flex h-14 flex-1 items-center justify-center gap-2 rounded-2xl"
              style={{
                background: "color-mix(in srgb, var(--primary) 15%, transparent)",
                border: "1px solid color-mix(in srgb, var(--primary) 40%, transparent)",
              }}
              dir={isArabic ? "rtl" : "ltr"}
            >
              <Check size={20} className="text-primary" />
              <span className="text-[16px] font-bold text-primary">{t(language, "category.sessionComplete")}</span>
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-1 flex-col overflow-y-auto px-5 py-4">
        {completedAzkar.length > 0 && (
          <div className="mb-6" dir={isArabic ? "rtl" : "ltr"}>
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-[13px] font-bold text-muted-foreground">{t(language, "category.completed")}</h3>
            </div>
            <div className="flex flex-col gap-3">
              {completedAzkar.map(({ z, index }) => {
                const countLabel = formatNumerals(z.countLabel ?? String(z.repetitionCount), language);
                return (
                  <button
                    key={z.id}
                    onClick={() => onZikr(index)}
                    className="flex w-full items-center gap-3 rounded-[16px] border border-border bg-card p-3 transition-all active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    dir="ltr"
                  >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                      <Check size={16} />
                    </div>

                    <div className="min-w-0 flex-1 opacity-70">
                      <p
                        className="zikr-text truncate text-right text-[16px] font-medium leading-[26px] text-foreground"
                        dir="rtl"
                      >
                        {z.arabicText.split("\n")[0]}
                      </p>
                    </div>

                    <div className="flex shrink-0 items-center justify-center rounded-xl bg-muted/60 px-3 py-1.5 opacity-70">
                      <span className="text-[13px] font-bold text-muted-foreground">x{countLabel}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {remainingAzkar.length > 0 && (
          <div className="mb-6" dir={isArabic ? "rtl" : "ltr"}>
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-[13px] font-bold text-muted-foreground">{t(language, "category.remaining")}</h3>
            </div>
            <div className="flex flex-col gap-3">
              {remainingAzkar.map(({ z, index }) => {
                const countLabel = formatNumerals(z.countLabel ?? String(z.repetitionCount), language);

                return (
                  <button
                    key={z.id}
                    onClick={() => onZikr(index)}
                    className="flex w-full items-center gap-3 rounded-[16px] border border-border bg-card p-3 transition-all active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    dir="ltr"
                  >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-[1.5px] border-muted-foreground/40">
                      {/* Empty circle */}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p
                        className="zikr-text truncate text-right text-[16px] font-medium leading-[26px] text-foreground"
                        dir="rtl"
                      >
                        {z.arabicText.split("\n")[0]}
                      </p>
                    </div>

                    <div className="flex shrink-0 items-center justify-center rounded-xl bg-muted/60 px-3 py-1.5">
                      <span className="text-[13px] font-bold text-muted-foreground">x{countLabel}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
