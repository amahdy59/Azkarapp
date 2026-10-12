import { useEffect, useRef, useState } from "react";

/** Visit-local focus mode; counting and persisted progress stay with the screen. */
export function useStandaloneReadingFocus() {
  const [focusMode, setFocusMode] = useState(false);
  const focusToggleRef = useRef<HTMLButtonElement>(null);
  const readingScrollRef = useRef<HTMLDivElement>(null);
  const previousFocusMode = useRef(false);

  useEffect(() => {
    if (!focusMode && !previousFocusMode.current) return;
    previousFocusMode.current = focusMode;
    (focusMode ? focusToggleRef.current : readingScrollRef.current)?.focus({ preventScroll: true });
  }, [focusMode]);

  return { focusMode, setFocusMode, focusToggleRef, readingScrollRef };
}
