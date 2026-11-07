import "./quran-bilingual-stream.css";
import { AyahMushafText } from "./AyahMushafText";
import { QURAN_TEXT_STYLE } from "../quranTypography";
import { useEffect, useRef, useState } from "react";
import { ArrowPrevious, Bookmark, ChevronLeft, ChevronRight, MoreVertical, Share2 } from "./icons";
import { formatNumerals } from "../formatting";
import { t } from "../i18n";
import type { AppLanguage, MushafTheme, QuranVerseBookmark, ThemeMode } from "../types";
import type { MushafVerseData } from "../content/qcfMushaf";
import { loadPageEnglishTranslation, type QuranPageVerseTranslation } from "../content/quranTranslations";

// Reuse identical presentation without shipping repeated class strings.
const HEADER_ACTION_CLASS =
  "flex size-[44px] shrink-0 items-center justify-center rounded-full border border-border/80 bg-card hover:bg-muted text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring";
const VERSE_ACTION_CLASS =
  "flex size-[44px] shrink-0 items-center justify-center rounded-lg hover:bg-muted/60 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";
const PAGE_ACTION_CLASS =
  "flex min-h-11 min-w-0 items-center justify-center gap-2 rounded-xl border border-border/80 bg-card px-3 py-2 text-xs font-bold transition-colors hover:bg-muted disabled:opacity-40 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-inset focus-visible:ring-ring";

export interface QuranBilingualStreamViewProps {
  pageNumber: number;
  surahName: string;
  juzNumber: number;
  pageData: MushafVerseData[] | null;
  language: AppLanguage;
  direction?: "ltr" | "rtl";
  bookmarkedVerses: QuranVerseBookmark[];
  onToggleVerseBookmark: (verseKey: string, pageNumber: number) => void;
  onShareAyah?: (verseKey: string, pageNumber: number) => void;
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
  onShareAyah,
  showWordMeanings: _showWordMeanings = false,
  onPaginate,
  atFirstPage,
  atLastPage,
  theme = "midnight",
  appTheme = "midnight",
  onBack,
  onOpenMore,
}: QuranBilingualStreamViewProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [translationFailed, setTranslationFailed] = useState(false);
  const [translationRetry, setTranslationRetry] = useState(0);
  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = 0;
  }, [pageNumber]);
  const [translations, setTranslations] = useState<Map<string, string>>(new Map());
  const resolvedTheme = theme === "follow-app" ? appTheme : theme;

  useEffect(() => {
    let active = true;
    setTranslations(new Map());
    setTranslationFailed(false);
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
      .catch(() => {
        if (active) setTranslationFailed(true);
      });

    return () => {
      active = false;
    };
  }, [pageData, translationRetry]);

  const ChevronPrev = direction === "rtl" ? ChevronRight : ChevronLeft;
  const ChevronNext = direction === "rtl" ? ChevronLeft : ChevronRight;

  return (
    <div data-testid="bilingual-stream-view" className="bilingual-reader" dir={direction}>
      {/* Header Info */}
      <header className="bilingual-reader-header">
        <div className="bilingual-reader-title flex items-center gap-3">
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              aria-label={t(language, "common.back")}
              data-testid="bilingual-back-button"
              className={HEADER_ACTION_CLASS}
            >
              <ArrowPrevious size={16} aria-hidden="true" />
            </button>
          )}
          <div className="min-w-0">
            <h2 className="text-lg font-bold text-foreground">{surahName}</h2>
            <span className="text-xs text-muted-foreground">
              {t(language, "mushaf.juzLabel", { juz: formatNumerals(juzNumber, language) })}
            </span>
          </div>
        </div>
        <div className="bilingual-reader-actions flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
            {t(language, "mushaf.pageLabel", { page: formatNumerals(pageNumber, language) })}
          </span>
          {onOpenMore && (
            <button
              type="button"
              onClick={onOpenMore}
              aria-label={t(language, "mushaf.moreActions")}
              data-testid="bilingual-more-button"
              className={HEADER_ACTION_CLASS}
            >
              <MoreVertical size={16} aria-hidden="true" />
            </button>
          )}
        </div>
      </header>

      {/* Verses Stream */}
      <div ref={scrollRef} className="bilingual-reader-content" data-testid="bilingual-scroll">
        <p className="mb-3 text-xs text-muted-foreground" lang="en" dir="ltr">
          Saheeh International
        </p>
        {translationFailed && (
          <div role="status" className="mb-3 rounded-xl bg-card p-3 text-sm text-muted-foreground">
            <p>{t(language, "quranListening.translationUnavailable")}</p>
            <button
              type="button"
              className="min-h-11 px-3 text-primary"
              onClick={() => setTranslationRetry((value) => value + 1)}
            >
              {t(language, "mushaf.retry")}
            </button>
          </div>
        )}
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
                className={`bilingual-verse-card border border-border p-4 sm:p-5 shadow-xs transition-colors theme-${resolvedTheme} bg-card text-card-foreground`}
              >
                {/* Verse Metadata & Actions */}
                <div className="mb-3 flex flex-wrap items-center justify-between gap-2 text-xs">
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
                      className={VERSE_ACTION_CLASS}
                    >
                      <Bookmark
                        size={17}
                        className={isBookmarked ? "fill-primary text-primary" : "text-muted-foreground"}
                        aria-hidden="true"
                      />
                    </button>
                    <button
                      type="button"
                      data-testid={`bilingual-share-${verseKey}`}
                      aria-label={t(language, "reader.shareAyah")}
                      onClick={(event) => {
                        event.currentTarget.focus({ preventScroll: true });
                        (onShareAyah ?? onAyahAction)(verseKey, pageNumber);
                      }}
                      className="ui-icon-button text-primary"
                    >
                      <Share2 size={18} aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      data-testid={`bilingual-details-${verseKey}`}
                      onClick={() => onAyahAction(verseKey, pageNumber)}
                      aria-label={t(language, "reader.interactionSheetAria")}
                      title={t(language, "reader.interactionSheetAria")}
                      className={VERSE_ACTION_CLASS}
                    >
                      <MoreVertical size={16} className="text-muted-foreground" aria-hidden="true" />
                    </button>
                  </div>
                </div>

                {/* Arabic Verse Text */}
                <p
                  className="zikr-text text-start text-xl sm:text-2xl leading-loose font-normal text-foreground mb-3"
                  style={QURAN_TEXT_STYLE}
                  dir="rtl"
                  lang="ar"
                >
                  <AyahMushafText text={arabicText} verseKey={verseKey} pageNumber={pageNumber} language={language} />
                </p>

                {/* English Translation */}
                {englishText && (
                  <div className="text-start" dir="ltr" lang="en">
                    <p className="text-sm sm:text-base leading-relaxed text-muted-foreground font-sans">
                      {englishText}
                    </p>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      </div>
      {/* Pagination Footer */}
      <footer className="bilingual-reader-footer">
        <button
          type="button"
          onClick={() => onPaginate(-1)}
          disabled={atFirstPage}
          data-testid="bilingual-prev-page"
          className={PAGE_ACTION_CLASS}
        >
          <ChevronPrev size={16} aria-hidden="true" />
          <span>{t(language, "common.previous")}</span>
        </button>

        <span className="bilingual-reader-position text-center text-xs font-semibold text-muted-foreground">
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
          className={PAGE_ACTION_CLASS}
        >
          <span>{t(language, "common.next")}</span>
          <ChevronNext size={16} aria-hidden="true" />
        </button>
      </footer>
    </div>
  );
}
