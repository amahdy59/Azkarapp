import { useMemo, useState } from "react";
import { Search, BookOpen, Sparkles, X } from "./icons";
import { ResponsiveSheet } from "./ResponsiveSheet";
import {
  AUTHENTIC_AZKAR_COLLECTION,
  getAuthenticZikrCategories,
  type AuthenticZikrItem,
} from "../content/authenticAzkar";
import { formatNumerals } from "../formatting";
import { t } from "../i18n";
import type { AppLanguage } from "../types";
import { useLayoutMode } from "../hooks/useLayoutMode";

export function AuthenticZikrLibrarySheet({
  isOpen,
  onClose,
  onSelectZikr,
  language,
  direction,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSelectZikr: (item: AuthenticZikrItem) => void;
  language: AppLanguage;
  direction: "ltr" | "rtl";
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
        item.virtueAr.includes(q);
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
      title={isArabic ? "مكتبة الأذكار المأثورة الموثقة" : "Authentic Verified Zikr Library"}
      direction={direction}
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
                {isArabic ? "مكتبة الأذكار المأثورة الموثقة" : "Authentic Verified Zikr Library"}
              </h2>
              <p className="text-[0.75rem] font-medium text-muted-foreground">
                {isArabic ? "أذكار ثابتة عن النبي ﷺ وأصحابه" : "Authentic Sunnah & Sahabah Supplications"}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={t(language, "common.back")}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-muted/80 text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Search Bar & Category Filter Pills */}
        <div className="flex flex-col gap-3 p-4 bg-muted/30 border-b border-border/40 shrink-0">
          {/* Search input */}
          <div className="relative flex items-center">
            <Search size={18} className="absolute start-3 text-muted-foreground pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isArabic ? "بحث في الأذكار والمصادر..." : "Search dhikr or source..."}
              className="w-full h-11 ps-9 pe-4 rounded-xl border border-border bg-background text-[0.875rem] placeholder:text-muted-foreground/60 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring"
            />
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
            <button
              type="button"
              onClick={() => setSelectedCat("all")}
              className={`shrink-0 h-9 px-3.5 rounded-xl text-[0.8125rem] font-bold transition-colors cursor-pointer ${
                selectedCat === "all"
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "bg-background border border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              {isArabic ? "الكل" : "All"} ({formatNumerals(AUTHENTIC_AZKAR_COLLECTION.length, language)})
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCat(cat.id)}
                className={`shrink-0 h-9 px-3.5 rounded-xl text-[0.8125rem] font-bold transition-colors cursor-pointer ${
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
              <p className="text-[0.9375rem] font-semibold">
                {isArabic ? "لم يتم العثور على أذكار مطابقة" : "No matching dhikr found"}
              </p>
            </div>
          ) : (
            filteredItems.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => handleSelectAuthentic(item)}
                className="group flex w-full flex-col gap-2 rounded-2xl border border-border/70 bg-card p-4 text-start shadow-xs transition-all hover:border-primary/50 hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring cursor-pointer"
              >
                <div className="flex items-start justify-between gap-3">
                  <p className="zikr-text text-[1.125rem] font-bold leading-relaxed text-foreground" dir="rtl">
                    {item.textAr}
                  </p>
                </div>

                {!isArabic && (
                  <p className="latin-ui text-[0.875rem] text-muted-foreground leading-relaxed">{item.textEn}</p>
                )}

                <div className="flex items-center justify-between pt-1 border-t border-border/40 text-[0.75rem] font-medium text-muted-foreground">
                  <span className="text-primary font-semibold">{isArabic ? item.sourceRefAr : item.sourceRefEn}</span>
                  {item.recommendedTarget && (
                    <span className="rounded-md bg-muted px-2 py-0.5 text-[0.6875rem] font-bold text-foreground">
                      {formatNumerals(item.recommendedTarget, language)} {isArabic ? "مرة" : "times"}
                    </span>
                  )}
                </div>
              </button>
            ))
          )}
        </div>
      </>
    </ResponsiveSheet>
  );
}
