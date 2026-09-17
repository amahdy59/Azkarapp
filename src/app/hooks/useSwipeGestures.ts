import { useRef, type TouchEvent } from "react";

export function useSwipeGestures({
  direction,
  onNext,
  onPrev,
  suppressTap,
  threshold = 60,
}: {
  direction: "ltr" | "rtl";
  onNext: () => void;
  onPrev: () => void;
  suppressTap?: React.MutableRefObject<boolean>;
  threshold?: number;
}) {
  const touchStartX = useRef<number | null>(null);

  const handleSwipe = (dx: number) => {
    if (direction === "rtl") {
      if (dx > threshold) {
        onNext();
      } else if (dx < -threshold) {
        onPrev();
      }
      return;
    }

    if (dx > threshold) {
      onPrev();
    } else if (dx < -threshold) {
      onNext();
    }
  };

  const onTouchStart = (e: TouchEvent<HTMLElement>) => {
    touchStartX.current = e.touches?.[0]?.clientX ?? null;
  };

  const onTouchMove = () => {
    // optional
  };

  const onTouchEnd = (e: TouchEvent<HTMLElement>) => {
    if (touchStartX.current === null) return;
    const touchEndX = e.changedTouches?.[0]?.clientX;
    if (touchEndX === undefined) return;
    const deltaX = touchEndX - touchStartX.current;

    if (Math.abs(deltaX) > 14 && suppressTap) {
      suppressTap.current = true;
      setTimeout(() => {
        suppressTap.current = false;
      }, 220);
    }

    handleSwipe(deltaX);
    touchStartX.current = null;
  };

  return { onTouchStart, onTouchMove, onTouchEnd };
}
