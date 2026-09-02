import { useDeferredValue, useId, useMemo, useState } from "react";
import { Search, Bookmark, ChevronDown, SlidersHorizontal } from "../components/icons";
import { TasbeehCounterButton } from "../components/TasbeehCounterButton";
import { ScreenContainer } from "../components/ScreenContainer";
import { CategoryCard } from "../components/CategoryCard";
import { StatePanel } from "../components/StatePanel";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import {
  ALL_AZKAR,
  getAzkarByCategory,
  getAzkarForMode,
  getRoutineProgress,
  isRoutineCategory,
  registerLazyCollection,
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
  initialSection = "collections",
}: {
  completed: Record<CategoryId, Set<string>>;
  language: AppLanguage;
  direction: "ltr" | "rtl";
  onCategory: (category: CategoryId) => void;
  onZikr: (category: CategoryId, index: number) => void;
  onSearch: (query: string) => void;
  savedZikrIds: Set<string>;
  routineModes: Record<RoutineCategoryId, RoutineMode>;
  onOpenCustomCounter?: () => void;
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

  // Typing filters the collections in place. Submitting escalates to the full
  // Search screen, which is the only thing that looks *inside* each zikr —
  // typing used to navigate there on every keystroke, losing the user's place.
  const deferredQuery = useDeferredValue(searchQuery.trim());
  const visibleGroups = useMemo(() => {
    const normalizedQuery = normalizeSearchText(deferredQuery);
    if (!normalizedQuery) return CATEGORY_GROUPS.map((group) => ({ group, categories: group.categories }));
    return CATEGORY_GROUPS.map((group) => ({
      group,
      categories: group.categories.filter((categoryId) => {
        const category = CATEGORIES.find((item) => item.id === categoryId);
        if (!category) return false;
        return matchesSearch(category.name, normalizedQuery) || matchesSearch(category.nameArabic, normalizedQuery);
      }),
    })).filter((entry) => entry.categories.length > 0);
  }, [deferredQuery]);

  const filteredGroups = useMemo(() => {
    if (selectedGroupId === "all" || deferredQuery) return visibleGroups;
    return visibleGroups.filter((entry) => entry.group.id === selectedGroupId);
  }, [deferredQuery, selectedGroupId, visibleGroups]);

  const visibleCollectionCount = filteredGroups.reduce((count, entry) => count + entry.categories.length, 0);
  const filterStatusMessage = deferredQuery
    ? t(language, visibleCollectionCount === 1 ? "library.filterResultsSingular" : "library.filterResultsPlural", {
        count: formatNumerals(visibleCollectionCount, language),
        query: deferredQuery,
      })
    : "";

  return (
    <ScreenContainer dir={direction} className="relative" screenName={t(language, "library.title")}>
      <div className="relative z-10 mx-auto flex w-full max-w-[80rem] flex-col min-h-screen">
        <header className="shrink-0 px-5 pb-4 pt-3">
          <h1 className="block max-w-full truncate whitespace-nowrap text-xl font-extrabold text-foreground sm:text-[1.5rem]">
            {t(language, "library.title")}
          </h1>
          <div className="mt-4">
            <form
              className="min-w-0"
              onSubmit={(event) => {
                event.preventDefault();
                const query = searchQuery.trim();
                if (query) onSearch(query);
              }}
            >
              <label htmlFor={searchInputId} className={`mb-1.5 block ${FIELD_LABEL_CLASS}`}>
                {t(language, "library.search")}
              </label>
              <div className="flex items-center gap-2">
                <div className="field-shell flex h-12 min-w-0 flex-1 items-center gap-3 rounded-2xl border border-border-control bg-card px-4 shadow-raised transition-colors focus-within:border-primary">
                  <Search size={19} className="shrink-0 text-primary" aria-hidden="true" />
                  <input
                    id={searchInputId}
                    type="text"
                    value={searchQuery}
                    placeholder={t(language, "library.search")}
                    dir={searchQuery.trim() ? "auto" : direction}
                    lang={language}
                    autoComplete="off"
                    onChange={(event) => setSearchQuery(event.currentTarget.value)}
                    className="h-11 min-w-0 flex-1 bg-transparent text-start text-[0.875rem] text-foreground placeholder:text-muted-foreground focus:outline-none"
                  />
                </div>
                <DropdownMenu dir={direction}>
                  <DropdownMenuTrigger asChild>
                    <button
                      type="button"
                      className="interactive-elem flex h-12 shrink-0 items-center justify-center gap-2 rounded-2xl border border-border-control bg-card px-3.5 text-[0.8125rem] font-extrabold text-foreground shadow-raised transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring"
                      aria-label={`${t(language, "library.title")}: ${t(language, `library.${section}`)}`}
                      data-testid="library-section-filter"
                    >
                      <SlidersHorizontal size={18} aria-hidden="true" />
                      <span className="hidden sm:inline">{t(language, `library.${section}`)}</span>
                      <ChevronDown size={15} aria-hidden="true" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="min-w-[13rem]">
                    <DropdownMenuLabel className="px-3 py-2 text-[0.75rem] font-black text-muted-foreground">
                      {t(language, "library.title")}
                    </DropdownMenuLabel>
                    <DropdownMenuRadioGroup
                      value={section}
                      onValueChange={(value) => setSection(value as LibrarySection)}
                    >
                      {(["collections", "saved"] as const).map((value) => (
                        <DropdownMenuRadioItem key={value} value={value} className="font-bold">
                          {`${t(language, `library.${value}`)}${
                            value === "saved" && savedZikrIds.size > 0
                              ? ` (${formatNumerals(savedZikrIds.size, language)})`
                              : ""
                          }`}
                        </DropdownMenuRadioItem>
                      ))}
                    </DropdownMenuRadioGroup>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              {searchQuery.trim() && (
                <p className="mt-1.5 px-1 text-[0.75rem] text-muted-foreground">{t(language, "library.searchHint")}</p>
              )}
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
            {section === "collections" && !searchQuery.trim() && (
              <div
                role="group"
                className="mt-3 flex items-center gap-2 overflow-x-auto no-scrollbar pb-1"
                aria-label={t(language, "library.title")}
              >
                <button
                  type="button"
                  aria-pressed={selectedGroupId === "all"}
                  onClick={() => setSelectedGroupId("all")}
                  className={`interactive-elem shrink-0 flex min-h-[44px] items-center justify-center rounded-2xl px-4 py-2 text-[0.875rem] font-bold transition-colors cursor-pointer ${
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
                    className={`interactive-elem shrink-0 flex min-h-[44px] items-center justify-center rounded-2xl px-4 py-2 text-[0.875rem] font-bold transition-colors cursor-pointer ${
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
          </div>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-5 page-content-center outline-none focus-visible:ring-1 focus-visible:ring-ring/40">
          {section === "collections" ? (
            <>
              {filteredGroups.map(({ group, categories }) => (
                <section key={group.id} aria-labelledby={`library-group-${group.id}`} className="mb-6 last:mb-0">
                  <h2
                    id={`library-group-${group.id}`}
                    className="mb-2.5 text-[0.8125rem] font-bold uppercase tracking-wide text-muted-foreground"
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
                          occasionalSubtitle={`${formatNumerals(total, language)} ${t(language, "library.occasionalSupplications")}`}
                          ariaLabel={
                            isOccasional
                              ? `${isArabic ? category.nameArabic : category.name}, ${formatNumerals(total, language)} ${t(
                                  language,
                                  "library.supplications",
                                )}`
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
              {visibleGroups.length === 0 && (
                <div className="mt-8">
                  <StatePanel
                    kind="empty-search"
                    language={language}
                    title={t(language, "library.noCollectionMatch", { query: deferredQuery })}
                    description={t(language, "library.searchHint")}
                    actionLabel={t(language, "library.searchAllAzkar", { query: deferredQuery })}
                    onAction={() => onSearch(deferredQuery)}
                  />
                </div>
              )}
              {onOpenCustomCounter && filteredGroups.length > 0 && (
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
                {savedAzkar.map((zikr, index) => {
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
                        onZikr(zikr.category, itemIndex);
                      }}
                      style={{ animationDelay: `${index * 45}ms` }}
                      className="stagger-enter flex min-h-[100px] w-full items-start gap-3 rounded-3xl border border-border/40 bg-card p-4 text-start shadow-raised hover:border-primary/40 transition-[color,background-color,border-color,box-shadow] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring"
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
                language={language}
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
