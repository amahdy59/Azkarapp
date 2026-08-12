import React from "react";
import { AzkarHeroBackground } from "./AzkarHeroBackground";
import type { AzkarBackgroundKey } from "./azkar-backgrounds";

const PARTICLES = [
  [8, 24, 3, -7, 3.9, 0.1],
  [18, 55, 2, 8, 4.5, 0.5],
  [30, 18, 2, -5, 4.1, 0.9],
  [42, 66, 3, 6, 4.7, 0.2],
  [54, 33, 2, -8, 4.3, 1.1],
  [65, 74, 2, 7, 4.8, 0.7],
  [76, 20, 3, -6, 4.2, 0.4],
  [87, 58, 2, 5, 4.6, 1.3],
  [94, 31, 2, -4, 4, 0.8],
] as const;

export function TimeOfDayBackground({
  categoryId = "morning",
  variant = "page",
}: {
  categoryId?: string;
  /**
   * `page` fades the image into the page background, so it can sit behind a
   * whole screen. `card` keeps the image inside its rounded container and uses
   * a flat scrim instead, since a fade-to-page edge would read as a bug there.
   */
  variant?: "page" | "card";
}) {
  let kind: AzkarBackgroundKey = "morning";

  if (categoryId === "evening") {
    kind = "evening";
  } else if (categoryId === "before_sleep") {
    kind = "sleep";
  } else if (categoryId === "after_prayer") {
    kind = "prayer";
  } else if (categoryId.includes("friday")) {
    kind = "friday";
  }

  return (
    <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden="true">
      <AzkarHeroBackground
        kind={kind}
        priority={true}
        className="w-full h-full absolute inset-0 transition-opacity duration-[360ms] ease-out"
      />

      <div className="azkar-hero-particles">
        {PARTICLES.map(([x, y, size, drift, duration, delay], index) => (
          <span
            key={index}
            className="azkar-hero-particle"
            style={
              {
                "--particle-x": `${x}%`,
                "--particle-y": `${y}%`,
                "--particle-size": `${size}px`,
                "--particle-drift": `${drift}px`,
                "--particle-duration": `${duration}s`,
                "--particle-delay": `${delay}s`,
              } as React.CSSProperties
            }
          />
        ))}
      </div>

      {variant === "card" ? (
        /* Flat scrim, direction-agnostic so it works in both RTL and LTR. */
        <div
          className={`absolute inset-0 ${kind === "morning" ? "bg-black/10 dark:bg-black/30" : "bg-black/25 dark:bg-black/45"}`}
        />
      ) : (
        <>
          {/* Dark mode: fade to near-black */}
          <div
            className="absolute inset-0 hidden dark:block"
            style={{
              background:
                kind === "morning"
                  ? "linear-gradient(to bottom, rgba(8,12,20,0) 0%, rgba(8,12,20,0.05) 30%, rgba(8,12,20,0.5) 65%, rgba(8,12,20,0.85) 82%, #080c14 100%)"
                  : "linear-gradient(to bottom, rgba(8,12,20,0) 0%, rgba(8,12,20,0.15) 30%, rgba(8,12,20,0.72) 65%, rgba(8,12,20,0.93) 82%, #080c14 100%)",
            }}
          />
          {/* Light mode: fade to white */}
          <div
            className="absolute inset-0 dark:hidden"
            style={{
              background:
                kind === "morning"
                  ? "linear-gradient(to bottom, rgba(255,255,255,0) 0%, rgba(255,255,255,0) 70%, rgba(255,255,255,0.4) 85%, rgba(255,255,255,0.8) 95%, rgb(255,255,255) 100%)"
                  : "linear-gradient(to bottom, rgba(255,255,255,0) 0%, rgba(255,255,255,0) 65.8%, rgba(255,255,255,0.7) 79.9%, rgba(255,255,255,0.9) 90.6%, rgb(255,255,255) 100%)",
            }}
          />
        </>
      )}
    </div>
  );
}
