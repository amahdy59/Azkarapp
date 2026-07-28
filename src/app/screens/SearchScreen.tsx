import { useState } from "react";
import { ArrowPrevious, Search, X } from "../components/icons";
import { ALL_AZKAR, getAzkarByCategory, ZIKR_LABELS } from "../content/azkar";
import { CATEGORIES } from "../content/categories";
import type { AppLanguage, CategoryId } from "../types";
import { StatePanel } from "../components/StatePanel";
import { IconButton } from "../components/LayoutShells";
import { t } from "../i18n";

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
      <p className="text-[0.625rem] font-medium font-sans leading-[14px] whitespace-nowrap">{label}</p>
    </div>
  );
}

// ─── SearchScreen ─────────────────────────────────────────────────────────────
export function SearchScreen({
  onBack,
  onZikr,
  language,
  direction,
}: {
  onBack: () => void;
  onZikr: (catId: CategoryId, i: number) => void;
  language: AppLanguage;
  direction: "ltr" | "rtl";
}) {
  const isArabic = language === "ar";
  const [q, setQ] = useState("");

  // Load per-language history from localStorage; no hardcoded defaults.
  const [recents, setRecents] = useState<string[]>(() => loadRecents(language));

  const results =
    q.trim().length < 2
      ? []
      : ALL_AZKAR.filter((z) => {
          const lq = q.toLowerCase();
          return (
            z.arabicText.includes(q) ||
            z.translation.toLowerCase().includes(lq) ||
            z.transliteration.toLowerCase().includes(lq) ||
            (ZIKR_LABELS[z.id] ?? "").toLowerCase().includes(lq)
          );
        });

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
      {/* Search bar */}
      <div className="flex items-center gap-3 px-5 py-3 shrink-0">
        <IconButton onClick={onBack} label={t(language, "common.back")} className="shrink-0">
          <ArrowPrevious size={20} className="text-foreground" />
        </IconButton>

        <div className="flex h-12 flex-1 items-center gap-3 rounded-full border border-border-control bg-card px-4">
          <Search size={18} className="text-primary shrink-0" />
          <input
            type="text"
            placeholder={t(language, "search.placeholder")}
            aria-label={t(language, "search.inputAriaLabel")}
            value={q}
            dir="auto"
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit(q)}
            className="flex-1 bg-transparent focus:outline-none text-[0.875rem] text-foreground font-sans leading-[22px]"
          />
          {!q && <div className="shrink-0 rounded-sm w-[2px] h-[18px] bg-primary animate-pulse" />}
          {q && (
            <button
              type="button"
              onClick={() => setQ("")}
              className="-me-3 flex h-11 w-11 shrink-0 items-center justify-center text-muted-foreground"
              aria-label={t(language, "search.clearAriaLabel")}
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5">
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
                    className="min-h-11 px-4 text-[0.8125rem] font-medium font-sans leading-[20px] text-start transition-all active:scale-95"
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
          <div className="flex flex-col gap-2" aria-live="polite">
            {results.length > 0 && (
              <p className="mb-1 text-[0.8125rem] text-muted-foreground font-semibold font-sans leading-[18px]">
                {resultCountLabel}
              </p>
            )}
            {results.length === 0 ? (
              <StatePanel
                kind="empty-search"
                title={t(language, "search.emptyTitle")}
                description={t(language, "search.emptyDescription")}
                actionLabel={t(language, "search.emptyAction")}
                onAction={() => setQ("")}
              />
            ) : (
              results.map((z) => {
                const zIdx = getAzkarByCategory(z.category).findIndex((a) => a.id === z.id);
                const category = CATEGORIES.find((item) => item.id === z.category)!;
                const label = isArabic ? z.arabicText.split("\n")[0] : z.translation;
                const subtitle = isArabic ? category.nameArabic : z.transliteration;
                return (
                  <button
                    key={z.id}
                    onClick={() => {
                      handleSubmit(q);
                      onZikr(z.category, zIdx);
                    }}
                    className="flex h-[72px] w-full items-center justify-between rounded-2xl border border-border bg-card px-4 transition-all"
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
                        className="w-full truncate text-start font-sans text-[0.875rem] leading-[22px] text-muted-foreground"
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
