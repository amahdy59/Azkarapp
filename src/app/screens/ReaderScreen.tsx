import React, { useState, useRef } from "react";
import { SkipBack, SkipForward, Check, Info, ChevronUp, ChevronDown, Play, Pause } from "lucide-react";
import { CATEGORIES } from "../content/categories";
import { getAzkarByCategory } from "../content/azkar";
import type { CategoryId } from "../types";
import { Header } from "../components/LayoutShells";
import { CounterRing, WaveformBars } from "../components/ZikrComponents";

export function ReaderScreen({ catId, idx, isArabic, isDone, onBack, onCounter, onNext, onPrev }:
  { catId: CategoryId; idx: number; isArabic: boolean; isDone: boolean;
    onBack: () => void; onCounter: () => void; onNext: () => void; onPrev: () => void }) {
  const azkar = getAzkarByCategory(catId);
  const z = azkar[idx];
  const [benefitOpen, setBenefitOpen] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState<0.75 | 1 | 1.25>(1);
  const touchStartX = useRef<number | null>(null);

  if (!z) return null;

  const handleSwipe = (dx: number) => {
    // Basic swipe logic; negative dx implies moving left/forward
    // Arabic users might expect reversed swipe direction for 'next'
    if (isArabic) {
      if (dx > 60) onNext();
      else if (dx < -60) onPrev();
    } else {
      if (dx > 60) onPrev();
      else if (dx < -60) onNext();
    }
  };

  return (
    <div className="flex flex-col h-full bg-background"
      onTouchStart={e => { touchStartX.current = e.touches[0].clientX; }}
      onTouchEnd={e => { if (touchStartX.current !== null) { handleSwipe(e.changedTouches[0].clientX - touchStartX.current); touchStartX.current = null; } }}>

      {/* Header */}
      <Header title={isArabic ? `ذكر ${idx + 1} من ${azkar.length}` : `Zikr ${idx + 1} of ${azkar.length}`} subtitle={isArabic ? CATEGORIES.find(c=>c.id===catId)?.nameArabic : CATEGORIES.find(c=>c.id===catId)?.name}
        onBack={onBack}
        right={
          <div className="flex items-center gap-1">
            <button onClick={onPrev} disabled={idx === 0}
              aria-label="Previous Zikr"
              className="flex items-center justify-center rounded-full transition-colors w-9 h-9 disabled:opacity-30 hover:bg-muted active:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
              <SkipBack size={16} className="text-muted-foreground rtl:-scale-x-100" />
            </button>
            <button onClick={onNext} disabled={idx === azkar.length - 1}
              aria-label="Next Zikr"
              className="flex items-center justify-center rounded-full transition-colors w-9 h-9 disabled:opacity-30 hover:bg-muted active:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
              <SkipForward size={16} className="text-muted-foreground rtl:-scale-x-100" />
            </button>
          </div>
        }
      />

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto px-5 py-5 flex flex-col gap-4">
        {/* Arabic text card */}
        <div className="rounded-2xl px-5 py-6 bg-card border border-border">
          {isDone && (
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-border">
              <Check size={14} className="text-primary" />
              <span className="text-[11px] text-primary font-sans font-bold uppercase tracking-[0.08em]">Completed</span>
            </div>
          )}
          {/* Arabic */}
          <p className="text-center mb-4 text-[28px] font-bold text-foreground leading-[52px]" dir="rtl"
            style={{ fontFamily: "'Noto Naskh Arabic', serif" }}>
            {z.arabicText}
          </p>
          {/* Transliteration */}
          <p className="text-center mb-3 text-[13px] text-muted-foreground font-sans italic leading-[20px]">
            {z.transliteration}
          </p>
          {/* Translation */}
          <p className="text-center text-[14px] text-secondary-foreground font-sans leading-[22px]">
            {z.translation}
          </p>
        </div>

        {/* Benefit accordion */}
        <button onClick={() => setBenefitOpen(o => !o)}
          aria-expanded={benefitOpen}
          aria-controls="benefit-content"
          className="w-full rounded-xl text-start transition-colors bg-card border border-border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
          <div className="flex items-center gap-3 p-4">
            <div className="flex items-center justify-center rounded-lg shrink-0 w-8 h-8"
              style={{ background: "color-mix(in srgb, var(--primary) 15%, transparent)" }}>
              <Info size={14} className="text-primary" />
            </div>
            <p className="text-[13px] font-semibold text-foreground font-sans flex-1">Benefit & Virtue</p>
            <div className="text-muted-foreground">
              {benefitOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </div>
          </div>
          {benefitOpen && (
            <div id="benefit-content" className="px-4 pb-4 fade-in border-t border-border">
              <p className="pt-3 text-[13px] text-secondary-foreground font-sans leading-[21px]">
                {z.benefit}
              </p>
              <span className="inline-block mt-3 rounded-full px-3 py-1 text-[11px] text-secondary font-medium font-sans border"
                style={{ background: "color-mix(in srgb, var(--secondary) 15%, transparent)", borderColor: "color-mix(in srgb, var(--secondary) 40%, transparent)" }}>
                {z.sourceReference}
              </span>
            </div>
          )}
        </button>

        {/* Audio player */}
        <div className="rounded-xl px-4 py-3 flex items-center gap-3 border" style={{ background: "color-mix(in srgb, var(--secondary) 15%, transparent)", borderColor: "color-mix(in srgb, var(--secondary) 40%, transparent)" }}>
          <button onClick={() => setPlaying(p => !p)}
            aria-label={playing ? "Pause" : "Play"}
            className="flex items-center justify-center rounded-full shrink-0 transition-all active:scale-90 w-10 h-10 bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
            {playing ? <Pause size={15} color="white" /> : <Play size={15} color="white" className="ms-0.5" />}
          </button>
          <WaveformBars active={playing} />
          <div className="flex-1" />
          <button onClick={() => setSpeed(s => s === 0.75 ? 1 : s === 1 ? 1.25 : 0.75)}
            aria-label="Toggle playback speed"
            className="rounded-lg px-2 py-1 text-[11px] text-secondary font-bold border"
            style={{ fontFamily: "DM Mono, monospace", background: "color-mix(in srgb, var(--secondary) 30%, transparent)", borderColor: "color-mix(in srgb, var(--secondary) 50%, transparent)" }}>
            {speed}×
          </button>
        </div>
      </div>

      {/* Counter zone — bottom tap strip */}
      <button onClick={onCounter}
        aria-label="Open counter"
        className="shrink-0 flex flex-col items-center justify-center gap-2 w-full transition-all active:opacity-80 h-[100px] bg-card border-t border-border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
        <div className="flex items-center gap-3">
          <CounterRing count={isDone ? z.repetitionCount : 0} total={z.repetitionCount} size={52} />
          <div className="text-start">
            <p className="text-[22px] font-extrabold text-primary leading-[28px]" style={{ fontFamily: "DM Mono, monospace" }}>
              {isDone ? z.repetitionCount : 0}
              <span className="text-[13px] text-muted-foreground font-normal"> / {z.repetitionCount}</span>
            </p>
            <p className="text-[10px] text-muted-foreground font-sans font-bold uppercase tracking-[0.1em]">
              {isDone ? "✓ Complete — tap to redo" : "Tap to count"}
            </p>
          </div>
        </div>
      </button>
    </div>
  );
}
