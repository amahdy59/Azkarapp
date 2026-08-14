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

export function TimeOfDayBackground({ categoryId = "morning" }: { categoryId?: string }) {
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
    </div>
  );
}
