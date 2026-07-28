import { useCallback, useEffect, useRef, useState } from "react";
import { useZikrCounter } from "../hooks/useZikrCounter";
import { useSwipeGestures } from "../hooks/useSwipeGestures";
import { BookOpen, Check, ChevronUp, Heart, Share2, Menu, RotateCcw, List, Bookmark } from "../components/icons";
import { t } from "../i18n";
import { CATEGORIES } from "../content/categories";
import { getAzkarByCategory } from "../content/azkar";
import type { AppLanguage, ArabicFontOption, CategoryId, TextSizeOption, ThemeMode } from "../types";
import { ProgressBar } from "../components/ProgressBar";
import { CounterRing, PulseRings } from "../components/ZikrComponents";
import { ReaderReferenceSheet } from "../components/ReaderReferenceSheet";
import { IconButton } from "../components/LayoutShells";
import { getLocalizedSourceReference, getLocalizedZikrBenefit } from "../content/localizedZikr";
import { prepareZikrShareCardFonts, shareZikrCard, type ZikrShareCardStatus } from "../share/zikrShareCard";
import { counterNumeralFontFamily, formatNumerals, formatRatio } from "../formatting";
import { ScreenContainer } from "../components/ScreenContainer";
import { Header } from "../components/LayoutShells";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";

export const COUNTER_ADVANCE_DELAY_MS = 500;

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
  isArabic,
  direction,
  themeMode,
  isDone,
  collectionCompletedCount,
  hapticFeedback,
  arabicFont,
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
}: {
  catId: CategoryId;
  idx: number;
  isArabic: boolean;
  direction: "ltr" | "rtl";
  themeMode: ThemeMode;
  isDone: boolean;
  collectionCompletedCount: number;
  hapticFeedback: boolean;
  arabicFont: ArabicFontOption;
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
}) {
  const azkar = getAzkarByCategory(catId);
  const z = azkar[idx];
  const category = CATEGORIES.find((item) => item.id === catId);
  const language: AppLanguage = isArabic ? "ar" : "en";

  const [benefitOpen, setBenefitOpen] = useState(false);
  const [hasOpenedBenefit, setHasOpenedBenefit] = useState(false);
  const [shareMessage, setShareMessage] = useState("");
  const [isSharing, setIsSharing] = useState(false);
  const closeReference = useCallback(() => setBenefitOpen(false), []);

  const shareTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

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

  if (!z || !category) {
    return null;
  }

  const localizedCount = formatNumerals(count, language);
  const localizedRatio = formatRatio(count, z.repetitionCount, language);
  const readingProgressValue = Math.min(collectionCompletedCount, azkar.length);
  const isSaved = savedZikrIds.has(z.id);
  const readingFontSize = { small: "18px", medium: "20px", large: "24px" }[textSize];
  const readingFontFamily =
    arabicFont === "noto_sans"
      ? "'Noto Sans Arabic', sans-serif"
      : "'IBM Plex Sans Arabic', 'Noto Sans Arabic', sans-serif";

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

  const renderReadingContent = () => (
    <div
      className="w-full mt-1 cursor-pointer touch-manipulation rounded-2xl px-4 pb-2 pt-2 transition-colors hover:bg-muted/50 active:bg-muted"
      role="button"
      tabIndex={0}
      aria-label={t(language, "reader.tapAnywhere")}
      onKeyDown={(event) => {
        if (event.key === " " || event.key === "Enter") {
          event.preventDefault();
          handleTap();
        }
      }}
    >
      {(z.isSurah || z.surahNameArabic) && (
        <div className="mb-3 text-center">
          <div className="inline-flex items-center gap-1.5 border border-amber-700/25 dark:border-amber-500/25 rounded-lg px-2.5 py-1 bg-amber-500/10 dark:bg-amber-950/30">
            {z.surahType && (
              <span className="text-[0.6875rem] font-semibold text-amber-900/80 dark:text-amber-200/80">
                {z.surahType}
              </span>
            )}
            <span className="text-[0.875rem] font-bold font-arabic text-amber-950 dark:text-amber-100">
              {z.isSurah && z.surahNameArabic ? `سُورَةُ ${z.surahNameArabic}` : (z.surahNameArabic ?? "القرآن الكريم")}
            </span>
            {z.verseCount && (
              <span
                className="text-[0.6875rem] font-semibold text-amber-900/80 dark:text-amber-200/80"
                style={{ fontFamily: counterNumeralFontFamily(language) }}
              >
                آيَاتُهَا {formatNumerals(z.verseCount, language)}
              </span>
            )}
          </div>
        </div>
      )}

      {z.hasSeekRefuge && (
        <div className="mb-3 text-center">
          <p className="font-arabic text-[1.05rem] font-bold text-amber-900/90 dark:text-amber-200/90 tracking-wide">
            أَعُوذُ بِاللَّهِ مِنَ الشَّيْطَانِ الرَّجِيمِ
          </p>
        </div>
      )}

      {(z.hasBasmalah || z.isSurah) && (
        <div className="mb-3 text-center">
          <p className="font-arabic text-[1.05rem] font-bold text-amber-900/90 dark:text-amber-200/90 tracking-wide">
            بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
          </p>
        </div>
      )}

      {z.preferredTiming && (
        <div className="mb-3.5 text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1 text-[0.75rem] font-bold text-emerald-900 dark:text-emerald-200">
            <span aria-hidden="true">📜</span>
            <span>{z.preferredTiming}</span>
          </span>
        </div>
      )}

      <p
        className="zikr-text text-center font-medium leading-[2.1] text-foreground pointer-events-none"
        data-testid="zikr-text"
        dir="rtl"
        lang="ar"
        style={{ fontFamily: readingFontFamily, fontSize: readingFontSize }}
      >
        {z.arabicText}
      </p>

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
          {showTransliteration && (
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
    </div>
  );

  const renderCounterPanel = () => (
    <div className="flex flex-col px-5 pb-3" data-testid="counter-panel">
      <div className="flex flex-col">
        <div
          role="button"
          data-testid="counter-surface"
          tabIndex={0}
          aria-disabled={complete}
          aria-label={`${complete ? t(language, "reader.completed") : t(language, "reader.tapAnywhere")} ${localizedRatio}`}
          className={`flex touch-manipulation select-none flex-col items-center justify-center rounded-3xl focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring ${count === 0 && !complete ? "counter-ready" : ""}`}
          onKeyDown={(event) => {
            if (event.key === " " || event.key === "Enter") {
              event.preventDefault();
              handleTap();
            }
          }}
        >
          <div
            className={`counter-ring-stage pointer-events-none relative flex h-[150px] w-[150px] items-center justify-center ${count === 0 && !complete ? "counter-ring-ready" : ""}`}
          >
            <PulseRings trigger={pulse} size={150} count={count} total={z.repetitionCount} />
            <CounterRing count={count} total={z.repetitionCount} size={150} />
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              {complete ? (
                <div
                  className={justCompleted ? "counter-complete-cue" : "counter-complete-static"}
                  data-testid={justCompleted ? "counter-completion-cue" : "counter-complete-state"}
                >
                  <span className="counter-check-mark">
                    <Check size={36} strokeWidth={2.5} />
                  </span>
                </div>
              ) : (
                <>
                  <p
                    className="counter-number text-[1.5rem] font-extrabold leading-8 text-foreground"
                    key={count}
                    dir="ltr"
                    style={{
                      fontFamily: counterNumeralFontFamily(language),
                      fontVariantNumeric: "tabular-nums lining-nums",
                    }}
                  >
                    {localizedCount}
                  </p>
                  <p
                    className="text-[0.75rem] text-foreground"
                    dir="ltr"
                    style={{
                      fontFamily: counterNumeralFontFamily(language),
                      fontVariantNumeric: "tabular-nums lining-nums",
                    }}
                  >
                    {localizedRatio}
                  </p>
                </>
              )}
            </div>
          </div>

          {/* Reserved-height hint: always rendered to prevent layout reflow, animated out on complete */}
          <p
            className={`tap-anywhere-hint text-[10px] font-bold text-foreground mt-2${complete ? " hint-hidden" : ""}`}
            aria-hidden={complete}
          >
            {complete ? "" : t(language, "reader.tapAnywhere")}
          </p>
        </div>
      </div>
    </div>
  );

  const categoryThemeStyles = getCategoryThemeStyles(catId, themeMode);

  return (
    // The canvas delegates pointer clicks while its explicit reading and counter surfaces own keyboard activation.
    <ScreenContainer
      className="relative !pb-0"
      data-testid="reader-screen"
      dir={direction}
      style={categoryThemeStyles}
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
              className="ui-icon-button shrink-0 border border-border-control bg-background focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring"
            >
              <Menu size={18} />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-[200px] rounded-2xl p-2" sideOffset={8}>
              <DropdownMenuItem
                onClick={handleReset}
                className="flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-[0.9375rem] font-medium transition-colors hover:bg-muted"
              >
                <RotateCcw size={18} />
                {t(language, "reader.resetCounter")}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={onBack}
                className="flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-[0.9375rem] font-medium transition-colors hover:bg-muted"
              >
                <List size={18} />
                {t(language, "reader.viewAllAzkar")}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => void handleShare()}
                className="flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-[0.9375rem] font-medium transition-colors hover:bg-muted"
              >
                <Share2 size={18} />
                {t(language, "reader.share")}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={handleToggleSaved}
                className="flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-[0.9375rem] font-medium transition-colors hover:bg-muted"
              >
                <Bookmark size={18} className={isSaved ? "fill-current" : ""} />
                {isSaved ? t(language, "reader.removeFromFavorites") : t(language, "reader.addToFavorites")}
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
      <div className="flex-1 flex flex-col min-h-0 justify-between select-none" key={z.id}>
        {/* Upper section: scrollable Zikr content — long chapters (Tabarak, Sajdah) scroll
            within this region; the counter below is always visible and never covered. */}
        <div
          className={`flex-1 overflow-y-auto min-h-0 w-full py-4 ${
            justCompleted ? "zikr-step-exit" : "zikr-step-enter"
          }`}
        >
          {/* Inner wrapper keeps short azkar vertically centered; long content simply overflows into the scroll. */}
          <div className="flex min-h-full items-center justify-center">{renderReadingContent()}</div>
        </div>

        {/* Lower section: Counter panel — shrink-0 ensures it is always pinned and never covered */}
        <div className="shrink-0 pb-4">{renderCounterPanel()}</div>
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
    </ScreenContainer>
  );
}
