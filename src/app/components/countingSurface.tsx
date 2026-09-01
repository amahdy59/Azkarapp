import { useCallback, useState, type CSSProperties, type MouseEvent, type PointerEvent } from "react";
import { tapRippleStyle } from "./ZikrComponents";

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
export const COUNTING_PRESS = {
  /** Deep enough to read as a press on a large surface. */
  scale: 0.97,
  /** Short enough to keep up with a fast count. */
  durationMs: 150,
  easing: "cubic-bezier(0.4, 0, 0.2, 1)",
  /** Matches the `tap-ripple-expand` keyframes in `ZikrComponents.css`. */
  rippleMs: 560,
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

export interface CountingRipple {
  id: number;
  x: number;
  y: number;
}

export interface UseCountingSurfaceOptions {
  /**
   * Called for a tap that landed on the page rather than on a control. The
   * event is passed through because a caller may have further reasons of its
   * own to ignore it — the reader skips a tap that finished a text selection.
   */
  onCount: (event: MouseEvent<HTMLElement>) => void;
  /** Suppresses the press and the ripple; the count still registers. */
  reduceMotion?: boolean;
}

/**
 * Wires a whole screen as a counting surface.
 *
 * Spread `surfaceProps` onto the element that should accept taps, apply
 * `pressStyle` to whatever should shrink under the thumb, and render
 * {@link CountingRipples} inside a positioned ancestor.
 */
export function useCountingSurface({ onCount, reduceMotion = false }: UseCountingSurfaceOptions) {
  const [isPressed, setIsPressed] = useState(false);
  const [ripples, setRipples] = useState<CountingRipple[]>([]);

  const release = useCallback(() => setIsPressed(false), []);

  const handlePointerDown = useCallback(
    (event: PointerEvent<HTMLElement>) => {
      if (reduceMotion || isOwnControl(event.target)) return;
      setIsPressed(true);
      const rect = event.currentTarget.getBoundingClientRect();
      setRipples((current) => [
        // Four concurrent ripples is already more than the eye resolves; a fast
        // count would otherwise pile up unbounded nodes.
        ...current.slice(-3),
        { id: Date.now() + Math.random(), x: event.clientX - rect.left, y: event.clientY - rect.top },
      ]);
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

  const dismissRipple = useCallback((id: number) => {
    setRipples((current) => current.filter((ripple) => ripple.id !== id));
  }, []);

  const pressStyle: CSSProperties = {
    transform: isPressed && !reduceMotion ? `scale(${COUNTING_PRESS.scale})` : "scale(1)",
    transition: `transform ${COUNTING_PRESS.durationMs}ms ${COUNTING_PRESS.easing}`,
  };

  return {
    isPressed,
    ripples,
    dismissRipple,
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

/**
 * The expanding marks a counting tap leaves behind.
 *
 * This renders the same `.tap-ripple` the counter button does, so a tap on the
 * page and a tap on the number leave the same mark. It previously carried an
 * inline `animation: ripple …` naming keyframes that exist nowhere in the app —
 * which overrode the real animation on `.tap-ripple`, so the page ripple never
 * drew, and because `animationend` never fired the nodes were never released.
 */
export function CountingRipples({
  ripples,
  onDismiss,
}: {
  ripples: readonly CountingRipple[];
  onDismiss: (id: number) => void;
}) {
  return (
    <>
      {ripples.map((ripple) => (
        <span
          key={ripple.id}
          className="tap-ripple"
          aria-hidden="true"
          style={{ ...tapRippleStyle, left: ripple.x, top: ripple.y }}
          onAnimationEnd={() => onDismiss(ripple.id)}
        />
      ))}
    </>
  );
}
