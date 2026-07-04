import React from "react";
import { Search, Check, ChevronRight, Flame } from "lucide-react";
import { t } from "../i18n";
import { CATEGORIES } from "../content/categories";
import type { AppLanguage, CategoryId } from "../types";
import { MaleAvatar } from "../components/Avatars";
import { CatIcon } from "../components/CatIcon";
import { ProgressBar } from "../components/ProgressBar";
import { formatNumerals, numeralFontFamily } from "../formatting";

export function HomeScreen({ completed, displayName, currentStreak, longestStreak, onCategory, onSearch, language }:
  {
    completed: Record<CategoryId, Set<number>>;
    displayName: string;
    currentStreak: number;
    longestStreak: number;
    onCategory: (c: CategoryId) => void;
    onSearch: () => void;
    language: AppLanguage;
  }) {
  const h = new Date().getHours();
  const timeLabel = h < 12 ? t(language, "home.goodMorning") : h < 17 ? t(language, "home.goodAfternoon") : t(language, "home.goodEvening");
  const totalDone = Object.values(completed).reduce((s, set) => s + set.size, 0);
  const totalAll  = CATEGORIES.reduce((s, c) => s + c.totalCount, 0);
  const localizedTotalDone = formatNumerals(totalDone, language);
  const localizedTotalAll = formatNumerals(totalAll, language);

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Top bar */}
      <div className="flex items-center justify-between px-5 pt-5 pb-4 shrink-0">
        <div className="flex items-center gap-3">
          <MaleAvatar size={44} />
          <div>
            <p className="text-[12px] text-muted-foreground font-sans font-bold tracking-[0.08em] uppercase">{timeLabel}</p>
            <p className="text-[20px] text-foreground font-sans font-extrabold leading-[26px]">{displayName}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={onSearch}
            aria-label="Search"
            className="flex items-center justify-center rounded-full transition-colors w-11 h-11 bg-card hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
            <Search size={18} className="text-foreground" />
          </button>
        </div>
      </div>

      {/* Arabic greeting */}
      <div className="px-5 mb-4">
        <div className="rounded-2xl px-5 py-4 bg-card border border-border">
          <p className="text-center text-[24px] text-primary font-bold leading-[38px]" style={{ fontFamily: "'Noto Naskh Arabic', serif" }}>
            السَّلَامُ عَلَيْكُم وَرَحْمَةُ اللَّهِ
          </p>
          {totalDone > 0 && (
            <div className="mt-3">
              <div className="flex justify-between mb-1.5">
                <span className="text-[11px] text-muted-foreground font-sans">{t(language, "home.todaysProgress")}</span>
                <span
                  className="text-[12px] font-bold text-primary"
                  dir="ltr"
                  style={{ fontFamily: numeralFontFamily(language), fontVariantNumeric: "tabular-nums lining-nums" }}
                >
                  {localizedTotalDone}/{localizedTotalAll}
                </span>
              </div>
              <ProgressBar value={totalDone} max={totalAll} height={6} />
            </div>
          )}
        </div>
      </div>

      {/* Category cards */}
      <div className="flex-1 overflow-y-auto px-5 flex flex-col gap-3 pb-4">
        {CATEGORIES.map(cat => {
          const done = completed[cat.id]?.size ?? 0;
          const complete = done === cat.totalCount;
          return (
            <button key={cat.id} onClick={() => onCategory(cat.id)}
              aria-label={`${cat.name}, ${done} of ${cat.totalCount} completed`}
              className="w-full text-start rounded-2xl p-4 transition-all active:scale-[0.98] bg-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              style={{ border: `1px solid ${complete ? "color-mix(in srgb, var(--primary) 50%, transparent)" : "var(--border)"}` }}>
              <div className="flex items-center gap-4">
                {/* Icon circle */}
                <div className="flex items-center justify-center rounded-xl shrink-0 w-[52px] h-[52px]"
                  style={{ background: complete ? "color-mix(in srgb, var(--primary) 20%, transparent)" : "var(--muted)" }}>
                  <CatIcon type={cat.icon} size={26} color="var(--primary)" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <p className="text-[16px] font-bold text-foreground font-sans">{cat.name}</p>
                    {complete
                      ? <span className="flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] text-primary font-sans font-bold" style={{ background: "color-mix(in srgb, var(--primary) 20%, transparent)" }}>
                          <Check size={10} /> Done
                        </span>
                      : <span className="text-[12px] text-muted-foreground font-sans">{formatNumerals(done, language)}/{formatNumerals(cat.totalCount, language)}</span>
                    }
                  </div>
                  <p className="mb-2 text-[14px] text-muted-foreground" style={{ fontFamily: "'Noto Naskh Arabic', serif" }}>{cat.nameArabic}</p>
                  <ProgressBar value={done} max={cat.totalCount} height={7} />
                </div>

                <ChevronRight size={16} className="text-muted-foreground shrink-0 rtl:-scale-x-100" />
              </div>
            </button>
          );
        })}

        {/* Streak card */}
        <div className="rounded-2xl p-4 flex items-center gap-4 bg-card border border-border">
          <div className="flex items-center justify-center rounded-xl shrink-0 w-[52px] h-[52px]"
            style={{ background: "color-mix(in srgb, var(--primary) 15%, transparent)" }}>
            <Flame size={24} className="text-primary" />
          </div>
          <div className="flex-1">
            <p className="text-[13px] text-muted-foreground font-sans">{t(language, "home.currentStreak")}</p>
            <p
              className="text-[20px] font-extrabold text-primary"
              dir="ltr"
              style={{ fontFamily: numeralFontFamily(language), fontVariantNumeric: "tabular-nums lining-nums" }}
            >
              {formatNumerals(currentStreak, language)} {t(language, currentStreak === 1 ? "home.daySuffix" : "home.daysSuffix")}
            </p>
          </div>
          <div className="text-end">
            <p className="text-[12px] text-muted-foreground font-sans">{t(language, "home.best")}</p>
            <p
              className="text-[16px] font-bold text-card-foreground"
              dir="ltr"
              style={{ fontFamily: numeralFontFamily(language), fontVariantNumeric: "tabular-nums lining-nums" }}
            >
              {formatNumerals(longestStreak, language)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
