import { ChevronLeft, Leaf, Menu, Search, Sprout } from "lucide-react";
import { CatIcon } from "../components/CatIcon";
import { ProgressBar } from "../components/ProgressBar";
import { ALL_AZKAR } from "../content/azkar";
import { CATEGORIES } from "../content/categories";
import { formatNumerals } from "../formatting";
import type { AppLanguage, CategoryId } from "../types";

export function HomeScreen({
  completed,
  currentStreak,
  onCategory,
  onFeaturedZikr,
  onSearch,
  language,
}: {
  completed: Record<CategoryId, Set<number>>;
  displayName: string;
  currentStreak: number;
  longestStreak: number;
  onCategory: (category: CategoryId) => void;
  onFeaturedZikr: (category: CategoryId, index: number) => void;
  onSearch: () => void;
  language: AppLanguage;
}) {
  const isArabic = language === "ar";
  const day = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86_400_000);
  const featured = ALL_AZKAR[day % ALL_AZKAR.length] ?? ALL_AZKAR[0];
  const featuredIndex = featured
    ? ALL_AZKAR.filter((item) => item.category === featured.category).findIndex((item) => item.id === featured.id)
    : 0;
  const hijriDate = new Intl.DateTimeFormat(isArabic ? "ar-SA-u-ca-islamic" : "en-US-u-ca-islamic", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date());

  return (
    <div className="flex h-full flex-col bg-background" dir={isArabic ? "rtl" : "ltr"}>
      <header className="grid h-14 shrink-0 grid-cols-[44px_1fr_44px] items-center px-5">
        <button
          type="button"
          onClick={onSearch}
          aria-label="Search"
          className="flex h-11 w-11 items-center justify-center rounded-full"
        >
          <Search size={19} />
        </button>
        <div className="flex items-center justify-center gap-7" dir="ltr">
          <span className="flex items-center gap-1 text-[13px] font-bold text-secondary">
            <Leaf size={18} />
            {formatNumerals(currentStreak, language)}
          </span>
          <h1 className="text-[17px] font-bold text-foreground">{isArabic ? "الأذكار" : "Azkar"}</h1>
          <span className="flex items-center gap-1 text-[13px] font-bold text-secondary">
            <Sprout size={18} />
            {formatNumerals(3, language)}
          </span>
        </div>
        <button type="button" aria-label="Menu" className="flex h-11 w-11 items-center justify-center rounded-full">
          <Menu size={19} />
        </button>
      </header>

      <p className="shrink-0 px-9 pb-2 text-end text-[13px] font-semibold text-card-foreground">{hijriDate}</p>

      {featured && (
        <button
          type="button"
          onClick={() => onFeaturedZikr(featured.category, featuredIndex)}
          className="relative min-h-[111px] shrink-0 overflow-hidden bg-[linear-gradient(110deg,var(--card),color-mix(in_srgb,var(--primary)_12%,var(--background)))] px-7 py-4 text-end"
        >
          <p className="text-[16px] font-bold text-foreground">
            {isArabic ? "حان وقت أذكارك" : "It’s time for your azkar"}
          </p>
          <p className={`mt-1 line-clamp-1 text-[12px] text-muted-foreground ${isArabic ? "zikr-text" : ""}`}>
            {isArabic ? featured.arabicText : featured.translation}
          </p>
          <p className="mt-3 text-[14px] font-bold text-primary">{isArabic ? "ابدأ الآن" : "Begin now"} ←</p>
        </button>
      )}

      <div className="flex-1 space-y-3 overflow-y-auto px-5 py-5">
        {CATEGORIES.map((category) => {
          const done = completed[category.id]?.size ?? 0;
          const percent = category.totalCount ? Math.round((done / category.totalCount) * 100) : 0;
          return (
            <button
              key={category.id}
              type="button"
              onClick={() => onCategory(category.id)}
              className="flex min-h-[104px] w-full items-center gap-2 rounded-2xl border border-border bg-card p-4 text-start"
              aria-label={`${isArabic ? category.nameArabic : category.name}, ${done} of ${category.totalCount} complete`}
            >
              <ChevronLeft size={22} className="shrink-0 text-card-foreground rtl:-scale-x-100" />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-3">
                  <CatIcon type={category.icon} size={24} color="var(--primary)" />
                  <p className="flex-1 text-end text-[16px] font-bold text-foreground">
                    {isArabic ? category.nameArabic : category.name}
                  </p>
                </div>
                <div className="mt-2 flex items-center justify-between text-[12px] text-muted-foreground">
                  <span>{formatNumerals(percent, language)}%</span>
                  <span>
                    {formatNumerals(done, language)} {isArabic ? "من" : "of"}{" "}
                    {formatNumerals(category.totalCount, language)} {isArabic ? "مكتملة" : "complete"}
                  </span>
                </div>
                <div className="mt-1">
                  <ProgressBar value={done} max={category.totalCount} height={4} />
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
