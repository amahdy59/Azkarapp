import { useCallback, useRef, useState } from "react";

/** Hysteresis changes state once; one inherited CSS value owns the handoff. */
export function useHomePrayerScroll() {
  const [condensed, setCondensed] = useState(false);
  const condensedRef = useRef(false);
  const updateScroll = useCallback((scrollTop: number, interactionActive = false) => {
    if (interactionActive) return;
    const next = condensedRef.current ? scrollTop > 8 : scrollTop > 96;
    if (next === condensedRef.current) return;
    condensedRef.current = next;
    setCondensed(next);
  }, []);
  return { condensed, updateScroll };
}
