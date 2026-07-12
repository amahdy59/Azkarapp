import React from "react";
import { Check, ChevronRight, RotateCcw } from "lucide-react";
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
  const orderedAzkar = azkar
    .map((z, i) => ({ z, index: i, isDone: completed.has(i) }))
    .sort((a, b) => Number(a.isDone) - Number(b.isDone) || a.z.orderIndex - b.z.orderIndex);

  return (
    <div className="flex h-full flex-col bg-background">
      <Header
        title={isArabic ? cat.nameArabic : cat.name}
        subtitle={isArabic ? `${doneLabel} / ${totalLabel}` : `${doneLabel} of ${totalLabel} complete`}
        onBack={onBack}
      />

      <div className="shrink-0 border-b border-border px-5 py-4">
        <div className="mb-2 flex items-center justify-between">
          <p className="text-[12px] text-muted-foreground">{t(language, "common.progress")}</p>
          <p
            className="text-[12px] font-bold text-primary"
            dir="ltr"
            style={{ fontFamily: numeralFontFamily(language), fontVariantNumeric: "tabular-nums lining-nums" }}
          >
            {formatNumerals(pct, language)}%
          </p>
        </div>
        <ProgressBar value={done} max={azkar.length} height={8} />

        <div className="mt-3 flex gap-2 w-full">
          {done < azkar.length ? (
            <button
              onClick={() => onZikr(Math.max(0, resumeIdx))}
              className="flex flex-1 h-12 items-center justify-center gap-2 rounded-xl bg-primary text-[15px] font-bold text-primary-foreground transition-all active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {done === 0
                ? t(language, "category.startSession")
                : t(language, "category.resumeZikr", { index: formatNumerals(resumeIdx + 1, language) })}
              <ChevronRight size={18} className="rtl:-scale-x-100" />
            </button>
          ) : (
            <div
              className="flex flex-1 h-12 items-center justify-center gap-2 rounded-xl"
              style={{
                background: "color-mix(in srgb, var(--primary) 15%, transparent)",
                border: "1px solid color-mix(in srgb, var(--primary) 40%, transparent)",
              }}
            >
              <Check size={18} className="text-primary" />
              <span className="text-[15px] font-bold text-primary">{t(language, "category.sessionComplete")}</span>
            </div>
          )}
          {done > 0 && (
            <button
              onClick={onReset}
              className="flex h-12 w-12 items-center justify-center rounded-xl bg-destructive/10 text-destructive transition-all hover:bg-destructive/15 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-destructive"
              aria-label={isArabic ? "إعادة تعيين" : "Reset Progress"}
            >
              <RotateCcw size={18} />
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-2 overflow-y-auto px-5 py-3">
        {orderedAzkar.map(({ z, index, isDone }, orderedIndex) => {
          const countLabel = formatNumerals(z.countLabel ?? String(z.repetitionCount), language);
          const isNextUp = !isDone && orderedIndex === 0;

          return (
            <button
              key={z.id}
              onClick={() => onZikr(index)}
              className="flex w-full items-center gap-3 rounded-xl bg-card p-4 text-start transition-all active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              style={{
                border: `1px solid ${isDone ? "color-mix(in srgb, var(--primary) 30%, transparent)" : "var(--border)"}`,
              }}
            >
              <div
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
                style={{
                  background: isDone ? "var(--primary)" : "transparent",
                  border: `2px solid ${isDone ? "var(--primary)" : "var(--muted)"}`,
                }}
              >
                {isDone ? (
                  <Check size={15} className="text-primary-foreground" />
                ) : (
                  <span
                    className="text-[12px] font-bold text-muted-foreground"
                    style={{ fontFamily: numeralFontFamily(language), fontVariantNumeric: "tabular-nums lining-nums" }}
                  >
                    {formatNumerals(index + 1, language)}
                  </span>
                )}
              </div>

              <div className="min-w-0 flex-1">
                <div className="mb-1 flex items-center gap-2">
                  {isNextUp && (
                    <span className="rounded-full bg-primary/12 px-2 py-0.5 text-[10px] font-bold text-primary">
                      {isArabic ? "التالي" : "Next up"}
                    </span>
                  )}
                  <p
                    className="min-w-0 truncate text-[16px] leading-[26px]"
                    dir="rtl"
                    style={{
                      color: isDone ? "var(--muted-foreground)" : "var(--foreground)",
                      fontFamily: "'Noto Naskh Arabic', serif",
                    }}
                  >
                    {z.arabicText.split("\n")[0]}
                  </p>
                </div>
                <p className="truncate text-[12px] italic leading-[18px] text-muted-foreground">
                  {z.transliteration.slice(0, 50)}...
                </p>
              </div>

              <RepBadge label={countLabel} done={isDone} language={language} />
            </button>
          );
        })}
      </div>
    </div>
  );
}
