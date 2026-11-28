import { useSyncExternalStore } from "react";

type Edge = "top" | "right" | "bottom" | "left";
type Padding = number | Partial<Record<Edge, number>>;
const edges: Edge[] = ["top", "right", "bottom", "left"];
const subscribers = new Set<() => void>();
let stop: (() => void) | undefined;

function snapshot() {
  if (typeof document === "undefined") return "0,0,0,0";
  const style = getComputedStyle(document.documentElement);
  return edges
    .map((edge) => Math.max(0, Number.parseFloat(style.getPropertyValue(`--app-safe-area-${edge}`)) || 0))
    .join(",");
}

function subscribe(listener: () => void) {
  subscribers.add(listener);
  if (!stop) {
    const notify = () => subscribers.forEach((subscriber) => subscriber());
    const observer = new MutationObserver(notify);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["style", "class"] });
    window.addEventListener("resize", notify);
    window.visualViewport?.addEventListener("resize", notify);
    stop = () => {
      observer.disconnect();
      window.removeEventListener("resize", notify);
      window.visualViewport?.removeEventListener("resize", notify);
    };
  }
  return () => {
    subscribers.delete(listener);
    if (subscribers.size === 0) {
      stop?.();
      stop = undefined;
    }
  };
}

/** Radix collision bounds use the raw viewport; protect its physical edges too.
 * Callers with an already bounded dialog use their existing interior padding. */
export function useSafeAreaCollisionPadding(padding: Padding = 8) {
  const values = useSyncExternalStore(subscribe, snapshot, () => "0,0,0,0")
    .split(",")
    .map(Number);
  return Object.fromEntries(
    edges.map((edge, index) => [edge, values[index]! + (typeof padding === "number" ? padding : (padding[edge] ?? 0))]),
  ) as Record<Edge, number>;
}
