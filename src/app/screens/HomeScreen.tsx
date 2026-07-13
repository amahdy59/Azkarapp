import { ArrowLeft, ArrowRight, ChevronLeft, Leaf, Menu, Search, Sprout } from "lucide-react";
import beforeSleepScene from "../../assets/home/before-sleep-scene.png";
import eveningScene from "../../assets/home/evening-scene.png";
import morningScene from "../../assets/home/morning-scene.png";
import { CatIcon } from "../components/CatIcon";
import { ProgressBar } from "../components/ProgressBar";
import { ALL_AZKAR } from "../content/azkar";
import { CATEGORIES } from "../content/categories";
import { formatNumerals } from "../formatting";
import type { AppLanguage, CategoryId } from "../types";

const FEATURED_SCENES: Record<CategoryId, string> = {
  morning: morningScene,
  evening: eveningScene,
  before_sleep: beforeSleepScene,
};

const FEATURED_TITLES: Record<CategoryId, { ar: string; en: string }> = {
  morning: { ar: "حان وقت أذكار الصباح", en: "It’s time for Morning Azkar" },
  evening: { ar: "حان وقت أذكار المساء", en: "It’s time for Evening Azkar" },
  before_sleep: { ar: "حان وقت أذكار النوم", en: "It’s time for Before-Sleep Azkar" },
};

export function getScheduledCategory(date: Date): CategoryId {
  const hour = date.getHours();
  if (hour >= 5 && hour < 15) return "morning";
  if (hour >= 15 && hour < 21) return "evening";
  return "before_sleep";
}

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
  const featuredCategory = getScheduledCategory(new Date());
  const featured = ALL_AZKAR.find((item) => item.category === featuredCategory) ?? ALL_AZKAR[0];
  const featuredIndex = 0;
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

      <p className="shrink-0 px-9 pb-2 text-start text-[13px] font-semibold text-card-foreground">{hijriDate}</p>

      {featured && (
        <button
          type="button"
          onClick={() => onFeaturedZikr(featured.category, featuredIndex)}
          className="featured-card relative min-h-[111px] shrink-0 overflow-hidden px-7 py-4 text-start"
          aria-label={FEATURED_TITLES[featuredCategory][isArabic ? "ar" : "en"]}
        >
          <img
            src={FEATURED_SCENES[featuredCategory]}
            alt=""
            aria-hidden="true"
            className="featured-scene absolute inset-0 h-full w-full object-fill"
          />
          <div className="relative z-10 max-w-[88%]">
            <p className="text-[16px] font-bold text-foreground">
              {FEATURED_TITLES[featuredCategory][isArabic ? "ar" : "en"]}
            </p>
            <p
              lang={isArabic ? "ar" : "en"}
              className={`mt-1 line-clamp-1 text-[12px] text-muted-foreground ${isArabic ? "zikr-text" : ""}`}
            >
              {isArabic ? featured.arabicText : featured.translation}
            </p>
            <span className="mt-3 inline-flex items-center gap-1.5 text-[14px] font-bold text-primary">
              {isArabic ? "ابدأ الآن" : "Begin now"}
              {isArabic ? <ArrowLeft size={17} aria-hidden="true" /> : <ArrowRight size={17} aria-hidden="true" />}
            </span>
          </div>
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
              dir="ltr"
              data-testid={`category-card-${category.id}`}
              className={`grid min-h-[104px] w-full grid-rows-[auto_auto_auto] items-center gap-x-3 rounded-2xl border border-border bg-card p-4 text-start ${
                isArabic ? "grid-cols-[20px_36px_minmax(0,1fr)]" : "grid-cols-[minmax(0,1fr)_36px_20px]"
              }`}
              aria-label={
                isArabic
                  ? `${category.nameArabic}، ${formatNumerals(done, language)} من ${formatNumerals(category.totalCount, language)} مكتملة`
                  : `${category.name}, ${done} of ${category.totalCount} complete`
              }
            >
              <ChevronLeft
                size={22}
                aria-hidden="true"
                data-slot="category-chevron"
                className={`row-span-3 self-center text-card-foreground ${
                  isArabic ? "col-start-1" : "col-start-3 -scale-x-100"
                }`}
              />

              <div
                data-slot="category-icon"
                className="col-start-2 row-span-2 flex flex-col items-center justify-center gap-2 self-center"
              >
                <CatIcon type={category.icon} size={24} color="var(--primary)" />
                <span className="text-[12px] text-muted-foreground">{formatNumerals(percent, language)}%</span>
              </div>

              <div
                dir={isArabic ? "rtl" : "ltr"}
                data-slot="category-copy"
                className={`min-w-0 self-center ${isArabic ? "col-start-3 text-right" : "col-start-1 text-left"}`}
              >
                <p className="text-[16px] font-bold text-foreground">
                  {isArabic ? category.nameArabic : category.name}
                </p>
                <p className="mt-1 text-[12px] text-muted-foreground">
                  {formatNumerals(done, language)} {isArabic ? "من" : "of"}{" "}
                  {formatNumerals(category.totalCount, language)} {isArabic ? "مكتملة" : "complete"}
                </p>
              </div>

              <div className={`mt-2 ${isArabic ? "col-start-2 col-end-4" : "col-start-1 col-end-3"}`}>
                <ProgressBar
                  value={done}
                  max={category.totalCount}
                  height={4}
                  direction={isArabic ? "rtl" : "ltr"}
                  aria-label={isArabic ? `تقدم ${category.nameArabic}` : `${category.name} progress`}
                />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
