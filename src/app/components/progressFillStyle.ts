import type { CSSProperties } from "react";

/** Full-size fill translated through a clipped track, with inherited direction. */
export function progressFillStyle(ratio: number): CSSProperties {
  return {
    "--progress-ratio": Math.max(0, Math.min(1, ratio)),
    inlineSize: "100%",
    transform: "translateX(calc((var(--progress-ratio, 0) - 1) * 100% * var(--progress-sign, 1)))",
    transition: "transform var(--motion-duration-emphasis) var(--motion-ease-standard)",
  } as CSSProperties;
}
