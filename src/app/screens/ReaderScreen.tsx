import { useCallback, useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { useZikrCounter } from "../hooks/useZikrCounter";
import { useSwipeGestures } from "../hooks/useSwipeGestures";
import {
  BookOpen,
  Check,
  ChevronUp,
  Heart,
  Share2,
  MoreVertical,
  RotateCcw,
  List,
  Bookmark,
  ChevronLeft,
  ChevronRight,
  Volume2,
} from "../components/icons";
import { t } from "../i18n";
import { CATEGORIES } from "../content/categories";
import { getAzkarForMode } from "../content/azkar";
import type { AppLanguage, CategoryId, RoutineMode, TextSizeOption, ThemeMode } from "../types";
import { ProgressBar } from "../components/ProgressBar";
import { ZikrCounterSurface } from "../components/ZikrComponents";
import { ReaderReferenceSheet } from "../components/ReaderReferenceSheet";
import { IconButton } from "../components/LayoutShells";
import { getLocalizedSourceReference, getLocalizedZikrBenefit } from "../content/localizedZikr";
import { prepareZikrShareCardFonts, shareZikrCard, type ZikrShareCardStatus } from "../share/zikrShareCard";
import { counterNumeralFontFamily, formatNumerals, formatRatio } from "../formatting";
import { ScreenContainer } from "../components/ScreenContainer";
import { Header } from "../components/LayoutShells";
import { QuranPrelude, QuranSurahFooter } from "../components/QuranChrome";
import { QuranWordText } from "../components/QuranWordText";
import { QuranWordMeaningSheet } from "../components/QuranWordMeaningSheet";
import { getQuranWordMeanings, type QuranWordMeaning } from "../content/quranWordMeanings";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";

const SHARE_STATUS_KEYS: Record<ZikrShareCardStatus, string> = {
  generating: "reader.shareCardGenerating",
  openingShareSheet: "reader.shareCardOpening",
  shared: "reader.shareCardShared",
  copying: "reader.shareCardCopying",
  copied: "reader.shareCardCopied",
  downloading: "reader.shareCardDownloading",
  downloaded: "reader.shareCardDownloaded",
  cancelled: "reader.shareCardCancelled",
  error: "reader.shareCardError",
};

function vibrate(pattern: number | number[]) {
  if (typeof navigator !== "undefined" && "vibrate" in navigator) {
    navigator.vibrate(pattern);
  }
}

const getCategoryThemeStyles = (catId: CategoryId, themeMode: ThemeMode) => {
  const isLight = themeMode === "light";
  if (isLight) {
    switch (catId) {
      case "morning":
        return { "--primary": "#b45309", "--ring": "#b45309" } as React.CSSProperties; // Amber 700
      case "evening":
        return { "--primary": "#0f766e", "--ring": "#0f766e" } as React.CSSProperties; // Teal 700
      case "before_sleep":
        return { "--primary": "#6d28d9", "--ring": "#6d28d9" } as React.CSSProperties; // Violet 700
      case "after_prayer":
        return { "--primary": "#047857", "--ring": "#047857" } as React.CSSProperties; // Emerald 700
      case "waking_up":
        return { "--primary": "#0369a1", "--ring": "#0369a1" } as React.CSSProperties; // Sky 700
      case "illness_ruqyah":
        return { "--primary": "#be123c", "--ring": "#be123c" } as React.CSSProperties; // Rose 700
      case "distress_anxiety":
        return { "--primary": "#4338ca", "--ring": "#4338ca" } as React.CSSProperties; // Indigo 700
      case "travel":
        return { "--primary": "#d97706", "--ring": "#d97706" } as React.CSSProperties; // Amber 600
      default:
        return {};
    }
  } else {
    switch (catId) {
      case "morning":
        return { "--primary": "#fbbf24", "--ring": "#fbbf24" } as React.CSSProperties; // Amber 400
      case "evening":
        return { "--primary": "#2dd4bf", "--ring": "#2dd4bf" } as React.CSSProperties; // Teal 400
      case "before_sleep":
        return { "--primary": "#a78bfa", "--ring": "#a78bfa" } as React.CSSProperties; // Violet 400
      case "after_prayer":
        return { "--primary": "#34d399", "--ring": "#34d399" } as React.CSSProperties; // Emerald 400
      case "waking_up":
        return { "--primary": "#38bdf8", "--ring": "#38bdf8" } as React.CSSProperties; // Sky 400
      case "illness_ruqyah":
        return { "--primary": "#fb7185", "--ring": "#fb7185" } as React.CSSProperties; // Rose 400
      case "distress_anxiety":
        return { "--primary": "#818cf8", "--ring": "#818cf8" } as React.CSSProperties; // Indigo 400
      case "travel":
        return { "--primary": "#fbbf24", "--ring": "#fbbf24" } as React.CSSProperties; // Amber 400
      default:
        return {};
    }
  }
};

export function ReaderScreen({
  catId,
  idx,
  routineMode,
  isArabic,
  direction,
  themeMode,
  isDone,
  collectionCompletedCount,
  hapticFeedback,
  showTranslation,
  showTransliteration,
  textSize,
  savedZikrIds,
  onBack,
  onComplete,
  onAdvance,
  onNext,
  onPrev,
  onToggleSaved,
  audioAvailable,
  onPlayAudio,
  onRepeatAudio,
}: {
  catId: CategoryId;
  idx: number;
  routineMode: RoutineMode;
  isArabic: boolean;
  direction: "ltr" | "rtl";
  themeMode: ThemeMode;
  isDone: boolean;
  collectionCompletedCount: number;
  hapticFeedback: boolean;
  showTranslation: boolean;
  showTransliteration: boolean;
  textSize: TextSizeOption;
  savedZikrIds: Set<string>;
  onBack: () => void;
  onComplete: (idx: number) => void;
  onAdvance: (idx: number) => void;
  onNext: () => void;
  onPrev: () => void;
  onToggleSaved: (zikrId: string) => void;
  audioAvailable: boolean;
  onPlayAudio?: () => void;
  onRepeatAudio?: () => void;
}) {
  const azkar = getAzkarForMode(catId, routineMode);
  const z = azkar[idx];
  const category = CATEGORIES.find((item) => item.id === catId);
  const language: AppLanguage = isArabic ? "ar" : "en";

  const [benefitOpen, setBenefitOpen] = useState(false);
  const [hasOpenedBenefit, setHasOpenedBenefit] = useState(false);
  const [shareMessage, setShareMessage] = useState("");
  const [isSharing, setIsSharing] = useState(false);
  const [useCompactCounter, setUseCompactCounter] = useState(false);
  const [selectedWordMeanings, setSelectedWordMeanings] = useState<QuranWordMeaning[] | null>(null);
  const closeReference = useCallback(() => setBenefitOpen(false), []);
  const prefersReducedMotion = useReducedMotion();

  const shareTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const readerMainRef = useRef<HTMLDivElement | null>(null);
  const readingContentRef = useRef<HTMLDivElement | null>(null);

  const {
    count,
    pulse,
    complete,
    justCompleted,
    readerAnnouncement,
    suppressTap,
    handleTap,
    handleSurfaceTap,
    handleReset,
  } = useZikrCounter({
    z,
    idx,
    isDone,
    language,
    azkarLength: azkar.length,
    collectionCompletedCount,
    hapticFeedback,
    vibrate,
    onComplete,
    onAdvance,
  });

  const { onTouchStart, onTouchMove, onTouchEnd } = useSwipeGestures({
    direction,
    onNext,
    onPrev,
    suppressTap,
  });

  useEffect(() => {
    return () => {
      if (shareTimer.current) {
        clearTimeout(shareTimer.current);
      }
    };
  }, []);

  useEffect(() => {
    setSelectedWordMeanings(null);
  }, [z?.id]);

  useEffect(() => {
    const main = readerMainRef.current;
    const content = readingContentRef.current;
    if (!main || !content) return;

    let frame = 0;
    const measure = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        // Reserve the full circular counter footprint. The compact form is only
        // selected when the reading would otherwise collide with or hide it.
        const circularCounterFootprint = 206;
        const readingFootprint = content.scrollHeight + 24;
        setUseCompactCounter(readingFootprint + circularCounterFootprint > main.clientHeight);
      });
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(main);
    observer.observe(content);

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [z?.id, textSize, showTranslation, showTransliteration, language]);

  if (!z || !category) {
    return null;
  }

  const localizedCount = formatNumerals(count, language);
  const localizedRatio = formatRatio(count, z.repetitionCount, language);
  const counterInstruction = t(language, z.isSurah ? "reader.tapCounterWhenFinished" : "reader.tapAnywhere");
  const wordMeanings = getQuranWordMeanings(z);
  const readingProgressValue = Math.min(collectionCompletedCount, azkar.length);
  const isSaved = savedZikrIds.has(z.id);
  const readingFontSize = { small: "16px", medium: "18.5px", large: "21.5px" }[textSize];
  const readingFontFamily = "var(--font-reading-arabic)";

  const handleToggleSaved = () => {
    onToggleSaved(z.id);
  };

  const handleShare = async () => {
    setIsSharing(true);
    try {
      await shareZikrCard(
        {
          id: z.id,
          language,
          themeMode,
          arabicText: z.arabicText,
          translation: language === "en" ? z.translation : undefined,
          transliteration: language === "en" ? z.transliteration : undefined,
          benefit: getLocalizedZikrBenefit(z, language),
          sourceReference: getLocalizedSourceReference(z, language),
          categoryLabel: isArabic ? category.nameArabic : category.name,
          repetitionCount: z.repetitionCount,
          appUrl:
            typeof window === "undefined"
              ? undefined
              : new URL(import.meta.env.BASE_URL, window.location.origin).toString(),
          labels: { brandName: t(language, "common.azkar") },
        },
        {
          onStatus: (status) => setShareMessage(t(language, SHARE_STATUS_KEYS[status])),
        },
      );
    } catch {
      // The share helper has already announced a localized error state.
    } finally {
      setIsSharing(false);
      if (shareTimer.current) {
        clearTimeout(shareTimer.current);
      }
      shareTimer.current = setTimeout(() => setShareMessage(""), 2600);
    }
  };

  const renderCounterActions = () => (
    <div className="flex min-w-0 items-center gap-2">
      <IconButton
        onClick={(event) => {
          event.stopPropagation();
          void handleShare();
        }}
        label={t(language, "reader.share")}
        disabled={isSharing}
        aria-busy={isSharing || undefined}
        onPointerEnter={() => void prepareZikrShareCardFonts()}
        onFocus={() => void prepareZikrShareCardFonts()}
        className="shrink-0 border border-border-control bg-card text-card-foreground"
      >
        <Share2 size={18} />
      </IconButton>

      <button
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          setHasOpenedBenefit(true);
          setBenefitOpen(true);
        }}
        aria-haspopup="dialog"
        className="interactive-elem ui-control flex min-h-[44px] min-w-0 flex-1 items-center justify-center gap-2 rounded-full border border-border-control bg-card px-3 text-[0.875rem] font-bold text-foreground focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring"
      >
        <BookOpen className="shrink-0" size={17} />
        <span className="truncate" dir="auto">
          {t(language, "reader.referencesButton")}
        </span>
        <ChevronUp className="shrink-0" size={17} />
      </button>

      <IconButton
        onClick={(event) => {
          event.stopPropagation();
          handleToggleSaved();
        }}
        label={isSaved ? t(language, "reader.unsave") : t(language, "reader.save")}
        aria-pressed={isSaved}
        className="shrink-0 border border-border-control bg-card"
        style={{ color: isSaved ? "var(--primary)" : "var(--card-foreground)" }}
      >
        <Heart key={String(isSaved)} size={18} className={isSaved ? "favorite-pop fill-current" : ""} />
      </IconButton>
    </div>
  );

  let displayArabicText = z.arabicText;
  if (z.hasBasmalah || z.isSurah) {
    displayArabicText = displayArabicText
      .replace(
        /^(بِسْمِ\s+اللَّهِ\s+الرَّحْمَٰنِ\s+الرَّحِيمِ|بِسْمِ\s+اللَّهِ\s+الرَّحْمَنِ\s+الرَّحِيمِ|بِسْمِ\s+اللهِ\s+الرَّحْمٰنِ\s+الرَّحِيْمِ)[.\s\u06d4]*/,
        "",
      )
      .replace(
        /^\u0628\u0650\u0633\u0652\u0645\u0650\s+\u0627\u0644\u0644\u0651\u064e\u0647\u0650\s+\u0627\u0644\u0631\u0651\u064e\u062d\u0652\u0645\u064e\u0646\u0650\s+\u0627\u0644\u0631\u0651\u064e\u062d\u0650\u064a\u0645\u0650[.\s]*/,
        "",
      )
      .trim();
  }

  const isLongContent = Boolean(z.isSurah || z.surahNameArabic);

  const renderReadingContent = () => (
    <article
      ref={readingContentRef}
      className={`mt-1 w-full rounded-2xl px-4 pb-2 pt-2 ${z.isSurah ? "" : "cursor-pointer touch-manipulation transition-colors hover:bg-muted/50 active:bg-muted"}`}
    >
      <QuranPrelude zikr={z} className="pointer-events-none" />

      {wordMeanings.length > 0 ? (
        <QuranWordText
          text={displayArabicText}
          meanings={wordMeanings}
          language={language}
          style={{ fontFamily: readingFontFamily, fontSize: readingFontSize }}
          onSelectMeanings={setSelectedWordMeanings}
        />
      ) : (
        <p
          className="zikr-text pointer-events-none text-center font-medium leading-[2.1] text-foreground"
          data-testid="zikr-text"
          dir="rtl"
          lang="ar"
          style={{ fontFamily: readingFontFamily, fontSize: readingFontSize }}
        >
          {displayArabicText}
        </p>
      )}

      <QuranSurahFooter zikr={z} language={language} />

      {!isArabic && (showTranslation || showTransliteration) && (
        <div className="mt-5 space-y-4 border-t border-border pt-4 text-center">
          {showTranslation && (
            <section aria-labelledby="reader-translation-title">
              <h2
                id="reader-translation-title"
                className="text-[0.8125rem] font-bold text-muted-foreground text-center"
              >
                {t(language, "reader.translationLabel")}
              </h2>
              <p className="mt-1 text-[1rem] leading-7 text-foreground text-center" lang="en" dir="ltr">
                {z.translation}
              </p>
            </section>
          )}
          {showTransliteration && z.transliteration && (
            <section aria-labelledby="reader-transliteration-title">
              <h2
                id="reader-transliteration-title"
                className="text-[0.8125rem] font-bold text-muted-foreground text-center"
              >
                {t(language, "reader.transliterationLabel")}
              </h2>
              <p className="mt-1 text-[1rem] leading-7 text-foreground text-center" lang="en" dir="ltr">
                {z.transliteration}
              </p>
            </section>
          )}
        </div>
      )}
    </article>
  );

  const renderCounterPanel = () => {
    return (
      <div className="px-3 pb-3" data-testid="counter-panel">
        <div className="adaptive-counter-row flex w-full items-center justify-center gap-2.5">
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onPrev();
            }}
            disabled={idx === 0}
            title={t(language, "reader.prev")}
            aria-label={t(language, "reader.prev")}
            className="adaptive-counter-nav"
          >
            {direction === "rtl" ? <ChevronRight size={22} /> : <ChevronLeft size={22} />}
          </button>

          <div className="flex min-w-0 flex-1 justify-center">
            <ZikrCounterSurface
              count={count}
              total={z.repetitionCount}
              compact={useCompactCounter}
              complete={complete}
              onTap={handleTap}
              language={language}
              instructionText={counterInstruction}
              testId="counter-surface"
            />
          </div>

          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onNext();
            }}
            disabled={idx === azkar.length - 1}
            title={t(language, "reader.next")}
            aria-label={t(language, "reader.next")}
            className="adaptive-counter-nav"
          >
            {direction === "rtl" ? <ChevronLeft size={22} /> : <ChevronRight size={22} />}
          </button>
        </div>
      </div>
    );
  };

  const categoryThemeStyles = getCategoryThemeStyles(catId, themeMode);

  return (
    // The canvas delegates pointer clicks while its explicit reading and counter surfaces own keyboard activation.
    <ScreenContainer
      className="relative !pb-0"
      data-testid="reader-screen"
      data-zikr-index={idx}
      data-zikr-id={z.id}
      data-counting-mode={z.isSurah ? "counter-only" : "canvas"}
      dir={direction}
      style={categoryThemeStyles}
      screenName={isArabic ? category.nameArabic : category.name}
      onClick={handleSurfaceTap}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      <div className="sr-only" aria-live="polite">
        {shareMessage}
      </div>
      <div className="sr-only" aria-live="assertive" aria-atomic="true">
        {readerAnnouncement}
      </div>

      <Header
        title={isArabic ? category.nameArabic : category.name}
        onBack={onBack}
        language={language}
        right={
          <DropdownMenu dir={direction}>
            <DropdownMenuTrigger
              aria-label={t(language, "reader.menu")}
              className="flex h-11 w-11 min-h-[44px] min-w-[44px] shrink-0 items-center justify-center rounded-full text-foreground/80 transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-[2px] focus-visible:ring-ring"
            >
              <MoreVertical size={20} />
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="min-w-[210px] rounded-2xl p-1.5 shadow-xl border border-border bg-popover text-popover-foreground"
              sideOffset={8}
            >
              {/* Navigation Items */}
              <DropdownMenuItem
                disabled={idx === 0}
                onClick={onPrev}
                className="flex cursor-pointer items-center justify-between rounded-xl px-3 py-2.5 text-[0.9375rem] font-medium transition-colors hover:bg-muted data-[disabled]:opacity-40 data-[disabled]:cursor-not-allowed"
              >
                <div className="flex items-center gap-2.5">
                  {direction === "rtl" ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
                  <span>{t(language, "reader.prev")}</span>
                </div>
              </DropdownMenuItem>

              <DropdownMenuItem
                disabled={idx === azkar.length - 1}
                onClick={onNext}
                className="flex cursor-pointer items-center justify-between rounded-xl px-3 py-2.5 text-[0.9375rem] font-medium transition-colors hover:bg-muted data-[disabled]:opacity-40 data-[disabled]:cursor-not-allowed"
              >
                <div className="flex items-center gap-2.5">
                  {direction === "rtl" ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
                  <span>{t(language, "reader.next")}</span>
                </div>
              </DropdownMenuItem>

              <DropdownMenuSeparator className="my-1.5 h-px bg-border/60" />

              {/* Zikr Action Items */}
              <DropdownMenuItem
                disabled={!audioAvailable}
                onClick={onPlayAudio}
                className="flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-[0.9375rem] font-medium transition-colors hover:bg-muted data-[disabled]:cursor-not-allowed data-[disabled]:opacity-40"
              >
                <Volume2 size={18} />
                {audioAvailable
                  ? language === "ar"
                    ? "تشغيل مرة واحدة"
                    : "Play audio once"
                  : language === "ar"
                    ? "الصوت غير متاح"
                    : "Audio unavailable"}
              </DropdownMenuItem>

              {onRepeatAudio && (
                <DropdownMenuItem
                  onClick={onRepeatAudio}
                  className="flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-[0.9375rem] font-medium transition-colors hover:bg-muted"
                >
                  <RotateCcw size={18} />
                  {language === "ar" ? "تكرار العدد المحدد" : "Repeat prescribed count"}
                </DropdownMenuItem>
              )}

              <DropdownMenuSeparator className="my-1.5 h-px bg-border/60" />

              <DropdownMenuItem
                onClick={handleReset}
                className="flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-[0.9375rem] font-medium transition-colors hover:bg-muted"
              >
                <RotateCcw size={18} />
                {t(language, "reader.resetCounter")}
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={handleToggleSaved}
                className="flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-[0.9375rem] font-medium transition-colors hover:bg-muted"
              >
                <Bookmark size={18} className={isSaved ? "fill-current text-primary" : ""} />
                {isSaved ? t(language, "reader.removeFromFavorites") : t(language, "reader.addToFavorites")}
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={() => void handleShare()}
                className="flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-[0.9375rem] font-medium transition-colors hover:bg-muted"
              >
                <Share2 size={18} />
                {t(language, "reader.share")}
              </DropdownMenuItem>

              <DropdownMenuSeparator className="my-1.5 h-px bg-border/60" />

              {/* View All */}
              <DropdownMenuItem
                onClick={onBack}
                className="flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-[0.9375rem] font-medium transition-colors hover:bg-muted"
              >
                <List size={18} />
                {t(language, "reader.viewAllAzkar")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        }
      />

      <div className="shrink-0 px-5 pb-3 pt-2">
        <ProgressBar
          value={readingProgressValue}
          max={azkar.length}
          height={6}
          trackColor="var(--card)"
          fillColor="var(--primary)"
          direction={direction}
          aria-label={t(language, "reader.groupProgress")}
        />
      </div>

      {/* Main Layout Area */}
      <div ref={readerMainRef} className="flex-1 flex flex-col min-h-0 justify-between select-none relative">
        {/* Upper section: scrollable Zikr content — long chapters (Tabarak, Sajdah) scroll
            within this region; the counter below is always visible and never covered. */}
        <div
          className={`flex-1 overflow-y-auto min-h-0 w-full pt-1 pb-2 ${
            justCompleted ? "zikr-step-exit" : "zikr-step-enter"
          }`}
        >
          {/* Inner wrapper vertically centers short/medium Zikrs; long Surahs start at top to scroll naturally */}
          <div
            className={`flex min-h-full flex-col ${
              isLongContent ? "justify-start pt-1" : "justify-center my-auto"
            } pb-2 items-center`}
          >
            <div key={z.id} className={justCompleted ? "zikr-step-exit" : "zikr-step-enter"}>
              {renderReadingContent()}
            </div>
          </div>
        </div>

        {/* Lower section: Counter panel — shrink-0 ensures it is always pinned and never covered */}
        <div className="shrink-0 pb-2 pt-1">{renderCounterPanel()}</div>
      </div>

      <footer className="shrink-0 px-4 pb-6 pt-4">{renderCounterActions()}</footer>

      {hasOpenedBenefit && (
        <ReaderReferenceSheet
          open={benefitOpen}
          zikr={z}
          language={language}
          direction={direction}
          onClose={closeReference}
          onAnnouncement={setShareMessage}
        />
      )}
      <QuranWordMeaningSheet
        meanings={selectedWordMeanings}
        language={language}
        direction={direction}
        onClose={() => setSelectedWordMeanings(null)}
      />
    </ScreenContainer>
  );
}
