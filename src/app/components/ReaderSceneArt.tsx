import { memo } from "react";
import type { CategoryId } from "../types";
import "./reader-scene-art.css";

/** Decorative only: collection identity, never the clock or location. */
export const ReaderSceneArt = memo(function ReaderSceneArt({
  category,
  compact = false,
}: {
  category: CategoryId;
  compact?: boolean;
}) {
  const scene = category === "morning" || category === "evening" || category === "before_sleep" ? category : "neutral";

  return (
    <div
      className={`reader-scene${compact ? " reader-scene--compact" : ""}`}
      data-testid="reader-scene"
      data-scene={scene}
      aria-hidden="true"
    >
      <span className="reader-scene__light" />
      {/* A bounded, proportionally fitted vignette rather than a skyline
          stretched across the header. No filters, masks, IDs or requests. */}
      <svg
        className="reader-scene__skyline"
        viewBox="0 0 480 150"
        preserveAspectRatio="xMidYMax meet"
        aria-hidden="true"
        focusable="false"
      >
        <path
          fill="var(--scene-light)"
          opacity="0.16"
          d="M0 150V138H20V128H43V135H62V125H84V135H108V120H132V133H163V128H193V136H224V121H248V133H282V128H310V138H338V132H365V140H395V136H423V142H452V146Q467 147 480 150Z"
        />
        <g className="reader-scene__mosque" style={{ filter: "drop-shadow(0 0 1px rgba(241, 201, 137, 0.45))" }}>
          {/* Slender minarets with spires, balconies and tapered shafts. */}
          <path d="M74 150V57H70V52H74V38L80 24L86 38V52H90V57H86V150ZM278 150V68H274V63H278V49L284 35L290 49V63H294V68H290V150Z" />
          {/* The main dome joins a stable drum; subsidiary domes keep a
              legible outline even in the compact header's small vignette. */}
          <path d="M99 150V115H104C104 103 115 98 122 91C129 98 140 103 140 115H147V91H153C156 69 173 62 185 47V39H187V47C199 62 216 69 219 91H225V115H232C232 103 243 98 250 91C257 98 268 103 268 115H273V150Z" />
          <path d="M0 150V146Q45 136 96 142H278Q349 140 402 146Q442 150 480 150Z" />
        </g>
        <path
          fill="var(--scene-light)"
          opacity="0.85"
          style={{ filter: "drop-shadow(0 0 3px var(--scene-light))" }}
          d="M177 150V126Q186 111 195 126V150ZM113 139V124Q119 117 125 124V139ZM247 139V124Q253 117 259 124V139Z"
        />
      </svg>
      {scene === "before_sleep" && (
        <svg className="reader-scene__celestial" viewBox="0 0 120 60" aria-hidden="true" focusable="false">
          <g fill="var(--scene-light)" opacity="0.6">
            <circle cx="16" cy="12" r="1" />
            <circle cx="100" cy="38" r="1.3" />
            <circle cx="74" cy="8" r="0.9" />
            <path d="M44 18A12 12 0 1 0 61 34A11 11 0 0 1 44 18Z" />
          </g>
        </svg>
      )}
    </div>
  );
});
