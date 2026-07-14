import { useEffect, useRef, useState, type CSSProperties } from "react";
import { ArrowPrevious, BookOpen, Check, ChevronUp, Copy, Heart, Share2, Menu, X } from "../components/icons";
import { t } from "../i18n";
import { CATEGORIES } from "../content/categories";
import { getAzkarByCategory } from "../content/azkar";
import type { AppLanguage, CategoryId } from "../types";
import { ProgressBar } from "../components/ProgressBar";
import { CounterRing, PulseRings } from "../components/ZikrComponents";
import { counterNumeralFontFamily, formatNumerals, formatRatio } from "../formatting";
import { ScrollArea } from "../components/ui/scroll-area";

const SAVED_ZIKR_STORAGE_KEY = "azkarapp.saved-zikr.v1";
export const COUNTER_ADVANCE_DELAY_MS = 500;
type ReferenceCopyKey = "translation" | "transliteration" | "hadith";

function vibrate(pattern: number | number[]) {
  if (typeof navigator !== "undefined" && "vibrate" in navigator) {
    navigator.vibrate(pattern);
  }
}

function loadSavedZikrIds() {
  if (typeof window === "undefined") {
    return new Set<string>();
  }

  try {
    const raw = window.localStorage.getItem(SAVED_ZIKR_STORAGE_KEY);
    if (!raw) {
      return new Set<string>();
    }

    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) {
      return new Set<string>();
    }

    return new Set(parsed.filter((value): value is string => typeof value === "string"));
  } catch {
    return new Set<string>();
  }
}

function persistSavedZikrIds(ids: Set<string>) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(SAVED_ZIKR_STORAGE_KEY, JSON.stringify([...ids]));
}

export function ReaderScreen({
  catId,
  idx,
  isArabic,
  isDone,
  onBack,
  onComplete,
  onAdvance,
  onNext,
  onPrev,
}: {
  catId: CategoryId;
  idx: number;
  isArabic: boolean;
  isDone: boolean;
  onBack: () => void;
  onComplete: (idx: number) => void;
  onAdvance: (idx: number) => void;
  onNext: () => void;
  onPrev: () => void;
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
  const [isSaved, setIsSaved] = useState(false);
  const [shareMessage, setShareMessage] = useState("");
  const [readerAnnouncement, setReaderAnnouncement] = useState("");
  const [readerMenuOpen, setReaderMenuOpen] = useState(false);
  const [copiedReference, setCopiedReference] = useState<ReferenceCopyKey | null>(null);

  const touchStartX = useRef<number | null>(null);
  const suppressTap = useRef(false);
  const activeZikrId = useRef<string | null>(null);
  const advanceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const shareTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const tapSuppressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const copyFeedbackTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const referenceSheetRef = useRef<HTMLElement>(null);
  const referenceCloseButtonRef = useRef<HTMLButtonElement>(null);
  const referenceTriggerRef = useRef<HTMLButtonElement>(null);

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
    setIsSaved(loadSavedZikrIds().has(z?.id ?? ""));
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
      if (copyFeedbackTimer.current) {
        clearTimeout(copyFeedbackTimer.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!benefitOpen) {
      return;
    }

    const previouslyFocused = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const frame = requestAnimationFrame(() => referenceCloseButtonRef.current?.focus());
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setBenefitOpen(false);
        return;
      }

      if (event.key === "Tab") {
        const focusableElements = referenceSheetRef.current?.querySelectorAll<HTMLElement>(
          'button:not([disabled]), [href], [tabindex]:not([tabindex="-1"])',
        );
        if (!focusableElements?.length) {
          return;
        }

        const first = focusableElements.item(0);
        const last = focusableElements.item(focusableElements.length - 1);
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener("keydown", handleKeyDown);
      previouslyFocused?.focus();
    };
  }, [benefitOpen]);

  if (!z || !category) {
    return null;
  }

  const remaining = Math.max(0, z.repetitionCount - count);
  const localizedCount = formatNumerals(count, language);
  const localizedRemaining = formatNumerals(remaining, language);
  const localizedRatio = formatRatio(count, z.repetitionCount, language);
  const readingProgressValue = idx + 1;
  const prevDisabled = idx === 0;
  const nextDisabled = idx === azkar.length - 1;

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
    vibrate(8);

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
      vibrate([18, 40, 32]);
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
    const savedIds = loadSavedZikrIds();
    if (savedIds.has(z.id)) {
      savedIds.delete(z.id);
      setIsSaved(false);
    } else {
      savedIds.add(z.id);
      setIsSaved(true);
    }
    persistSavedZikrIds(savedIds);
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

  const handleCopyReference = async (key: ReferenceCopyKey, value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedReference(key);
      setShareMessage(t(language, "reader.referenceCopied"));
      if (copyFeedbackTimer.current) {
        clearTimeout(copyFeedbackTimer.current);
      }
      copyFeedbackTimer.current = setTimeout(() => {
        setCopiedReference(null);
        setShareMessage("");
      }, 1600);
    } catch {
      setCopiedReference(null);
    }
  };

  const renderCopyAction = (key: ReferenceCopyKey, value: string, label: string) => (
    <div className="relative h-8 w-full" dir="ltr">
      <button
        type="button"
        onClick={() => {
          void handleCopyReference(key, value);
        }}
        aria-label={label}
        className="absolute -top-1.5 -left-1.5 flex h-11 w-11 items-center justify-center rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-muted-foreground transition-colors">
          {copiedReference === key ? <Check size={16} /> : <Copy size={16} />}
        </span>
      </button>
    </div>
  );

  const renderReferenceContent = () => (
    <div className="reference-sheet-content flex flex-col gap-4 px-6" dir="ltr">
      <div className="rounded-xl bg-muted px-2 py-4">
        <p className="zikr-text text-center text-[18px] leading-7 text-muted-foreground" dir="rtl" lang="ar">
          {z.arabicText}
        </p>
      </div>

      <section className="flex flex-col gap-4">
        <h2 className="text-right text-[14px] font-semibold tracking-[0.02em] text-muted-foreground" dir="auto">
          {t(language, "reader.translationLabel")}
        </h2>
        <p className="latin-ui text-left text-[18px] leading-[1.5] text-foreground" lang="en" dir="ltr">
          {z.translation}
        </p>
        {renderCopyAction("translation", z.translation, t(language, "reader.copyTranslation"))}
      </section>

      <div className="h-px w-full bg-foreground/10" aria-hidden="true" />

      <section className="flex flex-col gap-4">
        <h2 className="text-right text-[14px] font-semibold tracking-[0.02em] text-muted-foreground" dir="auto">
          {t(language, "reader.transliterationLabel")}
        </h2>
        <p className="latin-ui text-left text-[18px] leading-[1.5] text-muted-foreground" lang="en" dir="ltr">
          {z.transliteration}
        </p>
        {renderCopyAction("transliteration", z.transliteration, t(language, "reader.copyTransliteration"))}
      </section>

      {z.hadithText && (
        <>
          <div className="h-px w-full bg-foreground/10" aria-hidden="true" />
          <section className="flex flex-col gap-3">
            <h2 className="text-right text-[14px] font-semibold tracking-[0.02em] text-muted-foreground" dir="auto">
              {t(language, "reader.hadithLabel")}
            </h2>
            <p className="zikr-text text-right text-[18px] leading-[1.6] text-muted-foreground" lang="ar" dir="rtl">
              {z.hadithText}
            </p>
            {renderCopyAction("hadith", z.hadithText, t(language, "reader.copyHadith"))}
          </section>
        </>
      )}

      <div className="flex justify-end">
        <span
          className="latin-ui max-w-full rounded-full bg-muted px-2.5 py-1.5 text-right text-[11px] font-semibold leading-4 text-muted-foreground"
          lang="en"
          dir="ltr"
          title={z.sourceReference}
        >
          {z.sourceReference}
        </span>
      </div>
    </div>
  );

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
        ref={referenceTriggerRef}
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
    <div className="px-6 pb-3 pt-3">
      <p
        className="zikr-text text-center text-[24px] font-medium leading-[1.5] text-foreground"
        data-testid="zikr-text"
        dir="rtl"
        lang="ar"
      >
        {z.arabicText}
      </p>
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
            className={`counter-ring-stage pointer-events-none relative flex h-[160px] w-[160px] items-center justify-center ${count === 0 && !complete ? "counter-ring-ready" : ""}`}
          >
            <PulseRings trigger={pulse} size={160} />
            <CounterRing count={count} total={z.repetitionCount} size={160} />
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

          {!complete && <p className="mt-6 text-[18px] font-bold text-foreground">{t(language, "reader.tapAnywhere")}</p>}
          {!complete && count > 0 && remaining > 0 ? (
            <p className="mt-2 text-[14px] font-semibold text-primary">
              {t(language, "reader.remaining", { count: localizedRemaining })}
            </p>
          ) : null}
        </div>

      </div>
    </div>
  );

  return (
    <div
      className="relative flex h-full flex-col bg-background"
      dir={isArabic ? "rtl" : "ltr"}
      style={
        {
          "--background": "#0d0d0d",
          "--foreground": "#f5f0e8",
          "--card": "#171717",
          "--card-foreground": "#b0aed0",
          "--muted": "#555555",
          "--muted-foreground": "#b0aed0",
          "--border": "#555555",
        } as CSSProperties
      }
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

          <button
            type="button"
            onClick={() => setReaderMenuOpen((value) => !value)}
            aria-label="Reader menu"
            aria-expanded={readerMenuOpen}
            className="flex h-11 w-[68px] items-center justify-center rounded-full border border-border text-foreground transition-colors hover:bg-muted active:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Menu size={18} />
          </button>
        </div>

        {readerMenuOpen && (
          <div
            className="menu-pop absolute right-5 top-[62px] z-20 grid min-w-[170px] gap-1 rounded-2xl border border-border bg-card p-2 shadow-xl"
            dir={isArabic ? "rtl" : "ltr"}
          >
            <button
              type="button"
              onClick={() => {
                onPrev();
                setReaderMenuOpen(false);
              }}
              disabled={prevDisabled}
              className="rounded-xl px-3 py-2 text-start text-[14px] font-semibold hover:bg-muted disabled:opacity-40"
            >
              {t(language, "reader.prev")}
            </button>
            <button
              type="button"
              onClick={() => {
                onNext();
                setReaderMenuOpen(false);
              }}
              disabled={nextDisabled}
              className="rounded-xl px-3 py-2 text-start text-[14px] font-semibold hover:bg-muted disabled:opacity-40"
            >
              {t(language, "reader.next")}
            </button>
            <button
              type="button"
              onClick={() => {
                handleReset();
                setReaderMenuOpen(false);
              }}
              className="rounded-xl px-3 py-2 text-start text-[14px] font-semibold hover:bg-muted"
            >
              {t(language, "reader.resetCounter")}
            </button>
          </div>
        )}
      </div>

      <div className="shrink-0 px-5 pb-3 pt-2">
        <p className="mb-3 text-end text-[14px] font-semibold text-foreground">
          {isArabic
            ? `ذكر ${formatNumerals(idx + 1, language)} من ${formatNumerals(azkar.length, language)}`
            : `Zikr ${formatNumerals(idx + 1, language)} of ${formatNumerals(azkar.length, language)}`}
        </p>
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
        <div className="scrim-in fixed inset-0 z-50 flex items-end justify-center bg-black/45">
          <button
            type="button"
            className="absolute inset-0 cursor-default"
            onClick={() => setBenefitOpen(false)}
            aria-label={t(language, "reader.closeReference")}
          />
          <section
            ref={referenceSheetRef}
            role="dialog"
            data-testid="reference-sheet"
            aria-modal="true"
            aria-label={t(language, "reader.referencesButton")}
            className="reference-sheet sheet-enter relative flex w-full max-w-[390px] flex-col overflow-hidden rounded-t-[20px] bg-background shadow-[0_-12px_32px_rgba(0,0,0,0.4)]"
            dir="ltr"
          >
            <div className="relative z-10 flex h-16 shrink-0 items-end justify-center bg-background px-6 pb-3">
              <span className="h-1 w-8 rounded-full bg-muted-foreground" aria-hidden="true" />
              <button
                ref={referenceCloseButtonRef}
                type="button"
                onClick={() => setBenefitOpen(false)}
                aria-label={t(language, "reader.closeReference")}
                className="absolute right-3 top-2.5 flex h-11 w-11 items-center justify-center rounded-full bg-muted text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <X size={18} />
              </button>
            </div>
            <ScrollArea className="reference-scroll min-h-0 flex-1 overscroll-contain">
              {renderReferenceContent()}
            </ScrollArea>
          </section>
        </div>
      )}
    </div>
  );
}
