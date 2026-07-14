import { CatIcon } from "../components/CatIcon";
import { ChevronNext, Search } from "../components/icons";
import { CATEGORIES } from "../content/categories";
import { getCategoryTotal } from "../content/azkar";
import { formatNumerals } from "../formatting";
import type { AppLanguage, CategoryId } from "../types";

export function AzkarLibraryScreen({
  completed,
  language,
  onCategory,
  onSearch,
}: {
  completed: Record<CategoryId, Set<number>>;
  language: AppLanguage;
  onCategory: (category: CategoryId) => void;
  onSearch: () => void;
}) {
  const isArabic = language === "ar";

  return (
    <div className="flex h-full flex-col bg-background" dir={isArabic ? "rtl" : "ltr"}>
      <header className="shrink-0 px-5 pb-4 pt-3">
        <h1 className="text-[24px] font-extrabold text-foreground">{isArabic ? "مكتبة الأذكار" : "Azkar Library"}</h1>
        <p className="mt-1 text-[13px] text-muted-foreground">
          {isArabic ? "ابحث أو اختر مجموعة لبدء الذكر" : "Search or choose a collection to begin"}
        </p>
        <button
          type="button"
          onClick={onSearch}
          className="mt-4 flex h-12 w-full items-center gap-3 rounded-2xl border border-border bg-card px-4 text-start text-[14px] text-muted-foreground transition-transform active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label={isArabic ? "البحث في الأذكار والأدعية" : "Search adhkar and duas"}
        >
          <Search size={19} className="shrink-0 text-primary" aria-hidden="true" />
          <span>{isArabic ? "ابحث في الأذكار والأدعية" : "Search adhkar and duas"}</span>
        </button>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-5">
        <div className="space-y-3">
          {CATEGORIES.map((category) => {
            const total = getCategoryTotal(category.id);
            const done = completed[category.id]?.size ?? 0;
            return (
              <button
                key={category.id}
                type="button"
                onClick={() => onCategory(category.id)}
                className="flex min-h-[82px] w-full items-center gap-4 rounded-2xl border border-border bg-card p-4 text-start transition-transform active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                aria-label={
                  isArabic
                    ? `${category.nameArabic}، ${formatNumerals(done, language)} من ${formatNumerals(total, language)} مكتملة`
                    : `${category.name}, ${done} of ${total} complete`
                }
              >
                <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary/10">
                  <CatIcon type={category.icon} size={24} color="var(--primary)" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[16px] font-bold text-foreground">
                    {isArabic ? category.nameArabic : category.name}
                  </span>
                  <span className="mt-1 block text-[13px] text-muted-foreground">
                    {formatNumerals(done, language)} {isArabic ? "من" : "of"} {formatNumerals(total, language)}{" "}
                    {isArabic ? "مكتملة" : "complete"}
                  </span>
                </span>
                <ChevronNext
                  size={22}
                  className={isArabic ? "rotate-180 text-muted-foreground" : "text-muted-foreground"}
                  aria-hidden="true"
                />
              </button>
            );
          })}
        </div>

        <p className="px-4 pt-5 text-center text-[12px] leading-5 text-muted-foreground">
          {isArabic
            ? "ستُضاف مجموعات موثقة جديدة بعد اكتمال مراجعة المحتوى."
            : "New collections will appear after their content review is complete."}
        </p>
      </div>
    </div>
  );
}
