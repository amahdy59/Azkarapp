import React from "react";
import { Check, ChevronRight } from "lucide-react";
import { t } from "../i18n";
import { CATEGORIES } from "../content/categories";
import { getAzkarByCategory } from "../content/azkar";
import type { CategoryId } from "../types";
import { Header } from "../components/LayoutShells";
import { ProgressBar } from "../components/ProgressBar";
import { RepBadge } from "../components/ZikrComponents";

export function CategoryScreen({ catId, completed, isArabic, onZikr, onBack }:
  { catId: CategoryId; completed: Set<number>; isArabic: boolean; onZikr: (i: number) => void; onBack: () => void }) {
  const azkar = getAzkarByCategory(catId);
  const cat   = CATEGORIES.find(c => c.id === catId)!;
  const done  = completed.size;
  const resumeIdx = azkar.findIndex((_, i) => !completed.has(i));
  const pct = Math.round((done / azkar.length) * 100);

  return (
    <div className="flex flex-col h-full bg-background">
      <Header title={isArabic ? cat.nameArabic : cat.name} subtitle={isArabic ? `${done} / ${azkar.length}` : `${done} of ${azkar.length} complete`} onBack={onBack} />

      {/* Progress strip */}
      <div className="px-5 py-4 shrink-0 border-b border-border">
        <div className="flex items-center justify-between mb-2">
          <p className="text-[12px] text-muted-foreground font-sans">
            {isArabic ? "التقدم" : "Progress"}
          </p>
          <p className="text-[12px] font-bold text-primary" style={{ fontFamily: "DM Mono, monospace" }}>{pct}%</p>
        </div>
        <ProgressBar value={done} max={azkar.length} height={8} />

        {done < azkar.length && (
          <button onClick={() => onZikr(Math.max(0, resumeIdx))}
            className="w-full mt-3 rounded-xl font-bold transition-all active:scale-95 flex items-center justify-center gap-2 h-12 bg-primary text-primary-foreground text-[15px] font-sans focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
            {done === 0
              ? t(isArabic ? "ar" : "en", "category.startSession")
              : t(isArabic ? "ar" : "en", "category.resumeZikr", { count: resumeIdx + 1 })}
            <ChevronRight size={18} className="rtl:-scale-x-100" />
          </button>
        )}
        {done === azkar.length && (
          <div className="w-full mt-3 rounded-xl flex items-center justify-center gap-2 h-12"
            style={{ background: "color-mix(in srgb, var(--primary) 15%, transparent)", border: "1px solid color-mix(in srgb, var(--primary) 40%, transparent)" }}>
            <Check size={18} className="text-primary" />
            <span className="text-primary text-[15px] font-bold font-sans">
              {t(isArabic ? "ar" : "en", "category.sessionComplete")}
            </span>
          </div>
        )}
      </div>

      {/* Zikr list */}
      <div className="flex-1 overflow-y-auto px-5 py-3 flex flex-col gap-2">
        {azkar.map((z, i) => {
          const isDone = completed.has(i);
          return (
            <button key={z.id} onClick={() => onZikr(i)}
              className="w-full text-start rounded-xl p-4 flex items-center gap-3 transition-all active:scale-[0.98] bg-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              style={{ border: `1px solid ${isDone ? "color-mix(in srgb, var(--primary) 30%, transparent)" : "var(--border)"}` }}>
              {/* Status circle */}
              <div className="flex items-center justify-center rounded-full shrink-0 w-9 h-9"
                style={{
                  background: isDone ? "var(--primary)" : "transparent",
                  border: `2px solid ${isDone ? "var(--primary)" : "var(--muted)"}` }}>
                {isDone
                  ? <Check size={15} className="text-primary-foreground" />
                  : <span className="text-[12px] font-bold text-muted-foreground" style={{ fontFamily: "DM Mono, monospace" }}>{i + 1}</span>
                }
              </div>

              <div className="flex-1 min-w-0">
                <p className="mb-0.5 truncate text-[16px] leading-[26px]" dir="rtl"
                  style={{ color: isDone ? "var(--muted-foreground)" : "var(--foreground)", fontFamily: "'Noto Naskh Arabic', serif" }}>
                  {z.arabicText.split("\n")[0]}
                </p>
                <p className="truncate text-[11px] text-muted-foreground font-sans italic">
                  {z.transliteration.slice(0, 50)}…
                </p>
              </div>

              <RepBadge count={z.repetitionCount} done={isDone} />
            </button>
          );
        })}
      </div>
    </div>
  );
}
