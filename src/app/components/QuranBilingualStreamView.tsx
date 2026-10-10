import { useEffect, useState } from "react";
import { ArrowPrevious, Bookmark, ChevronLeft, ChevronRight, MoreVertical } from "./icons";
import { formatNumerals } from "../formatting";
import { t } from "../i18n";
import type { AppLanguage, MushafTheme, QuranVerseBookmark, ThemeMode } from "../types";
import type { MushafVerseData } from "../content/qcfMushaf";
import { loadPageEnglishTranslation, type QuranPageVerseTranslation } from "../content/quranTranslations";

export interface QuranBilingualStreamViewProps {
  pageNumber: number;
  surahName: string;
  juzNumber: number;
  pageData: MushafVerseData[] | null;
  language: AppLanguage;
  direction?: "ltr" | "rtl";
  bookmarkedVerses: QuranVerseBookmark[];
  onToggleVerseBookmark: (verseKey: string, pageNumber: number) => void;
  onAyahAction: (verseKey: string, pageNumber: number) => void;
  showWordMeanings?: boolean;
  onPaginate: (delta: number) => void;
  atFirstPage: boolean;
  atLastPage: boolean;
  theme?: MushafTheme;
  appTheme?: ThemeMode;
  onBack?: () => void;
  onOpenMore?: () => void;
}

export function QuranBilingualStreamView({
  pageNumber,
  surahName,
  juzNumber,
  pageData,
  language,
  direction = "ltr",
  bookmarkedVerses,
  onToggleVerseBookmark,
  onAyahAction,
  showWordMeanings: _showWordMeanings = false,
  onPaginate,
  atFirstPage,
  atLastPage,
  theme = "midnight",
  appTheme = "midnight",
  onBack,
  onOpenMore,
}: QuranBilingualStreamViewProps) {
  const [translations, setTranslations] = useState<Map<string, string>>(new Map());
  const resolvedTheme = theme === "follow-app" ? appTheme : theme;

  useEffect(() => {
    let active = true;
    setTranslations(new Map());
    if (!pageData) return;

    void loadPageEnglishTranslation(pageData)
      .then((data: QuranPageVerseTranslation[]) => {
        if (!active) return;
        const map = new Map<string, string>();
        for (const item of data) {
          map.set(item.verseKey, item.text);
        }
        setTranslations(map);
      })
      .catch(() => undefined);

    return () => {
      active = false;
    };
  }, [pageData]);

  const ChevronPrev = direction === "rtl" ? ChevronRight : ChevronLeft;
  const ChevronNext = direction === "rtl" ? ChevronLeft : ChevronRight;

  return (
    <div
      data-testid="bilingual-stream-view"
      className="flex flex-col h-full w-full max-w-2xl mx-auto overflow-y-auto px-4 py-6 sm:px-6"
      dir={direction}
    >
      {/* Header Info */}
      <header className="mb-6 flex items-center justify-between border-b border-border/60 pb-3">
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              aria-label={t(language, "common.back")}
              data-testid="bilingual-back-button"
              className="flex size-11 shrink-0 items-center justify-center rounded-full border border-border/80 bg-card hover:bg-muted text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <ArrowPrevious size={16} aria-hidden="true" />
            </button>
          )}
          <div>
            <h2 className="text-lg font-bold text-foreground">{surahName}</h2>
            <span className="text-xs text-muted-foreground">
              {t(language, "mushaf.juzLabel", { juz: formatNumerals(juzNumber, language) })}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
            {t(language, "mushaf.pageLabel", { page: formatNumerals(pageNumber, language) })}
          </span>
          {onOpenMore && (
            <button
              type="button"
              onClick={onOpenMore}
              aria-label={t(language, "mushaf.moreActions")}
              data-testid="bilingual-more-button"
              className="flex size-11 shrink-0 items-center justify-center rounded-full border border-border/80 bg-card hover:bg-muted text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <MoreVertical size={16} aria-hidden="true" />
            </button>
          )}
        </div>
      </header>

      {/* Verses Stream */}
      <p className="mb-3 text-xs text-muted-foreground" lang="en" dir="ltr">
        Saheeh International
      </p>
      <div className="space-y-4 flex-1">
        {pageData?.map((verse) => {
          const verseKey = verse.k;
          const [surahNum, ayahNum] = verseKey.split(":");
          const isBookmarked = bookmarkedVerses.some((b) => b.verseKey === verseKey);
          const arabicText = verse.w.map((w) => w[3]).join(" ");
          const englishText = translations.get(verseKey);

          return (
            <article
              key={verseKey}
              data-verse-key={verseKey}
              className={`rounded-2xl border border-border p-4 sm:p-5 shadow-xs transition-colors theme-${resolvedTheme} bg-card text-card-foreground`}
            >
              {/* Verse Metadata & Actions */}
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-border text-xs">
                <span className="font-bold text-primary">
                  {formatNumerals(Number(surahNum), language)}:{formatNumerals(Number(ayahNum), language)}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    data-testid={`bilingual-bookmark-${verseKey}`}
                    onClick={() => onToggleVerseBookmark(verseKey, pageNumber)}
                    aria-label={t(language, isBookmarked ? "reader.removeAyahBookmark" : "reader.bookmarkAyah")}
                    title={t(language, isBookmarked ? "reader.removeAyahBookmark" : "reader.bookmarkAyah")}
                    className="flex size-11 shrink-0 items-center justify-center rounded-lg hover:bg-muted/60 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <Bookmark
                      size={17}
                      className={isBookmarked ? "fill-primary text-primary" : "text-muted-foreground"}
                      aria-hidden="true"
                    />
                  </button>
                  <button
                    type="button"
                    data-testid={`bilingual-details-${verseKey}`}
                    onClick={() => onAyahAction(verseKey, pageNumber)}
                    aria-label={t(language, "reader.interactionSheetAria")}
                    title={t(language, "reader.interactionSheetAria")}
                    className="flex size-11 shrink-0 items-center justify-center rounded-lg hover:bg-muted/60 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <MoreVertical size={16} className="text-muted-foreground" aria-hidden="true" />
                  </button>
                </div>
              </div>

              {/* Arabic Verse Text */}
              <p
                className="zikr-text text-start text-xl sm:text-2xl leading-loose font-normal text-foreground mb-3"
                dir="rtl"
                lang="ar"
              >
                {arabicText}
              </p>

              {/* English Translation */}
              {englishText && (
                <div className="pt-3 border-t border-border text-start" dir="ltr" lang="en">
                  <p className="text-sm sm:text-base leading-relaxed text-muted-foreground font-sans">{englishText}</p>
                </div>
              )}
            </article>
          );
        })}
      </div>

      {/* Pagination Footer */}
      <footer className="mt-8 flex items-center justify-between border-t border-border/60 pt-4">
        <button
          type="button"
          onClick={() => onPaginate(-1)}
          disabled={atFirstPage}
          data-testid="bilingual-prev-page"
          className="flex h-11 items-center gap-2 rounded-xl border border-border/80 bg-card px-4 text-xs font-bold transition-colors hover:bg-muted disabled:opacity-40 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring"
        >
          <ChevronPrev size={16} aria-hidden="true" />
          <span>{t(language, "common.previous")}</span>
        </button>

        <span className="text-xs font-semibold text-muted-foreground">
          {t(language, "mushaf.pageOfTotal", {
            page: formatNumerals(pageNumber, language),
            total: formatNumerals(604, language),
          })}
        </span>

        <button
          type="button"
          onClick={() => onPaginate(1)}
          disabled={atLastPage}
          data-testid="bilingual-next-page"
          className="flex h-11 items-center gap-2 rounded-xl border border-border/80 bg-card px-4 text-xs font-bold transition-colors hover:bg-muted disabled:opacity-40 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring"
        >
          <span>{t(language, "common.next")}</span>
          <ChevronNext size={16} aria-hidden="true" />
        </button>
      </footer>
    </div>
  );
}
