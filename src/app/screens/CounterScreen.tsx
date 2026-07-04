import React, { useState, useEffect, useRef } from "react";
import { ChevronLeft, RotateCcw, Check, SkipBack, SkipForward } from "lucide-react";
import { CATEGORIES } from "../content/categories";
import { getAzkarByCategory } from "../content/azkar";
import type { CategoryId } from "../types";
import { PulseRings, CounterRing } from "../components/ZikrComponents";

export function CounterScreen({ catId, idx, initialCount, onBack, onComplete, onPrev, onNext, isArabic }:
  { catId: CategoryId; idx: number; initialCount: number;
    onBack: () => void; onComplete: (idx: number) => void;
    onPrev: () => void; onNext: () => void; isArabic?: boolean }) {
  const azkar = getAzkarByCategory(catId);
  const z = azkar[idx];
  const [count, setCount] = useState(initialCount);
  const [pulse, setPulse] = useState(0);
  const [flash, setFlash] = useState(false);
  const [complete, setComplete] = useState(initialCount >= (z?.repetitionCount ?? 1));
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const touchStartX = useRef<number | null>(null);

  // Reset when zikr changes
  useEffect(() => {
    setCount(initialCount);
    setComplete(initialCount >= (z?.repetitionCount ?? 1));
  }, [idx, initialCount, z?.repetitionCount]);

  if (!z) return null;

  const handleTap = () => {
    if (complete) return;
    const next = count + 1;
    setCount(next);
    setPulse(p => p + 1);
    setFlash(true);
    setTimeout(() => setFlash(false), 120);
    if (next >= z.repetitionCount) {
      setComplete(true);
      setTimeout(() => onComplete(idx), 500);
    }
  };

  const handleLongPressStart = () => {
    longPressTimer.current = setTimeout(() => {
      setCount(0);
      setComplete(false);
      setPulse(p => p + 1);
    }, 600);
  };

  const handleLongPressEnd = () => {
    if (longPressTimer.current) clearTimeout(longPressTimer.current);
  };

  const handleSwipe = (dx: number) => {
    if (isArabic) {
      if (dx > 60) onNext();
      else if (dx < -60) onPrev();
    } else {
      if (dx > 60) onPrev();
      else if (dx < -60) onNext();
    }
  };

  const remaining = z.repetitionCount - count;

  return (
    <div className="flex flex-col h-full select-none bg-background"
      onTouchStart={e => { touchStartX.current = e.touches[0].clientX; }}
      onTouchEnd={e => { if (touchStartX.current !== null) { handleSwipe(e.changedTouches[0].clientX - touchStartX.current); touchStartX.current = null; } }}>

      {/* Top bar — thin, non-interactive feel */}
      <div className="flex items-center justify-between px-5 pt-4 pb-3 shrink-0">
        <button onClick={onBack}
          aria-label="Go back"
          className="flex items-center justify-center rounded-full bg-card hover:bg-muted active:bg-muted w-11 h-11 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
          <ChevronLeft size={20} className="text-foreground rtl:-scale-x-100" />
        </button>
        <div className="text-center">
          <p className="text-[12px] text-muted-foreground font-sans font-bold uppercase tracking-[0.08em]">
            {CATEGORIES.find(c => c.id === catId)?.name}
          </p>
          <p className="text-[14px] text-secondary-foreground font-sans font-semibold">
            Zikr {idx + 1} of {azkar.length}
          </p>
        </div>
        <button onClick={() => { setCount(0); setComplete(false); }}
          aria-label="Reset counter"
          className="flex items-center justify-center rounded-full bg-card hover:bg-muted active:bg-muted w-11 h-11 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
          <RotateCcw size={16} className="text-muted-foreground" />
        </button>
      </div>

      {/* Arabic snippet */}
      <div className="px-6 pb-4 shrink-0">
        <p className="text-center text-[18px] text-muted-foreground leading-[32px]"
          style={{ fontFamily: "'Noto Naskh Arabic', serif", direction: "rtl" }}>
          {z.arabicText.split("\n")[0]}
        </p>
      </div>

      {/* Full-screen tap zone */}
      <div
        role="button"
        tabIndex={0}
        aria-label={`Tap to count. Current count ${count} of ${z.repetitionCount}`}
        className="flex-1 flex flex-col items-center justify-center relative cursor-pointer focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring inset-ring-0 rounded-3xl mx-4"
        onClick={handleTap}
        onKeyDown={(e) => { if (e.key === ' ' || e.key === 'Enter') handleTap(); }}
        onMouseDown={handleLongPressStart}
        onMouseUp={handleLongPressEnd}
        onMouseLeave={handleLongPressEnd}
        onTouchStart={handleLongPressStart}
        onTouchEnd={handleLongPressEnd}
        style={{ background: flash ? "color-mix(in srgb, var(--primary) 8%, transparent)" : "transparent", transition: "background 80ms" }}>

        <PulseRings trigger={pulse} />

        {/* Ring + count */}
        <div className="relative flex items-center justify-center z-10 pointer-events-none">
          <CounterRing count={count} total={z.repetitionCount} size={200} />
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            {complete ? (
              <>
                <div className="flex items-center justify-center rounded-full mb-2 w-[52px] h-[52px] bg-primary">
                  <Check size={26} className="text-primary-foreground" />
                </div>
                <p className="text-[14px] text-primary font-sans font-bold">Complete!</p>
              </>
            ) : (
              <>
                <p className="text-[56px] font-extrabold text-primary leading-[60px]" style={{ fontFamily: "DM Mono, monospace" }}>{count}</p>
                <p className="text-[16px] text-muted-foreground" style={{ fontFamily: "DM Mono, monospace" }}>of {z.repetitionCount}</p>
              </>
            )}
          </div>
        </div>

        {/* Tap hint */}
        {!complete && (
          <p className="mt-8 z-10 text-[10px] text-muted-foreground font-sans font-bold uppercase tracking-[0.15em] pointer-events-none">
            Tap anywhere to count
          </p>
        )}
        {!complete && remaining <= 5 && remaining > 0 && (
          <p className="mt-2 z-10 text-[13px] text-primary font-sans font-semibold pointer-events-none">
            {remaining} more {remaining === 1 ? "time" : "times"}
          </p>
        )}
        {!complete && (
          <p className="absolute bottom-4 z-10 text-[10px] text-muted font-sans pointer-events-none">
            Hold to reset
          </p>
        )}
      </div>

      {/* Bottom prev/next nav */}
      <div className="flex items-center justify-between px-6 py-4 shrink-0 border-t border-border mt-4">
        <button onClick={onPrev} disabled={idx === 0}
          aria-label="Previous Zikr"
          className="flex items-center gap-2 rounded-xl px-4 py-3 transition-all active:scale-95 bg-card disabled:opacity-30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
          <SkipBack size={16} className="text-secondary-foreground rtl:-scale-x-100" />
          <span className="text-[13px] text-secondary-foreground font-sans font-semibold">Prev</span>
        </button>

        {/* Dot indicators */}
        <div className="flex gap-1.5" aria-hidden="true">
          {azkar.slice(Math.max(0, idx - 2), Math.min(azkar.length, idx + 3)).map((_, di) => {
            const absIdx = Math.max(0, idx - 2) + di;
            return (
              <div key={absIdx} className="rounded-full transition-all h-[6px]"
                style={{ width: absIdx === idx ? 16 : 6, background: absIdx === idx ? "var(--primary)" : "var(--muted)" }} />
            );
          })}
        </div>

        <button onClick={onNext} disabled={idx === azkar.length - 1}
          aria-label="Next Zikr"
          className="flex items-center gap-2 rounded-xl px-4 py-3 transition-all active:scale-95 bg-card disabled:opacity-30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
          <span className="text-[13px] text-secondary-foreground font-sans font-semibold">Next</span>
          <SkipForward size={16} className="text-secondary-foreground rtl:-scale-x-100" />
        </button>
      </div>
    </div>
  );
}
