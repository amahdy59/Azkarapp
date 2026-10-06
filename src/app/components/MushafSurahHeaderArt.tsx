/**
 * Medina Mushaf Surah Header Vector Art (v3 - Lightweight Calligraphic Flourish).
 *
 * Streamlined symmetrical vector flourish inspired by authentic manuscript title bands.
 * Mathematical geometry centered on the inner title slot (midX = 400, midY = 60).
 *
 * Ultra-performant (~500 bytes vs previous 65.5 KB), theme-adaptive using CSS variables:
 * - `var(--mushaf-rule-ink, var(--accent, #c6a772))` for calligraphic swashes, finials, and accents.
 *
 * Aspect ratio: 800 x 120 (~6.67:1)
 */
import { memo } from "react";

export interface MushafSurahHeaderArtProps {
  className?: string;
}

export const MushafSurahHeaderArt = memo(function MushafSurahHeaderArt({
  className = "h-full w-full max-w-full",
}: MushafSurahHeaderArtProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 800 120"
      className={className}
      preserveAspectRatio="xMidYMid meet"
      aria-hidden="true"
      role="presentation"
      focusable="false"
      data-testid="mushaf-surah-ornament"
    >
      {/* Left Tapered Calligraphic Swash & Terminal Medallion */}
      <path
        d="M 60,60 C 130,52 210,58 270,60 C 210,62 130,68 60,60 Z"
        fill="var(--mushaf-rule-ink, var(--accent, #c6a772))"
      />
      <circle cx="48" cy="60" r="3.5" fill="var(--mushaf-rule-ink, var(--accent, #c6a772))" />
      <polygon points="35,60 42,55 42,65" fill="var(--mushaf-rule-ink, var(--accent, #c6a772))" />

      {/* Right Tapered Calligraphic Swash & Terminal Medallion */}
      <path
        d="M 740,60 C 670,52 590,58 530,60 C 590,62 670,68 740,60 Z"
        fill="var(--mushaf-rule-ink, var(--accent, #c6a772))"
      />
      <circle cx="752" cy="60" r="3.5" fill="var(--mushaf-rule-ink, var(--accent, #c6a772))" />
      <polygon points="765,60 758,55 758,65" fill="var(--mushaf-rule-ink, var(--accent, #c6a772))" />

      {/* Center Flanking Micro-dots */}
      <circle cx="285" cy="60" r="2.5" fill="var(--mushaf-rule-ink, var(--accent, #c6a772))" />
      <circle cx="515" cy="60" r="2.5" fill="var(--mushaf-rule-ink, var(--accent, #c6a772))" />

      {/* Subtle top & bottom framing hairline guides */}
      <line
        x1="310"
        y1="24"
        x2="490"
        y2="24"
        stroke="var(--mushaf-rule-ink, var(--accent, #c6a772))"
        strokeWidth="0.75"
        strokeOpacity="0.45"
      />
      <line
        x1="310"
        y1="96"
        x2="490"
        y2="96"
        stroke="var(--mushaf-rule-ink, var(--accent, #c6a772))"
        strokeWidth="0.75"
        strokeOpacity="0.45"
      />
    </svg>
  );
});
