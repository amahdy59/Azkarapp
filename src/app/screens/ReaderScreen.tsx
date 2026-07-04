import React, { useRef, useState } from "react";
import { SkipBack, SkipForward, Check, Info, ChevronUp, ChevronDown, Play, Pause } from "lucide-react";
import { t } from "../i18n";
import { CATEGORIES } from "../content/categories";
import { getAzkarByCategory } from "../content/azkar";
import type { AppLanguage, CategoryId } from "../types";
import { Header } from "../components/LayoutShells";
import { CounterRing, WaveformBars } from "../components/ZikrComponents";

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
        color: active ? "var(--primary-foreground)" : "var(--muted-foreground)",
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
  showTransliteration,
  showTranslation,
  onBack,
  onCounter,
  onToggleTransliteration,
  onToggleTranslation,
  onNext,
  onPrev,
}: {
  catId: CategoryId;
  idx: number;
  isArabic: boolean;
  isDone: boolean;
  showTransliteration: boolean;
  showTranslation: boolean;
  onBack: () => void;
  onCounter: () => void;
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
  const touchStartX = useRef<number | null>(null);
  const language: AppLanguage = isArabic ? "ar" : "en";
  const category = CATEGORIES.find((item) => item.id === catId);

  if (!z) {
    return null;
  }

  const displayCount = z.countLabel ?? String(z.repetitionCount);
  const extraNotes = z.notes && z.notes !== z.benefit ? z.notes : "";
  const authenticityNote = z.authenticityNote && z.authenticityNote !== z.benefit ? z.authenticityNote : "";

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
        title={t(language, "reader.title", { index: idx + 1, total: azkar.length })}
        subtitle={isArabic ? category?.nameArabic : category?.name}
        onBack={onBack}
        right={
          <div className="flex items-center gap-1">
            <button
              onClick={onPrev}
              disabled={idx === 0}
              aria-label="Previous Zikr"
              className="flex h-9 w-9 items-center justify-center rounded-full transition-colors disabled:opacity-30 hover:bg-muted active:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <SkipBack size={16} className="text-muted-foreground rtl:-scale-x-100" />
            </button>
            <button
              onClick={onNext}
              disabled={idx === azkar.length - 1}
              aria-label="Next Zikr"
              className="flex h-9 w-9 items-center justify-center rounded-full transition-colors disabled:opacity-30 hover:bg-muted active:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <SkipForward size={16} className="text-muted-foreground rtl:-scale-x-100" />
            </button>
          </div>
        }
      />

      <div className="flex flex-1 flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto px-5 py-5">
          <div className="flex flex-col gap-4">
            <div className="rounded-2xl border border-border bg-card px-5 py-6">
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
                  active={showTransliteration}
                  label="TR"
                  onClick={onToggleTransliteration}
                  ariaLabel={t(language, "reader.toggleTransliteration")}
                />
                <TogglePill
                  active={showTranslation}
                  label="EN"
                  onClick={onToggleTranslation}
                  ariaLabel={t(language, "reader.toggleTranslation")}
                />
              </div>

              {showTransliteration && (
                <p className="mb-3 text-center font-sans text-[13px] italic leading-[20px] text-muted-foreground">
                  {z.transliteration}
                </p>
              )}

              {showTranslation && (
                <p className="text-center font-sans text-[14px] leading-[22px] text-secondary-foreground">
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
                <p className="flex-1 font-sans text-[13px] font-semibold text-foreground">
                  {t(language, "reader.benefit")}
                </p>
                <div className="text-muted-foreground">
                  {benefitOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </div>
              </div>
              {benefitOpen && (
                <div id="benefit-content" className="fade-in border-t border-border px-4 pb-4">
                  <p className="pt-3 font-sans text-[13px] leading-[21px] text-secondary-foreground">
                    {z.benefit}
                  </p>
                  {extraNotes && (
                    <div className="mt-4">
                      <p className="font-sans text-[11px] font-bold uppercase tracking-[0.08em] text-muted-foreground">
                        {t(language, "reader.notes")}
                      </p>
                      <p className="mt-1 font-sans text-[13px] leading-[21px] text-secondary-foreground">{extraNotes}</p>
                    </div>
                  )}
                  {z.preferredTiming && (
                    <div className="mt-4">
                      <p className="font-sans text-[11px] font-bold uppercase tracking-[0.08em] text-muted-foreground">
                        {t(language, "reader.timing")}
                      </p>
                      <p className="mt-1 font-sans text-[13px] leading-[21px] text-secondary-foreground">{z.preferredTiming}</p>
                    </div>
                  )}
                  {displayCount !== String(z.repetitionCount) && (
                    <div className="mt-4">
                      <p className="font-sans text-[11px] font-bold uppercase tracking-[0.08em] text-muted-foreground">
                        {t(language, "reader.count")}
                      </p>
                      <p className="mt-1 font-sans text-[13px] leading-[21px] text-secondary-foreground">{displayCount}</p>
                    </div>
                  )}
                  {authenticityNote && (
                    <div className="mt-4">
                      <p className="font-sans text-[11px] font-bold uppercase tracking-[0.08em] text-muted-foreground">
                        {t(language, "reader.authenticity")}
                      </p>
                      <p className="mt-1 font-sans text-[13px] leading-[21px] text-secondary-foreground">{authenticityNote}</p>
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
                      className="inline-block rounded-full border px-3 py-1 font-sans text-[11px] font-medium text-secondary"
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

        <button
          onClick={onCounter}
          aria-label={t(language, "reader.openCounter")}
          className="shrink-0 border-t border-border bg-card/50 px-4 py-4 text-start transition-all active:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <div className="rounded-[28px] border border-border bg-card px-5 py-5">
            <div className="flex items-center justify-between gap-4">
              <div className="min-w-0 flex-1">
                <p className="font-sans text-[11px] font-bold uppercase tracking-[0.12em] text-primary">
                  {t(language, isDone ? "reader.counterReadyComplete" : "reader.counterReady")}
                </p>
                <p className="mt-2 font-sans text-[22px] font-extrabold leading-[28px] text-foreground">
                  {t(language, "reader.tapAnywhere")}
                </p>
                <p className="mt-2 font-sans text-[13px] leading-[20px] text-secondary-foreground">
                  {t(language, isDone ? "reader.tapToRedo" : "reader.openCounterHint")}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <CounterRing count={isDone ? z.repetitionCount : 0} total={z.repetitionCount} size={64} />
                <div className="text-end">
                  <p
                    className="text-[22px] font-extrabold leading-[28px] text-primary"
                    style={{ fontFamily: "DM Mono, monospace" }}
                  >
                    {isDone ? z.repetitionCount : 0}
                  </p>
                  <p className="max-w-[120px] font-sans text-[12px] text-muted-foreground">/ {displayCount}</p>
                </div>
              </div>
            </div>
          </div>
        </button>
      </div>
    </div>
  );
}
