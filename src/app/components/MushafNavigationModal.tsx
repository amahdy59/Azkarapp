import { useEffect, useMemo, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { FIELD_LABEL_CLASS } from "./FormField";
import type { AppLanguage, QuranVerseBookmark } from "../types";
import { t } from "../i18n";
import { formatNumerals } from "../formatting";
import {
  SURAHS,
  JUZS,
  RUB_START_PAGES,
  searchSurahs,
  getJuzNumberForPage,
  getSurahDisplayName,
  getHizbsForJuz,
} from "../content/surahInfo";
import { X, Search, Bookmark, BookOpen, ChevronDown, ChevronUp } from "./icons";
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
  const [expandedJuzs, setExpandedJuzs] = useState<Set<number>>(() => new Set([getJuzNumberForPage(currentPage)]));

  useEffect(() => {
    if (isOpen) setInputPage(currentPage.toString());
  }, [currentPage, isOpen]);

  // The caller names the tab when it opens the sheet; reopening from the same
  // entry point must land there again, not on whatever was left showing.
  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
      setExpandedJuzs(new Set([getJuzNumberForPage(currentPage)]));
    }
  }, [initialTab, isOpen, currentPage]);

  const toggleJuz = (juzNumber: number) => {
    setExpandedJuzs((prev) => {
      const next = new Set(prev);
      if (next.has(juzNumber)) {
        next.delete(juzNumber);
      } else {
        next.add(juzNumber);
      }
      return next;
    });
  };

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

  const quickPages = useMemo(() => {
    const start = pageRange ? pageRange.first : 1;
    const end = pageRange ? pageRange.last : 604;
    const span = end - start + 1;
    // Scale step dynamically: for the full 604-page Mushaf (or spans > 120 pages),
    // use multiples of 15 (42 items total). In a 6-column grid, this produces
    // exactly 7 full rows (6 × 7 = 42) that fit on one screen without scrolling.
    // Smaller spans scale down (5, 2, 1) so the user gets meaningful jump targets.
    const step = span > 120 ? 15 : span > 40 ? 5 : span > 15 ? 2 : 1;
    const list: number[] = [];
    if (start % step !== 0) list.push(start);
    const firstMultiple = Math.ceil(start / step) * step;
    for (let p = firstMultiple; p <= end; p += step) list.push(p);
    if (end % step !== 0 && !list.includes(end)) list.push(end);
    return list;
  }, [pageRange]);

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
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/60 animate-in fade-in" />
        <Dialog.Content
          dir={direction}
          className="fixed inset-x-2 bottom-2 top-2 z-50 flex w-auto max-w-xl flex-col overflow-hidden rounded-2xl border border-border bg-card text-card-foreground shadow-overlay animate-in fade-in zoom-in-95 sm:inset-auto sm:top-1/2 sm:left-1/2 sm:h-[min(620px,88dvh)] sm:w-full sm:-translate-x-1/2 sm:-translate-y-1/2"
        >
          {/* Header */}
          <div className="flex shrink-0 items-center justify-between gap-3 border-b border-border/40 bg-card px-4 py-2.5 sm:px-5 sm:py-3">
            <div className="flex min-w-0 flex-1 items-center gap-2.5">
              <div className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <BookOpen size={17} aria-hidden="true" />
              </div>
              <Dialog.Title className="truncate text-base font-extrabold leading-snug text-foreground sm:text-lg">
                {t(language, "mushaf.indexTitle")}
              </Dialog.Title>
            </div>
            <Dialog.Description className="sr-only">{t(language, "mushaf.indexDescription")}</Dialog.Description>
            <Dialog.Close asChild>
              <button
                type="button"
                className="flex h-10 w-10 min-h-10 min-w-10 shrink-0 items-center justify-center rounded-full bg-muted/80 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring cursor-pointer active:scale-95"
                aria-label={t(language, "common.close")}
                data-testid="modal-close-button"
              >
                <X size={16} aria-hidden="true" />
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
            className="flex border-b border-border bg-card px-1.5 sm:px-3"
            itemClassName={(selected) =>
              `flex min-h-10 min-w-0 flex-1 items-center justify-center whitespace-nowrap border-b-2 px-2 py-2 text-xs font-bold transition-colors focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-inset focus-visible:ring-ring sm:text-sm ${
                selected
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`
            }
          />

          {/* Search Bar - Slim 36px height */}
          {activeTab === "surahs" && (
            <div className="shrink-0 border-b border-border/60 bg-card px-3.5 py-1.5">
              <label htmlFor="surah-search" className="sr-only">
                {t(language, "mushaf.searchSurahs")}
              </label>
              <div className="relative flex items-center">
                <span className="pointer-events-none absolute start-3 text-muted-foreground">
                  <Search size={14} aria-hidden="true" />
                </span>
                <input
                  id="surah-search"
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t(language, "mushaf.searchSurahs")}
                  className="h-9 min-h-9 w-full rounded-xl border border-border bg-input-background ps-9 pe-9 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring sm:text-sm"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    aria-label={t(language, "common.clear")}
                    className="absolute flex size-8 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring"
                    style={{ insetInlineEnd: 4 }}
                  >
                    <X size={13} />
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Tab Content */}
          <div
            {...tabPanelProps("mushaf-index", activeTab)}
            className="min-h-0 flex-1 overflow-y-auto p-2.5 sm:p-3.5 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring/40"
          >
            {/* Surahs Tab - 2 Columns Grid */}
            {activeTab === "surahs" && (
              <div className="grid grid-cols-2 gap-1.5">
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
                      aria-current={isCurrent ? "true" : undefined}
                      className={`group flex min-h-11 items-center justify-between gap-2 rounded-xl border px-3 py-2 text-start transition-colors focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring cursor-pointer ${
                        isCurrent
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border/60 bg-card hover:border-border hover:bg-muted/50 text-foreground"
                      }`}
                      style={{ contentVisibility: "auto", containIntrinsicSize: "2.75rem" }}
                    >
                      <div className="flex min-w-0 items-center gap-2">
                        <span
                          className={`flex size-6 shrink-0 items-center justify-center rounded-md text-xs font-bold tabular-nums font-sans ${
                            isCurrent ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"
                          }`}
                        >
                          {formatNumerals(surah.number, language)}
                        </span>
                        <span className="arabic-ui truncate text-sm font-bold leading-tight">
                          {isArabic ? surah.nameArabic : surah.nameEnglish}
                        </span>
                      </div>

                      <span className="shrink-0 text-xs font-medium tabular-nums text-muted-foreground">
                        {t(language, "mushaf.pageShort", { page: formatNumerals(surah.startPage, language) })}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Juzs Tab - Accordion with Hizbs & Quarters */}
            {activeTab === "juzs" && (
              <div className="flex flex-col gap-2">
                {JUZS.map((juz) => {
                  const isCurrentJuz = getJuzNumberForPage(currentPage) === juz.number;
                  const surahName = getSurahDisplayName(juz.startSurahNumber, language);
                  const isExpanded = expandedJuzs.has(juz.number);
                  const hizbs = getHizbsForJuz(juz.number);

                  return (
                    <div
                      key={juz.number}
                      className={`rounded-xl border transition-colors ${
                        isCurrentJuz ? "border-primary bg-card shadow-sm" : "border-border/60 bg-card"
                      }`}
                    >
                      {/* Juz Header Row */}
                      <div className="flex min-h-11 items-center justify-between gap-2 px-3 py-2">
                        <button
                          type="button"
                          onClick={() => handleJump(juz.startPage)}
                          onMouseEnter={() => prefetchMushafPage(juz.startPage)}
                          onPointerDown={() => prefetchMushafPage(juz.startPage)}
                          className="group flex min-w-0 flex-1 items-center justify-between gap-2 text-start focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring rounded-lg cursor-pointer"
                          title={t(language, "mushaf.pageLabel", { page: formatNumerals(juz.startPage, language) })}
                        >
                          <div className="flex min-w-0 items-center gap-2">
                            <span
                              className={`flex size-6 shrink-0 items-center justify-center rounded-md text-xs font-bold tabular-nums font-sans ${
                                isCurrentJuz ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"
                              }`}
                            >
                              {formatNumerals(juz.number, language)}
                            </span>
                            <div className="flex min-w-0 flex-col items-start text-start">
                              <span className="arabic-ui truncate text-sm font-bold leading-tight text-foreground">
                                {isArabic ? juz.nameArabic : juz.nameEnglish}
                              </span>
                              <span className="mt-0.5 truncate text-xs text-muted-foreground">
                                <span>{surahName}</span>
                                <span aria-hidden="true"> · </span>
                                <span>
                                  {t(language, "reader.ayahLabel", { ayah: formatNumerals(juz.startAyah, language) })}
                                </span>
                              </span>
                            </div>
                          </div>

                          <span className="shrink-0 rounded-full border border-border/60 bg-muted/60 px-2.5 py-1 text-xs font-semibold tabular-nums text-muted-foreground">
                            {t(language, "mushaf.pageShort", { page: formatNumerals(juz.startPage, language) })}
                          </span>
                        </button>

                        {/* Accordion Toggle */}
                        <button
                          type="button"
                          onClick={() => toggleJuz(juz.number)}
                          aria-expanded={isExpanded}
                          aria-label={`${t(language, "mushaf.toggleQuarters")} - ${isArabic ? juz.nameArabic : juz.nameEnglish}`}
                          className="flex size-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring active:scale-95 cursor-pointer"
                        >
                          {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </button>
                      </div>

                      {/* Expanded Hizbs & Quarters Section */}
                      {isExpanded && (
                        <div className="border-t border-border/50 bg-muted/30 p-2 space-y-2 animate-in fade-in duration-fast">
                          {hizbs.map((hizb) => {
                            return (
                              <div key={hizb.hizbNumber} className="space-y-1">
                                <div className="flex items-center justify-between px-1 text-xs font-semibold text-muted-foreground">
                                  <span>
                                    {t(language, "mushaf.hizbLabel", {
                                      number: formatNumerals(hizb.hizbNumber, language),
                                    })}
                                  </span>
                                  <span className="tabular-nums">
                                    {t(language, "mushaf.pageShort", {
                                      page: formatNumerals(hizb.startPage, language),
                                    })}
                                  </span>
                                </div>

                                <div className="grid grid-cols-4 gap-1">
                                  {hizb.quarters.map((q) => {
                                    const isCurrentQuarter =
                                      currentPage >= q.startPage &&
                                      (q.rubNumber === 240 || currentPage < (RUB_START_PAGES[q.rubNumber] ?? 605));
                                    return (
                                      <button
                                        key={q.rubNumber}
                                        type="button"
                                        onClick={() => handleJump(q.startPage)}
                                        onMouseEnter={() => prefetchMushafPage(q.startPage)}
                                        onPointerDown={() => prefetchMushafPage(q.startPage)}
                                        aria-current={isCurrentQuarter ? "true" : undefined}
                                        title={`${t(language, "mushaf.quarterLabel", { number: formatNumerals(q.quarterNumber, language) })}${q.firstWord ? ` - ${q.firstWord}` : ""} - ${t(language, "mushaf.pageLabel", { page: formatNumerals(q.startPage, language) })}`}
                                        className={`flex flex-col items-center justify-center rounded-lg border px-1 py-1.5 text-center transition-colors focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring cursor-pointer ${
                                          isCurrentQuarter
                                            ? "border-primary bg-primary text-primary-foreground font-bold shadow-sm"
                                            : "border-border/60 bg-card hover:border-border hover:bg-muted text-foreground"
                                        }`}
                                      >
                                        <span className="text-xs font-bold leading-tight">
                                          {t(language, "mushaf.quarterShort", {
                                            number: formatNumerals(q.quarterNumber, language),
                                          })}
                                        </span>
                                        {q.firstWord && (
                                          <span
                                            className={`mt-0.5 truncate max-w-full px-0.5 text-micro font-semibold leading-tight ${
                                              isCurrentQuarter ? "text-primary-foreground" : "text-foreground"
                                            }`}
                                            dir="rtl"
                                          >
                                            {q.firstWord}
                                          </span>
                                        )}
                                        <span
                                          className={`mt-0.5 text-micro tabular-nums leading-none ${
                                            isCurrentQuarter
                                              ? "text-primary-foreground opacity-90"
                                              : "text-muted-foreground"
                                          }`}
                                        >
                                          {t(language, "mushaf.pageShort", {
                                            page: formatNumerals(q.startPage, language),
                                          })}
                                        </span>
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Jump to Page Tab */}
            {activeTab === "jump" && (
              <div className="flex flex-col gap-4 py-1 sm:gap-5">
                <form onSubmit={handleInputSubmit} className="flex flex-col gap-2">
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
                <div className="flex flex-col gap-2">
                  <span className="text-xs font-bold text-muted-foreground">{t(language, "mushaf.quickJump")}</span>
                  <div className="grid grid-cols-6 gap-1.5 sm:gap-2">
                    {quickPages.map((p) => {
                      const isCurrentPage = p === currentPage;
                      return (
                        <button
                          key={p}
                          type="button"
                          onClick={() => handleJump(p)}
                          onMouseEnter={() => prefetchMushafPage(p)}
                          onPointerDown={() => prefetchMushafPage(p)}
                          aria-current={isCurrentPage ? "page" : undefined}
                          className={`flex min-h-11 items-center justify-center rounded-xl border px-1.5 py-2 text-xs font-bold tabular-nums transition-colors focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring sm:text-sm ${
                            isCurrentPage
                              ? "border-primary bg-primary text-primary-foreground "
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
                          className="group flex min-h-12 items-center justify-between gap-3 rounded-xl border border-border/60 bg-card px-3 py-2 text-start transition-colors hover:border-border hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring"
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
                          className="group flex min-h-12 items-center justify-between gap-3 rounded-xl border border-border/60 bg-card px-3 py-2 text-start transition-colors hover:border-border hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring"
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
