import React, { useEffect, useRef, useState } from "react";
import {
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ExternalLink,
  Globe,
  Heart,
  Pause,
  Play,
  RotateCcw,
  Share2,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";
import { t } from "../i18n";
import { CATEGORIES } from "../content/categories";
import { getAzkarByCategory } from "../content/azkar";
import type { AppLanguage, CategoryId } from "../types";
import { ProgressBar } from "../components/ProgressBar";
import { CounterRing, PulseRings, WaveformBars } from "../components/ZikrComponents";
import { counterNumeralFontFamily, formatNumerals, formatRatio } from "../formatting";
import { ScrollArea } from "../components/ui/scroll-area";

const SAVED_ZIKR_STORAGE_KEY = "azkarapp.saved-zikr.v1";

function TogglePill({
  active,
  label,
  onClick,
  ariaLabel,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
  ariaLabel: string;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      aria-label={ariaLabel}
      onClick={onClick}
      className="inline-flex min-w-[58px] items-center justify-center rounded-full border px-4 py-2 text-[11px] font-bold uppercase tracking-[0.08em] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      style={{
        background: active ? "color-mix(in srgb, var(--primary) 14%, var(--card))" : "var(--card)",
        borderColor: active ? "color-mix(in srgb, var(--primary) 42%, transparent)" : "var(--border)",
        color: active ? "var(--primary)" : "var(--muted-foreground)",
      }}
    >
      {label}
    </button>
  );
}


function ModePill({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className="inline-flex h-8 items-center rounded-full border px-3 text-[12px] font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      style={{
        background: active ? "color-mix(in srgb, var(--secondary) 22%, var(--card))" : "transparent",
        borderColor: active ? "color-mix(in srgb, var(--secondary) 40%, transparent)" : "var(--border)",
        color: active ? "var(--secondary)" : "var(--muted-foreground)",
      }}
    >
      {label}
    </button>
  );
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
  completedCount,
  currentStreak,
  showTransliteration,
  showTranslation,
  onBack,
  onComplete,
  onAdvance,
  onToggleTransliteration,
  onToggleTranslation,
  onNext,
  onPrev,
}: {
  catId: CategoryId;
  idx: number;
  isArabic: boolean;
  isDone: boolean;
  completedCount: number;
  currentStreak: number;
  showTransliteration: boolean;
  showTranslation: boolean;
  onBack: () => void;
  onComplete: (idx: number) => void;
  onAdvance: (idx: number) => void;
  onToggleTransliteration: () => void;
  onToggleTranslation: () => void;
  onNext: () => void;
  onPrev: () => void;
}) {
  const azkar = getAzkarByCategory(catId);
  const z = azkar[idx];
  const nextZikr = idx < azkar.length - 1 ? azkar[idx + 1] : null;
  const category = CATEGORIES.find((item) => item.id === catId);
  const language: AppLanguage = isArabic ? "ar" : "en";

  const [benefitOpen, setBenefitOpen] = useState(false);
  const [listenMode, setListenMode] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [speed, setSpeed] = useState<0.75 | 1 | 1.25>(1);
  const [count, setCount] = useState(0);
  const [pulse, setPulse] = useState(0);
  const [flash, setFlash] = useState(false);
  const [complete, setComplete] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [shareMessage, setShareMessage] = useState("");

  const touchStartX = useRef<number | null>(null);
  const suppressTap = useRef(false);
  const resetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const advanceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const shareTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const tapSuppressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const initialCount = isDone && z ? z.repetitionCount : 0;
    setCount(initialCount);
    setComplete(initialCount >= (z?.repetitionCount ?? 1));
    setBenefitOpen(false);
    setListenMode(false);
    setIsSaved(loadSavedZikrIds().has(z?.id ?? ""));
  }, [idx, isDone, z?.id, z?.repetitionCount]);

  useEffect(() => {
    return () => {
      if (resetTimer.current) {
        clearTimeout(resetTimer.current);
      }
      if (shareTimer.current) {
        clearTimeout(shareTimer.current);
      }
      if (tapSuppressTimer.current) {
        clearTimeout(tapSuppressTimer.current);
      }
    };
  }, []);

  if (!z || !category) {
    return null;
  }

  const displayCount = z.countLabel ?? String(z.repetitionCount);
  const extraNotes = z.notes && z.notes !== z.benefit ? z.notes : "";
  const authenticityNote = z.authenticityNote && z.authenticityNote !== z.benefit ? z.authenticityNote : "";
  const remaining = Math.max(0, z.repetitionCount - count);
  const localizedCount = formatNumerals(count, language);
  const localizedDisplayCount = formatNumerals(displayCount, language);
  const localizedRemaining = formatNumerals(remaining, language);
  const localizedRatio = formatRatio(count, z.repetitionCount, language);
  const readingProgressValue = idx + 1;
  const completedIncludingActive = completedCount + (false ? 1 : 0);
  const progressPercent = azkar.length > 0 ? Math.round((completedIncludingActive / azkar.length) * 100) : 0;
  const nextExcerpt = nextZikr?.arabicText.slice(0, 42).trim();
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
    if (listenMode || complete) {
      return;
    }

    const next = count + 1;
    setCount(next);
    setPulse((value) => value + 1);
    setFlash(true);

    if (resetTimer.current) {
      clearTimeout(resetTimer.current);
    }

    resetTimer.current = setTimeout(() => {
      setFlash(false);
    }, 140);

    if (next >= z.repetitionCount) {
      setComplete(true);
      onComplete(idx);
      onAdvance(idx);
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

  const handleSurfaceTap = (event: React.MouseEvent<HTMLDivElement>) => {
    if (suppressTap.current || shouldIgnoreCountTap(event.target)) {
      return;
    }

    handleTap();
  };

  const handleReset = () => {
    setCount(0);
    setComplete(false);
    setPulse((value) => value + 1);
  };

  const handleContinue = () => {
    onAdvance(idx);
  };

  const cycleSpeed = () => {
    const speeds: Array<0.75 | 1 | 1.25> = [0.75, 1, 1.25];
    const currentIndex = speeds.indexOf(speed);
    const nextIndex = (currentIndex + 1) % speeds.length;
    setSpeed(speeds[nextIndex]);
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

  const renderReferenceContent = () => (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <span
          className="inline-flex rounded-full border px-3 py-1 text-[12px] font-semibold text-card-foreground"
          style={{
            background: "color-mix(in srgb, var(--secondary) 12%, transparent)",
            borderColor: "color-mix(in srgb, var(--secondary) 34%, transparent)",
          }}
        >
          {z.sourceReference}
        </span>
        <span
          className="inline-flex rounded-full border px-3 py-1 text-[12px] font-semibold text-card-foreground"
          style={{
            background: "color-mix(in srgb, var(--primary) 10%, transparent)",
            borderColor: "color-mix(in srgb, var(--primary) 28%, transparent)",
          }}
        >
          {t(language, "reader.count")}: {localizedDisplayCount}
        </span>
      </div>

      <section className="rounded-[22px] border border-border bg-card/55 p-4">
        <p className="text-[12px] font-bold tracking-[0.08em] text-muted-foreground">{t(language, "reader.benefit")}</p>
        <p className="mt-2 text-[15px] leading-[24px] text-card-foreground">{z.benefit}</p>
      </section>

      {z.preferredTiming && (
        <section className="rounded-[22px] border border-border bg-card/55 p-4">
          <p className="text-[12px] font-bold tracking-[0.08em] text-muted-foreground">{t(language, "reader.timing")}</p>
          <p className="mt-2 text-[15px] leading-[24px] text-card-foreground">{z.preferredTiming}</p>
        </section>
      )}

      {authenticityNote && (
        <section className="rounded-[22px] border border-border bg-card/55 p-4">
          <p className="text-[12px] font-bold tracking-[0.08em] text-muted-foreground">{t(language, "reader.authenticity")}</p>
          <p className="mt-2 text-[15px] leading-[24px] text-card-foreground">{authenticityNote}</p>
        </section>
      )}

      {extraNotes && (
        <section className="rounded-[22px] border border-border bg-card/55 p-4">
          <p className="text-[12px] font-bold tracking-[0.08em] text-muted-foreground">{t(language, "reader.notes")}</p>
          <p className="mt-2 text-[15px] leading-[24px] text-card-foreground">{extraNotes}</p>
        </section>
      )}

      {z.hadithText && (
        <section className="rounded-[22px] border border-border bg-card/55 p-4">
          <p className="text-[12px] font-bold tracking-[0.08em] text-muted-foreground">{t(language, "reader.evidence")}</p>
          <p
            className="mt-2 rounded-[18px] border border-border bg-background/65 px-4 py-4 text-[16px] leading-[30px] text-foreground"
            dir="auto"
            lang="ar"
            style={{ fontFamily: "'Noto Naskh Arabic', serif" }}
          >
            {z.hadithText}
          </p>
        </section>
      )}

      {z.sourceUrl && (
        <a
          href={z.sourceUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex h-11 items-center gap-2 rounded-full border border-border px-4 text-[14px] font-semibold text-primary transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <ExternalLink size={16} />
          <span>{t(language, "reader.openSource")}</span>
        </a>
      )}
    </div>
  );

  

    const renderCounterActions = () => (
    <div className="flex items-center justify-between gap-4 px-2">
      <button
        type="button"
        onClick={() => {
          void handleShare();
        }}
        aria-label={t(language, "reader.share")}
        className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card/50 text-card-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <Share2 size={18} />
      </button>

      <button
        type="button"
        onClick={handleToggleSaved}
        aria-label={isSaved ? t(language, "reader.unsave") : t(language, "reader.save")}
        aria-pressed={isSaved}
        className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card/50 transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        style={{ color: isSaved ? "var(--primary)" : "var(--card-foreground)" }}
      >
        <Heart size={18} className={isSaved ? "fill-current" : ""} />
      </button>
    </div>
  );

    const renderReadingContent = () => (
    <div className="px-5 pb-8 pt-4 space-y-6">
      <div className="mb-2 flex items-center justify-between gap-3">
        <span className="text-[12px] font-semibold text-muted-foreground">
          {t(language, "reader.count")}: {localizedDisplayCount}
        </span>
        <span className="text-[12px] font-semibold text-primary">
          {formatNumerals(readingProgressValue, language)} / {formatNumerals(azkar.length, language)}
        </span>
      </div>

      <p
        className="text-center text-[26px] font-bold leading-[46px] text-foreground"
        dir="rtl"
        lang="ar"
        style={{ fontFamily: "'Noto Naskh Arabic', serif" }}
      >
        {z.arabicText}
      </p>

      <div className="flex justify-center gap-3 pt-2">
        <TogglePill
          active={showTranslation}
          label="EN"
          onClick={onToggleTranslation}
          ariaLabel={t(language, "reader.toggleTranslation")}
        />
        <TogglePill
          active={showTransliteration}
          label="TR"
          onClick={onToggleTransliteration}
          ariaLabel={t(language, "reader.toggleTransliteration")}
        />
        <TogglePill
          active={listenMode}
          label="Listen"
          onClick={() => setListenMode((value) => !value)}
          ariaLabel={t(language, "reader.listenModeToggle")}
        />
      </div>

      {showTranslation && (
        <p className="text-center text-[16px] leading-[28px] text-card-foreground">{z.translation}</p>
      )}

      {showTransliteration && (
        <p className="text-center text-[15px] italic leading-[26px] text-card-foreground">{z.transliteration}</p>
      )}

      <div className="rounded-[22px] border border-border bg-card/40 overflow-hidden">
        <button
          type="button"
          onClick={(e) => {
             e.stopPropagation();
             setBenefitOpen((open) => !open);
          }}
          aria-expanded={benefitOpen}
          aria-controls="inline-reference-content"
          className="flex w-full items-center gap-3 px-4 py-4 text-start transition-colors hover:bg-card/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <div className="text-muted-foreground">
            {benefitOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </div>
          <p className="flex-1 text-[16px] font-semibold text-foreground">{t(language, "reader.referencesButton")}</p>
        </button>

        {benefitOpen && (
          <div id="inline-reference-content" className="fade-in border-t border-border px-4 pb-4 pt-3">
            {renderReferenceContent()}
          </div>
        )}
      </div>
    </div>
  );

  const renderCounterPanel = () => (
    <div
      className="border-t border-border/70 px-3 pb-3 pt-2.5"
      style={{
        background: flash
          ? "linear-gradient(180deg, color-mix(in srgb, var(--primary) 8%, var(--background)), var(--background))"
          : "linear-gradient(180deg, rgba(8,16,38,0.98), rgba(8,16,38,1))",
      }}
    >
      <div className="flex h-full flex-col">
        <div
          role="button"
          tabIndex={0}
          aria-label={`${t(language, "reader.tapAnywhere")} ${localizedRatio}`}
          className="flex flex-1 flex-col items-center justify-center rounded-[28px] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring"
          onKeyDown={(event) => {
            if (event.key === " " || event.key === "Enter") {
              event.preventDefault();
              handleTap();
            }
          }}
        >
          <div className="pointer-events-none relative flex h-[138px] w-[138px] items-center justify-center">
            <PulseRings trigger={pulse} size={138} />
            <CounterRing count={count} total={z.repetitionCount} size={138} />
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <p
                className="text-[42px] font-extrabold leading-[42px] text-primary"
                dir="ltr"
                style={{ fontFamily: counterNumeralFontFamily(language), fontVariantNumeric: "tabular-nums lining-nums" }}
              >
                {localizedCount}
              </p>
              <p
                className="mt-1.5 text-[15px] font-semibold text-card-foreground"
                dir="ltr"
                style={{ fontFamily: counterNumeralFontFamily(language), fontVariantNumeric: "tabular-nums lining-nums" }}
              >
                {localizedRatio}
              </p>
            </div>
          </div>

          <p className="mt-2 text-[15px] font-bold text-foreground">{t(language, "reader.tapAnywhere")}</p>
          {remaining > 0 ? (
            <p className="mt-1 text-[13px] font-semibold text-primary">
              {t(language, "reader.remaining", { count: localizedRemaining })}
            </p>
          ) : (
            <p className="mt-1 text-[13px] text-muted-foreground">{t(language, "reader.completed")}</p>
          )}
        </div>

        <div className="mt-2.5">{renderCounterActions()}</div>

        <button
          type="button"
          onClick={handleReset}
          aria-label={t(language, "reader.resetCounter")}
          className="mx-auto mt-2 inline-flex items-center gap-2 rounded-full border border-border bg-card px-3.5 py-1.5 text-[12px] font-semibold text-card-foreground transition-colors hover:bg-muted active:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <RotateCcw size={14} />
          <span>{t(language, "reader.resetCounter")}</span>
        </button>
      </div>
    </div>
  );

    const renderListeningPanel = () => (
    <div
      className="border-t border-border/70 px-4 pb-4 pt-3"
      style={{
        background: "linear-gradient(180deg, rgba(8,16,38,0.98), rgba(8,16,38,1))",
      }}
    >
      <div className="flex h-full flex-col justify-between rounded-[24px] border border-secondary/20 bg-secondary/5 px-4 py-3">
        <div className="text-center mt-1">
          <p className="text-[15px] font-bold text-secondary">{t(language, "reader.listenMode")}</p>
          <p className="mt-1 text-[13px] font-medium leading-[20px] text-muted-foreground">{t(language, "reader.listenModeHint")}</p>
        </div>

        <div className="flex flex-1 flex-col items-center justify-center">
          <button
            type="button"
            onClick={() => setPlaying((value) => !value)}
            aria-label={playing ? "Pause" : "Play"}
            className="flex h-16 w-16 items-center justify-center rounded-full bg-secondary/15 text-secondary shadow-[0_0_24px_rgba(45,212,191,0.15)] transition-transform hover:scale-105 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {playing ? <Pause size={28} /> : <Play size={28} className="ms-1.5" />}
          </button>

          <div className="mt-6 flex w-full max-w-[280px] items-center gap-4">
            <WaveformBars active={playing && !muted} />
            <div className="h-[4px] flex-1 rounded-full bg-secondary/20 overflow-hidden" aria-hidden="true">
              <div
                className="h-full rounded-full bg-secondary"
                style={{ width: playing ? "44%" : "18%", transition: "width 220ms ease" }}
              />
            </div>
          </div>

          <div className="mt-5 flex items-center justify-center gap-4">
            <button
              type="button"
              onClick={cycleSpeed}
              aria-label={t(language, "reader.audioSpeed")}
              className="min-w-[48px] rounded-full border border-border bg-background/50 px-3 py-1.5 text-[13px] font-semibold text-card-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {speed}x
            </button>
            <button
              type="button"
              onClick={() => setMuted((value) => !value)}
              aria-label={muted ? "Unmute audio" : "Mute audio"}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-background/50 border border-border text-card-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {muted ? <VolumeX size={18} /> : <Volume2 size={18} />}
            </button>
          </div>
        </div>

        <div className="mt-2">{renderCounterActions()}</div>
      </div>
    </div>
  );

  return (
      <div
        className="relative flex h-full flex-col bg-background"
        onTouchStart={(event) => {
          touchStartX.current = event.touches[0].clientX;
        }}
        onTouchEnd={(event) => {
          if (touchStartX.current === null) {
            return;
          }

          const deltaX = event.changedTouches[0].clientX - touchStartX.current;
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

        <div className="shrink-0 border-b border-border/70 px-4 py-3">
          <div className="grid grid-cols-[44px_1fr_auto] items-center gap-3">
            <button
              onClick={onBack}
              aria-label="Go back"
              className="flex h-11 w-11 items-center justify-center rounded-full text-foreground transition-colors hover:bg-muted active:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <ChevronLeft size={22} className="rtl:-scale-x-100" />
            </button>

            <p className="truncate text-center text-[18px] font-bold text-foreground">
              {isArabic ? category.nameArabic : category.name}
            </p>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={onPrev}
                disabled={prevDisabled}
                aria-label={t(language, "reader.prev")}
                className="flex h-11 w-11 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted active:bg-muted disabled:opacity-35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <ChevronLeft size={20} className="rtl:-scale-x-100" />
              </button>
              <button
                type="button"
                onClick={onNext}
                disabled={nextDisabled}
                aria-label={t(language, "reader.next")}
                className="flex h-11 w-11 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted active:bg-muted disabled:opacity-35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <ChevronRight size={20} className="rtl:-scale-x-100" />
              </button>
            </div>
          </div>
        </div>

                <div className="shrink-0 border-b border-border/70 px-4 py-3">
          <div className="flex items-center justify-between gap-3">
            <p className="text-[13px] font-medium text-muted-foreground">
              {t(language, "reader.progressSummary", {
                done: formatNumerals(readingProgressValue, language),
                total: formatNumerals(azkar.length, language),
              })}
            </p>
          </div>
          <div className="mt-2.5">
            <ProgressBar
              value={readingProgressValue}
              max={azkar.length}
              height={3}
              trackColor="color-mix(in srgb, var(--muted) 78%, var(--card))"
              fillColor="var(--primary)"
              aria-label={t(language, "reader.groupProgress")}
            />
          </div>
        </div>

        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
                      <div
              className="grid min-h-0 flex-1"
              onClick={handleSurfaceTap}
              style={{
                gridTemplateRows: "minmax(0, 1fr) 35vh",
              }}
            >
              <ScrollArea className="zikr-scroll min-h-0">{renderReadingContent()}</ScrollArea>
              {listenMode ? renderListeningPanel() : renderCounterPanel()}
            </div>
        </div>
      </div>
  );
}
