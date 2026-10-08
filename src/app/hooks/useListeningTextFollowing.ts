import { useEffect, useState, type RefObject } from "react";

/** Follow only outside the viewport; user scroll gestures pause without moving focus. */
export function useListeningTextFollowing(root: RefObject<HTMLElement | null>, cue: unknown, identity: unknown) {
  const [follow, setFollow] = useState(true);
  useEffect(() => {
    setFollow(true);
  }, [identity]);
  useEffect(() => {
    const viewport = root.current;
    if (!viewport) return;
    const pause = () => setFollow(false);
    const key = (event: KeyboardEvent) => {
      if (
        event.defaultPrevented ||
        (event.target instanceof Element && event.target.closest("button,input,select,textarea,[role=slider]"))
      )
        return;
      if (["ArrowUp", "ArrowDown", "PageUp", "PageDown", "Home", "End", " "].includes(event.key)) pause();
    };
    viewport.addEventListener("wheel", pause, { passive: true });
    viewport.addEventListener("touchmove", pause, { passive: true });
    viewport.addEventListener("keydown", key);
    return () => {
      viewport.removeEventListener("wheel", pause);
      viewport.removeEventListener("touchmove", pause);
      viewport.removeEventListener("keydown", key);
    };
  }, [root, identity]);
  useEffect(() => {
    const viewport = root.current,
      word = viewport?.querySelector<HTMLElement>("[data-listening-word]");
    if (!follow || !cue || !viewport || !word) return;
    const view = viewport.getBoundingClientRect(),
      target = word.getBoundingClientRect();
    const toolbarHeight = viewport.querySelector("[data-listening-controls]")?.getBoundingClientRect().height ?? 0;
    const top = view.top + toolbarHeight + 12;
    const delta =
      target.top < top ? target.top - top : target.bottom > view.bottom - 12 ? target.bottom - view.bottom + 12 : 0;
    if (delta) viewport.scrollTo?.({ top: Math.max(0, viewport.scrollTop + delta), behavior: "instant" });
  }, [root, follow, cue, identity]);
  return [follow, setFollow] as const;
}
