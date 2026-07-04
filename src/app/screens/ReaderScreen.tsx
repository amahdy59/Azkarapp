import React, { useEffect, useRef, useState } from "react";
import {
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Expand,
  MoreHorizontal,
  Pause,
  Play,
  RotateCcw,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";
import { t } from "../i18n";
import { CATEGORIES } from "../content/categories";
import { getAzkarByCategory } from "../content/azkar";
import type { AppLanguage, CategoryId } from "../types";
import { ProgressBar } from "../components/ProgressBar";
import { CounterRing, PulseRings } from "../components/ZikrComponents";
import { formatNumerals, formatRatio, numeralFontFamily } from "../formatting";
import { ScrollArea } from "../components/ui/scroll-area";

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
      className="inline-flex min-w-[56px] items-center justify-center rounded-full border px-4 py-2 text-[11px] font-bold uppercase tracking-[0.08em] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      style={{
        background: active ? "color-mix(in srgb, var(--primary) 18%, var(--card))" : "var(--card)",
        borderColor: active ? "color-mix(in srgb, var(--primary) 45%, transparent)" : "var(--border)",
        color: active ? "var(--primary)" : "var(--muted-foreground)",
      }}
    >
      {label}
    </button>
  );
}

export function ReaderScreen({
  catId,
  idx,
  isArabic,
  isDone,
  completedCount,
  showTransliteration,
  showTranslation,
  onBack,
  onComplete,
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
  showTransliteration: boolean;
  showTranslation: boolean;
  onBack: () => void;
  onComplete: (idx: number) => void;
  onToggleTransliteration: () => void;
  onToggleTranslation: () => void;
  onNext: () => void;
  onPrev: () => void;
}) {
  const azkar = getAzkarByCategory(catId);
  const z = azkar[idx];
  const category = CATEGORIES.find((item) => item.id === catId);
  const language: AppLanguage = isArabic ? "ar" : "en";

  const [benefitOpen, setBenefitOpen] = useState(false);
  const [expandedReading, setExpandedReading] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [speed, setSpeed] = useState<0.75 | 1 | 1.25>(1);
  const [count, setCount] = useState(0);
  const [pulse, setPulse] = useState(0);
  const [flash, setFlash] = useState(false);
  const [complete, setComplete] = useState(false);

  const touchStartX = useRef<number | null>(null);
  const resetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const initialCount = isDone && z ? z.repetitionCount : 0;
    setCount(initialCount);
    setComplete(initialCount >= (z?.repetitionCount ?? 1));
  }, [idx, isDone, z]);

  useEffect(() => {
    return () => {
      if (resetTimer.current) {
        clearTimeout(resetTimer.current);
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
  const completedIncludingActive = completedCount + (complete && !isDone ? 1 : 0);
  const progressPercent = azkar.length > 0 ? Math.round((completedIncludingActive / azkar.length) * 100) : 0;

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
    setFlash(true);

    if (resetTimer.current) {
      clearTimeout(resetTimer.current);
    }

    resetTimer.current = setTimeout(() => {
      setFlash(false);
    }, 140);

    if (next >= z.repetitionCount) {
      setComplete(true);
      setTimeout(() => onComplete(idx), 650);
    }
  };

  const handleReset = () => {
    setCount(0);
    setComplete(false);
    setPulse((value) => value + 1);
  };

  const cycleSpeed = (direction: -1 | 1) => {
    const speeds: Array<0.75 | 1 | 1.25> = [0.75, 1, 1.25];
    const currentIndex = speeds.indexOf(speed);
    const nextIndex = (currentIndex + direction + speeds.length) % speeds.length;
    setSpeed(speeds[nextIndex]);
  };

  const renderReadingContent = (fullPage: boolean) => (
    <div className={`relative space-y-5 ${fullPage ? "px-5 py-5" : "px-5 py-4"}`}>
      {!fullPage && (
        <button
          type="button"
          onClick={() => setExpandedReading(true)}
          aria-label={t(language, "reader.fullView")}
          className="absolute end-0 top-0 inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card text-muted-foreground transition-colors hover:bg-muted active:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Expand size={16} />
        </button>
      )}

      <div className={`space-y-5 ${fullPage ? "" : "pt-10"}`}>
        <p
          className="text-center text-[29px] font-bold leading-[50px] text-foreground"
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

        {showTransliteration && (
          <p className="text-center font-sans text-[14px] italic leading-[22px] text-card-foreground">
            {z.transliteration}
          </p>
        )}

        {showTranslation && (
          <p className="text-center font-sans text-[15px] leading-[24px] text-card-foreground">
            {z.translation}
          </p>
        )}
      </div>

      <div className="rounded-[22px] border border-border bg-card/40">
        <button
          type="button"
          onClick={() => setBenefitOpen((open) => !open)}
          aria-expanded={benefitOpen}
          aria-controls="benefit-content"
          className="flex w-full items-center gap-3 px-4 py-4 text-start focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <div className="text-muted-foreground">
            {benefitOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </div>
          <p className="flex-1 font-sans text-[16px] font-semibold text-foreground">
            {t(language, "reader.benefit")}
          </p>
          <div className="text-muted-foreground">
            <Expand size={16} />
          </div>
        </button>

        {benefitOpen && (
          <div id="benefit-content" className="fade-in border-t border-border px-4 pb-4">
            <p className="pt-3 font-sans text-[14px] leading-[23px] text-card-foreground">
              {z.benefit}
            </p>
            {extraNotes && (
              <div className="mt-4">
                <p className="font-sans text-[11px] font-bold tracking-[0.08em] text-muted-foreground">
                  {t(language, "reader.notes")}
                </p>
                <p className="mt-1 font-sans text-[14px] leading-[23px] text-card-foreground">{extraNotes}</p>
              </div>
            )}
            {z.preferredTiming && (
              <div className="mt-4">
                <p className="font-sans text-[11px] font-bold tracking-[0.08em] text-muted-foreground">
                  {t(language, "reader.timing")}
                </p>
                <p className="mt-1 font-sans text-[14px] leading-[23px] text-card-foreground">{z.preferredTiming}</p>
              </div>
            )}
            {displayCount !== String(z.repetitionCount) && (
              <div className="mt-4">
                <p className="font-sans text-[11px] font-bold tracking-[0.08em] text-muted-foreground">
                  {t(language, "reader.count")}
                </p>
                <p className="mt-1 font-sans text-[14px] leading-[23px] text-card-foreground">{localizedDisplayCount}</p>
              </div>
            )}
            {authenticityNote && (
              <div className="mt-4">
                <p className="font-sans text-[11px] font-bold tracking-[0.08em] text-muted-foreground">
                  {t(language, "reader.authenticity")}
                </p>
                <p className="mt-1 font-sans text-[14px] leading-[23px] text-card-foreground">{authenticityNote}</p>
              </div>
            )}
            {z.hadithText && (
              <div className="mt-4">
                <p className="font-sans text-[11px] font-bold tracking-[0.08em] text-muted-foreground">
                  {t(language, "reader.evidence")}
                </p>
                <p
                  className="mt-1 rounded-xl border border-border bg-background px-3 py-3 text-[15px] leading-[28px] text-foreground"
                  dir="auto"
                  style={{ fontFamily: "'Noto Naskh Arabic', serif" }}
                >
                  {z.hadithText}
                </p>
              </div>
            )}
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span
                className="inline-block rounded-full border px-3 py-1 font-sans text-[11px] font-medium text-card-foreground"
                style={{
                  background: "color-mix(in srgb, var(--secondary) 15%, transparent)",
                  borderColor: "color-mix(in srgb, var(--secondary) 40%, transparent)",
                }}
              >
                {z.sourceReference}
              </span>
              {z.sourceUrl && (
                <a
                  href={z.sourceUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center rounded-full border border-border px-3 py-1 font-sans text-[11px] font-semibold text-primary underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {t(language, "reader.openSource")}
                </a>
              )}
            </div>
          </div>
        )}
      </div>

      <div
        className="flex items-center justify-between gap-2 rounded-[20px] px-4 py-3"
        style={{
          background: "color-mix(in srgb, var(--secondary) 30%, #116f5a)",
          color: "var(--secondary-foreground)",
        }}
      >
        <button
          type="button"
          onClick={() => setMuted((value) => !value)}
          aria-label={muted ? "Unmute audio" : "Mute audio"}
          className="flex h-10 w-10 items-center justify-center rounded-full text-secondary-foreground/90 transition-opacity hover:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {muted ? <VolumeX size={21} /> : <Volume2 size={21} />}
        </button>
        <button
          type="button"
          onClick={() => cycleSpeed(-1)}
          aria-label="Decrease audio speed"
          className="flex h-10 w-10 items-center justify-center rounded-full text-secondary-foreground/90 transition-opacity hover:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <SkipBack size={21} />
        </button>
        <button
          type="button"
          onClick={() => setPlaying((value) => !value)}
          aria-label={playing ? "Pause" : "Play"}
          className="flex h-14 w-14 items-center justify-center rounded-full bg-[#F5EEDF] text-[#1C5B4C] shadow-[0_6px_18px_rgba(0,0,0,0.18)] transition-transform active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {playing ? <Pause size={24} /> : <Play size={24} className="ms-1" />}
        </button>
        <button
          type="button"
          onClick={() => cycleSpeed(1)}
          aria-label="Increase audio speed"
          className="flex h-10 w-10 items-center justify-center rounded-full text-secondary-foreground/90 transition-opacity hover:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <SkipForward size={21} />
        </button>
        <button
          type="button"
          onClick={() => setExpandedReading(true)}
          aria-label={t(language, "reader.fullView")}
          className="flex h-10 w-10 items-center justify-center rounded-full text-secondary-foreground/90 transition-opacity hover:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <MoreHorizontal size={21} />
        </button>
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

        handleSwipe(event.changedTouches[0].clientX - touchStartX.current);
        touchStartX.current = null;
      }}
    >
      <div className="shrink-0 border-b border-border/70 px-4 py-4">
        <div className="grid grid-cols-[44px_1fr_88px] items-center gap-2">
          <button
            onClick={onBack}
            aria-label="Go back"
            className="flex h-11 w-11 items-center justify-center rounded-full text-foreground transition-colors hover:bg-muted active:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <ChevronLeft size={22} className="rtl:-scale-x-100" />
          </button>

          <p className="truncate text-center font-sans text-[18px] font-bold text-foreground">
            {isArabic ? category.nameArabic : category.name}
          </p>

          <div className="flex items-center justify-end gap-1">
            <button
              onClick={onPrev}
              disabled={idx === 0}
              aria-label="Previous Zikr"
              className="flex h-11 w-11 items-center justify-center rounded-full text-muted-foreground transition-colors disabled:opacity-35 hover:bg-muted active:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <ChevronRight size={22} className="rtl:hidden" />
              <ChevronLeft size={22} className="hidden rtl:block" />
            </button>
            <button
              onClick={onNext}
              disabled={idx === azkar.length - 1}
              aria-label="Next Zikr"
              className="flex h-11 w-11 items-center justify-center rounded-full text-muted-foreground transition-colors disabled:opacity-35 hover:bg-muted active:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <ChevronLeft size={22} className="rtl:hidden" />
              <ChevronRight size={22} className="hidden rtl:block" />
            </button>
          </div>
        </div>
      </div>

      <div className="shrink-0 border-b border-border/70 bg-card px-5 py-4">
        <div className="mb-3 flex items-center justify-between gap-3">
          <p className="font-sans text-[15px] font-medium text-muted-foreground">
            {t(language, "reader.progressSummary", {
              done: formatNumerals(completedIncludingActive, language),
              total: formatNumerals(azkar.length, language),
            })}
          </p>
          <p
            className="text-[18px] font-extrabold text-primary"
            dir="ltr"
            style={{ fontFamily: numeralFontFamily(language), fontVariantNumeric: "tabular-nums lining-nums" }}
          >
            {formatNumerals(progressPercent, language)}%
          </p>
        </div>
        <ProgressBar
          value={completedIncludingActive}
          max={azkar.length}
          height={12}
          trackColor="color-mix(in srgb, var(--muted) 78%, var(--card))"
          fillColor="var(--primary)"
          aria-label={t(language, "reader.groupProgress")}
        />
      </div>

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <ScrollArea className="zikr-scroll min-h-0 flex-1">
          {renderReadingContent(false)}
        </ScrollArea>

        <div
          className="shrink-0 border-t border-border/70 bg-[linear-gradient(180deg,rgba(8,16,38,0.98),rgba(8,16,38,1))] px-5 pb-6 pt-5"
          style={{
            minHeight: 316,
            background: flash
              ? "linear-gradient(180deg, color-mix(in srgb, var(--primary) 8%, var(--background)), var(--background))"
              : undefined,
          }}
        >
          {complete ? (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <div className="mb-8 flex h-[224px] w-[224px] items-center justify-center rounded-full bg-primary shadow-[0_0_38px_rgba(215,165,40,0.22)]">
                <Check size={68} className="text-primary-foreground" strokeWidth={2.4} />
              </div>
              <p
                className="text-[44px] font-bold leading-none text-primary"
                style={isArabic ? { fontFamily: "'Noto Naskh Arabic', serif" } : undefined}
              >
                {t(language, "reader.complete")}
              </p>
              <p className="mt-3 font-sans text-[16px] leading-[24px] text-card-foreground">
                {t(language, "reader.autoAdvance")}
              </p>
            </div>
          ) : (
            <div
              role="button"
              tabIndex={0}
              aria-label={`${t(language, "reader.tapAnywhere")} ${localizedRatio}`}
              className="flex h-full cursor-pointer flex-col items-center justify-center rounded-[32px] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring"
              onClick={handleTap}
              onKeyDown={(event) => {
                if (event.key === " " || event.key === "Enter") {
                  event.preventDefault();
                  handleTap();
                }
              }}
            >
              <div className="pointer-events-none relative flex h-[224px] w-[224px] items-center justify-center">
                <PulseRings trigger={pulse} size={224} />
                <CounterRing count={count} total={z.repetitionCount} size={224} />
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <p
                    className="text-[64px] font-extrabold leading-[64px] text-primary"
                    dir="ltr"
                    style={{ fontFamily: numeralFontFamily(language), fontVariantNumeric: "tabular-nums lining-nums" }}
                  >
                    {localizedCount}
                  </p>
                  <p
                    className="mt-3 text-[20px] font-semibold text-card-foreground"
                    dir="ltr"
                    style={{ fontFamily: numeralFontFamily(language), fontVariantNumeric: "tabular-nums lining-nums" }}
                  >
                    {localizedRatio}
                  </p>
                </div>
              </div>

              <p className="mt-6 font-sans text-[18px] font-bold text-foreground">
                {t(language, "reader.tapAnywhere")}
              </p>
              <p className="mt-2 font-sans text-[14px] text-muted-foreground">
                {t(language, "reader.count")}: {localizedDisplayCount}
              </p>
              {remaining > 0 && (
                <p className="mt-3 font-sans text-[15px] font-semibold text-primary">
                  {t(language, "reader.remaining", { count: localizedRemaining })}
                </p>
              )}

              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  handleReset();
                }}
                aria-label={t(language, "reader.resetCounter")}
                className="mt-5 inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 font-sans text-[13px] font-semibold text-card-foreground transition-colors hover:bg-muted active:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <RotateCcw size={14} />
                <span>{t(language, "reader.resetCounter")}</span>
              </button>
            </div>
          )}
        </div>
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
              <p className="truncate font-sans text-[17px] font-bold text-foreground">
                {t(language, "reader.fullView")}
              </p>
              <p className="mt-1 font-sans text-[12px] leading-[18px] text-muted-foreground">
                {t(language, "reader.fullViewHint")}
              </p>
            </div>
          </div>

          <ScrollArea className="zikr-scroll min-h-0 flex-1">
            {renderReadingContent(true)}
          </ScrollArea>
        </div>
      )}
    </div>
  );
}
