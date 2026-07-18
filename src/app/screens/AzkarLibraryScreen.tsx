import { useMemo, useState } from "react";
import { CatIcon } from "../components/CatIcon";
import { Bookmark, ChevronNext, Search } from "../components/icons";
import { ALL_AZKAR, getCategoryTotal } from "../content/azkar";
import { CATEGORIES } from "../content/categories";
import { formatNumerals } from "../formatting";
import { t } from "../i18n";
import type { AppLanguage, CategoryId } from "../types";

type LibrarySection = "collections" | "saved";

export function AzkarLibraryScreen({
  completed,
  language,
  direction,
  onCategory,
  onZikr,
  onSearch,
  savedZikrIds,
}: {
  completed: Record<CategoryId, Set<number>>;
  language: AppLanguage;
  direction: "ltr" | "rtl";
  onCategory: (category: CategoryId) => void;
  onZikr: (category: CategoryId, index: number) => void;
  onSearch: () => void;
  savedZikrIds: Set<string>;
}) {
  const [section, setSection] = useState<LibrarySection>("collections");
  const isArabic = language === "ar";
  const savedAzkar = useMemo(() => ALL_AZKAR.filter((zikr) => savedZikrIds.has(zikr.id)), [savedZikrIds]);

  return (
    <div className="flex h-full flex-col bg-background" dir={direction}>
      <header className="shrink-0 px-5 pb-4 pt-3">
        <h1 className="text-[1.5rem] font-extrabold text-foreground">{t(language, "library.title")}</h1>
        <p className="mt-1 text-[0.8125rem] text-muted-foreground">{t(language, "library.subtitle")}</p>
        <button
          type="button"
          onClick={onSearch}
          className="mt-4 flex h-12 w-full items-center gap-3 rounded-2xl border border-border bg-card px-4 text-start text-[0.875rem] text-muted-foreground transition-transform active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label={t(language, "library.search")}
        >
          <Search size={19} className="shrink-0 text-primary" aria-hidden="true" />
          <span>{t(language, "library.search")}</span>
        </button>
        <div
          className="mt-4 grid grid-cols-2 gap-2 rounded-2xl border border-border bg-card p-1"
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
              className={`min-h-11 rounded-xl px-3 text-[0.8125rem] font-bold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                section === value ? "bg-primary text-primary-foreground" : "text-muted-foreground"
              }`}
            >
              {t(language, `library.${value}`)}
              {value === "saved" && savedZikrIds.size > 0 ? ` (${formatNumerals(savedZikrIds.size, language)})` : ""}
            </button>
          ))}
        </div>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-5" role="tabpanel">
        {section === "collections" ? (
          <>
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
                    <span
                      className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary/10"
                      aria-hidden="true"
                    >
                      <CatIcon type={category.icon} size={24} color="var(--primary)" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-[1rem] font-bold text-foreground">
                        {isArabic ? category.nameArabic : category.name}
                      </span>
                      <span className="mt-1 block text-[0.8125rem] text-muted-foreground">
                        {formatNumerals(done, language)} {isArabic ? "من" : "of"} {formatNumerals(total, language)}{" "}
                        {t(language, "library.complete")}
                      </span>
                    </span>
                    <ChevronNext size={22} className="text-muted-foreground" aria-hidden="true" />
                  </button>
                );
              })}
            </div>
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
                    onClick={() => onZikr(zikr.category, zikr.orderIndex)}
                    className="flex min-h-[100px] w-full items-start gap-3 rounded-2xl border border-border bg-card p-4 text-start transition-transform active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    aria-label={`${isArabic ? category.nameArabic : category.name}: ${zikr.translation}`}
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
                      <span
                        className="mt-1 line-clamp-2 block text-[0.9375rem] font-semibold leading-6 text-foreground"
                        dir="rtl"
                        lang="ar"
                      >
                        {zikr.arabicText}
                      </span>
                      <span
                        className="mt-1 line-clamp-2 block text-left text-[0.8125rem] leading-5 text-muted-foreground"
                        dir="ltr"
                        lang="en"
                      >
                        {zikr.translation}
                      </span>
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
              className="mt-5 min-h-11 rounded-xl bg-primary px-4 text-[0.875rem] font-bold text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {t(language, "library.browseCollections")}
            </button>
          </section>
        )}
      </div>
    </div>
  );
}
