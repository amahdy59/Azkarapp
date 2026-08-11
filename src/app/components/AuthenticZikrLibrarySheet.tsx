import { useMemo, useState } from "react";
import { Search, BookOpen, Sparkles, X, Check } from "./icons";
import { ResponsiveSheet } from "./ResponsiveSheet";
import {
  AUTHENTIC_AZKAR_COLLECTION,
  getAuthenticZikrCategories,
  type AuthenticZikrItem,
} from "../content/authenticAzkar";
import { t } from "../i18n";
import type { AppLanguage } from "../types";
import { useLayoutMode } from "../hooks/useLayoutMode";

export function AuthenticZikrLibrarySheet({
  isOpen,
  onClose,
  onSelectZikr,
  language,
  direction,
  selectedZikrId,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSelectZikr: (item: AuthenticZikrItem) => void;
  language: AppLanguage;
  direction: "ltr" | "rtl";
  selectedZikrId?: string;
}) {
  const isArabic = language === "ar";
  const layoutMode = useLayoutMode();
  const useDialog = layoutMode !== "compact";

  const [selectedCat, setSelectedCat] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const categories = useMemo(() => getAuthenticZikrCategories(language), [language]);

  const filteredItems = useMemo(() => {
    return AUTHENTIC_AZKAR_COLLECTION.filter((item) => {
      const matchesCat = selectedCat === "all" || item.category === selectedCat;
      const q = searchQuery.trim().toLowerCase();
      if (!q) return matchesCat;
      const matchesSearch =
        item.textAr.includes(q) ||
        item.textEn.toLowerCase().includes(q) ||
        item.sourceRefAr.includes(q) ||
        item.sourceRefEn.toLowerCase().includes(q) ||
        item.virtueAr.includes(q) ||
        item.virtueEn.toLowerCase().includes(q);
      return matchesCat && matchesSearch;
    });
  }, [selectedCat, searchQuery]);

  if (!isOpen) return null;

  const handleSelectAuthentic = (item: AuthenticZikrItem) => {
    onSelectZikr(item);
    onClose();
  };

  return (
    <ResponsiveSheet
      open={isOpen}
      onClose={onClose}
      title={t(language, "library.authenticTitle")}
      direction={direction}
      describedById="authentic-sheet-description"
      maxWidthClassName="max-w-[var(--content-form)]"
    >
      <>
        {/* Drag Handle Bar (sheet only) */}
        {!useDialog && (
          <div className="flex shrink-0 justify-center pt-3 pb-1">
            <div className="h-1.5 w-12 rounded-full bg-muted-foreground/30" aria-hidden="true" />
          </div>
        )}

        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-border/40 shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <BookOpen size={20} aria-hidden="true" />
            </div>
            <div>
              <h2 id="authentic-sheet-title" className="text-[1.0625rem] font-extrabold text-foreground leading-snug">
                {t(language, "library.authenticTitle")}
              </h2>
              <p id="authentic-sheet-description" className="text-[0.75rem] font-medium text-muted-foreground">
                {t(language, "library.authenticSubtitle")}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={t(language, "common.back")}
            className="flex size-11 items-center justify-center rounded-full bg-muted/80 text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Search Bar & Category Filter Pills */}
        <div className="flex flex-col gap-3 p-4 bg-muted/30 border-b border-border/40 shrink-0">
          {/* Search input */}
          <label htmlFor="authentic-zikr-search" className="sr-only">
            {t(language, "library.authenticSearch")}
          </label>
          <div className="relative flex items-center">
            <Search size={18} className="absolute start-3 text-muted-foreground pointer-events-none" />
            <input
              type="text"
              id="authentic-zikr-search"
              name="authentic-zikr-search"
              autoComplete="off"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t(language, "library.authenticSearch")}
              className="h-12 w-full rounded-[var(--ds-radius-control)] border border-border-control bg-background ps-10 pe-4 text-[0.875rem] placeholder:text-muted-foreground/60 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring"
            />
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCat(cat.id)}
                aria-pressed={selectedCat === cat.id}
                className={`min-h-11 shrink-0 rounded-xl px-3.5 text-[0.8125rem] font-bold transition-colors cursor-pointer ${
                  selectedCat === cat.id
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "bg-background border border-border text-muted-foreground hover:text-foreground"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Scrollable Items List */}
        <div className="min-h-0 flex-1 overflow-y-auto p-4 space-y-3">
          {filteredItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center text-muted-foreground">
              <Sparkles size={32} className="mb-2 text-muted-foreground/40" />
              <p className="text-[0.9375rem] font-semibold">{t(language, "library.noMatchingDhikr")}</p>
            </div>
          ) : (
            filteredItems.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => handleSelectAuthentic(item)}
                aria-pressed={selectedZikrId === item.id}
                className={`group flex min-h-24 w-full flex-col gap-2 rounded-[var(--ds-radius-control)] border p-4 text-start transition-[border-color,background-color,box-shadow] hover:border-primary/50 hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring cursor-pointer ${
                  selectedZikrId === item.id ? "border-primary bg-primary/8" : "border-border-control bg-card"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <p className="zikr-text line-clamp-2 text-[1.0625rem] font-bold leading-7 text-foreground" dir="rtl">
                    {item.textAr}
                  </p>
                  {selectedZikrId === item.id ? (
                    <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                      <Check size={14} strokeWidth={3} aria-hidden="true" />
                    </span>
                  ) : null}
                </div>

                <p
                  className="line-clamp-2 border-t border-border/40 pt-2 text-[0.8125rem] font-semibold leading-5 text-muted-foreground"
                  dir="auto"
                >
                  {isArabic ? item.virtueAr : item.virtueEn}
                </p>
              </button>
            ))
          )}
        </div>
      </>
    </ResponsiveSheet>
  );
}
