import { useEffect, useMemo, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { FIELD_LABEL_CLASS } from "./FormField";
import type { AppLanguage, QuranVerseBookmark } from "../types";
import { t } from "../i18n";
import { formatNumerals } from "../formatting";
import { SURAHS, JUZS, searchSurahs, getJuzNumberForPage, getSurahDisplayName } from "../content/surahInfo";
import { X, Search, Bookmark, ChevronRight, ChevronLeft } from "./icons";
import { TabList, tabPanelProps, type TabDefinition } from "./Tabs";
import { prefetchMushafPage } from "../content/qcfMushaf";

type NavigationTab = "surahs" | "juzs" | "jump" | "bookmarks";

export function MushafNavigationModal({
  isOpen,
  onClose,
  currentPage,
  onSelectPage,
  language,
  direction,
  bookmarks: allBookmarks = [],
  verseBookmarks: allVerseBookmarks = [],
  onSelectVerseBookmark,
  initialTab = "surahs",
  pageRange,
}: {
  isOpen: boolean;
  onClose: () => void;
  currentPage: number;
  onSelectPage: (page: number) => void;
  language: AppLanguage;
  direction: "ltr" | "rtl";
  bookmarks?: number[];
  verseBookmarks?: QuranVerseBookmark[];
  onSelectVerseBookmark?: (bookmark: QuranVerseBookmark) => void;
  /** Which tab an opening lands on, so "Bookmarks" opens bookmarks. */
  initialTab?: NavigationTab;
  /**
   * Limits the index to one span of the Mushaf.
   *
   * A surah reading is still the Mushaf, but its index is not: the surah and
   * juz tabs would carry the reader out of the surah they opened, and a page
   * number outside the span has nothing to show. With a range the index offers
   * the pages of that span and the bookmarks inside it, and nothing that leaves.
   */
  pageRange?: { first: number; last: number };
}) {
  const [activeTab, setActiveTab] = useState<NavigationTab>(initialTab);
  const [searchQuery, setSearchQuery] = useState("");
  const [inputPage, setInputPage] = useState(currentPage.toString());

  useEffect(() => {
    if (isOpen) setInputPage(currentPage.toString());
  }, [currentPage, isOpen]);

  // The caller names the tab when it opens the sheet; reopening from the same
  // entry point must land there again, not on whatever was left showing.
  useEffect(() => {
    if (isOpen) setActiveTab(pageRange && initialTab !== "bookmarks" ? "jump" : initialTab);
  }, [initialTab, isOpen, pageRange]);

  const filteredSurahs = useMemo(() => {
    return searchSurahs(searchQuery, language);
  }, [searchQuery, language]);

  useEffect(() => {
    if (!isOpen) return;
    for (let i = 0; i < Math.min(8, filteredSurahs.length); i++) {
      const page = filteredSurahs[i]?.startPage;
      if (page) prefetchMushafPage(page);
    }
  }, [isOpen, filteredSurahs]);

  const handleJump = (page: number) => {
    const valid = Math.max(1, Math.min(604, Math.floor(page)));
    onSelectPage(valid);
    onClose();
  };

  const handleInputSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseInt(inputPage, 10);
    if (!isNaN(num) && inRange(num)) {
      handleJump(num);
    }
  };

  const isArabic = language === "ar";
  const chevron = isArabic ? <ChevronLeft size={18} /> : <ChevronRight size={18} />;
  const firstPage = pageRange?.first ?? 1;
  const lastPage = pageRange?.last ?? 604;
  const inRange = (page: number) => page >= firstPage && page <= lastPage;

  // A bookmark on page 300 is not reachable from inside Al-Mulk, so a scoped
  // index does not offer it.
  const bookmarks = pageRange ? allBookmarks.filter(inRange) : allBookmarks;
  const verseBookmarks = pageRange ? allVerseBookmarks.filter((b) => inRange(b.page)) : allVerseBookmarks;

  const tabs: ReadonlyArray<TabDefinition<NavigationTab>> = (
    pageRange
      ? [
          { value: "jump" as const, label: <span>{t(language, "mushaf.tabJump")}</span> },
          {
            value: "bookmarks" as const,
            label: <span>{t(language, "mushaf.tabBookmarks")}</span>,
          },
        ]
      : [
          {
            value: "surahs",
            label: (
              <>
                <span>{t(language, "mushaf.tabSurahs")}</span>
                <span className="hidden text-xs opacity-70 sm:inline">({formatNumerals(114, language)})</span>
              </>
            ),
          },
          {
            value: "juzs",
            label: (
              <>
                <span>{t(language, "mushaf.tabJuzs")}</span>
                <span className="hidden text-xs opacity-70 sm:inline">({formatNumerals(30, language)})</span>
              </>
            ),
          },
          { value: "jump", label: <span>{t(language, "mushaf.tabJump")}</span> },
          {
            value: "bookmarks",
            label: (
              <>
                <Bookmark size={15} aria-hidden="true" />
                <span>{t(language, "mushaf.tabBookmarks")}</span>
                {(bookmarks.length > 0 || verseBookmarks.length > 0) && (
                  <span className="rounded-full bg-primary/10 px-1.5 py-0.5 text-xs">
                    {formatNumerals(bookmarks.length + verseBookmarks.length, language)}
                  </span>
                )}
              </>
            ),
          },
        ]
  ) as ReadonlyArray<TabDefinition<NavigationTab>>;

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs animate-in fade-in" />
        <Dialog.Content
          dir={direction}
          className="fixed inset-x-2 bottom-2 top-2 z-50 flex w-auto max-w-xl flex-col overflow-hidden rounded-2xl border border-border bg-card text-card-foreground shadow-overlay animate-in fade-in zoom-in-95 sm:inset-auto sm:top-1/2 sm:left-1/2 sm:h-[min(620px,88dvh)] sm:w-full sm:-translate-x-1/2 sm:-translate-y-1/2"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border px-5 py-3.5 bg-muted/40">
            <Dialog.Title className="arabic-ui text-base font-bold text-foreground sm:text-lg">
              {t(language, "mushaf.indexTitle")}
            </Dialog.Title>
            <Dialog.Description className="sr-only">{t(language, "mushaf.indexDescription")}</Dialog.Description>
            <Dialog.Close asChild>
              <button
                type="button"
                className="flex size-11 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring"
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
          <TabList
            value={activeTab}
            onChange={setActiveTab}
            tabs={tabs}
            direction={direction}
            idPrefix="mushaf-index"
            aria-label={t(language, "mushaf.indexTitle")}
            className="flex border-b border-border bg-muted/20 px-1 pt-2 sm:px-3"
            itemClassName={(selected) =>
              `flex min-h-11 min-w-0 flex-1 items-center justify-center gap-1 border-b-2 px-1 py-2 text-label font-bold transition-colors focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-inset focus-visible:ring-ring sm:gap-1.5 sm:px-3 sm:text-sm ${
                selected
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`
            }
          />

          {/* The filter sits outside the scrolling area, not stuck to the top of
              it. Sticky positioning left the list visible in the strip above the
              input as it scrolled past — and on a phone with the keyboard open
              the results had nowhere to go. Nothing scrolls behind this row
              because nothing scrolls under it. */}
          {activeTab === "surahs" && (
            <div className="shrink-0 border-b border-border/60 bg-card px-4 py-3">
              <label htmlFor="surah-search" className={`mb-1.5 block ${FIELD_LABEL_CLASS}`}>
                {t(language, "mushaf.searchSurahs")}
              </label>
              <div className="relative flex items-center">
                <span className="absolute start-3 text-muted-foreground pointer-events-none">
                  <Search size={18} />
                </span>
                <input
                  id="surah-search"
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
                    className="absolute flex size-11 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring"
                    style={{ insetInlineEnd: 0 }}
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Tab Content */}
          <div
            {...tabPanelProps("mushaf-index", activeTab)}
            className="min-h-0 flex-1 overflow-y-auto p-4 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring/40"
          >
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
                        onMouseEnter={() => prefetchMushafPage(surah.startPage)}
                        onPointerDown={() => prefetchMushafPage(surah.startPage)}
                        className={`flex items-center justify-between p-3 rounded-xl border transition-colors text-start group ${
                          isCurrent
                            ? "bg-primary/10 border-primary/40 shadow-xs"
                            : "bg-card hover:bg-muted border-border/60 hover:border-border"
                        }`}
                        style={{ contentVisibility: "auto", containIntrinsicSize: "4.5rem" }}
                      >
                        <div className="flex items-center gap-3">
                          <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-xs font-bold font-sans text-primary">
                            {formatNumerals(surah.number, language)}
                          </span>
                          <div>
                            <div className="arabic-ui text-title font-bold text-foreground transition-colors group-hover:text-primary">
                              {surah.nameArabic}
                            </div>
                            <div className="text-xs text-muted-foreground flex items-center gap-2 mt-0.5">
                              {!isArabic && (
                                <>
                                  <span>{surah.nameEnglish}</span>
                                  <span>·</span>
                                </>
                              )}
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
                      onMouseEnter={() => prefetchMushafPage(juz.startPage)}
                      onPointerDown={() => prefetchMushafPage(juz.startPage)}
                      className={`flex items-center justify-between p-3.5 rounded-xl border transition-colors text-start group ${
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
                  <label htmlFor="page-jump-input" className={FIELD_LABEL_CLASS}>
                    {pageRange
                      ? t(language, "mushaf.enterPageNumberInRange", {
                          first: formatNumerals(firstPage, language),
                          last: formatNumerals(lastPage, language),
                        })
                      : t(language, "mushaf.enterPageNumber")}
                  </label>
                  <div className="flex gap-2">
                    <input
                      id="page-jump-input"
                      type="number"
                      // The control states the span it accepts. Leaving 1-604
                      // here while the handler refused anything outside the
                      // surah meant the field invited a number it would ignore.
                      min={firstPage}
                      max={lastPage}
                      value={inputPage}
                      onChange={(e) => setInputPage(e.target.value)}
                      inputMode="numeric"
                      onWheel={(event) => event.currentTarget.blur()}
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
                        className="flex flex-col items-start p-2.5 rounded-xl border border-border/70 hover:border-primary/50 bg-muted/30 hover:bg-primary/5 transition-colors text-start"
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
                {bookmarks.length === 0 && verseBookmarks.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground gap-3">
                    <Bookmark size={36} className="opacity-40" />
                    <p className="text-sm font-medium">{t(language, "mushaf.noBookmarks")}</p>
                  </div>
                ) : (
                  <>
                    {bookmarks.map((page) => {
                      const juzNum = getJuzNumberForPage(page);
                      return (
                        <button
                          key={page}
                          type="button"
                          onClick={() => handleJump(page)}
                          className="flex items-center justify-between p-3.5 rounded-xl border border-border/70 hover:border-primary bg-card hover:bg-muted transition-colors text-start group"
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
                    })}
                    {verseBookmarks.map((bookmark) => {
                      const [surah, ayah] = bookmark.verseKey.split(":");
                      const surahName = getSurahDisplayName(surah || "", language);
                      return (
                        <button
                          key={`verse-${bookmark.verseKey}`}
                          type="button"
                          onClick={() => {
                            onSelectVerseBookmark?.(bookmark);
                            handleJump(bookmark.page);
                          }}
                          className="flex items-center justify-between p-3.5 rounded-xl border border-border/70 hover:border-primary bg-card hover:bg-muted transition-colors text-start group"
                        >
                          <div className="flex items-center gap-3">
                            <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                              <Bookmark size={16} className="fill-primary" />
                            </span>
                            <div>
                              <div className="font-bold text-base text-foreground group-hover:text-primary transition-colors">
                                {surahName} -{" "}
                                {t(language, "reader.ayahLabel", { ayah: formatNumerals(ayah || "", language) })}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {t(language, "mushaf.pageLabel", {
                                  page: formatNumerals(bookmark.page, language),
                                })}
                              </div>
                            </div>
                          </div>

                          <span className="text-muted-foreground group-hover:text-primary transition-transform">
                            {chevron}
                          </span>
                        </button>
                      );
                    })}
                  </>
                )}
              </div>
            )}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
