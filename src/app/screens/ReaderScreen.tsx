import { useCallback, useEffect, useRef, useState } from "react";
import {
  ArrowPrevious,
  BookOpen,
  Check,
  ChevronUp,
  Heart,
  Share2,
  Menu,
  RotateCcw,
  List,
  Bookmark,
} from "../components/icons";
import { t } from "../i18n";
import { CATEGORIES } from "../content/categories";
import { getAzkarByCategory } from "../content/azkar";
import type { AppLanguage, ArabicFontOption, CategoryId, TextSizeOption } from "../types";
import { ProgressBar } from "../components/ProgressBar";
import { CounterRing, PulseRings } from "../components/ZikrComponents";
import { ReaderReferenceSheet } from "../components/ReaderReferenceSheet";
import { counterNumeralFontFamily, formatNumerals, formatRatio } from "../formatting";
import { ScrollArea } from "../components/ui/scroll-area";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";

export const COUNTER_ADVANCE_DELAY_MS = 500;

function vibrate(pattern: number | number[]) {
  if (typeof navigator !== "undefined" && "vibrate" in navigator) {
    navigator.vibrate(pattern);
  }
}

export function ReaderScreen({
  catId,
  idx,
  isArabic,
  isDone,
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
  isDone: boolean;
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
  const [count, setCount] = useState(0);
  const [pulse, setPulse] = useState(0);
  const [complete, setComplete] = useState(false);
  const [justCompleted, setJustCompleted] = useState(false);
  const [shareMessage, setShareMessage] = useState("");
  const [readerAnnouncement, setReaderAnnouncement] = useState("");
  const closeReference = useCallback(() => setBenefitOpen(false), []);

  const touchStartX = useRef<number | null>(null);
  const suppressTap = useRef(false);
  const activeZikrId = useRef<string | null>(null);
  const advanceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const shareTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const tapSuppressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!z || activeZikrId.current === z.id) {
      return;
    }

    activeZikrId.current = z.id;
    if (advanceTimer.current) {
      clearTimeout(advanceTimer.current);
      advanceTimer.current = null;
    }
    const initialCount = isDone && z ? z.repetitionCount : 0;
    setCount(initialCount);
    setComplete(initialCount >= (z?.repetitionCount ?? 1));
    setJustCompleted(false);
    setBenefitOpen(false);
    setReaderAnnouncement(
      initialCount > 0 ? t(language, "reader.counterReadyComplete") : t(language, "reader.tapAnywhere"),
    );
  }, [idx, isDone, language, z]);

  useEffect(() => {
    return () => {
      if (shareTimer.current) {
        clearTimeout(shareTimer.current);
      }
      if (advanceTimer.current) {
        clearTimeout(advanceTimer.current);
      }
      if (tapSuppressTimer.current) {
        clearTimeout(tapSuppressTimer.current);
      }
    };
  }, []);

  if (!z || !category) {
    return null;
  }

  const localizedCount = formatNumerals(count, language);
  const localizedRatio = formatRatio(count, z.repetitionCount, language);
  const readingProgressValue = idx + 1;
  const isSaved = savedZikrIds.has(z.id);
  const readingFontSize = { small: "18px", medium: "20px", large: "24px" }[textSize];
  const readingFontFamily =
    arabicFont === "noto_sans"
      ? "'Noto Sans Arabic', sans-serif"
      : "'IBM Plex Sans Arabic', 'Noto Sans Arabic', sans-serif";

  const handleSwipe = (dx: number) => {
    if (isArabic) {
      if (dx > 60) {
        onNext();
      } else if (dx < -60) {
        onPrev();
      }
      return;
    }

    if (dx > 60) {
      onPrev();
    } else if (dx < -60) {
      onNext();
    }
  };

  const handleTap = () => {
    if (complete) {
      return;
    }

    const next = count + 1;
    setCount(next);
    setPulse((value) => value + 1);
    if (hapticFeedback) {
      vibrate(8);
    }

    if (next >= z.repetitionCount) {
      setComplete(true);
      setJustCompleted(true);
      setReaderAnnouncement(
        t(language, "reader.completionAnnouncement", {
          index: formatNumerals(idx + 1, language),
          total: formatNumerals(azkar.length, language),
          percent: formatNumerals(Math.round(((idx + 1) / azkar.length) * 100), language),
        }),
      );
      if (hapticFeedback) {
        vibrate([18, 40, 32]);
      }
      onComplete(idx);
      advanceTimer.current = setTimeout(() => {
        setJustCompleted(false);
        onAdvance(idx);
      }, COUNTER_ADVANCE_DELAY_MS);
    }
  };

  const shouldIgnoreCountTap = (target: EventTarget | null) => {
    if (!(target instanceof Element)) {
      return false;
    }

    return Boolean(
      target.closest(
        "button, a, input, textarea, select, summary, [role='dialog'], [data-radix-scroll-area-thumb], [data-radix-scroll-area-scrollbar], [data-prevent-count='true']",
      ),
    );
  };

  const handleSurfaceTap = (event: React.MouseEvent<HTMLElement>) => {
    if (suppressTap.current || shouldIgnoreCountTap(event.target)) {
      return;
    }

    handleTap();
  };

  const handleReset = () => {
    setCount(0);
    setComplete(false);
    setJustCompleted(false);
    setReaderAnnouncement(t(language, "reader.tapAnywhere"));
    setPulse((value) => value + 1);
  };

  const handleToggleSaved = () => {
    onToggleSaved(z.id);
  };

  const handleShare = async () => {
    const shareText = `${z.arabicText}\n\n${z.translation}\n\n${z.sourceReference}`;

    try {
      if (navigator.share) {
        await navigator.share({
          title: isArabic ? category.nameArabic : category.name,
          text: shareText,
        });
        return;
      }

      await navigator.clipboard.writeText(shareText);
      setShareMessage(t(language, "reader.shareSuccess"));
      if (shareTimer.current) {
        clearTimeout(shareTimer.current);
      }
      shareTimer.current = setTimeout(() => setShareMessage(""), 1800);
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        return;
      }
    }
  };

  const renderCounterActions = () => (
    <div className="flex items-center justify-between gap-4 px-2" dir="ltr">
      <button
        type="button"
        onClick={() => {
          void handleShare();
        }}
        aria-label={t(language, "reader.share")}
        className="flex h-12 w-12 items-center justify-center rounded-full border border-border bg-card/50 text-card-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <Share2 size={18} />
      </button>

      <button
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          setBenefitOpen(true);
        }}
        aria-haspopup="dialog"
        className="flex h-12 min-w-[166px] items-center justify-center gap-2 rounded-full border border-border bg-card px-5 text-[14px] font-bold text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <BookOpen size={17} />
        <span dir="auto">{t(language, "reader.referencesButton")}</span>
        <ChevronUp size={17} />
      </button>

      <button
        type="button"
        onClick={handleToggleSaved}
        aria-label={isSaved ? t(language, "reader.unsave") : t(language, "reader.save")}
        aria-pressed={isSaved}
        className="flex h-12 w-12 items-center justify-center rounded-full border border-border bg-card/50 transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        style={{ color: isSaved ? "var(--primary)" : "var(--card-foreground)" }}
      >
        <Heart key={String(isSaved)} size={18} className={isSaved ? "favorite-pop fill-current" : ""} />
      </button>
    </div>
  );

  const renderReadingContent = () => (
    <div
      className="px-6 pb-3 pt-3 cursor-pointer touch-manipulation rounded-2xl transition-colors hover:bg-white/5 active:bg-white/10 mx-4 mt-2"
      onClick={handleSurfaceTap}
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
      <p
        className="zikr-text text-center font-medium leading-[1.75] text-foreground pointer-events-none"
        data-testid="zikr-text"
        dir="rtl"
        lang="ar"
        style={{ fontFamily: readingFontFamily, fontSize: readingFontSize }}
      >
        {z.arabicText}
      </p>
      {(showTranslation || showTransliteration) && (
        <div className="mt-5 space-y-4 border-t border-border pt-4 text-start" data-prevent-count="true">
          {showTranslation && (
            <section aria-labelledby="reader-translation-title">
              <h2 id="reader-translation-title" className="text-[13px] font-bold text-muted-foreground">
                {t(language, "reader.translationLabel")}
              </h2>
              <p className="mt-1 text-[16px] leading-7 text-foreground" lang="en" dir="ltr">
                {z.translation}
              </p>
            </section>
          )}
          {showTransliteration && (
            <section aria-labelledby="reader-transliteration-title">
              <h2 id="reader-transliteration-title" className="text-[13px] font-bold text-muted-foreground">
                {t(language, "reader.transliterationLabel")}
              </h2>
              <p className="mt-1 text-[16px] leading-7 text-foreground" lang="en" dir="ltr">
                {z.transliteration}
              </p>
            </section>
          )}
        </div>
      )}
    </div>
  );

  const renderCounterPanel = () => (
    <div className="flex min-h-[360px] flex-1 flex-col px-5 pb-3" data-testid="counter-panel">
      <div className="flex min-h-0 flex-1 flex-col">
        <div
          role="button"
          data-testid="counter-surface"
          tabIndex={0}
          aria-disabled={complete}
          aria-label={`${complete ? t(language, "reader.completed") : t(language, "reader.tapAnywhere")} ${localizedRatio}`}
          className={`flex min-h-[300px] flex-1 touch-manipulation select-none flex-col items-center justify-center rounded-[28px] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring ${count === 0 && !complete ? "counter-ready" : ""}`}
          onClick={handleSurfaceTap}
          onKeyDown={(event) => {
            if (event.key === " " || event.key === "Enter") {
              event.preventDefault();
              handleTap();
            }
          }}
        >
          <div
            className={`counter-ring-stage pointer-events-none relative flex h-[184px] w-[184px] items-center justify-center ${count === 0 && !complete ? "counter-ring-ready" : ""}`}
          >
            <PulseRings trigger={pulse} size={184} />
            <CounterRing count={count} total={z.repetitionCount} size={184} />
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              {complete ? (
                <div
                  className={justCompleted ? "counter-complete-cue" : "counter-complete-static"}
                  data-testid={justCompleted ? "counter-completion-cue" : "counter-complete-state"}
                >
                  <span className="counter-check-mark">
                    <Check size={42} strokeWidth={2.5} />
                  </span>
                </div>
              ) : (
                <>
                  <p
                    className="counter-number text-[28px] font-extrabold leading-9 text-foreground"
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
                    className="text-[14px] text-foreground"
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

          {!complete && (
            <p className="mt-6 text-[18px] font-bold text-foreground">{t(language, "reader.tapAnywhere")}</p>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div
      className="relative flex h-full flex-col bg-background"
      dir={isArabic ? "rtl" : "ltr"}
      onTouchStart={(event) => {
        const touch = event.touches[0];
        if (touch) {
          touchStartX.current = touch.clientX;
        }
      }}
      onTouchEnd={(event) => {
        if (touchStartX.current === null) {
          return;
        }

        const touch = event.changedTouches[0];
        if (!touch) {
          touchStartX.current = null;
          return;
        }

        const deltaX = touch.clientX - touchStartX.current;
        if (Math.abs(deltaX) > 14) {
          suppressTap.current = true;
          if (tapSuppressTimer.current) {
            clearTimeout(tapSuppressTimer.current);
          }
          tapSuppressTimer.current = setTimeout(() => {
            suppressTap.current = false;
          }, 220);
        }

        handleSwipe(deltaX);
        touchStartX.current = null;
      }}
    >
      <div className="sr-only" aria-live="polite">
        {shareMessage}
      </div>
      <div className="sr-only" aria-live="assertive" aria-atomic="true">
        {readerAnnouncement}
      </div>

      <div className="relative shrink-0 px-5 py-3">
        <div className="grid grid-cols-[68px_1fr_68px] items-center gap-2" dir="ltr">
          <button
            onClick={onBack}
            aria-label="Go back"
            className="flex h-11 w-[68px] items-center justify-center rounded-full border border-border text-foreground transition-colors hover:bg-muted active:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <ArrowPrevious size={20} />
          </button>

          <p className="truncate text-center text-[20px] font-bold text-foreground" dir="auto">
            {isArabic ? category.nameArabic : category.name}
          </p>

          <DropdownMenu dir={isArabic ? "rtl" : "ltr"}>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                aria-label="Reader menu"
                className="flex h-11 w-[68px] items-center justify-center rounded-full border border-border text-foreground transition-colors hover:bg-muted active:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <Menu size={18} />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-[200px] rounded-2xl p-2" sideOffset={8}>
              <DropdownMenuItem
                onClick={handleReset}
                className="flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-[15px] font-medium transition-colors hover:bg-muted"
              >
                <RotateCcw size={18} />
                {t(language, "reader.resetCounter")}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={onBack}
                className="flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-[15px] font-medium transition-colors hover:bg-muted"
              >
                <List size={18} />
                {t(language, "reader.viewAllAzkar")}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => void handleShare()}
                className="flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-[15px] font-medium transition-colors hover:bg-muted"
              >
                <Share2 size={18} />
                {t(language, "reader.share")}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={handleToggleSaved}
                className="flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-[15px] font-medium transition-colors hover:bg-muted"
              >
                <Bookmark size={18} className={isSaved ? "fill-current" : ""} />
                {isSaved ? t(language, "reader.removeFromFavorites") : t(language, "reader.addToFavorites")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="shrink-0 px-5 pb-3 pt-2">
        <ProgressBar
          value={readingProgressValue}
          max={azkar.length}
          height={4}
          trackColor="var(--card)"
          fillColor="var(--primary)"
          aria-label={t(language, "reader.groupProgress")}
        />
      </div>

      <ScrollArea className="zikr-scroll min-h-0 flex-1">
        <div className="zikr-step-enter flex min-h-full flex-col" key={z.id}>
          {renderReadingContent()}
          {renderCounterPanel()}
        </div>
      </ScrollArea>

      <footer className="shrink-0 px-6 pb-4 pt-3">{renderCounterActions()}</footer>

      {benefitOpen && (
        <ReaderReferenceSheet zikr={z} language={language} onClose={closeReference} onAnnouncement={setShareMessage} />
      )}
    </div>
  );
}
