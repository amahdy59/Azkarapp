import { useState, useMemo } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import type { AppLanguage } from "../types";
import { t } from "../i18n";
import { formatNumerals } from "../formatting";
import { SURAHS, JUZS, searchSurahs, getJuzNumberForPage, getSurahDisplayName } from "../content/surahInfo";
import { X, Search, Bookmark, ChevronRight, ChevronLeft } from "./icons";

export function MushafNavigationModal({
  isOpen,
  onClose,
  currentPage,
  onSelectPage,
  language,
  direction,
  bookmarks = [],
}: {
  isOpen: boolean;
  onClose: () => void;
  currentPage: number;
  onSelectPage: (page: number) => void;
  language: AppLanguage;
  direction: "ltr" | "rtl";
  bookmarks?: number[];
}) {
  const [activeTab, setActiveTab] = useState<"surahs" | "juzs" | "jump" | "bookmarks">("surahs");
  const [searchQuery, setSearchQuery] = useState("");
  const [inputPage, setInputPage] = useState(currentPage.toString());

  const filteredSurahs = useMemo(() => {
    return searchSurahs(searchQuery, language);
  }, [searchQuery, language]);

  const handleJump = (page: number) => {
    const valid = Math.max(1, Math.min(604, Math.floor(page)));
    onSelectPage(valid);
    onClose();
  };

  const handleInputSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseInt(inputPage, 10);
    if (!isNaN(num) && num >= 1 && num <= 604) {
      handleJump(num);
    }
  };

  const isArabic = language === "ar";
  const chevron = isArabic ? <ChevronLeft size={18} /> : <ChevronRight size={18} />;

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs animate-in fade-in" />
        <Dialog.Content
          dir={direction}
          className="fixed inset-x-2 bottom-2 top-2 sm:inset-auto sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 z-50 flex max-h-[100dvh] sm:h-[min(620px,88dvh)] w-auto sm:w-full max-w-[560px] flex-col rounded-2xl bg-card text-card-foreground shadow-overlay border border-border overflow-hidden animate-in fade-in zoom-in-95"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border px-5 py-3.5 bg-muted/40">
            <Dialog.Title className="arabic-ui text-base font-bold text-foreground sm:text-lg">
              {t(language, "mushaf.indexTitle")}
            </Dialog.Title>
            <Dialog.Description className="sr-only">{t(language, "mushaf.indexTitle")}</Dialog.Description>
            <Dialog.Close asChild>
              <button
                type="button"
                className="rounded-full p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                aria-label={t(language, "common.close")}
              >
                <X size={20} />
              </button>
            </Dialog.Close>
          </div>

          {/* Navigation Tabs */}
          {/* Four tabs share the width rather than overflowing it. They used to
              scroll sideways, which on a 390px phone left the last one cut off
              at the edge with nothing to say it was there. */}
          <div className="flex border-b border-border bg-muted/20 px-1 pt-2 sm:px-3">
            <button
              type="button"
              onClick={() => setActiveTab("surahs")}
              className={`flex min-h-11 min-w-0 flex-1 items-center justify-center gap-1 border-b-2 px-1 py-2 text-[0.8125rem] font-bold transition-colors sm:gap-1.5 sm:px-3 sm:text-sm ${
                activeTab === "surahs"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <span>{t(language, "mushaf.tabSurahs")}</span>
              <span className="hidden text-xs opacity-70 min-[420px]:inline">({formatNumerals(114, language)})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("juzs")}
              className={`flex min-h-11 min-w-0 flex-1 items-center justify-center gap-1 border-b-2 px-1 py-2 text-[0.8125rem] font-bold transition-colors sm:gap-1.5 sm:px-3 sm:text-sm ${
                activeTab === "juzs"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <span>{t(language, "mushaf.tabJuzs")}</span>
              <span className="hidden text-xs opacity-70 min-[420px]:inline">({formatNumerals(30, language)})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("jump")}
              className={`flex min-h-11 min-w-0 flex-1 items-center justify-center gap-1 border-b-2 px-1 py-2 text-[0.8125rem] font-bold transition-colors sm:gap-1.5 sm:px-3 sm:text-sm ${
                activeTab === "jump"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <span>{t(language, "mushaf.tabJump")}</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("bookmarks")}
              className={`flex min-h-11 min-w-0 flex-1 items-center justify-center gap-1 border-b-2 px-1 py-2 text-[0.8125rem] font-bold transition-colors sm:gap-1.5 sm:px-3 sm:text-sm ${
                activeTab === "bookmarks"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <Bookmark size={15} />
              <span>{t(language, "mushaf.tabBookmarks")}</span>
              {bookmarks.length > 0 && (
                <span className="text-xs px-1.5 py-0.5 rounded-full bg-primary/15 text-primary">
                  {formatNumerals(bookmarks.length, language)}
                </span>
              )}
            </button>
          </div>

          {/* The filter sits outside the scrolling area, not stuck to the top of
              it. Sticky positioning left the list visible in the strip above the
              input as it scrolled past — and on a phone with the keyboard open
              the results had nowhere to go. Nothing scrolls behind this row
              because nothing scrolls under it. */}
          {activeTab === "surahs" && (
            <div className="shrink-0 border-b border-border/60 bg-card px-4 py-3">
              <div className="relative flex items-center">
                <span className="absolute start-3 text-muted-foreground pointer-events-none">
                  <Search size={18} />
                </span>
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t(language, "mushaf.searchSurahs")}
                  className="min-h-11 w-full rounded-xl border border-border bg-input-background ps-9 pe-10 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    aria-label={t(language, "common.clear")}
                    className="absolute end-2 flex size-8 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Tab Content */}
          <div className="min-h-0 flex-1 overflow-y-auto p-4">
            {/* Surahs Tab */}
            {activeTab === "surahs" && (
              <div className="flex flex-col gap-3">
                {/* Surahs List */}
                <div className="flex flex-col gap-1.5 mt-1">
                  {filteredSurahs.map((surah) => {
                    const isCurrent =
                      currentPage >= surah.startPage &&
                      (surah.number === 114 || currentPage < (SURAHS[surah.number]?.startPage ?? 605));
                    return (
                      <button
                        key={surah.number}
                        type="button"
                        onClick={() => handleJump(surah.startPage)}
                        className={`flex items-center justify-between p-3 rounded-xl border transition-all text-start group ${
                          isCurrent
                            ? "bg-primary/10 border-primary/40 shadow-xs"
                            : "bg-card hover:bg-muted border-border/60 hover:border-border"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-xs font-bold font-sans text-primary">
                            {formatNumerals(surah.number, language)}
                          </span>
                          <div>
                            <div className="arabic-ui text-[1.05rem] font-bold text-foreground transition-colors group-hover:text-primary">
                              {surah.nameArabic}
                            </div>
                            <div className="text-xs text-muted-foreground flex items-center gap-2 mt-0.5">
                              <span>{surah.nameEnglish}</span>
                              <span>·</span>
                              <span>
                                {surah.revelationType === "meccan"
                                  ? t(language, "mushaf.meccan")
                                  : t(language, "mushaf.medinan")}
                              </span>
                              <span>·</span>
                              <span>
                                {t(language, "mushaf.ayahCount", {
                                  count: formatNumerals(surah.versesCount, language),
                                })}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-xs font-bold px-2 py-1 rounded-md bg-muted text-muted-foreground">
                            {t(language, "mushaf.pageLabel", { page: formatNumerals(surah.startPage, language) })}
                          </span>
                          <span className="text-muted-foreground group-hover:text-primary transition-transform">
                            {chevron}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Juzs Tab */}
            {activeTab === "juzs" && (
              <div className="flex flex-col gap-2">
                {JUZS.map((juz) => {
                  const isCurrent = getJuzNumberForPage(currentPage) === juz.number;
                  const surahName = getSurahDisplayName(juz.startSurahNumber, language);
                  return (
                    <button
                      key={juz.number}
                      type="button"
                      onClick={() => handleJump(juz.startPage)}
                      className={`flex items-center justify-between p-3.5 rounded-xl border transition-all text-start group ${
                        isCurrent
                          ? "bg-primary/10 border-primary/40 shadow-xs"
                          : "bg-card hover:bg-muted border-border/60 hover:border-border"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-xs font-bold font-sans text-primary">
                          {formatNumerals(juz.number, language)}
                        </span>
                        <div>
                          <div className="arabic-ui text-base font-bold text-foreground transition-colors group-hover:text-primary">
                            {isArabic ? juz.nameArabic : juz.nameEnglish}
                          </div>
                          <div className="text-xs text-muted-foreground mt-0.5">
                            <span>{surahName}</span> :{" "}
                            <span>
                              {t(language, "reader.ayahs")} {formatNumerals(juz.startAyah, language)}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-muted text-muted-foreground">
                          {t(language, "mushaf.pageLabel", { page: formatNumerals(juz.startPage, language) })}
                        </span>
                        <span className="text-muted-foreground group-hover:text-primary transition-transform">
                          {chevron}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Jump to Page Tab */}
            {activeTab === "jump" && (
              <div className="flex flex-col gap-6 py-2">
                <form onSubmit={handleInputSubmit} className="flex flex-col gap-3">
                  <label htmlFor="page-jump-input" className="text-sm font-bold text-foreground">
                    {t(language, "mushaf.enterPageNumber")}
                  </label>
                  <div className="flex gap-2">
                    <input
                      id="page-jump-input"
                      type="number"
                      min={1}
                      max={604}
                      value={inputPage}
                      onChange={(e) => setInputPage(e.target.value)}
                      className="flex-1 rounded-xl bg-input-background border border-border px-4 py-2.5 text-base font-bold text-foreground text-center focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                    <button
                      type="submit"
                      className="px-6 py-2.5 rounded-xl bg-primary text-primary-foreground font-bold text-sm hover:opacity-90 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      {t(language, "mushaf.jumpButton")}
                    </button>
                  </div>
                </form>

                {/* Quick Landmarks */}
                <div className="flex flex-col gap-2">
                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    {t(language, "mushaf.tabSurahs")}
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {[
                      { name: "الفاتحة", en: "Al-Fatihah", page: 1 },
                      { name: "البقرة", en: "Al-Baqarah", page: 2 },
                      { name: "الكهف", en: "Al-Kahf", page: 293 },
                      { name: "يس", en: "Ya-Sin", page: 440 },
                      { name: "الرحمن", en: "Ar-Rahman", page: 531 },
                      { name: "الملك", en: "Al-Mulk", page: 562 },
                      { name: "جزء عم", en: "Juz 'Amma", page: 582 },
                    ].map((item) => (
                      <button
                        key={item.page}
                        type="button"
                        onClick={() => handleJump(item.page)}
                        className="flex flex-col items-start p-2.5 rounded-xl border border-border/70 hover:border-primary/50 bg-muted/30 hover:bg-primary/5 transition-all text-start"
                      >
                        <span className="arabic-ui text-sm font-bold text-foreground">
                          {isArabic ? item.name : item.en}
                        </span>
                        <span className="text-xs text-muted-foreground mt-0.5">
                          {t(language, "mushaf.pageLabel", { page: formatNumerals(item.page, language) })}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Bookmarks Tab */}
            {activeTab === "bookmarks" && (
              <div className="flex flex-col gap-2">
                {bookmarks.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground gap-3">
                    <Bookmark size={36} className="opacity-40" />
                    <p className="text-sm font-medium">{t(language, "mushaf.noBookmarks")}</p>
                  </div>
                ) : (
                  bookmarks.map((page) => {
                    const juzNum = getJuzNumberForPage(page);
                    return (
                      <button
                        key={page}
                        type="button"
                        onClick={() => handleJump(page)}
                        className="flex items-center justify-between p-3.5 rounded-xl border border-border/70 hover:border-primary bg-card hover:bg-muted transition-all text-start group"
                      >
                        <div className="flex items-center gap-3">
                          <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                            <Bookmark size={16} />
                          </span>
                          <div>
                            <div className="font-bold text-base text-foreground group-hover:text-primary transition-colors">
                              {t(language, "mushaf.pageLabel", { page: formatNumerals(page, language) })}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {t(language, "common.juz")} {formatNumerals(juzNum, language)}
                            </div>
                          </div>
                        </div>

                        <span className="text-muted-foreground group-hover:text-primary transition-transform">
                          {chevron}
                        </span>
                      </button>
                    );
                  })
                )}
              </div>
            )}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
