import { memo } from "react";

export interface MushafOpeningFrameArtProps {
  pageNumber?: number;
  className?: string;
}

/**
 * Authentic Arched Islamic Manuscript Border for Opening Pages (Al-Fatihah & Al-Baqarah start).
 * Sourced from classical illuminated Mushaf opening arch geometry.
 */
export const MushafOpeningFrameArt = memo(function MushafOpeningFrameArt({
  className = "absolute inset-0 h-full w-full pointer-events-none select-none",
}: MushafOpeningFrameArtProps) {
  const base = (import.meta.env.BASE_URL || "/").replace(/\/$/, "");
  const src = `${base}/images/mushaf-opening-arch.png`;

  return (
    <img
      src={src}
      alt=""
      className={className}
      aria-hidden="true"
      role="presentation"
      data-testid="mushaf-opening-frame"
      style={{ objectFit: "fill" }}
    />
  );
});

export default MushafOpeningFrameArt;
