import React from "react";
import { Search, Check, ChevronRight, Flame, BookOpen } from "lucide-react";
import { t } from "../i18n";
import { CATEGORIES } from "../content/categories";
import { ALL_AZKAR } from "../content/azkar";
import type { AppLanguage, CategoryId } from "../types";
import { MaleAvatar } from "../components/Avatars";
import { CatIcon } from "../components/CatIcon";
import { ProgressBar } from "../components/ProgressBar";
import { formatNumerals, numeralFontFamily } from "../formatting";

export function HomeScreen({
  completed,
  displayName,
  currentStreak,
  longestStreak,
  onCategory,
  onFeaturedZikr,
  onSearch,
  language,
}: {
  completed: Record<CategoryId, Set<number>>;
  displayName: string;
  currentStreak: number;
  longestStreak: number;
  onCategory: (c: CategoryId) => void;
  onFeaturedZikr: (catId: CategoryId, index: number) => void;
  onSearch: () => void;
  language: AppLanguage;
}) {
  const h = new Date().getHours();
  const timeLabel =
    h < 12
      ? t(language, "home.goodMorning")
      : h < 17
        ? t(language, "home.goodAfternoon")
        : t(language, "home.goodEvening");
  const totalDone = Object.values(completed).reduce((s, set) => s + set.size, 0);
  const totalAll = CATEGORIES.reduce((s, c) => s + c.totalCount, 0);
  const localizedTotalDone = formatNumerals(totalDone, language);
  const localizedTotalAll = formatNumerals(totalAll, language);
  const startOfYear = new Date(new Date().getFullYear(), 0, 0);
  const today = new Date();
  const dayOfYear = Math.floor((today.getTime() - startOfYear.getTime()) / 86_400_000);
  const featuredZikr = ALL_AZKAR[dayOfYear % ALL_AZKAR.length] ?? ALL_AZKAR[0];
  if (!featuredZikr) {
    throw new Error("Azkar content is empty.");
  }

  const featuredCategory = CATEGORIES.find((item) => item.id === featuredZikr.category) ?? CATEGORIES[0];
  const featuredText = featuredZikr.hadithText || featuredZikr.arabicText;
  const featuredExcerpt = featuredText.length > 140 ? `${featuredText.slice(0, 140).trim()}...` : featuredText;
  const featuredIndex = ALL_AZKAR.filter((item) => item.category === featuredZikr.category).findIndex(
    (item) => item.id === featuredZikr.id,
  );

  return (
    <div className="flex h-full flex-col bg-background">
      <div className="shrink-0 px-5 pb-4 pt-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <MaleAvatar size={44} />
            <div>
              <p className="text-[12px] font-bold uppercase tracking-[0.08em] text-muted-foreground">{timeLabel}</p>
              <p className="text-[20px] font-extrabold leading-[26px] text-foreground">{displayName}</p>
            </div>
          </div>
          <button
            onClick={onSearch}
            aria-label="Search"
            className="flex h-11 w-11 items-center justify-center rounded-full bg-card transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Search size={18} className="text-foreground" />
          </button>
        </div>
      </div>

      {totalDone > 0 && (
        <div className="mb-4 px-5">
          <div className="rounded-2xl border border-border bg-card px-5 py-4">
            <div>
              <div className="mb-1.5 flex justify-between">
                <span className="text-[11px] text-muted-foreground">{t(language, "home.todaysProgress")}</span>
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
          </div>
        </div>
      )}

      {totalDone === 0 && (
        <div className="mb-4 px-5">
          <div className="flex flex-col items-center justify-center rounded-2xl border border-border bg-card px-5 py-6 text-center">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <BookOpen size={24} className="text-primary" />
            </div>
            <p className="text-[16px] font-bold text-foreground">{t(language, "home.startJourney")}</p>
            <p className="mt-1 text-[13px] text-muted-foreground">{t(language, "home.startJourneyDesc")}</p>
          </div>
        </div>
      )}
      <div className="flex flex-1 flex-col gap-3 overflow-y-auto px-5 pb-4">
        {CATEGORIES.map((cat) => {
          const done = completed[cat.id]?.size ?? 0;
          const complete = done === cat.totalCount;
          return (
            <button
              key={cat.id}
              onClick={() => onCategory(cat.id)}
              aria-label={`${cat.name}, ${done} of ${cat.totalCount} completed`}
              className="w-full rounded-2xl bg-card p-4 text-start transition-all active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              style={{
                border: `1px solid ${complete ? "color-mix(in srgb, var(--primary) 50%, transparent)" : "var(--border)"}`,
              }}
            >
              <div className="flex items-center gap-4">
                <div
                  className="flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-xl"
                  style={{
                    background: complete ? "color-mix(in srgb, var(--primary) 20%, transparent)" : "var(--muted)",
                  }}
                >
                  <CatIcon type={cat.icon} size={26} color="var(--primary)" />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="mb-0.5 flex items-center justify-between">
                    <p className="text-[16px] font-bold text-foreground">{cat.name}</p>
                    {complete ? (
                      <span
                        className="flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold text-primary"
                        style={{ background: "color-mix(in srgb, var(--primary) 20%, transparent)" }}
                      >
                        <Check size={10} /> Done
                      </span>
                    ) : (
                      <span className="text-[12px] text-muted-foreground">
                        {formatNumerals(done, language)}/{formatNumerals(cat.totalCount, language)}
                      </span>
                    )}
                  </div>
                  <p
                    className="mb-2 text-[14px] text-muted-foreground"
                    style={{ fontFamily: "'Noto Naskh Arabic', serif" }}
                  >
                    {cat.nameArabic}
                  </p>
                  <ProgressBar value={done} max={cat.totalCount} height={7} />
                </div>

                <ChevronRight size={16} className="shrink-0 text-muted-foreground rtl:-scale-x-100" />
              </div>
            </button>
          );
        })}

        <div className="flex items-center gap-4 rounded-2xl border border-border bg-card p-4">
          <div
            className="flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-xl"
            style={{ background: "color-mix(in srgb, var(--primary) 15%, transparent)" }}
          >
            <Flame size={24} className="text-primary" />
          </div>
          <div className="flex-1">
            <p className="text-[13px] text-muted-foreground">{t(language, "home.currentStreak")}</p>
            <p
              className="text-[20px] font-extrabold text-primary"
              dir="ltr"
              style={{ fontFamily: numeralFontFamily(language), fontVariantNumeric: "tabular-nums lining-nums" }}
            >
              {formatNumerals(currentStreak, language)}{" "}
              {t(language, currentStreak === 1 ? "home.daySuffix" : "home.daysSuffix")}
            </p>
          </div>
          <div className="text-end">
            <p className="text-[12px] text-muted-foreground">{t(language, "home.best")}</p>
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
