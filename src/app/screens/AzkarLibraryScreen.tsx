import { useMemo, useState } from "react";
import { Search, Bookmark } from "../components/icons";
import { TasbeehCounterButton } from "../components/TasbeehCounterButton";
import { ScreenContainer } from "../components/ScreenContainer";
import { CategoryCard } from "../components/CategoryCard";
import { StatePanel } from "../components/StatePanel";
import { TabList, tabPanelProps } from "../components/Tabs";
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
    <ScreenContainer dir={direction} className="relative" screenName={t(language, "library.title")}>
      <div className="relative z-10 flex flex-col min-h-screen">
        <header className="shrink-0 px-5 pb-4 pt-3">
          <h1 className="text-[1.5rem] font-extrabold text-foreground">{t(language, "library.title")}</h1>
          <p className="mt-1 text-[0.8125rem] text-muted-foreground">{t(language, "library.subtitle")}</p>
          <button
            type="button"
            onClick={onSearch}
            className="interactive-elem mt-4 flex h-12 w-full items-center gap-3 rounded-2xl border border-border/40 bg-card px-4 text-start text-[0.875rem] text-muted-foreground shadow-raised focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring"
            aria-label={t(language, "library.search")}
          >
            <Search size={19} className="shrink-0 text-primary" aria-hidden="true" />
            <span>{t(language, "library.search")}</span>
          </button>
          <TabList
            value={section}
            onChange={setSection}
            direction={direction}
            idPrefix="library"
            aria-label={t(language, "library.title")}
            className="mt-4 grid grid-cols-2 gap-2 rounded-2xl border border-border/40 bg-card p-1 shadow-raised"
            itemClassName={(selected) =>
              `min-h-11 rounded-xl px-3 text-[0.8125rem] font-bold focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring ${
                selected ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground"
              }`
            }
            tabs={(["collections", "saved"] as const).map((value) => ({
              value,
              label: `${t(language, `library.${value}`)}${
                value === "saved" && savedZikrIds.size > 0 ? ` (${formatNumerals(savedZikrIds.size, language)})` : ""
              }`,
            }))}
          />
        </header>

        <div
          {...tabPanelProps("library", section)}
          className="min-h-0 flex-1 overflow-y-auto px-5 pb-5 page-content-center outline-none focus-visible:ring-1 focus-visible:ring-ring/40"
        >
          {section === "collections" ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
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
                    <CategoryCard
                      key={category.id}
                      id={category.id}
                      title={isArabic ? category.nameArabic : category.name}
                      icon={category.icon}
                      direction={direction}
                      isOccasional={isOccasional}
                      totalCount={total}
                      completedCount={done}
                      routineSummary={routineSummary}
                      progressText={t(language, "library.progressOfTotal", {
                        done: formatNumerals(done, language),
                        total: formatNumerals(total, language),
                      })}
                      occasionalSubtitle={`${formatNumerals(total, language)} ${isArabic ? "أذكار سياقية" : "Occasional supplications"}`}
                      ariaLabel={
                        isOccasional
                          ? `${isArabic ? category.nameArabic : category.name}, ${formatNumerals(total, language)} ${
                              isArabic ? "أذكار" : "supplications"
                            }`
                          : [isArabic ? category.nameArabic : category.name, routineSummary, progressLabel]
                              .filter(Boolean)
                              .join(", ")
                      }
                      onClick={() => {
                        if (isComprehensiveDuas) {
                          registerLazyCollection("comprehensive_duas", COMPREHENSIVE_DUAS);
                        }
                        onCategory(category.id);
                      }}
                    />
                  );
                })}
              </div>
              {onOpenCustomCounter && (
                <div className="mt-4">
                  <TasbeehCounterButton onClick={onOpenCustomCounter} language={language} direction={direction} />
                </div>
              )}
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
                      className="flex min-h-[100px] w-full items-start gap-3 rounded-2xl border border-border/40 bg-card p-4 text-start shadow-raised hover:border-amber-500/40 hover:shadow-xl transition-all focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring"
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
            <div className="mt-8">
              <StatePanel
                kind="empty-saved"
                title={t(language, "library.savedEmptyTitle")}
                description={t(language, "library.savedEmptyBody")}
                actionLabel={t(language, "library.browseCollections")}
                onAction={() => setSection("collections")}
              />
            </div>
          )}
        </div>
      </div>
    </ScreenContainer>
  );
}
