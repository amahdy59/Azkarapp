import { useCallback, useState, type CSSProperties, type MouseEvent, type PointerEvent } from "react";

/**
 * What counting feels like, defined once.
 *
 * Three screens count dhikr — the reader, the Masbaha, and Friday's salawat —
 * and each had grown its own copy of this interaction. They had drifted: the
 * Masbaha and salawat pressed to 0.97 over 150ms, while the reader, which is
 * the surface people actually tap hundreds of times, pressed to 0.985 over
 * 300ms. Half the travel over twice the time reads as no press at all, so the
 * one screen the whole app is built around was the one that felt dead under
 * the thumb.
 *
 * Everything about the gesture now comes from here, so the three cannot drift
 * again and a change to the feel is a change in one place.
 */
/**
 * Read from the same custom properties the global press rule uses, so the page
 * and every control on it press to one depth on one pair of curves. Hardcoding
 * the numbers here is what let the reader drift to 0.985/300ms in the first
 * place, and a second copy would drift again.
 */
function motionToken(name: string, fallback: string): string {
  if (typeof window === "undefined") return fallback;
  const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return value || fallback;
}

export const COUNTING_PRESS = {
  /** Matches --motion-scale-pressed. */
  scale: 0.97,
} as const;

/**
 * Anything that owns its own tap. A count is what the *page* does when the tap
 * was not meant for a control, so every interactive descendant opts out here
 * rather than each screen maintaining its own list.
 */
const OWNS_ITS_OWN_TAP =
  "button, a, input, textarea, select, summary, [contenteditable='true'], [role='dialog'], [role='menu'], [role='menuitem'], [role='listbox'], [role='option'], [role='switch'], [role='slider'], [role='tab'], [data-prevent-count='true']";

function isOwnControl(target: EventTarget | null): boolean {
  return target instanceof Element && Boolean(target.closest(OWNS_ITS_OWN_TAP));
}

export interface UseCountingSurfaceOptions {
  /**
   * Called for a tap that landed on the page rather than on a control. The
   * event is passed through because a caller may have further reasons of its
   * own to ignore it — the reader skips a tap that finished a text selection.
   */
  onCount: (event: MouseEvent<HTMLElement>) => void;
  /** Suppresses the press scale; the count still registers. */
  reduceMotion?: boolean;
}

/**
 * Wires a whole screen as a counting surface.
 *
 * Spread `surfaceProps` onto the element that should accept taps and apply
 * `pressStyle` to whatever should shrink under the thumb.
 */
export function useCountingSurface({ onCount, reduceMotion = false }: UseCountingSurfaceOptions) {
  const [isPressed, setIsPressed] = useState(false);

  const release = useCallback(() => setIsPressed(false), []);

  const handlePointerDown = useCallback(
    (event: PointerEvent<HTMLElement>) => {
      if (reduceMotion || isOwnControl(event.target)) return;
      setIsPressed(true);
    },
    [reduceMotion],
  );

  const handleClick = useCallback(
    (event: MouseEvent<HTMLElement>) => {
      if (isOwnControl(event.target)) return;
      onCount(event);
    },
    [onCount],
  );

  const pressStyle: CSSProperties = {
    transform: isPressed && !reduceMotion ? `scale(var(--motion-scale-pressed, ${COUNTING_PRESS.scale}))` : "scale(1)",
    // Down fast, back slowly through an overshoot — the asymmetry is what makes
    // the surface feel sprung rather than resized. Same tokens as every button.
    transition: isPressed
      ? `transform ${motionToken("--motion-duration-press", "90ms")} ${motionToken("--motion-ease-standard", "cubic-bezier(0.2, 0, 0, 1)")}`
      : `transform ${motionToken("--motion-duration-release", "420ms")} ${motionToken("--motion-ease-release", "cubic-bezier(0.34, 1.56, 0.64, 1)")}`,
  };

  return {
    isPressed,
    pressStyle,
    surfaceProps: {
      onClick: handleClick,
      onPointerDown: handlePointerDown,
      onPointerUp: release,
      // A pointer that leaves or is cancelled must not leave the surface stuck
      // in its pressed state.
      onPointerCancel: release,
      onPointerLeave: release,
    },
  };
}
