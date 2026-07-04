import React, { useEffect, useRef, useState } from "react";
import { SkipBack, SkipForward, Check, Info, ChevronUp, ChevronDown, Play, Pause, RotateCcw } from "lucide-react";
import { t } from "../i18n";
import { CATEGORIES } from "../content/categories";
import { getAzkarByCategory } from "../content/azkar";
import type { AppLanguage, CategoryId } from "../types";
import { Header } from "../components/LayoutShells";
import { ProgressBar } from "../components/ProgressBar";
import { CounterRing, PulseRings, WaveformBars } from "../components/ZikrComponents";
import { formatNumerals, formatRatio, numeralFontFamily } from "../formatting";

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
      className="inline-flex items-center justify-center rounded-full border px-3 py-2 text-[11px] font-bold uppercase tracking-[0.14em] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      style={{
        background: active ? "var(--primary)" : "color-mix(in srgb, var(--card) 88%, transparent)",
        borderColor: active ? "var(--primary)" : "var(--border)",
        color: active ? "var(--primary-foreground)" : "var(--card-foreground)",
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
  const [benefitOpen, setBenefitOpen] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState<0.75 | 1 | 1.25>(1);
  const [count, setCount] = useState(0);
  const [pulse, setPulse] = useState(0);
  const [flash, setFlash] = useState(false);
  const [complete, setComplete] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const resetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const language: AppLanguage = isArabic ? "ar" : "en";
  const category = CATEGORIES.find((item) => item.id === catId);

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

  if (!z) {
    return null;
  }

  const displayCount = z.countLabel ?? String(z.repetitionCount);
  const extraNotes = z.notes && z.notes !== z.benefit ? z.notes : "";
  const authenticityNote = z.authenticityNote && z.authenticityNote !== z.benefit ? z.authenticityNote : "";
  const remaining = Math.max(0, z.repetitionCount - count);
  const localizedDisplayCount = formatNumerals(displayCount, language);
  const localizedCount = formatNumerals(count, language);
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

  const handleReset = () => {
    setCount(0);
    setComplete(false);
    setPulse((value) => value + 1);
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
    }, 120);

    if (next >= z.repetitionCount) {
      setComplete(true);
      setTimeout(() => onComplete(idx), 420);
    }
  };

  return (
    <div
      className="flex h-full flex-col bg-background"
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
      <Header
        title={isArabic ? category?.nameArabic ?? "" : category?.name ?? ""}
        subtitle={t(language, "category.completeSubtitle", {
          done: formatNumerals(completedIncludingActive, language),
          total: formatNumerals(azkar.length, language),
        })}
        onBack={onBack}
        right={
          <div className="flex items-center gap-1">
            <button
              onClick={onPrev}
              disabled={idx === 0}
              aria-label="Previous Zikr"
              className="flex h-9 w-9 items-center justify-center rounded-full transition-colors disabled:opacity-30 hover:bg-muted active:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <SkipBack size={16} className="text-card-foreground rtl:-scale-x-100" />
            </button>
            <button
              onClick={onNext}
              disabled={idx === azkar.length - 1}
              aria-label="Next Zikr"
              className="flex h-9 w-9 items-center justify-center rounded-full transition-colors disabled:opacity-30 hover:bg-muted active:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <SkipForward size={16} className="text-card-foreground rtl:-scale-x-100" />
            </button>
          </div>
        }
      />

      <div className="shrink-0 px-5 pb-3 pt-4">
        <div className="rounded-2xl border border-border bg-card px-4 py-4">
          <div className="mb-3 flex items-end justify-between gap-3">
            <div>
              <p className="font-sans text-[11px] font-bold uppercase tracking-[0.08em] text-primary">
                {t(language, "reader.groupProgress")}
              </p>
              <p className="mt-1 font-sans text-[15px] font-semibold text-card-foreground">
                {t(language, "category.completeSubtitle", {
                  done: formatNumerals(completedIncludingActive, language),
                  total: formatNumerals(azkar.length, language),
                })}
              </p>
            </div>
            <p
              className="text-[28px] font-extrabold leading-none text-primary"
              dir="ltr"
              style={{ fontFamily: numeralFontFamily(language), fontVariantNumeric: "tabular-nums lining-nums" }}
            >
              {formatNumerals(progressPercent, language)}%
            </p>
          </div>
          <ProgressBar
            value={completedIncludingActive}
            max={azkar.length}
            height={10}
            trackColor="color-mix(in srgb, var(--muted) 75%, var(--card))"
            fillColor="var(--primary)"
            aria-label={t(language, "reader.groupProgress")}
          />
        </div>
      </div>

      <div className="flex flex-1 flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto px-5 pb-4">
          <div className="flex flex-col gap-4 pb-4">
            <div className="rounded-2xl border border-border bg-card px-5 py-5">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                <span className="rounded-full border border-border bg-background px-3 py-1.5 font-sans text-[11px] font-bold uppercase tracking-[0.08em] text-card-foreground">
                  {t(language, "reader.title", {
                    index: formatNumerals(idx + 1, language),
                    total: formatNumerals(azkar.length, language),
                  })}
                </span>
                <span
                  className="rounded-full border border-primary/30 bg-primary/10 px-3 py-1.5 text-[12px] font-bold text-primary"
                  style={{ fontFamily: numeralFontFamily(language), fontVariantNumeric: "tabular-nums lining-nums" }}
                >
                  {t(language, "reader.count")}: {localizedDisplayCount}
                </span>
              </div>

              {isDone && (
                <div className="mb-4 flex items-center gap-2 border-b border-border pb-3">
                  <Check size={14} className="text-primary" />
                  <span className="font-sans text-[11px] font-bold uppercase tracking-[0.08em] text-primary">
                    {t(language, "reader.completed")}
                  </span>
                </div>
              )}

              <p
                className="mb-5 text-center text-[28px] font-bold leading-[52px] text-foreground"
                dir="rtl"
                style={{ fontFamily: "'Noto Naskh Arabic', serif" }}
              >
                {z.arabicText}
              </p>

              <div className="mb-4 flex flex-wrap justify-center gap-2">
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
                <p className="mb-3 text-center font-sans text-[13px] italic leading-[20px] text-card-foreground">
                  {z.transliteration}
                </p>
              )}

              {showTranslation && (
                <p className="text-center font-sans text-[14px] leading-[22px] text-card-foreground">
                  {z.translation}
                </p>
              )}
            </div>

            <button
              onClick={() => setBenefitOpen((open) => !open)}
              aria-expanded={benefitOpen}
              aria-controls="benefit-content"
              className="w-full rounded-xl border border-border bg-card text-start transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <div className="flex items-center gap-3 p-4">
                <div
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
                  style={{ background: "color-mix(in srgb, var(--primary) 15%, transparent)" }}
                >
                  <Info size={14} className="text-primary" />
                </div>
                <p className="flex-1 font-sans text-[13px] font-semibold text-card-foreground">
                  {t(language, "reader.benefit")}
                </p>
                <div className="text-card-foreground">
                  {benefitOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </div>
              </div>
              {benefitOpen && (
                <div id="benefit-content" className="fade-in border-t border-border px-4 pb-4">
                  <p className="pt-3 font-sans text-[13px] leading-[21px] text-card-foreground">
                    {z.benefit}
                  </p>
                  {extraNotes && (
                    <div className="mt-4">
                      <p className="font-sans text-[11px] font-bold uppercase tracking-[0.08em] text-muted-foreground">
                        {t(language, "reader.notes")}
                      </p>
                      <p className="mt-1 font-sans text-[13px] leading-[21px] text-card-foreground">{extraNotes}</p>
                    </div>
                  )}
                  {z.preferredTiming && (
                    <div className="mt-4">
                      <p className="font-sans text-[11px] font-bold uppercase tracking-[0.08em] text-muted-foreground">
                        {t(language, "reader.timing")}
                      </p>
                      <p className="mt-1 font-sans text-[13px] leading-[21px] text-card-foreground">{z.preferredTiming}</p>
                    </div>
                  )}
                  {displayCount !== String(z.repetitionCount) && (
                    <div className="mt-4">
                      <p className="font-sans text-[11px] font-bold uppercase tracking-[0.08em] text-muted-foreground">
                        {t(language, "reader.count")}
                      </p>
                      <p className="mt-1 font-sans text-[13px] leading-[21px] text-card-foreground">{localizedDisplayCount}</p>
                    </div>
                  )}
                  {authenticityNote && (
                    <div className="mt-4">
                      <p className="font-sans text-[11px] font-bold uppercase tracking-[0.08em] text-muted-foreground">
                        {t(language, "reader.authenticity")}
                      </p>
                      <p className="mt-1 font-sans text-[13px] leading-[21px] text-card-foreground">{authenticityNote}</p>
                    </div>
                  )}
                  {z.hadithText && (
                    <div className="mt-4">
                      <p className="font-sans text-[11px] font-bold uppercase tracking-[0.08em] text-muted-foreground">
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
            </button>

            <div
              className="flex items-center gap-3 rounded-xl border px-4 py-3"
              style={{
                background: "color-mix(in srgb, var(--secondary) 15%, transparent)",
                borderColor: "color-mix(in srgb, var(--secondary) 40%, transparent)",
              }}
            >
              <button
                onClick={() => setPlaying((value) => !value)}
                aria-label={playing ? "Pause" : "Play"}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-secondary transition-all active:scale-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {playing ? <Pause size={15} color="white" /> : <Play size={15} color="white" className="ms-0.5" />}
              </button>
              <WaveformBars active={playing} />
              <div className="flex-1" />
              <button
                onClick={() => setSpeed((value) => (value === 0.75 ? 1 : value === 1 ? 1.25 : 0.75))}
                aria-label={t(language, "reader.audioSpeed")}
                className="rounded-lg border px-2 py-1 text-[11px] font-bold text-secondary"
                style={{
                  fontFamily: "DM Mono, monospace",
                  background: "color-mix(in srgb, var(--secondary) 30%, transparent)",
                  borderColor: "color-mix(in srgb, var(--secondary) 50%, transparent)",
                }}
              >
                {speed}x
              </button>
            </div>
          </div>
        </div>

        <div className="shrink-0 border-t border-border bg-card/35 px-4 pb-4 pt-3">
          <div
            role="button"
            tabIndex={0}
            aria-label={`${t(language, "reader.tapAnywhere")} ${localizedRatio}`}
            className="relative rounded-[28px] border border-border bg-card px-4 py-4 shadow-[0_10px_24px_rgba(0,0,0,0.12)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring"
            onClick={handleTap}
            onKeyDown={(event) => {
              if (event.key === " " || event.key === "Enter") {
                event.preventDefault();
                handleTap();
              }
            }}
            style={{
              background: flash ? "color-mix(in srgb, var(--primary) 6%, var(--card))" : "var(--card)",
              transition: "background 120ms ease-out",
            }}
          >
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <p className="font-sans text-[11px] font-bold uppercase tracking-[0.1em] text-primary">
                  {t(language, "reader.counterReady")}
                </p>
                <p className="mt-1 font-sans text-[20px] font-extrabold leading-[24px] text-foreground">
                  {t(language, "reader.tapAnywhere")}
                </p>
                <p className="mt-2 max-w-[220px] font-sans text-[13px] leading-[20px] text-card-foreground">
                  {complete ? t(language, "reader.complete") : t(language, "reader.autoAdvance")}
                </p>
              </div>
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  handleReset();
                }}
                aria-label={t(language, "reader.resetCounter")}
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-border bg-background text-card-foreground transition-colors hover:bg-muted active:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <RotateCcw size={16} />
              </button>
            </div>

            <div className="flex items-center justify-between gap-4">
              <div className="min-w-0 flex-1">
                <p
                  className="text-[42px] font-extrabold leading-[42px] text-primary"
                  dir="ltr"
                  style={{ fontFamily: numeralFontFamily(language), fontVariantNumeric: "tabular-nums lining-nums" }}
                >
                  {localizedCount}
                </p>
                <p
                  className="mt-2 text-[18px] font-semibold text-card-foreground"
                  dir="ltr"
                  style={{ fontFamily: numeralFontFamily(language), fontVariantNumeric: "tabular-nums lining-nums" }}
                >
                  {localizedRatio}
                </p>
                <p className="mt-2 font-sans text-[12px] leading-[18px] text-muted-foreground">
                  {t(language, "reader.count")}: {localizedDisplayCount}
                </p>
                {!complete && remaining > 0 && (
                  <p className="mt-2 font-sans text-[14px] font-semibold text-primary">
                    {t(language, "reader.remaining", { count: localizedRemaining })}
                  </p>
                )}
              </div>

              <div className="pointer-events-none relative flex h-[144px] w-[144px] items-center justify-center">
                <PulseRings trigger={pulse} size={144} />
                <CounterRing count={count} total={z.repetitionCount} size={144} />
                <div className="absolute inset-0 flex items-center justify-center">
                  {complete ? (
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary">
                      <Check size={22} className="text-primary-foreground" />
                    </div>
                  ) : (
                    <p
                      className="text-[30px] font-extrabold leading-none text-primary"
                      dir="ltr"
                      style={{ fontFamily: numeralFontFamily(language), fontVariantNumeric: "tabular-nums lining-nums" }}
                    >
                      {localizedCount}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
