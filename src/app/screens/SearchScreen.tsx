/* eslint-disable jsx-a11y/no-noninteractive-tabindex */
import { useDeferredValue, useId, useMemo, useState } from "react";
import { ArrowPrevious, Search, X } from "../components/icons";
import { ALL_AZKAR, getAzkarByCategory, ZIKR_LABELS } from "../content/azkar";
import { CATEGORIES } from "../content/categories";
import type { AppLanguage, CategoryId } from "../types";
import { StatePanel } from "../components/StatePanel";
import { IconButton } from "../components/LayoutShells";
import { t } from "../i18n";

import { normalizeSearchText } from "../content/searchNormalization";

// ─── Recent-search persistence ────────────────────────────────────────────────
// Stored per-language so Arabic and English histories don't overwrite each other.
const MAX_RECENTS = 5;

function recentsKey(language: AppLanguage): string {
  return `azkarapp_recent_searches_${language}`;
}

function loadRecents(language: AppLanguage): string[] {
  try {
    const stored = localStorage.getItem(recentsKey(language));
    if (!stored) return [];
    const parsed: unknown = JSON.parse(stored);
    return Array.isArray(parsed) ? (parsed as string[]).slice(0, MAX_RECENTS) : [];
  } catch {
    return [];
  }
}

function saveRecents(language: AppLanguage, recents: string[]): void {
  try {
    localStorage.setItem(recentsKey(language), JSON.stringify(recents.slice(0, MAX_RECENTS)));
  } catch {
    // ignore storage errors
  }
}

// ─── CategoryBadge ────────────────────────────────────────────────────────────
export function CategoryBadge({ catId, language }: { catId: CategoryId; language: AppLanguage }) {
  const isArabic = language === "ar";
  const cat = CATEGORIES.find((c) => c.id === catId);
  const label = isArabic ? (cat?.nameArabic ?? catId) : (cat?.name ?? catId);
  const isPrimary = catId === "morning";
  const isSecondary = catId === "evening";
  const className = isPrimary
    ? "bg-primary text-primary-foreground"
    : isSecondary
      ? "bg-secondary text-secondary-foreground"
      : "bg-muted text-foreground";

  return (
    <div className={`flex items-center justify-center rounded-full px-2 py-1 shrink-0 ${className}`}>
      <p className="text-[0.75rem] font-medium font-sans leading-[16px] whitespace-nowrap">{label}</p>
    </div>
  );
}

// ─── SearchScreen ─────────────────────────────────────────────────────────────
/**
 * Normalized haystack per zikr, built once and reused across keystrokes.
 * Normalizing the whole corpus on every render would be wasteful; the corpus is
 * static so the key can be cached by zikr id.
 */
const searchKeyCache = new Map<string, string>();

function searchKeyFor(zikr: (typeof ALL_AZKAR)[number]): string {
  const cached = searchKeyCache.get(zikr.id);
  if (cached !== undefined) return cached;
  const key = normalizeSearchText(
    [zikr.arabicText, zikr.translation, zikr.transliteration, ZIKR_LABELS[zikr.id] ?? ""].join(" | "),
  );
  searchKeyCache.set(zikr.id, key);
  return key;
}

export function SearchScreen({
  onBack,
  onZikr,
  language,
  direction,
  initialQuery = "",
}: {
  onBack: () => void;
  onZikr: (catId: CategoryId, i: number) => void;
  language: AppLanguage;
  direction: "ltr" | "rtl";
  initialQuery?: string;
}) {
  const isArabic = language === "ar";
  const searchInputId = useId();
  const [q, setQ] = useState(() => initialQuery.trim());
  const deferredQuery = useDeferredValue(q.trim());

  // Load per-language history from localStorage; no hardcoded defaults.
  const [recents, setRecents] = useState<string[]>(() => loadRecents(language));

  const results = useMemo(() => {
    if (deferredQuery.length < 2) return [];
    const normalizedQuery = normalizeSearchText(deferredQuery);
    if (!normalizedQuery) return [];
    return ALL_AZKAR.filter((zikr) => !zikr.isCollectionIntroduction && searchKeyFor(zikr).includes(normalizedQuery));
  }, [deferredQuery]);

  const handleSubmit = (term: string) => {
    const trimmed = term.trim();
    if (!trimmed) return;
    setRecents((current) => {
      // Move to top if already present, otherwise prepend
      const next = [trimmed, ...current.filter((s) => s !== trimmed)].slice(0, MAX_RECENTS);
      saveRecents(language, next);
      return next;
    });
    setQ(trimmed);
  };

  const handleRemoveRecent = (term: string) => {
    setRecents((current) => {
      const next = current.filter((s) => s !== term);
      saveRecents(language, next);
      return next;
    });
  };

  // Result count label — English distinguishes singular/plural; Arabic uses a single template.
  const resultCountLabel =
    results.length === 1
      ? t(language, "search.resultsSingular", { query: q })
      : t(language, "search.resultsPlural", { count: String(results.length), query: q });

  return (
    <div className="flex flex-col h-full bg-background slide-in-from-right" dir={direction}>
      <h1 className="sr-only">{t(language, "search.inputAriaLabel")}</h1>
      {/* Search bar */}
      <div className="flex shrink-0 items-end gap-3 px-5 py-3">
        <IconButton onClick={onBack} label={t(language, "common.back")} className="shrink-0">
          <ArrowPrevious size={20} className="text-foreground" />
        </IconButton>

        <div className="min-w-0 flex-1">
          <label htmlFor={searchInputId} className="mb-1.5 block text-[0.75rem] font-semibold text-muted-foreground">
            {t(language, "search.inputAriaLabel")}
          </label>
          <div className="flex h-12 items-center gap-3 rounded-full border border-border-control bg-card px-4 focus-within:ring-[3px] focus-within:ring-ring">
            <Search size={18} className="shrink-0 text-primary" aria-hidden="true" />
            <input
              id={searchInputId}
              type="text"
              placeholder={t(language, "search.placeholder")}
              value={q}
              dir={q.trim() ? "auto" : direction}
              lang={language}
              autoComplete="off"
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit(q)}
              className="min-w-0 flex-1 bg-transparent text-start font-sans text-[0.875rem] leading-[22px] text-foreground focus:outline-none"
            />
            {q && (
              <button
                type="button"
                onClick={() => setQ("")}
                className="-me-3 flex h-11 w-11 shrink-0 items-center justify-center text-muted-foreground"
                aria-label={t(language, "search.clearAriaLabel")}
              >
                <X size={16} aria-hidden="true" />
              </button>
            )}
          </div>
        </div>
      </div>

      <div
        role="region"
        aria-label={t(language, "search.placeholder")}
        tabIndex={0}
        className="flex-1 overflow-y-auto px-5 outline-none focus-visible:ring-1 focus-visible:ring-ring/40"
      >
        {/* Recent searches — shown when input is empty and there is history */}
        {!q && recents.length > 0 && (
          <div className="mb-6">
            <p className="mb-3 text-[0.8125rem] text-muted-foreground font-semibold font-sans leading-[18px]">
              {t(language, "search.recentTitle")}
            </p>
            <div className="flex flex-wrap gap-2">
              {recents.map((term) => (
                <div key={term} className="flex items-center rounded-full bg-secondary text-secondary-foreground">
                  <button
                    type="button"
                    onClick={() => setQ(term)}
                    className="min-h-11 px-4 text-[0.8125rem] font-medium font-sans leading-[20px] text-start transition-[color,background-color,border-color,transform] active:scale-95"
                  >
                    {term}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRemoveRecent(term)}
                    className="flex items-center justify-center w-11 h-11 text-secondary-foreground/70 hover:text-secondary-foreground"
                    aria-label={t(language, "search.removeAriaLabel", { term })}
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Results */}
        {q.trim().length >= 2 && (
          <div className="flex flex-col gap-2">
            <p
              role="status"
              aria-live="polite"
              aria-atomic="true"
              className="mb-1 text-[0.8125rem] text-muted-foreground font-semibold font-sans leading-[18px]"
            >
              {results.length > 0 ? resultCountLabel : t(language, "search.emptyTitle")}
            </p>
            {results.length === 0 ? (
              <StatePanel
                kind="empty-search"
                language={language}
                title={t(language, "search.emptyTitle")}
                description={t(language, "search.emptyDescription")}
                actionLabel={t(language, "search.emptyAction")}
                onAction={() => setQ("")}
              />
            ) : (
              results.map((z) => {
                const zIdx = getAzkarByCategory(z.category).findIndex((a) => a.id === z.id);
                const category = CATEGORIES.find((item) => item.id === z.category)!;
                const label = (isArabic ? z.arabicText.split("\n")[0] : z.translation) ?? z.id;
                const subtitle = isArabic ? category.nameArabic : z.transliteration;
                const accessibleTitle = isArabic
                  ? (z.surahNameArabic ?? label.slice(0, 48))
                  : (z.surahNameEnglish ?? ZIKR_LABELS[z.id] ?? label.split(".")[0] ?? label);
                return (
                  <button
                    key={z.id}
                    data-testid="search-result"
                    onClick={() => {
                      handleSubmit(q);
                      onZikr(z.category, zIdx);
                    }}
                    aria-label={t(language, "search.resultAriaLabel", {
                      title: accessibleTitle,
                      category: isArabic ? category.nameArabic : category.name,
                    })}
                    className="flex min-h-[72px] w-full items-center justify-between rounded-3xl border border-border/40 bg-card px-4 py-3 shadow-raised hover:border-primary/40 transition-[color,background-color,border-color,box-shadow]"
                  >
                    <div className="flex min-w-0 flex-1 flex-col items-start gap-1">
                      <p
                        className="w-full truncate text-start font-sans text-[1.0625rem] font-semibold leading-[24px] text-foreground"
                        dir={isArabic ? "rtl" : "ltr"}
                        lang={isArabic ? "ar" : "en"}
                      >
                        {label}
                      </p>
                      <p
                        // Two lines rather than one: Arabic previews lose their
                        // sense far earlier than Latin text when clipped mid-phrase.
                        className="line-clamp-2 w-full text-start font-sans text-[0.875rem] leading-[22px] text-muted-foreground"
                        dir={isArabic ? "rtl" : "ltr"}
                        lang={isArabic ? "ar" : "en"}
                      >
                        {subtitle}
                      </p>
                    </div>
                    <div className="ms-2">
                      <CategoryBadge catId={z.category} language={language} />
                    </div>
                  </button>
                );
              })
            )}
          </div>
        )}

        {/* Hint — shown when input is empty */}
        {!q && (
          <div className="py-6 flex flex-col items-center gap-3">
            <div className="w-full h-px opacity-15 bg-muted-foreground" />
            <p className="text-[0.75rem] text-muted-foreground font-sans leading-[18px] text-center">
              {t(language, "search.hint")}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
