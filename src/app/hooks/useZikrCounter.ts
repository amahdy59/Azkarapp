import { useState, useRef, useEffect, useCallback } from "react";
import { COUNTER_ADVANCE_DELAY_MS } from "../constants/reader";
import { formatNumerals } from "../formatting";
import { t } from "../i18n";
import type { Zikr, AppLanguage } from "../types";
import { isLongSurah } from "../content/mushafPages";

export function useZikrCounter({
  z,
  idx,
  isDone,
  language,
  azkarLength,
  collectionCompletedCount,
  hapticFeedback,
  vibrate,
  onCount,
  onComplete,
  onAdvance,
}: {
  z: Zikr | undefined;
  idx: number;
  isDone: boolean;
  language: AppLanguage;
  azkarLength: number;
  collectionCompletedCount: number;
  hapticFeedback: boolean;
  vibrate: (pattern: number | number[]) => void;
  onCount?: () => void;
  onComplete: (idx: number) => void;
  onAdvance: (idx: number) => void;
}) {
  const [count, setCount] = useState(0);
  const [complete, setComplete] = useState(false);
  const [justCompleted, setJustCompleted] = useState(false);
  const [readerAnnouncement, setReaderAnnouncement] = useState("");

  const activeZikrId = useRef<string | null>(null);
  /**
   * Partial tallies for every zikr visited in this reading session, keyed by
   * zikr id.
   *
   * Counting is per-zikr state, but moving to the next or previous zikr does
   * not leave the reader — the screen stays mounted and only `idx` changes.
   * Without this the switch effect below zeroed the counter, so anyone who
   * said 30 of 100 istighfars, glanced at the next zikr and came back found
   * their tally gone and no way to recover it. A completed or reset zikr drops
   * its entry, so only work still in progress is remembered.
   */
  const partialCounts = useRef(new Map<string, number>());
  const advanceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const tapSuppressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const suppressTap = useRef(false);

  useEffect(() => {
    if (!z || activeZikrId.current === z.id) {
      return;
    }

    activeZikrId.current = z.id;
    if (advanceTimer.current) {
      clearTimeout(advanceTimer.current);
      advanceTimer.current = null;
    }
    const remembered = Math.max(0, Math.min(partialCounts.current.get(z.id) ?? 0, z.repetitionCount));
    const initialCount = isDone ? z.repetitionCount : remembered;
    const initialComplete = initialCount >= z.repetitionCount;
    setCount(initialCount);
    setComplete(initialComplete);
    setJustCompleted(false);
    setReaderAnnouncement(
      initialComplete
        ? t(language, "reader.counterReadyComplete")
        : initialCount > 0
          ? formatNumerals(initialCount, language)
          : t(language, isLongSurah(z) ? "reader.tapCounterWhenFinished" : "reader.tapAnywhere"),
    );
  }, [idx, isDone, language, z]);

  useEffect(() => {
    return () => {
      if (advanceTimer.current) clearTimeout(advanceTimer.current);
      // eslint-disable-next-line react-hooks/exhaustive-deps
      if (tapSuppressTimer.current) clearTimeout(tapSuppressTimer.current);
    };
  }, []);

  const handleTap = useCallback(() => {
    if (complete || !z) {
      return;
    }

    const next = count + 1;
    setCount(next);
    onCount?.();
    if (hapticFeedback) {
      vibrate(15);
    }

    if (next >= z.repetitionCount) {
      partialCounts.current.delete(z.id);
      setComplete(true);
      setJustCompleted(true);
      const announcedCompletedCount = Math.min(collectionCompletedCount + (isDone ? 0 : 1), azkarLength);
      setReaderAnnouncement(
        t(language, "reader.completionAnnouncement", {
          index: formatNumerals(announcedCompletedCount, language),
          total: formatNumerals(azkarLength, language),
          percent: formatNumerals(Math.round((announcedCompletedCount / azkarLength) * 100), language),
        }),
      );
      if (hapticFeedback) {
        vibrate([30, 50, 30, 50, 50]);
      }
      onComplete(idx);
      advanceTimer.current = setTimeout(() => {
        setJustCompleted(false);
        onAdvance(idx);
      }, COUNTER_ADVANCE_DELAY_MS);
    } else {
      partialCounts.current.set(z.id, next);
      if (next % 10 === 0 || next === Math.floor(z.repetitionCount / 2)) {
        setReaderAnnouncement(`${formatNumerals(next, language)}`);
      }
    }
  }, [
    complete,
    z,
    count,
    onCount,
    hapticFeedback,
    vibrate,
    collectionCompletedCount,
    isDone,
    azkarLength,
    language,
    onComplete,
    idx,
    onAdvance,
  ]);

  const shouldIgnoreCountTap = (target: EventTarget | null) => {
    if (!(target instanceof Element)) {
      return false;
    }
    return Boolean(
      target.closest(
        "button, a, input, textarea, select, summary, [contenteditable='true'], [role='dialog'], [role='menu'], [role='menuitem'], [role='listbox'], [role='option'], [role='switch'], [data-radix-scroll-area-thumb], [data-radix-scroll-area-scrollbar], [data-prevent-count='true']",
      ),
    );
  };

  const handleSurfaceTap = (event: React.MouseEvent<HTMLElement> | React.KeyboardEvent<HTMLElement>) => {
    // Reviewed multi-page surahs are read and scrolled before their end control.
    // Short surahs keep the ordinary canvas-counting interaction.
    if (isLongSurah(z)) {
      return;
    }

    // If user is selecting text, don't count the tap
    const selection = typeof window !== "undefined" ? window.getSelection() : null;
    if (selection && selection.toString().length > 0) {
      return;
    }

    if (suppressTap.current || shouldIgnoreCountTap(event.target)) {
      return;
    }
    handleTap();
  };

  const handleReset = () => {
    if (z) partialCounts.current.delete(z.id);
    setCount(0);
    setComplete(false);
    setJustCompleted(false);
    setReaderAnnouncement(t(language, isLongSurah(z) ? "reader.tapCounterWhenFinished" : "reader.tapAnywhere"));
  };

  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (e.key === " " || e.code === "Space") {
        // e.target may be window/document in some environments, guard before
        // calling DOM methods that only exist on Element/HTMLElement.
        const target = e.target instanceof HTMLElement ? e.target : null;
        if (
          target?.tagName === "INPUT" ||
          target?.tagName === "TEXTAREA" ||
          target?.hasAttribute("contenteditable") ||
          target?.closest("button, [role='button']") // Let focused buttons handle their own spacebar
        ) {
          return;
        }

        if (isLongSurah(z)) {
          return;
        }

        e.preventDefault();
        handleTap();
      }
    };

    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => window.removeEventListener("keydown", handleGlobalKeyDown);
  }, [z, handleTap]);

  const restoreCount = useCallback(
    (targetCount: number) => {
      if (!z) return;
      const restored = Math.max(0, Math.min(targetCount, z.repetitionCount));
      setCount(restored);
      const isNowComplete = restored >= z.repetitionCount;
      if (isNowComplete || restored === 0) {
        partialCounts.current.delete(z.id);
      } else {
        partialCounts.current.set(z.id, restored);
      }
      setComplete(isNowComplete);
      setJustCompleted(false);
      setReaderAnnouncement(
        isNowComplete ? t(language, "reader.counterReadyComplete") : `${formatNumerals(restored, language)}`,
      );
    },
    [language, z],
  );

  return {
    count,
    complete,
    justCompleted,
    readerAnnouncement,
    suppressTap,
    handleTap,
    handleSurfaceTap,
    handleReset,
    restoreCount,
  };
}
