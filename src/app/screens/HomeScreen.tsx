import { Fragment } from "react";
import { ChevronNext } from "../components/icons";
import { CatIcon } from "../components/CatIcon";
import { ProgressBar } from "../components/ProgressBar";
import { getCategoryTotal } from "../content/azkar";
import { CATEGORIES } from "../content/categories";
import { formatNumerals } from "../formatting";
import { t } from "../i18n";
import type { AppLanguage, CategoryId } from "../types";

type HomeActionKind = "resume" | "start" | "again";

export type HomeAction = {
  categoryId: CategoryId;
  index: number;
  completedCount: number;
  totalCount: number;
  kind: HomeActionKind;
};

function suggestedCategoryId(date: Date): CategoryId {
  const hour = date.getHours();
  if (hour >= 20 || hour < 4) {
    return "before_sleep";
  }
  return hour >= 12 ? "evening" : "morning";
}

function getNextIndex(completed: Set<number>, totalCount: number) {
  return Array.from({ length: totalCount }, (_, index) => index).find((index) => !completed.has(index)) ?? 0;
}

/** Chooses one calm, useful next action without blocking access to any collection. */
export function getHomeAction(completed: Record<CategoryId, Set<number>>, now: Date = new Date()): HomeAction {
  const suggestedId = suggestedCategoryId(now);
  const categoryIds = [suggestedId, ...CATEGORIES.map((category) => category.id)].filter(
    (id, index, values) => values.indexOf(id) === index,
  ) as CategoryId[];

  for (const categoryId of categoryIds) {
    const done = completed[categoryId]?.size ?? 0;
    const totalCount = getCategoryTotal(categoryId);
    if (done > 0 && done < totalCount) {
      return {
        categoryId,
        index: getNextIndex(completed[categoryId], totalCount),
        completedCount: done,
        totalCount,
        kind: "resume",
      };
    }
  }

  for (const categoryId of categoryIds) {
    const done = completed[categoryId]?.size ?? 0;
    const totalCount = getCategoryTotal(categoryId);
    if (done === 0) {
      return { categoryId, index: 0, completedCount: done, totalCount, kind: "start" };
    }
  }

  const totalCount = getCategoryTotal(suggestedId);
  return { categoryId: suggestedId, index: 0, completedCount: totalCount, totalCount, kind: "again" };
}

export function HomeScreen({
  completed,
  onCategory,
  onResume,
  language,
  direction,
}: {
  completed: Record<CategoryId, Set<number>>;
  onCategory: (category: CategoryId) => void;
  onResume: (category: CategoryId, index: number) => void;
  language: AppLanguage;
  direction: "ltr" | "rtl";
}) {
  const isArabic = language === "ar";
  const action = getHomeAction(completed);
  const actionCategory = CATEGORIES.find((category) => category.id === action.categoryId)!;
  const actionName = isArabic ? actionCategory.nameArabic : actionCategory.name;
  const actionLabel = t(language, `home.${action.kind}Action`, { category: actionName });

  return (
    <div className="flex h-full flex-col bg-background" dir={direction}>
      <header className="flex h-14 shrink-0 items-center px-5">
        <h1 className="text-[18px] font-bold text-foreground">{t(language, "home.title")}</h1>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5">
        <section aria-labelledby="next-azkar-heading" className="mb-6">
          <p id="next-azkar-heading" className="mb-2 text-[13px] font-semibold text-muted-foreground">
            {t(language, "home.nextUp")}
          </p>
          <button
            type="button"
            data-testid="home-primary-cta"
            onClick={() => onResume(action.categoryId, action.index)}
            className="flex min-h-[126px] w-full items-center gap-4 rounded-[22px] border border-primary/35 bg-primary/10 p-5 text-start transition-transform active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label={`${actionLabel}. ${formatNumerals(action.completedCount, language)} ${isArabic ? "من" : "of"} ${formatNumerals(action.totalCount, language)} ${t(language, "home.complete")}`}
          >
            <span
              className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground"
              aria-hidden="true"
            >
              <CatIcon type={actionCategory.icon} size={30} color="currentColor" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-[18px] font-extrabold text-foreground">{actionLabel}</span>
              <span className="mt-1 block text-[14px] text-muted-foreground">{actionName}</span>
              <span className="mt-3 block">
                <ProgressBar
                  value={action.completedCount}
                  max={action.totalCount}
                  height={6}
                  trackColor="color-mix(in srgb, var(--primary) 22%, transparent)"
                  direction={direction}
                  aria-label={isArabic ? `تقدم ${actionName}` : `${actionName} progress`}
                />
                <span className="mt-2 block text-[12px] font-semibold text-muted-foreground">
                  {formatNumerals(action.completedCount, language)} {isArabic ? "من" : "of"}{" "}
                  {formatNumerals(action.totalCount, language)} {t(language, "home.complete")}
                </span>
              </span>
            </span>
            <ChevronNext size={22} aria-hidden="true" className="shrink-0 text-primary" />
          </button>
        </section>

        <section aria-labelledby="collections-heading">
          <h2 id="collections-heading" className="mb-3 text-[15px] font-bold text-foreground">
            {t(language, "home.collections")}
          </h2>
          <div className="space-y-3">
            {CATEGORIES.map((category) => {
              const done = completed[category.id]?.size ?? 0;
              const totalCount = getCategoryTotal(category.id);

              return (
                <Fragment key={category.id}>
                  <button
                    type="button"
                    onClick={() => onCategory(category.id)}
                    dir={direction}
                    data-testid={`category-card-${category.id}`}
                    className="flex min-h-[96px] w-full items-center gap-4 rounded-[20px] border border-border bg-card p-4 text-start transition-transform active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    aria-label={
                      isArabic
                        ? `${category.nameArabic}، ${formatNumerals(done, language)} من ${formatNumerals(totalCount, language)} مكتملة`
                        : `${category.name}, ${done} of ${totalCount} complete`
                    }
                  >
                    <span
                      data-slot="category-icon"
                      className="flex h-[48px] w-[48px] shrink-0 items-center justify-center rounded-full border border-border bg-background"
                      aria-hidden="true"
                    >
                      <CatIcon type={category.icon} size={28} color="var(--primary)" />
                    </span>

                    <span data-slot="category-copy" className="flex min-w-0 flex-1 flex-col justify-center gap-3">
                      <span className="flex items-center justify-between gap-2">
                        <span className="text-[18px] font-bold text-foreground">
                          {isArabic ? category.nameArabic : category.name}
                        </span>
                        <span
                          className="whitespace-nowrap text-[13px] font-medium text-muted-foreground"
                          dir={isArabic ? "rtl" : "ltr"}
                        >
                          {formatNumerals(done, language)} {isArabic ? "من" : "of"}{" "}
                          {formatNumerals(totalCount, language)}
                        </span>
                      </span>
                      <ProgressBar
                        value={done}
                        max={totalCount}
                        height={6}
                        trackColor="color-mix(in srgb, var(--primary) 15%, transparent)"
                        direction={direction}
                        aria-label={isArabic ? `تقدم ${category.nameArabic}` : `${category.name} progress`}
                      />
                    </span>

                    <ChevronNext
                      size={20}
                      aria-hidden="true"
                      data-slot="category-chevron"
                      className="shrink-0 text-muted-foreground"
                    />
                  </button>
                </Fragment>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}
