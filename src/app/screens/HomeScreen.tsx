import type { CSSProperties } from "react";
import { ArrowNext, ChevronLeft, Leaf, Sprout, Search } from "../components/icons";
import beforeSleepScene from "../../assets/home/before-sleep-scene.png";
import eveningScene from "../../assets/home/evening-scene.png";
import morningScene from "../../assets/home/morning-scene.png";
import { CatIcon } from "../components/CatIcon";
import { ProgressBar } from "../components/ProgressBar";
import { ALL_AZKAR, getCategoryTotal } from "../content/azkar";
import { CATEGORIES } from "../content/categories";
import { formatNumerals } from "../formatting";
import type { AppLanguage, CategoryId } from "../types";

const FEATURED_SCENES: Record<CategoryId, string> = {
  morning: morningScene,
  evening: eveningScene,
  before_sleep: beforeSleepScene,
};

const FEATURED_COPY: Record<
  CategoryId,
  { ar: { title: string; description: string; cta: string }; en: { title: string; description: string; cta: string } }
> = {
  morning: {
    ar: {
      title: "حان وقت أذكار الصباح",
      description: "أذكار الصباح تُقرأ بعد صلاة الفجر حتى الشروق",
      cta: "ابدأ أذكار الصباح",
    },
    en: {
      title: "It’s time for Morning Azkar",
      description: "Read after Fajr until sunrise",
      cta: "Begin Morning Azkar",
    },
  },
  evening: {
    ar: {
      title: "حان وقت أذكار المساء",
      description: "أذكار المساء تُقرأ بعد صلاة العصر حتى المغرب",
      cta: "ابدأ أذكار المساء",
    },
    en: {
      title: "It’s time for Evening Azkar",
      description: "Read after Asr until Maghrib",
      cta: "Begin Evening Azkar",
    },
  },
  before_sleep: {
    ar: { title: "حان وقت أذكار النوم", description: "أذكار النوم تُقرأ عند الاستعداد للنوم", cta: "ابدأ أذكار النوم" },
    en: { title: "It’s time for Sleep Azkar", description: "Read as you prepare for sleep", cta: "Begin Sleep Azkar" },
  },
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
  onFeaturedZikr: (category: CategoryId, itemIndex: number) => void;
  onSearch: () => void;
  language: AppLanguage;
}) {
  const isArabic = language === "ar";
  const featuredCategory = getScheduledCategory(new Date());
  const featured = ALL_AZKAR.find((item) => item.category === featuredCategory) ?? ALL_AZKAR[0];
  const copy = FEATURED_COPY[featuredCategory][isArabic ? "ar" : "en"];
  const hijriDate = new Intl.DateTimeFormat(isArabic ? "ar-SA-u-ca-islamic" : "en-US-u-ca-islamic", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date());

  return (
    <div
      className="flex h-full flex-col bg-background"
      dir={isArabic ? "rtl" : "ltr"}
      style={
        {
          "--background": "#0d0d0d",
          "--foreground": "#f5f0e8",
          "--card": "#171717",
          "--card-foreground": "#b0aed0",
          "--muted-foreground": "#b0aed0",
          "--border": "#555555",
        } as CSSProperties
      }
    >
      <header className="grid h-14 shrink-0 grid-cols-[40px_1fr_40px] items-center px-5">
        <span aria-hidden="true" />
        <div className="flex items-center justify-between" dir="ltr">
          <span className="flex items-center gap-1 text-[15px] font-bold text-[#5ec88a]">
            <Leaf size={20} aria-hidden="true" />
            {formatNumerals(currentStreak, language)}
          </span>
          <h1 className="text-[18px] font-bold text-foreground">{isArabic ? "الأذكار" : "Azkar"}</h1>
          <span className="flex items-center gap-1 text-[15px] font-bold text-[#5ec88a]">
            <Sprout size={20} aria-hidden="true" />
            {formatNumerals(3, language)}
          </span>
        </div>
        <button
          type="button"
          onClick={onSearch}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-card text-muted-foreground transition-transform active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label={isArabic ? "البحث" : "Search"}
        >
          <Search size={20} aria-hidden="true" />
        </button>
      </header>

      <p className="shrink-0 px-9 pb-2 text-start text-[14px] font-bold text-card-foreground">{hijriDate}</p>

      {featured && (
        <button
          type="button"
          onClick={() => onFeaturedZikr(featured.category, 0)}
          className="featured-card relative min-h-[142px] shrink-0 overflow-hidden px-8 py-4 text-start"
          aria-label={copy.title}
        >
          <img
            src={FEATURED_SCENES[featuredCategory]}
            alt=""
            aria-hidden="true"
            className="featured-scene absolute inset-0 h-full w-full object-cover"
          />
          <div className="relative z-10 flex h-full flex-col items-start">
            <p className="text-[16px] font-bold text-foreground">{copy.title}</p>
            <p className="mt-4 text-[13px] text-muted-foreground">{copy.description}</p>
            <span className="mt-4 inline-flex items-center gap-1.5 text-[14px] font-bold text-primary">
              {copy.cta}
              <ArrowNext size={18} className={isArabic ? "rotate-180" : ""} aria-hidden="true" />
            </span>
          </div>
        </button>
      )}

      <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5">
        <div className="space-y-3">
          {CATEGORIES.map((category) => {
            const done = completed[category.id]?.size ?? 0;
            const totalCount = getCategoryTotal(category.id);
            const percent = totalCount ? Math.round((done / totalCount) * 100) : 0;
            return (
              <button
                key={category.id}
                type="button"
                onClick={() => onCategory(category.id)}
                dir="ltr"
                data-testid={`category-card-${category.id}`}
                className={`grid min-h-[104px] w-full grid-rows-[auto_auto_auto] items-center gap-x-3 rounded-2xl border border-border bg-card p-4 text-start ${isArabic ? "grid-cols-[20px_36px_minmax(0,1fr)]" : "grid-cols-[minmax(0,1fr)_36px_20px]"}`}
                aria-label={
                  isArabic
                    ? `${category.nameArabic}، ${formatNumerals(done, language)} من ${formatNumerals(totalCount, language)} مكتملة`
                    : `${category.name}, ${done} of ${totalCount} complete`
                }
              >
                <ChevronLeft
                  size={22}
                  aria-hidden="true"
                  data-slot="category-chevron"
                  className={`row-span-3 self-center text-card-foreground ${isArabic ? "col-start-1" : "col-start-3 -scale-x-100"}`}
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
                  <p className="mt-1 text-[13px] text-muted-foreground">
                    {formatNumerals(done, language)} {isArabic ? "من" : "of"} {formatNumerals(totalCount, language)}{" "}
                    {isArabic ? "مكتملة" : "complete"}
                  </p>
                </div>
                <div className={`mt-2 ${isArabic ? "col-start-2 col-end-4" : "col-start-1 col-end-3"}`}>
                  <ProgressBar
                    value={done}
                    max={totalCount}
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
    </div>
  );
}
