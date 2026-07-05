import React, { useEffect, useRef, useState } from "react";
import {
  Bookmark,
  Check,
  ChevronDown,
  ChevronLeft,
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
import { formatNumerals, formatRatio, numeralFontFamily } from "../formatting";
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

function ActionButton({
  active = false,
  icon,
  label,
  onClick,
  ariaPressed,
}: {
  active?: boolean;
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  ariaPressed?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      aria-pressed={ariaPressed}
      className="inline-flex h-10 items-center justify-center gap-2 rounded-full border px-3 text-[14px] font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      style={{
        minWidth: 0,
        background: active ? "color-mix(in srgb, var(--primary) 16%, var(--card))" : "color-mix(in srgb, var(--card) 92%, transparent)",
        borderColor: active ? "color-mix(in srgb, var(--primary) 42%, transparent)" : "var(--border)",
        color: active ? "var(--primary)" : "var(--card-foreground)",
      }}
    >
      {icon}
      <span>{label}</span>
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

function ReaderBottomSheet({
  open,
  title,
  description,
  onClose,
  children,
}: {
  open: boolean;
  title: string;
  description: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  if (!open) {
    return null;
  }

  return (
    <div
      className="absolute inset-0 z-50 flex items-end bg-black/45"
      role="dialog"
      aria-modal="true"
      aria-label={title}
      onClick={onClose}
    >
      <div
        className="max-h-[72%] w-full rounded-t-[28px] border-t border-border bg-background shadow-[0_-18px_48px_rgba(0,0,0,0.34)]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex justify-center pt-2.5">
          <div className="h-1.5 w-12 rounded-full bg-border" aria-hidden="true" />
        </div>

        <div className="flex items-start gap-3 border-b border-border px-4 pb-3 pt-3">
          <div className="min-w-0 flex-1">
            <p className="text-[17px] font-bold text-foreground">{title}</p>
            <p className="mt-1 text-[13px] leading-[20px] text-muted-foreground">{description}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex h-10 w-10 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <X size={18} />
          </button>
        </div>

        {children}
      </div>
    </div>
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
  const [expandedReading, setExpandedReading] = useState(false);
  const [translationOpen, setTranslationOpen] = useState(false);
  const [referencesOpen, setReferencesOpen] = useState(false);
  const [listenMode, setListenMode] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [speed, setSpeed] = useState<0.75 | 1 | 1.25>(1);
  const [count, setCount] = useState(0);
  const [pulse, setPulse] = useState(0);
  const [flash, setFlash] = useState(false);
  const [complete, setComplete] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [autoAdvanceCancelled, setAutoAdvanceCancelled] = useState(false);
  const [countdown, setCountdown] = useState(2);
  const [isSaved, setIsSaved] = useState(false);
  const [shareMessage, setShareMessage] = useState("");

  const touchStartX = useRef<number | null>(null);
  const suppressTap = useRef(false);
  const resetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const advanceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const countdownTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const shareTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const tapSuppressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const initialCount = isDone && z ? z.repetitionCount : 0;
    setCount(initialCount);
    setComplete(initialCount >= (z?.repetitionCount ?? 1));
    setShowCelebration(false);
    setAutoAdvanceCancelled(false);
    setCountdown(2);
    setBenefitOpen(false);
    setExpandedReading(false);
    setTranslationOpen(false);
    setReferencesOpen(false);
    setListenMode(false);
    setIsSaved(loadSavedZikrIds().has(z?.id ?? ""));
  }, [idx, isDone, z?.id, z?.repetitionCount]);

  useEffect(() => {
    return () => {
      if (resetTimer.current) {
        clearTimeout(resetTimer.current);
      }
      if (advanceTimer.current) {
        clearTimeout(advanceTimer.current);
      }
      if (countdownTimer.current) {
        clearInterval(countdownTimer.current);
      }
      if (shareTimer.current) {
        clearTimeout(shareTimer.current);
      }
      if (tapSuppressTimer.current) {
        clearTimeout(tapSuppressTimer.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!showCelebration || autoAdvanceCancelled) {
      if (advanceTimer.current) {
        clearTimeout(advanceTimer.current);
      }
      if (countdownTimer.current) {
        clearInterval(countdownTimer.current);
      }
      return;
    }

    setCountdown(2);
    countdownTimer.current = setInterval(() => {
      setCountdown((value) => (value > 0 ? value - 1 : 0));
    }, 1000);

    advanceTimer.current = setTimeout(() => {
      onAdvance(idx);
    }, 2200);

    return () => {
      if (advanceTimer.current) {
        clearTimeout(advanceTimer.current);
      }
      if (countdownTimer.current) {
        clearInterval(countdownTimer.current);
      }
    };
  }, [autoAdvanceCancelled, idx, onAdvance, showCelebration]);

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
  const completedIncludingActive = completedCount + (showCelebration && !isDone ? 1 : 0);
  const progressPercent = azkar.length > 0 ? Math.round((completedIncludingActive / azkar.length) * 100) : 0;
  const nextExcerpt = nextZikr?.arabicText.slice(0, 42).trim();

  const handleSwipe = (dx: number) => {
    if (showCelebration) {
      return;
    }

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
    if (listenMode || complete || showCelebration) {
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
      setShowCelebration(true);
      setAutoAdvanceCancelled(false);
      onComplete(idx);
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
    if (suppressTap.current || expandedReading || translationOpen || referencesOpen || shouldIgnoreCountTap(event.target)) {
      return;
    }

    handleTap();
  };

  const handleReset = () => {
    setCount(0);
    setComplete(false);
    setShowCelebration(false);
    setAutoAdvanceCancelled(true);
    setPulse((value) => value + 1);
  };

  const handleContinue = () => {
    setAutoAdvanceCancelled(true);
    onAdvance(idx);
  };

  const cycleSpeed = () => {
    const speeds: Array<0.75 | 1 | 1.25> = [0.75, 1, 1.25];
    const currentIndex = speeds.indexOf(speed);
    const nextIndex = (currentIndex + 1) % speeds.length;
    setSpeed(speeds[nextIndex]);
  };

  const openTranslationSheet = () => {
    if (!showTranslation && !showTransliteration) {
      onToggleTranslation();
    }
    setTranslationOpen(true);
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

  const renderExpandedContent = () => (
    <div className="space-y-5 px-5 py-5">
      <div className="flex justify-center">
        <span className="rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-[12px] font-semibold text-primary">
          {t(language, "reader.count")}: {localizedDisplayCount}
        </span>
      </div>

      <p
        className="text-center text-[22px] font-bold leading-[42px] text-foreground"
        dir="rtl"
        style={{ fontFamily: "'Noto Naskh Arabic', serif" }}
      >
        {z.arabicText}
      </p>

      <div className="flex justify-center gap-3">
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
      </div>

      {showTranslation && (
        <p className="text-center text-[15px] leading-[25px] text-card-foreground">{z.translation}</p>
      )}

      {showTransliteration && (
        <p className="text-center text-[14px] italic leading-[24px] text-card-foreground">{z.transliteration}</p>
      )}

      <div className="rounded-[22px] border border-border bg-card/40">
        <button
          type="button"
          onClick={() => setBenefitOpen((open) => !open)}
          aria-expanded={benefitOpen}
          aria-controls="expanded-benefit-content"
          className="flex w-full items-center gap-3 px-4 py-4 text-start focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <div className="text-muted-foreground">
            {benefitOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </div>
          <p className="flex-1 text-[16px] font-semibold text-foreground">{t(language, "reader.referencesButton")}</p>
        </button>

        {benefitOpen && (
          <div id="expanded-benefit-content" className="fade-in border-t border-border px-4 pb-4 pt-3">
            {renderReferenceContent()}
          </div>
        )}
      </div>
    </div>
  );

  const renderCounterActions = () => (
    <div className="flex items-center justify-between gap-2 rounded-[24px] border border-border bg-card/78 p-2.5 shadow-[0_12px_28px_rgba(0,0,0,0.14)] backdrop-blur">
      <button
        type="button"
        onClick={() => {
          void handleShare();
        }}
        aria-label={t(language, "reader.share")}
        className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-card-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <Share2 size={16} />
      </button>

      <div className="grid flex-1 grid-cols-2 gap-2">
        <ActionButton
          icon={<Globe size={16} />}
          label={t(language, "reader.translationButton")}
          onClick={openTranslationSheet}
          active={translationOpen}
        />
        <ActionButton
          icon={<ChevronDown size={16} />}
          label={t(language, "reader.referencesButton")}
          onClick={() => setReferencesOpen(true)}
          active={referencesOpen}
        />
      </div>

      <button
        type="button"
        onClick={handleToggleSaved}
        aria-label={isSaved ? t(language, "reader.unsave") : t(language, "reader.save")}
        aria-pressed={isSaved}
        className="flex h-9 w-9 items-center justify-center rounded-full border border-border transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        style={{ color: isSaved ? "var(--primary)" : "var(--card-foreground)" }}
      >
        <Heart size={16} className={isSaved ? "fill-current" : ""} />
      </button>
    </div>
  );

  const renderReadingContent = () => (
    <div className="px-2.5 pb-2 pt-1.5">
      <div className="mb-1.5 flex items-center justify-between gap-3">
        <span className="text-[12px] font-semibold text-muted-foreground">
          {t(language, "reader.count")}: {localizedDisplayCount}
        </span>
        <span className="text-[12px] font-semibold text-primary">
          {formatNumerals(readingProgressValue, language)} / {formatNumerals(azkar.length, language)}
        </span>
      </div>

      <p
        className="text-center text-[22px] font-bold leading-[36px] text-foreground"
        dir="rtl"
        style={{ fontFamily: "'Noto Naskh Arabic', serif" }}
      >
        {z.arabicText}
      </p>
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
                style={{ fontFamily: numeralFontFamily(language), fontVariantNumeric: "tabular-nums lining-nums" }}
              >
                {localizedCount}
              </p>
              <p
                className="mt-1.5 text-[15px] font-semibold text-card-foreground"
                dir="ltr"
                style={{ fontFamily: numeralFontFamily(language), fontVariantNumeric: "tabular-nums lining-nums" }}
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
    <div className="border-t border-border/70 px-4 pb-4 pt-3">
      <div className="flex h-full flex-col justify-between rounded-[24px] border border-border bg-card/35 px-4 py-3">
        <div className="text-center">
          <p className="text-[14px] font-semibold text-secondary">{t(language, "reader.listenMode")}</p>
          <p className="mt-1 text-[13px] leading-[20px] text-muted-foreground">{t(language, "reader.listenModeHint")}</p>
        </div>

        <div className="flex flex-1 flex-col items-center justify-center">
          <button
            type="button"
            onClick={() => setPlaying((value) => !value)}
            aria-label={playing ? "Pause" : "Play"}
            className="flex h-14 w-14 items-center justify-center rounded-full border border-secondary/35 bg-secondary/14 text-secondary transition-transform active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {playing ? <Pause size={24} /> : <Play size={24} className="ms-1" />}
          </button>

          <div className="mt-5 flex w-full max-w-[260px] items-center gap-3">
            <WaveformBars active={playing && !muted} />
            <div className="h-[3px] flex-1 rounded-full bg-border" aria-hidden="true">
              <div
                className="h-full rounded-full bg-secondary"
                style={{ width: playing ? "44%" : "18%", transition: "width 220ms ease" }}
              />
            </div>
          </div>

          <div className="mt-4 flex items-center gap-3">
            <button
              type="button"
              onClick={cycleSpeed}
              aria-label={t(language, "reader.audioSpeed")}
              className="rounded-full border border-border px-3 py-1 text-[12px] font-semibold text-card-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {speed}x
            </button>
            <button
              type="button"
              onClick={() => setMuted((value) => !value)}
              aria-label={muted ? "Unmute audio" : "Mute audio"}
              className="flex h-10 w-10 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {muted ? <VolumeX size={18} /> : <Volume2 size={18} />}
            </button>
          </div>
        </div>

        <div className="mt-3">{renderCounterActions()}</div>
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

        {showCelebration && (
          <div className="sr-only" aria-live="assertive">
            {t(language, "reader.completionAnnouncement", {
              index: formatNumerals(idx + 1, language),
              total: formatNumerals(azkar.length, language),
              percent: formatNumerals(progressPercent, language),
            })}
          </div>
        )}

        <div className="shrink-0 border-b border-border/70 px-4 py-3">
          <div className="grid grid-cols-[44px_1fr_44px] items-center gap-3">
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

            <button
              type="button"
              onClick={handleToggleSaved}
              aria-label={isSaved ? t(language, "reader.unsave") : t(language, "reader.save")}
              aria-pressed={isSaved}
              className="flex h-11 w-11 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted active:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              style={{ color: isSaved ? "var(--primary)" : undefined }}
            >
              <Bookmark size={22} className={isSaved ? "fill-current" : ""} />
            </button>
          </div>
        </div>

        <div className="shrink-0 border-b border-border/70 px-3 py-1.5">
          <div className="flex items-center justify-between gap-3">
            <p className="text-[12px] font-medium text-muted-foreground">
              {t(language, "reader.progressSummary", {
                done: formatNumerals(readingProgressValue, language),
                total: formatNumerals(azkar.length, language),
              })}
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setExpandedReading(true)}
                className="text-[12px] font-semibold text-primary underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {t(language, "reader.viewAll")}
              </button>
              <ModePill active={listenMode} label={t(language, "reader.listenModeToggle")} onClick={() => setListenMode((value) => !value)} />
            </div>
          </div>
          <div className="mt-1.5">
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
          {showCelebration ? (
            <div
              className="border-t border-border/70 px-5 pb-6 pt-5"
              style={{
                background: "linear-gradient(180deg, rgba(8,16,38,0.98), rgba(8,16,38,1))",
                minHeight: 420,
              }}
            >
              <div className="flex h-full flex-col items-center justify-center text-center">
                <div className="celebration-glow relative mb-6 flex h-[210px] w-[210px] items-center justify-center">
                  <div className="celebration-pop flex h-[168px] w-[168px] items-center justify-center rounded-full bg-primary shadow-[0_0_42px_rgba(215,165,40,0.22)]">
                    <Check size={62} className="text-primary-foreground" strokeWidth={2.4} />
                  </div>
                </div>

                <p
                  className="text-[40px] font-bold leading-none text-primary"
                  style={isArabic ? { fontFamily: "'Noto Naskh Arabic', serif" } : undefined}
                >
                  {t(language, "reader.complete")}
                </p>
                <p className="mt-3 text-[16px] leading-[24px] text-card-foreground">
                  {t(language, "reader.completionContext", {
                    count: formatNumerals(z.repetitionCount, language),
                  })}
                </p>

                {currentStreak > 0 && (
                  <div className="mt-4 rounded-full border border-primary/35 bg-primary/10 px-4 py-2 text-[14px] font-bold text-primary">
                    {t(language, "reader.streakBadge", {
                      count: formatNumerals(currentStreak, language),
                    })}
                  </div>
                )}

                <p className="mt-5 text-[14px] font-semibold text-card-foreground">
                  {t(language, "reader.keepGoing", {
                    done: formatNumerals(completedIncludingActive, language),
                    total: formatNumerals(azkar.length, language),
                  })}
                </p>

                {nextZikr && (
                  <div className="mt-5 w-full rounded-[20px] border border-border bg-card/45 px-4 py-3 text-start">
                    <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-muted-foreground">
                      {t(language, "reader.nextPreview")}
                    </p>
                    <p
                      className="mt-2 text-right text-[18px] leading-[30px] text-foreground"
                      dir="rtl"
                      style={{ fontFamily: "'Noto Naskh Arabic', serif" }}
                    >
                      {nextExcerpt}
                      {nextExcerpt && nextExcerpt.length >= 42 ? "..." : ""}
                    </p>
                    <p className="mt-2 text-[13px] text-muted-foreground">
                      {t(language, "reader.count")}: {formatNumerals(nextZikr.countLabel ?? String(nextZikr.repetitionCount), language)}
                    </p>
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleContinue}
                  className="mt-6 h-[52px] min-w-[220px] rounded-full bg-primary px-6 text-[16px] font-bold text-primary-foreground transition-transform active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {nextZikr
                    ? t(language, "reader.nextCta", { index: formatNumerals(idx + 2, language) })
                    : t(language, "reader.finishSession")}
                </button>

                {!autoAdvanceCancelled && (
                  <div className="mt-3 flex items-center gap-3">
                    <p className="text-[13px] text-muted-foreground">
                      {t(language, "reader.autoAdvanceCountdown", { seconds: formatNumerals(countdown, language) })}
                    </p>
                    <button
                      type="button"
                      onClick={() => setAutoAdvanceCancelled(true)}
                      className="rounded-full border border-border px-3 py-1.5 text-[12px] font-semibold text-card-foreground transition-colors hover:bg-muted active:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      {t(language, "reader.stayHere")}
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div
              className="grid min-h-0 flex-1"
              onClick={handleSurfaceTap}
              style={{
                gridTemplateRows: listenMode
                  ? "minmax(0, 1fr) 188px"
                  : "minmax(0, 1fr) clamp(208px, 27%, 248px)",
              }}
            >
              <ScrollArea className="zikr-scroll min-h-0">{renderReadingContent()}</ScrollArea>
              {listenMode ? renderListeningPanel() : renderCounterPanel()}
            </div>
          )}
        </div>

        {expandedReading && (
          <div className="absolute inset-0 z-40 flex flex-col bg-background">
            <div className="flex items-center gap-3 border-b border-border/70 px-4 py-4">
              <button
                type="button"
                onClick={() => setExpandedReading(false)}
                aria-label={t(language, "reader.closeReader")}
                className="flex h-11 w-11 items-center justify-center rounded-full text-foreground transition-colors hover:bg-muted active:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <X size={20} />
              </button>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[17px] font-bold text-foreground">{t(language, "reader.fullView")}</p>
                <p className="mt-1 text-[12px] leading-[18px] text-muted-foreground">{t(language, "reader.fullViewHint")}</p>
              </div>
            </div>

            <ScrollArea className="zikr-scroll min-h-0 flex-1">{renderExpandedContent()}</ScrollArea>
          </div>
        )}
        <ReaderBottomSheet
          open={translationOpen}
          title={t(language, "reader.translationSheet")}
          description={t(language, "reader.translationSheetHint")}
          onClose={() => setTranslationOpen(false)}
        >
          <ScrollArea className="zikr-scroll max-h-[56vh] px-4 py-4">
            <div className="space-y-4 pb-5">
              <div className="flex justify-center gap-3">
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
              </div>

              {showTranslation && (
                <section className="rounded-[18px] border border-border bg-card/55 p-4">
                  <p className="text-[12px] font-bold tracking-[0.08em] text-muted-foreground">ENGLISH</p>
                  <p className="mt-3 text-[16px] leading-[28px] text-card-foreground">{z.translation}</p>
                </section>
              )}

              {showTransliteration && (
                <section className="rounded-[18px] border border-border bg-card/55 p-4">
                  <p className="text-[12px] font-bold tracking-[0.08em] text-muted-foreground">TRANSLITERATION</p>
                  <p className="mt-3 text-[15px] italic leading-[26px] text-card-foreground">{z.transliteration}</p>
                </section>
              )}

              {!showTranslation && !showTransliteration && (
                <p className="rounded-[18px] border border-border bg-card/40 px-4 py-5 text-center text-[15px] leading-[24px] text-muted-foreground">
                  {t(language, "reader.translationEmpty")}
                </p>
              )}
            </div>
          </ScrollArea>
        </ReaderBottomSheet>

        <ReaderBottomSheet
          open={referencesOpen}
          title={t(language, "reader.referencesSheet")}
          description={t(language, "reader.referencesSheetHint")}
          onClose={() => setReferencesOpen(false)}
        >
          <ScrollArea className="zikr-scroll max-h-[56vh] px-4 py-4">
            <div className="pb-5">{renderReferenceContent()}</div>
          </ScrollArea>
        </ReaderBottomSheet>
      </div>
  );
}
