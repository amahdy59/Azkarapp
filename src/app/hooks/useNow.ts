import { useEffect, useState } from "react";

/**
 * A clock that the render tree can depend on.
 *
 * Screens that show which prayer is open, or which day the tracking rows
 * belong to, read the time during render. `new Date()` in a component body
 * looks like it does that, but it only re-reads when something else already
 * caused a render — so a screen left open drifted: at Asr it still framed Fajr
 * and Dhuhr, and past midnight it kept writing to yesterday's day key.
 *
 * Two things move the clock forward. The tick is aligned to the wall-clock
 * minute rather than set to a flat 60s interval, so the reading changes in the
 * same second the displayed minute does. And `visibilitychange` resynchronises
 * on return, because a backgrounded tab has its timers throttled or frozen
 * outright — which is exactly the case that matters, an app reopened the next
 * morning after being left on the previous evening.
 */
export function useNow(): Date {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;

    const msUntilNextMinute = () => 60_050 - (Date.now() % 60_000);
    const tick = () => {
      setNow(new Date());
      timer = setTimeout(tick, msUntilNextMinute());
    };
    const resync = () => {
      if (document.visibilityState !== "visible") return;
      clearTimeout(timer);
      setNow(new Date());
      timer = setTimeout(tick, msUntilNextMinute());
    };

    timer = setTimeout(tick, msUntilNextMinute());
    document.addEventListener("visibilitychange", resync);
    return () => {
      clearTimeout(timer);
      document.removeEventListener("visibilitychange", resync);
    };
  }, []);

  return now;
}
