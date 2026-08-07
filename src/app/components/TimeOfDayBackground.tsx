import React from "react";
import { AzkarHeroBackground } from "./AzkarHeroBackground";
import type { AzkarBackgroundKey } from "./azkar-backgrounds";

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

      {variant === "card" ? (
        /* Flat scrim, direction-agnostic so it works in both RTL and LTR. */
        <div className="absolute inset-0 bg-black/25 dark:bg-black/45" />
      ) : (
        <>
          {/* Dark mode: fade to near-black */}
          <div
            className="absolute inset-0 hidden dark:block"
            style={{
              background:
                "linear-gradient(to bottom, rgba(8,12,20,0) 0%, rgba(8,12,20,0.15) 30%, rgba(8,12,20,0.72) 65%, rgba(8,12,20,0.93) 82%, #080c14 100%)",
            }}
          />
          {/* Light mode: fade to white — start color is transparent white (not gray) */}
          <div
            className="absolute inset-0 dark:hidden"
            style={{
              background:
                "linear-gradient(to bottom, rgba(255,255,255,0) 0%, rgba(255,255,255,0) 65.8%, rgba(255,255,255,0.7) 79.9%, rgba(255,255,255,0.9) 90.6%, rgb(255,255,255) 100%)",
            }}
          />
        </>
      )}
    </div>
  );
}
