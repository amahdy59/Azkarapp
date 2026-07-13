import React, { useEffect, useRef, useState } from "react";
import { ArrowPrevious, RotateCcw, Check, SkipBack, SkipForward } from "../components/icons";
import { t } from "../i18n";
import { CATEGORIES } from "../content/categories";
import { getAzkarByCategory } from "../content/azkar";
import type { AppLanguage, CategoryId } from "../types";
import { formatNumerals, formatRatio, numeralFontFamily } from "../formatting";
import { PulseRings, CounterRing } from "../components/ZikrComponents";

export function CounterScreen({
  catId,
  idx,
  initialCount,
  onBack,
  onComplete,
  onPrev,
  onNext,
  isArabic = false,
  showTransliteration,
  showTranslation,
}: {
  catId: CategoryId;
  idx: number;
  initialCount: number;
  onBack: () => void;
  onComplete: (idx: number) => void;
  onPrev: () => void;
  onNext: () => void;
  isArabic?: boolean;
  showTransliteration: boolean;
  showTranslation: boolean;
}) {
  const azkar = getAzkarByCategory(catId);
  const z = azkar[idx];
  const [count, setCount] = useState(initialCount);
  const [pulse, setPulse] = useState(0);
  const [flash, setFlash] = useState(false);
  const [complete, setComplete] = useState(initialCount >= (z?.repetitionCount ?? 1));
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const touchStartX = useRef<number | null>(null);
  const language: AppLanguage = isArabic ? "ar" : "en";
  const category = CATEGORIES.find((item) => item.id === catId);

  useEffect(() => {
    setCount(initialCount);
    setComplete(initialCount >= (z?.repetitionCount ?? 1));
  }, [idx, initialCount, z?.repetitionCount]);

  if (!z) {
    return null;
  }

  const displayCount = z.countLabel ?? String(z.repetitionCount);
  const remaining = z.repetitionCount - count;
  const localizedCount = formatNumerals(count, language);
  const localizedDisplayCount = formatNumerals(displayCount, language);
  const localizedRemaining = formatNumerals(remaining, language);
  const localizedRatio = formatRatio(count, z.repetitionCount, language);

  const handleTap = () => {
    if (complete) {
      return;
    }

    const next = count + 1;
    setCount(next);
    setPulse((value) => value + 1);
    setFlash(true);
    setTimeout(() => setFlash(false), 100);

    if (next >= z.repetitionCount) {
      setComplete(true);
      setTimeout(() => onComplete(idx), 500);
    }
  };

  const handleLongPressStart = () => {
    longPressTimer.current = setTimeout(() => {
      setCount(0);
      setComplete(false);
      setPulse((value) => value + 1);
    }, 700);
  };

  const handleLongPressEnd = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
    }
  };

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
      className="flex h-full select-none flex-col bg-background"
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
        if (touch) {
          handleSwipe(touch.clientX - touchStartX.current);
        }
        touchStartX.current = null;
      }}
    >
      <div className="shrink-0 px-5 pb-3 pt-4">
        <div className="flex items-center justify-between">
          <button
            onClick={onBack}
            aria-label="Go back"
            className="flex h-11 w-11 items-center justify-center rounded-full bg-card hover:bg-muted active:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <ArrowPrevious size={20} className="text-foreground" />
          </button>

          <div className="text-center">
            <p className="font-sans text-[13px] font-bold uppercase tracking-[0.08em] text-muted-foreground">
              {isArabic ? category?.nameArabic : category?.name}
            </p>
            <p className="font-sans text-[15px] font-semibold text-card-foreground">
              {t(language, "reader.title", {
                index: formatNumerals(idx + 1, language),
                total: formatNumerals(azkar.length, language),
              })}
            </p>
          </div>

          <button
            onClick={() => {
              setCount(0);
              setComplete(false);
            }}
            aria-label={t(language, "reader.resetCounter")}
            className="flex h-11 w-11 items-center justify-center rounded-full bg-card hover:bg-muted active:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <RotateCcw size={16} className="text-muted-foreground" />
          </button>
        </div>
      </div>

      <div className="shrink-0 px-6 pb-4">
        <div className="rounded-2xl border border-border bg-card px-4 py-4">
          <p className="zikr-text text-center text-[18px] leading-[32px] text-foreground" style={{ direction: "rtl" }}>
            {z.arabicText}
          </p>
          {showTransliteration && (
            <p className="mt-3 text-center font-sans text-[13px] italic leading-[20px] text-muted-foreground">
              {z.transliteration}
            </p>
          )}
          {showTranslation && (
            <p className="mt-3 text-center font-sans text-[14px] leading-[22px] text-card-foreground">
              {z.translation}
            </p>
          )}
        </div>
      </div>

      <button
        type="button"
        aria-label={`${t(language, "reader.tapAnywhere")} ${localizedRatio}${displayCount !== String(z.repetitionCount) ? `. ${localizedDisplayCount}` : ""}`}
        className="relative mx-4 flex flex-1 cursor-pointer flex-col items-center justify-center rounded-3xl bg-transparent p-0 text-inherit focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring"
        onClick={handleTap}
        onMouseDown={handleLongPressStart}
        onMouseUp={handleLongPressEnd}
        onMouseLeave={handleLongPressEnd}
        onTouchStart={handleLongPressStart}
        onTouchEnd={handleLongPressEnd}
        style={{
          background: flash ? "color-mix(in srgb, var(--primary) 6%, transparent)" : "transparent",
          transition: "background 100ms ease-out",
        }}
      >
        <PulseRings trigger={pulse} size={200} />

        <div className="pointer-events-none relative z-10 flex items-center justify-center">
          <CounterRing count={count} total={z.repetitionCount} size={200} />
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            {complete ? (
              <div className="flex h-[52px] w-[52px] items-center justify-center rounded-full bg-primary">
                <Check size={26} className="text-primary-foreground" />
              </div>
            ) : (
              <>
                <p
                  className="text-[64px] font-extrabold leading-[64px] text-primary"
                  dir="ltr"
                  style={{ fontFamily: numeralFontFamily(language), fontVariantNumeric: "tabular-nums lining-nums" }}
                >
                  {localizedCount}
                </p>
                <p
                  className="max-w-[220px] text-center text-[18px] font-semibold text-card-foreground"
                  dir="ltr"
                  style={{ fontFamily: numeralFontFamily(language), fontVariantNumeric: "tabular-nums lining-nums" }}
                >
                  {localizedRatio}
                </p>
              </>
            )}
          </div>
        </div>

        {!complete && (
          <p className="pointer-events-none z-10 mt-8 font-sans text-[12px] font-bold uppercase tracking-[0.12em] text-card-foreground">
            {t(language, "reader.tapAnywhere")}
          </p>
        )}
        {!complete && remaining <= 5 && remaining > 0 && (
          <p className="pointer-events-none z-10 mt-2 font-sans text-[14px] font-semibold text-primary">
            {t(language, "reader.remaining", { count: localizedRemaining })}
          </p>
        )}
        {!complete && (
          <p className="pointer-events-none absolute bottom-4 z-10 font-sans text-[12px] leading-[18px] text-muted-foreground">
            {t(language, "reader.holdToReset")}
          </p>
        )}
      </button>

      <div className="mt-4 flex shrink-0 items-center justify-between border-t border-border px-6 py-4">
        <button
          onClick={onPrev}
          disabled={idx === 0}
          aria-label="Previous Zikr"
          className="flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-3 transition-all active:scale-95 disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <SkipBack size={16} className="text-card-foreground rtl:-scale-x-100" />
          <span className="font-sans text-[14px] font-semibold text-card-foreground">{t(language, "reader.prev")}</span>
        </button>

        <div className="flex gap-1.5" aria-hidden="true">
          {azkar.slice(Math.max(0, idx - 2), Math.min(azkar.length, idx + 3)).map((_, indicatorIndex) => {
            const absoluteIndex = Math.max(0, idx - 2) + indicatorIndex;
            return (
              <div
                key={absoluteIndex}
                className="h-[6px] rounded-full transition-all"
                style={{
                  width: absoluteIndex === idx ? 16 : 6,
                  background: absoluteIndex === idx ? "var(--primary)" : "var(--muted)",
                }}
              />
            );
          })}
        </div>

        <button
          onClick={onNext}
          disabled={idx === azkar.length - 1}
          aria-label="Next Zikr"
          className="flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-3 transition-all active:scale-95 disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <span className="font-sans text-[14px] font-semibold text-card-foreground">{t(language, "reader.next")}</span>
          <SkipForward size={16} className="text-card-foreground rtl:-scale-x-100" />
        </button>
      </div>
    </div>
  );
}
