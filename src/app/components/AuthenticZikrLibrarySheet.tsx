import { useMemo, useState } from "react";
import { Search, BookOpen, Check, Sparkles, X } from "./icons";
import {
  AUTHENTIC_AZKAR_COLLECTION,
  getAuthenticZikrCategories,
  type AuthenticZikrItem,
} from "../content/authenticAzkar";
import { formatNumerals } from "../formatting";
import { t } from "../i18n";
import type { AppLanguage } from "../types";

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
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm transition-opacity"
      dir={direction}
      role="dialog"
      aria-modal="true"
      aria-labelledby="authentic-sheet-title"
    >
      <div className="relative z-10 flex max-h-[85vh] w-full max-w-lg flex-col rounded-t-3xl border-t border-border bg-card p-5 shadow-2xl transition-transform">
        {/* Header */}
        <div className="flex items-center justify-between pb-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary">
              <BookOpen size={20} aria-hidden="true" />
            </div>
            <div>
              <h2 id="authentic-sheet-title" className="text-[1.125rem] font-bold text-foreground">
                {isArabic ? "مكتبة الأذكار المأثورة الموثقة" : "Authentic Verified Zikr Library"}
              </h2>
              <p className="text-[0.75rem] text-muted-foreground">
                {isArabic ? "أذكار ثابتة عن النبي ﷺ وأصحابه" : "Authentic Sunnah & Sahabah Supplications"}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="interactive-elem flex h-10 w-10 items-center justify-center rounded-full text-muted-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label={t(language, "common.close") || "Close"}
          >
            <X size={20} />
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative mb-3">
          <Search size={18} className="absolute inset-y-0 start-3 my-auto text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={isArabic ? "بحث في الأذكار والتخريج..." : "Search Zikr & Hadith references..."}
            className="h-11 w-full rounded-xl border border-border bg-background ps-10 pe-4 text-[0.875rem] text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>

        {/* Category Filter Pills */}
        <div className="no-scrollbar mb-3 flex gap-2 overflow-x-auto pb-1">
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCat(cat.id)}
              className={`shrink-0 rounded-full px-3.5 py-1.5 text-[0.8125rem] font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                selectedCat === cat.id
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "border border-border bg-background text-muted-foreground hover:bg-muted"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Authentic Zikr Items List */}
        <div className="space-y-3 overflow-y-auto pe-1" style={{ maxHeight: "52vh" }}>
          {filteredItems.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              <p className="text-[0.875rem]">
                {isArabic ? "لم يتم العثور على أذكار مطابقة." : "No matching authentic Zikr found."}
              </p>
            </div>
          ) : (
            filteredItems.map((item) => (
              <div
                key={item.id}
                className="group relative rounded-2xl border border-border bg-card p-4 transition-all hover:border-primary/50 hover:shadow-md"
              >
                {/* Header badges */}
                <div className="mb-2.5 flex items-center justify-between gap-2">
                  <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-[0.75rem] font-bold text-primary">
                    {isArabic ? item.categoryNameAr : item.categoryNameEn}
                  </span>
                  <span className="rounded-full bg-secondary/30 px-2.5 py-0.5 text-[0.75rem] font-semibold text-secondary-foreground">
                    {isArabic ? item.sourceRefAr : item.sourceRefEn}
                  </span>
                </div>

                {/* Zikr Text */}
                <p
                  className="mb-3 text-[1.1875rem] font-extrabold leading-loose text-foreground"
                  dir="rtl"
                  style={{ fontFamily: "Amiri, Scheherazade New, serif" }}
                >
                  "{item.textAr}"
                </p>

                {/* Virtue / Reward */}
                {item.virtueAr && (
                  <div className="mb-3 flex items-start gap-2 rounded-xl bg-amber-500/10 p-3 text-[0.8125rem] font-medium text-amber-800 dark:text-amber-300">
                    <Sparkles size={16} className="mt-0.5 shrink-0 text-amber-500" />
                    <p>{isArabic ? item.virtueAr : item.virtueEn}</p>
                  </div>
                )}

                {/* Action button */}
                <button
                  type="button"
                  onClick={() => handleSelectAuthentic(item)}
                  className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 text-[0.875rem] font-bold text-primary-foreground transition-all hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <Check size={18} />
                  <span>
                    {isArabic
                      ? `اختيار بالعدد المأثور (${formatNumerals(item.recommendedTarget, language)})`
                      : `Select with Target (${formatNumerals(item.recommendedTarget, language)})`}
                  </span>
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
