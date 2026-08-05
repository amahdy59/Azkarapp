import React from "react";
import { AzkarHeroBackground } from "./AzkarHeroBackground";
import type { AzkarBackgroundKey } from "./azkar-backgrounds";

export function TimeOfDayBackground({ categoryId }: { categoryId: string }) {
  let kind: AzkarBackgroundKey = "morning";

  if (categoryId === "evening") {
    kind = "evening";
  } else if (categoryId === "before_sleep") {
    kind = "sleep";
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

      {/* Dark mode: fade to near-black */}
      <div
        className="absolute inset-0 hidden dark:block"
        style={{
          background:
            "linear-gradient(to bottom, rgba(8,12,20,0) 0%, rgba(8,12,20,0.15) 30%, rgba(8,12,20,0.72) 65%, rgba(8,12,20,0.93) 82%, #080c14 100%)",
        }}
      />
      {/* Light mode: fade to white */}
      <div
        className="absolute inset-0 dark:hidden"
        style={{
          background:
            "linear-gradient(to bottom, rgba(102,102,102,0) 0%, rgba(102,102,102,0) 65.8%, rgba(255,255,255,0.7) 79.9%, rgba(255,255,255,0.9) 90.6%, rgb(255,255,255) 100%)",
        }}
      />
    </div>
  );
}
