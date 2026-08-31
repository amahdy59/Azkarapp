import { useEffect, useState } from "react";

let cachedSvgText: string | null = null;
let fetchPromise: Promise<string> | null = null;

function loadSvg(): Promise<string> {
  if (cachedSvgText) return Promise.resolve(cachedSvgText);
  if (!fetchPromise) {
    const base = (import.meta.env.BASE_URL || "/").replace(/\/$/, "");
    const url = `${base}/images/mushaf-emerald-border.svg`;
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

/**
 * Authentic Symmetrical Emerald Islamic Manuscript Border for Opening Pages:
 * - Page 1 (Al-Fatihah, Right Page): `viewBox="708 0 685 1086"`
 * - Page 2 (Al-Baqarah start, Left Page): `viewBox="0 0 685 1086"`
 *
 * Fully theme-adaptive with semantic CSS tokens (--card, --accent, --secondary, --foreground).
 */
export function MushafOpeningFrameArt({ pageNumber, className }: { pageNumber?: number; className?: string }) {
  const isPage1 = pageNumber === 1 || pageNumber === undefined;
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

  const viewBox = isPage1 ? "708 0 685 1086" : "0 0 685 1086";

  if (!svgContent) {
    return (
      <svg
        viewBox={viewBox}
        preserveAspectRatio="none"
        className={className || "absolute inset-0 h-full w-full pointer-events-none select-none"}
        aria-hidden="true"
        focusable="false"
        data-testid="mushaf-opening-frame"
      />
    );
  }

  // Inject the specific viewBox and attributes for the page
  const pageSvg = svgContent.replace(
    /viewBox="[^"]+"/,
    `viewBox="${viewBox}" preserveAspectRatio="none" style="width: 100%; height: 100%;"`,
  );

  return (
    <div
      className={className || "absolute inset-0 h-full w-full pointer-events-none select-none"}
      aria-hidden="true"
      data-testid="mushaf-opening-frame"
      dangerouslySetInnerHTML={{ __html: pageSvg }}
    />
  );
}

export default MushafOpeningFrameArt;
