import { useEffect, useMemo, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { FIELD_LABEL_CLASS } from "./FormField";
import type { AppLanguage, QuranVerseBookmark } from "../types";
import { t } from "../i18n";
import { formatNumerals } from "../formatting";
import { SURAHS, JUZS, searchSurahs, getJuzNumberForPage, getSurahDisplayName } from "../content/surahInfo";
import { SURAH_PLACEMENTS } from "../content/mushafSurahPlacements";
import { X, Search, Bookmark } from "./icons";
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
   * Optional page span for the current surah context.
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
    if (isOpen) setActiveTab(initialTab);
  }, [initialTab, isOpen]);

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

  const isArabic = language === "ar";
  const firstPage = pageRange?.first ?? 1;
  const lastPage = pageRange?.last ?? 604;
  const inRange = (page: number) => page >= firstPage && page <= lastPage;

  const handleInputSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseInt(inputPage, 10);
    if (!isNaN(num) && inRange(num)) {
      handleJump(num);
    }
  };

  const currentSurahIdx = useMemo(() => {
    const idx = SURAHS.findIndex(
      (s, i) => currentPage >= s.startPage && (i === SURAHS.length - 1 || currentPage < SURAHS[i + 1]!.startPage),
    );
    return idx >= 0 ? idx : 0;
  }, [currentPage]);

  const quickPages = useMemo(() => {
    const surahMeta = SURAHS[currentSurahIdx]!;
    const start = pageRange ? pageRange.first : surahMeta.startPage;
    const nextPlacement = surahMeta.number < 114 ? SURAH_PLACEMENTS[surahMeta.number + 1] : null;
    const end = pageRange
      ? pageRange.last
      : nextPlacement
        ? Math.max(start, nextPlacement.line > 1 ? nextPlacement.page : nextPlacement.page - 1)
        : 604;
    const list: number[] = [];
    for (let p = start; p <= end; p++) list.push(p);
    return list;
  }, [currentSurahIdx, pageRange]);

  const bookmarks = pageRange ? allBookmarks.filter(inRange) : allBookmarks;
  const verseBookmarks = pageRange ? allVerseBookmarks.filter((b) => inRange(b.page)) : allVerseBookmarks;

  const tabs: ReadonlyArray<TabDefinition<NavigationTab>> = [
    { value: "surahs", label: <span>{t(language, "mushaf.tabSurahs")}</span> },
    { value: "juzs", label: <span>{t(language, "mushaf.tabJuzs")}</span> },
    { value: "jump", label: <span>{t(language, "mushaf.tabJump")}</span> },
    { value: "bookmarks", label: <span>{t(language, "mushaf.tabBookmarks")}</span> },
  ];

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs animate-in fade-in" />
        <Dialog.Content
          dir={direction}
          className="fixed inset-x-2 bottom-2 top-2 z-50 flex w-auto max-w-xl flex-col overflow-hidden rounded-2xl border border-border bg-card text-card-foreground shadow-overlay animate-in fade-in zoom-in-95 sm:inset-auto sm:top-1/2 sm:left-1/2 sm:h-[min(620px,88dvh)] sm:w-full sm:-translate-x-1/2 sm:-translate-y-1/2"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border bg-card px-4 py-3 sm:px-5">
            <Dialog.Title className="arabic-ui text-base font-bold text-foreground sm:text-lg">
              {t(language, "mushaf.indexTitle")}
            </Dialog.Title>
            <Dialog.Description className="sr-only">{t(language, "mushaf.indexDescription")}</Dialog.Description>
            <Dialog.Close asChild>
              <button
                type="button"
                className="flex size-11 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring"
                aria-label={t(language, "common.close")}
              >
                <X size={20} />
              </button>
            </Dialog.Close>
          </div>

          {/* Navigation Tabs */}
          <TabList
            value={activeTab}
            onChange={setActiveTab}
            tabs={tabs}
            direction={direction}
            idPrefix="mushaf-index"
            aria-label={t(language, "mushaf.indexTitle")}
            className="flex border-b border-border bg-card px-2 sm:px-4"
            itemClassName={(selected) =>
              `flex min-h-11 min-w-0 flex-1 items-center justify-center whitespace-nowrap border-b-2 px-2 py-2.5 text-label font-bold transition-colors focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-inset focus-visible:ring-ring sm:text-sm ${
                selected
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`
            }
          />

          {/* Search Bar */}
          {activeTab === "surahs" && (
            <div className="shrink-0 border-b border-border/60 bg-card px-4 py-2.5">
              <label htmlFor="surah-search" className="sr-only">
                {t(language, "mushaf.searchSurahs")}
              </label>
              <div className="relative flex items-center">
                <span className="pointer-events-none absolute start-3.5 text-muted-foreground">
                  <Search size={16} aria-hidden="true" />
                </span>
                <input
                  id="surah-search"
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t(language, "mushaf.searchSurahs")}
                  className="min-h-11 w-full rounded-xl border border-border bg-input-background ps-10 pe-10 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
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
            className="min-h-0 flex-1 overflow-y-auto p-3.5 sm:p-4 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring/40"
          >
            {/* Surahs Tab */}
            {activeTab === "surahs" && (
              <div className="flex flex-col gap-1.5">
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
                      className={`group flex min-h-12 items-center justify-between gap-3 rounded-xl border px-3.5 py-2 text-start transition-colors focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring ${
                        isCurrent
                          ? "border-primary bg-muted/60 shadow-xs"
                          : "border-border/60 bg-card hover:border-border hover:bg-muted/50"
                      }`}
                      style={{ contentVisibility: "auto", containIntrinsicSize: "3.25rem" }}
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <span
                          className={`flex size-9 shrink-0 items-center justify-center rounded-lg text-xs font-bold tabular-nums font-sans ${
                            isCurrent ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"
                          }`}
                        >
                          {formatNumerals(surah.number, language)}
                        </span>
                        <div className="flex min-w-0 items-baseline gap-2 text-start">
                          <span className="arabic-ui truncate text-base font-bold leading-snug text-foreground">
                            {surah.nameArabic}
                          </span>
                          {!isArabic && (
                            <span className="truncate text-xs font-medium text-muted-foreground">
                              {surah.nameEnglish}
                            </span>
                          )}
                        </div>
                      </div>

                      <span className="shrink-0 rounded-full border border-border/60 bg-muted/60 px-2.5 py-1 text-xs font-semibold tabular-nums text-muted-foreground">
                        {t(language, "mushaf.pageLabel", { page: formatNumerals(surah.startPage, language) })}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Juzs Tab */}
            {activeTab === "juzs" && (
              <div className="flex flex-col gap-1.5">
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
                      className={`group flex items-center justify-between gap-3 rounded-xl border px-3.5 py-2.5 text-start transition-colors focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring ${
                        isCurrent
                          ? "border-primary bg-muted/60 shadow-xs"
                          : "border-border/60 bg-card hover:border-border hover:bg-muted/50"
                      }`}
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <span
                          className={`flex size-9 shrink-0 items-center justify-center rounded-lg text-xs font-bold tabular-nums font-sans ${
                            isCurrent ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"
                          }`}
                        >
                          {formatNumerals(juz.number, language)}
                        </span>
                        <div className="flex min-w-0 flex-col items-start text-start">
                          <div className="arabic-ui truncate text-base font-bold leading-snug text-foreground">
                            {isArabic ? juz.nameArabic : juz.nameEnglish}
                          </div>
                          <div className="mt-0.5 truncate text-xs text-muted-foreground">
                            <span>{surahName}</span>
                            <span aria-hidden="true"> · </span>
                            <span>
                              {t(language, "reader.ayahLabel", { ayah: formatNumerals(juz.startAyah, language) })}
                            </span>
                          </div>
                        </div>
                      </div>

                      <span className="shrink-0 rounded-full border border-border/60 bg-muted/60 px-2.5 py-1 text-xs font-semibold tabular-nums text-muted-foreground">
                        {t(language, "mushaf.pageLabel", { page: formatNumerals(juz.startPage, language) })}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Jump to Page Tab */}
            {activeTab === "jump" && (
              <div className="flex flex-col gap-5 py-1">
                <form onSubmit={handleInputSubmit} className="flex flex-col gap-2.5">
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
                      min={firstPage}
                      max={lastPage}
                      value={inputPage}
                      onChange={(e) => setInputPage(e.target.value)}
                      inputMode="numeric"
                      onWheel={(event) => event.currentTarget.blur()}
                      className="min-h-11 flex-1 rounded-xl border border-border bg-input-background px-4 py-2.5 text-center text-base font-bold tabular-nums text-foreground focus:outline-none focus-visible:ring-[3px] focus-visible:ring-ring"
                    />
                    <button
                      type="submit"
                      className="min-h-11 rounded-xl bg-primary px-6 py-2.5 text-sm font-bold text-primary-foreground transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring"
                    >
                      {t(language, "mushaf.jumpButton")}
                    </button>
                  </div>
                </form>

                {/* Direct Page Selection Grid */}
                <div className="flex flex-col gap-2.5">
                  <span className="arabic-ui text-xs font-bold text-muted-foreground">
                    {getSurahDisplayName(SURAHS[currentSurahIdx]!.number, language)}
                  </span>
                  <div className="grid grid-cols-4 gap-2 sm:grid-cols-6">
                    {quickPages.map((p) => {
                      const isCurrentPage = p === currentPage;
                      return (
                        <button
                          key={p}
                          type="button"
                          onClick={() => handleJump(p)}
                          onMouseEnter={() => prefetchMushafPage(p)}
                          onPointerDown={() => prefetchMushafPage(p)}
                          className={`flex min-h-11 items-center justify-center rounded-xl border px-3 py-2 text-sm font-bold tabular-nums transition-colors focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring ${
                            isCurrentPage
                              ? "border-primary bg-primary text-primary-foreground shadow-xs"
                              : "border-border/70 bg-muted/40 text-foreground hover:border-border hover:bg-muted"
                          }`}
                        >
                          {formatNumerals(p, language)}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Bookmarks Tab */}
            {activeTab === "bookmarks" && (
              <div className="flex flex-col gap-1.5">
                {bookmarks.length === 0 && verseBookmarks.length === 0 ? (
                  <div className="flex flex-col items-center justify-center gap-3 py-12 text-center text-muted-foreground">
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
                          className="group flex min-h-12 items-center justify-between gap-3 rounded-xl border border-border/60 bg-card px-3.5 py-2 text-start transition-colors hover:border-border hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring"
                        >
                          <div className="flex min-w-0 items-center gap-3">
                            <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted text-foreground">
                              <Bookmark size={16} />
                            </span>
                            <span className="truncate text-base font-bold text-foreground">
                              {t(language, "mushaf.pageLabel", { page: formatNumerals(page, language) })}
                            </span>
                          </div>
                          <span className="shrink-0 rounded-full border border-border/60 bg-muted/60 px-2.5 py-1 text-xs font-semibold tabular-nums text-muted-foreground">
                            {t(language, "common.juz")} {formatNumerals(juzNum, language)}
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
                          className="group flex min-h-12 items-center justify-between gap-3 rounded-xl border border-border/60 bg-card px-3.5 py-2 text-start transition-colors hover:border-border hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring"
                        >
                          <div className="flex min-w-0 items-center gap-3">
                            <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted text-foreground">
                              <Bookmark size={16} className="fill-current" />
                            </span>
                            <span className="truncate text-base font-bold text-foreground">
                              {surahName} -{" "}
                              {t(language, "reader.ayahLabel", { ayah: formatNumerals(ayah || "", language) })}
                            </span>
                          </div>
                          <span className="shrink-0 rounded-full border border-border/60 bg-muted/60 px-2.5 py-1 text-xs font-semibold tabular-nums text-muted-foreground">
                            {t(language, "mushaf.pageLabel", {
                              page: formatNumerals(bookmark.page, language),
                            })}
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
