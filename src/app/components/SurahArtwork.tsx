import { useEffect, useRef, useState } from "react";

const BASE = import.meta.env.BASE_URL || "/";
const GENERIC_COVER = `${BASE}assets/cards/wird-quran-720.webp`;
const HOSTED_COVERS = "https://pub-6e537fd865454e599c23a2bcfc22136e.r2.dev/visuals/surah/2026-11-04";
const SIZES = "(min-width: 1000px) min(58vw, 820px), (min-width: 600px) min(100vw - 32px, 720px), 100vw";

export function SurahArtwork({ name, focus }: { name?: string; focus?: string }) {
  const imageRef = useRef<HTMLImageElement>(null);
  const [fallback, setFallback] = useState<"compact" | "generic" | null>(null);
  const compact = name ? `${BASE}assets/surah/v1/${name}-416.webp` : undefined;
  const responsive = name && fallback === null;

  useEffect(() => {
    if (!responsive) return;
    const timeout = window.setTimeout(() => {
      const image = imageRef.current;
      if (image && !image.complete) setFallback("compact");
    }, 2500);
    return () => window.clearTimeout(timeout);
  }, [responsive]);

  return (
    <figure className="reader-surah-artwork w-full overflow-hidden rounded-3xl border border-border-control bg-muted">
      <img
        ref={imageRef}
        src={fallback !== "generic" && compact ? compact : GENERIC_COVER}
        srcSet={responsive ? `${compact} 416w, ${HOSTED_COVERS}/${name}-768.webp 768w` : undefined}
        sizes={responsive ? SIZES : undefined}
        alt=""
        width={compact && fallback !== "generic" ? 416 : 720}
        height={compact && fallback !== "generic" ? 416 : 540}
        fetchPriority="high"
        decoding="async"
        onError={({ currentTarget }) => {
          if (compact && fallback !== "generic") {
            const usingCompact = currentTarget.currentSrc.endsWith(compact);
            setFallback(fallback || usingCompact ? "generic" : "compact");
          }
        }}
        className="block h-full w-full object-cover"
        style={{ objectPosition: focus }}
      />
    </figure>
  );
}
