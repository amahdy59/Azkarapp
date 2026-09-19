import { useDeferredValue, useId, useMemo, useState } from "react";
import { Search, Bookmark, ChevronNext, Lightbulb, X } from "../components/icons";
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
  ZIKR_LABELS,
} from "../content/azkar";
import { CATEGORIES, CATEGORY_GROUPS, isOccasionalCategory } from "../content/categories";
import { COMPREHENSIVE_DUAS } from "../content/comprehensiveDuas";
import { formatNumerals } from "../formatting";
import { matchesSearch, normalizeSearchText } from "../content/searchNormalization";
import { FIELD_LABEL_CLASS } from "../components/FormField";
import { t } from "../i18n";
import type { AppLanguage, CategoryId, RoutineCategoryId, RoutineMode, Zikr } from "../types";

export type LibrarySection = "collections" | "saved";
type SavedLibraryItem = Pick<Zikr, "id" | "category" | "arabicText" | "translation" | "transliteration"> & {
  lazyCollection?: "friday_kahf";
};

const COMPREHENSIVE_DUA_ITEMS = COMPREHENSIVE_DUAS.filter((dua) => !dua.isCollectionIntroduction);
const SEARCHABLE_AZKAR: Zikr[] = [...ALL_AZKAR.filter((z) => !z.isCollectionIntroduction), ...COMPREHENSIVE_DUA_ITEMS];

const searchKeyCache = new Map<string, string>();

function searchKeyFor(zikr: Zikr): string {
  const cached = searchKeyCache.get(zikr.id);
  if (cached !== undefined) return cached;
  const key = normalizeSearchText(
    [
      zikr.arabicText,
      zikr.translation,
      zikr.transliteration,
      zikr.surahNameArabic ?? "",
      zikr.surahNameEnglish ?? "",
      zikr.sourceReference ?? "",
      zikr.benefit ?? "",
      zikr.benefitArabic ?? "",
      ZIKR_LABELS[zikr.id] ?? "",
    ].join(" | "),
  );
  searchKeyCache.set(zikr.id, key);
  return key;
}

export function AzkarLibraryScreen({
  completed,
  language,
  direction,
  onCategory,
  onZikr,
  onSearch,
  savedZikrIds,
  routineModes,
  onOpenBenefits,
  initialSection = "collections",
}: {
  completed: Record<CategoryId, Set<string>>;
  language: AppLanguage;
  direction: "ltr" | "rtl";
  onCategory: (category: CategoryId) => void;
  onZikr: (category: CategoryId, index: number) => void;
  onSearch?: (query: string) => void;
  savedZikrIds: Set<string>;
  routineModes: Record<RoutineCategoryId, RoutineMode>;
  onOpenBenefits?: () => void;
  initialSection?: LibrarySection;
}) {
  const [section, setSection] = useState<LibrarySection>(initialSection);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGroupId, setSelectedGroupId] = useState<string>("all");
  const searchInputId = useId();
  const isArabic = language === "ar";
  const savedAzkar = useMemo(() => {
    const available: SavedLibraryItem[] = [...ALL_AZKAR, ...COMPREHENSIVE_DUA_ITEMS].filter(
      (zikr) => !zikr.isCollectionIntroduction && savedZikrIds.has(zikr.id),
    );
    if (savedZikrIds.has("friday-kahf")) {
      const category = CATEGORIES.find((item) => item.id === "friday_kahf")!;
      available.unshift({
        id: "friday-kahf",
        category: "friday_kahf",
        arabicText: category.nameArabic,
        translation: category.name,
        transliteration: "Surah Al-Kahf",
        lazyCollection: "friday_kahf",
      });
    }
    return available;
  }, [savedZikrIds]);

  const deferredQuery = useDeferredValue(searchQuery.trim());
  const normalizedQuery = useMemo(() => normalizeSearchText(deferredQuery), [deferredQuery]);

  const visibleGroups = useMemo(() => {
    if (!normalizedQuery) return CATEGORY_GROUPS.map((group) => ({ group, categories: group.categories }));
    return CATEGORY_GROUPS.map((group) => ({
      group,
      categories: group.categories.filter((categoryId) => {
        const category = CATEGORIES.find((item) => item.id === categoryId);
        if (!category) return false;
        return matchesSearch(category.name, normalizedQuery) || matchesSearch(category.nameArabic, normalizedQuery);
      }),
    })).filter((entry) => entry.categories.length > 0);
  }, [normalizedQuery]);

  const filteredGroups = useMemo(() => {
    if (selectedGroupId === "all") return visibleGroups;
    return visibleGroups.filter((entry) => entry.group.id === selectedGroupId);
  }, [selectedGroupId, visibleGroups]);

  const visibleCollectionCount = filteredGroups.reduce((count, entry) => count + entry.categories.length, 0);
  const filterStatusMessage = deferredQuery
    ? t(language, visibleCollectionCount === 1 ? "library.filterResultsSingular" : "library.filterResultsPlural", {
        count: formatNumerals(visibleCollectionCount, language),
        query: deferredQuery,
      })
    : "";

  const matchingCategories = useMemo(() => {
    if (!normalizedQuery) return [];
    return CATEGORIES.filter((category) => {
      if (category.id === "friday_kahf") return false;
      if (selectedGroupId !== "all") {
        const group = CATEGORY_GROUPS.find((g) => g.id === selectedGroupId);
        if (!group || !group.categories.includes(category.id)) return false;
      }
      return matchesSearch(category.name, normalizedQuery) || matchesSearch(category.nameArabic, normalizedQuery);
    });
  }, [normalizedQuery, selectedGroupId]);

  const matchingAzkar = useMemo(() => {
    if (!normalizedQuery || normalizedQuery.length < 2) return [];
    const targetCategoryIds =
      selectedGroupId !== "all"
        ? new Set(CATEGORY_GROUPS.find((g) => g.id === selectedGroupId)?.categories ?? [])
        : null;

    return SEARCHABLE_AZKAR.filter((zikr) => {
      if (targetCategoryIds && !targetCategoryIds.has(zikr.category)) {
        return false;
      }
      return searchKeyFor(zikr).includes(normalizedQuery);
    });
  }, [normalizedQuery, selectedGroupId]);

  const filteredSavedAzkar = useMemo(() => {
    if (!normalizedQuery) return savedAzkar;
    return savedAzkar.filter((z) => {
      const key = normalizeSearchText([z.arabicText, z.translation, z.transliteration].join(" | "));
      return key.includes(normalizedQuery);
    });
  }, [savedAzkar, normalizedQuery]);

  return (
    <ScreenContainer dir={direction} className="relative" screenName={t(language, "library.title")}>
      <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-col min-h-screen">
        <header className="shrink-0 px-5 pb-4 pt-3">
          <h1 className="block max-w-full truncate whitespace-nowrap text-xl font-extrabold text-foreground sm:text-2xl">
            {t(language, "library.title")}
          </h1>
          <div className="mt-4">
            <form
              className="min-w-0"
              onSubmit={(event) => {
                event.preventDefault();
                const query = searchQuery.trim();
                if (query) onSearch?.(query);
              }}
            >
              <label htmlFor={searchInputId} className={`mb-1.5 block ${FIELD_LABEL_CLASS}`}>
                {t(language, "library.search")}
              </label>
              <div className="field-shell flex h-12 min-w-0 items-center gap-3 rounded-2xl border border-border-control bg-card px-4 shadow-raised transition-colors focus-within:border-primary">
                <Search size={19} className="shrink-0 text-primary" aria-hidden="true" />
                <input
                  id={searchInputId}
                  type="text"
                  value={searchQuery}
                  placeholder={t(language, "search.placeholder")}
                  dir={searchQuery.trim() ? "auto" : direction}
                  lang={language}
                  autoComplete="off"
                  onChange={(event) => setSearchQuery(event.currentTarget.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault();
                      const query = searchQuery.trim();
                      if (query) onSearch?.(query);
                    }
                  }}
                  className="h-11 min-w-0 flex-1 bg-transparent text-start text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
                />
                <button type="submit" className="hidden" aria-hidden="true" tabIndex={-1} />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="-me-2 flex size-9 shrink-0 items-center justify-center rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer"
                    aria-label={t(language, "search.clearAriaLabel")}
                  >
                    <X size={16} aria-hidden="true" />
                  </button>
                )}
              </div>
              <p
                data-testid="library-filter-status"
                className="sr-only"
                role="status"
                aria-live="polite"
                aria-atomic="true"
              >
                {filterStatusMessage}
              </p>
            </form>

            <TabList
              value={section}
              onChange={setSection}
              direction={direction}
              idPrefix="library-sections"
              aria-label={t(language, "library.title")}
              className="mt-3 grid grid-cols-2 rounded-2xl border border-border-control/60 bg-card p-1 shadow-xs"
              tabs={(["collections", "saved"] as const).map((value) => ({
                value,
                testId: `library-section-${value}`,
                label: `${t(language, `library.${value}`)}${
                  value === "saved" && savedZikrIds.size > 0 ? ` (${formatNumerals(savedZikrIds.size, language)})` : ""
                }`,
              }))}
              itemClassName={(selected) =>
                `min-h-11 rounded-xl px-3 text-sm font-extrabold transition-colors focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring ${
                  selected
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`
              }
            />
          </div>

          {section === "collections" && (
            <div
              role="group"
              className="mt-3 flex items-center gap-2 overflow-x-auto no-scrollbar pb-1"
              aria-label={t(language, "library.title")}
            >
              <button
                type="button"
                aria-pressed={selectedGroupId === "all"}
                onClick={() => setSelectedGroupId("all")}
                className={`interactive-elem shrink-0 flex min-h-11 items-center justify-center rounded-2xl px-4 py-1.5 text-sm font-bold transition-colors cursor-pointer ${
                  selectedGroupId === "all"
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "bg-card border border-border-control/50 text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                {t(language, "library.all")}
              </button>
              {CATEGORY_GROUPS.map((group) => (
                <button
                  key={group.id}
                  type="button"
                  aria-pressed={selectedGroupId === group.id}
                  onClick={() => setSelectedGroupId(group.id)}
                  className={`interactive-elem shrink-0 flex min-h-11 items-center justify-center rounded-2xl px-4 py-1.5 text-sm font-bold transition-colors cursor-pointer ${
                    selectedGroupId === group.id
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "bg-card border border-border-control/50 text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`}
                >
                  {t(language, `library.groups.${group.labelKey}`)}
                </button>
              ))}
            </div>
          )}
        </header>

        <div
          className="min-h-0 flex-1 overflow-y-auto px-5 pb-5 page-content-center outline-none focus-visible:ring-1 focus-visible:ring-ring/40"
          {...tabPanelProps("library-sections", section)}
        >
          {section === "collections" ? (
            deferredQuery ? (
              <>
                {matchingCategories.length === 0 && matchingAzkar.length === 0 ? (
                  <div className="mt-8">
                    <StatePanel
                      kind="empty-search"
                      language={language}
                      title={t(language, "search.emptyTitle")}
                      description={t(language, "search.emptyDescription")}
                      actionLabel={t(language, "search.emptyAction")}
                      onAction={() => setSearchQuery("")}
                    />
                  </div>
                ) : (
                  <>
                    <div className="mb-4 flex items-center justify-between gap-3 rounded-2xl border border-border/40 bg-card/60 px-4 py-2.5 backdrop-blur-sm">
                      <p className="text-sm font-semibold text-muted-foreground">
                        {t(language, "library.searchResultsFor", { query: deferredQuery })}
                      </p>
                      <button
                        type="button"
                        onClick={() => setSearchQuery("")}
                        className="interactive-elem shrink-0 text-xs font-bold text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer"
                      >
                        {t(language, "library.clearSearch")}
                      </button>
                    </div>

                    {matchingCategories.length > 0 && (
                      <section aria-labelledby="matching-collections-heading" className="mb-6">
                        <h2
                          id="matching-collections-heading"
                          className="mb-3 text-label font-bold uppercase tracking-wide text-muted-foreground"
                        >
                          {t(language, "library.matchingCollections")} (
                          {formatNumerals(matchingCategories.length, language)})
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                          {matchingCategories.map((category, index) => {
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
                              ? t(language, `category.${routineMode}Summary`, {
                                  count: formatNumerals(total, language),
                                })
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
                                index={index}
                                isOccasional={isOccasional}
                                totalCount={total}
                                completedCount={done}
                                routineSummary={routineSummary}
                                progressText={t(language, "library.progressOfTotal", {
                                  done: formatNumerals(done, language),
                                  total: formatNumerals(total, language),
                                })}
                                occasionalSubtitle={`${formatNumerals(total, language)} ${t(
                                  language,
                                  "library.occasionalSupplications",
                                )}`}
                                ariaLabel={
                                  isOccasional
                                    ? `${isArabic ? category.nameArabic : category.name}, ${formatNumerals(
                                        total,
                                        language,
                                      )} ${t(language, "library.supplications")}`
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
                      </section>
                    )}

                    {matchingAzkar.length > 0 && (
                      <section aria-labelledby="matching-azkar-heading" className="mb-6">
                        <h2
                          id="matching-azkar-heading"
                          className="mb-3 text-label font-bold uppercase tracking-wide text-muted-foreground"
                        >
                          {t(language, "library.matchingAzkar")} ({formatNumerals(matchingAzkar.length, language)})
                        </h2>
                        <div className="space-y-3">
                          {matchingAzkar.map((zikr, index) => {
                            const category = CATEGORIES.find((item) => item.id === zikr.category);
                            const categoryName = isArabic
                              ? (category?.nameArabic ?? zikr.category)
                              : (category?.name ?? zikr.category);
                            const countLabel =
                              zikr.repetitionCount && zikr.repetitionCount > 0
                                ? isArabic
                                  ? zikr.repetitionCount === 1
                                    ? "مرة واحدة"
                                    : zikr.repetitionCount === 2
                                      ? "مرتان"
                                      : `${formatNumerals(zikr.repetitionCount, language)} مرات`
                                  : `${zikr.repetitionCount} ${zikr.repetitionCount === 1 ? "time" : "times"}`
                                : null;

                            return (
                              <button
                                key={`${zikr.category}-${zikr.id}`}
                                type="button"
                                data-testid="matching-zikr-card"
                                onClick={async () => {
                                  const isComprehensiveDuas = zikr.category === "comprehensive_duas";
                                  const itemIndex = (
                                    isComprehensiveDuas ? COMPREHENSIVE_DUA_ITEMS : getAzkarByCategory(zikr.category)
                                  ).findIndex((item) => item.id === zikr.id);
                                  if (isComprehensiveDuas) {
                                    registerLazyCollection("comprehensive_duas", COMPREHENSIVE_DUAS);
                                  }
                                  onZikr(zikr.category, Math.max(0, itemIndex));
                                }}
                                style={{ animationDelay: `${index * 30}ms` }}
                                className="stagger-enter interactive-elem flex w-full flex-col items-start gap-2 rounded-3xl border border-border/40 bg-card p-4 text-start shadow-raised hover:border-primary/40 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring transition-all cursor-pointer"
                                aria-label={
                                  isArabic ? zikr.arabicText.slice(0, 60) : zikr.translation.split(".")[0] || zikr.id
                                }
                              >
                                <div className="flex w-full items-center justify-between gap-2">
                                  <span className="inline-flex items-center rounded-full bg-primary/10 border border-primary/20 px-2.5 py-0.5 text-xs font-bold text-primary shrink-0">
                                    {categoryName}
                                  </span>
                                  {countLabel && (
                                    <span
                                      className="inline-flex items-center rounded-full bg-muted border border-border px-2 py-0.5 text-xs font-bold text-muted-foreground shrink-0"
                                      dir="auto"
                                    >
                                      {countLabel}
                                    </span>
                                  )}
                                </div>

                                {isArabic ? (
                                  <p
                                    className="zikr-text mt-1 line-clamp-3 w-full text-start text-subtitle font-bold leading-relaxed text-foreground"
                                    dir="rtl"
                                    lang="ar"
                                  >
                                    {zikr.arabicText}
                                  </p>
                                ) : (
                                  <div className="mt-1 flex flex-col gap-0.5 w-full">
                                    <p
                                      className="line-clamp-2 w-full text-start text-subtitle font-bold leading-snug text-foreground"
                                      dir="ltr"
                                      lang="en"
                                    >
                                      {zikr.translation}
                                    </p>
                                    {zikr.transliteration && (
                                      <p
                                        className="line-clamp-2 w-full text-start text-label text-muted-foreground leading-normal"
                                        dir="ltr"
                                        lang="en"
                                      >
                                        {zikr.transliteration}
                                      </p>
                                    )}
                                  </div>
                                )}

                                {(zikr.surahNameArabic || zikr.surahNameEnglish || zikr.sourceReference) && (
                                  <div className="mt-1 flex w-full items-center justify-between border-t border-border/30 pt-2 text-xs text-muted-foreground">
                                    <span className="truncate font-medium">
                                      {isArabic
                                        ? zikr.surahNameArabic || zikr.sourceReference
                                        : zikr.surahNameEnglish || zikr.sourceReference}
                                    </span>
                                    <span className="text-primary font-bold shrink-0">
                                      {t(language, "library.readZikr")} {direction === "rtl" ? "←" : "→"}
                                    </span>
                                  </div>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </section>
                    )}
                  </>
                )}
              </>
            ) : (
              <>
                {filteredGroups.map(({ group, categories }) => (
                  <section key={group.id} aria-labelledby={`library-group-${group.id}`} className="mb-6 last:mb-0">
                    <h2
                      id={`library-group-${group.id}`}
                      className="mb-2.5 text-label font-bold uppercase tracking-wide text-muted-foreground"
                      dir="auto"
                    >
                      {t(language, `library.groups.${group.labelKey}`)}
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                      {categories.map((categoryId, index) => {
                        const category = CATEGORIES.find((item) => item.id === categoryId);
                        if (!category) return null;
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
                            index={index}
                            isOccasional={isOccasional}
                            totalCount={total}
                            completedCount={done}
                            routineSummary={routineSummary}
                            progressText={t(language, "library.progressOfTotal", {
                              done: formatNumerals(done, language),
                              total: formatNumerals(total, language),
                            })}
                            occasionalSubtitle={`${formatNumerals(total, language)} ${t(
                              language,
                              "library.occasionalSupplications",
                            )}`}
                            ariaLabel={
                              isOccasional
                                ? `${isArabic ? category.nameArabic : category.name}, ${formatNumerals(
                                    total,
                                    language,
                                  )} ${t(language, "library.supplications")}`
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
                  </section>
                ))}
                {onOpenBenefits && filteredGroups.length > 0 && (
                  <button
                    type="button"
                    onClick={onOpenBenefits}
                    data-testid="library-benefits-tool"
                    className="interactive-elem mt-2 flex min-h-16 w-full items-center gap-3 rounded-3xl border border-border/40 bg-card p-4 text-start shadow-raised transition-colors hover:border-primary/40 hover:bg-muted focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring"
                  >
                    <span
                      className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary"
                      aria-hidden="true"
                    >
                      <Lightbulb size={22} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-subtitle font-black text-foreground">
                        {t(language, "benefits.title")}
                      </span>
                      <span className="mt-0.5 line-clamp-1 block text-label font-semibold text-muted-foreground">
                        {t(language, "benefits.open")}
                      </span>
                    </span>
                    <ChevronNext className="size-5 shrink-0 text-primary rtl:rotate-180" aria-hidden="true" />
                  </button>
                )}
              </>
            )
          ) : filteredSavedAzkar.length > 0 ? (
            <section aria-labelledby="saved-zikr-heading">
              <h2 id="saved-zikr-heading" className="mb-3 text-subtitle font-bold text-foreground">
                {t(language, "library.savedTitle")}
              </h2>
              <div className="space-y-3">
                {filteredSavedAzkar.map((zikr, index) => {
                  const category = CATEGORIES.find((item) => item.id === zikr.category)!;
                  return (
                    <button
                      key={zikr.id}
                      type="button"
                      onClick={async () => {
                        if (zikr.lazyCollection === "friday_kahf") {
                          const { FRIDAY_KAHF } = await import("../content/fridayKahf");
                          registerLazyCollection("friday_kahf", FRIDAY_KAHF);
                          onZikr("friday_kahf", 0);
                          return;
                        }
                        const isComprehensiveDuas = zikr.category === "comprehensive_duas";
                        const itemIndex = (
                          isComprehensiveDuas ? COMPREHENSIVE_DUA_ITEMS : getAzkarByCategory(zikr.category)
                        ).findIndex((item) => item.id === zikr.id);
                        if (isComprehensiveDuas) {
                          registerLazyCollection("comprehensive_duas", COMPREHENSIVE_DUAS);
                        }
                        onZikr(zikr.category, Math.max(0, itemIndex));
                      }}
                      style={{ animationDelay: `${index * 45}ms` }}
                      className="stagger-enter flex min-h-24 w-full items-start gap-3 rounded-3xl border border-border/40 bg-card p-4 text-start shadow-raised hover:border-primary/40 transition-colors focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring"
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
                        <span className="block text-xs font-semibold text-primary">
                          {isArabic ? category.nameArabic : category.name}
                        </span>
                        {isArabic ? (
                          <span
                            className="zikr-text mt-1 line-clamp-3 block text-start text-subtitle font-semibold leading-7 text-foreground"
                            dir="rtl"
                            lang="ar"
                          >
                            {zikr.arabicText}
                          </span>
                        ) : (
                          <>
                            <span
                              className="mt-1 line-clamp-2 block text-start text-subtitle font-semibold leading-6 text-foreground"
                              dir="ltr"
                              lang="en"
                            >
                              {zikr.translation}
                            </span>
                            <span
                              className="mt-1 line-clamp-2 block text-start text-label leading-5 text-muted-foreground"
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
                kind={savedAzkar.length === 0 ? "empty-saved" : "empty-search"}
                language={language}
                title={t(language, savedAzkar.length === 0 ? "library.savedEmptyTitle" : "search.emptyTitle")}
                description={
                  savedAzkar.length === 0
                    ? t(language, "library.savedEmptyBody")
                    : t(language, "search.emptyDescription")
                }
                actionLabel={t(language, savedAzkar.length === 0 ? "library.browseCollections" : "search.emptyAction")}
                onAction={() => {
                  if (savedAzkar.length === 0) {
                    setSection("collections");
                  } else {
                    setSearchQuery("");
                  }
                }}
              />
            </div>
          )}
        </div>
      </div>
    </ScreenContainer>
  );
}
