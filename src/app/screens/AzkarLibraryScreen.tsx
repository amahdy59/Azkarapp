import { useMemo, useState } from "react";
import { CatIcon } from "../components/CatIcon";
import { Search, Bookmark, ChevronNext } from "../components/icons";
import { TasbeehCounterButton } from "../components/TasbeehCounterButton";
import { ScreenContainer } from "../components/ScreenContainer";
import { ProgressBar } from "../components/ProgressBar";
import {
  ALL_AZKAR,
  getAzkarByCategory,
  getAzkarForMode,
  getRoutineProgress,
  isRoutineCategory,
  registerLazyCollection,
} from "../content/azkar";
import { CATEGORIES, isOccasionalCategory } from "../content/categories";
import { COMPREHENSIVE_DUAS } from "../content/comprehensiveDuas";
import { formatNumerals } from "../formatting";
import { t } from "../i18n";
import type { AppLanguage, CategoryId, RoutineCategoryId, RoutineMode } from "../types";

type LibrarySection = "collections" | "saved";

const COMPREHENSIVE_DUA_ITEMS = COMPREHENSIVE_DUAS.filter((dua) => !dua.isCollectionIntroduction);

export function AzkarLibraryScreen({
  completed,
  language,
  direction,
  onCategory,
  onZikr,
  onSearch,
  savedZikrIds,
  routineModes,
  onOpenCustomCounter,
}: {
  completed: Record<CategoryId, Set<string>>;
  language: AppLanguage;
  direction: "ltr" | "rtl";
  onCategory: (category: CategoryId) => void;
  onZikr: (category: CategoryId, index: number) => void;
  onSearch: () => void;
  savedZikrIds: Set<string>;
  routineModes: Record<RoutineCategoryId, RoutineMode>;
  onOpenCustomCounter?: () => void;
}) {
  const [section, setSection] = useState<LibrarySection>("collections");
  const isArabic = language === "ar";
  const savedAzkar = useMemo(
    () =>
      [...ALL_AZKAR, ...COMPREHENSIVE_DUA_ITEMS].filter(
        (zikr) => !zikr.isCollectionIntroduction && savedZikrIds.has(zikr.id),
      ),
    [savedZikrIds],
  );

  return (
    <ScreenContainer dir={direction}>
      <header className="shrink-0 px-5 pb-4 pt-3">
        <h1 className="text-[1.5rem] font-extrabold text-foreground">{t(language, "library.title")}</h1>
        <p className="mt-1 text-[0.8125rem] text-muted-foreground">{t(language, "library.subtitle")}</p>
        <button
          type="button"
          onClick={onSearch}
          className="interactive-elem mt-4 flex h-12 w-full items-center gap-3 rounded-card border border-border bg-card px-4 text-start text-[0.875rem] text-muted-foreground focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring"
          aria-label={t(language, "library.search")}
        >
          <Search size={19} className="shrink-0 text-primary" aria-hidden="true" />
          <span>{t(language, "library.search")}</span>
        </button>
        <div
          className="mt-4 grid grid-cols-2 gap-2 rounded-xl border border-border bg-card p-1"
          role="tablist"
          aria-label={t(language, "library.title")}
        >
          {(["collections", "saved"] as const).map((value) => (
            <button
              key={value}
              type="button"
              role="tab"
              aria-selected={section === value}
              onClick={() => setSection(value)}
              className={`min-h-11 rounded-xl px-3 text-[0.8125rem] font-bold focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring ${
                section === value ? "bg-primary text-primary-foreground" : "text-muted-foreground"
              }`}
            >
              {t(language, `library.${value}`)}
              {value === "saved" && savedZikrIds.size > 0 ? ` (${formatNumerals(savedZikrIds.size, language)})` : ""}
            </button>
          ))}
        </div>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-5 page-content-center" role="tabpanel">
        {section === "collections" ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {CATEGORIES.filter((category) => category.id !== "friday_kahf").map((category) => {
                const isComprehensiveDuas = category.id === "comprehensive_duas";
                const routineMode = isRoutineCategory(category.id) ? routineModes[category.id] : "complete";
                const visibleItems = isComprehensiveDuas
                  ? COMPREHENSIVE_DUA_ITEMS
                  : getAzkarForMode(category.id, routineMode);
                const progress = isRoutineCategory(category.id)
                  ? getRoutineProgress(category.id, routineMode, completed[category.id] ?? [])
                  : {
                      done: visibleItems.filter((item) => completed[category.id]?.has(item.id)).length,
                      total: visibleItems.length,
                    };
                const { done, total } = progress;
                const isOccasional = isOccasionalCategory(category.id);
                const routineSummary = isRoutineCategory(category.id)
                  ? t(language, `category.${routineMode}Summary`, { count: formatNumerals(total, language) })
                  : undefined;
                const progressLabel = t(language, "library.progressOfTotal", {
                  done: formatNumerals(done, language),
                  total: formatNumerals(total, language),
                });

                return (
                  <button
                    key={category.id}
                    type="button"
                    data-testid={`category-card-${category.id}`}
                    dir={direction}
                    onClick={() => {
                      if (isComprehensiveDuas) {
                        registerLazyCollection("comprehensive_duas", COMPREHENSIVE_DUAS);
                      }
                      onCategory(category.id);
                    }}
                    className="flex min-h-[82px] w-full items-center gap-4 rounded-2xl border border-border bg-card p-4 text-start focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring"
                    aria-label={
                      isOccasional
                        ? `${isArabic ? category.nameArabic : category.name}, ${formatNumerals(total, language)} ${
                            isArabic ? "أذكار" : "supplications"
                          }`
                        : [isArabic ? category.nameArabic : category.name, routineSummary, progressLabel]
                            .filter(Boolean)
                            .join(", ")
                    }
                  >
                    <span
                      data-slot="category-icon"
                      className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary/10"
                      aria-hidden="true"
                    >
                      <CatIcon type={category.icon} size={24} color="var(--primary)" />
                    </span>
                    <span data-slot="category-copy" className="min-w-0 flex-1">
                      <span className="block text-[1rem] font-bold text-foreground">
                        {isArabic ? category.nameArabic : category.name}
                      </span>
                      {isOccasional ? (
                        <div className="mt-1 flex items-center gap-1.5">
                          <span className="text-[0.8125rem] font-semibold text-muted-foreground">
                            {formatNumerals(total, language)} {isArabic ? "أذكار سياقية" : "Occasional supplications"}
                          </span>
                        </div>
                      ) : (
                        <div className="mt-2 flex flex-col gap-1">
                          <ProgressBar
                            value={done}
                            max={total}
                            height={5}
                            trackColor="var(--muted)"
                            fillColor="var(--primary)"
                            direction={direction}
                            aria-label={progressLabel}
                          />
                          <span className="block text-[0.8125rem] text-muted-foreground">
                            {routineSummary ? `${routineSummary} · ` : ""}
                            {t(language, "library.progressOfTotal", {
                              done: formatNumerals(done, language),
                              total: formatNumerals(total, language),
                            })}
                          </span>
                        </div>
                      )}
                    </span>
                    <ChevronNext
                      data-slot="category-chevron"
                      size={22}
                      className="text-muted-foreground"
                      aria-hidden="true"
                    />
                  </button>
                );
              })}
            </div>
            {onOpenCustomCounter && (
              <div className="mt-4">
                <TasbeehCounterButton onClick={onOpenCustomCounter} language={language} direction={direction} />
              </div>
            )}
            <p className="px-4 pt-5 text-center text-[0.75rem] leading-5 text-muted-foreground">
              {t(language, "library.reviewNotice")}
            </p>
          </>
        ) : savedAzkar.length > 0 ? (
          <section aria-labelledby="saved-zikr-heading">
            <h2 id="saved-zikr-heading" className="mb-3 text-[0.9375rem] font-bold text-foreground">
              {t(language, "library.savedTitle")}
            </h2>
            <div className="space-y-3">
              {savedAzkar.map((zikr) => {
                const category = CATEGORIES.find((item) => item.id === zikr.category)!;
                return (
                  <button
                    key={zikr.id}
                    type="button"
                    onClick={() => {
                      const isComprehensiveDuas = zikr.category === "comprehensive_duas";
                      const index = (
                        isComprehensiveDuas ? COMPREHENSIVE_DUA_ITEMS : getAzkarByCategory(zikr.category)
                      ).findIndex((item) => item.id === zikr.id);
                      if (isComprehensiveDuas) {
                        registerLazyCollection("comprehensive_duas", COMPREHENSIVE_DUAS);
                      }
                      onZikr(zikr.category, index);
                    }}
                    className="flex min-h-[100px] w-full items-start gap-3 rounded-2xl border border-border bg-card p-4 text-start focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring"
                    aria-label={`${isArabic ? category.nameArabic : category.name}: ${
                      isArabic ? zikr.arabicText.split("\n")[0] : zikr.translation
                    }`}
                  >
                    <span
                      className="mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary"
                      aria-hidden="true"
                    >
                      <Bookmark size={19} className="fill-current" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-[0.75rem] font-semibold text-primary">
                        {isArabic ? category.nameArabic : category.name}
                      </span>
                      {isArabic ? (
                        <span
                          className="zikr-text mt-1 line-clamp-3 block text-start text-[0.9375rem] font-semibold leading-7 text-foreground"
                          dir="rtl"
                          lang="ar"
                        >
                          {zikr.arabicText}
                        </span>
                      ) : (
                        <>
                          <span
                            className="mt-1 line-clamp-2 block text-start text-[0.9375rem] font-semibold leading-6 text-foreground"
                            dir="ltr"
                            lang="en"
                          >
                            {zikr.translation}
                          </span>
                          <span
                            className="mt-1 line-clamp-2 block text-start text-[0.8125rem] leading-5 text-muted-foreground"
                            dir="ltr"
                            lang="en"
                          >
                            {zikr.transliteration}
                          </span>
                        </>
                      )}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>
        ) : (
          <section
            className="mt-8 rounded-2xl border border-dashed border-border bg-card p-6 text-center"
            aria-labelledby="saved-empty-heading"
          >
            <span
              className="mx-auto flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary"
              aria-hidden="true"
            >
              <Bookmark size={22} />
            </span>
            <h2 id="saved-empty-heading" className="mt-4 text-[1.0625rem] font-bold text-foreground">
              {t(language, "library.savedEmptyTitle")}
            </h2>
            <p className="mt-2 text-[0.875rem] leading-6 text-muted-foreground">
              {t(language, "library.savedEmptyBody")}
            </p>
            <button
              type="button"
              onClick={() => setSection("collections")}
              className="mt-5 min-h-11 rounded-xl bg-primary px-4 text-[0.875rem] font-bold text-primary-foreground focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring"
            >
              {t(language, "library.browseCollections")}
            </button>
          </section>
        )}
      </div>
    </ScreenContainer>
  );
}
