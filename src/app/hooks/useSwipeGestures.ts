import { useCallback, useRef, useState, type CSSProperties, type TouchEvent } from "react";

/** How far the page has to travel before releasing turns it. */
const TURN_THRESHOLD = 60;

/**
 * Past this much movement, the gesture was a swipe and the tap it would
 * otherwise have registered is suppressed.
 */
const TAP_CANCEL = 14;

/**
 * The page follows the finger at this fraction of its travel, up to
 * {@link MAX_DRAG}.
 *
 * Following one-for-one would let the text leave the screen before the gesture
 * ended, and a page that can be flung anywhere stops reading as a page. Damping
 * keeps it attached to the thumb while making the threshold legible: the closer
 * the resistance gets to the cap, the more the surface says it is about to turn.
 */
const DRAG_RESISTANCE = 0.55;
const MAX_DRAG = 72;

function damp(delta: number): number {
  return Math.sign(delta) * Math.min(Math.abs(delta) * DRAG_RESISTANCE, MAX_DRAG);
}

export function useSwipeGestures({
  direction,
  onNext,
  onPrev,
  suppressTap,
  threshold = TURN_THRESHOLD,
  reduceMotion = false,
}: {
  direction: "ltr" | "rtl";
  onNext: () => void;
  onPrev: () => void;
  suppressTap?: React.MutableRefObject<boolean>;
  threshold?: number;
  /** Suppresses the drag. The turn itself still happens on release. */
  reduceMotion?: boolean;
}) {
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  /**
   * Which way the gesture went, decided once and then held.
   *
   * Without this lock a mostly-vertical scroll through a long surah would drag
   * the page sideways whenever the thumb wandered, and a mostly-horizontal turn
   * would stutter as the browser reclaimed the gesture for scrolling.
   */
  const axis = useRef<"undecided" | "horizontal" | "vertical">("undecided");
  const [dragOffset, setDragOffset] = useState(0);

  const handleSwipe = useCallback(
    (dx: number) => {
      const forward = direction === "rtl" ? dx > threshold : dx < -threshold;
      const backward = direction === "rtl" ? dx < -threshold : dx > threshold;
      if (forward) onNext();
      else if (backward) onPrev();
    },
    [direction, onNext, onPrev, threshold],
  );

  const onTouchStart = useCallback((event: TouchEvent<HTMLElement>) => {
    const touch = event.touches?.[0];
    touchStart.current = touch ? { x: touch.clientX, y: touch.clientY } : null;
    axis.current = "undecided";
  }, []);

  const onTouchMove = useCallback(
    (event: TouchEvent<HTMLElement>) => {
      const start = touchStart.current;
      const touch = event.touches?.[0];
      if (!start || !touch) return;

      const dx = touch.clientX - start.x;
      const dy = touch.clientY - start.y;

      if (axis.current === "undecided") {
        // Nothing is decided inside the dead zone, so a still thumb cannot
        // commit the gesture to an axis it did not mean.
        if (Math.abs(dx) < 8 && Math.abs(dy) < 8) return;
        axis.current = Math.abs(dx) > Math.abs(dy) ? "horizontal" : "vertical";
      }

      if (axis.current !== "horizontal") return;
      if (!reduceMotion) setDragOffset(damp(dx));
    },
    [reduceMotion],
  );

  const settle = useCallback(() => {
    setDragOffset(0);
    touchStart.current = null;
    axis.current = "undecided";
  }, []);

  const onTouchEnd = useCallback(
    (event: TouchEvent<HTMLElement>) => {
      const start = touchStart.current;
      const touchEndX = event.changedTouches?.[0]?.clientX;
      // Read before settling, which resets it.
      const lockedAxis = axis.current;
      settle();
      if (!start || touchEndX === undefined) return;

      const dx = touchEndX - start.x;
      if (Math.abs(dx) > TAP_CANCEL && suppressTap) {
        suppressTap.current = true;
        setTimeout(() => {
          suppressTap.current = false;
        }, 220);
      }

      // A gesture the lock called vertical is a scroll, whatever it drifted to
      // horizontally by the time the thumb left the glass. Still undecided means
      // a flick too quick to have moved — that is a turn, not a scroll.
      if (lockedAxis !== "vertical") handleSwipe(dx);
    },
    [handleSwipe, settle, suppressTap],
  );

  /**
   * Applied to whatever should follow the finger.
   *
   * While the thumb is down the page tracks it with no transition; on release
   * it returns on the same sprung curve a press uses, so the page turn and the
   * press feel like the same physical surface.
   */
  const dragStyle: CSSProperties = {
    transform: dragOffset === 0 ? undefined : `translateX(${dragOffset}px)`,
    transition: dragOffset === 0 ? "transform var(--motion-duration-release) var(--motion-ease-release)" : "none",
  };

  return { onTouchStart, onTouchMove, onTouchEnd, dragOffset, dragStyle };
}
