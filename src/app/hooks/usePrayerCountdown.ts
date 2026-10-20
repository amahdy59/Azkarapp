import { useEffect, useState, type RefObject } from "react";
import type { PrayerCountdownInterval } from "../prayerCountdown";

/** Only the visible next card ticks; the Home/domain clock stays minute-based. */
export function usePrayerCountdown(ref: RefObject<HTMLElement | null>, interval?: PrayerCountdownInterval) {
  const [reading, setReading] = useState(() => ({ now: Date.now(), endsAt: interval?.endsAt }));
  const startsAt = interval?.startsAt;
  const endsAt = interval?.endsAt;
  const valid =
    startsAt !== undefined &&
    endsAt !== undefined &&
    Number.isFinite(startsAt) &&
    Number.isFinite(endsAt) &&
    endsAt > startsAt;

  useEffect(() => {
    if (!valid) return;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let inView = typeof IntersectionObserver === "undefined";
    const tick = () => {
      clearTimeout(timer);
      if (document.visibilityState === "hidden" || !inView) return;
      const current = Date.now();
      setReading((previous) =>
        previous.now === current && previous.endsAt === endsAt ? previous : { now: current, endsAt },
      );
      if (current < endsAt!) timer = setTimeout(tick, 1015 - (current % 1000));
    };
    const observer =
      typeof IntersectionObserver === "undefined"
        ? undefined
        : new IntersectionObserver((entries) => {
            inView = entries.some((entry) => entry.isIntersecting);
            tick();
          });
    if (ref.current) observer?.observe(ref.current);
    tick();
    document.addEventListener("visibilitychange", tick);
    return () => {
      clearTimeout(timer);
      observer?.disconnect();
      document.removeEventListener("visibilitychange", tick);
    };
  }, [endsAt, ref, startsAt, valid]);

  // A card can become next hours after mount. Do not briefly display its old
  // mount-time reading while the new visibility observer delivers its callback.
  return valid ? (reading.endsAt === endsAt ? reading.now : Date.now()) : null;
}
