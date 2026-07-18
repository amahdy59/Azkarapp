import React, { useState } from "react";
import { ArrowPrevious, Search, X } from "../components/icons";
import { ALL_AZKAR, getAzkarByCategory, ZIKR_LABELS } from "../content/azkar";
import type { AppLanguage, CategoryId } from "../types";
import { StatePanel } from "../components/StatePanel";

const RECENT_SEARCHES = ["Istighfar", "Morning Dua", "Ayat al-Kursi"];

export function CategoryBadge({ catId, language = "en" }: { catId: CategoryId; language?: AppLanguage }) {
  const isArabic = language === "ar";
  const cfg = {
    morning: { label: isArabic ? "الصباح" : "Morning", className: "bg-primary text-primary-foreground" },
    evening: { label: isArabic ? "المساء" : "Evening", className: "bg-secondary text-secondary-foreground" },
    before_sleep: { label: isArabic ? "النوم" : "Sleep", className: "bg-muted text-foreground" },
  }[catId];

  return (
    <div className={`flex items-center justify-center rounded-full px-2 py-1 shrink-0 ${cfg.className}`}>
      <p className="text-[0.625rem] font-medium font-sans leading-[14px] whitespace-nowrap">{cfg.label}</p>
    </div>
  );
}

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
  const [recents, setRecents] = useState(() => (isArabic ? [] : RECENT_SEARCHES));

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
    if (!recents.includes(term)) {
      setRecents((current) => [term, ...current].slice(0, 5));
    }
    setQ(term);
  };

  return (
    <div className="flex flex-col h-full bg-background slide-in-from-right" dir={direction}>
      <div className="flex items-center gap-3 px-5 py-3 shrink-0">
        <button
          onClick={onBack}
          className="flex items-center justify-center w-11 h-11 shrink-0 active:scale-95 transition-all"
          aria-label={isArabic ? "رجوع" : "Back"}
        >
          <ArrowPrevious size={24} className="text-foreground" />
        </button>

        <div className="flex items-center gap-3 flex-1 rounded-full px-4 h-12 bg-card border border-border">
          <Search size={18} className="text-primary shrink-0" />
          <input
            type="text"
            placeholder={isArabic ? "ابحث في الأذكار والأدعية" : "Search adhkar or duas"}
            aria-label={isArabic ? "البحث في الأذكار والأدعية" : "Search adhkar and duas"}
            value={q}
            dir="auto"
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && q.trim() && handleSubmit(q.trim())}
            className="flex-1 bg-transparent focus:outline-none text-[0.875rem] text-foreground font-sans leading-[22px]"
          />
          {!q && <div className="shrink-0 rounded-sm w-[2px] h-[18px] bg-primary animate-pulse" />}
          {q && (
            <button
              onClick={() => setQ("")}
              className="-me-3 flex h-11 w-11 shrink-0 items-center justify-center text-muted-foreground"
              aria-label={isArabic ? "مسح البحث" : "Clear search"}
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5">
        {!q && recents.length > 0 && (
          <div className="mb-6">
            <p className="mb-3 text-[0.8125rem] text-muted-foreground font-semibold font-sans leading-[18px]">
              {isArabic ? "عمليات البحث الأخيرة" : "Recent searches"}
            </p>
            <div className="flex flex-wrap gap-2">
              {recents.map((term) => (
                <div key={term} className="flex items-center rounded-full bg-secondary text-secondary-foreground">
                  <button
                    onClick={() => setQ(term)}
                    className="min-h-11 px-4 text-[0.8125rem] font-medium font-sans leading-[20px] text-start transition-all active:scale-95"
                  >
                    {term}
                  </button>
                  <button
                    type="button"
                    onClick={() => setRecents((current) => current.filter((saved) => saved !== term))}
                    className="flex items-center justify-center w-11 h-11 text-secondary-foreground/70 hover:text-secondary-foreground"
                    aria-label={
                      isArabic ? `إزالة ${term} من عمليات البحث الأخيرة` : `Remove ${term} from recent searches`
                    }
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {q.trim().length >= 2 && (
          <div className="flex flex-col gap-2" aria-live="polite">
            {results.length > 0 && (
              <p className="mb-1 text-[0.8125rem] text-muted-foreground font-semibold font-sans leading-[18px]">
                {isArabic
                  ? `${results.length} نتيجة للبحث عن «${q}»`
                  : `${results.length} result${results.length === 1 ? "" : "s"} for “${q}”`}
              </p>
            )}
            {results.length === 0 ? (
              <StatePanel
                kind="empty-search"
                title={isArabic ? "لم يتم العثور على أذكار" : undefined}
                description={isArabic ? "جرّب كلمة أخرى بالعربية أو الإنجليزية أو بالتهجئة اللاتينية." : undefined}
                actionLabel={isArabic ? "مسح البحث" : "Clear search"}
                onAction={() => setQ("")}
              />
            ) : (
              results.map((z) => {
                const zIdx = getAzkarByCategory(z.category).findIndex((a) => a.id === z.id);
                const label = isArabic
                  ? z.arabicText.split("\n")[0]
                  : (ZIKR_LABELS[z.id] ?? z.transliteration.slice(0, 24));
                const subtitle = isArabic ? z.translation.slice(0, 40) : z.translation.slice(0, 40);
                return (
                  <button
                    key={z.id}
                    onClick={() => onZikr(z.category, zIdx)}
                    className="w-full flex items-center justify-between px-4 rounded-xl transition-all active:scale-[0.98] h-[72px] bg-card border border-border"
                  >
                    <div className="flex min-w-0 flex-1 flex-col items-start gap-1">
                      <p
                        className="w-full truncate text-start font-sans text-[1.0625rem] font-semibold leading-[24px] text-foreground"
                        dir="auto"
                      >
                        {label}
                      </p>
                      <p
                        className="w-full truncate text-left font-sans text-[0.875rem] leading-[22px] text-muted-foreground"
                        dir="ltr"
                        lang="en"
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

        {!q && (
          <div className="py-6 flex flex-col items-center gap-3">
            <div className="w-full h-px opacity-15 bg-muted-foreground" />
            <p className="text-[0.75rem] text-muted-foreground font-sans leading-[18px] text-center">
              {isArabic
                ? "ابحث بالعربية أو الإنجليزية أو بالتهجئة اللاتينية"
                : "Try Arabic, English, or transliteration"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
