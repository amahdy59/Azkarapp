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
  onSelectZikr: (zikr: AuthenticZikrItem | { textAr: string; textEn: string; target: number }) => void;
  language: AppLanguage;
  direction: "ltr" | "rtl";
}) {
  const isArabic = language === "ar";
  const [selectedCat, setSelectedCat] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [customText, setCustomText] = useState("");
  const [customTarget, setCustomTarget] = useState(100);
  const [activeTab, setActiveTab] = useState<"library" | "custom">("library");

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

  const handleSelectCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customText.trim()) return;
    onSelectZikr({
      textAr: customText.trim(),
      textEn: customText.trim(),
      target: customTarget,
    });
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm transition-opacity"
      dir={direction}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="authentic-sheet-title"
    >
      <div
        className="flex max-h-[85vh] w-full max-w-lg flex-col rounded-t-3xl border-t border-border bg-card p-5 shadow-2xl transition-transform"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3">
          <div className="flex items-center gap-2">
            <BookOpen className="text-primary" size={24} aria-hidden="true" />
            <h2 id="authentic-sheet-title" className="text-[1.25rem] font-bold text-foreground">
              {isArabic ? "مكتبة الأذكار المأثورة" : "Authentic Zikr Collection"}
            </h2>
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

        {/* Top Segmented Control (Library vs Custom) */}
        <div className="mb-4 grid grid-cols-2 gap-2 rounded-xl border border-border bg-muted/30 p-1">
          <button
            type="button"
            onClick={() => setActiveTab("library")}
            className={`min-h-11 rounded-lg px-3 text-[0.875rem] font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
              activeTab === "library" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground"
            }`}
          >
            {isArabic ? "أذكار مأثورة موثقة" : "Authentic Sunnah Zikr"}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("custom")}
            className={`min-h-11 rounded-lg px-3 text-[0.875rem] font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
              activeTab === "custom" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground"
            }`}
          >
            {isArabic ? "ذكر خاص" : "Custom Zikr"}
          </button>
        </div>

        {activeTab === "library" ? (
          <>
            {/* Search Bar */}
            <div className="relative mb-3">
              <Search size={18} className="absolute inset-y-0 start-3 my-auto text-muted-foreground" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={isArabic ? "بحث في الأذكار والأحاديث..." : "Search Zikr & Hadith references..."}
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
                      ? "bg-primary/20 border border-primary/40 text-primary"
                      : "border border-border bg-background text-muted-foreground hover:bg-muted"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Zikr Items List */}
            <div className="space-y-3 overflow-y-auto pe-1" style={{ maxHeight: "48vh" }}>
              {filteredItems.length === 0 ? (
                <div className="py-8 text-center text-muted-foreground">
                  <p className="text-[0.875rem]">
                    {isArabic ? "لم يتم العثور على أذكار مطابقة." : "No matching Zikr found."}
                  </p>
                </div>
              ) : (
                filteredItems.map((item) => (
                  <div
                    key={item.id}
                    className="group relative rounded-2xl border border-border bg-card p-4 transition-all hover:border-primary/50 hover:shadow-md"
                  >
                    {/* Header badges */}
                    <div className="mb-2 flex items-center justify-between gap-2">
                      <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-[0.75rem] font-bold text-primary">
                        {isArabic ? item.categoryNameAr : item.categoryNameEn}
                      </span>
                      <span className="rounded-full bg-secondary/30 px-2.5 py-0.5 text-[0.75rem] font-medium text-secondary-foreground">
                        {isArabic ? item.sourceRefAr : item.sourceRefEn}
                      </span>
                    </div>

                    {/* Zikr Text */}
                    <p className="mb-3 text-[1.125rem] font-extrabold leading-loose text-foreground" dir="rtl">
                      {item.textAr}
                    </p>

                    {/* Virtue / Reward */}
                    {item.virtueAr && (
                      <div className="mb-3 flex items-start gap-2 rounded-xl bg-amber-500/10 p-2.5 text-[0.8125rem] text-amber-700 dark:text-amber-300">
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
                          ? `اختيار العداد المأثور (${formatNumerals(item.recommendedTarget, language)})`
                          : `Select with Target (${formatNumerals(item.recommendedTarget, language)})`}
                      </span>
                    </button>
                  </div>
                ))
              )}
            </div>
          </>
        ) : (
          /* Custom Zikr Form */
          <form onSubmit={handleSelectCustom} className="space-y-4 py-2">
            <div>
              <label htmlFor="custom-zikr-text" className="mb-1.5 block text-[0.875rem] font-bold text-foreground">
                {isArabic ? "نص الذكر الخاص" : "Custom Zikr Text"}
              </label>
              <textarea
                id="custom-zikr-text"
                rows={3}
                value={customText}
                onChange={(e) => setCustomText(e.target.value)}
                placeholder={isArabic ? "أدخل نص الذكر الذي تريده..." : "Enter custom Zikr text..."}
                className="w-full rounded-xl border border-border bg-background p-3 text-[1rem] text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                dir="rtl"
                required
              />
            </div>

            <div>
              <label htmlFor="custom-target-num" className="mb-1.5 block text-[0.875rem] font-bold text-foreground">
                {isArabic ? "العدد المستهدف (الهدف)" : "Target Repetitions"}
              </label>
              <div className="flex items-center gap-2">
                {[33, 100, 500, 1000].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setCustomTarget(num)}
                    className={`h-10 flex-1 rounded-lg border text-[0.875rem] font-bold ${
                      customTarget === num
                        ? "border-primary bg-primary/20 text-primary"
                        : "border-border bg-background text-muted-foreground"
                    }`}
                  >
                    {formatNumerals(num, language)}
                  </button>
                ))}
              </div>
              <input
                id="custom-target-num"
                type="number"
                min={1}
                max={100000}
                value={customTarget}
                onChange={(e) => setCustomTarget(Math.max(1, parseInt(e.target.value) || 1))}
                className="mt-2 h-11 w-full rounded-xl border border-border bg-background px-3 text-[1rem] font-bold text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>

            <button
              type="submit"
              disabled={!customText.trim()}
              className="h-12 w-full rounded-xl bg-primary text-[0.9375rem] font-bold text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            >
              {isArabic ? "بدء العداد بهذا الذكر" : "Start Counter with Custom Zikr"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
