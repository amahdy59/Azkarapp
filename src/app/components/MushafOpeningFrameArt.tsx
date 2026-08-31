import { useEffect, useState, memo } from "react";

let cachedSvgText: string | null = null;
let fetchPromise: Promise<string> | null = null;

function loadSvg(): Promise<string> {
  if (cachedSvgText) return Promise.resolve(cachedSvgText);
  if (!fetchPromise) {
    const base = (import.meta.env.BASE_URL || "/").replace(/\/$/, "");
    const url = `${base}/images/mushaf-fatiha-frame.svg`;
    fetchPromise = fetch(url)
      .then((res) => (res.ok ? res.text() : ""))
      .then((text) => {
        cachedSvgText = text;
        return text;
      })
      .catch(() => "");
  }
  return fetchPromise;
}

export interface MushafOpeningFrameArtProps {
  pageNumber?: number;
  className?: string;
}

/**
 * Authentic Islamic Illuminated Manuscript Vector Frame for Opening Pages (Al-Fatihah & start of Al-Baqarah).
 * Rendered from SVG vector art with theme-adaptive colors.
 */
export const MushafOpeningFrameArt = memo(function MushafOpeningFrameArt({
  className = "absolute inset-0 h-full w-full pointer-events-none select-none",
}: MushafOpeningFrameArtProps) {
  const [svgContent, setSvgContent] = useState<string>(cachedSvgText || "");

  useEffect(() => {
    if (!cachedSvgText) {
      let isMounted = true;
      loadSvg().then((text) => {
        if (isMounted) setSvgContent(text);
      });
      return () => {
        isMounted = false;
      };
    }
  }, []);

  if (!svgContent) {
    return <div className={className} aria-hidden="true" role="presentation" data-testid="mushaf-opening-frame" />;
  }

  return (
    <div
      className={`${className} [&>svg]:h-full [&>svg]:w-full [&>svg]:block`}
      aria-hidden="true"
      role="presentation"
      data-testid="mushaf-opening-frame"
      dangerouslySetInnerHTML={{ __html: svgContent }}
    />
  );
});

export default MushafOpeningFrameArt;
