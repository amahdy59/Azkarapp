import { useState, useRef, useEffect } from "react";
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
    const initialCount = isDone && z ? z.repetitionCount : 0;
    setCount(initialCount);
    setComplete(initialCount >= (z?.repetitionCount ?? 1));
    setJustCompleted(false);
    setReaderAnnouncement(
      initialCount > 0
        ? t(language, "reader.counterReadyComplete")
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

  const handleTap = () => {
    if (complete || !z) {
      return;
    }

    const next = count + 1;
    setCount(next);
    onCount?.();
    if (hapticFeedback) {
      vibrate(22);
    }

    if (next >= z.repetitionCount) {
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
        vibrate([32, 45, 26, 45, 70]);
      }
      onComplete(idx);
      advanceTimer.current = setTimeout(() => {
        setJustCompleted(false);
        onAdvance(idx);
      }, COUNTER_ADVANCE_DELAY_MS);
    } else {
      if (next % 10 === 0 || next === Math.floor(z.repetitionCount / 2)) {
        setReaderAnnouncement(`${formatNumerals(next, language)}`);
      }
    }
  };

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
    setCount(0);
    setComplete(false);
    setJustCompleted(false);
    setReaderAnnouncement(t(language, isLongSurah(z) ? "reader.tapCounterWhenFinished" : "reader.tapAnywhere"));
  };

  return {
    count,
    complete,
    justCompleted,
    readerAnnouncement,
    suppressTap,
    handleTap,
    handleSurfaceTap,
    handleReset,
  };
}
