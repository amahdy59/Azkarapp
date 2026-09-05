import { memo } from "react";

/** The quarter-leaf that sits in each corner of the illuminated panel. */
const ROSETTE_PATH = "M 0,0 L 45,0 C 35,15 35,35 0,45 Z";
const ROSETTE_INNER = "M 0,0 L 40,0 C 30,12 30,30 0,40 Z";

/**
 * Clockwise from the top left, in physical corners.
 *
 * Logical properties would mirror the set in RTL — and the Mushaf is always
 * RTL — which puts a leaf pointing into the page instead of out of its corner.
 * The four leaves are one shape rotated, so the arrangement is symmetric and
 * has no reading direction to follow.
 */
const CORNERS = [
  { key: "top-left", style: { top: 0, left: 0 }, rotate: 0 },
  { key: "top-right", style: { top: 0, right: 0 }, rotate: 90 },
  { key: "bottom-right", style: { bottom: 0, right: 0 }, rotate: 180 },
  { key: "bottom-left", style: { bottom: 0, left: 0 }, rotate: 270 },
] as const;

export interface MushafOpeningFrameArtProps {
  pageNumber?: number;
  className?: string;
}

/**
 * The illuminated panel around the opening pages — Al-Fatihah and the start of
 * Al-Baqarah.
 *
 * It was a 1200×1800 SVG fetched at runtime and stretched to the page with
 * `preserveAspectRatio="none"`, which meant three things at once. Its ornament
 * distorted with the viewport: at 375×700 the art was squeezed by a fifth, so
 * the corner leaves flattened into smears and the vertical rules drew thinner
 * than the horizontal ones. Its colours came from `--accent` and `--secondary`,
 * which are interface tokens — the gilt rendered as the interface yellow, and
 * in the colour-blind themes as blue or violet. And its ground came from
 * `--background` and `--card` rather than the Mushaf's own paper, so the one
 * page in the book that paints its own field painted it a different colour
 * from every other page.
 *
 * The rules are now CSS boxes, which cannot distort whatever the ratio of the
 * page, and the four leaves are the only drawn art: each keeps its own square
 * aspect and is sized against the page's shorter side. Every colour is a Mushaf
 * token, so the panel is gilt on paper in every theme.
 */
export const MushafOpeningFrameArt = memo(function MushafOpeningFrameArt({
  className = "absolute inset-0 h-full w-full pointer-events-none select-none",
}: MushafOpeningFrameArtProps) {
  return (
    <div
      className={`${className} mushaf-opening-frame`}
      aria-hidden="true"
      role="presentation"
      data-testid="mushaf-opening-frame"
    >
      <span className="mushaf-opening-frame__hairline" />
      <span className="mushaf-opening-frame__gilt" />
      <span className="mushaf-opening-frame__dash" />
      <span className="mushaf-opening-frame__panel">
        {CORNERS.map((corner) => (
          <svg
            key={corner.key}
            className="mushaf-opening-frame__leaf"
            style={{ ...corner.style, transform: `rotate(${corner.rotate}deg)` }}
            viewBox="0 0 48 48"
            aria-hidden="true"
          >
            <path d={ROSETTE_PATH} fill="currentColor" opacity="0.32" />
            <path d={ROSETTE_INNER} fill="none" stroke="currentColor" strokeWidth="1.5" />
            <circle cx="16" cy="16" r="4" fill="currentColor" />
          </svg>
        ))}
      </span>
    </div>
  );
});

export default MushafOpeningFrameArt;
