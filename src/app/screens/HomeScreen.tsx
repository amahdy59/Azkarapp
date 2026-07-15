import { type CSSProperties, Fragment } from "react";
import { ChevronLeft } from "../components/icons";
import { CatIcon } from "../components/CatIcon";
import { ProgressBar } from "../components/ProgressBar";
import { getCategoryTotal } from "../content/azkar";
import { CATEGORIES } from "../content/categories";
import { formatNumerals } from "../formatting";
import type { AppLanguage, CategoryId } from "../types";

export function HomeScreen({
  completed,
  onCategory,
  language,
}: {
  completed: Record<CategoryId, Set<number>>;
  onCategory: (category: CategoryId) => void;
  language: AppLanguage;
}) {
  const isArabic = language === "ar";

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
          "--border": "#2c2c2e",
        } as CSSProperties
      }
    >
      <header className="relative flex h-14 shrink-0 items-center justify-center px-5">
        <button
          className="absolute left-5 flex h-10 w-10 items-center justify-center text-muted-foreground"
          aria-hidden="true"
        >
          <ChevronLeft size={24} />
        </button>
        <h1 className="text-[18px] font-bold text-foreground">{isArabic ? "الأذكار" : "Azkar"}</h1>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5">
        <div className="space-y-3">
          {CATEGORIES.map((category, index) => {
            const done = completed[category.id]?.size ?? 0;
            const totalCount = getCategoryTotal(category.id);
            const isDaily = ["morning", "evening", "before_sleep"].includes(category.id);

            return (
              <Fragment key={category.id}>
                {index === 3 && <div className="mx-6 my-2 h-[1px] bg-border opacity-50" aria-hidden="true" />}
                <button
                  type="button"
                  onClick={() => onCategory(category.id)}
                  dir={isArabic ? "rtl" : "ltr"}
                  data-testid={`category-card-${category.id}`}
                  className={`flex w-full items-center gap-4 rounded-[20px] border border-border bg-card p-4 text-start transition-transform active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${isDaily ? "min-h-[96px]" : "min-h-[76px]"}`}
                  aria-label={
                    isArabic
                      ? `${category.nameArabic}${isDaily ? `، ${formatNumerals(done, language)} من ${formatNumerals(totalCount, language)} مكتملة` : ""}`
                      : `${category.name}${isDaily ? `, ${done} of ${totalCount} complete` : ""}`
                  }
                >
                  <div
                    data-slot="category-icon"
                    className="flex h-[48px] w-[48px] shrink-0 items-center justify-center rounded-full bg-white"
                  >
                    <CatIcon type={category.icon} size={28} color="var(--primary)" />
                  </div>

                  <div className="flex min-w-0 flex-1 flex-col justify-center gap-3">
                    <div className="flex items-center justify-between gap-2">
                      <p data-slot="category-copy" className="text-[18px] font-bold text-foreground">
                        {isArabic ? category.nameArabic : category.name}
                      </p>
                      {isDaily && (
                        <span
                          className="whitespace-nowrap text-[13px] font-medium text-muted-foreground"
                          dir={isArabic ? "rtl" : "ltr"}
                        >
                          {isArabic
                            ? `${formatNumerals(done, language)} من ${formatNumerals(totalCount, language)}`
                            : `${done} of ${totalCount}`}
                        </span>
                      )}
                    </div>
                    {isDaily && (
                      <ProgressBar
                        value={done}
                        max={totalCount}
                        height={6}
                        trackColor="color-mix(in srgb, var(--primary) 15%, transparent)"
                        direction={isArabic ? "rtl" : "ltr"}
                        aria-label={isArabic ? `تقدم ${category.nameArabic}` : `${category.name} progress`}
                      />
                    )}
                  </div>

                  <ChevronLeft
                    size={20}
                    aria-hidden="true"
                    data-slot="category-chevron"
                    className={`shrink-0 text-[#6B6888] ${isArabic ? "" : "-scale-x-100"}`}
                  />
                </button>
              </Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );
}
