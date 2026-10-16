import { useCallback, useLayoutEffect, useRef, useState, type RefObject } from "react";
import { shouldReduceMotion } from "../motionPreferences";

/** Animate only the discrete expanded/compact handoff, never every scroll tick. */
export function useHomePrayerScroll(
  contentRef: RefObject<HTMLDivElement>,
  stickyRef: RefObject<HTMLDivElement>,
  reduceMotion: boolean,
) {
  const [condensed, setCondensed] = useState(false);
  const condensedRef = useRef(false);
  const previousGeometry = useRef<{ sticky: number; cards: number[] } | null>(null);

  const updateScroll = useCallback(
    (scrollTop: number) => {
      const next = condensedRef.current ? scrollTop > 8 : scrollTop > 96;
      if (next === condensedRef.current) return;
      const sticky = stickyRef.current;
      if (sticky)
        previousGeometry.current = {
          sticky: sticky.getBoundingClientRect().height,
          cards: [...sticky.querySelectorAll<HTMLElement>('[data-density="summary"]')].map(
            (card) => card.getBoundingClientRect().height,
          ),
        };
      condensedRef.current = next;
      setCondensed(next);
    },
    [stickyRef],
  );

  useLayoutEffect(() => {
    const previous = previousGeometry.current;
    previousGeometry.current = null;
    const sticky = stickyRef.current;
    if (!previous || !sticky || shouldReduceMotion(reduceMotion)) return;
    if (typeof sticky.animate !== "function") return;

    const animations: Animation[] = [];
    const animate = (element: HTMLElement, frames: Keyframe[]) => {
      const animation = element.animate(frames, { duration: 260, easing: "cubic-bezier(0.2, 0, 0, 1)" });
      // Canceled animations reject finished. Rapid reversals must not leave an
      // unhandled rejection or queue a stale intermediate layout.
      void animation.finished.catch(() => undefined);
      animations.push(animation);
    };
    // Interpolate actual shell/card heights together. Content follows normal
    // layout throughout instead of jumping first and sliding back afterwards.
    // Header rows keep their natural size; text is never scaled or blurred.
    const settleHeight = (element: HTMLElement, before: number) => {
      const after = element.getBoundingClientRect().height;
      if (Math.abs(before - after) > 0.5) animate(element, [{ height: before + "px" }, { height: after + "px" }]);
    };
    settleHeight(sticky, previous.sticky);
    sticky.querySelectorAll<HTMLElement>('[data-density="summary"]').forEach((card, index) => {
      settleHeight(card, previous.cards[index] ?? card.getBoundingClientRect().height);
    });
    const details = sticky.querySelectorAll<HTMLElement>(
      condensed ? "[data-prayer-compact-countdown]" : "[data-prayer-footer]",
    );
    for (const detail of details) {
      animate(detail, [{ opacity: 0 }, { opacity: 1 }]);
    }

    const cancel = () => animations.forEach((animation) => animation.cancel());
    const media = window.matchMedia?.("(prefers-reduced-motion: reduce)");
    const handlePreference = () => {
      if (media?.matches) cancel();
    };
    media?.addEventListener("change", handlePreference);
    return () => {
      cancel();
      media?.removeEventListener("change", handlePreference);
    };
  }, [condensed, contentRef, reduceMotion, stickyRef]);

  return { condensed, updateScroll };
}
