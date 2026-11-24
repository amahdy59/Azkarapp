import { useState } from "react";
import { useMediaQuery } from "../hooks/useMediaQuery";

const BASE = import.meta.env.BASE_URL || "/";
const GENERIC_COVER = `${BASE}assets/cards/wird-quran-720.webp`;
const HOSTED_COVERS = "https://pub-6e537fd865454e599c23a2bcfc22136e.r2.dev/visuals/surah/2026-11-04";

export function SurahArtwork({ name, focus }: { name?: string; focus?: string }) {
  const [fallback, setFallback] = useState(false);
  const [coverReady, setCoverReady] = useState(false);
  const [detailReady, setDetailReady] = useState(false);
  const [detailFailed, setDetailFailed] = useState(false);
  const wide = useMediaQuery("(min-width: 1000px)");
  const compact = name ? `${BASE}assets/surah/v1/${name}-416.webp` : undefined;

  return (
    <figure className="reader-surah-artwork relative w-full overflow-hidden rounded-2xl border border-border-control bg-muted">
      <img
        data-testid="surah-artwork-cover"
        src={compact && !fallback ? compact : GENERIC_COVER}
        alt=""
        width={compact && !fallback ? 416 : 720}
        height={compact && !fallback ? 416 : 540}
        fetchPriority="high"
        decoding="async"
        onLoad={() => setCoverReady(true)}
        onError={() => setFallback(true)}
        className="block h-full w-full object-cover"
        style={{ objectPosition: focus }}
      />
      {/* The bundled cover paints first, including offline. A sharper wide-screen
          image is optional: a slow/error response never replaces or hides it. */}
      {wide && coverReady && compact && !fallback && !detailFailed && (
        <img
          data-testid="surah-artwork-detail"
          src={`${HOSTED_COVERS}/${name}-768.webp`}
          alt=""
          width={768}
          height={768}
          loading="lazy"
          fetchPriority="low"
          decoding="async"
          onLoad={() => setDetailReady(true)}
          onError={() => setDetailFailed(true)}
          className="pointer-events-none absolute inset-0 block h-full w-full object-cover"
          style={{ objectPosition: focus, opacity: detailReady ? 1 : 0 }}
        />
      )}
    </figure>
  );
}
