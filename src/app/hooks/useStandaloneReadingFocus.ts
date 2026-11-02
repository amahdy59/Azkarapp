import { useEffect, useRef, useState } from "react";
import { useReadingFocusIndicator } from "./useReadingFocusIndicator";

/** Visit-local focus mode; counting and persisted progress stay with the screen. */
export function useStandaloneReadingFocus() {
  const [focusMode, setFocusMode] = useState(false);
  const focusToggleRef = useRef<HTMLButtonElement>(null);
  const readingScrollRef = useReadingFocusIndicator();
  const previousFocusMode = useRef(false);

  useEffect(() => {
    if (!focusMode && !previousFocusMode.current) return;
    previousFocusMode.current = focusMode;
    (focusMode ? focusToggleRef.current : readingScrollRef.current)?.focus({ preventScroll: true });
  }, [focusMode, readingScrollRef]);

  return { focusMode, setFocusMode, focusToggleRef, readingScrollRef };
}
